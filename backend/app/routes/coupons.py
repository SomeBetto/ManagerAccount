from flask import Blueprint, request, jsonify
from app.excel_db import ExcelDB
from datetime import datetime

bp = Blueprint('coupons', __name__)

@bp.route('/api/coupons', methods=['GET'])
def get_coupons():
    try:
        coupons = ExcelDB.get_all('coupons')
        return jsonify(coupons)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/coupons', methods=['POST'])
def create_coupon():
    try:
        data = request.json
        if not data.get('name') or not data.get('code'):
            return jsonify({'error': 'Name and Code are required'}), 400
        
        new_coupon = ExcelDB.insert('coupons', data)
        return jsonify(new_coupon), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/coupons/<int:coupon_id>', methods=['DELETE'])
def delete_coupon(coupon_id):
    try:
        success = ExcelDB.delete('coupons', coupon_id)
        return jsonify({'success': success})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def safe_int(val):
    try:
        if val is None or str(val).strip() == '':
            return None
        return int(float(val))
    except:
        return None

@bp.route('/api/coupons/<int:coupon_id>/unredeemed', methods=['GET'])
def get_unredeemed_accounts(coupon_id):
    try:
        all_accounts = ExcelDB.get_all('accounts')
        all_redemptions = ExcelDB.get_all('coupon_redemptions')
        
        # Accounts that already redeemed this specific coupon
        redeemed_account_ids = set()
        for r in all_redemptions:
            r_coupon_id = safe_int(r.get('coupon_id'))
            r_acc_id = safe_int(r.get('account_id'))
            if r_coupon_id == coupon_id and r_acc_id is not None:
                redeemed_account_ids.add(r_acc_id)
        
        unredeemed = [a for a in all_accounts if safe_int(a.get('id')) not in redeemed_account_ids]
        return jsonify(unredeemed)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/coupons/redeem', methods=['POST'])
def redeem_coupon():
    try:
        data = request.json
        if not all(k in data for k in ['coupon_id', 'account_id', 'character_id']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        redemptions = ExcelDB.get_all('coupon_redemptions')
        is_already = any(
            safe_int(r.get('coupon_id')) == safe_int(data['coupon_id']) and 
            safe_int(r.get('account_id')) == safe_int(data['account_id']) 
            for r in redemptions
        )
        if is_already:
            return jsonify({'error': 'Account already redeemed or skipped this coupon'}), 400

        data['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        new_redemption = ExcelDB.insert('coupon_redemptions', data)
        return jsonify(new_redemption), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/coupons/skip', methods=['POST'])
def skip_coupon():
    try:
        data = request.json
        # Expecting: { coupon_id, account_id }
        if not all(k in data for k in ['coupon_id', 'account_id']):
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Check if already redeemed
        redemptions = ExcelDB.get_all('coupon_redemptions')
        is_already = any(
            safe_int(r.get('coupon_id')) == safe_int(data['coupon_id']) and 
            safe_int(r.get('account_id')) == safe_int(data['account_id']) 
            for r in redemptions
        )
        if is_already:
            return jsonify({'error': 'Account already has a record for this coupon'}), 400

        data['character_id'] = 0 # 0 means "Skipped/No character"
        data['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        new_redemption = ExcelDB.insert('coupon_redemptions', data)
        return jsonify(new_redemption), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/api/coupons/<int:coupon_id>/redeemed', methods=['GET'])
def get_redeemed_characters(coupon_id):
    try:
        all_chars = ExcelDB.get_all('characters')
        all_redemptions = ExcelDB.get_all('coupon_redemptions')
        
        redemption_map = {}
        for r in all_redemptions:
            r_coupon_id = safe_int(r.get('coupon_id'))
            r_char_id = safe_int(r.get('character_id'))
            if r_coupon_id == coupon_id and r_char_id is not None:
                redemption_map[r_char_id] = r
        
        redeemed_chars = []
        for char in all_chars:
            char_id = safe_int(char.get('id'))
            if char_id in redemption_map:
                char['redemption_date'] = redemption_map[char_id].get('date', 'Unknown')
                redeemed_chars.append(char)
                
        return jsonify(redeemed_chars)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
