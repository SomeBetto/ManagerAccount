import os
import json
from flask import Blueprint, jsonify, request
from ..excel_db import ExcelDB

bp = Blueprint('gear', __name__, url_prefix='/api/gear')

# Single unified catalog directory at project root (catalogo/)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CATALOG_DIR = os.path.join(ROOT_DIR, 'catalogo')

CATALOG_FILE = os.path.join(CATALOG_DIR, 'flyff_catalog.json')
PIERCING_CATALOG_FILE = os.path.join(CATALOG_DIR, 'piercing_catalog.json')

@bp.route('/catalog', methods=['GET'])
def get_catalog():
    try:
        if os.path.exists(CATALOG_FILE):
            with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify(data)
        return jsonify({"categories": {}, "refines": [], "piercings": [], "elements": [], "cards": []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/piercing-catalog', methods=['GET'])
def get_piercing_catalog():
    try:
        if os.path.exists(PIERCING_CATALOG_FILE):
            with open(PIERCING_CATALOG_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify(data)
        return jsonify({"piercing_rules": {}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['GET'])
def get_gear():
    try:
        gear_items = ExcelDB.get_all('character_gear')
        char_id = request.args.get('character_id')
        if char_id:
            gear_items = [g for g in gear_items if str(g.get('character_id')) == str(char_id)]
        return jsonify(gear_items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('', methods=['POST'])
def add_gear():
    try:
        data = request.json or {}
        required = ['character_id', 'slot', 'item_name']
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"El campo {field} es requerido"}), 400
        
        new_gear = ExcelDB.insert('character_gear', data)
        return jsonify(new_gear), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:gear_id>', methods=['PUT'])
def update_gear(gear_id):
    try:
        data = request.json or {}
        updated = ExcelDB.update('character_gear', gear_id, data)
        if updated:
            return jsonify(updated)
        return jsonify({"error": "Gear item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/<int:gear_id>', methods=['DELETE'])
def delete_gear(gear_id):
    try:
        success = ExcelDB.delete('character_gear', gear_id)
        if success:
            return jsonify({"result": True})
        return jsonify({"error": "Gear item not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
