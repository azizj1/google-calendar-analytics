resource "aws_iam_role" "iam_for_lambda" {
	name = "${var.name_prefix}iam_for_calendar_api_lambda"

	assume_role_policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Action": "sts:AssumeRole",
			"Principal": {
				"Service": "lambda.amazonaws.com"
			},
			"Effect": "Allow",
			"Sid": ""
		}
	]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_access" {
	role = "${aws_iam_role.iam_for_lambda.name}"
	policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "lambda" {
	filename = "${path.module}/lambda.zip"
	function_name = "${var.name_prefix}calendar-api"
	description = "Nodejs API to provide aggregate data on private calendars"
	role = "${aws_iam_role.iam_for_lambda.arn}"
	handler = "lambda.handler"
	runtime = "nodejs12.x"
	source_code_hash = "${base64sha256(file("${path.module}/lambda.zip"))}"
	memory_size = "256"
	timeout = "30"
}
