#!/usr/bin/env python3
"""Extract a curated, authoritative config-field reference for Terrarium's AWS
resources from the Terraform AWS provider schema.

The provider is the source of truth for which arguments exist on each resource
and their types, so the fields Terrarium exposes are guaranteed real and
correctly named (they map 1:1 to generated HCL).

Usage (inside the AI container, which bundles terraform + the AWS provider):

    cd /tmp && mkdir s && cd s \\
      && printf 'terraform {\\n required_providers {\\n aws = {\\n source="hashicorp/aws"\\n version="~> 5.0"\\n }\\n }\\n}\\n' > versions.tf \\
      && terraform init -backend=false >/dev/null \\
      && terraform providers schema -json > schema.json
    python dump_provider_schema.py schema.json > resource-fields.json

Output: { "<terrarium-id>": { "tf_type": "...", "fields": [ {name,type,required,description} ] } }
"""
import json
import sys

# Terrarium resource id -> Terraform resource type.
RESOURCE_MAP = {
    "aws-vpc": "aws_vpc",
    "aws-subnet": "aws_subnet",
    "aws-security-group": "aws_security_group",
    "aws-internet-gateway": "aws_internet_gateway",
    "aws-nat-gateway": "aws_nat_gateway",
    "aws-vpc-endpoint": "aws_vpc_endpoint",
    "aws-network-acl": "aws_network_acl",
    "aws-ec2": "aws_instance",
    "aws-lambda": "aws_lambda_function",
    "aws-ecs": "aws_ecs_service",
    "aws-ecr": "aws_ecr_repository",
    "aws-iam": "aws_iam_role",
    "aws-cloudwatch": "aws_cloudwatch_metric_alarm",
    "aws-sns": "aws_sns_topic",
    "aws-sqs": "aws_sqs_queue",
    "aws-api-gateway": "aws_apigatewayv2_api",
    "aws-dynamodb": "aws_dynamodb_table",
    "aws-rds": "aws_db_instance",
    "aws-elasticache": "aws_elasticache_cluster",
    "aws-s3": "aws_s3_bucket",
    "aws-ebs": "aws_ebs_volume",
    "aws-efs": "aws_efs_file_system",
    "aws-elb": "aws_elb",
    "aws-alb": "aws_lb",
    "aws-nlb": "aws_lb",
    "aws-route53": "aws_route53_record",
    "aws-cloudfront": "aws_cloudfront_distribution",
}

PROVIDER_KEY = "registry.terraform.io/hashicorp/aws"


def type_label(t):
    # provider attribute "type" is either a string ("string") or a nested
    # list like ["list", "string"] / ["set", ["object", {...}]]
    if isinstance(t, str):
        return t
    if isinstance(t, list) and t:
        return t[0]
    return "unknown"


def main():
    schema = json.load(open(sys.argv[1]))
    resources = schema["provider_schemas"][PROVIDER_KEY]["resource_schemas"]

    out = {}
    for terr_id, tf_type in RESOURCE_MAP.items():
        res = resources.get(tf_type)
        if not res:
            continue
        attrs = res.get("block", {}).get("attributes", {})
        fields = []
        for name, spec in sorted(attrs.items()):
            # Skip computed-only (read-only) attributes — not user-configurable.
            if spec.get("computed") and not spec.get("optional") and not spec.get("required"):
                continue
            fields.append(
                {
                    "name": name,
                    "type": type_label(spec.get("type")),
                    "required": bool(spec.get("required")),
                    "description": (spec.get("description") or "").strip(),
                }
            )
        out[terr_id] = {"tf_type": tf_type, "fields": fields}

    json.dump(out, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
