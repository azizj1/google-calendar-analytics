data "aws_route53_zone" "main" {
    name = "${var.domain}"
}

resource "aws_route53_zone" "api" {
	name = "${var.subdomain}.${var.domain}."
	comment = "Zone that will manage DNS for calls going to ${var.subdomain}.${var.domain}. This zone will be hit by placing NS records of this zone in ${var.domain}'s records"
}

resource "aws_route53_record" "api-ns" {
    zone_id = "${data.aws_route53_zone.main.zone_id}"
    name = "${var.subdomain}.${var.domain}"
    type = "NS"
    ttl = "300"
    records = [
        "${aws_route53_zone.api.name_servers.0}",
        "${aws_route53_zone.api.name_servers.1}",
        "${aws_route53_zone.api.name_servers.2}",
        "${aws_route53_zone.api.name_servers.3}"
    ]
}
