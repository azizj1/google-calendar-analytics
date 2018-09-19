module "nameservers" {
	source = "../modules/r53-setup-nameservers"
	domain = "${var.domain_name}."
}

module "cert" {
	source = "../modules/cert"
	domain = "${var.domain_name}"
}
