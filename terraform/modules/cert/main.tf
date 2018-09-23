resource "aws_acm_certificate" "cert" {
	domain_name = "*.${var.domain}"
	validation_method = "DNS"
}

data "aws_route53_zone" "main" {
	name = "${var.domain}."
}

resource "aws_route53_record" "cert_record" {
	name = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_name}"
	type = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_type}"
	zone_id = "${data.aws_route53_zone.main.id}"
	records = ["${aws_acm_certificate.cert.domain_validation_options.0.resource_record_value}"]
	ttl = 300
}

resource "aws_acm_certificate_validation" "cert_validation" {
	certificate_arn = "${aws_acm_certificate.cert.arn}"
	validation_record_fqdns = ["${aws_route53_record.cert_record.fqdn}"]
}
