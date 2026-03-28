import os
from flask import Flask, send_from_directory
from .config import Config
from .extensions import cors
from .excel_db import ExcelDB

def create_app(config_class=Config):
    # Identify root folder structure dynamically for Windows Native vs Docker Linux volumes
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

    app = Flask(__name__, static_folder=FRONTEND_DIR, template_folder=FRONTEND_DIR)
    app.config.from_object(config_class)

    # Initialize Extensions
    cors.init_app(app)

    # Register Blueprints
    from .routes import accounts_bp, characters_bp, leveling_bp, events_bp, items_bp, config_bp, coupons_bp
    
    app.register_blueprint(accounts_bp)
    app.register_blueprint(characters_bp)
    app.register_blueprint(leveling_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(config_bp)
    app.register_blueprint(coupons_bp)

    # Root Routes (Static Files)
    @app.route('/')
    @app.route('/index.html')
    def index():
        return send_from_directory(app.template_folder, 'index.html')

    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)
    
    # Init Excel DB
    with app.app_context():
        try:
             ExcelDB.init_db()
             print("Excel Database initialized.")
        except Exception as e:
             print(f"Excel DB Init Error: {e}")

    return app
