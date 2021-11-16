import * as cdk from '@aws-cdk/core';
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { RestApi, Integration, IntegrationType, IntegrationOptions } from '@aws-cdk/aws-apigateway';
import { EventBus, IEventBus, Rule } from '@aws-cdk/aws-events';
import { Function, Runtime, Code, IFunction } from '@aws-cdk/aws-lambda';
import { LambdaFunction, SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { StateMachine, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';

export class AwsTextsStack extends cdk.Stack {
  lambda: IFunction;
  eventBus: IEventBus;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.lambda = new Function(this, 'Lambda', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lib/lambda-fns'),
      handler: 'oi.handler'
    });

    const waitTask = new Wait(this, 'WaitUntil', {
      time: WaitTime.duration(cdk.Duration.seconds(10))//.timestampPath('$.detail.at')
    });
    const lambdaTask = new LambdaInvoke(this, 'LambdaInvoke', {
      lambdaFunction: this.lambda,
      outputPath: '$.Payload'
    });

    const stateMachine = new StateMachine(this, 'TextStateMachine', {
      definition: waitTask.next(lambdaTask)
    });

    this.eventBus = new EventBus(this, 'TextEventBus', { 
      eventBusName: 'TextEventBus' 
    });
    new Rule(this, 'LambdaProcessorRule', {
      eventBus: this.eventBus,
      eventPattern: {source:['apigateway'], detailType:['text']},
      targets: [
      //  new LambdaFunction(this.lambda)
        new SfnStateMachine(stateMachine)
      ]
    });
    const apigwEventBusRole = new Role(this, 'ApiGatewayEventBusRole', {
      assumedBy: new ServicePrincipal('apigateway'),
      inlinePolicies: {
        putEvents: new PolicyDocument({
          statements: [new PolicyStatement({
            actions: ['events:PutEvents'],
            resources: [this.eventBus.eventBusArn]
          })]
        })
      }
    });

    const options:IntegrationOptions = {
      credentialsRole: apigwEventBusRole,
      requestParameters: {
        "integration.request.header.X-Amz-Target": "'AWSEvents.PutEvents'",
        "integration.request.header.Content-Type": "'application/x-amz-json-1.1'"
      },
      requestTemplates: {
        "application/json": `{"Entries": [
          {"Source": "apigateway", 
          "Detail": "$util.escapeJavaScript($input.body)", 
          "DetailType": "text", 
          "EventBusName": "${this.eventBus.eventBusName}"}]}`
      },
      integrationResponses: [{
        statusCode: "200",
        responseTemplates: {"application/json": ""}
      },
      {
        statusCode: "400",
        responseTemplates: {"application/json": JSON.stringify(
          { state: 'error', message: "$util.escapeJavaScript($input.path('$.errorMessage'))" })}
      }]
    };
    const gw = new RestApi(this, 'TextApiGateway', {deployOptions: {stageName: 'dev'}});
    gw.root.addMethod('POST', new Integration({
        type: IntegrationType.AWS,
        uri: 'arn:aws:apigateway:us-east-1:events:path//',
        integrationHttpMethod: 'POST',
        options:options
      }),
      {
        methodResponses: [{statusCode: "200"}, {statusCode: "400"}]
      }
    );

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsTextsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
