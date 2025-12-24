import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с проектами Scene Editor: получение списка, создание, обновление, удаление
    Args: event - dict с httpMethod (GET/POST/PUT/DELETE), body, params
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с проектами или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            project_id = event.get('params', {}).get('id')
            
            if project_id:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute('SELECT id, name, data, created_at, updated_at FROM scene_projects WHERE id = %s', (project_id,))
                    project = cur.fetchone()
                    
                    if not project:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Project not found'}),
                            'isBase64Encoded': False
                        }
                    
                    result = {
                        'id': project['id'],
                        'name': project['name'],
                        'data': project['data'],
                        'created_at': project['created_at'].isoformat() if project['created_at'] else None,
                        'updated_at': project['updated_at'].isoformat() if project['updated_at'] else None
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
            else:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute('SELECT id, name, created_at, updated_at FROM scene_projects ORDER BY created_at DESC')
                    projects = cur.fetchall()
                    
                    result = [
                        {
                            'id': p['id'],
                            'name': p['name'],
                            'created_at': p['created_at'].isoformat() if p['created_at'] else None,
                            'updated_at': p['updated_at'].isoformat() if p['updated_at'] else None
                        }
                        for p in projects
                    ]
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', 'Новый проект')
            data = body_data.get('data', {})
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    'INSERT INTO scene_projects (name, data) VALUES (%s, %s) RETURNING id, name, data, created_at, updated_at',
                    (name, json.dumps(data))
                )
                project = cur.fetchone()
                conn.commit()
                
                result = {
                    'id': project['id'],
                    'name': project['name'],
                    'data': project['data'],
                    'created_at': project['created_at'].isoformat() if project['created_at'] else None,
                    'updated_at': project['updated_at'].isoformat() if project['updated_at'] else None
                }
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            project_id = event.get('params', {}).get('id')
            if not project_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Project ID required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            data = body_data.get('data')
            
            updates = []
            params = []
            
            if name is not None:
                updates.append('name = %s')
                params.append(name)
            
            if data is not None:
                updates.append('data = %s')
                params.append(json.dumps(data))
            
            if updates:
                updates.append('updated_at = CURRENT_TIMESTAMP')
                params.append(project_id)
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = f'UPDATE scene_projects SET {", ".join(updates)} WHERE id = %s RETURNING id, name, data, created_at, updated_at'
                    cur.execute(query, params)
                    project = cur.fetchone()
                    conn.commit()
                    
                    if not project:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Project not found'}),
                            'isBase64Encoded': False
                        }
                    
                    result = {
                        'id': project['id'],
                        'name': project['name'],
                        'data': project['data'],
                        'created_at': project['created_at'].isoformat() if project['created_at'] else None,
                        'updated_at': project['updated_at'].isoformat() if project['updated_at'] else None
                    }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(result),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No updates provided'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            project_id = event.get('params', {}).get('id')
            if not project_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Project ID required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute('DELETE FROM scene_projects WHERE id = %s', (project_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
