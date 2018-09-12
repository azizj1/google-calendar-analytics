import { Router, NextFunction } from 'express';

const routes = Router();
routes.use('/', async (_, __, next: NextFunction) =>
	Promise.resolve().then(function() {
		throw new Error('Error test');
	}).catch(next)
);
export default routes;
