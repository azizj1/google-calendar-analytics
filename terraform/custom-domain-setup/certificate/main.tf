module "cert" {
	source = "../../modules/cert"
	domain = "${var.domain_name}"
}
