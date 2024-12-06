import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';

export class S3FanoutStack extends cdk.Stack {
  public bucketName: string;
  public queueArn1: string; 
  public queueUrl1: string; 
  public queueArn2: string; 
  public queueUrl2: string; 

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const b = new s3.Bucket(this, 'TestBucket',{
    	versioned: false,
	    removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.bucketName = b.bucketName;
    console.log(b.bucketName);

    //create sqs and sns with subscription
    const topic = new sns.Topic(this, 'TestBuckTopic', {
      displayName: 'SNS Topic for S3 Events from TestBuck',
    });

    const queue = new sqs.Queue(this, 'TestBuckQueue', {
      visibilityTimeout: cdk.Duration.seconds(30), 
    });

    topic.addSubscription(new subscriptions.SqsSubscription(queue));


    const queue2 = new sqs.Queue(this, 'LoggingQueue', {
      visibilityTimeout: cdk.Duration.seconds(30), 
    });

    topic.addSubscription(new subscriptions.SqsSubscription(queue2));

    b.addEventNotification(
      s3.EventType.OBJECT_CREATED, 
      new s3Notifications.SnsDestination(topic)
    );

    b.addEventNotification(
      s3.EventType.OBJECT_REMOVED, 
      new s3Notifications.SnsDestination(topic)
    );

    this.queueArn1 = queue.queueArn;
    this.queueUrl1 = queue.queueUrl;
    this.queueArn2 = queue2.queueArn;
    this.queueUrl2 = queue2.queueUrl;
  }
}
