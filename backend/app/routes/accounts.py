from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@bp.route('', methods=['POST'])
def create_account():
    data = request.json
    try:
        new_account = {
            'email': data['email'],
            'password': data['password'],
            'pin': data.get('pin')
        }
        inserted = ExcelDB.insert('accounts', new_account)
        return jsonify(inserted), 201
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('', methods=['GET'])
def get_accounts():
    try:
        accounts = ExcelDB.get_all('accounts')
        return jsonify(accounts)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_account(id):
    data = request.json
    try:
        account = ExcelDB.get_by_id('accounts', id)
        if not account:
            return jsonify({'error': 'Not found'}), 404
            
        update_data = {}
        if 'email' in data: update_data['email'] = data['email']
        if 'password' in data: update_data['password'] = data['password']
        if 'pin' in data: update_data['pin'] = data['pin']
        
        updated = ExcelDB.update('accounts', id, update_data)
        return jsonify(updated)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def delete_account(id):
    try:
        success = ExcelDB.delete('accounts', id)
        if success:
            # Optionally cascade delete related characters? Let's keep it simple for now as per old logic.
            return jsonify({'message': 'Account deleted successfully'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/batch-delete', methods=['POST'])
def batch_delete_accounts():
    data = request.json
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    try:
        count = 0
        for i in ids:
            if ExcelDB.delete('accounts', int(i)):
                count += 1
        return jsonify({'message': f'Deleted {count} accounts'})
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400
