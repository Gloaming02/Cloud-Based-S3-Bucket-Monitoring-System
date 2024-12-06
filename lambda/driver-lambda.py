import boto3
import time
import requests
import os

def lambda_handler(event, context):
    s3_client = boto3.client('s3')
    # bucket_name = 'testbucket0275031'
    bucket_name = os.environ.get('BUCKET_NAME')
    api_url = os.environ.get('API_URL')
    s3_client.put_object(Bucket=bucket_name, Key='assignment1.txt', Body='Empty Assignment 1')
    time.sleep(2.5)  
    
    s3_client.put_object(Bucket=bucket_name, Key='assignment2.txt', Body='Empty Assignment 2222222222')
    time.sleep(2.5)  
    
    # s3_client.delete_object(Bucket=bucket_name, Key='assignment1.txt')
    # time.sleep(2.5)  
    
    s3_client.put_object(Bucket=bucket_name, Key='assignment3.txt', Body='33')
    time.sleep(2.5)
    
#    api_url = "https://b8l5t6qtph.execute-api.us-east-1.amazonaws.com/test"
    response = requests.get(api_url)
    
    return {
        'statusCode': 200,
        'body': response.text
    }
