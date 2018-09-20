provider "aws" {
	region = "us-east-1"
	profile = "aws-cli"
}

variable "domain_name" {
	description = "Name of the purchased domain (without the www). E.g., azizj1.com, google.com, etc."
}

# comment out the block below if you'd like to use local state files
terraform {
	backend "s3" {
		encrypt = true
		# bucket = provided in sh files 
		region = "us-east-1"
		key = "terraform-states/cert.tfstate"
		profile = "aws-cli"
	}
}
