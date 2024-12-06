import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface MyStackProps extends cdk.StackProps {
  queueArn: string;
  queueUrl: string; 
}

export class LoggingLambdaStack  extends cdk.Stack {
  public lambdaName: string;

  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const lambda_bucket = "lambda-code-bucket102948";
    const bucket = s3.Bucket.fromBucketName(this, "codebucket",
            lambda_bucket);
    const func1 = new lambda.Function(this, 'Function', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'logging-lambda.lambda_handler',
            code: lambda.Code.fromBucket(bucket, "logging-lambda.zip"),
            // environment: {'BUCKET_NAME': props.bucketName, 'TABLE_NAME': props.tableName},
            timeout: cdk.Duration.seconds(30)
          });

    func1.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLogsFullAccess")); 

          
    const queue = sqs.Queue.fromQueueAttributes(this, 'loggingQueue', {
      queueArn: props.queueArn,
      queueUrl: props.queueUrl,
    });

    func1.addEventSource(new lambdaEventSources.SqsEventSource(queue));
    this.lambdaName = func1.functionName;
  }
}
