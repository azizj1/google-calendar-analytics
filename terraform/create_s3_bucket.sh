#!/bin/bash

BUCKET_NAME=$(cat s3_bucket_name.txt)
echo "S3 bucket name $BUCKET_NAME obtained from s3_bucket_name.txt"
cd ./state-storage-s3-setup

echo "Deleting any local state files found..."
rm terraform.tfstate
rm terraform.tfstate.backup

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false

echo "Applying full terraform manipulation"
terraform apply -auto-approve -var "bucket_name=$BUCKET_NAME"