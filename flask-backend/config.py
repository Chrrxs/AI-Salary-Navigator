import os
from pathlib import Path

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = False
    TESTING = False
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # Model paths - adjust these based on your file structure
    BASE_DIR = Path(__file__).parent
    MODELS_DIR = BASE_DIR / 'models'
    
    MODEL_PATH = str(MODELS_DIR / 'best_salary_prediction_model.pkl')
    SCALER_PATH = str(MODELS_DIR / 'feature_scaler.pkl')
    FEATURE_NAMES_PATH = str(BASE_DIR / 'feature_names.json')
    
    # Model metadata
    MODEL_VERSION = '1.0.0'
    MODEL_ACCURACY = 0.7336  # 73.36% accuracy
    MODEL_MAE = 22519  # Mean Absolute Error in USD
    
    # Logging
    LOG_LEVEL = 'INFO'
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config"""
        # Set up logging
        import logging
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Print configuration info
        logger = logging.getLogger(__name__)
        logger.info(f"Initializing app with {app.config.__class__.__name__}")
        logger.info(f"Model path: {app.config.get('MODEL_PATH')}")
        logger.info(f"Feature names path: {app.config.get('FEATURE_NAMES_PATH')}")

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    
    # More verbose logging in development
    LOG_LEVEL = 'DEBUG'
    
    # Allow more CORS origins in development
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ]

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use test model files if they exist
    BASE_DIR = Path(__file__).parent
    TEST_DIR = BASE_DIR / 'tests' / 'fixtures'
    
    MODEL_PATH = str(TEST_DIR / 'test_model.pkl')
    SCALER_PATH = str(TEST_DIR / 'test_scaler.pkl') 
    FEATURE_NAMES_PATH = str(TEST_DIR / 'test_features.json')

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # Stricter CORS in production
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')
    
    # Use environment variables for sensitive paths in production
    MODEL_PATH = os.environ.get('MODEL_PATH') or Config.MODEL_PATH
    SCALER_PATH = os.environ.get('SCALER_PATH') or Config.SCALER_PATH
    FEATURE_NAMES_PATH = os.environ.get('FEATURE_NAMES_PATH') or Config.FEATURE_NAMES_PATH
    
    # Production logging
    LOG_LEVEL = 'WARNING'
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        
        # Production-specific initialization
        import logging
        from logging.handlers import RotatingFileHandler
        
        # Set up file logging in production
        if not app.debug and not app.testing:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            
            file_handler = RotatingFileHandler(
                'logs/salary_predictor.log',
                maxBytes=10240000,  # 10MB
                backupCount=10
            )
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.WARNING)
            app.logger.addHandler(file_handler)
            
            app.logger.setLevel(logging.WARNING)
            app.logger.info('Salary Predictor API startup')

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}