from flask import Flask, send_from_directory
from .config import Config
from .extensions import db, cors

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='/frontend', template_folder='/frontend')
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    from .routes import accounts_bp, characters_bp, leveling_bp, events_bp
    
    app.register_blueprint(accounts_bp)
    app.register_blueprint(characters_bp)
    app.register_blueprint(leveling_bp)
    app.register_blueprint(events_bp)

    # Root Routes (Static Files)
    @app.route('/')
    @app.route('/index.html')
    def index():
        return send_from_directory(app.template_folder, 'index.html')

    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)
    
    # DB Creation Hack (for now, to preserve existing logic)
    with app.app_context():
        # Import models so they are registered with SQLAlchemy
        from . import models
        try:
             db.create_all()
             print("Database initialized.")
        except Exception as e:
             print(f"DB Init Error: {e}")

    return app
