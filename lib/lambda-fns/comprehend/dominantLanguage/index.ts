import { EventBridgeEvent, Context } from 'aws-lambda';
import { ComprehendClient, DetectDominantLanguageCommand, 
    DetectDominantLanguageCommandInput, DetectDominantLanguageCommandOutput } from '@aws-sdk/client-comprehend';

const client = new ComprehendClient({region: process.env.AWS_DEFAULT_REGION});

export const handler = 
        async(event: EventBridgeEvent<'text', {message:string}>, context: Context) => {
    
    const { message } = event.detail;
    let result = {};

    try {
        const params:DetectDominantLanguageCommandInput = {Text: message}
        const data:DetectDominantLanguageCommandOutput = await client.send(
            new DetectDominantLanguageCommand(params)
        );

        result = {
            message: message,
            language: data.Languages
        }
        console.log(result);
    } catch (error) {
        console.log(error);
    }

    return result
}
