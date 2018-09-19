resource "aws_api_gateway_domain_name" "api_domain" {
    domain_name = "${var.fqdn}"
    certificate_arn = "${var.cert_arn}"
}

resource "aws_route53_record" "alias" {
    zone_id = "${var.subdomain_zone_id}"
    name = "${aws_api_gateway_domain_name.api_domain.domain_name}"
    type = "A"
    alias {
        name = "${aws_api_gateway_domain_name.api_domain.cloudfront_domain_name}"
        zone_id = "${aws_api_gateway_domain_name.api_domain.cloudfront_zone_id}"
        evaluate_target_health = false
    }
}

resource "aws_api_gateway_base_path_mapping" "domain_api_map" {
    api_id = "${var.api_id}"
    stage_name = "${var.stage}"
    domain_name = "${aws_api_gateway_domain_name.api_domain.domain_name}"
}
