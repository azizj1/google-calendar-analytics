import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import * as swaggerDoc from '~/../swagger.json';
import chalk from 'chalk';
import routes from './routes';

logger.token('datetime', _ => `[${chalk.cyan((new Date()).toLocaleString())}]`);
logger.token('status', (req : express.Request) => {
    const status = req.res && req.res.statusCode || 0;
    switch (true) {
        case(status < 199):
            return status + '';
        case(status < 299):
            return chalk.green(status + '');
        case(status < 399):
            return chalk.cyan(status + '');
        case(status < 499):
            return chalk.yellow(status + '');
        default:
            return chalk.red(status + '');
    }
});

const app = express();
app.use(cors());
app.use(logger(':datetime :method :url :status :response-time ms - :res[content-length] bytes'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/', routes);

// catch 404 and forward to error handler
app.use((_, __, next: express.NextFunction) => {
    const err = new Error('Resource not found')as any;
    err.status = 404;
    next(err);
});

// error handlers development error handler will print stacktrace notice how
// this middleware has four parameters
if (app.get('env') === 'development') {
    app.use((err : any, _: express.Request, res : express.Response, __: any) => {
        console.log(err.message);
        res.status(err.status || 500);
        res.json({message: err.message, error: err, stack: err.stack});
    }); // notice how it doesn't have a next(), meaning if in dev, the middleware below will be added but never called
}

// production error handler no stacktraces leaked to user
app.use((err : any, _ : express.Request, res : express.Response, __ : any) => {
    console.log(err.message);
    res.status(err.status || 500);
    res.json({message: err.message});
});

export default app;
