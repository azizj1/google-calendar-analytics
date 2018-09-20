#!/bin/bash

BUCKET_NAME=$(cat state_storage_s3_bucket_name.txt)
cd ./state-storage-s3-setup

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false

echo "Applying full terraform manipulation"
terraform apply -auto-approve -var "bucket_name=$BUCKET_NAME"