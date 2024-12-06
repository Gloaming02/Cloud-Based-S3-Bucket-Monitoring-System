import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export interface MyStackProps extends cdk.StackProps {
  bucketName: string;
  tableName: string;
}

export class PlottingLambdaStack extends cdk.Stack {
  public PLOT_URL: string;

  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const lambda_bucket = "lambda-code-bucket102948";
    const bucket = s3.Bucket.fromBucketName(this, "codebucket",
            lambda_bucket);

    const func2 = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'plotting-lambda.lambda_handler',
      code: lambda.Code.fromBucket(bucket, "plotting-lambda.zip"),
      environment: {'BUCKET_NAME': props.bucketName, 'TABLE_NAME': props.tableName},
      timeout: cdk.Duration.seconds(30),
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'MatplotlibLayer', 
          'arn:aws:lambda:us-east-1:770693421928:layer:Klayers-p39-matplotlib:1')
      ]
    });
    func2.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"));
    func2.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")); 

    const api = new apigateway.RestApi(this, 'PlottingApi', {
      restApiName: 'Plotting Lambda Service',
      description: 'This API triggers the plotting Lambda function.'
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(func2, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    const plotResource = api.root.addResource('plot');
    plotResource.addMethod('GET', lambdaIntegration); 
    this.PLOT_URL = api.urlForPath('/plot');
  }
}



