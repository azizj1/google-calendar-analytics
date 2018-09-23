$OriginalDirectory = Get-Location
$Env = $args[0]

if ($Env -notlike "dev" -and $Env -notlike "prod") {
	Write-Host "Environment not specified. Command: .\terraform_apply.ps1 <env>, where env = 'dev' or 'prod'"
	exit
}

$BucketFileLocation = "$($PSScriptRoot)\s3_bucket_name.txt"
$BucketName = [IO.File]::ReadAllText($BucketFileLocation)
Write-Host "S3 bucket `"$($BucketName)`" obtained from $($BucketFileLocation)"

Write-Host "Determining if custom domain was setup..."
Set-Location "$($PSScriptRoot)\custom-domain-setup\certificate"
terraform init -input=false -backend-config="bucket=$BucketName"

$DomainName = terraform output domain_name
$CertArn = terraform output cert_arn
$DoDomainSetup = 0

if ([string]::IsNullOrEmpty($CertArn)) {
	Write-Host "No certificate ARN was found in custom-domain-setup/certificate/terraform.tfstate, so assuming custom-domain-setup was not run."
} else {
	$DoDomainSetup = 1
	Write-Host "Certificate found, and domain was set to $DomainName"
}

Write-Host "Changing to package directory for $Env environment..."
Set-Location "$($PSScriptRoot)\environments\$($Env)"

Write-Host "Getting modules..."
terraform get

Write-Host "Initializing state backend..."
terraform init -input=false -backend-config="bucket=$BucketName"

Write-Host "Applying full terraform manipulation"
terraform apply -var "domain_name=$DomainName" -var "cert_arn=$CertArn" -var "do_domain_setup=$DoDomainSetup" -input=false -auto-approve

if (-not ([string]::IsNullOrEmpty($CertArn))) {
    Write-Host "It takes awhile for DNS changes to propogate (approx 30mins). Check status at https://www.whatsmydns.net/."
    Write-Host ""
}

Set-Location $OriginalDirectory
