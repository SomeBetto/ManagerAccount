from flask import Blueprint, request, jsonify
from app.excel_db import get_excel_path, set_excel_path

bp = Blueprint('config', __name__, url_prefix='/api/config')

@bp.route('/db-path', methods=['GET'])
def get_db_path():
    path = get_excel_path()
    return jsonify({'path': path or ''})

@bp.route('/db-path', methods=['POST'])
def update_db_path():
    data = request.json
    path = data.get('path', '').strip()
    
    try:
        set_excel_path(path)
        # We can also attempt to re-init the db here
        from app.excel_db import ExcelDB
        ExcelDB.init_db()
        return jsonify({'message': 'Ruta configurada y base de datos inicializada.'}), 200
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/browse', methods=['GET'])
def browse_db_path():
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        # We must run this carefully so it doesn't block the Flask thread
        # Usually tkinter needs main thread, but for a simple dialog it might work.
        root = tk.Tk()
        root.attributes("-topmost", True)
        root.withdraw()
        
        file_path = filedialog.askopenfilename(
            title="Seleccionar Base de Datos V2 (Excel)",
            filetypes=[("Excel files", "*.xlsx")],
            defaultextension=".xlsx"
        )
        
        root.destroy()
        
        if file_path:
            return jsonify({'path': file_path})
        else:
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
            
    except Exception as e:
            
        from flask import current_app
            
        current_app.logger.error(str(e), exc_info=True)
        print(f"Error abriendo explorador de archivos: {e}")
        return jsonify({'error': 'La ventana de carpetas no es compatible con entornos Docker o Linux Headless. Por favor escribe la ruta manualmente.'}), 400

@bp.route('/browse-new', methods=['GET'])
def browse_new_db_path():
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.attributes("-topmost", True)
        root.withdraw()
        
        file_path = filedialog.asksaveasfilename(
            title="Crear Nueva Base de Datos V2 (Excel)",
            filetypes=[("Excel files", "*.xlsx")],
            defaultextension=".xlsx",
            initialfile="Flyff_Database_V2.xlsx"
        )
        
        root.destroy()
        
        if file_path:
            return jsonify({'path': file_path})
        else:
            return jsonify({'error': 'Cancelado por el usuario'}), 400
            
    except Exception as e:
            
        from flask import current_app
            
        current_app.logger.error(str(e), exc_info=True)
        print(f"Error abriendo explorador de archivos: {e}")
        return jsonify({'error': 'Error al abrir el explorador para crear archivo.'}), 400

@bp.route('/flyff', methods=['GET'])
def get_flyff_config():
    from app.excel_db import get_config_key
    return jsonify({
        'flyff_path': get_config_key('flyff_path') or '',
        'flyff_params': get_config_key('flyff_params') or ''
    })

@bp.route('/flyff', methods=['POST'])
def update_flyff_config():
    from app.excel_db import set_config_keys
    data = request.json or {}
    flyff_path = data.get('flyff_path', '').strip()
    flyff_params = data.get('flyff_params', '').strip()
    try:
        set_config_keys({
            'flyff_path': flyff_path,
            'flyff_params': flyff_params
        })
        return jsonify({'message': 'Configuración de Flyff guardada con éxito.'}), 200
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/browse-exe', methods=['GET'])
def browse_exe_path():
    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.attributes("-topmost", True)
        root.withdraw()
        
        file_path = filedialog.askopenfilename(
            title="Seleccionar Ejecutable de Flyff (.exe o .bat)",
            filetypes=[("Executable/Batch files", "*.exe;*.bat;*.lnk"), ("All files", "*.*")]
        )
        
        root.destroy()
        
        if file_path:
            return jsonify({'path': file_path})
        else:
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
            
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        print(f"Error abriendo explorador de archivos: {e}")
        return jsonify({'error': 'La ventana de carpetas no es compatible con entornos Docker o Linux Headless. Por favor escribe la ruta manualmente.'}), 400
