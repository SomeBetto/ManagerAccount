from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB

bp = Blueprint('daily_events', __name__, url_prefix='/api/daily-events')

@bp.route('', methods=['GET'])
def get_daily_events():
    try:
        events = ExcelDB.get_all('daily_events')
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('', methods=['POST'])
def create_daily_event():
    data = request.json
    try:
        new_event = {
            'name': data['name'],
            'description': data.get('description', ''),
            'start_date': data['start_date'],
            'end_date': data['end_date']
        }
        inserted = ExcelDB.insert('daily_events', new_event)
        return jsonify(inserted), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_daily_event(id):
    data = request.json
    try:
        event = ExcelDB.get_by_id('daily_events', id)
        if not event: return jsonify({'error': 'Not found'}), 404
        
        update_data = {}
        if 'name' in data: update_data['name'] = data['name']
        if 'description' in data: update_data['description'] = data['description']
        if 'start_date' in data: update_data['start_date'] = data['start_date']
        if 'end_date' in data: update_data['end_date'] = data['end_date']
        
        updated = ExcelDB.update('daily_events', id, update_data)
        return jsonify(updated)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def delete_daily_event(id):
    try:
        if ExcelDB.delete('daily_events', id):
            return jsonify({'message': 'Event deleted'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Parts & Progress
@bp.route('/<int:id>/participants', methods=['GET'])
def get_event_participants(id):
    try:
        parts = ExcelDB.get_all('daily_event_participants')
        filtered = [p for p in parts if p.get('event_id') == id]
        return jsonify(filtered)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>/participants', methods=['POST'])
def add_participant(id):
    data = request.json
    try:
        # Check duplicacy 
        parts = ExcelDB.get_all('daily_event_participants')
        if any(p.get('event_id') == id and p.get('character_id') == data['character_id'] for p in parts):
            return jsonify({'error': 'Already a participant'}), 400

        new_part = {
            'event_id': id,
            'character_id': data['character_id']
        }
        inserted = ExcelDB.insert('daily_event_participants', new_part)
        return jsonify(inserted), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/participants/<int:id>', methods=['DELETE'])
def remove_participant(id):
    try:
        if ExcelDB.delete('daily_event_participants', id):
            return jsonify({'message': 'Participant removed'})
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/progress', methods=['POST'])
def update_progress():
    data = request.json
    try:
        participant_id = data['participant_id']
        date_str = data['date'] # assumes front sends YYYY-MM-DD string already
        completed = data['completed']

        all_prog = ExcelDB.get_all('daily_event_progress')
        progress = next((p for p in all_prog if p.get('participant_id') == participant_id and p.get('event_date') == date_str), None)
        
        if progress:
            ExcelDB.update('daily_event_progress', progress['id'], {'is_completed': completed})
            progress['is_completed'] = completed
            return jsonify(progress)
        else:
            new_prog = {
                'participant_id': participant_id, 
                'event_date': date_str, 
                'is_completed': completed
            }
            inserted = ExcelDB.insert('daily_event_progress', new_prog)
            return jsonify(inserted)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
