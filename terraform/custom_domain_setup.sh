#!/bin/bash

BUCKET_NAME=$(cat state_storage_s3_bucket_name.txt)
cd ./custom-domain-setup/main-zone/

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

echo "Applying full terraform manipulation"
terraform apply -auto-approve

echo "Created AWS Route53 Zone for '$DOMAIN_NAME' with the name servers printed above."
echo "Manually change your domain registration service's name servers to the ones above, so certificates can be requested by AWS."
echo ""
read -p "When done, press enter to continue."

DOMAIN_NAME="$(terraform output domain_name)"
cd ../certificate/

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false

echo "Applying full terraform manipulation"
terraform apply -var "domain_name=$DOMAIN_NAME" -auto-approve -backend-config="bucket=$BUCKET_NAME"

cd ../
