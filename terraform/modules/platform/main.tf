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
