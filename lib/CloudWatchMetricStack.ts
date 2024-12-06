import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface MyStackProps extends cdk.StackProps {
  loggingLambdaName: string;
  cleanerLambdaArn: string;
}

export class CloudWatchMetricStack extends cdk.Stack {
  
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const logGroupName = '/aws/lambda/' + props.loggingLambdaName;

    const logGroup = logs.LogGroup.fromLogGroupName(this, 'LoggingLambdaLogGroup', logGroupName);

    new logs.MetricFilter(this, 'SizeDeltaMetricFilter', {
      logGroup,
      filterPattern: logs.FilterPattern.exists('$.size_delta'),
      metricNamespace: 'Assignment4App',
      metricName: 'TotalObjectSize', 
      metricValue: '$.size_delta', 
    });

    const totalObjectSizeMetric = new cloudwatch.Metric({
      namespace: 'Assignment4App',
      metricName: 'TotalObjectSize',
      statistic: 'Sum', 
    });

    const alarm = new cloudwatch.Alarm(this, 'TotalObjectSizeAlarm', {
      metric: totalObjectSizeMetric,
      threshold: 20, 
      evaluationPeriods: 1, 
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: 'Alarm when TotalObjectSize metric exceeds 20.',
    });

    const cleanerLambdaFunction = lambda.Function.fromFunctionArn(
      this,
      'CleanerLambdaFunction',
      props.cleanerLambdaArn
    );

    cleanerLambdaFunction.grantInvoke(new iam.ServicePrincipal('cloudwatch.amazonaws.com'));

    alarm.addAlarmAction({
      bind: () => ({
        alarmActionArn: props.cleanerLambdaArn,
      }),
    });

  }
}
