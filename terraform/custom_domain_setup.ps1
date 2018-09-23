$OriginalDirectory = Get-Location
$BucketFileLocation = "$($PSScriptRoot)\s3_bucket_name.txt"
$BucketName = [IO.File]::ReadAllText($BucketFileLocation)
Write-Host "S3 bucket `"$($BucketName)`" obtained from $($BucketFileLocation)"

# Create main route53 zone
Set-Location "$($PSScriptRoot)\custom-domain-setup\main-zone\"
Get-ChildItem -Filter *tfstate* -Recurse | Remove-Item -Force

Write-Output "Getting modules..."
terraform get

Write-Output "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$($BucketName)"

Write-Output "Applying full terraform manipulation"
terraform apply -auto-approve

$DomainName = terraform output domain_name
Write-Output "Created AWS Route53 Zone for '$DomainName' with the name servers printed above."
Write-Output "Manually change your domain registration service's name servers to the ones above, so certificates can be requested by AWS."
Write-Output ""
Write-Host -NoNewLine 'When done, press any key to continue...'
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Create certificate
Set-Location ..\certificate\
Get-ChildItem -Filter *tfstate* -Recurse | Remove-Item -Force

Write-Host "Getting modules..."
terraform get

Write-Host "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BucketName"

Write-Host "Applying full terraform manipulation"
terraform apply -var "domain_name=$DomainName" -auto-approve

Set-Location $OriginalDirectory
