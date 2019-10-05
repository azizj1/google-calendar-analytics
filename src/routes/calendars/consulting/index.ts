import { Router, Response, NextFunction } from 'express';
import calendarApi from '~/api/calendarApi';
import util from '~/services/util';


const routes = Router();
routes.use('/', async (req, res: Response, next: NextFunction) => {
    const q = req && req.query && req.query.q;
    if (q == null || q.trim() === '')
        return res.status(400).end(`Parameter 'q' is required.`);
    try {
        const events = await calendarApi.searchConsultingEvents(q);
        const totalHours = util.totalHours(events);
        const response = {
            aggregate: {
                totalHours
            },
            events
        };
        res.json(response);
    } catch (err) {
		next(err instanceof Error ? err : new Error(`Error occurred: ${JSON.stringify(err)}`));
    }
});

export default routes;
