# Google Calendar Analytics
ExpressJS RESTful API that uses [Google Calendar API](https://developers.google.com/calendar/) to inquire my calendars and provide the following endpoints:

* /calendars/fitness/bjj
* /calendars/family-friends/sex

## Getting Started
Before getting started, make sure you have `yarn` installed globally (`npm i yarn -g`).

Install all project dependencies
```
yarn
```

While developing, kick off watcher for auto-local deploy
```
yarn watch
```

For AWS Lambda deployment, run the following command to generate a `lambda.zip` that you can upload to AWS lambda
```
yarn build
```

**Note**: The handler for your AWS lambda should be `lambda.handler`.