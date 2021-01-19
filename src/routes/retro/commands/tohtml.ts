import { Router, Request, Response } from 'express';

const routes = Router();
routes.post('/', async (req: Request, res: Response) => {
  res.json(req.body);
});

export default routes;
