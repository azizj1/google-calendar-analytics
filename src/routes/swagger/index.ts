import { Router } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDoc from '~/../swagger.json';
import * as gatewayStages from '~/../gateway-stages.json';

const swaggerBasePathUpdate = (swaggerDoc: any, env: string | undefined) => {
    if (env === 'development' || env === 'production')
        swaggerDoc.basePath = (<any>gatewayStages)[env] + swaggerDoc.basePath;
    return swaggerDoc;
};

const routes = Router();
routes.use('/', swaggerUi.serve);
routes.get('/', swaggerUi.setup(swaggerBasePathUpdate(swaggerDoc, process.env.NODE_ENV)));

export default routes;
