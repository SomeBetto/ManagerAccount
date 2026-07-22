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
    from .routes import accounts_bp, characters_bp, leveling_bp, events_bp, items_bp, config_bp, coupons_bp, autotool_bp, gear_bp, routines_bp, expiring_bp
    
    app.register_blueprint(accounts_bp)
    app.register_blueprint(characters_bp)
    app.register_blueprint(leveling_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(config_bp)
    app.register_blueprint(coupons_bp)
    app.register_blueprint(autotool_bp)
    app.register_blueprint(gear_bp)
    app.register_blueprint(routines_bp)
    app.register_blueprint(expiring_bp)

    # Root Routes (Static Files)
    @app.route('/')
    @app.route('/index.html')
    def index():
        return send_from_directory(app.template_folder, 'index.html')

    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)
    
    # Init Excel DB & Auto-Backup
    with app.app_context():
        try:
             ExcelDB.init_db()
             print("Excel Database initialized.")
             ExcelDB.check_and_run_auto_backup()
        except Exception as e:
             print(f"Excel DB Init Error: {e}")

    # Configurar Logging Físico Exclusivo para Errores (backend/log/error.log)
    import logging
    import datetime
    from logging.handlers import RotatingFileHandler
    
    class CustomErrorFormatter(logging.Formatter):
        SPANISH_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        
        def formatTime(self, record, datefmt=None):
            dt = datetime.datetime.fromtimestamp(record.created)
            day_name = self.SPANISH_DAYS[dt.weekday()]
            return f"{dt.strftime('%Y-%m-%d')} ({day_name}) {dt.strftime('%H:%M:%S')}"

    BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    log_dir = os.path.join(BACKEND_DIR, 'log')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
        
    log_file = os.path.join(log_dir, 'error.log')
    file_handler = RotatingFileHandler(log_file, maxBytes=500000, backupCount=5, encoding='utf-8')
    file_handler.setLevel(logging.ERROR)
    
    formatter = CustomErrorFormatter(
        '[%(asctime)s] | MÓDULO: %(module)s (%(filename)s -> %(funcName)s) | ERROR: %(message)s'
    )
    file_handler.setFormatter(formatter)
    app.logger.setLevel(logging.ERROR)
    app.logger.addHandler(file_handler)

    # Captura global de excepciones no controladas en las rutas de Flask
    @app.errorhandler(Exception)
    def handle_global_exception(e):
        app.logger.error(f"{type(e).__name__}: {str(e)}", exc_info=True)
        return {"error": "Error interno del servidor.", "details": str(e)}, 500

    return app
