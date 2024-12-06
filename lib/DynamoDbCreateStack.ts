import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDbCreateStack extends cdk.Stack {
  public tableName: string;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
	  
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'S3-object-size-history', {
      partitionKey: { name: 'BucketName', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    table.addGlobalSecondaryIndex({
      indexName: 'TotalSizeIndex',
      partitionKey: { name: 'BucketName', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'TotalSize', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
      readCapacity: 5,
      writeCapacity: 5
    });

    console.log(table.tableName);
    console.log(this.region);
    this.tableName = table.tableName;
  }

}

