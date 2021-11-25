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
    Goals         = 5,
    TimeWasted    = 6,
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

export interface IDailyPoint {
    period: string;
    hours: number;
}

export interface IWeeklyPoint {
    period: string;
    totalHours: number;
}

export interface IMonthlyPoint {
    period: string;
    avgHrsPerWeek: number;
}

export interface IQuarterlyPoint {
    from: string;
    to: string;
    totalHours: number;
    weeklyAvg: number;
}

export interface ISleepEvent {
    wentToBedAt: string;
    wokeUpAt: string;
    duration: number;
}

export interface ISummaryItem {
    subcategory: SummarySubcategory;
    tree: string[];
    weekly: IWeeklyPoint[];
    monthly: IMonthlyPoint[];
    quarterly: IQuarterlyPoint;
}

export interface ISleepSummary {
    subcategory: SummarySubcategory;
    tree: string[];
    weekly: {
        period: string;
        dailyAvg: number;
        totalHours: number;
    }[];
    monthly: {
        period: string;
        dailyAvg: number;
    }[];
    quarterly: {
        from: string;
        to: string;
        dailyAvg: number;
    };
    last20Events: ISleepEvent[];
}

export interface ISummaryResponse {
    items: ISummaryItem[];
    sleep: ISleepSummary;
}

export type SummarySubcategory =
    'BJJ' |
    'Wrestling' |
    'Workout' |
    'Planning' |
    'Learning' |
    'DaddyDuties' |
    'Miscellaneous' |
    'FamilyFriends' |
    'Consulting' |
    'Employment' |
    'Sleep' |
    'TimeWasted';

export interface IRetroEntry {
  date: string;
  isWorkday: boolean;
  workedTowardGoals: boolean;
  accomplishedLevel: number;
  feelLevel: number;
  didWell: string;
  needsImprovement: string;
  gratefulFor: string;
}

export interface IRetroSummary {
  entries: IRetroEntry[];
}
