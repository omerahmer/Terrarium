import json

from llm import MODEL, client, extract_tool_input

# Load balancer resource types that can front an EC2 instance.
LOAD_BALANCER_TYPES = {"aws-alb", "aws-nlb", "aws-elb"}


def _resource_type(node: dict) -> str:
    return node.get("data", {}).get("resourceType", "")


def _config(node: dict) -> dict:
    return node.get("data", {}).get("config", {}) or {}


def _label(node: dict) -> str:
    return node.get("data", {}).get("label") or node.get("id", "")


def run_deterministic_checks(canvas: dict) -> list[dict]:
    """Graph/config rules over the canvas. Each finding records the node ids it
    applies to so the frontend can highlight them."""
    nodes = canvas.get("nodes", [])
    edges = canvas.get("edges", [])
    findings: list[dict] = []

    nodes_by_id = {node["id"]: node for node in nodes}
    # All resource types that have an edge pointing AT a given node id.
    inbound_types: dict[str, set[str]] = {}
    for edge in edges:
        target = edge.get("target")
        source = nodes_by_id.get(edge.get("source"))
        if target is None or source is None:
            continue
        inbound_types.setdefault(target, set()).add(_resource_type(source))

    for node in nodes:
        rtype = _resource_type(node)
        node_id = node["id"]
        config = _config(node)
        inbound = inbound_types.get(node_id, set())

        # 1. EC2 single point of failure — not fronted by a load balancer.
        if rtype == "aws-ec2" and inbound.isdisjoint(LOAD_BALANCER_TYPES):
            findings.append(
                {
                    "severity": "warning",
                    "title": "EC2 instance is a single point of failure",
                    "message": (
                        f'"{_label(node)}" has no load balancer in front of it. '
                        "If this instance fails, the workload goes down with it."
                    ),
                    "suggestion": (
                        "Place the instance behind an ALB/NLB (and ideally run "
                        "multiple instances) so traffic can fail over."
                    ),
                    "node_ids": [node_id],
                    "source": "deterministic",
                }
            )

        # 2. Database with no security group.
        if rtype in ("aws-rds", "aws-elasticache"):
            has_sg_config = bool(config.get("securityGroups"))
            has_sg_edge = "aws-security-group" in inbound
            if not has_sg_config and not has_sg_edge:
                findings.append(
                    {
                        "severity": "error",
                        "title": "Database has no security group",
                        "message": (
                            f'"{_label(node)}" is not protected by a security group, '
                            "leaving its network access unrestricted."
                        ),
                        "suggestion": (
                            "Attach a security group that only allows traffic from "
                            "the application tier on the database port."
                        ),
                        "node_ids": [node_id],
                        "source": "deterministic",
                    }
                )

        # 4. S3 without public-access block.
        if rtype == "aws-s3" and config.get("publicAccess") != "blocked":
            findings.append(
                {
                    "severity": "warning",
                    "title": "S3 bucket allows public access",
                    "message": (
                        f'"{_label(node)}" does not have public access fully blocked.'
                    ),
                    "suggestion": (
                        'Set Public Access to "Blocked" unless this bucket is '
                        "intentionally serving public content."
                    ),
                    "node_ids": [node_id],
                    "source": "deterministic",
                }
            )

        # 5. RDS not Multi-AZ.
        if rtype == "aws-rds" and config.get("multiAz") == "disabled":
            findings.append(
                {
                    "severity": "info",
                    "title": "RDS instance is single-AZ",
                    "message": (
                        f'"{_label(node)}" runs in a single Availability Zone, so an '
                        "AZ outage takes the database offline."
                    ),
                    "suggestion": "Enable Multi-AZ for automatic failover and durability.",
                    "node_ids": [node_id],
                    "source": "deterministic",
                }
            )

    # 3. Lambda directly calling RDS (connection-pool exhaustion).
    for edge in edges:
        source = nodes_by_id.get(edge.get("source"))
        target = nodes_by_id.get(edge.get("target"))
        if source is None or target is None:
            continue
        if _resource_type(source) == "aws-lambda" and _resource_type(target) == "aws-rds":
            findings.append(
                {
                    "severity": "warning",
                    "title": "Lambda connects directly to RDS",
                    "message": (
                        f'"{_label(source)}" calls "{_label(target)}" directly. At scale, '
                        "concurrent Lambda invocations can exhaust the RDS connection pool."
                    ),
                    "suggestion": (
                        "Put RDS Proxy between Lambda and RDS to pool and reuse "
                        "database connections."
                    ),
                    "node_ids": [source["id"], target["id"]],
                    "source": "deterministic",
                }
            )

    return findings


REPORT_FINDINGS_TOOL = {
    "name": "report_findings",
    "description": "Report architecture review findings for the given AWS design.",
    "input_schema": {
        "type": "object",
        "properties": {
            "findings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "severity": {
                            "type": "string",
                            "enum": ["error", "warning", "info"],
                        },
                        "title": {"type": "string"},
                        "message": {"type": "string"},
                        "suggestion": {"type": "string"},
                        "node_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Canvas node ids this finding applies to. Empty for architecture-wide findings.",
                        },
                    },
                    "required": ["severity", "title", "message", "node_ids"],
                },
            }
        },
        "required": ["findings"],
    },
}

REVIEW_SYSTEM_PROMPT = """You are a senior AWS cloud architect reviewing an infrastructure design.

The design is a JSON graph: nodes are AWS resources (each with an id, label, resourceType, and config), and edges are relationships between them. Containment is expressed via parentId (e.g. a subnet inside a VPC, an instance inside a subnet).

Resource types you will see: aws-vpc, aws-subnet, aws-security-group, aws-internet-gateway, aws-nat-gateway, aws-vpc-endpoint, aws-network-acl, aws-ec2, aws-lambda, aws-ecs, aws-ecr, aws-iam, aws-cloudwatch, aws-sns, aws-sqs, aws-api-gateway, aws-dynamodb, aws-rds, aws-elasticache, aws-s3, aws-ebs, aws-efs, aws-elb, aws-alb, aws-nlb, aws-route53, aws-cloudfront.

Identify architecture-level problems and anti-patterns: security exposure, availability and single-points-of-failure, scalability bottlenecks, missing observability, and cost concerns. Focus on holistic and cross-resource issues — simple per-resource rule checks (missing security group on a database, single-AZ RDS, public S3, EC2 with no load balancer, Lambda calling RDS directly) are already covered by a separate deterministic pass, so do not repeat those.

For every finding, reference the relevant node ids from the canvas so they can be highlighted. Always respond by calling the report_findings tool. If the architecture looks sound, return an empty findings array."""


def run_llm_review(canvas: dict) -> list[dict]:
    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=REVIEW_SYSTEM_PROMPT,
        tools=[REPORT_FINDINGS_TOOL],
        tool_choice={"type": "tool", "name": "report_findings"},
        messages=[
            {
                "role": "user",
                "content": f"Review this architecture:\n\n{json.dumps(canvas, indent=2)}",
            }
        ],
    )
    result = extract_tool_input(response, "report_findings")
    findings = result.get("findings", [])
    for finding in findings:
        finding["source"] = "llm"
        finding.setdefault("node_ids", [])
    return findings


def run_review(canvas: dict) -> dict:
    findings = run_deterministic_checks(canvas)
    try:
        findings += run_llm_review(canvas)
    except Exception:
        # A failed LLM pass should not sink the deterministic findings.
        pass
    return {"findings": findings}
