"""
Авторизация и регистрация пользователей визуальной новеллы.
Хранит профили пользователей в БД и позволяет входить по логину/паролю.
"""

import json
import os
import hashlib
import psycopg2
import psycopg2.extras

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ['DATABASE_URL']
        conn = psycopg2.connect(dsn)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Создаем таблицу при первом запуске
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                profile_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                username = body_data.get('username', '').strip().lower()
                password = body_data.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                if len(username) < 3:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Логин должен быть минимум 3 символа'}),
                        'isBase64Encoded': False
                    }
                
                if len(password) < 4:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пароль должен быть минимум 4 символа'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем существование пользователя
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Логин уже занят'}),
                        'isBase64Encoded': False
                    }
                
                # Создаем хеш пароля
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                # Создаем дефолтный профиль
                default_profile = {
                    'name': username,
                    'createdAt': body_data.get('createdAt', ''),
                    'totalReadTime': 0,
                    'completedEpisodes': [],
                    'achievements': [],
                    'bookmarks': [],
                    'collectedItems': [],
                    'metCharacters': [],
                    'currentEpisodeId': 'ep1',
                    'currentParagraphIndex': 0,
                    'readParagraphs': [],
                    'usedChoices': [],
                    'activePaths': []
                }
                
                # Сохраняем пользователя
                cur.execute(
                    "INSERT INTO users (username, password_hash, profile_data) VALUES (%s, %s, %s) RETURNING id",
                    (username, password_hash, json.dumps(default_profile))
                )
                user_id = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'userId': user_id,
                        'username': username,
                        'profile': default_profile
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                username = body_data.get('username', '').strip().lower()
                password = body_data.get('password', '')
                
                if not username or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Логин и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                # Проверяем пользователя
                cur.execute(
                    "SELECT id, profile_data FROM users WHERE username = %s AND password_hash = %s",
                    (username, password_hash)
                )
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный логин или пароль'}),
                        'isBase64Encoded': False
                    }
                
                user_id, profile_data = result
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'userId': user_id,
                        'username': username,
                        'profile': profile_data
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'save_profile':
                username = body_data.get('username', '').strip().lower()
                profile_data = body_data.get('profile')
                
                if not username or not profile_data:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Логин и данные профиля обязательны'}),
                        'isBase64Encoded': False
                    }
                
                # Обновляем профиль
                cur.execute(
                    "UPDATE users SET profile_data = %s, updated_at = NOW() WHERE username = %s RETURNING id",
                    (json.dumps(profile_data), username)
                )
                result = cur.fetchone()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }