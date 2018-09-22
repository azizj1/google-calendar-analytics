#!/bin/bash

BUCKET_NAME=$(cat s3_bucket_name.txt)
echo "S3 bucket name $BUCKET_NAME obtained from s3_bucket_name.txt"

# Create main route53 zone
cd ./custom-domain-setup/main-zone/
rm ./.terraform/terraform.tfstate

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

echo "Applying full terraform manipulation"
terraform apply -auto-approve

DOMAIN_NAME="$(terraform output domain_name)"
echo "Created AWS Route53 Zone for '$DOMAIN_NAME' with the name servers printed above."
echo "Manually change your domain registration service's name servers to the ones above, so certificates can be requested by AWS."
echo ""
read -p "When done, press enter to continue."

# Create certificate
cd ../certificate/
rm ./.terraform/terraform.tfstate

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

echo "Applying full terraform manipulation"
terraform apply -var "domain_name=$DOMAIN_NAME" -auto-approve

cd ../
