import EC2Icon from "../assets/icons/Resource-Icons_01302026/Res_Compute/Res_Amazon-EC2_Instance_48.svg";
import VPCIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Virtual-private-cloud-VPC_48.svg";
import SubnetIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Elastic-Network-Interface_48.svg";
import SecurityGroupIcon from "../assets/icons/Resource-Icons_01302026/Res_Security-Identity/Res_AWS-Network-Firewall_Endpoints_48.svg";
import InternetGatewayIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Internet-Gateway_48.svg";
import NatGatewayIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_NAT-Gateway_48.svg";
import VpcEndpointIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Endpoints_48.svg";
import NetworkAclIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Network-Access-Control-List_48.svg";
import S3Icon from "../assets/icons/Resource-Icons_01302026/Res_Storage/Res_Amazon-Simple-Storage-Service_S3-Standard_48.svg";
import RDSIcon from "../assets/icons/Resource-Icons_01302026/Res_Databases/Res_Amazon-RDS_Multi-AZ_48.svg";
import LambdaIcon from "../assets/icons/Resource-Icons_01302026/Res_Compute/Res_AWS-Lambda_Lambda-Function_48.svg";
import ECSIcon from "../assets/icons/Resource-Icons_01302026/Res_Containers/Res_Amazon-Elastic-Container-Service_Service_48.svg";
import ECRIcon from "../assets/icons/Resource-Icons_01302026/Res_Containers/Res_Amazon-Elastic-Container-Registry_Registry_48.svg";
import IAMIcon from "../assets/icons/Resource-Icons_01302026/Res_Security-Identity/Res_AWS-Identity-Access-Management_Role_48.svg";
import CloudWatchIcon from "../assets/icons/Resource-Icons_01302026/Res_Management-Governance/Res_Amazon-CloudWatch_Alarm_48.svg";
import SNSIcon from "../assets/icons/Resource-Icons_01302026/Res_Application-Integration/Res_Amazon-Simple-Notification-Service_Topic_48.svg";
import SQSIcon from "../assets/icons/Resource-Icons_01302026/Res_Application-Integration/Res_Amazon-Simple-Queue-Service_Queue_48.svg";
import APIGatewayIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-API-Gateway_Endpoint_48.svg";
import DynamoDBIcon from "../assets/icons/Resource-Icons_01302026/Res_Databases/Res_Amazon-DynamoDB_Table_48.svg";
import ELBIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Classic-Load-Balancer_48.svg";
import ALBIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg";
import NLBIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Network-Load-Balancer_48.svg";
import Route53Icon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-Route-53_Resolver_48.svg";
import CloudFrontIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-CloudFront_Download-Distribution_48.svg";
import EBSIcon from "../assets/icons/Resource-Icons_01302026/Res_Storage/Res_Amazon-Elastic-Block-Store_Volume_48.svg";
import EFSIcon from "../assets/icons/Resource-Icons_01302026/Res_Storage/Res_Amazon-Elastic-File-System_File-System_48.svg";
import ElastiCacheIcon from "../assets/icons/Resource-Icons_01302026/Res_Databases/Res_Amazon-ElastiCache_Cache-Node_48.svg";

export type AwsResourceType =
  | "aws-ec2"
  | "aws-vpc"
  | "aws-subnet"
  | "aws-security-group"
  | "aws-internet-gateway"
  | "aws-nat-gateway"
  | "aws-vpc-endpoint"
  | "aws-network-acl"
  | "aws-s3"
  | "aws-rds"
  | "aws-lambda"
  | "aws-ecs"
  | "aws-ecr"
  | "aws-iam"
  | "aws-cloudwatch"
  | "aws-sns"
  | "aws-sqs"
  | "aws-api-gateway"
  | "aws-dynamodb"
  | "aws-elb"
  | "aws-alb"
  | "aws-nlb"
  | "aws-route53"
  | "aws-cloudfront"
  | "aws-ebs"
  | "aws-efs"
  | "aws-elasticache";

export type AwsPropertyValue = string | string[];
export type AwsPropertySection =
  | "Identity"
  | "Networking"
  | "Compute"
  | "Storage"
  | "Security"
  | "Integration"
  | "Observability";

export interface AwsPropertyOption {
  value: string;
  label: string;
}

export interface AwsPropertyDefinition {
  key: string;
  label: string;
  section: AwsPropertySection;
  inputType: "text" | "select" | "multiselect";
  required?: boolean;
  placeholder?: string;
  defaultValue?: AwsPropertyValue;
  options?: AwsPropertyOption[];
  optionResourceTypes?: AwsResourceType[];
  helperText?: string;
}

export interface AwsResourceDefinition {
  id: AwsResourceType;
  label: string;
  category: string;
  icon: string;
  properties: AwsPropertyDefinition[];
  allowedTargets: AwsResourceType[];
}

type AwsNodeConfig = Record<string, AwsPropertyValue>;

const envOptions: AwsPropertyOption[] = [
  { value: "dev", label: "Dev" },
  { value: "staging", label: "Staging" },
  { value: "prod", label: "Prod" },
];

const defaultIdentityProperties: AwsPropertyDefinition[] = [
  {
    key: "name",
    label: "Name",
    section: "Identity",
    inputType: "text",
    required: true,
    placeholder: "my-resource",
  },
  {
    key: "environment",
    label: "Environment",
    section: "Identity",
    inputType: "select",
    defaultValue: "dev",
    options: envOptions,
  },
];

const defaultNetworkPlacementProperties: AwsPropertyDefinition[] = [
  {
    key: "subnets",
    label: "Subnets",
    section: "Networking",
    inputType: "multiselect",
    optionResourceTypes: ["aws-subnet"],
    helperText: "Select one or more subnet nodes from this canvas.",
  },
  {
    key: "securityGroups",
    label: "Security Groups",
    section: "Security",
    inputType: "multiselect",
    optionResourceTypes: ["aws-security-group"],
    helperText: "Select one or more security group nodes from this canvas.",
  },
];

export const awsResourceCatalog: AwsResourceDefinition[] = [
  {
    id: "aws-vpc",
    label: "VPC",
    icon: VPCIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "cidrBlock",
        label: "CIDR Block",
        section: "Networking",
        inputType: "text",
        defaultValue: "10.0.0.0/16",
      },
      {
        key: "dnsHostnames",
        label: "DNS Hostnames",
        section: "Networking",
        inputType: "select",
        defaultValue: "enabled",
        options: [
          { value: "enabled", label: "Enabled" },
          { value: "disabled", label: "Disabled" },
        ],
      },
    ],
    allowedTargets: [
      "aws-subnet",
      "aws-internet-gateway",
      "aws-nat-gateway",
      "aws-vpc-endpoint",
      "aws-network-acl",
    ],
  },
  {
    id: "aws-subnet",
    label: "Subnet",
    icon: SubnetIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "cidrBlock",
        label: "CIDR Block",
        section: "Networking",
        inputType: "text",
        defaultValue: "10.0.1.0/24",
      },
      {
        key: "subnetType",
        label: "Subnet Type",
        section: "Networking",
        inputType: "select",
        defaultValue: "private",
        options: [
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
          { value: "isolated", label: "Isolated" },
        ],
      },
      {
        key: "availabilityZone",
        label: "Availability Zone",
        section: "Networking",
        inputType: "select",
        defaultValue: "us-east-1a",
        options: [
          { value: "us-east-1a", label: "us-east-1a" },
          { value: "us-east-1b", label: "us-east-1b" },
          { value: "us-east-1c", label: "us-east-1c" },
        ],
      },
    ],
    allowedTargets: [
      "aws-ec2",
      "aws-rds",
      "aws-alb",
      "aws-nlb",
      "aws-lambda",
      "aws-ecs",
      "aws-nat-gateway",
      "aws-vpc-endpoint",
      "aws-network-acl",
    ],
  },
  {
    id: "aws-security-group",
    label: "Security Group",
    icon: SecurityGroupIcon,
    category: "Security",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "ingressProfiles",
        label: "Ingress Profiles",
        section: "Security",
        inputType: "multiselect",
        defaultValue: ["https"],
        options: [
          { value: "ssh", label: "SSH (22)" },
          { value: "http", label: "HTTP (80)" },
          { value: "https", label: "HTTPS (443)" },
          { value: "postgres", label: "PostgreSQL (5432)" },
        ],
      },
    ],
    allowedTargets: ["aws-ec2", "aws-rds", "aws-alb", "aws-nlb", "aws-lambda"],
  },
  {
    id: "aws-internet-gateway",
    label: "Internet Gateway",
    icon: InternetGatewayIcon,
    category: "Networking",
    properties: [...defaultIdentityProperties],
    allowedTargets: ["aws-vpc", "aws-alb", "aws-nlb", "aws-api-gateway"],
  },
  {
    id: "aws-nat-gateway",
    label: "NAT Gateway",
    icon: NatGatewayIcon,
    category: "Networking",
    properties: [...defaultIdentityProperties, ...defaultNetworkPlacementProperties],
    allowedTargets: ["aws-subnet", "aws-vpc-endpoint", "aws-s3", "aws-dynamodb"],
  },
  {
    id: "aws-vpc-endpoint",
    label: "VPC Endpoint",
    icon: VpcEndpointIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "endpointType",
        label: "Endpoint Type",
        section: "Networking",
        inputType: "select",
        defaultValue: "gateway",
        options: [
          { value: "gateway", label: "Gateway" },
          { value: "interface", label: "Interface" },
        ],
      },
    ],
    allowedTargets: ["aws-s3", "aws-dynamodb", "aws-sqs", "aws-sns", "aws-ecr"],
  },
  {
    id: "aws-network-acl",
    label: "Network ACL",
    icon: NetworkAclIcon,
    category: "Security",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "aclMode",
        label: "ACL Mode",
        section: "Security",
        inputType: "select",
        defaultValue: "stateful-like",
        options: [
          { value: "stateful-like", label: "Stateful-like policy" },
          { value: "stateless-strict", label: "Stateless strict" },
        ],
      },
    ],
    allowedTargets: ["aws-subnet"],
  },
  {
    id: "aws-ec2",
    label: "EC2 Instance",
    icon: EC2Icon,
    category: "Compute",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "instanceType",
        label: "Instance Type",
        section: "Compute",
        inputType: "select",
        defaultValue: "t3.micro",
        options: [
          { value: "t3.micro", label: "t3.micro" },
          { value: "t3.small", label: "t3.small" },
          { value: "m6i.large", label: "m6i.large" },
        ],
      },
      {
        key: "operatingSystem",
        label: "Operating System",
        section: "Compute",
        inputType: "select",
        defaultValue: "amazon-linux",
        options: [
          { value: "amazon-linux", label: "Amazon Linux" },
          { value: "ubuntu", label: "Ubuntu" },
          { value: "windows", label: "Windows" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: [
      "aws-rds",
      "aws-s3",
      "aws-dynamodb",
      "aws-sqs",
      "aws-sns",
      "aws-elasticache",
      "aws-ebs",
      "aws-efs",
      "aws-cloudwatch",
    ],
  },
  {
    id: "aws-lambda",
    label: "Lambda",
    icon: LambdaIcon,
    category: "Compute",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "runtime",
        label: "Runtime",
        section: "Compute",
        inputType: "select",
        defaultValue: "nodejs22.x",
        options: [
          { value: "nodejs22.x", label: "Node.js 22.x" },
          { value: "python3.12", label: "Python 3.12" },
          { value: "java21", label: "Java 21" },
        ],
      },
      {
        key: "memoryMb",
        label: "Memory Profile",
        section: "Compute",
        inputType: "select",
        defaultValue: "512",
        options: [
          { value: "256", label: "256 MB" },
          { value: "512", label: "512 MB" },
          { value: "1024", label: "1024 MB" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: [
      "aws-rds",
      "aws-dynamodb",
      "aws-s3",
      "aws-sqs",
      "aws-sns",
      "aws-elasticache",
      "aws-cloudwatch",
    ],
  },
  {
    id: "aws-ecs",
    label: "ECS",
    icon: ECSIcon,
    category: "Containers",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "launchType",
        label: "Launch Type",
        section: "Compute",
        inputType: "select",
        defaultValue: "fargate",
        options: [
          { value: "fargate", label: "Fargate" },
          { value: "ec2", label: "EC2" },
        ],
      },
      {
        key: "desiredCount",
        label: "Desired Count",
        section: "Compute",
        inputType: "select",
        defaultValue: "2",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: [
      "aws-ecr",
      "aws-rds",
      "aws-dynamodb",
      "aws-sqs",
      "aws-sns",
      "aws-elasticache",
      "aws-cloudwatch",
    ],
  },
  {
    id: "aws-ecr",
    label: "ECR",
    icon: ECRIcon,
    category: "Containers",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "scanOnPush",
        label: "Image Scan On Push",
        section: "Security",
        inputType: "select",
        defaultValue: "enabled",
        options: [
          { value: "enabled", label: "Enabled" },
          { value: "disabled", label: "Disabled" },
        ],
      },
    ],
    allowedTargets: ["aws-ecs", "aws-lambda"],
  },
  {
    id: "aws-iam",
    label: "IAM Role",
    icon: IAMIcon,
    category: "Security",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "roleScope",
        label: "Role Scope",
        section: "Security",
        inputType: "select",
        defaultValue: "service",
        options: [
          { value: "service", label: "Service role" },
          { value: "workload", label: "Workload role" },
          { value: "cross-account", label: "Cross-account role" },
        ],
      },
    ],
    allowedTargets: ["aws-ec2", "aws-lambda", "aws-ecs"],
  },
  {
    id: "aws-cloudwatch",
    label: "CloudWatch",
    icon: CloudWatchIcon,
    category: "Observability",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "alarmSensitivity",
        label: "Alarm Sensitivity",
        section: "Observability",
        inputType: "select",
        defaultValue: "standard",
        options: [
          { value: "low", label: "Low" },
          { value: "standard", label: "Standard" },
          { value: "high", label: "High" },
        ],
      },
    ],
    allowedTargets: ["aws-sns", "aws-lambda"],
  },
  {
    id: "aws-sns",
    label: "SNS",
    icon: SNSIcon,
    category: "Integration",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "deliveryType",
        label: "Delivery Type",
        section: "Integration",
        inputType: "multiselect",
        defaultValue: ["sqs"],
        options: [
          { value: "sqs", label: "SQS" },
          { value: "lambda", label: "Lambda" },
          { value: "email", label: "Email" },
        ],
      },
    ],
    allowedTargets: ["aws-sqs", "aws-lambda"],
  },
  {
    id: "aws-sqs",
    label: "SQS",
    icon: SQSIcon,
    category: "Integration",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "queueType",
        label: "Queue Type",
        section: "Integration",
        inputType: "select",
        defaultValue: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "fifo", label: "FIFO" },
        ],
      },
    ],
    allowedTargets: ["aws-lambda", "aws-ecs", "aws-ec2"],
  },
  {
    id: "aws-api-gateway",
    label: "API Gateway",
    icon: APIGatewayIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "apiType",
        label: "API Type",
        section: "Networking",
        inputType: "select",
        defaultValue: "http",
        options: [
          { value: "http", label: "HTTP API" },
          { value: "rest", label: "REST API" },
          { value: "websocket", label: "WebSocket API" },
        ],
      },
      {
        key: "authMode",
        label: "Auth Mode",
        section: "Security",
        inputType: "select",
        defaultValue: "iam",
        options: [
          { value: "none", label: "None" },
          { value: "iam", label: "IAM" },
          { value: "jwt", label: "JWT/Cognito" },
        ],
      },
    ],
    allowedTargets: ["aws-lambda", "aws-ecs", "aws-ec2", "aws-alb", "aws-nlb"],
  },
  {
    id: "aws-dynamodb",
    label: "DynamoDB",
    icon: DynamoDBIcon,
    category: "Database",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "capacityMode",
        label: "Capacity Mode",
        section: "Storage",
        inputType: "select",
        defaultValue: "on-demand",
        options: [
          { value: "on-demand", label: "On-demand" },
          { value: "provisioned", label: "Provisioned" },
        ],
      },
    ],
    allowedTargets: [],
  },
  {
    id: "aws-rds",
    label: "RDS",
    icon: RDSIcon,
    category: "Database",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "engine",
        label: "Engine",
        section: "Storage",
        inputType: "select",
        defaultValue: "postgresql",
        options: [
          { value: "postgresql", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL" },
          { value: "aurora-postgresql", label: "Aurora PostgreSQL" },
        ],
      },
      {
        key: "multiAz",
        label: "Multi-AZ",
        section: "Storage",
        inputType: "select",
        defaultValue: "enabled",
        options: [
          { value: "enabled", label: "Enabled" },
          { value: "disabled", label: "Disabled" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-cloudwatch"],
  },
  {
    id: "aws-elasticache",
    label: "ElastiCache",
    icon: ElastiCacheIcon,
    category: "Database",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "engine",
        label: "Engine",
        section: "Storage",
        inputType: "select",
        defaultValue: "redis",
        options: [
          { value: "redis", label: "Redis" },
          { value: "memcached", label: "Memcached" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-cloudwatch"],
  },
  {
    id: "aws-s3",
    label: "S3",
    icon: S3Icon,
    category: "Storage",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "storageClass",
        label: "Storage Class",
        section: "Storage",
        inputType: "select",
        defaultValue: "standard",
        options: [
          { value: "standard", label: "Standard" },
          { value: "intelligent-tiering", label: "Intelligent-Tiering" },
          { value: "glacier-instant", label: "Glacier Instant Retrieval" },
        ],
      },
      {
        key: "publicAccess",
        label: "Public Access",
        section: "Security",
        inputType: "select",
        defaultValue: "blocked",
        options: [
          { value: "blocked", label: "Blocked" },
          { value: "controlled", label: "Controlled via policy" },
        ],
      },
    ],
    allowedTargets: ["aws-cloudfront", "aws-lambda", "aws-cloudwatch"],
  },
  {
    id: "aws-ebs",
    label: "EBS",
    icon: EBSIcon,
    category: "Storage",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "volumeType",
        label: "Volume Type",
        section: "Storage",
        inputType: "select",
        defaultValue: "gp3",
        options: [
          { value: "gp3", label: "gp3" },
          { value: "io2", label: "io2" },
          { value: "st1", label: "st1" },
        ],
      },
    ],
    allowedTargets: ["aws-ec2"],
  },
  {
    id: "aws-efs",
    label: "EFS",
    icon: EFSIcon,
    category: "Storage",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "throughputMode",
        label: "Throughput Mode",
        section: "Storage",
        inputType: "select",
        defaultValue: "elastic",
        options: [
          { value: "elastic", label: "Elastic" },
          { value: "provisioned", label: "Provisioned" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-ec2", "aws-ecs", "aws-lambda"],
  },
  {
    id: "aws-elb",
    label: "ELB (Classic)",
    icon: ELBIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "scheme",
        label: "Scheme",
        section: "Networking",
        inputType: "select",
        defaultValue: "internet-facing",
        options: [
          { value: "internet-facing", label: "Internet-facing" },
          { value: "internal", label: "Internal" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-ec2"],
  },
  {
    id: "aws-alb",
    label: "ALB",
    icon: ALBIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "listenerProtocol",
        label: "Listener Protocol",
        section: "Networking",
        inputType: "select",
        defaultValue: "https",
        options: [
          { value: "http", label: "HTTP" },
          { value: "https", label: "HTTPS" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-ec2", "aws-ecs", "aws-lambda", "aws-cloudwatch"],
  },
  {
    id: "aws-nlb",
    label: "NLB",
    icon: NLBIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "listenerProtocol",
        label: "Listener Protocol",
        section: "Networking",
        inputType: "select",
        defaultValue: "tcp",
        options: [
          { value: "tcp", label: "TCP" },
          { value: "tls", label: "TLS" },
          { value: "udp", label: "UDP" },
        ],
      },
      ...defaultNetworkPlacementProperties,
    ],
    allowedTargets: ["aws-ec2", "aws-ecs", "aws-cloudwatch"],
  },
  {
    id: "aws-route53",
    label: "Route 53",
    icon: Route53Icon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "recordType",
        label: "Record Type",
        section: "Networking",
        inputType: "select",
        defaultValue: "a",
        options: [
          { value: "a", label: "A/AAAA Alias" },
          { value: "cname", label: "CNAME" },
          { value: "weighted", label: "Weighted Route" },
        ],
      },
    ],
    allowedTargets: [
      "aws-cloudfront",
      "aws-alb",
      "aws-nlb",
      "aws-elb",
      "aws-api-gateway",
      "aws-s3",
    ],
  },
  {
    id: "aws-cloudfront",
    label: "CloudFront",
    icon: CloudFrontIcon,
    category: "Networking",
    properties: [
      ...defaultIdentityProperties,
      {
        key: "cachePolicy",
        label: "Cache Policy",
        section: "Networking",
        inputType: "select",
        defaultValue: "optimized",
        options: [
          { value: "optimized", label: "Caching Optimized" },
          { value: "disabled", label: "Caching Disabled" },
        ],
      },
    ],
    allowedTargets: ["aws-s3", "aws-alb", "aws-api-gateway"],
  },
];

export const awsResourceMap = new Map(
  awsResourceCatalog.map((resource) => [resource.id, resource]),
);

export function getAwsResourceDefinition(resourceType?: string | null) {
  if (!resourceType) return undefined;
  return awsResourceMap.get(resourceType as AwsResourceType);
}

export function getDefaultNodeConfig(
  resourceType?: string | null,
): AwsNodeConfig {
  const resource = getAwsResourceDefinition(resourceType);
  if (!resource) return {};

  return resource.properties.reduce<AwsNodeConfig>((acc, property) => {
    if (property.defaultValue !== undefined) {
      acc[property.key] = property.defaultValue;
      return acc;
    }

    if (property.inputType === "multiselect") {
      acc[property.key] = [];
      return acc;
    }

    acc[property.key] = "";
    return acc;
  }, {});
}

