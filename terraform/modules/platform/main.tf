module "lambda" {
	source = "../lambda"
	name_prefix = "${var.environment == "production" ? "" : "dev-"}"
}

module "api" {
	source = "../api-gateway"
	name_prefix = "${var.environment == "production" ? "" : "dev-"}"
	stage_name = "${var.environment == "production" ? "prod" : "dev"}"
	lambda_invoke_arn = "${module.lambda.invoke_arn}"
	lambda_arn = "${module.lambda.arn}"
}

module "cert" {
	source = "../cert"
	domain = "${var.domain}"
}

module "subdomain_zone" {
	source = "../r53-subdomain-zone"
	domain = "${var.domain}"
	subdomain = "${var.environment == "production" ? "api" : "devapi"}"
}

module "custdom_domain" {
	source = "../api-gateway-custom-domain"
	cert_arn = "${var.cert_arn}"
	fqdn = "${module.subdomain_zone.fqdn}"
	subdomain_zone_id = "${module.subdomain_zone.zone_id}"
	stage = "${module.api.stage}"
	api_id = "${module.api.api_id}"
}
