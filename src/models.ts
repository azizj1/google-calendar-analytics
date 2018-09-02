import * as moment from 'moment';

export interface IDataEventTime {
	dateTime: string;
}

export interface IDataGoogleCalendarEvent {
	summary: string;
	description: string;
	location: string;
	start: IDataEventTime;
	end: IDataEventTime;
}

export interface IEvent {
	title: string;
	notes: string;
	location: string;
	start: moment.Moment;
	end: moment.Moment;
	durationHours: number;
}
