import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import { IHealthCheck } from '~/models';
import * as calendarIds from '~/../calendars.json';
import * as moment from 'moment';

const startTimeUtc = moment.utc().toISOString(true);
const routes = Router();
routes.use('/', async (_, res: Response, next: NextFunction) => {
	try {
		const events = await calendarApi.getEventFromAll();
		res.json({
			startTimeUtc,
			serverTimeUtc: moment.utc().toISOString(true),
			numberOfCalendars: Object.keys(calendarIds).length,
			numberOfCalendarsRespondedWithEvent: events.length
		} as IHealthCheck);
	} catch (err) {
		next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
	}
});
export default routes;
