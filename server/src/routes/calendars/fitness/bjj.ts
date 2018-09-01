import { Router, Response } from 'express';
import * as fs from 'fs';
import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent } from '~/models';

// tslint:disable-next-line:no-var-requires
const CalendarAPI = require('node-google-calendar');
const { private_key, client_email } = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));
const config = {
    serviceAcctId: client_email,
    timezone: 'UTC-05:00',
    calendarId: {
        fitness: 'ehc9erufj4v9qd5fhfcrg99np0@group.calendar.google.com'
    },
    key: private_key
};
const calendarApi = new CalendarAPI(config);
const bjjBegin = moment(new Date(2018, 0, 18));

const params = {
    timeMin: bjjBegin.toISOString(),
    timeMax: moment().toISOString(),
    q: 'BJJ',
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(description,end,location,start,summary)'
};

const router = Router();
router.use('/', async (_, res: Response, __) => {
    try {
        const data = await calendarApi.Events.list(config.calendarId.fitness, params) as IDataGoogleCalendarEvent[];
        const classes = data.map(e => {
            const start = moment(e.start.dateTime);
            const end = moment(e.end.dateTime);
            return {
                start,
                end,
                title: e.summary,
                notes: e.description,
                location: e.location,
                durationHours: end.diff(start, 'hours', true)
            } as IEvent;
        });
        const totalHours = getTotal(classes);
        const totalNoGiHours = getTotal(classes.filter(m => m.title.indexOf('NoGi') > -1));
        const totalNoGiAndGiHours = getTotal(classes.filter(m => m.title.indexOf('Gi') > -1));
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
            minHours: classes.reduce((acc, curr) => curr.durationHours < acc ? curr.durationHours : acc,
                Number.MAX_SAFE_INTEGER),
            maxHours: classes.reduce((acc, curr) => curr.durationHours > acc ? curr.durationHours : acc,
                Number.MIN_SAFE_INTEGER),
            classes: classes.reverse()
        };
        res.json(response);
    } catch (err) {
        res.json(err);
    }
});

function getTotal(events: IEvent[]) {
    return events.reduce((acc, curr) => acc + curr.durationHours, 0);
}

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
