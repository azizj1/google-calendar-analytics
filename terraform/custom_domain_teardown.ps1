$OriginalDirectory = Get-Location
$BucketFileLocation = "$($PSScriptRoot)\s3_bucket_name.txt"
$BucketName = [IO.File]::ReadAllText($BucketFileLocation)
Write-Host "S3 bucket `"$($BucketName)`" obtained from $($BucketFileLocation)"

# Destroy certificate
Set-Location "$($PSScriptRoot)\custom-domain-setup\certificate\"

Write-Host "Getting modules..."
terraform get

Write-Host "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BucketName"

$DomainName = terraform output domain_name

Write-Host "Destroying full terraform manipulation"
terraform destroy -var "domain_name=$DomainName" -auto-approve
Write-Output "Destroyed certificate for '*.$DomainName.'"

# Destroy main route53 zone
Set-Location "$($PSScriptRoot)\custom-domain-setup\main-zone\"

Write-Output "Getting modules..."
terraform get

Write-Output "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$($BucketName)"

Write-Output "Destroying full terraform manipulation"
terraform destroy -var "domain_name=$DomainName" -auto-approve

Write-Output "Destroyed AWS Route53 Zone for '$DomainName'."
Write-Output "Manually change your domain registration service's name servers to its defaults."
Write-Output ""

Set-Location $OriginalDirectory
