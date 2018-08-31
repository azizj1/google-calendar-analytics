import { Router } from 'express';
import fitness from './fitness';

const router = Router();
router.use('/fitness', fitness);
export default router;
