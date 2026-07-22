from functools import wraps
from flask import request, jsonify

def validate_json(required_fields=None, optional_fields=None):
    """
    Decorator to validate incoming JSON request payloads for Flask routes.
    - required_fields: List of field names that MUST be present and non-empty in request.json.
    - optional_fields: List of allowed optional field names.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json and request.content_length and request.content_length > 0:
                return jsonify({'error': 'El contenido debe ser en formato JSON.'}), 400
            
            data = request.get_json(silent=True)
            if data is None and (required_fields or request.method in ['POST', 'PUT']):
                data = {}

            if required_fields and isinstance(data, dict):
                missing = [field for field in required_fields if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip())]
                if missing:
                    return jsonify({
                        'error': f'Faltan campos obligatorios: {", ".join(missing)}'
                    }), 400
                    
            return f(*args, **kwargs)
        return wrapper
    return decorator
