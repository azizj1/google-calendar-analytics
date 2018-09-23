data "aws_route53_zone" "main" {
    count = "${var.enabled}"
    name = "${var.domain}"
}

resource "aws_route53_zone" "api" {
    count = "${var.enabled}"
	name = "${var.subdomain}.${var.domain}."
	comment = "Zone that will manage DNS for calls going to ${var.subdomain}.${var.domain}. This zone will be hit by placing NS records of this zone in ${var.domain}'s records"
}

resource "aws_route53_record" "api-ns" {
    count = "${var.enabled}"
    zone_id = "${element(concat(data.aws_route53_zone.main.*.zone_id, list("")), 0)}"
    name = "${var.subdomain}.${var.domain}"
    type = "NS"
    ttl = "300"
    records = [
        "${element(concat(flatten(aws_route53_zone.api.*.name_servers), list("")), 0)}",
        "${element(concat(flatten(aws_route53_zone.api.*.name_servers), list("")), 1)}",
        "${element(concat(flatten(aws_route53_zone.api.*.name_servers), list("")), 2)}",
        "${element(concat(flatten(aws_route53_zone.api.*.name_servers), list("")), 3)}"
    ]
}
