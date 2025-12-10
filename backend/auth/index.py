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
                email TEXT,
                is_admin BOOLEAN DEFAULT FALSE,
                profile_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Создаем супер-админа kotatsu если его нет
        cur.execute("SELECT id FROM users WHERE username = 'kotatsu'")
        if not cur.fetchone():
            kotatsu_hash = hashlib.sha256('kotatsu'.encode()).hexdigest()
            default_profile = {
                'name': 'Kotatsu',
                'createdAt': '2025-01-01T00:00:00.000Z',
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
            cur.execute(
                "INSERT INTO users (username, password_hash, is_admin, profile_data) VALUES (%s, %s, TRUE, %s)",
                ('kotatsu', kotatsu_hash, json.dumps(default_profile))
            )
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                username = body_data.get('username', '').strip().lower()
                password = body_data.get('password', '')
                email = body_data.get('email', '').strip() or None
                
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
                    "INSERT INTO users (username, password_hash, email, profile_data) VALUES (%s, %s, %s, %s) RETURNING id",
                    (username, password_hash, email, json.dumps(default_profile))
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
                    "SELECT id, profile_data, is_admin FROM users WHERE username = %s AND password_hash = %s",
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
                
                user_id, profile_data, is_admin = result
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'userId': user_id,
                        'username': username,
                        'profile': profile_data,
                        'isAdmin': is_admin or False
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
            
            elif action == 'set_admin':
                admin_username = body_data.get('admin_username', '').strip().lower()
                target_username = body_data.get('target_username', '').strip().lower()
                make_admin = body_data.get('make_admin', False)
                
                if not admin_username or not target_username:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Требуются оба логина'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем, является ли запрашивающий админом
                cur.execute("SELECT is_admin FROM users WHERE username = %s", (admin_username,))
                result = cur.fetchone()
                if not result or not result[0]:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Нет прав администратора'}),
                        'isBase64Encoded': False
                    }
                
                # Нельзя забрать права у kotatsu
                if target_username == 'kotatsu' and not make_admin:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Невозможно забрать права у супер-админа'}),
                        'isBase64Encoded': False
                    }
                
                # Обновляем права
                cur.execute(
                    "UPDATE users SET is_admin = %s WHERE username = %s RETURNING id",
                    (make_admin, target_username)
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
            
            elif action == 'get_all_users':
                admin_username = body_data.get('admin_username', '').strip().lower()
                
                # Проверяем, является ли запрашивающий админом
                cur.execute("SELECT is_admin FROM users WHERE username = %s", (admin_username,))
                result = cur.fetchone()
                if not result or not result[0]:
                    return {
                        'statusCode': 403,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Нет прав администратора'}),
                        'isBase64Encoded': False
                    }
                
                # Получаем всех пользователей
                cur.execute("SELECT username, is_admin, created_at FROM users ORDER BY created_at DESC")
                users = []
                for row in cur.fetchall():
                    users.append({
                        'username': row[0],
                        'isAdmin': row[1] or False,
                        'createdAt': row[2].isoformat() if row[2] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            elif action == 'reset_password':
                email = body_data.get('email', '').strip()
                
                if not email:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email обязателен'}),
                        'isBase64Encoded': False
                    }
                
                # Проверяем существование email
                cur.execute("SELECT username FROM users WHERE email = %s", (email,))
                result = cur.fetchone()
                
                if not result:
                    # Не раскрываем, существует ли email
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'message': 'Если email найден, инструкции отправлены'}),
                        'isBase64Encoded': False
                    }
                
                username = result[0]
                
                # Генерируем временный пароль
                import random
                import string
                temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
                temp_hash = hashlib.sha256(temp_password.encode()).hexdigest()
                
                # Обновляем пароль
                cur.execute("UPDATE users SET password_hash = %s WHERE username = %s", (temp_hash, username))
                
                # В реальной системе здесь отправка email
                # Пока возвращаем временный пароль в ответе (только для разработки!)
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'Пароль сброшен',
                        'tempPassword': temp_password,
                        'username': username
                    }),
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