from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('leveling', __name__, url_prefix='/api/leveling')

@bp.route('', methods=['GET'])
def get_level_queue():
    try:
        entries = ExcelDB.get_all('level_entries')
        characters = ExcelDB.get_all('characters')
        accounts = ExcelDB.get_all('accounts')
        
        # Create lookups for faster access
        char_map = {c['id']: c for c in characters}
        acc_map = {a['id']: a for a in accounts}
        
        for e in entries:
            try:
                char_id = int(e.get('character_id')) if e.get('character_id') is not None else None
            except (ValueError, TypeError):
                char_id = e.get('character_id')
                
            e['character_id'] = char_id # Ensure it's there and int-ish
            char = char_map.get(char_id)
            if char:
                e['character_name'] = char.get('name', 'Unknown')
                try:
                    acc_id = int(char.get('account_id')) if char.get('account_id') is not None else None
                except (ValueError, TypeError):
                    acc_id = char.get('account_id')
                
                e['account_id'] = acc_id
                acc = acc_map.get(acc_id)
                if acc:
                    e['account_email'] = acc.get('email', 'Unknown')
                else:
                    e['account_email'] = 'Unknown'
            else:
                e['character_name'] = 'Unknown'
                e['account_email'] = 'Unknown'
                e['account_id'] = None

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
