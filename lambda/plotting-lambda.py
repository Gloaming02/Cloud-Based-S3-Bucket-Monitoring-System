
import os
os.environ['MPLCONFIGDIR'] = '/tmp'

import boto3
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from io import BytesIO
import json

def lambda_handler(event, context):

    dynamodb_client = boto3.client('dynamodb')
    # bucket_name = 'testbucket0275031'
    # table_name = 'S3-object-size-history0275031'
    bucket_name = os.environ.get('BUCKET_NAME')
    table_name = os.environ.get('TABLE_NAME')

    current_time = datetime.now()
    ten_seconds_ago = current_time - timedelta(seconds=10)

    current_time_iso = current_time.isoformat()
    ten_seconds_ago_iso = ten_seconds_ago.isoformat()

    response = dynamodb_client.query(
        TableName=table_name,
        KeyConditionExpression='#bucket_name = :bucket_name AND #timestamp BETWEEN :start_time AND :end_time',
        ExpressionAttributeNames={
            '#bucket_name': 'BucketName',
            '#timestamp': 'Timestamp'
        },
        ExpressionAttributeValues={
            ':bucket_name': {'S': bucket_name},
            ':start_time': {'S': ten_seconds_ago_iso},
            ':end_time': {'S': current_time_iso}
        }
    )

    response_items = response['Items']

    timestamps = []
    total_sizes = []

    for item in response_items:
        timestamps.append(datetime.fromisoformat(item['Timestamp']['S']))
        total_sizes.append(int(item['TotalSize']['N']))

    response = dynamodb_client.query(
        TableName=table_name,
        IndexName='TotalSizeIndex',
        KeyConditionExpression='BucketName = :bucket_name AND TotalSize > :size',
        ExpressionAttributeValues={
            ':bucket_name': {'S': bucket_name},
            ':size': {'N': '0'}
        },
        ScanIndexForward=False,
        Limit=1
    )
    max_size = 0
    items = response.get('Items', [])
    for item in items:
        max_size = int(item['TotalSize']['N'])

    plt.cla()
    plt.plot(timestamps, total_sizes, marker='o', label='bucket size')
    plt.axhline(y=max_size, color='blue', linestyle='-', label='historical high')
    print("!!!!!!!!!!!!!!!!!!!!!")
    print(max_size)
    plt.title(bucket_name)
    plt.xlabel('timestamps')
    plt.ylabel('total size')
    plt.legend()
    plt.tight_layout()

    image_stream = BytesIO()
    plt.savefig(image_stream, format='png')
    image_stream.seek(0)
    object_key = 'plot.png'
    s3_client = boto3.client('s3')

    s3_client.put_object(Bucket=bucket_name, Key=object_key, Body=image_stream, ContentType='image/png')

    s3_url = f'https://{bucket_name}.s3.amazonaws.com/{object_key}'

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': "successfully",
            's3_url': s3_url
        })
    }
