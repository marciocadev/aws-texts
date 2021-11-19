import { EventBridgeEvent } from 'aws-lambda';
import { handler } from '../../../../lib/lambda-fns/comprehend/dominantLanguage';
import { mockClient } from 'aws-sdk-client-mock';
import { ComprehendClient, DetectDominantLanguageCommand } from '@aws-sdk/client-comprehend';

const clientMock = mockClient(ComprehendClient);

describe('Detect language success', () => {

    test('Get Lambda success invocation', async() => {

        const event:EventBridgeEvent<'text',{message:string}> = {
            detail: {
                message: 'Hello World!!!'
            }
        } as any;
        const context = {} as any;

        clientMock.on(DetectDominantLanguageCommand).resolves({
            Languages: { LanguageCode: 'en', Score: 1 }
        } as any);
        const result = await handler(event, context);
    
        expect(result).toMatchObject({
            message: 'Hello World!!!',
            language: { LanguageCode: 'en', Score: 1 } 
        });
    });
});