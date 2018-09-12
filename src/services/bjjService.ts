import { IEvent, IBjjClass, BjjClassTime, BjjClassType, BjjClassLevel, BjjBelt, IBjjPromotion } from '~/models';
import util from '~/services/util';
import { bjjBegin } from '~/api/calendarQueries';
import * as moment from 'moment';

export class BJJService {
    toBjjClass = (event: IEvent): IBjjClass => ({
        ...event,
        classTime: this.classTime(event),
        type: this.classType(event),
        level: this.classLevel(event)
    })

    classTime(event: IEvent): BjjClassTime {
        if (event.isAllDay) return BjjClassTime.Unknown;
        const hr = event.start.hour();
        switch (true) {
            case (hr <= 9): return BjjClassTime.Morning;
            case (hr > 9 && hr <= 16): return BjjClassTime.Afternoon;
            default: return BjjClassTime.Evening;
        }
    }

    classType(event: IEvent): BjjClassType {
        if (event.isAllDay) return BjjClassType.Unknown;
        if (event.title.match(/\bgi\b/i)) return BjjClassType.Gi;
        return BjjClassType.NoGi;
    }

    classLevel(event: IEvent): BjjClassLevel {
        if (event.isAllDay) return BjjClassLevel.Unknown;
        if (event.title.toLowerCase().indexOf('fundamental') >= 0) return BjjClassLevel.Fundamental;
        if (event.title.toLowerCase().indexOf('advance') >= 0) return BjjClassLevel.Advanced;
        if (event.title.toLowerCase().indexOf('open mat') >= 0) return BjjClassLevel.OpenMat;
        return BjjClassLevel.AllLevels;
    }

    totalMorningHours(classes: IBjjClass[]) {
        return classes.filter(c => c.classTime === BjjClassTime.Morning).reduce(this.sum, 0);
    }

    sum = (acc: number, curr: IEvent) => acc + curr.durationHours;

    totalEveningHours(classes: IBjjClass[]) {
        return classes.filter(c => c.classTime === BjjClassTime.Evening).reduce(this.sum, 0);
    }

    totalAfternoonHours(classes: IBjjClass[]) {
        return classes.filter(c => c.classTime === BjjClassTime.Afternoon).reduce(this.sum, 0);
    }

    totalAllLevelsHours(classes: IBjjClass[]) {
        return classes.filter(c => c.level === BjjClassLevel.AllLevels).reduce(this.sum, 0);
    }

    totalNoGiHours(classes: IBjjClass[]) {
        return classes.filter(c => c.type === BjjClassType.NoGi).reduce(this.sum, 0);
    }

    totalGiHours(classes: IBjjClass[]) {
        return classes.filter(c => c.type === BjjClassType.Gi).reduce(this.sum, 0);
    }

    promotions(classes: IBjjClass[]): IBjjPromotion[] {
        const promotions = classes
                .filter(c => c.title.toLowerCase().indexOf('bjj promotion') >= 0)
                .map((c, i, arr) => {
                    const attrs = c.title.split(':')[1].split('-');
                    const prev = arr[i - 1];
                    return {
                        color: (<any>BjjBelt)[attrs[0]],
                        stripes: parseInt(attrs[2], 10),
                        date: c.start.toISOString(true),
                        timeItTook: util.daysDiff(prev ? prev.start : bjjBegin, c.start),
                        hoursItTook: classes
                            .filter(c1 => c1.start < c.start && (!prev || c1.start >= prev.start))
                            .reduce(this.sum, 0)
                    };
                });
        const last = promotions[promotions.length - 1];
        const lastPromoDate = last ? moment.parseZone(last.date, moment.ISO_8601, true) : bjjBegin;
        const today = moment().utcOffset(lastPromoDate.utcOffset());
        const next: IBjjPromotion = {
            color: !last ? BjjBelt.White : last.stripes === 4 ? last.color + 1 : last.color,
            stripes: last ? (last.stripes + 1) % 5 : 1,
            date: today.toISOString(true),
            timeItTook: util.daysDiff(lastPromoDate, today),
            hoursItTook: classes.filter(c1 => c1.start >= lastPromoDate && c1.start < today).reduce(this.sum, 0),
            isNextPromotion: true
        };
        return promotions.concat(next);
    }
}

const bjjService = new BJJService();
export default bjjService;
