module "platform" {
	source = "../../modules/platform"
	environment = "${var.environment}"
	domain = "${var.domain_name}"
}
