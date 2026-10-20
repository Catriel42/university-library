output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The connection endpoint for the RDS instance"
}

output "rds_address" {
  value       = aws_db_instance.postgres.address
  description = "The address of the RDS instance"
}

output "rds_port" {
  value       = aws_db_instance.postgres.port
  description = "The database port"
}

output "database_url" {
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}?sslmode=require"
  description = "The full PostgreSQL connection URL"
  sensitive   = true
}

output "lambda_function_name" {
  value       = aws_lambda_function.backend.function_name
  description = "The name of the Lambda function"
}

output "api_gateway_url" {
  value       = aws_apigatewayv2_stage.default.invoke_url
  description = "The invoke URL of the API Gateway HTTP API"
}

output "frontend_s3_bucket" {
  value       = aws_s3_bucket.frontend.id
  description = "The S3 bucket hosting the frontend static files"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "The ID of the CloudFront distribution"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "The domain name of the CloudFront distribution"
}

output "frontend_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "The HTTPS URL for the frontend application"
}
