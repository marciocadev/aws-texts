import { Template } from '@aws-cdk/assertions';
import { App, Stack } from '@aws-cdk/core';
import { Function, CfnFunction } from '@aws-cdk/aws-lambda';
import { AwsTextsStack } from '../lib/aws-texts-stack';
import { CfnEventBus } from '@aws-cdk/aws-events';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-texts-stack.ts

test('Snapshot', () => {
    // GIVEN
    const app = new App();
    // WHEN
    const stack = new AwsTextsStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);
    expect(template).toMatchSnapshot();
});

describe('Stack tests', () => {
    let app:App;
    let stack:AwsTextsStack;
    let template:Template;

    beforeAll(() => {
        // GIVEN
        app = new App();
        // WHEN
        stack = new AwsTextsStack(app, 'MyTestStack');
        // THEN
        template = Template.fromStack(stack);
    });

    test('EventBus Created', () => {
        template.findResources('AWS::Events::EventBus');
        template.hasResourceProperties('AWS::Events::EventBus', {
            Name: 'TextEventBus'
        })
    });

    test('Event Rule Created', () => {
        const lambdaLogicalId = stack.resolve((stack.dominantLanguage.node.defaultChild as CfnFunction).logicalId)
        console.log(lambdaLogicalId);

        const eventBusLogicalId = stack.resolve((stack.eventBus.node.defaultChild as CfnEventBus).logicalId);

        template.resourceCountIs('AWS::Events::Rule', 1);
        template.findResources('AWS::Events::Rule');
        template.hasResourceProperties('AWS::Events::Rule', {
            State: 'ENABLED',
            EventPattern: {
                source: ['apigateway'],
                'detail-type': ['text']
            },
            EventBusName: {
                Ref: eventBusLogicalId
            }
            // Targets: [{
            //     Arn: {
            //         'Fn::GetAtt': [
            //             'LambdaD247545B',
            //             'Arn'
            //         ]
            //     },
            //     Id: 'Target0'
            // }]
        });
    });

    test('RespApi Created', () => {
        template.findResources('AWS::ApiGateway::RestApi');
        template.hasResourceProperties('AWS::ApiGateway::RestApi', {
            Name: 'TextApiGateway'
        });
    });
});
