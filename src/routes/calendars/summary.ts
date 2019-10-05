import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import * as moment from 'moment';
import { IEvent, Calendar } from '~/models';

const routes = Router();
routes.use('/', async (_, res: Response, next: NextFunction) => {
    const beginDate = moment().startOf('month').subtract(3, 'months');
    try {
        const summary = (await calendarApi.getEventsFromAllCalendars(beginDate)).map(correctDurationForWork);
        const breakdown = getByCategory(summary).map(getBreakdown);

        res.json(breakdown);
    } catch (err) {
        next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
    }
});

const correctDurationForWork = (event: IEvent, index: number, events: IEvent[]) => {
    if (event.calendar !== Calendar.Work || !isFullDayWorkEvent(event))
        return event;
    for (let currIndex = index - 1;
        currIndex >= 0 && event.start.isBetween(events[currIndex].start, events[currIndex].end, 'minute', '[)');
        currIndex--) {
        event.durationHours -= Math.min(
            events[currIndex].end.diff(event.start, 'hours', true),
            event.end.diff(event.start, 'hours', true));
    }

    for (let currIndex = index + 1;
        currIndex < events.length && events[currIndex].start.isBetween(event.start, event.end, 'minute', '[)');
        currIndex++) {
        event.durationHours -= Math.min(
            event.end.diff(events[currIndex].start, 'hours', true),
            events[currIndex].end.diff(events[currIndex].start, 'hours', true));
    }

    return event;
};

const isFullDayWorkEvent = (event: IEvent) =>
    event.title.toLowerCase() === 'direct supply' ||
    event.title.toLowerCase() === 'direct supply wfh';

const mutableAdd = <T>(map: { [key: string]: T[] }, key: string, item: T) => {
	if (map[key] != null)
		map[key].push(item);
	else
		map[key] = [item];
	return map;
};

const groupBy = <T, E extends string | number>(key: (e: T) => E) =>
    (items: T[]) => items.reduce((map, item) => mutableAdd(map, key(item) + '', item), {} as { [key: string]: T[] });

const getByCategory = (events: IEvent[]) => Object.entries(
    groupBy<IEvent, string>(getCategory)(events))
    .map(([calendar, events]) => ({calendar, events}));

const getCategory = (e: IEvent) => {
    const title = e.title.toLowerCase();
    if (e.calendar === Calendar.Fitness) {
        if (title.indexOf('bjj') >= 0 || title.indexOf('wrestling') >= 0)
            return 'BJJ';
        return 'Workout';
    }
    if (e.calendar === Calendar.Goals) {
        if (title.indexOf('bjj') >= 0 || title.indexOf('wrestling') >= 0)
            return 'BJJ';
        if (title.indexOf('plan') === 0)
            return 'Planning';
        return 'Learning';
    }
    if (e.calendar === Calendar.Personal) {
        if (title.indexOf('take care') >= 0 && title.indexOf('noor') >= 0)
            return 'Daddy Duties';
        return 'Miscellaneous';
    }
    return Calendar[e.calendar];
};

const getBreakdown = ({events, calendar}: {calendar: string, events: IEvent[]}) => {
    const totalHours = sum(events, e => e.durationHours);
    return {
        calendar,
        weekly: byPeriod('isoWeek')(events).map(toTotalHours),
        monthly: byPeriod('month')(events).map(toTotalHours).map(toWeeklyAverage),
        quarterly: {
            from: events[0].start.format('MMMM Do, YYYY'),
            to: events[events.length - 1].end.format('MMMM Do, YYYY'),
            totalHours,
            weeklyAvg: totalHours / (moment().diff(events[0].start, 'days', true)) * 7
        }
    };
};

const toTotalHours = ({period, events}: {period: string, events: IEvent[]}) =>
    ({period, totalHours: sum(events, e => e.durationHours)});

const sum = <T>(items: T[], value?: (item: T) => number) =>
    items.reduce((total, curr) => total + (value == null ? (curr as unknown as number) : value(curr)), 0);

const byPeriod = (period: 'isoWeek' | 'month') => (events: IEvent[]) => Object.entries(
    groupBy<IEvent, string>(e => e.start.startOf(period).toISOString())(events))
    .map(([period, events]) => ({period, events}));

const toWeeklyAverage = ({period, totalHours}: {period: string, totalHours: number}) =>
    ({period, avgHrsPerWeek: totalHours / moment(period).daysInMonth() * 7});

export default routes;
