import { Router } from 'express';
import toHtmlCommand from './tohtml';

const routes = Router();
routes.use('/commands/renderHtml', toHtmlCommand);

export default routes;
