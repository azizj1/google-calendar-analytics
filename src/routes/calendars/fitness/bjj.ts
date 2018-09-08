import { Router, Response } from 'express';
import * as moment from 'moment';
import calendarApi from '~/api/calendarApi';
import { bjjBegin } from '~/api/calendarQueries';
import util from '~/services/util';
import bjjService from '~/services/bjjService';

const router = Router();
router.use('/', async (_, res: Response, __) => {
    try {
        const classes = await calendarApi.getAllBjjEvents();
        const totalHours = util.totalHours(classes);
        const totalWeeks = moment().diff(bjjBegin, 'weeks', true);
        const response = {
            totalHours,
            totalWeeks,
            totalClasses: classes.length,
            typeBreakdown: {
                noGiHours: bjjService.totalNoGiHours(classes),
                giHours: bjjService.totalGiHours(classes)
            },
            timeBreakdown: {
                morningHours: bjjService.totalMorningHours(classes),
                afternoonHours: bjjService.totalAfternoonHours(classes),
                eveningHours: bjjService.totalEveningHours(classes)
            },
            promotions: bjjService.promotions(classes),
            totalFundamentalHours: bjjService.totalFundamentalHours(classes),
            avgHrsPerWeek: totalHours / totalWeeks,
            avgClassesPerWeek: classes.length / totalWeeks,
            avgHourPerSession: totalHours / classes.length,
            trainingDuration: util.humanize(bjjBegin),
            minHours: util.minHour(classes),
            maxHours: util.maxHour(classes),
            classes: classes.map(c => (
                {...c, start: c.start.toISOString(true), end: c.end.toISOString(true)}
            ))
        };
        res.json(response);
    } catch (err) {
        res.status(500).end(`Error occurred: ${err}`);
    }
});

export default router;
