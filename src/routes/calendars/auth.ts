import { Router, Response, NextFunction } from 'express';
import * as authJson from '~/../auth.json';

const routes = Router();
routes.use('/', async (req, res: Response, next: NextFunction) => {
    const accessKey = req && req.query && req.query.accessKey;
    if (accessKey !== authJson.password)
        return res.status(401).json('Unauthorized');
    next();
});

export default routes;
