module "platform" {
	source = "../../modules/platform"
	environment = "${var.environment}"
	domain = "${var.domain_name}"
	cert_arn = "${var.cert_arn}"
	do_domain_setup = "${var.do_domain_setup}"
}
