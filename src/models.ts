import * as moment from 'moment';

export interface IDataEventTime {
    dateTime?: string;
    date?: string;
}

export interface IDataGoogleCalendarEvent {
    id: string;
    summary: string;
    description: string;
    created: string;
    location: string;
    start: IDataEventTime;
    end: IDataEventTime;
}

export interface IHealthCheck {
    numberOfCalendars: number;
    numberOfCalendarsRespondedWithEvent: number;
    startTimeUtc: string;
    serverTimeUtc: string;
}

export interface IEvent {
    title: string;
    notes: string;
    location: string;
    start: moment.Moment;
    end: moment.Moment;
    durationHours: number;
    isAllDay: boolean;
    calendar: Calendar;
}

export enum Calendar {
    Personal      = 0,
    Fitness       = 1,
    FamilyFriends = 2,
    Consulting    = 3,
    Work          = 4,
    Goals         = 5
}

export enum BjjClassTime {
    Morning,
    Afternoon,
    Evening,
    Unknown
}

export enum BjjClassType {
    Gi,
    NoGi,
    Unknown
}

export enum BjjClassLevel {
    Fundamental,
    AllLevels,
    Advanced,
    OpenMat,
    Unknown
}

export interface IBjjClass extends IEvent {
    classTime: BjjClassTime;
    type: BjjClassType;
    level: BjjClassLevel;
    taughtBy: string;
    notesTldr: string;
}

export enum BjjBelt {
    White,
    Blue,
    Purple,
    Brown,
    Black
}

export interface IBjjPromotion {
    color: BjjBelt;
    stripes: number;
    date: string;
    timeItTook: string;
    hoursItTook: number;
    isNextPromotion?: boolean;
}
