output "api_id" {
	value = "${aws_api_gateway_rest_api.api.id}"
}

output "stage" {
	value = "${aws_api_gateway_deployment.deployment.stage_name}"
}

output "base_url" {
	value = "${aws_api_gateway_deployment.deployment.invoke_url}"
}
