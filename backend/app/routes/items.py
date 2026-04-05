from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('items', __name__)

@bp.route('/api/items', methods=['GET'])
def get_items():
    try:
        items = ExcelDB.get_all('items')
        return jsonify(items)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/api/items', methods=['POST'])
def create_item():
    data = request.json
    try:
        desc = data.get('description', '')[:50]
        new_item = {
            'character_id': data['character_id'],
            'name': data['name'],
            'item_type': data.get('item_type', ''),
            'description': desc
        }
        inserted = ExcelDB.insert('items', new_item)
        return jsonify(inserted), 201
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/api/items/<int:id>', methods=['PUT'])
def update_item(id):
    data = request.json
    try:
        item = ExcelDB.get_by_id('items', id)
        if not item: return jsonify({'error': 'Not found'}), 404
        
        update_data = {}
        if 'name' in data: update_data['name'] = data['name']
        if 'item_type' in data: update_data['item_type'] = data['item_type']
        if 'description' in data: update_data['description'] = data.get('description', '')[:50]
        if 'character_id' in data: update_data['character_id'] = data['character_id']
        
        updated = ExcelDB.update('items', id, update_data)
        return jsonify(updated)
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400

@bp.route('/api/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    try:
        if ExcelDB.delete('items', id):
            return jsonify({'message': 'Item deleted successfully'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        from flask import current_app
        current_app.logger.error(str(e), exc_info=True)
        return jsonify({'error': str(e)}), 400
