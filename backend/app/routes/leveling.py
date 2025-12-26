from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.character import LevelEntry

bp = Blueprint('leveling', __name__, url_prefix='/api/leveling')

@bp.route('', methods=['GET'])
def get_level_queue():
    entries = LevelEntry.query.order_by(LevelEntry.priority.asc()).all()
    return jsonify([e.to_dict() for e in entries])

@bp.route('', methods=['POST'])
def add_to_queue():
    data = request.json
    try:
        # Check if already exists
        if LevelEntry.query.filter_by(character_id=data['character_id']).first():
            return jsonify({'error': 'Character already in queue'}), 400

        entry = LevelEntry(
            character_id=data['character_id'],
            priority=data.get('priority', 0),
            note=data.get('note', '')
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify(entry.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['PUT'])
def update_queue_entry(id):
    entry = LevelEntry.query.get_or_404(id)
    data = request.json
    if 'priority' in data:
        entry.priority = data['priority']
    if 'note' in data:
        entry.note = data['note']
    try:
        db.session.commit()
        return jsonify(entry.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:id>', methods=['DELETE'])
def remove_from_queue(id):
    entry = LevelEntry.query.get_or_404(id)
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Removed from queue'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
