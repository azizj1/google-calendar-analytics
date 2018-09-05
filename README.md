# Google Calendar Analytics
ExpressJS RESTful API that uses [Google Calendar API](https://developers.google.com/calendar/) to inquire my calendars and provide the following endpoints:

* /calendars/fitness/bjj
* /calendars/family-friends/sex

## Getting Started
Being a node app, the app has a couple of prerequisites.

### Prerequisites
* Node v8.10+. The project is deployed to AWS Lambda envrionment with node 8.10, so babel polyfills up to that version. 
* `yarn` globally installed (`npm i yarn -g`).

### Developing
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

## Deployment
The API is deployed to AWS Lambda + API Gateway using Terraform.

### Prerequisites
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* [Terraform 0.11+](https://www.terraform.io/)
* AWS account with high degree of privelages and credentials
