import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import * as moment from 'moment';
import { IEvent, Calendar, ISummaryResponse, SummarySubcategory, ISummaryItem, ISleepSummary } from '~/models';
import auth from './auth';

const routes = Router();
routes.use('/', auth);
routes.use('/', async (_, res: Response, next: NextFunction) => {
    const beginDate = getBeginDate();
    try {
        const events = await calendarApi.getEventsFromAllCalendars(beginDate);
        const utcOffset = events[events.length - 1].start.utcOffset();
        const threeMonthsAgoInSameTimeZone = getThreeMonthsAgoInSameTimeZone(utcOffset);

        const relevantEvents = events
            .filter(e => e.start >= threeMonthsAgoInSameTimeZone)
            .map(correctDurationForWork)
            .map(fixTimezone(utcOffset)); // change all events to same timezone
        const summaryResponse = getBySubcategory(relevantEvents)
            .map(addStubEventsForPadding(utcOffset))
            .map(addHoursSlept)
            .map(getBreakdown)
            .sort((a, b) => a.subcategory.localeCompare(b.subcategory))
            .reduce(toSummaryResponse, {} as Partial<ISummaryResponse>);

        res.json(summaryResponse);
    } catch (err) {
        next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
    }
});

const getBeginDate = () => moment().utc().startOf('month').subtract(3, 'months').subtract(1, 'day');
const getThreeMonthsAgoInSameTimeZone = (utfOffset: number) => moment()
    .utcOffset(utfOffset)
    .startOf('month')
    .subtract(3, 'months');

const correctDurationForWork1 = (currEvent: IEvent, currIdx: number, allEvents: IEvent[]) => {
  for (
      let i = currIdx + 1;
      i < EventSource.length && allEvents[i].start.isBetween(currEvent.start, currEvent.end, 'minute', '[)');
      i++) {
    // write code here.
  }
};

const correctDurationForWork = (workEvent: IEvent, index: number, events: IEvent[]) => {
    if (workEvent.calendar !== Calendar.Work || !isFullDayWorkEvent(workEvent))
        return workEvent;
    // 1pm    -------------->      10pm
    // |-----someOtherEvent----|
    //                     ||=====workEvent=====||
    for (let currIndex = index - 1;
        currIndex >= 0 && workEvent.start.isBetween(events[currIndex].start, events[currIndex].end, 'minute', '[)');
        currIndex--) {
        // in case this happens:
        // |-------------someOtherEvent-----------------|
        //                     ||=====workEvent=====||
        workEvent.durationHours -= Math.min(
            events[currIndex].end.diff(workEvent.start, 'hours', true),
            workEvent.end.diff(workEvent.start, 'hours', true));
    }

    // 1pm    -------------->      10pm
    //    ||=====workEvent=====||
    //            |-----someOtherEvent----|
    for (let currIndex = index + 1;
        currIndex < events.length && events[currIndex].start.isBetween(workEvent.start, workEvent.end, 'minute', '[)');
        currIndex++) {
        workEvent.durationHours -= Math.min(
            workEvent.end.diff(events[currIndex].start, 'hours', true),
            events[currIndex].end.diff(events[currIndex].start, 'hours', true));
    }

    return workEvent;
};

const fixTimezone = (toTimezone: number) => (event: IEvent) => {
    event.start.utcOffset(toTimezone);
    event.end.utcOffset(toTimezone);
    return event;
};

const isFullDayWorkEvent = (event: IEvent) =>
    event.title.toLowerCase() === 'google' ||
    event.title.toLowerCase() === 'google wfh';

const STUB_TITLE = 'STUB EVENT';
const addStubEventsForPadding =
    (utcOffset: number) =>
    ({subcategory, events}: {subcategory: SummarySubcategory, events: IEvent[]}) => {
    const beginDate = getBeginDate();
    const threeMonthsAgoInSameTimeZone = getThreeMonthsAgoInSameTimeZone(utcOffset);
    const stubEvents = Array(Math.round(moment().diff(getBeginDate(), 'weeks', true)) + 1)
        .fill(0)
        .map((_, index) => beginDate.clone().add(index, 'weeks').utcOffset(utcOffset).endOf('isoWeek'))
        .filter(m => m >= threeMonthsAgoInSameTimeZone)
        .map(m => ({
            title: STUB_TITLE,
            notes: STUB_TITLE,
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

const addHoursSlept = ({subcategory, events}: {subcategory: SummarySubcategory, events: IEvent[]}) => {
    if (!isSleepSubcategory(subcategory))
        return { subcategory, events };
    const sleepEvents = events
        .filter(isSleepEvent)
        .reduce((newEvents, curr, index, array) => {
            const wentToBed = curr;
            const wokeUp = array[index + 1];
            if (
                wentToBed.title.toLowerCase() !== 'get ready for bed' ||
                wokeUp == null ||
                wokeUp.title.toLowerCase() !== 'wake up')
                return newEvents; // i.e., we don't care about current event

            // from when the 'get ready to bed' event ends to when 'wake up' starts.
            const duration = wokeUp.start.diff(wentToBed.end, 'hours', true);
            // the day you wake up is NOT the day you slept. You slept the day before. Then make it 12am because
            // there's no better time to set the time to. The end event will be 12am + durationHours
            // Using wentToBed.end as the 'start' is problematic because you may go to bed at 12am or later, which
            // counts as the following day Using wokeUp.subtract(1) solves that problem.
            const eventStart = wokeUp.start.clone().subtract(1, 'day').startOf('day');
            newEvents.push({
                title: 'Sleeping',
                notes: '',
                location: '',
                start: eventStart,
                end: eventStart.clone().add(duration, 'hours'),
                durationHours: duration,
                isAllDay: false,
                calendar: Calendar.Personal
            });
            return newEvents;
        }, [] as IEvent[]);
    return { subcategory, events: sleepEvents };
};

const getBreakdown = (params: {subcategory: SummarySubcategory, events: IEvent[]}): ISummaryItem | ISleepSummary => {
    const { subcategory, events } = params;
    const totalHours = sum(events, e => e.durationHours);
    const breakdown = {
        subcategory,
        tree: subcategoryToTree[subcategory],
        weekly: byPeriod('isoWeek')(events).map(toTotalHours),
        monthly: byPeriod('month')(events)
            .map(toTotalHours)
            .map(toWeeklyAverage)
            .filter(isCurrentOrPastMonth),
        quarterly: {
            from: events[0].start.format('MMMM Do, YYYY'),
            to: events[events.length - 1].end.format('MMMM Do, YYYY'),
            totalHours,
            weeklyAvg: totalHours / (moment().diff(events[0].start, 'days', true)) * 7
        }
    };
    if (isSleepSubcategory(subcategory))
        return {
            subcategory: breakdown.subcategory,
            tree: breakdown.tree,
            weekly: breakdown.weekly.map(w => ({...w, dailyAvg: w.totalHours / 7})),
            monthly: breakdown.monthly.map(m => ({period: m.period, dailyAvg: m.avgHrsPerWeek / 7})),
            quarterly: {
                to: breakdown.quarterly.to,
                from: breakdown.quarterly.from,
                dailyAvg: breakdown.quarterly.weeklyAvg / 7
            },
            last20Events: events.slice(-20).map(e => ({
                wentToBedAt: e.start.format(),
                wokeUpAt: e.end.format(),
                duration: e.durationHours
            }))
        };
    return breakdown;
};

const toSummaryResponse = (response: Partial<ISummaryResponse>, item: ISummaryItem | ISleepSummary) => {
    if (isSleepSummary(item))
        response.sleep = item;
    else if (response.items != null)
        response.items.push(item);
    else
        response.items = [item];
    return response;
};

// we don't want to include data for months that haven't happeened yet, so filter out months in the future.
const isCurrentOrPastMonth = ({period}: {period: string}) => {
    const momentPeriod = moment.parseZone(period, moment.ISO_8601);
    const today = moment().utcOffset(momentPeriod.utcOffset());
    return momentPeriod.month() <= today.month() || momentPeriod.year() < today.year();
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
    'Miscellaneous': ['Miscellaneous'],
    'Sleep': ['Miscellaneous', 'Sleep'],
    'TimeWasted': ['Miscellaneous', 'TimeWasted'],
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
            if (isSleepEvent(e))
                return 'Sleep';
            return 'Miscellaneous';
        }
        case Calendar.Work:
            return 'Employment';
        case Calendar.Consulting:
            return 'Consulting';
        case Calendar.FamilyFriends:
            return 'FamilyFriends';
        case Calendar.TimeWasted:
            return 'TimeWasted';
    }
};

const isSleepEvent = (e: IEvent) =>
    e.title.toLowerCase() === 'wake up' || e.title.toLowerCase() === 'get ready for bed';

const isSleepSubcategory = (subcategory: string) => subcategory === 'Sleep';
const isSleepSummary = (item: ISummaryItem | ISleepSummary): item is ISleepSummary =>
    isSleepSubcategory(item.subcategory) && (<ISleepSummary>item).last20Events != null;

const toWeeklyAverage = ({period, totalHours}: {period: string, totalHours: number}) => {
    const periodMoment = moment.parseZone(period, moment.ISO_8601);
    // for current month, get number of days that have passed thus far.
    // for previous monts, get the number of days in that month (28, 30, 31)
    const daysInMonth = periodMoment.isSameOrAfter(moment(), 'days')
        ? moment().utcOffset(periodMoment.utcOffset()).date()
        : periodMoment.daysInMonth();
    return ({period, avgHrsPerWeek: totalHours / daysInMonth * 7});

};

export default routes;
