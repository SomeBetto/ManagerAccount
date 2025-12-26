from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.event import DailyEvent, DailyEventParticipant, DailyEventProgress
from datetime import datetime

bp = Blueprint('daily_events', __name__, url_prefix='/api/daily-events')

@bp.route('', methods=['GET'])
def get_daily_events():
    events = DailyEvent.query.all()
    return jsonify([e.to_dict() for e in events])

@bp.route('', methods=['POST'])
def create_daily_event():
    data = request.json
    try:
        event = DailyEvent(
            name=data['name'],
            description=data.get('description'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        )
        db.session.add(event)
        db.session.commit()
        return jsonify(event.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_daily_event(id):
    event = DailyEvent.query.get_or_404(id)
    data = request.json
    try:
        if 'name' in data: event.name = data['name']
        if 'description' in data: event.description = data['description']
        if 'start_date' in data: event.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data: event.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify(event.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def delete_daily_event(id):
    event = DailyEvent.query.get_or_404(id)
    try:
        db.session.delete(event)
        db.session.commit()
        return jsonify({'message': 'Event deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Parts & Progress
@bp.route('/<int:id>/participants', methods=['GET'])
def get_event_participants(id):
    event = DailyEvent.query.get_or_404(id)
    return jsonify([p.to_dict() for p in event.participants])

@bp.route('/<int:id>/participants', methods=['POST'])
def add_participant(id):
    data = request.json
    try:
        # Check duplicacy handled by DB constraint unique
        part = DailyEventParticipant(
            event_id=id,
            character_id=data['character_id']
        )
        db.session.add(part)
        db.session.commit()
        return jsonify(part.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/participants/<int:id>', methods=['DELETE'])
def remove_participant(id):
    part = DailyEventParticipant.query.get_or_404(id)
    try:
        db.session.delete(part)
        db.session.commit()
        return jsonify({'message': 'Participant removed'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/progress', methods=['POST'])
def update_progress():
    data = request.json
    try:
        participant_id = data['participant_id']
        date_obj = datetime.strptime(data['date'], '%Y-%m-%d').date()
        completed = data['completed']

        progress = DailyEventProgress.query.filter_by(participant_id=participant_id, event_date=date_obj).first()
        
        if progress:
            progress.is_completed = completed
        else:
            progress = DailyEventProgress(
                participant_id=participant_id, 
                event_date=date_obj, 
                is_completed=completed
            )
            db.session.add(progress)
        
        db.session.commit()
        return jsonify(progress.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
