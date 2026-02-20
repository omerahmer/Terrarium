import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

type EC2Node = Node<
  { label: string; resourceType: "aws-ec2"; icon: string },
  "aws-resource"
>;
type VPCNode = Node<
  { label: string; resourceType: "aws-vpc"; icon: string },
  "aws-resource"
>;

type S3Node = Node<
  { label: string; resourceType: "aws-s3"; icon: string },
  "aws-resource"
>;

type RDSNode = Node<
  { label: string; resourceType: "aws-rds"; icon: string },
  "aws-resource"
>;

type LambdaNode = Node<
  { label: string; resourceType: "aws-lambda"; icon: string },
  "aws-resource"
>;

type ECSNode = Node<
  { label: string; resourceType: "aws-ecs"; icon: string },
  "aws-resource"
>;

type IAMNode = Node<
  { label: string; resourceType: "aws-iam"; icon: string },
  "aws-resource"
>;

type CloudWatchNode = Node<
  { label: string; resourceType: "aws-cloudwatch"; icon: string },
  "aws-resource"
>;

type SNSNode = Node<
  { label: string; resourceType: "aws-sns"; icon: string },
  "aws-resource"
>;

type SQSNode = Node<
  { label: string; resourceType: "aws-sqs"; icon: string },
  "aws-resource"
>;

type APIGatewayNode = Node<
  { label: string; resourceType: "aws-api-gateway"; icon: string },
  "aws-resource"
>;

type DynamoDBNode = Node<
  { label: string; resourceType: "aws-dynamodb"; icon: string },
  "aws-resource"
>;

type ELBNode = Node<
  { label: string; resourceType: "aws-elb"; icon: string },
  "aws-resource"
>;

type Route53Node = Node<
  { label: string; resourceType: "aws-route53"; icon: string },
  "aws-resource"
>;

type CloudFrontNode = Node<
  { label: string; resourceType: "aws-cloudfront"; icon: string },
  "aws-resource"
>;

type EBSNode = Node<
  { label: string; resourceType: "aws-ebs"; icon: string },
  "aws-resource"
>;

type ALBNode = Node<
  { label: string; resourceType: "aws-alb"; icon: string },
  "aws-resource"
>;

type NLBNode = Node<
  { label: string; resourceType: "aws-nlb"; icon: string },
  "aws-resource"
>;

type ElastiCacheNode = Node<
  { label: string; resourceType: "aws-elasticache"; icon: string },
  "aws-resource"
>;

type SubnetNode = Node<
  { label: string; resourceType: "aws-subnet"; icon: string },
  "aws-resource"
>;

type SecurityGroupNode = Node<
  { label: string; resourceType: "aws-security-group"; icon: string },
  "aws-resource"
>;

type AWSResourceNode =
  | EC2Node
  | VPCNode
  | S3Node
  | RDSNode
  | LambdaNode
  | ECSNode
  | IAMNode
  | CloudWatchNode
  | SNSNode
  | SQSNode
  | APIGatewayNode
  | DynamoDBNode
  | ELBNode
  | Route53Node
  | CloudFrontNode
  | EBSNode
  | ALBNode
  | NLBNode
  | ElastiCacheNode
  | SubnetNode
  | SecurityGroupNode;

export default function AWSNode({ data }: NodeProps<AWSResourceNode>) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "#1e293b",
        border: "2px solid #475569",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        minWidth: "120px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ opacity: 0 }}
      />
      <img src={data.icon} alt={data.label} />
      <span
        style={{
          color: "#e2e8f0",
          fontSize: "13px",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {data.label}
      </span>
    </div>
  );
}
