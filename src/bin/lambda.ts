import app from '../app';
import * as awsServerlessExpress from 'aws-serverless-express';
import { Context } from 'aws-lambda';

const server = awsServerlessExpress.createServer(app);

export const handler = (event: any, context: Context) => awsServerlessExpress.proxy(server, event, context);
