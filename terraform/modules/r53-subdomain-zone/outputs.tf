output "fqdn" {
    value = "${var.subdomain}.${var.domain}"
}

output "zone_id" {
    value = "${element(concat(aws_route53_zone.api.*.zone_id, list("")), 0)}"
}