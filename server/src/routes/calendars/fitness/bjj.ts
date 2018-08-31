import { Router, Response } from 'express';

const router = Router();
router.use('/', (_, res: Response, __) => res.json({ message: 'Success' }));
export default router;
