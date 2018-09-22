$OriginalDirectory = Get-Location
$BucketFileLocation = "$($PSScriptRoot)\s3_bucket_name.txt"
$BucketName = [IO.File]::ReadAllText($BucketFileLocation)
Write-Host "S3 bucket `"$($BucketName)`" obtained from $($BucketFileLocation)"

Set-Location "$($PSScriptRoot)\state-storage-s3-setup\"
Get-ChildItem -Filter *tfstate* | Remove-Item -Force

Write-Output "Getting modules..."
terraform get

Write-Output "Initializing state backend..."
terraform init -input=false

Write-Output "Applying full terraform manipulation"
terraform apply -auto-approve -var "bucket_name=$($BucketName)"

Set-Location $OriginalDirectory
