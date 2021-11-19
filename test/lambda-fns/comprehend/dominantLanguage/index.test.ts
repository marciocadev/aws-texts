import { EventBridgeEvent } from 'aws-lambda';
import { handler } from '../../../../lib/lambda-fns/comprehend/dominantLanguage';
import { DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend';

jest.mock('@aws-sdk/client-comprehend', () => {  
    class MockComprehendClient {
        send() {
            return {Languages: { LanguageCode: 'en', Score: 1 } }
        }
    }
    return {
        ComprehendClient: MockComprehendClient,
        DetectDominantLanguageCommand: jest.fn().mockImplementation(() => { return {} })
    }
})

describe('Detect language success', () => {

    test('Get Lambda success invocation', async() => {

        const event:EventBridgeEvent<'text',{message:string}> = {
            detail: {
                message: 'Hello World!!!'
            }
        } as any;
        const context = {} as any;
        const result = await handler(event, context);

        expect(DetectDominantLanguageCommand).toBeCalledTimes(1);
        expect(result).toMatchObject({
            message: 'Hello World!!!',
            language: { LanguageCode: 'en', Score: 1 } 
        });
    });
});