import { Router } from 'express';
import fitness from './fitness';
import familyFriends from './family-friends';

const router = Router();
router.use('/fitness', fitness);
router.use('/family-friends', familyFriends);

export default router;
