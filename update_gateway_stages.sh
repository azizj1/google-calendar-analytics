#!/bin/bash

BUCKET_NAME=$(cat ./terraform/s3_bucket_name.txt)
echo "S3 bucket name $BUCKET_NAME obtained from s3_bucket_name.txt"

echo "Determining if custom domain was setup..."
cd ./terraform/custom-domain-setup/certificate/
terraform init -input=false -backend-config="bucket=$BUCKET_NAME"
DOMAIN_NAME="$(terraform output domain_name)"
CERT_ARN="$(terraform output cert_arn)"

cd ../../../
if [ -z "$CERT_ARN" ]
then
    echo "Certificate not found, assuming custom domains are NOT being used"
    echo "Updating ~/gateway-stages.json..."
    echo "{\"production\": \"/prod\", \"development\": \"/dev\"}" > gateway-stages.json
else
    echo "Certificate found, assuming custom domains ARE being used"
    echo "Updating ~/gateway-stages.json..."
    echo "{\"production\": \"\", \"development\": \"\"}" > gateway-stages.json
fi
