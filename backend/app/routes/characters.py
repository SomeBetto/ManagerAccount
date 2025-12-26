from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.account import Account
from app.models.character import Character
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
        
        added_count = 0
        for row in csv_input:
            if not row: continue
            if len(row) < 2: continue # Expect email, password, [pin]

            email = row[0].strip()
            password = row[1].strip()
            pin = row[2].strip() if len(row) > 2 else None

            if not Account.query.filter_by(email=email).first():
                new_acc = Account(email=email, password=password, pin=pin)
                db.session.add(new_acc)
                added_count += 1
        
        db.session.commit()
        return jsonify({'message': f'Successfully added {added_count} accounts.'})
    except Exception as e:
        db.session.rollback()
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

            account = Account.query.filter_by(email=acc_email).first()
            if account:
                new_char = Character(
                    account_id=account.id,
                    name=char_name,
                    level=level,
                    class_name=class_name,
                    char_type=char_type
                )
                db.session.add(new_char)
                added_count += 1
        
        db.session.commit()
        return jsonify({'message': f'Successfully added {added_count} characters.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Character CRUD
@bp.route('/api/characters', methods=['POST'])
def create_character():
    data = request.json
    try:
        new_char = Character(
            account_id=data['account_id'],
            name=data['name'],
            level=data.get('level'),
            class_name=data.get('class_name'),
            char_type=data.get('char_type')
        )
        db.session.add(new_char)
        db.session.commit()
        return jsonify(new_char.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/characters', methods=['GET'])
def get_characters():
    chars = Character.query.all()
    # Sort by account logic or anything is done in frontend usually, but here we just dump
    return jsonify([c.to_dict() for c in chars])

@bp.route('/api/characters/<int:id>', methods=['PUT'])
def update_character(id):
    char = Character.query.get_or_404(id)
    data = request.json
    char.name = data.get('name', char.name)
    char.level = data.get('level', char.level)
    char.class_name = data.get('class_name', char.class_name)
    char.char_type = data.get('char_type', char.char_type)
    if 'account_id' in data:
        char.account_id = data['account_id']
    
    try:
        db.session.commit()
        return jsonify(char.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    char = Character.query.get_or_404(id)
    try:
        db.session.delete(char)
        db.session.commit()
        return jsonify({'message': 'Character deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
