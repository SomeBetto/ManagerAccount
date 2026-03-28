from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('leveling', __name__, url_prefix='/api/leveling')

@bp.route('', methods=['GET'])
def get_level_queue():
    try:
        entries = ExcelDB.get_all('level_entries')
        # sort by priority
        entries.sort(key=lambda x: int(x.get('priority', 0)))
        return jsonify(entries)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('', methods=['POST'])
def add_to_queue():
    data = request.json
    try:
        entries = ExcelDB.get_all('level_entries')
        if any(e.get('character_id') == data['character_id'] for e in entries):
            return jsonify({'error': 'Character already in queue'}), 400
            
        new_entry = {
            'character_id': data['character_id'],
            'priority': data.get('priority', 0),
            'note': data.get('note', '')
        }
        inserted = ExcelDB.insert('level_entries', new_entry)
        return jsonify(inserted), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_queue_entry(id):
    data = request.json
    try:
        entry = ExcelDB.get_by_id('level_entries', id)
        if not entry:
            return jsonify({'error': 'Not found'}), 404
            
        update_data = {}
        if 'priority' in data: update_data['priority'] = data['priority']
        if 'note' in data: update_data['note'] = data['note']
        
        updated = ExcelDB.update('level_entries', id, update_data)
        return jsonify(updated)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def remove_from_queue(id):
    try:
        if ExcelDB.delete('level_entries', id):
            return jsonify({'message': 'Removed from queue'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400
