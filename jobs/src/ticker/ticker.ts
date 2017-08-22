
export interface LambdaEventInput {
  key1: string
  key2: string
  key3: string
}

export interface LambdaEventContext {
  done: (error: any, success: string) => void
}

export const handler = (event: LambdaEventInput, context: LambdaEventContext) => {
    console.log('value1 = ' + event.key1);
    console.log('value2 = ' + event.key2);
    console.log('value3 = ' + event.key3);
    context.done('foo', 'Hello World');  // SUCCESS with message
}
