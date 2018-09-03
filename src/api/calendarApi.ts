// tslint:disable:no-var-requires

import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent } from '~/models';
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
        const start = moment(e.start.dateTime);
        const end = moment(e.end.dateTime);
        return {
            start,
            end,
            title: e.summary,
            notes: e.description,
            location: e.location,
            durationHours: end.diff(start, 'hours', true),
            isAllDay: e.start.dateTime == null
        };
    }
}

const calendarApi = new CalendarApi();
export default calendarApi;
