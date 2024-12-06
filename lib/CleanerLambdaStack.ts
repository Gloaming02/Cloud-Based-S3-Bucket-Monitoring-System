import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';


export interface MyStackProps extends cdk.StackProps {
  bucketName: string;
}

export class CleanerLambdaStack extends cdk.Stack {
  public cleanerLambdaArn: string;

  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const lambda_bucket = "lambda-code-bucket102948";
    const bucket = s3.Bucket.fromBucketName(this, "codebucket",
            lambda_bucket);
    const func1 = new lambda.Function(this, 'Function', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'object-cleaner-lambda.lambda_handler',
            code: lambda.Code.fromBucket(bucket, "object-cleaner-lambda.zip"),
            environment: {'BUCKET_NAME': props.bucketName},
            timeout: cdk.Duration.seconds(30)
          });

    func1.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")); 
    this.cleanerLambdaArn = func1.functionArn;

  }
}



