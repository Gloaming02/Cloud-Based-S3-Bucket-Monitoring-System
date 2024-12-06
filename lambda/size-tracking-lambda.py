import boto3
import os
import json
from datetime import datetime


def lambda_handler(event, context):
    # table_name = 'S3-object-size-history0275031'
    table_name = os.environ.get('TABLE_NAME')

    s3_client = boto3.client('s3')
    dynamodb_client = boto3.client('dynamodb')

    for record in event['Records']:
        print("SQS Message:", record['body'])
        sns_message = json.loads(record['body'])
        s3_event = json.loads(sns_message['Message'])

        for s3_record in s3_event.get('Records', []):
            bucket_name = s3_record['s3']['bucket']['name']
            response = s3_client.list_objects_v2(Bucket=bucket_name)
            total_size = sum(obj['Size'] for obj in response.get('Contents', []))
            object_count = len(response.get('Contents', []))
            dynamodb_client.put_item(
                TableName=table_name,
                Item={
                    'BucketName': {'S': bucket_name},
                    'Timestamp': {'S': datetime.now().isoformat()},
                    'TotalSize': {'N': str(total_size)},
                    'NumberOfObjects': {'N': str(object_count)}
                }
            )

    print(f'Total size of {bucket_name} is {total_size} bytes with {object_count} objects.')
    return {
        'statusCode': 200,
        'body': f'Total size of {bucket_name} is {total_size} bytes with {object_count} objects.'
    }
