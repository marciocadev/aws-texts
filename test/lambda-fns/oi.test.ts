import {EventBridgeEvent} from 'aws-lambda';
import { handler } from '../../lib/lambda-fns/oi';

describe('Test Oi Lambda', () => {
    test('Get Lambda success invocation', async() => {
        const event:EventBridgeEvent<'text',{message:string}> = {
            detail: {
                message: 'teste'
            }
        } as any;
        const context = {} as any;
        const callback = {} as any;

        const result = await handler(event, context, callback);

        expect(result).toMatchObject({
            message: 'teste'
        });
    });
});