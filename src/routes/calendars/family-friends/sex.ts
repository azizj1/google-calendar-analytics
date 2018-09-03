import { Router, Response } from 'express';
import calendarApi from '~/api/calendarApi';
import util from '~/services/util';
import { sexBegin } from '~/api/calendarQueries';
import * as moment from 'moment';

const router = Router();
router.use('/', async (_, res: Response, __) => {
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
        res.json(err);
    }
});

export default router;
