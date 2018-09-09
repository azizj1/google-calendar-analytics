// tslint:disable:no-var-requires

import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent, IDataEventTime } from '~/models';
import { bjjQuery, sexQuery } from '~/api/calendarQueries';
import { credentials } from '~/api/credentials';
import bjjService from '~/services/bjjService';

const CalendarAPI = require('node-google-calendar');
const { private_key, client_email } = credentials;
const config = {
    serviceAcctId: client_email,
    timezone: 'UTC-05:00',
    calendarId: {
        fitness: 'ehc9erufj4v9qd5fhfcrg99np0@group.calendar.google.com',
        familyFriends: 'nfn39ng7n1d8p0r0snucj6hkk8@group.calendar.google.com'
    },
    key: private_key
};

class CalendarApi {
    private calendarApi: any;

    constructor() {
        this.calendarApi = new CalendarAPI(config);
    }

    async getAllBjjEvents() {
        const data =
            await this.calendarApi.Events.list(config.calendarId.fitness, bjjQuery) as IDataGoogleCalendarEvent[];
        return data
            .map(this.toEventModel)
            .map(bjjService.toBjjClass);
    }

    async getAllSexEvents() {
        const title = 'ahlam time';
        const data =
            await this.calendarApi.Events.list(config.calendarId.familyFriends, sexQuery) as IDataGoogleCalendarEvent[];
        return data
                .map(this.toEventModel)
                .filter(e => e.title.toLowerCase().indexOf(title) >= 0);
    }

    toEventModel = (e: IDataGoogleCalendarEvent): IEvent => {
        const start = this.toMoment(e.start);
        const end = this.toMoment(e.end);
        const isAllDay = e.start.dateTime == null;
        return {
            start,
            end,
            isAllDay,
            title: e.summary,
            notes: e.description,
            location: e.location,
            durationHours: isAllDay ? 0 : end.diff(start, 'hours', true)
        };
    }

    toMoment = (d: IDataEventTime) => d.dateTime == null ?
            moment.utc(d.date, 'YYYY-MM-DD') :
            moment.parseZone(d.dateTime, 'YYYY-MM-DDTHH:mm:ssZZ', true)
}

const calendarApi = new CalendarApi();
export default calendarApi;
