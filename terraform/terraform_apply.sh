#!/bin/bash

ENV=$1
BUCKET_NAME=$(cat s3_bucket_name.txt)
echo "S3 bucket name $BUCKET_NAME obtained from s3_bucket_name.txt"

if [ -z "$ENV" ]
then
    echo "Environment not specified. Command: ./terraform_apply.sh <env>, where env = 'dev' or 'prod'"
    exit 1
fi

echo "Determining if custom domain was setup..."
cd ./custom-domain-setup/certificate/
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"
DOMAIN_NAME="$(terraform output domain_name)"
CERT_ARN="$(terraform output cert_arn)"
DO_DOMAIN_SETUP=0

if [ -z "$CERT_ARN" ]
then
    echo "No certificate ARN was found in custom-domain-setup/certificate/terraform.tfstate, so assuming custom-domain-setup was not run."
else
    echo "Certificate found, and domain was set to $DOMAIN_NAME"
    DO_DOMAIN_SETUP=1
fi

echo "Changing to package directory for $ENV environment..."
cd ../../environments/$ENV

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

echo "Applying full terraform manipulation"
terraform apply -var "domain_name=$DOMAIN_NAME" -var "cert_arn=$CERT_ARN" -var "do_domain_setup=$DO_DOMAIN_SETUP" -input=false -auto-approve

if [ ! -z "$CERT_ARN" ]
then
    echo "It takes awhile for DNS changes to propogate (approx 30mins). Check status at https://www.whatsmydns.net/."
    echo ""
fi

cd ../..
