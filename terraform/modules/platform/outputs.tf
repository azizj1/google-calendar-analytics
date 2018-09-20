output "swagger_url" {
    value = "${var.do_domain_setup ? "https://${module.subdomain_zone.fqdn}/docs/" : "${module.api.base_url}/docs/"}"
}
