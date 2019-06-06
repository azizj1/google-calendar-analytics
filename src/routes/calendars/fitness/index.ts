import { Router } from 'express';
import bjj from './bjj';

const routes = Router();
routes.use('/', bjj);
export default routes;
