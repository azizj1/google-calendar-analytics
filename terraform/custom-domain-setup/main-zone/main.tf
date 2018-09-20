module "main_zone" {
	source = "../../modules/r53-setup-nameservers"
	domain = "${var.domain_name}."
}
