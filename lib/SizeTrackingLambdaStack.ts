import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface MyStackProps extends cdk.StackProps {
  bucketName: string;
  tableName: string;
  queueArn: string;
  queueUrl: string; 
}

export class SizeTrackingLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const lambda_bucket = "lambda-code-bucket102948";
    const bucket = s3.Bucket.fromBucketName(this, "codebucket",
            lambda_bucket);
    const func1 = new lambda.Function(this, 'Function', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'size-tracking-lambda.lambda_handler',
            code: lambda.Code.fromBucket(bucket, "size-tracking-lambda.zip"),
            environment: {'BUCKET_NAME': props.bucketName, 'TABLE_NAME': props.tableName},
            timeout: cdk.Duration.seconds(30)
          });

    func1.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"));
    func1.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")); 
    //trigger
    // const srcBucket = s3.Bucket.fromBucketName(this, 'SrcBucket', props.bucketName);
    // srcBucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT, new s3n.LambdaDestination(func1));
    // srcBucket.addEventNotification(s3.EventType.OBJECT_REMOVED_DELETE, new s3n.LambdaDestination(func1));

    const queue = sqs.Queue.fromQueueAttributes(this, 'ImportedQueue', {
      queueArn: props.queueArn,
      queueUrl: props.queueUrl,
    });

    func1.addEventSource(new lambdaEventSources.SqsEventSource(queue));

  }
}



