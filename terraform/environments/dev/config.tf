variable "environment" {
	default = "development"
}

variable "region" {
	default = "us-east-1"
}

provider "aws" {
	region = "${var.region}"
	profile = "aws-cli"
}
