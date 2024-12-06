#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3FanoutStack } from '../lib/S3FanoutStack';
import { DynamoDbCreateStack } from '../lib/DynamoDbCreateStack';
import { SizeTrackingLambdaStack } from '../lib/SizeTrackingLambdaStack';
import { PlottingLambdaStack } from '../lib/PlottingLambdaStack';
import { DriverLambdaStack } from '../lib/DriverLambdaStack';
import { LoggingLambdaStack } from '../lib/LoggingLambdaStack';
import { CloudWatchMetricStack } from '../lib/CloudWatchMetricStack';
import { CleanerLambdaStack } from '../lib/CleanerLambdaStack';


const app = new cdk.App();
const s3_stack = new S3FanoutStack(app, 'S3FanoutStack', {
  env: { region: 'us-east-1' }
});

const bucketName = s3_stack.bucketName;
const queueArn1 = s3_stack.queueArn1;
const queueUrl1 = s3_stack.queueUrl1;
const queueArn2 = s3_stack.queueArn2;
const queueUrl2 = s3_stack.queueUrl2;

const dynamodb_stack = new DynamoDbCreateStack(app, 'DynamoDbCreateStack', {
  env: { region: 'us-east-1' }
});

const tableName = dynamodb_stack.tableName;

new SizeTrackingLambdaStack(app, 'SizeTrackingLambdaStack', {
  env: { region: 'us-east-1' },  
  bucketName: bucketName,  
  tableName: tableName,
  queueArn: queueArn1,
  queueUrl: queueUrl1
});

const api_url = new PlottingLambdaStack(app, 'PlottingLambdaStack', {
  env: { region: 'us-east-1' },  
  bucketName: bucketName,  
  tableName: tableName
});

new DriverLambdaStack(app, 'DriverLambdaStack', {
  env: { region: 'us-east-1' },  
  bucketName: bucketName,  
  apiUrl: api_url.PLOT_URL
});


const logging_stack = new LoggingLambdaStack(app, 'LoggingLambdaStack',{
  env: { region: 'us-east-1' },  
  queueArn: queueArn2,
  queueUrl: queueUrl2
})

const cleaner_stack = new CleanerLambdaStack(app, 'CleanerLambdaStack',{
  env: { region: 'us-east-1' },  
  bucketName: bucketName
})
const cleaner_lambda_arn = cleaner_stack.cleanerLambdaArn;
const logging_lambda_Name = logging_stack.lambdaName;

new CloudWatchMetricStack(app, 'CloudWatchMetricStack',{
  env: { region: 'us-east-1' },  
  loggingLambdaName: logging_lambda_Name,
  cleanerLambdaArn: cleaner_lambda_arn
})
