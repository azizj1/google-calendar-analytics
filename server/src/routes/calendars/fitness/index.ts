import { Router } from 'express';
import bjj from './bjj';

const router = Router();
router.use('/bjj', bjj);
export default router;
