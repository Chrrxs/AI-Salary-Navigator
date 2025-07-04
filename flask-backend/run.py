import os
from app import create_app

if __name__ == '__main__':
    # Set environment
    env = os.environ.get('FLASK_ENV', 'development')
    
    # Create app
    app = create_app(env)
    
    # Run app
    if env == 'development':
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=True
        )
    else:
        # Production mode
        app.run(
            host='0.0.0.0',
            port=int(os.environ.get('PORT', 5000)),
            debug=False
        )