// tslint:disable:no-var-requires
import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent, IDataEventTime } from '~/models';
import { bjjQuery, sexQuery, singleEvent } from '~/api/calendarQueries';
import bjjService from '~/services/bjjService';
import * as calendarIds from '~/../calendars.json';
import * as creds from '~/../credentials.json';

const CalendarAPI = require('node-google-calendar');
const { private_key, client_email } = creds;
const config = {
    serviceAcctId: client_email,
    timezone: 'UTC-05:00',
    calendarId: calendarIds,
    key: private_key
};

class CalendarApi {
    private calendarApi: any;

    constructor() {
        this.calendarApi = new CalendarAPI(config);
    }

    async getAllBjjEventsRaw() {
        return await this.calendarApi.Events.list(config.calendarId.fitness, bjjQuery) as IDataGoogleCalendarEvent[];
    }

    async getAllBjjEvents() {
        return (await this.getAllBjjEventsRaw())
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

    async getEventFromAll() {
        const ids = Object.keys(calendarIds).map(k => (<{[name: string]: string}>calendarIds)[k]);
        return await Promise.all(
            ids.map(id => this.calendarApi.Events.list(id, singleEvent) as IDataGoogleCalendarEvent[])
        );
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
