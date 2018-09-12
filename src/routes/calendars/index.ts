import { Router } from 'express';
import fitness from './fitness';
import familyFriends from './family-friends';

const routes = Router();
routes.use('/fitness', fitness);
routes.use('/family-friends', familyFriends);

export default routes;
