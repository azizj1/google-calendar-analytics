import { Router, Response } from 'express';
import * as moment from 'moment';
import calendarService from '~/services/calendarService';
import { bjjBegin } from '~/services/calendarQueries';
import calendarUtil from '~/services/calendarUtil';

const router = Router();
router.use('/', async (_, res: Response, __) => {
    try {
        const classes = await calendarService.getAllBjjEvents();
        const totalHours = calendarUtil.totalHours(classes);
        const totalNoGiHours = calendarUtil.totalHours(classes.filter(m => m.title.indexOf('NoGi') > -1));
        const totalNoGiAndGiHours = calendarUtil.totalHours(classes.filter(m => m.title.indexOf('Gi') > -1));
        const totalGiHours = totalNoGiAndGiHours - totalNoGiHours;
        const totalWeeks = moment().diff(bjjBegin, 'weeks', true);
        const response = {
            totalHours,
            totalNoGiHours,
            totalGiHours,
            avgHrsPerWeek: totalHours / totalWeeks,
            avgClassesPerWeek: classes.length / totalWeeks,
            averageHourPerSession: totalHours / classes.length,
            trainingDuration: humanize(bjjBegin),
            minHours: calendarUtil.minHour(classes),
            maxHours: calendarUtil.maxHour(classes),
            classes: classes.reverse()
        };
        res.json(response);
    } catch (err) {
        res.json(err);
    }
});

function humanize(from: moment.Moment) {
    const to = moment();
    const yearsDiff = to.diff(from, 'years');
    from = from.add(yearsDiff, 'years');

    const monthsDiff = to.diff(from, 'months');
    from = from.add(monthsDiff, 'months');

    const daysDiff = to.diff(from, 'days');
    const pluralize = (val: number, suffix: string) => val < 1 ? '' : `${val} ${suffix}${val > 1 ? 's ' : ' '}`;
    return `${pluralize(yearsDiff, 'year')}${pluralize(monthsDiff, 'month')}${pluralize(daysDiff, 'day')}`.slice(0, -1);
}
export default router;
