output "fqdn" {
    value = "${var.subdomain}.${var.domain}"
}

output "zone_id" {
    value = "${aws_route53_zone.api.zone_id}"
}