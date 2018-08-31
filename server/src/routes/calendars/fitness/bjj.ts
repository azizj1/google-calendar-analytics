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
        const models = data.map(e => {
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
        const totalHours = getTotal(models);
        const totalNoGiHours = getTotal(models.filter(m => m.title.indexOf('NoGi') > -1));
        const totalNoGiAndGiHours = getTotal(models.filter(m => m.title.indexOf('Gi') > -1));
        const totalGiHours = totalNoGiAndGiHours - totalNoGiHours;
        const response = {
            totalHours,
            totalNoGiHours,
            totalGiHours,
            avgHrsPerWeek: totalHours / moment().diff(bjjBegin, 'weeks', true),
            averageHourPerSession: totalHours / models.length,
            trainingDuration: moment.duration(bjjBegin.diff(moment(), 'hours', true), 'hours').humanize(),
            minHours: models.reduce((acc, curr) => curr.durationHours < acc ? curr.durationHours : acc, Number.MAX_SAFE_INTEGER),
            maxHours: models.reduce((acc, curr) => curr.durationHours > acc ? curr.durationHours : acc, Number.MIN_SAFE_INTEGER),
            models
        };
        res.json(response);
    } catch (err) {
        res.json(err);
    }
});

function getTotal(events: IEvent[]) {
    return events.reduce((acc, curr) => acc + curr.durationHours, 0);
}
export default router;
