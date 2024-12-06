import boto3
import os

def lambda_handler(event, context):
    bucket_name = os.environ.get('BUCKET_NAME')

    s3_client = boto3.client('s3')

    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        if 'Contents' not in response:
            print(f"No objects found in bucket {bucket_name}")
            return {"status": "No objects to delete"}

        objects = response['Contents']
        largest_object = max(objects, key=lambda obj: obj['Size'])

        largest_object_key = largest_object['Key']
        largest_object_size = largest_object['Size']

        s3_client.delete_object(Bucket=bucket_name, Key=largest_object_key)

        print(f"Deleted object: {largest_object_key}, size: {largest_object_size} bytes")

        return {
            "status": "Object deleted",
            "object_name": largest_object_key,
            "object_size": largest_object_size
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"status": "Error", "message": str(e)}
