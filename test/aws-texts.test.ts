import { Template } from '@aws-cdk/assertions';
import { App } from '@aws-cdk/core';
import { AwsTextsStack } from '../lib/aws-texts-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/aws-texts-stack.ts
test('SQS Queue Created', () => {
//   const app = new cdk.App();
//     // WHEN
//   const stack = new AwsTexts.AwsTextsStack(app, 'MyTestStack');
//     // THEN
//   const template = Template.fromStack(stack);

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
});

test('EventBus Created', () => {
    // GIVEN
    const app = new App();
    // WHEN
    const stack = new AwsTextsStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.findResources('AWS::Events::EventBus');
    template.hasResourceProperties('AWS::Events::EventBus', {
        Name: 'TextEventBus'
    })
});
