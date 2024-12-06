import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface MyStackProps extends cdk.StackProps {
  bucketName: string;
  apiUrl: string;
}

export class DriverLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const lambda_bucket = "lambda-code-bucket102948";
    const bucket = s3.Bucket.fromBucketName(this, "codebucket",
            lambda_bucket);

    const func3 = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'driver-lambda.lambda_handler',
      code: lambda.Code.fromBucket(bucket, "driver-lambda.zip"),
      environment: {'BUCKET_NAME': props.bucketName, 'API_URL': props.apiUrl},
      timeout: cdk.Duration.seconds(30),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'RequestsLayer', 
            'arn:aws:lambda:us-east-1:770693421928:layer:Klayers-p39-requests:19')
      ]
    });
    func3.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")); 
  }
}



