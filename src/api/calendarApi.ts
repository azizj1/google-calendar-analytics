// tslint:disable:no-var-requires
import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent, IDataEventTime, IBjjClass, Calendar } from '~/models';
import { bjjQuery, sexQuery, singleEvent, wrestlingQuery, consultingQuery, summaryQuery } from '~/api/calendarQueries';
import bjjService from '~/services/bjjService';
import * as calendarIds from '~/../calendars.json';
import * as creds from '~/../credentials.json';
import { uniqBy, orderBy, flatMap } from 'lodash';

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
        const bjj = this.calendarApi.Events.list(config.calendarId.fitness, bjjQuery) as IDataGoogleCalendarEvent[];
        const wrestling =
            this.calendarApi.Events.list(config.calendarId.fitness, wrestlingQuery) as IDataGoogleCalendarEvent[];
        const nestedAll = await Promise.all([bjj, wrestling]);
        return uniqBy(nestedAll[0].concat(nestedAll[1]), e => e.id);
    }

    async getAllBjjEvents() {
        const events = (await this.getAllBjjEventsRaw())
            .map(this.toEventModel(Calendar.Fitness))
            .map(bjjService.toBjjClass);
        return orderBy(events, (e: IBjjClass) => e.start.unix(), 'asc');
    }

    async getAllSexEvents() {
        const title = 'ahlam time';
        const data =
            await this.calendarApi.Events.list(config.calendarId.familyFriends, sexQuery) as IDataGoogleCalendarEvent[];
        return data
                .map(this.toEventModel(Calendar.FamilyFriends))
                .filter(e => e.title.toLowerCase().indexOf(title) >= 0);
    }

    async searchConsultingEvents(query: string) {
        const params = { ...consultingQuery, q: query };
        const data =
            await this.calendarApi.Events.list(config.calendarId.consulting, params) as IDataGoogleCalendarEvent[];
        return data.map(this.toEventModel(Calendar.Consulting));
    }

    async getEventFromAll() {
        const ids = Object.keys(calendarIds).map(k => (<{[name: string]: string}>calendarIds)[k]);
        return await Promise.all(
            ids.map(id => this.calendarApi.Events.list(id, singleEvent) as IDataGoogleCalendarEvent[])
        );
    }

    async getEventsFromAllCalendars(since: moment.Moment) {
        const query = { ...summaryQuery, timeMin: since.toISOString( )};
        const ids = Object.keys(calendarIds).map(k => (<{[name: string]: string}>calendarIds)[k]);

        const promises = ids.map(c => this.calendarApi.Events.list(c, query) as IDataGoogleCalendarEvent[]);
        return flatMap((await Promise.all(promises)), (d, i) => d.map(this.toEventModel(i)))
            .filter(e => !e.isAllDay)
            .sort((a, b) => a.start.toDate().getTime() - b.start.toDate().getTime());
    }

    toEventModel = (calendar: Calendar) => (e: IDataGoogleCalendarEvent): IEvent => {
        const start = this.toMoment(e.start);
        const end = this.toMoment(e.end);
        const isAllDay = e.start.dateTime == null;
        return {
            start,
            end,
            isAllDay,
            calendar,
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
