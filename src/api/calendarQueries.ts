import * as moment from 'moment';

export const bjjBegin = moment(new Date(2018, 0, 18));
export const bjjQuery = {
    timeMin: bjjBegin.toISOString(),
    timeMax: moment().toISOString(),
    q: 'BJJ',
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(description,end,location,start,summary,created)',
    timeZone: 'America/Chicago',
    maxResults: 2500
};

export const sexBegin = moment(new Date(2017, 3, 0));
export const sexQuery = {
    timeMin: sexBegin.toISOString(),
    timeMax: moment().toISOString(),
    q: 'Ahlam time',
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(description,end,location,start,summary,created)',
    timeZone: 'America/Chicago'
};

export const singleEvent = {
    maxResults: 1
};
