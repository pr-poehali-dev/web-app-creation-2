import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с визуальной новеллой в базе данных
    GET / - получить новеллу
    PUT / - обновить новеллу (требуется admin=true в query)
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    # Подключение к БД
    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            # Получить новеллу (всегда берём самую последнюю)
            cursor.execute('SELECT data FROM novels ORDER BY updated_at DESC LIMIT 1')
            row = cursor.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Novel not found'}),
                    'isBase64Encoded': False
                }
            
            novel_data = row[0]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(novel_data),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Проверка admin права
            query_params = event.get('queryStringParameters', {}) or {}
            is_admin = query_params.get('admin') == 'true'
            
            if not is_admin:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin access required'}),
                    'isBase64Encoded': False
                }
            
            # Обновить новеллу
            body_data = json.loads(event.get('body', '{}'))
            
            # Удаляем все старые записи и создаём новую
            cursor.execute('DELETE FROM novels')
            cursor.execute(
                "INSERT INTO novels (data, updated_at) VALUES (%s, CURRENT_TIMESTAMP)",
                (json.dumps(body_data),)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cursor.close()
        conn.close()
