import { Router } from 'express';
import fitness from './fitness';
import consulting from './consulting';
import summary from './summary';

const routes = Router();
routes.use('/fitness', fitness);
routes.use('/consulting', consulting);
routes.use('/summary', summary);

export default routes;
