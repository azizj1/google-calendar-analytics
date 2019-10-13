import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import * as moment from 'moment';
import { IEvent, Calendar, ISummaryResponse, SummarySubcategory } from '~/models';

const routes = Router();
routes.use('/', async (_, res: Response, next: NextFunction) => {
    const beginDate = getBeginDate();
    try {
        const events = await calendarApi.getEventsFromAllCalendars(beginDate);
        const utcOffset = events[0].start.utcOffset();
        const threeMonthsAgoInSameTimeZone = getThreeMonthsAgoInSameTimeZone(utcOffset);
        const relevantEvents = events
            .filter(e => e.start >= threeMonthsAgoInSameTimeZone)
            .map(correctDurationForWork)
            .concat();
        const breakdown = getBySubcategory(relevantEvents)
            .map(addStubEventsForPadding(utcOffset))
            .map(getBreakdown)
            .sort((a, b) => a.subcategory.localeCompare(b.subcategory));

        res.json(breakdown);
    } catch (err) {
        next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
    }
});

const getBeginDate = () => moment().utc().startOf('month').subtract(3, 'months').subtract(1, 'day');
const getThreeMonthsAgoInSameTimeZone = (utfOffset: number) => moment()
    .utcOffset(utfOffset)
    .startOf('month')
    .subtract(3, 'months');

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

const addStubEventsForPadding =
    (utcOffset: number) =>
    ({events, subcategory}: {subcategory: SummarySubcategory, events: IEvent[]}) => {
    const beginDate = getBeginDate();
    const threeMonthsAgoInSameTimeZone = getThreeMonthsAgoInSameTimeZone(utcOffset);
    const stubEvents = Array(Math.round(moment().diff(getBeginDate(), 'weeks', true)) + 1)
        .fill(0)
        .map((_, index) => beginDate.clone().add(index, 'weeks').utcOffset(utcOffset).endOf('isoWeek'))
        .filter(m => m >= threeMonthsAgoInSameTimeZone)
        .map(m => ({
            title: 'STUB EVENT',
            notes: 'STUB EVENT',
            location: '',
            start: m,
            end: m,
            durationHours: 0,
            isAllDay: false,
            calendar: events[0].calendar
        }));
    return {
        subcategory,
        events: events.concat(stubEvents).sort((a, b) => a.start.toDate().getTime() - b.start.toDate().getTime())
    };
};

const getBreakdown = ({events, subcategory}: {subcategory: SummarySubcategory, events: IEvent[]}): ISummaryResponse => {
    const totalHours = sum(events, e => e.durationHours);
    return {
        subcategory,
        tree: subcategoryToTree[subcategory],
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

const subcategoryToTree: {[subcategory in SummarySubcategory]: string[] } = {
    'BJJ': ['Fitness', 'BJJ'],
    'Wrestling': ['Fitness', 'Wrestling'],
    'Workout': ['Fitness', 'Workout'],
    'Consulting': ['Work', 'Consulting'],
    'Employment': ['Work', 'Employment'],
    'Learning': ['Growth', 'Learning'],
    'Planning': ['Growth', 'Planning'],
    'FamilyFriends': ['Leisure', 'FamilyFriends'],
    'DaddyDuties': ['Leisure', 'DaddyDuties'],
    'Miscellaneous': ['Miscellaneous']
};

const toTotalHours = ({period, events}: {period: string, events: IEvent[]}) =>
    ({period, totalHours: sum(events, e => e.durationHours)});

const sum = <T>(items: T[], value?: (item: T) => number) =>
    items.reduce((total, curr) => total + (value == null ? (curr as unknown as number) : value(curr)), 0);

const mutableAdd = <T>(map: { [key: string]: T[] }, key: string, item: T) => {
	if (map[key] != null)
		map[key].push(item);
	else
		map[key] = [item];
	return map;
};

const groupBy = <T, E extends string | number>(key: (e: T) => E) =>
    (items: T[]) => items.reduce((map, item) => mutableAdd(map, key(item) + '', item), {} as { [key: string]: T[] });

const byPeriod = (period: 'isoWeek' | 'month') => (events: IEvent[]) => Object.entries(
    groupBy<IEvent, string>(e => e.start.clone().endOf(period).format())(events))
    .map(([period, events]) => ({period, events}));

const getBySubcategory = (events: IEvent[]) => Object.entries(
    groupBy<IEvent, SummarySubcategory>(getSubcategory)(events))
    .map(([subcategory, events]) => ({subcategory: subcategory as SummarySubcategory, events}));

const getSubcategory = (e: IEvent): SummarySubcategory => {
    const title = e.title.toLowerCase();
    switch (e.calendar) {
        case Calendar.Fitness: {
            if (title.indexOf('wrestling') >= 0 || title.indexOf('takedown') >= 0)
                return 'Wrestling';
            if (title.indexOf('bjj') >= 0 || title.indexOf('wrestling') >= 0)
                return 'BJJ';
            return 'Workout';
        }
        case Calendar.Goals: {
            if (title.indexOf('bjj') >= 0 || title.indexOf('wrestling') >= 0)
                return 'BJJ';
            if (title.indexOf('plan') === 0)
                return 'Planning';
            return 'Learning';
        }
        case Calendar.Personal: {
            if (title.indexOf('take care') >= 0 && title.indexOf('noor') >= 0)
                return 'DaddyDuties';
            return 'Miscellaneous';
        }
        case Calendar.Work:
            return 'Employment';
        case Calendar.Consulting:
            return 'Consulting';
        case Calendar.FamilyFriends:
            return 'FamilyFriends';
    }
};

const toWeeklyAverage = ({period, totalHours}: {period: string, totalHours: number}) =>
    ({period, avgHrsPerWeek: totalHours / moment.parseZone(period).daysInMonth() * 7});

export default routes;
