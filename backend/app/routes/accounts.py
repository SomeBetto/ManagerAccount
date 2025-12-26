from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.account import Account

bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@bp.route('', methods=['POST'])
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

@bp.route('', methods=['GET'])
def get_accounts():
    accounts = Account.query.all()
    return jsonify([a.to_dict() for a in accounts])

@bp.route('/<int:id>', methods=['PUT'])
def update_account(id):
    account = Account.query.get_or_404(id)
    data = request.json
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

@bp.route('/<int:id>', methods=['DELETE'])
def delete_account(id):
    account = Account.query.get_or_404(id)
    try:
        db.session.delete(account)
        db.session.commit()
        return jsonify({'message': 'Account deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/batch-delete', methods=['POST'])
def batch_delete_accounts():
    data = request.json
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    try:
        Account.query.filter(Account.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({'message': f'Deleted {len(ids)} accounts'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
