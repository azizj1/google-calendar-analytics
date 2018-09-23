output "domain_name" {
  value = "${var.domain_name}"
}

output "cert_arn" {
  value = "${module.cert.arn}"
}
