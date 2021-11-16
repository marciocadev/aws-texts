import {EventBridgeHandler} from 'aws-lambda';


export const handler:EventBridgeHandler<
        'text', {message: string}, {message: string}> 
        = async(event, context, callback) => {
    
    const { message } = event.detail;
    
    return {
        message: message
    }
}