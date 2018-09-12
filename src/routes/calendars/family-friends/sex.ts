import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import util from '~/services/util';
import { sexBegin } from '~/api/calendarQueries';
import * as moment from 'moment';

const routes = Router();
routes.use('/', async (_, res: Response, next: NextFunction) => {
    try {
        const sexTimes = await calendarApi.getAllSexEvents();
        const totalMins = util.totalHours(sexTimes) * 60;
        const totalWeeks = moment().diff(sexBegin, 'weeks', true);
        const response = {
            totalHours: totalMins / 60,
            avgMinsPerWeek: totalMins / totalWeeks,
            avgSexPerWeek: sexTimes.length / totalWeeks,
            avgMinPerSex: totalMins / sexTimes.length
        };
        res.json(response);
    } catch (err) {
		next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
    }
});

export default routes;
