import { IEvent, IBjjClass, BjjClassTime, BjjClassType, BjjClassLevel } from '~/models';

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

    totalFundamentalHours(classes: IBjjClass[]) {
        return classes.filter(c => c.level === BjjClassLevel.Fundamental).reduce(this.sum, 0);
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
}

const bjjService = new BJJService();
export default bjjService;
