resource "aws_db_instance" "postgres" {
  identifier                   = "${var.app_name}-${var.environment}-db"
  engine                       = "postgres"
  engine_version               = "16.3"
  instance_class               = "db.t4g.micro"
  allocated_storage            = 20
  max_allocated_storage        = 0
  storage_type                 = "gp3"
  db_name                      = var.db_name
  username                     = var.db_username
  password                     = var.db_password
  db_subnet_group_name         = aws_db_subnet_group.rds.name
  vpc_security_group_ids       = [aws_security_group.rds_sg.id]
  publicly_accessible          = true
  multi_az                     = false
  skip_final_snapshot          = true
  backup_retention_period      = 1
  performance_insights_enabled = false
  auto_minor_version_upgrade   = true
  deletion_protection          = false

  tags = {
    Name = "${var.app_name}-${var.environment}-db"
  }
}
