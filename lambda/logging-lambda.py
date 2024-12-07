import boto3
import os

lambda_function_name = os.getenv('AWS_LAMBDA_FUNCTION_NAME')
log_group_name ="/aws/lambda/" + lambda_function_name

import json

logs_client = boto3.client('logs')

def get_object_size_from_logs(object_name, log_group_name):
    try:
        response = logs_client.filter_log_events(
            logGroupName=log_group_name,
            filterPattern=f'"{object_name}"'
        )
        for event in response.get('events', []):
            message = json.loads(event['message'])
            if message.get('object_name') == object_name and 'size_delta' in message:
                return message['size_delta']
    except Exception as e:
        print(f"Error querying logs for object {object_name}: {str(e)}")
        print(f"Log group '{log_group_name}' does not exist.")
    return None 

def lambda_handler(event, context):

    for record in event['Records']:
        sns_message = json.loads(record['body'])
        s3_event = json.loads(sns_message['Message'])

        for s3_record in s3_event.get('Records', []):
            bucket_name = s3_record['s3']['bucket']['name']
            object_key = s3_record['s3']['object']['key']

            if s3_record['eventName'].startswith('ObjectCreated'):
                object_size = s3_record['s3']['object']['size']
                log_entry = {
                    "object_name": object_key,
                    "size_delta": object_size
                }
            elif s3_record['eventName'].startswith('ObjectRemoved'):
                object_size = get_object_size_from_logs(object_key, log_group_name)
                log_entry = {
                    "object_name": object_key,
                    "size_delta": -int(object_size) if object_size else "Unknown"
                }
            else:
                continue

            print(json.dumps(log_entry))
