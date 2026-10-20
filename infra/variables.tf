variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "app_name" {
  type        = string
  description = "Application name prefix for all resources"
  default     = "university-library"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prod"
}

variable "db_name" {
  type        = string
  description = "PostgreSQL database name"
  default     = "university_library"
}

variable "db_username" {
  type        = string
  description = "Database administrator username"
  default     = "libraryadmin"
}

variable "db_password" {
  type        = string
  description = "Database administrator password (min 8 chars)"
  sensitive   = true
  default     = "UniversityLib2026!Secure"
}

variable "jwt_secret" {
  type        = string
  description = "Secret key for signing JWT tokens"
  sensitive   = true
  default     = "super-secret-jwt-token-key-university-library-prod-2026"
}
