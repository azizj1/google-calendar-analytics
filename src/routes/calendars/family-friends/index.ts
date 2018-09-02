import { Router } from 'express';
import sex from './sex';

const router = Router();
router.use('/sex', sex);
export default router;
