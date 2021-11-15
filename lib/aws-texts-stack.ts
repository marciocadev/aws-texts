import * as cdk from '@aws-cdk/core';
// import * as sqs from '@aws-cdk/aws-sqs';
import { EventBus } from '@aws-cdk/aws-events';

export class AwsTextsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new EventBus(this, 'TextEventBus', { eventBusName: 'TextEventBus' });
    console.log(eventBus.eventBusName);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsTextsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
