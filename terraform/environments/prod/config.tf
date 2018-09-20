variable "environment" {
	default = "production"
}

variable "region" {
	default = "us-east-1"
}

variable "domain_name" {}
variable "cert_arn" {}
variable "do_domain_setup" {}

provider "aws" {
	region = "${var.region}"
	profile = "aws-cli"
}

# comment out the block below if you'd like to use local state files
terraform {
	backend "s3" {
		encrypt = true
		# bucket = provided in sh files 
		region = "us-east-1"
		key = "terraform-states/prod.tfstate"
		profile = "aws-cli"
	}
}
