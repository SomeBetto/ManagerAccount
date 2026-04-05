from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB
import csv
import io

bp = Blueprint('characters', __name__)

# CSV Upload Routes
@bp.route('/api/upload/accounts', methods=['POST'])
def upload_accounts_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
        
        all_accounts = ExcelDB.get_all('accounts')
        existing_emails = {a.get('email'): a for a in all_accounts}

        added_count = 0
        for row in csv_input:
            if not row: continue
            if len(row) < 2: continue # Expect email, password, [pin]

            email = row[0].strip()
            password = row[1].strip()
            pin = row[2].strip() if len(row) > 2 else None

            if email not in existing_emails:
                new_acc = {'email': email, 'password': password, 'pin': pin}
                ExcelDB.insert('accounts', new_acc)
                existing_emails[email] = new_acc # Add to tracking to prevent dups in same csv
                added_count += 1
        
        return jsonify({'message': f'Successfully added {added_count} accounts.'})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500

@bp.route('/api/upload/characters', methods=['POST'])
def upload_characters_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
        
        all_accounts = ExcelDB.get_all('accounts')
        account_email_map = {a.get('email'): a.get('id') for a in all_accounts}

        added_count = 0
        for row in csv_input:
            if not row: continue
            # Format: AccountEmail, CharName, Level, Class, Type
            if len(row) < 5: continue

            acc_email = row[0].strip()
            char_name = row[1].strip()
            level = int(row[2].strip())
            class_name = row[3].strip()
            char_type = row[4].strip()

            acc_id = account_email_map.get(acc_email)
            if acc_id:
                new_char = {
                    'account_id': acc_id,
                    'name': char_name,
                    'level': level,
                    'class_name': class_name,
                    'char_type': char_type,
                    'is_favorite': False
                }
                ExcelDB.insert('characters', new_char)
                added_count += 1
        
        return jsonify({'message': f'Successfully added {added_count} characters.'})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500

# Character CRUD
@bp.route('/api/characters', methods=['POST'])
def create_character():
    data = request.json
    try:
        new_char = {
            'account_id': data['account_id'],
            'name': data['name'],
            'level': data.get('level'),
            'class_name': data.get('class_name'),
            'char_type': data.get('char_type'),
            'is_favorite': data.get('is_favorite', False)
        }
        inserted = ExcelDB.insert('characters', new_char)
        return jsonify(inserted), 201
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/api/characters', methods=['GET'])
def get_characters():
    try:
        chars = ExcelDB.get_all('characters')
        return jsonify(chars)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500

@bp.route('/api/characters/<int:id>', methods=['PUT'])
def update_character(id):
    data = request.json
    try:
        char = ExcelDB.get_by_id('characters', id)
        if not char:
            return jsonify({'error': 'Not found'}), 404
        
        update_data = {}
        if 'name' in data: update_data['name'] = data['name']
        if 'level' in data: update_data['level'] = data['level']
        if 'class_name' in data: update_data['class_name'] = data['class_name']
        if 'char_type' in data: update_data['char_type'] = data['char_type']
        if 'is_favorite' in data: update_data['is_favorite'] = data['is_favorite']
        if 'account_id' in data: update_data['account_id'] = data['account_id']
        
        updated = ExcelDB.update('characters', id, update_data)
        return jsonify(updated)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/api/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    try:
        if ExcelDB.delete('characters', id):
            return jsonify({'message': 'Character deleted successfully'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400
@bp.route('/api/catalog/classes', methods=['GET'])
def get_classes_catalogo():
    try:
        classes = ExcelDB.get_catalog('Catalogo', 'Clases')
        return jsonify(classes)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500

@bp.route('/api/catalog/item_types', methods=['GET'])
def get_item_types_catalogo():
    try:
        types = ExcelDB.get_catalog('Catalogo', 'TipoItems')
        if not types:
            # Fallback defaults if the column is missing or empty in Excel
            types = ['Arma', 'Armadura', 'Joya', 'Consumible', 'Material', 'Quest', 'Evento', 'Otro']
        return jsonify(types)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 500
