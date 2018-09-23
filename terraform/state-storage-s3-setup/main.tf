resource "aws_s3_bucket" "terraform_state_storage_s3" {
    bucket = "${var.bucket_name}"

    versioning {
        enabled = true
    }

    lifecycle {
        prevent_destroy = true
    }
}
