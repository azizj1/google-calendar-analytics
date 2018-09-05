@echo off

set ENV=%1

echo "Changing to package directory..."
cd "./environments/%ENV%"

echo "Getting modules..."
terraform get

echo "Initializing state backend..."
terraform init -input=false

echo "Applying full terraform manipulation"
terraform apply -input=false -auto-approve

cd ../..
