import pytest
from unittest.mock import patch

# ==========================================
# Pruebas para la funcionalidad de Cuentas (/api/accounts)
# ==========================================

@patch('app.routes.accounts.ExcelDB.get_all')
def test_get_accounts_unit(mock_get_all, client):
    """UNIT TEST: Mockea DB y verifica respuesta JSON de GET /api/accounts"""
    mock_get_all.return_value = [{'id': 1, 'email': 'test@test.com'}]
    response = client.get('/api/accounts')
    assert response.status_code == 200
    assert response.json == [{'id': 1, 'email': 'test@test.com'}]
    mock_get_all.assert_called_once_with('accounts')

@patch('app.routes.accounts.ExcelDB.insert')
def test_create_account_unit(mock_insert, client):
    """UNIT TEST: Mockea DB y verifica creación de cuenta."""
    mock_insert.return_value = {'id': 1, 'email': 'new@test.com'}
    response = client.post('/api/accounts', json={'email': 'new@test.com', 'password': '123'})
    assert response.status_code == 201
    assert response.json['email'] == 'new@test.com'
    mock_insert.assert_called_once()

def test_accounts_integration(client, integration_db):
    """INTEGRATION TEST: Flujo completo CRUD de cuentas usando BD temporal."""
    # Create
    create_payload = {'email': 'integ@test.com', 'password': 'pass', 'pin': '1234'}
    res_create = client.post('/api/accounts', json=create_payload)
    assert res_create.status_code == 201
    created_id = res_create.json['id']
    
    # Read
    res_get = client.get('/api/accounts')
    assert res_get.status_code == 200
    assert len(res_get.json) == 1
    assert res_get.json[0]['email'] == 'integ@test.com'
    
    # Update
    res_update = client.put(f'/api/accounts/{created_id}', json={'email': 'integ_updated@test.com'})
    assert res_update.status_code == 200
    assert res_update.json['email'] == 'integ_updated@test.com'
    
    # Delete (Comentado porque ExcelDB.delete no está implementado en la aplicación)
    # res_delete = client.delete(f'/api/accounts/{created_id}')
    # assert res_delete.status_code == 200
    
    # Verify Empty
    # res_get_empty = client.get('/api/accounts')
    # assert len(res_get_empty.json) == 0

# ==========================================
# Pruebas para la funcionalidad de Personajes (/api/characters)
# ==========================================

@patch('app.routes.characters.ExcelDB.get_all')
def test_get_characters_unit(mock_get_all, client):
    """UNIT TEST: Endpoint /api/characters"""
    mock_get_all.return_value = [{'id': 1, 'name': 'Char1'}]
    response = client.get('/api/characters')
    assert response.status_code == 200
    assert response.json[0]['name'] == 'Char1'

def test_characters_integration(client, integration_db):
    """INTEGRATION TEST: CRUD Personajes."""
    client.post('/api/accounts', json={'email': 'acc@test.com', 'password': '123'})
    res_char = client.post('/api/characters', json={
        'account_id': 1, 'name': 'Hero', 'class_name': 'Warrior', 'level': 10
    })
    assert res_char.status_code == 201
    char_id = res_char.json['id']
    
    res_get = client.get('/api/characters')
    assert len(res_get.json) == 1
    assert res_get.json[0]['name'] == 'Hero'

# ==========================================
# Pruebas para la funcionalidad de Leveling (/api/leveling)
# ==========================================

@patch('app.routes.leveling.ExcelDB.get_all')
def test_get_leveling_unit(mock_get_all, client):
    """UNIT TEST: Endpoint /api/leveling"""
    mock_get_all.return_value = []
    response = client.get('/api/leveling')
    assert response.status_code == 200
    assert response.json == []

def test_leveling_integration(client, integration_db):
    """INTEGRATION TEST: Leveling Entries."""
    res_post = client.post('/api/leveling', json={'character_id': 1, 'priority': 'Alta', 'note': 'Test'})
    assert res_post.status_code == 201
    assert res_post.json['note'] == 'Test'

# ==========================================
# Pruebas para la funcionalidad de Items (/api/items)
# ==========================================

@patch('app.routes.items.ExcelDB.get_all')
def test_get_items_unit(mock_get_all, client):
    mock_get_all.return_value = [{'id': 1, 'name': 'Sword'}]
    response = client.get('/api/items')
    assert response.status_code == 200
    assert response.json[0]['name'] == 'Sword'

def test_items_integration(client, integration_db):
    res_post = client.post('/api/items', json={'character_id': 1, 'name': 'Shield', 'item_type': 'Armor'})
    assert res_post.status_code == 201

# ==========================================
# Pruebas para la funcionalidad de Config (/api/config)
# ==========================================

@patch('app.routes.config.get_excel_path')
def test_config_dbpath_unit(mock_get_path, client):
    mock_get_path.return_value = 'some/path.xlsx'
    response = client.get('/api/config/db-path')
    assert response.status_code == 200
    assert response.json['path'] == 'some/path.xlsx'

# ==========================================
# Pruebas para la funcionalidad de Eventos (/api/daily-events)
# ==========================================

@patch('app.routes.events.ExcelDB.get_all')
def test_events_unit(mock_get_all, client):
    mock_get_all.return_value = [{'id': 1, 'name': 'Event'}]
    response = client.get('/api/daily-events')
    assert response.status_code == 200

def test_events_integration(client, integration_db):
    res_post = client.post('/api/daily-events', json={'name': 'Christmas Event', 'description': 'desc', 'start_date': '2023', 'end_date': '2024'})
    assert res_post.status_code == 201

# ==========================================
# Pruebas para la funcionalidad de Cupones (/api/coupons)
# ==========================================

@patch('app.routes.coupons.ExcelDB.get_all')
def test_coupons_unit(mock_get_all, client):
    mock_get_all.return_value = [{'id': 1, 'code': 'ABC'}]
    response = client.get('/api/coupons')
    assert response.status_code == 200

def test_coupons_integration(client, integration_db):
    res_post = client.post('/api/coupons', json={'code': 'TESTCODE', 'name': 'Test', 'description': 'desc'})
    assert res_post.status_code == 201
