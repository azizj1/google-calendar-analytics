provider "aws" {
	region = "us-east-1"
	profile = "aws-cli"
}

variable "bucket_name" {
	description = "Name of bucket you want to use to store your terraform states."
}
