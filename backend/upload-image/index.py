import json
import base64
import boto3
import os
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Загрузка изображения в S3 хранилище
    Args: event - dict с httpMethod, body (base64 изображение и имя файла)
    Returns: HTTP response с URL загруженного файла
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    
    if 'image' not in body_data or 'filename' not in body_data:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing image or filename'}),
            'isBase64Encoded': False
        }
    
    image_base64 = body_data['image']
    filename = body_data['filename']
    
    image_data = base64.b64decode(image_base64)
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    
    file_ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    unique_filename = f"uploads/{uuid.uuid4()}.{file_ext}"
    
    content_type = 'image/jpeg'
    if file_ext.lower() == 'png':
        content_type = 'image/png'
    elif file_ext.lower() == 'gif':
        content_type = 'image/gif'
    elif file_ext.lower() == 'webp':
        content_type = 'image/webp'
    
    s3.put_object(
        Bucket='files',
        Key=unique_filename,
        Body=image_data,
        ContentType=content_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{unique_filename}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'url': cdn_url}),
        'isBase64Encoded': False
    }
