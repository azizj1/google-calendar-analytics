# Google Calendar Analytics
ExpressJS RESTful API that uses [Google Calendar API](https://developers.google.com/calendar/) to inquire my calendars and provide the following endpoints:

* /calendars/fitness/bjj
* /calendars/family-friends/sex

## Getting Started
Being a node app, the app has a couple of prerequisites.

### Prerequisites
* Node v8.10+. The project is deployed to AWS Lambda envrionment with node 8.10, so babel polyfills up to that version. 
* Yarn globally installed (`npm i yarn -g`).
* Access to your private Google Calendar
  - Log into [Google Cloud Platform](https://console.cloud.google.com).
  - Create a project called `google-calendar-analytics`.
  - On the left sidemenu, go to API & Services > Dashboard.
  - Click on `Enable APIs and Services`.
  - Enable `Google Calendar API`.
  - On the new left sidemenu, click on `Credentials.`
  - Create `Service account key`.
    - Sevice account: New service account
    - Service account name: `server-owner`
    - Role: Project > Owner
    - Key type: JSON
    - Click create. A JSON file will be downloaded.
  - Place the downloaded file in root directory (same directory as this README.md).
  - Rename it to `credentials.json`.
  - (Optional) If you have [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) setup with S3 access, you can store the secret in S3 by doing `yarn store-secret`, which you can then later retrieve in a different machine if need be by doing `yarn get-secret`.
    - You'll need to update `./package.json` file appropriately for this to work.
  - Navigate to [Google Calendar](https://calendar.google.com) and give the Service account you just created read-only access to your BJJ calendar.
    - Navigate to calendar's "Settings and sharing".
    - Share your BJJ calendar with the `client_email` (of the form `server-owner@*.gserviceaccount.com`) found in the JSON file you downloaded earlier.
       ![Example of calendar share](./docs/calendar-share.png)
    - Scroll all the way down and get the Calendar ID (of the form `*@group.calendar.google.com`).
    - Update `./calendars.json` with your BJJ calendar ID under `fitness`. **Don't** update the keys (e.g., `fitness`), only update the values. If you do want to update the names, also update `./src/api/calendarApi.ts`. 

### Developing
Install all project dependencies
```
yarn
```
Confirm you have `./credentials.json` (see [Prerequisites](#Prerequisites)), whether it's downloading it from [Google Cloud Platform](https://console.cloud.google.com) or accessing it from your secrets S3 bucket by doing 
```
yarn get-secret
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
User `aws-cli` must have the ablity to
* Create IAM roles
* Create API Gateways
* Create Lambdas
* Store/retrieve files from S3 (optional - for API secrets)

If you're feeling lazy, attach policies `AmazonAPIGatewayAdministrator`, `IAMFullAccess`, and `AWSLambdaFullAccess` to the user. If you're concerned about security, don't add any policies and just run the deployments. Terraform will error, but it'll inform you what permission is needed to continue. Add that specific permission to the user, and run it again. Do this until Terraform succeeds.

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
