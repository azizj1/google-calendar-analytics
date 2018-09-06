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

While developing, kick off watcher with hot-reload
```
yarn watch
```

To just run the server locally, 
```
yarn start
```
## Deployment
The API is deployed to AWS Lambda + API Gateway using Terraform.

### Prerequisites
Download the following and have it available in `PATH` or `/usr/local/bin/`:
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
* [Terraform 0.11+](https://www.terraform.io/)

Setup a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-multiple-profiles.html) called **aws-cli** by
```
aws configure --profile aws-cli
```

Next, run
```
yarn build
```
to do a production build of the app and have it copied over to the right destination.

### Dev Environment
Navigate to `./terraform/` and run either
```
./terraform_apply.sh dev
```
on macOS, or
```
terraform_apply.bat dev
```
on Windows.

### Prod Environment
Navigate to `./terraform/` and run either
```
./terraform_apply.sh prod
```
on macOS, or
```
terraform_apply.bat prod
```
on Windows.
