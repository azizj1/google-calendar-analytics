// tslint:disable:no-var-requires
import * as moment from 'moment';
import { IDataGoogleCalendarEvent, IEvent, IDataEventTime, IBjjClass, Calendar } from '~/models';
import { bjjQuery, singleEvent, wrestlingQuery, consultingQuery, summaryQuery } from '~/api/calendarQueries';
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
            .sort(this.compare);
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

    compare = (a: IEvent, b: IEvent) => {
      // the sooner event appears first in the list
      const timeDiff = a.start.toDate().getTime() - b.start.toDate().getTime();
      // the longer event appears first in the list
      // if a is 5hrs and b is 2hrs, then durationDiff = -3, and so "a"
      // will appear first.
      const durationDiff = b.durationHours - a.durationHours;
      if (timeDiff !== 0) {
        return timeDiff;
      } else if (durationDiff !== 0) {
        return durationDiff;
      } else {
        return this.getCalendarRank(b) - this.getCalendarRank(a);
      }
    }

    // work calendar has highest rank, so when it comes to sorting, if another
    // event is at the same time and duration, then work event will appear
    // first, which isn't' great because that means hours will be detected
    // from the work event, not the lower ranking event.
    getCalendarRank = (a: IEvent) => {
      if (a.calendar === Calendar.Work) {
        return 100;
      } else if (a.calendar === Calendar.Personal) {
        return 0;
      } else {
        return 50;
      }
    }

    toMoment = (d: IDataEventTime) => d.dateTime == null ?
            moment.utc(d.date, 'YYYY-MM-DD') :
            moment.parseZone(d.dateTime, 'YYYY-MM-DDTHH:mm:ssZZ', true)
}

const calendarApi = new CalendarApi();
export default calendarApi;
