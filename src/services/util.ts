import { IEvent } from '~/models';
import * as moment from 'moment';

export class Utility {
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

    humanize(from: moment.Moment) {
        const to = moment();
        const yearsDiff = to.diff(from, 'years');
        from = from.add(yearsDiff, 'years');

        const monthsDiff = to.diff(from, 'months');
        from = from.add(monthsDiff, 'months');

        const daysDiff = to.diff(from, 'days');
        const pluralize = (val: number, suffix: string) => val < 1 ? '' : `${val} ${suffix}${val > 1 ? 's ' : ' '}`;
        return `${pluralize(yearsDiff, 'year')}${pluralize(monthsDiff, 'month')}${pluralize(daysDiff, 'day')}`
                    .slice(0, -1);
    }
}

const util = new Utility();
export default util;
