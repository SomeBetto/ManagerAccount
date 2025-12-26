from flask import Blueprint, request, jsonify
from models import db, Account, Character
import csv
import io

api_bp = Blueprint('api', __name__)

# Account Routes
@api_bp.route('/accounts', methods=['POST'])
def create_account():
    data = request.json
    try:
        new_account = Account(
            email=data['email'],
            password=data['password'],
            pin=data.get('pin')
        )
        db.session.add(new_account)
        db.session.commit()
        return jsonify(new_account.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/accounts', methods=['GET'])
def get_accounts():
    accounts = Account.query.all()
    return jsonify([a.to_dict() for a in accounts])

@api_bp.route('/accounts/<int:id>', methods=['PUT'])
def update_account(id):
    account = Account.query.get_or_404(id)
    data = request.json
    print(f"DEBUG UPDATE: ID={id}, Data={data}", flush=True) # Debug log
    account.email = data.get('email', account.email)
    if data.get('password'):
        account.password = data['password']
    account.pin = data.get('pin', account.pin)
    try:
        db.session.commit()
        return jsonify(account.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/accounts/<int:id>', methods=['DELETE'])
def delete_account(id):
    account = Account.query.get_or_404(id)
    try:
        db.session.delete(account)
        db.session.commit()
        return jsonify({'message': 'Account deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/accounts/batch-delete', methods=['POST'])
def batch_delete_accounts():
    data = request.json
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'message': 'No IDs provided'}), 400
        
    try:
        # Bulk delete
        Account.query.filter(Account.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'message': f'Deleted {len(ids)} accounts'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Character Routes
@api_bp.route('/characters', methods=['POST'])
def create_character():
    data = request.json
    try:
        # Fetch account to get password
        account = Account.query.get(data['account_id'])
        if not account:
            return jsonify({'error': 'Account not found'}), 404

        new_character = Character(
            account_id=data['account_id'],
            name=data['name'],
            password=account.password, # Inherit password
            level=data.get('level'),
            class_name=data.get('class_name'),
            char_type=data.get('char_type')
        )
        db.session.add(new_character)
        db.session.commit()
        return jsonify(new_character.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/characters', methods=['GET'])
def get_characters():
    account_id = request.args.get('account_id')
    if account_id:
        characters = Character.query.filter_by(account_id=account_id).all()
    else:
        characters = Character.query.all()
    return jsonify([c.to_dict() for c in characters])

@api_bp.route('/characters/<int:id>', methods=['PUT'])
def update_character(id):
    character = Character.query.get_or_404(id)
    data = request.json
    character.name = data.get('name', character.name)
    character.password = data.get('password', character.password)
    character.level = data.get('level', character.level)
    character.class_name = data.get('class_name', character.class_name)
    character.char_type = data.get('char_type', character.char_type)
    try:
        db.session.commit()
        return jsonify(character.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    character = Character.query.get_or_404(id)
    try:
        db.session.delete(character)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# CSV Upload Routes
@api_bp.route('/upload/accounts', methods=['POST'])
def upload_accounts():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
        
        # Headers: email, password, pin
        count = 0
        for row in csv_input:
            if len(row) < 2: continue # Skip empty or invalid lines
            
            email = row[0].strip()
            # Check if exists
            if Account.query.filter_by(email=email).first():
                continue
                
            new_acc = Account(
                email=email,
                password=row[1].strip(),
                pin=row[2].strip() if len(row) > 2 else None
            )
            db.session.add(new_acc)
            count += 1
            
        db.session.commit()
        return jsonify({'message': f'Imported {count} accounts'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/upload/characters', methods=['POST'])
def upload_characters():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.reader(stream)
        
        # Headers: Name, AccountEmail, Class, Level, Type (Optional)
        count = 0
        for row in csv_input:
            if len(row) < 2: continue
            
            # New Order: 0=Name, 1=AccountEmail
            char_name = row[0].strip()
            acc_email = row[1].strip()
            
            # Find account
            account = Account.query.filter_by(email=acc_email).first()
            if not account: continue
            
            # Parse Level safely
            level_val = None
            if len(row) > 3 and row[3].strip():
                try:
                    level_val = int(row[3].strip())
                except:
                    pass

            new_char = Character(
                account_id=account.id,
                name=char_name,
                password=account.password, # Inherit
                class_name=row[2].strip() if len(row) > 2 else None,
                level=level_val,
                char_type=row[4].strip() if len(row) > 4 else None
            )
            db.session.add(new_char)
            count += 1
            
        db.session.commit()
        return jsonify({'message': f'Imported {count} characters'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# LevelZone Routes
from models import LevelEntry

@api_bp.route('/leveling', methods=['GET'])
def get_level_queue():
    entries = LevelEntry.query.join(Character).order_by(LevelEntry.priority.desc()).all()
    return jsonify([e.to_dict() for e in entries])

@api_bp.route('/leveling', methods=['POST'])
def add_to_level_queue():
    data = request.json
    char_id = data.get('character_id')
    if not char_id:
        return jsonify({'error': 'Character ID required'}), 400
        
    # Check if exists
    if LevelEntry.query.filter_by(character_id=char_id).first():
        return jsonify({'error': 'Character already in queue'}), 400
        
    try:
        new_entry = LevelEntry(
            character_id=char_id,
            priority=data.get('priority', 0),
            note=data.get('note', '')
        )
        db.session.add(new_entry)
        db.session.commit()
        return jsonify(new_entry.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/leveling/<int:id>', methods=['PUT'])
def update_level_entry(id):
    entry = LevelEntry.query.get_or_404(id)
    data = request.json
    
    if 'priority' in data:
        entry.priority = int(data['priority'])
    if 'note' in data:
        entry.note = str(data['note'])[:500] # Cap at 500 chars
        
    try:
        db.session.commit()
        return jsonify(entry.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@api_bp.route('/leveling/<int:id>', methods=['DELETE'])
def delete_level_entry(id):
    entry = LevelEntry.query.get_or_404(id)
    try:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({'message': 'Removed from queue'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
