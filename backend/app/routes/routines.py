from flask import Blueprint, jsonify, request
from ..excel_db import ExcelDB

bp = Blueprint('routines', __name__, url_prefix='/api/routines')

@bp.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = ExcelDB.get_all('routine_tasks')
        if not tasks:
            # Seed default routine tasks if none exist
            defaults = [
                {"title": "Instancias Diarias (Colosseum / Wilds / Cave)", "frequency": "daily", "category": "Instancias"},
                {"title": "Cobro de Recompensa Login Diario", "frequency": "daily", "category": "Recompensas"},
                {"title": "Registro e Inscripción en Guild Siege", "frequency": "weekly", "category": "Gremio"},
                {"title": "Revisión de Búsqueda de Ítems en Comercio", "frequency": "daily", "category": "Comercio"}
            ]
            for d in defaults:
                ExcelDB.insert('routine_tasks', d)
            tasks = ExcelDB.get_all('routine_tasks')
        return jsonify(tasks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks', methods=['POST'])
def add_task():
    try:
        data = request.json or {}
        if not data.get('title'):
            return jsonify({"error": "El título de la rutina es requerido"}), 400
        new_task = ExcelDB.insert('routine_tasks', data)
        return jsonify(new_task), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        success = ExcelDB.delete('routine_tasks', task_id)
        if success:
            return jsonify({"result": True})
        return jsonify({"error": "Task not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/progress', methods=['GET'])
def get_progress():
    try:
        progress = ExcelDB.get_all('routine_progress')
        char_id = request.args.get('character_id')
        if char_id:
            progress = [p for p in progress if str(p.get('character_id')) == str(char_id)]
        return jsonify(progress)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/progress', methods=['POST'])
def toggle_progress():
    try:
        data = request.json or {}
        task_id = data.get('task_id')
        char_id = data.get('character_id')
        completed_date = data.get('completed_date')
        is_completed = data.get('is_completed', True)

        if not task_id or not char_id:
            return jsonify({"error": "task_id y character_id son requeridos"}), 400

        all_p = ExcelDB.get_all('routine_progress')
        existing = [p for p in all_p if str(p.get('task_id')) == str(task_id) and str(p.get('character_id')) == str(char_id) and str(p.get('completed_date')) == str(completed_date)]
        
        if existing:
            updated = ExcelDB.update('routine_progress', existing[0]['id'], {"is_completed": is_completed})
            return jsonify(updated)
        else:
            new_p = ExcelDB.insert('routine_progress', {
                "task_id": task_id,
                "character_id": char_id,
                "completed_date": completed_date,
                "is_completed": is_completed
            })
            return jsonify(new_p), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
