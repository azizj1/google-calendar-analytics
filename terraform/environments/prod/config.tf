variable "environment" {
	default = "production"
}

variable "region" {
	default = "us-east-1"
}

variable "domain_name" {}

provider "aws" {
	region = "${var.region}"
	profile = "aws-cli"
}
