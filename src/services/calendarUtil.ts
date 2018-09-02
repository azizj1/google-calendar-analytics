import { IEvent } from '~/models';

export class CalendarUtil {
    totalHours(events: IEvent[]) {
        return events.reduce((acc, curr) => acc + curr.durationHours, 0);
    }

    minHour(events: IEvent[]) {
        return events.reduce((acc, curr) => curr.durationHours < acc ? curr.durationHours : acc,
            Number.MAX_SAFE_INTEGER);
    }

    maxHour(events: IEvent[]) {
        return events.reduce((acc, curr) => curr.durationHours > acc ? curr.durationHours : acc,
            Number.MIN_SAFE_INTEGER);
    }
}

const calendarUtil = new CalendarUtil();
export default calendarUtil;
