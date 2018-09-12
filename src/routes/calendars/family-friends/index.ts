import { Router } from 'express';
import sex from './sex';

const routes = Router();
routes.use('/sex', sex);
export default routes;
