#!/bin/bash

BUCKET_NAME=$(cat s3_bucket_name.txt)
echo "S3 bucket name $BUCKET_NAME obtained from s3_bucket_name.txt"

# Destroy certificate
cd ./custom-domain-setup/certificate/

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

DOMAIN_NAME="$(terraform output domain_name)"

echo "Destroying full terraform manipulation"
terraform destroy -var "domain_name=$DOMAIN_NAME" -auto-approve
echo "Destroyed certificate for '*.$DOMAIN_NAME.'"

# Destroy main route53 zone
cd ../main-zone/

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"

echo "Destroying full terraform manipulation"
terraform destroy -var "domain_name=$DOMAIN_NAME" -auto-approve

echo "Destroyed AWS Route53 Zone for '$DOMAIN_NAME'."
echo "Manually change your domain registration service's name servers to its defaults."
echo ""

cd ../
