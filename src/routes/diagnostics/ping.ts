import { Router, Response } from 'express';

const routes = Router();
routes.use('/', (_, res: Response, __) => res.status(200).json('pong'));
export default routes;
