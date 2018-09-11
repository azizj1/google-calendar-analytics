import { Router } from 'express';
import calendars from './calendars';

const routes = Router();
routes.use('/v1/calendars', calendars);
export default routes;
