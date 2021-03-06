import { Router } from 'express';
import calendars from './calendars';
import diagnostics from './diagnostics';
import swagger from './swagger';
import retro from './retro/commands';

const routes = Router();
routes.use('/v1/calendars', calendars);
routes.use('/v1/retro', retro);
routes.use('/v1', diagnostics);
routes.use('/docs', swagger);

export default routes;
