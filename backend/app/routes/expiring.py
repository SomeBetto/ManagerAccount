from flask import Blueprint, jsonify, request
from ..excel_db import ExcelDB

bp = Blueprint('expiring', __name__, url_prefix='/api/expiring-items')

@bp.route('', methods=['GET'])
def get_expiring_items():
    try:
        items = ExcelDB.get_all('expiring_items')
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['POST'])
def add_expiring_item():
    try:
        data = request.json or {}
        if not data.get('item_name') or not data.get('expiration_date'):
            return jsonify({"error": "item_name y expiration_date son requeridos"}), 400
        new_item = ExcelDB.insert('expiring_items', data)
        return jsonify(new_item), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:item_id>', methods=['PUT'])
def update_expiring_item(item_id):
    try:
        data = request.json or {}
        updated = ExcelDB.update('expiring_items', item_id, data)
        if updated:
            return jsonify(updated)
        return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:item_id>', methods=['DELETE'])
def delete_expiring_item(item_id):
    try:
        success = ExcelDB.delete('expiring_items', item_id)
        if success:
            return jsonify({"result": True})
        return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
