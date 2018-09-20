resource "aws_api_gateway_domain_name" "api_domain" {
    count = "${var.enabled}"
    domain_name = "${var.fqdn}"
    certificate_arn = "${var.cert_arn}"
}

resource "aws_route53_record" "alias" {
    count = "${var.enabled}"
    zone_id = "${var.subdomain_zone_id}"
    name = "${element(concat(aws_api_gateway_domain_name.api_domain.*.domain_name, list("")), 0)}"
    type = "A"
    alias {
        name = "${element(concat(aws_api_gateway_domain_name.api_domain.*.cloudfront_domain_name, list("")), 0)}"
        zone_id = "${element(concat(aws_api_gateway_domain_name.api_domain.*.cloudfront_zone_id, list("")), 0)}"
        evaluate_target_health = false
    }
}

resource "aws_api_gateway_base_path_mapping" "domain_api_map" {
    count = "${var.enabled}"
    api_id = "${var.api_id}"
    stage_name = "${var.stage}"
    domain_name = "${element(concat(aws_api_gateway_domain_name.api_domain.*.domain_name, list("")), 0)}"
}
