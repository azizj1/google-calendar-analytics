import { Router } from 'express';
import calendars from './calendars';

const routes = Router();
routes.use('/calendars', calendars);
export default routes;
