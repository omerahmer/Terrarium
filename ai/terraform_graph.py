import json
import os
import subprocess
import tempfile
from typing import TypedDict

import anthropic
from langgraph.graph import END, StateGraph

MAX_ATTEMPTS = 3
MODEL = "claude-sonnet-4-6"

client = anthropic.Anthropic()

EMIT_TERRAFORM_TOOL = {
    "name": "emit_terraform",
    "description": "Return the generated Terraform configuration split into its three standard files.",
    "input_schema": {
        "type": "object",
        "properties": {
            "main_tf": {
                "type": "string",
                "description": "Contents of main.tf — provider block and all resource blocks.",
            },
            "variables_tf": {
                "type": "string",
                "description": "Contents of variables.tf — variable declarations for configurable values.",
            },
            "outputs_tf": {
                "type": "string",
                "description": "Contents of outputs.tf — useful outputs like IDs, ARNs, and endpoints.",
            },
        },
        "required": ["main_tf", "variables_tf", "outputs_tf"],
    },
}

SYSTEM_PROMPT = """You are a Terraform expert generating AWS infrastructure code from a visual architecture diagram.

The diagram is provided as JSON: a list of nodes (each an AWS resource with an id, label, resourceType, and config properties) and edges (relationships between nodes). Containment is expressed via parentId — e.g. a subnet node with parentId pointing to a VPC node lives inside that VPC.

Resource type to Terraform resource mapping:
- aws-vpc -> aws_vpc
- aws-subnet -> aws_subnet (vpc_id comes from parentId)
- aws-security-group -> aws_security_group
- aws-internet-gateway -> aws_internet_gateway
- aws-nat-gateway -> aws_nat_gateway
- aws-vpc-endpoint -> aws_vpc_endpoint
- aws-network-acl -> aws_network_acl
- aws-ec2 -> aws_instance
- aws-lambda -> aws_lambda_function
- aws-ecs -> aws_ecs_service
- aws-ecr -> aws_ecr_repository
- aws-iam -> aws_iam_role
- aws-cloudwatch -> aws_cloudwatch_metric_alarm
- aws-sns -> aws_sns_topic
- aws-sqs -> aws_sqs_queue
- aws-api-gateway -> aws_apigatewayv2_api (use aws_api_gateway_rest_api if config.apiType is "rest")
- aws-dynamodb -> aws_dynamodb_table
- aws-rds -> aws_db_instance
- aws-elasticache -> aws_elasticache_cluster
- aws-s3 -> aws_s3_bucket
- aws-ebs -> aws_ebs_volume
- aws-efs -> aws_efs_file_system
- aws-elb -> aws_elb
- aws-alb -> aws_lb (load_balancer_type = "application")
- aws-nlb -> aws_lb (load_balancer_type = "network")
- aws-route53 -> aws_route53_record
- aws-cloudfront -> aws_cloudfront_distribution

Rules:
- Resolve every dependency implied by parentId (containment) and edges (relationships) into real Terraform references (e.g. vpc_id = aws_vpc.main.id). Never hardcode IDs.
- Use each resource's config properties to populate the matching Terraform arguments (e.g. cidrBlock -> cidr_block, instanceType -> instance_type).
- Extract values a user would plausibly want to override per-environment into variables.tf with sensible defaults, and reference them from main.tf via var.*.
- Declare the aws provider with a configurable region variable, and pin the provider version to `~> 5.0` in a required_providers block (this matches the provider already cached in this environment).
- Output useful values (resource IDs, ARNs, endpoints) in outputs.tf.
- Always respond by calling the emit_terraform tool with the three files. Do not return prose.
"""


class GraphState(TypedDict):
    canvas: dict
    attempt: int
    main_tf: str
    variables_tf: str
    outputs_tf: str
    validated: bool
    errors: list[str]


def _canvas_prompt(canvas: dict) -> str:
    return f"Generate Terraform for this architecture:\n\n{json.dumps(canvas, indent=2)}"


def _extract_terraform(message: anthropic.types.Message) -> dict[str, str]:
    for block in message.content:
        if block.type == "tool_use" and block.name == "emit_terraform":
            return block.input
    raise ValueError("Claude response did not include an emit_terraform tool call")


def generate_node(state: GraphState) -> GraphState:
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[EMIT_TERRAFORM_TOOL],
        tool_choice={"type": "tool", "name": "emit_terraform"},
        messages=[{"role": "user", "content": _canvas_prompt(state["canvas"])}],
    )
    files = _extract_terraform(response)
    return {
        **state,
        "main_tf": files["main_tf"],
        "variables_tf": files["variables_tf"],
        "outputs_tf": files["outputs_tf"],
        "attempt": state["attempt"] + 1,
    }


def fix_node(state: GraphState) -> GraphState:
    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[EMIT_TERRAFORM_TOOL],
        tool_choice={"type": "tool", "name": "emit_terraform"},
        messages=[
            {"role": "user", "content": _canvas_prompt(state["canvas"])},
            {
                "role": "assistant",
                "content": [
                    {
                        "type": "tool_use",
                        "id": "previous_attempt",
                        "name": "emit_terraform",
                        "input": {
                            "main_tf": state["main_tf"],
                            "variables_tf": state["variables_tf"],
                            "outputs_tf": state["outputs_tf"],
                        },
                    }
                ],
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": "previous_attempt",
                        "content": "terraform validate failed:\n" + "\n".join(state["errors"]),
                    }
                ],
            },
        ],
    )
    files = _extract_terraform(response)
    return {
        **state,
        "main_tf": files["main_tf"],
        "variables_tf": files["variables_tf"],
        "outputs_tf": files["outputs_tf"],
        "attempt": state["attempt"] + 1,
    }


def _write(dirpath: str, name: str, content: str) -> None:
    with open(os.path.join(dirpath, name), "w") as f:
        f.write(content)


def validate_node(state: GraphState) -> GraphState:
    with tempfile.TemporaryDirectory() as tmp:
        _write(tmp, "main.tf", state["main_tf"])
        _write(tmp, "variables.tf", state["variables_tf"])
        _write(tmp, "outputs.tf", state["outputs_tf"])

        init = subprocess.run(
            ["terraform", "init", "-backend=false", "-input=false"],
            cwd=tmp,
            capture_output=True,
            text=True,
        )
        if init.returncode != 0:
            return {**state, "validated": False, "errors": [init.stderr or init.stdout]}

        result = subprocess.run(
            ["terraform", "validate", "-json"],
            cwd=tmp,
            capture_output=True,
            text=True,
        )

    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        return {**state, "validated": False, "errors": [result.stdout or result.stderr]}

    if payload.get("valid"):
        return {**state, "validated": True, "errors": []}

    diagnostics = [
        d.get("summary", "") + (f": {d['detail']}" if d.get("detail") else "")
        for d in payload.get("diagnostics", [])
    ]
    return {**state, "validated": False, "errors": diagnostics}


def _should_continue(state: GraphState) -> str:
    if state["validated"] or state["attempt"] >= MAX_ATTEMPTS:
        return "end"
    return "fix"


def build_graph():
    graph = StateGraph(GraphState)
    graph.add_node("generate", generate_node)
    graph.add_node("validate", validate_node)
    graph.add_node("fix", fix_node)

    graph.set_entry_point("generate")
    graph.add_edge("generate", "validate")
    graph.add_conditional_edges("validate", _should_continue, {"end": END, "fix": "fix"})
    graph.add_edge("fix", "validate")

    return graph.compile()


_compiled_graph = build_graph()


def run_generation(canvas: dict) -> dict:
    initial_state: GraphState = {
        "canvas": canvas,
        "attempt": 0,
        "main_tf": "",
        "variables_tf": "",
        "outputs_tf": "",
        "validated": False,
        "errors": [],
    }
    final_state = _compiled_graph.invoke(initial_state)
    return {
        "files": {
            "main.tf": final_state["main_tf"],
            "variables.tf": final_state["variables_tf"],
            "outputs.tf": final_state["outputs_tf"],
        },
        "validated": final_state["validated"],
        "attempts": final_state["attempt"],
        "errors": final_state["errors"],
    }
