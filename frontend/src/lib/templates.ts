import type { CanvasData } from "./canvas-storage";
import type { AwsResourceType } from "./aws-schema";

export interface Template {
  id: string;
  name: string;
  description: string;
  resourceTypes: AwsResourceType[];
  data: CanvasData;
}

// Templates are authored as CanvasData (the same shape saveCanvas produces).
// Node configs are partial — hydrateCanvas(..., { mergeConfigDefaults: true })
// fills the rest from each resource's schema defaults. Child node positions are
// relative to their parent VPC container.

const threeTier: CanvasData = {
  version: 2,
  nodes: [
    {
      id: "t3-vpc",
      type: "vpc-container",
      position: { x: 80, y: 80 },
      width: 660,
      height: 420,
      style: { width: 660, height: 420 },
      data: {
        label: "Application VPC",
        resourceType: "aws-vpc",
        config: { name: "app-vpc", cidrBlock: "10.0.0.0/16" },
      },
    },
    {
      id: "t3-public-subnet",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 30, y: 70 },
      data: {
        label: "Public Subnet",
        resourceType: "aws-subnet",
        config: { name: "public-1a", cidrBlock: "10.0.1.0/24", subnetType: "public" },
      },
    },
    {
      id: "t3-private-subnet",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 30, y: 250 },
      data: {
        label: "Private Subnet",
        resourceType: "aws-subnet",
        config: { name: "private-1a", cidrBlock: "10.0.2.0/24", subnetType: "private" },
      },
    },
    {
      id: "t3-alb",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 250, y: 50 },
      data: {
        label: "Load Balancer",
        resourceType: "aws-alb",
        config: { name: "app-alb", listenerProtocol: "https" },
      },
    },
    {
      id: "t3-ec2",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 470, y: 150 },
      data: {
        label: "App Server",
        resourceType: "aws-ec2",
        config: { name: "app-server", instanceType: "t3.small" },
      },
    },
    {
      id: "t3-rds",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 250, y: 280 },
      data: {
        label: "Database",
        resourceType: "aws-rds",
        config: {
          name: "app-db",
          engine: "postgres",
          instanceClass: "db.t3.small",
          multiAz: "enabled",
        },
      },
    },
    {
      id: "t3-sg",
      type: "aws-resource",
      parentId: "t3-vpc",
      extent: "parent",
      position: { x: 470, y: 300 },
      data: {
        label: "Security Group",
        resourceType: "aws-security-group",
        config: { name: "app-sg" },
      },
    },
  ],
  edges: [
    edge("t3-e1", "t3-alb", "t3-ec2", "ALB → App Server"),
    edge("t3-e2", "t3-ec2", "t3-rds", "App Server → Database"),
    edge("t3-e3", "t3-sg", "t3-rds", "Security Group → Database"),
    edge("t3-e4", "t3-private-subnet", "t3-ec2", "Subnet → App Server"),
  ],
};

const serverlessApi: CanvasData = {
  version: 2,
  nodes: [
    node("sl-apigw", "aws-api-gateway", "HTTP API", { x: 120, y: 160 }, {
      name: "public-api",
      apiType: "http",
    }),
    node("sl-lambda", "aws-lambda", "Request Handler", { x: 400, y: 160 }, {
      name: "api-handler",
      runtime: "python3.12",
      memoryMb: "512",
    }),
    node("sl-ddb", "aws-dynamodb", "Data Table", { x: 680, y: 160 }, {
      name: "app-table",
      capacityMode: "on-demand",
    }),
  ],
  edges: [
    edge("sl-e1", "sl-apigw", "sl-lambda", "API Gateway → Lambda"),
    edge("sl-e2", "sl-lambda", "sl-ddb", "Lambda → DynamoDB"),
  ],
};

const dataPipeline: CanvasData = {
  version: 2,
  nodes: [
    node("dp-s3", "aws-s3", "Raw Data Bucket", { x: 120, y: 100 }, {
      name: "raw-data",
      storageClass: "standard",
      estimatedStorageGb: "500",
    }),
    node("dp-sqs", "aws-sqs", "Ingest Queue", { x: 120, y: 300 }, {
      name: "ingest-queue",
      queueType: "standard",
    }),
    node("dp-lambda", "aws-lambda", "Processor", { x: 420, y: 200 }, {
      name: "processor",
      runtime: "python3.12",
      memoryMb: "1024",
    }),
    node("dp-ddb", "aws-dynamodb", "Processed Store", { x: 720, y: 100 }, {
      name: "processed",
      capacityMode: "on-demand",
    }),
    node("dp-cw", "aws-cloudwatch", "Pipeline Alarms", { x: 720, y: 300 }, {
      name: "pipeline-alarms",
    }),
  ],
  edges: [
    edge("dp-e1", "dp-s3", "dp-lambda", "S3 → Processor"),
    edge("dp-e2", "dp-sqs", "dp-lambda", "Queue → Processor"),
    edge("dp-e3", "dp-lambda", "dp-ddb", "Processor → DynamoDB"),
    edge("dp-e4", "dp-lambda", "dp-cw", "Processor → CloudWatch"),
  ],
};

export const TEMPLATES: Template[] = [
  {
    id: "three-tier-web",
    name: "3-Tier Web App",
    description:
      "Classic web architecture: a load balancer in front of an app server backed by a managed PostgreSQL database, inside a VPC.",
    resourceTypes: ["aws-vpc", "aws-alb", "aws-ec2", "aws-rds", "aws-security-group"],
    data: threeTier,
  },
  {
    id: "serverless-api",
    name: "Serverless API",
    description:
      "An HTTP API Gateway routing to a Lambda function that reads and writes a DynamoDB table. No servers to manage.",
    resourceTypes: ["aws-api-gateway", "aws-lambda", "aws-dynamodb"],
    data: serverlessApi,
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline",
    description:
      "Event-driven ingestion: objects land in S3 and messages in SQS, a Lambda processor writes results to DynamoDB, with CloudWatch alarms.",
    resourceTypes: ["aws-s3", "aws-sqs", "aws-lambda", "aws-dynamodb", "aws-cloudwatch"],
    data: dataPipeline,
  },
];

// --- small authoring helpers ---

function node(
  id: string,
  resourceType: AwsResourceType,
  label: string,
  position: { x: number; y: number },
  config: Record<string, string | string[]>,
): CanvasData["nodes"][number] {
  return {
    id,
    type: "aws-resource",
    position,
    data: { label, resourceType, config },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  relationship: string,
): CanvasData["edges"][number] {
  return { id, source, target, label: relationship, data: { relationship } };
}
