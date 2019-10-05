import * as moment from 'moment';

export const bjjBegin = moment(new Date(2018, 0, 18));
export const bjjQuery = {
    timeMin: bjjBegin.toISOString(),
    timeMax: moment().toISOString(),
    q: 'BJJ',
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id, description,end,location,start,summary,created)',
    timeZone: 'America/Chicago',
    maxResults: 2500
};

export const wrestlingBegin = moment(new Date(2019, 5, 16));
export const wrestlingQuery = {
    timeMin: wrestlingBegin.toISOString(),
    timeMax: moment().toISOString(),
    q: 'wrestling',
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id, description,end,location,start,summary,created)',
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
    fields: 'items(id, description,end,location,start,summary,created)',
    timeZone: 'America/Chicago'
};

export const singleEvent = {
    maxResults: 1
};

export const consultingBegin = moment(new Date(2017, 0, 0));
export const consultingQuery = {
    timeMin: consultingBegin.toISOString(),
    timeMax: moment().toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id, description,end,location,start,summary,created)',
    timeZone: 'America/Chicago'
};

export const summaryQuery = {
    timeMax: moment().toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(id, description,end,location,start,summary,created)',
    timeZone: 'America/Chicago',
    maxResults: 2500
};
