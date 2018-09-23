$OriginalDirectory = Get-Location

$BucketFileLocation = "$($PSScriptRoot)\terraform\s3_bucket_name.txt"
$BucketName = [IO.File]::ReadAllText($BucketFileLocation)
Write-Host "S3 bucket `"$($BucketName)`" obtained from $($BucketFileLocation)"

Write-Host "Determining if custom domain was setup..."
Set-Location "$($PSScriptRoot)\terraform\custom-domain-setup\certificate"
terraform init -input=false -backend-config="bucket=$BucketName"

$CertArn = terraform output cert_arn

Set-Location $OriginalDirectory

if ([string]::IsNullOrEmpty($CertArn)) {
	Write-Host "Certificate not found, assuming custom domains are NOT being used"
	Write-Host "Updating ~/gateway-stages.json..."
	[IO.File]::WriteAllLines("$($PSScriptRoot)\gateway-stages.json", "{`"production`": `"/prod`", `"development`": `"/dev`"}")
} else {
	Write-Host "Certificate found, assuming custom domains ARE being used"
	Write-Host "Updating ~/gateway-stages.json..."
	[IO.File]::WriteAllLines("$($PSScriptRoot)\gateway-stages.json","{`"production`": `"`", `"development`": `"`"}")
}
