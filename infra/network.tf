data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "rds" {
  name       = "${var.app_name}-${var.environment}-db-subnets"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "${var.app_name}-${var.environment}-db-subnets"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  description = "Allow inbound PostgreSQL traffic from Lambda and developers"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "PostgreSQL traffic"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-${var.environment}-rds-sg"
  }
}
