#!/bin/bash

ENV=$1

echo "Determining if custom domain was setup..."
cd ./setup
DOMAIN_NAME="$(terraform output domain_name)"
CERT_ARN="$(terraform output cert_arn)"
if [ -z "$CERT_ARN" ]
then
    echo "No certificate was found in setup/terraform.tfstate, so assuming custom-domain-setup was not conducted."
else
    echo "Certificate found, and domain was set to $DOMAIN_NAME"
fi


echo "Changing to package directory for $ENV environment..."
cd ../environments/$ENV

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false

echo "Applying full terraform manipulation"
# terraform plan -var "domain_name=$DOMAIN_NAME"
terraform apply -var "domain_name=$DOMAIN_NAME" -var "cert_arn=$CERT_ARN" -input=false -auto-approve

echo "It takes awhile for DNS changes to propogate. Check status at https://www.whatsmydns.net/."
cd ../..
