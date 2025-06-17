import joblib
import json
import os
import logging
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class ModelLoader:
    """Enhanced model loader with proper feature validation"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.is_loaded = False
        self.config = config or {}
        
        # Model metadata
        self.model_version = None
        self.model_type = None
        self.training_accuracy = None
        
        logger.info("ModelLoader initialized")
    
    def load_model(self) -> bool:
        """Load the trained model and associated artifacts"""
        try:
            # Get file paths from config
            model_path = self.config.get('MODEL_PATH', 'best_salary_prediction_model.pkl')
            scaler_path = self.config.get('SCALER_PATH', 'feature_scaler.pkl')
            feature_names_path = self.config.get('FEATURE_NAMES_PATH', 'feature_names.json')
            
            logger.info(f"Loading model from: {model_path}")
            logger.info(f"Loading scaler from: {scaler_path}")
            logger.info(f"Loading features from: {feature_names_path}")
            
            # Check if model file exists
            if not os.path.exists(model_path):
                logger.error(f"Model file not found: {model_path}")
                return False
            
            # Load the main model
            try:
                self.model = joblib.load(model_path)
                logger.info(f"Model loaded successfully: {type(self.model).__name__}")
                self.model_type = type(self.model).__name__
            except Exception as e:
                logger.error(f"Failed to load model: {str(e)}")
                return False
            
            # Load scaler if it exists (optional for Random Forest)
            if os.path.exists(scaler_path):
                try:
                    self.scaler = joblib.load(scaler_path)
                    logger.info("Scaler loaded successfully")
                except Exception as e:
                    logger.warning(f"Failed to load scaler (optional): {str(e)}")
                    self.scaler = None
            else:
                logger.info("No scaler file found - model may not require scaling")
                self.scaler = None
            
            # Load feature names
            if os.path.exists(feature_names_path):
                try:
                    with open(feature_names_path, 'r') as f:
                        self.feature_names = json.load(f)
                    logger.info(f"Loaded {len(self.feature_names)} feature names")
                except Exception as e:
                    logger.error(f"Failed to load feature names: {str(e)}")
                    return False
            else:
                logger.error(f"Feature names file not found: {feature_names_path}")
                return False
            
            # Set model metadata
            self.model_version = self.config.get('MODEL_VERSION', '1.0.0')
            self.training_accuracy = self.config.get('MODEL_ACCURACY', 0.7336)
            
            # Verify model has expected attributes
            if hasattr(self.model, 'predict'):
                self.is_loaded = True
                logger.info("Model validation successful - ready for predictions")
                
                # Log model info
                if hasattr(self.model, 'feature_importances_'):
                    logger.info("Model supports feature importance analysis")
                if hasattr(self.model, 'n_estimators'):
                    logger.info(f"Random Forest with {self.model.n_estimators} estimators")
                
                return True
            else:
                logger.error("Model does not have predict method")
                return False
                
        except Exception as e:
            logger.error(f"Unexpected error loading model: {str(e)}")
            return False
    
    def validate_features(self, features_df: pd.DataFrame) -> bool:
        """Validate that input features match model expectations"""
        try:
            if not self.is_loaded:
                logger.error("Model not loaded - cannot validate features")
                return False
            
            if self.feature_names is None:
                logger.error("Feature names not available - cannot validate")
                return False
            
            # Check feature count
            expected_count = len(self.feature_names)
            actual_count = features_df.shape[1]
            
            if actual_count != expected_count:
                logger.error(f"Feature count mismatch: expected {expected_count}, got {actual_count}")
                return False
            
            # Check feature names and order
            expected_features = self.feature_names
            actual_features = list(features_df.columns)
            
            if actual_features != expected_features:
                logger.error("Feature names or order mismatch")
                logger.error(f"Expected: {expected_features[:5]}... (showing first 5)")
                logger.error(f"Actual: {actual_features[:5]}... (showing first 5)")
                
                # Try to identify specific mismatches
                missing_features = set(expected_features) - set(actual_features)
                extra_features = set(actual_features) - set(expected_features)
                
                if missing_features:
                    logger.error(f"Missing features: {missing_features}")
                if extra_features:
                    logger.error(f"Extra features: {extra_features}")
                
                return False
            
            # Check for any NaN or infinite values
            if features_df.isnull().any().any():
                logger.error("Features contain NaN values")
                return False
            
            if np.isinf(features_df.values).any():
                logger.error("Features contain infinite values")
                return False
            
            logger.info("Feature validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Error validating features: {str(e)}")
            return False
    
    def predict(self, features_df: pd.DataFrame) -> Optional[float]:
        """Make a prediction with proper feature validation"""
        try:
            if not self.is_loaded:
                raise ValueError("Model not loaded")
            
            # Validate features first
            if not self.validate_features(features_df):
                raise ValueError("Feature validation failed")
            
            # Make prediction
            if self.scaler is not None:
                # Scale features if scaler is available
                logger.info("Scaling features before prediction")
                features_scaled = self.scaler.transform(features_df)
                prediction = self.model.predict(features_scaled)[0]
            else:
                # Use raw features (typical for Random Forest)
                logger.info("Using raw features for prediction")
                prediction = self.model.predict(features_df)[0]
            
            logger.info(f"Prediction made successfully: ${prediction:,.0f}")
            return float(prediction)
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get comprehensive model information"""
        if not self.is_loaded:
            return {'error': 'Model not loaded'}
        
        info = {
            'model_type': self.model_type,
            'model_version': self.model_version,
            'training_accuracy': self.training_accuracy,
            'is_loaded': self.is_loaded,
            'has_scaler': self.scaler is not None,
            'feature_count': len(self.feature_names) if self.feature_names else 0,
            'feature_names': self.feature_names
        }
        
        # Add model-specific information
        if hasattr(self.model, 'n_estimators'):
            info['n_estimators'] = self.model.n_estimators
        
        if hasattr(self.model, 'max_depth'):
            info['max_depth'] = self.model.max_depth
        
        if hasattr(self.model, 'feature_importances_'):
            info['supports_feature_importance'] = True
            # Get top 5 most important features
            if self.feature_names:
                importances = self.model.feature_importances_
                top_features = sorted(
                    zip(self.feature_names, importances),
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
                info['top_features'] = [
                    {'name': name, 'importance': float(imp)}
                    for name, imp in top_features
                ]
        
        return info
    
    def get_feature_importance(self) -> Optional[List[Dict[str, Any]]]:
        """Get feature importance if available"""
        if not self.is_loaded or not hasattr(self.model, 'feature_importances_'):
            return None
        
        if not self.feature_names:
            return None
        
        importances = self.model.feature_importances_
        feature_importance = [
            {
                'feature': name,
                'importance': float(importance),
                'percentage': float(importance * 100)
            }
            for name, importance in zip(self.feature_names, importances)
        ]
        
        # Sort by importance
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        return feature_importance