resource "aws_api_gateway_rest_api" "api" {
	name = "${var.name_prefix}calendar-api"
	description = "API to provide aggregate data on private calendars"
}

resource "aws_api_gateway_resource" "proxy" {
	rest_api_id = "${aws_api_gateway_rest_api.api.id}"
	parent_id = "${aws_api_gateway_rest_api.api.root_resource_id}"
	path_part = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
	rest_api_id = "${aws_api_gateway_rest_api.api.id}"
	resource_id = "${aws_api_gateway_resource.proxy.id}"
	http_method = "ANY"
	authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
	rest_api_id = "${aws_api_gateway_rest_api.api.id}"
	resource_id = "${aws_api_gateway_resource.proxy.id}"
	http_method = "${aws_api_gateway_method.proxy.http_method}"
	integration_http_method = "POST"
	type = "AWS_PROXY"
	uri = "${var.lambda_invoke_arn}"
}

resource "aws_api_gateway_deployment" "deployment" {
	depends_on = ["aws_api_gateway_method.proxy", "aws_api_gateway_integration.lambda"]
	rest_api_id = "${aws_api_gateway_rest_api.api.id}"
	stage_name = "${var.stage_name}"
}

resource "aws_lambda_permission" "permit" {
	statement_id = "AllowAPIGatewayInvoke"
	action = "lambda:InvokeFunction"
	principal = "apigateway.amazonaws.com"
	function_name = "${var.lambda_arn}"
	source_arn = "${aws_api_gateway_deployment.deployment.execution_arn}/*/*"
}
