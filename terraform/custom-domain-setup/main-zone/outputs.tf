output "name_servers" {
  value = "${module.main_zone.name_servers}"
}

output "domain_name" {
  value = "${var.domain_name}"
}
