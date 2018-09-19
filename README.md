# Google Calendar Analytics
Express.js RESTful API that uses [Google Calendar API](https://developers.google.com/calendar/) to inquire my private calendars.

## Swagger / Demo
Production swagger can be found [here](https://0jhkh4pn4b.execute-api.us-east-1.amazonaws.com/prod/docs/). Dev environment swagger can be found [here](https://27shtszeu6.execute-api.us-east-1.amazonaws.com/dev/docs/). 

## Getting Started
Being a node app, the app has a few prerequisites.

### Prerequisites
* Node v8.10+. The project is deployed to AWS Lambda envrionment with node 8.10, so babel polyfills up to that version. 
* Yarn globally installed (`npm i yarn -g`).
* Access to your private Google Calendar. See [below for instructions](#grant-read-access-to-private-google-calendars).

### Developing
Install all project dependencies
```
yarn
```
Confirm you have `./credentials.json` (see [accessing private calendars](#grant-read-access-to-private-google-calendars)), whether it's downloading it from [Google Cloud Platform](https://console.cloud.google.com) or accessing it from your secrets S3 bucket by doing 
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

**TODO**: If planning on having custom domains for the API, `aws-cli` must also be able to
* AmazonRoute53FullAccess
* AWSCertificateManagerFullAccess
* CloudFrontFullAccess cloudfront:UpdateDistribution on '*' resources.

If you're feeling lazy, attach policies `AmazonAPIGatewayAdministrator`, `IAMFullAccess`, and `AWSLambdaFullAccess` to the user. If you're concerned about security, don't add any policies and just run the deployments. Terraform will error, but it'll inform you what permission is needed to continue. Add that specific permission to the user, and run it again. Do this until Terraform succeeds.

**TODO**: Discuss `terraform destroy`, and how long it can take.

### Dev Environment
```
yarn deploy
```
on macOS, or
```
yarn deploy-win
```
on Windows.

### Prod Environment
```
yarn deploy-prod
```
on macOS, or
```
yarn deploy-prod-win
```
on Windows.

## Grant Read Access to Private Google Calendars
### Get Key JSON File
1. Log into [Google Cloud Platform](https://console.cloud.google.com).
2. Create a project called `google-calendar-analytics`.
3. On the left sidemenu, go to API & Services > Dashboard.
4. Click on `Enable APIs and Services`.
5. Enable `Google Calendar API`.
6. On the new left sidemenu, click on `Credentials.`
7. Create `Service account key`.
    - Sevice account: New service account
    - Service account name: `server-owner`
    - Role: Project > Owner
    - Key type: JSON
    - Click create. A JSON file will be downloaded.
8. Place the downloaded file in root directory (same directory as this README.md).
9. Rename it to `credentials.json`.
10. (Optional) If you have [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) setup with S3 access, you can store the secret in S3 by doing `yarn store-secret`, which you can then later retrieve in a different machine if need be by doing `yarn get-secret`.
    - You'll need to update `./package.json` file appropriately for this to work.

### Share Calendar with Service Account
Navigate to [Google Calendar](https://calendar.google.com) and give the Service account you just created read-only access to your BJJ calendar.
1. Navigate to calendar's "Settings and sharing".
2. Share your BJJ calendar with the `client_email` (of the form `server-owner@*.gserviceaccount.com`) found in the JSON file you downloaded earlier.

    ![Example of calendar share](./docs/calendar-share.png)

3. Scroll all the way down and get the Calendar ID (of the form `*@group.calendar.google.com`).
4. Update `./calendars.json` with your BJJ calendar ID under `fitness`. **Don't** update the keys (e.g., `fitness`), only update the values. If you do want to update the names, also update `./src/api/calendarApi.ts`. 

## License
MIT License

Copyright (c) 2018 Aziz Javed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
