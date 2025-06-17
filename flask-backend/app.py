from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import numpy as np
import pandas as pd
from datetime import datetime
import traceback

# Import our custom modules
from models.model_loader import ModelLoader
from utils.preprocessing import preprocessor
from utils.validation import validate_prediction_input, PredictionValidationError
from config import config

# Import analytics blueprint
from routes.analytics import analytics_bp

try:
    from utils.analytics_processor import get_analytics_processor
    # Initialize analytics processor on startup
    print(" Initializing analytics processor...")
    analytics_processor = get_analytics_processor()
    print("Analytics processor initialized successfully")
except Exception as e:
    print(f"Warning: Analytics processor initialization failed: {str(e)}")
    print("   The prediction endpoints will still work, but analytics may have issues")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Load configuration
    config_class = config[config_name]
    app.config.from_object(config_class)
    
    # Initialize our custom config values
    config_class.init_app(app)
    
    # Initialize CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    app.register_blueprint(analytics_bp)
    
    # Initialize the model loader with config
    model_loader = ModelLoader(config=app.config)
    
    # Load model on startup
    print(" Attempting to load model...")
    if not model_loader.load_model():
        logger.error("Failed to load model on startup")
        print("Model loading failed - check file paths and model files")
    else:
        print("Model loaded successfully!")
        # Print model info
        model_info = model_loader.get_model_info()
        print(f"   Model Type: {model_info.get('model_type')}")
        print(f"   Features: {model_info.get('feature_count')}")
        print(f"   Has Scaler: {model_info.get('has_scaler')}")
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'model_loaded': model_loader.is_loaded,
            'version': app.config.get('MODEL_VERSION', 'unknown'),
            'services': {
                'prediction': 'available' if model_loader.is_loaded else 'unavailable',
                'analytics': 'available',
                'model_info': 'available'
            },
            'config_paths': {
                'model_path': app.config.get('MODEL_PATH'),
                'scaler_path': app.config.get('SCALER_PATH'),
                'feature_names_path': app.config.get('FEATURE_NAMES_PATH')
            }
        })
    
    # Model info endpoint
    @app.route('/api/model/info', methods=['GET'])
    def model_info():
        """Get model information and metadata"""
        try:
            if not model_loader.is_loaded:
                return jsonify({
                    'error': 'Model not loaded',
                    'status': 'error',
                    'debug_info': {
                        'model_path': app.config.get('MODEL_PATH'),
                        'model_exists': os.path.exists(app.config.get('MODEL_PATH', '')),
                        'config_keys': list(app.config.keys())
                    }
                }), 503
            
            info = model_loader.get_model_info()
            return jsonify({
                'status': 'success',
                'data': info
            })
            
        except Exception as e:
            logger.error(f"Error getting model info: {str(e)}")
            return jsonify({
                'error': 'Failed to get model information',
                'status': 'error',
                'details': str(e)
            }), 500
    
    # Main prediction endpoint
    @app.route('/api/predict', methods=['POST'])
    def predict_salary():
        """Main salary prediction endpoint with improved error handling"""
        try:
            # Check if model is loaded
            if not model_loader.is_loaded:
                logger.warning("Prediction requested but model not loaded")
                return jsonify({
                    'error': 'Model not available',
                    'message': 'The prediction model is currently not loaded. Please check server logs.',
                    'status': 'error'
                }), 503
            
            # Get request data
            if not request.is_json:
                return jsonify({
                    'error': 'Invalid request format',
                    'message': 'Request must be JSON',
                    'status': 'error'
                }), 400
            
            input_data = request.get_json()
            logger.info(f" Received prediction request for {input_data.get('jobTitle', 'Unknown')} role")
            
            # Validate input data
            try:
                validate_prediction_input(input_data)
                logger.info("Input validation passed")
            except PredictionValidationError as e:
                logger.warning(f"Invalid input data: {str(e)}")
                return jsonify({
                    'error': 'Invalid input data',
                    'message': str(e),
                    'status': 'error'
                }), 400
            
            # Preprocess input data using fixed preprocessor
            try:
                logger.info(" Starting preprocessing...")
                features_df = preprocessor.preprocess_input(input_data)
                logger.info(f"Preprocessing complete: {features_df.shape}")
                logger.info(f"   Feature columns: {list(features_df.columns)[:5]}... (showing first 5)")
            except Exception as e:
                logger.error(f"Preprocessing failed: {str(e)}")
                return jsonify({
                    'error': 'Preprocessing failed',
                    'message': 'Error occurred during feature preprocessing',
                    'status': 'error',
                    'details': str(e) if app.debug else None
                }), 500
            
            # Make prediction using the model loader's predict method
            try:
                logger.info(" Making prediction...")
                prediction = model_loader.predict(features_df)
                logger.info(f"Prediction successful: ${prediction:,.0f}")
            except Exception as e:
                logger.error(f"Prediction failed: {str(e)}")
                return jsonify({
                    'error': 'Model prediction failed',
                    'message': 'Error occurred during model prediction',
                    'status': 'error',
                    'details': str(e) if app.debug else None
                }), 500
            
            # Round prediction to nearest 1000
            predicted_salary = int(np.round(prediction / 1000) * 1000)
            
            # Calculate confidence interval based on model's MAE
            mae = app.config.get('MODEL_MAE', 22519)
            confidence_interval = {
                'lower': max(30000, predicted_salary - mae),
                'upper': predicted_salary + mae
            }
            
            # Determine market position
            market_position = determine_market_position(predicted_salary)
            
            # Generate explanation factors
            factors = generate_prediction_factors(input_data, features_df, predicted_salary)
            
            # Mock similar jobs count (enhance with real data if available)
            similar_jobs = np.random.randint(150, 800)
            
            # Prepare response
            result = {
                'predictedSalary': predicted_salary,
                'confidenceInterval': confidence_interval,
                'similarJobs': similar_jobs,
                'marketPosition': market_position,
                'factors': factors,
                'metadata': {
                    'model_version': app.config.get('MODEL_VERSION', '1.0.0'),
                    'model_type': model_loader.model_type,
                    'model_accuracy': app.config.get('MODEL_ACCURACY', 0.7336),
                    'prediction_timestamp': datetime.utcnow().isoformat(),
                    'features_processed': features_df.shape[1]
                }
            }
            
            logger.info(f" Prediction complete: ${predicted_salary:,} for {input_data.get('jobTitle', 'Unknown')} role")
            
            return jsonify({
                'status': 'success',
                'data': result
            })
            
        except Exception as e:
            logger.error(f" Unexpected error in prediction: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Prediction failed',
                'message': 'An unexpected error occurred. Please check server logs.',
                'status': 'error',
                'details': str(e) if app.debug else None
            }), 500
    
    # Feature importance endpoint
    @app.route('/api/model/features', methods=['GET'])
    def feature_importance():
        """Get feature importance from the model"""
        try:
            if not model_loader.is_loaded:
                return jsonify({
                    'error': 'Model not available',
                    'status': 'error'
                }), 503
            
            # Get feature importance using model loader method
            importance_data = model_loader.get_feature_importance()
            
            if importance_data is None:
                return jsonify({
                    'error': 'Feature importance not available',
                    'message': 'This model type does not support feature importance',
                    'status': 'error'
                }), 400
            
            return jsonify({
                'status': 'success',
                'data': {
                    'feature_importance': importance_data,
                    'model_type': model_loader.model_type,
                    'total_features': len(importance_data)
                }
            })
                
        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return jsonify({
                'error': 'Failed to get feature importance',
                'status': 'error'
            }), 500
    
    # API endpoints listing
    @app.route('/api', methods=['GET'])
    def api_endpoints():
        """List all available API endpoints"""
        endpoints = {
            'prediction': {
                'predict': 'POST /api/predict',
                'model_info': 'GET /api/model/info',
                'feature_importance': 'GET /api/model/features'
            },
            'analytics': {
                'overview': 'GET /api/analytics/overview',
                'geographic': 'GET /api/analytics/geographic',
                'skills': 'GET /api/analytics/skills',
                'trends': 'GET /api/analytics/trends',
                'model_performance': 'GET /api/analytics/model-performance',
                'export': 'GET /api/analytics/export'
            },
            'system': {
                'health': 'GET /health',
                'debug': 'GET /debug'
            }
        }
        
        return jsonify({
            'status': 'success',
            'message': 'AI Salary Prediction API',
            'version': app.config.get('MODEL_VERSION', '1.0.0'),
            'endpoints': endpoints,
            'documentation': 'See README.md for detailed API documentation'
        })
    
    # Debug endpoint with enhanced information
    @app.route('/debug', methods=['GET'])
    def debug_info():
        """Debug endpoint to check configuration and model state"""
        debug_data = {
            'flask_config_keys': list(app.config.keys()),
            'model_loaded': model_loader.is_loaded,
            'paths': {
                'model_path': app.config.get('MODEL_PATH'),
                'scaler_path': app.config.get('SCALER_PATH'),
                'feature_names_path': app.config.get('FEATURE_NAMES_PATH')
            },
            'file_exists': {
                'model': os.path.exists(app.config.get('MODEL_PATH', '')),
                'scaler': os.path.exists(app.config.get('SCALER_PATH', '')),
                'feature_names': os.path.exists(app.config.get('FEATURE_NAMES_PATH', ''))
            },
            'working_directory': os.getcwd(),
            'script_directory': os.path.dirname(os.path.abspath(__file__)),
            'preprocessor_features': len(preprocessor.expected_features) if hasattr(preprocessor, 'expected_features') else 'unknown',
            'services': {
                'prediction': model_loader.is_loaded,
                'analytics': True,
                'model_info': model_loader.is_loaded
            }
        }
        
        # Add model info if loaded
        if model_loader.is_loaded:
            debug_data['model_info'] = model_loader.get_model_info()
        
        return jsonify(debug_data)
    
    # Test preprocessing endpoint
    @app.route('/api/test/preprocess', methods=['POST'])
    def test_preprocessing():
        """Test endpoint to verify preprocessing works"""
        try:
            input_data = request.get_json()
            features_df = preprocessor.preprocess_input(input_data)
            
            return jsonify({
                'status': 'success',
                'data': {
                    'input_data': input_data,
                    'features_shape': features_df.shape,
                    'feature_names': list(features_df.columns),
                    'feature_values': features_df.iloc[0].to_dict(),
                    'expected_features': len(preprocessor.expected_features)
                }
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': str(e),
                'traceback': traceback.format_exc()
            })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Endpoint not found',
            'status': 'error',
            'message': 'The requested endpoint does not exist. Visit /api for available endpoints.'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'status': 'error'
        }), 500
    
    @app.route('/api/analytics/test', methods=['GET'])
    def test_analytics_processor():
        """Test endpoint to verify analytics processor is working"""
        try:
            from utils.analytics_processor import get_analytics_processor
            
            processor = get_analytics_processor()
            
            test_info = {
                'processor_available': processor is not None,
                'data_loaded': processor.df is not None if processor else False,
                'csv_path': getattr(processor, 'csv_path', 'Unknown'),
                'record_count': len(processor.df) if processor and processor.df is not None else 0,
                'sample_filters_test': None
            }
            
            # Test applying filters
            if processor and processor.df is not None:
                try:
                    test_filters = {'location': 'All', 'experienceLevel': 'All'}
                    filtered_df = processor.apply_filters(test_filters)
                    test_info['sample_filters_test'] = {
                        'original_count': len(processor.df),
                        'filtered_count': len(filtered_df),
                        'filter_success': True
                    }
                except Exception as filter_error:
                    test_info['sample_filters_test'] = {
                        'filter_success': False,
                        'error': str(filter_error)
                    }
            
            return jsonify({
                'status': 'success',
                'test_info': test_info,
                'message': 'Analytics processor test completed'
            })
            
        except Exception as e:
            return jsonify({
                'status': 'error',
                'error': str(e),
                'message': 'Analytics processor test failed'
            }), 500
    
    return app

def determine_market_position(salary):
    """Determine market position based on salary ranges"""
    if salary < 80000:
        return 'Below Average'
    elif salary < 120000:
        return 'Average'
    elif salary < 180000:
        return 'Above Average'
    else:
        return 'Top Tier'

def generate_prediction_factors(input_data, features_df, predicted_salary):
    """Generate explanation factors for the prediction"""
    factors = []
    
    # Experience factor
    years_exp = input_data.get('yearsExperience', 0)
    if years_exp > 10:
        factors.append({
            'name': 'Extensive Experience',
            'impact': 15000 + (years_exp - 10) * 2000,
            'description': f'{years_exp} years provides significant market value'
        })
    elif years_exp > 5:
        factors.append({
            'name': 'Solid Experience',
            'impact': 8000 + (years_exp - 5) * 1500,
            'description': f'{years_exp} years shows proven capability'
        })
    elif years_exp < 2:
        factors.append({
            'name': 'Entry Level',
            'impact': -10000,
            'description': 'Limited experience may impact initial salary'
        })
    
    # Location factor
    location = input_data.get('companyLocation', '')
    location_premiums = {
        'United States': 20000,
        'Denmark': 25000,
        'Canada': 10000,
        'United Kingdom': 15000,
        'Germany': -5000,
        'India': -30000,
        'China': -25000
    }
    
    if location in location_premiums:
        impact = location_premiums[location]
        factors.append({
            'name': f'{location} Market',
            'impact': impact,
            'description': f'Geographic salary premium for {location}'
        })
    
    # Skills factor
    skills = input_data.get('requiredSkills', [])
    high_value_skills = ['Deep Learning', 'TensorFlow', 'PyTorch', 'AWS', 'Kubernetes']
    skill_bonus = sum(3000 for skill in skills if skill in high_value_skills)
    
    if skill_bonus > 0:
        factors.append({
            'name': 'High-Value Skills',
            'impact': skill_bonus,
            'description': f'Premium for in-demand technical skills'
        })
    
    # Company size factor
    company_size = input_data.get('companySize', 'Medium')
    size_impacts = {
        'Enterprise': 15000,
        'Large': 8000,
        'Medium': 0,
        'Small': -5000
    }
    
    if company_size in size_impacts and size_impacts[company_size] != 0:
        factors.append({
            'name': f'{company_size} Company',
            'impact': size_impacts[company_size],
            'description': f'Company size typically affects compensation'
        })
    
    return factors[:4]  # Return top 4 factors

if __name__ == '__main__':
    app = create_app('development')
    print(" Starting AI Salary Prediction API with Analytics...")
    print(" Available services:")
    print("   • Salary Prediction: /api/predict")
    print("   • Market Analytics: /api/analytics/*")
    print("   • Model Information: /api/model/info")
    print("   • Health Check: /health")
    print("   • API Documentation: /api")
    app.run(host='0.0.0.0', port=5000, debug=True)