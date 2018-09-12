import { Router } from 'express';
import ping from './ping';
import healthCheck from './health-check';
import errorTest from './error-test';

const routes = Router();
routes.use('/ping', ping);
routes.use('/health-check', healthCheck);
routes.use('/error-test', errorTest);

export default routes;
