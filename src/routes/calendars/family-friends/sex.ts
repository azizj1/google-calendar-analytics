import { Router, Response } from 'express';
import calendarService from '~/services/calendarService';
import calendarUtil from '~/services/calendarUtil';
import { sexBegin } from '~/services/calendarQueries';
import * as moment from 'moment';

const router = Router();
router.use('/', async (_, res: Response, __) => {
    try {
        const sexTimes = await calendarService.getAllSexEvents();
        const totalMins = calendarUtil.totalHours(sexTimes) * 60;
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
