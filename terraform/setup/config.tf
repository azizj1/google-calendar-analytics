provider "aws" {
	region = "us-east-1"
	profile = "aws-cli"
}

variable "domain_name" {
	description = "Name of the purchased domain (without the www). E.g., azizj1.com, google.com, etc."
}
