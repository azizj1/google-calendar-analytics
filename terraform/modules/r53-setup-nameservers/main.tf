resource "aws_route53_zone" "main" {
	name = "${var.domain}"
	comment = "Zone that will manage DNS for your purchased domain. It will route all prod API calls to api.${var.domain} R53 Zone through NS records, and same for dev."
}
