resource "aws_s3_bucket" "lambda_deployments" {
  bucket        = "${var.app_name}-${var.environment}-lambda-${random_id.bucket_suffix.hex}"
  force_destroy = true

  tags = {
    Name = "${var.app_name}-${var.environment}-lambda-bucket"
  }
}

resource "aws_s3_object" "lambda_code" {
  bucket = aws_s3_bucket.lambda_deployments.id
  key    = "lambda-${filemd5("${path.module}/../backend/lambda.zip")}.zip"
  source = "${path.module}/../backend/lambda.zip"
  etag   = filemd5("${path.module}/../backend/lambda.zip")
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.app_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "backend" {
  function_name = "${var.app_name}-${var.environment}-api"
  s3_bucket     = aws_s3_bucket.lambda_deployments.id
  s3_key        = aws_s3_object.lambda_code.key
  role          = aws_iam_role.lambda_role.arn
  handler       = "dist/lambda.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 512

  environment {
    variables = {
      NODE_ENV                    = "production"
      DATABASE_URL                = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${var.db_name}?sslmode=require&sslaccept=accept_invalid_certs"
      NODE_TLS_REJECT_UNAUTHORIZED = "0"
      JWT_SECRET                  = var.jwt_secret
      FRONTEND_URL           = "https://${aws_cloudfront_distribution.frontend.domain_name}"
      DEFAULT_COPIES         = "3"
      MAX_ACTIVE_LOANS       = "5"
      LOAN_PERIOD_DAYS       = "14"
      MAX_RENEWALS           = "2"
      RENEWAL_EXTENSION_DAYS = "7"
      HOLD_WINDOW_HOURS      = "48"
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_db_instance.postgres
  ]

  tags = {
    Name = "${var.app_name}-${var.environment}-lambda"
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.app_name}-${var.environment}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins     = ["https://${aws_cloudfront_distribution.frontend.domain_name}", "http://localhost:5173", "http://localhost:5174"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers     = ["Content-Type", "Authorization"]
    allow_credentials = true
    max_age           = 300
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-apigw"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.backend.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "root" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
