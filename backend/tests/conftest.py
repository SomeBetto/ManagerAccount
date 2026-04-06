import os
import tempfile
import pytest
import shutil
import json
from app import create_app
from app.config import Config
from app.excel_db import ExcelDB, set_excel_path

class TestConfig(Config):
    TESTING = True
    # Deshabilitar logs durante pruebas si se desea, o cambiar config
    
@pytest.fixture(scope="session")
def test_app():
    """Configura la aplicación Flask para pruebas."""
    app = create_app(TestConfig)
    yield app

@pytest.fixture(scope="session")
def client(test_app):
    """Cliente de pruebas para realizar solicitudes a los endpoints."""
    return test_app.test_client()

@pytest.fixture(scope="function")
def mock_db():
    """
    Fixture para Unit Tests (Aislamiento de BD).
    Usa la librería unittest.mock para sobreescribir métodos de ExcelDB 
    y evitar interacción real con el sistema de archivos.
    En tu test, puedes importar patch: `from unittest.mock import patch`
    """
    pass # No es necesario hacer nada aquí, se hace per-test con patch

@pytest.fixture(scope="function")
def integration_db(test_app):
    """
    Fixture para Integration Tests (Uso de BD real pero temporal).
    Crea un archivo Excel temporal para permitir pruebas completas de punta a punta
    asegurando que los endpoints escriben y leen correctamente desde openpyxl.
    """
    # Guardar configuración original
    config_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'config.json')
    original_config = None
    if os.path.exists(config_file_path):
        with open(config_file_path, 'r', encoding='utf-8') as f:
            original_config = json.load(f)
            
    # Crear un excel temporal válido
    fd, temp_path = tempfile.mkstemp(suffix='.xlsx')
    os.close(fd)
    import openpyxl
    wb = openpyxl.Workbook()
    wb.save(temp_path)
    
    # Apuntar ExcelDB a este archivo temporal
    # Para evitar interferir con config.json, sobreescribimos temporalmente el path en ExcelDB
    original_get_excel_path = ExcelDB.__dict__.get('_get_excel_path') # Esto no existe
    
    # La forma segura de sobreescribir la ruta para esta prueba es haciendo un mock interno,
    # o crear temporalmente el config.json y luego restaurar
    # Como set_excel_path usa config.json, crearemos una copia de seguridad y 
    # modificaremos la ruta original
    root_config = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'config.json')
    
    # No queremos romper el config real, así que en lugar de eso
    # Parchearemos `get_excel_path` internamente durante la duración de la fixture
    import app.excel_db
    original_get_path = app.excel_db.get_excel_path
    app.excel_db.get_excel_path = lambda: temp_path
    
    with test_app.app_context():
        ExcelDB.init_db()
        yield temp_path
        
    # Restaurar
    app.excel_db.get_excel_path = original_get_path
    
    # Limpiar archivo temporal
    if os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except PermissionError:
            pass
