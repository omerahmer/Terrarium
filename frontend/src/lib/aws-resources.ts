import EC2Icon from "../assets/icons/Resource-Icons_01302026/Res_Compute/Res_Amazon-EC2_Instance_48.svg";
import VPCIcon from "../assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Amazon-VPC_Virtual-private-cloud-VPC_48.svg";
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

export const awsResources = [
  {
    id: "aws-ec2",
    label: "EC2 Instance",
    icon: EC2Icon,
    category: "Compute",
  },
  {
    id: "aws-vpc",
    label: "VPC",
    icon: VPCIcon,
    category: "Networking",
  },
  {
    id: "aws-s3",
    label: "S3",
    icon: S3Icon,
    category: "Storage",
  },
  {
    id: "aws-rds",
    label: "RDS",
    icon: RDSIcon,
    category: "Database",
  },
  {
    id: "aws-lambda",
    label: "Lambda",
    icon: LambdaIcon,
    category: "Compute",
  },
  {
    id: "aws-ecs",
    label: "ECS",
    icon: ECSIcon,
    category: "Containers",
  },
  {
    id: "aws-ecr",
    label: "ECR",
    icon: ECRIcon,
    category: "Containers",
  },
  {
    id: "aws-iam",
    label: "IAM",
    icon: IAMIcon,
    category: "Security",
  },
  {
    id: "aws-cloudwatch",
    label: "CloudWatch",
    icon: CloudWatchIcon,
    category: "Management",
  },
  {
    id: "aws-sns",
    label: "SNS",
    icon: SNSIcon,
    category: "Integration",
  },
  {
    id: "aws-sqs",
    label: "SQS",
    icon: SQSIcon,
    category: "Integration",
  },
  {
    id: "aws-api-gateway",
    label: "API Gateway",
    icon: APIGatewayIcon,
    category: "Networking",
  },
  {
    id: "aws-dynamodb",
    label: "DynamoDB",
    icon: DynamoDBIcon,
    category: "Database",
  },
  {
    id: "aws-elb",
    label: "ELB (Classic)",
    icon: ELBIcon,
    category: "Networking",
  },
  {
    id: "aws-alb",
    label: "ALB",
    icon: ALBIcon,
    category: "Networking",
  },
  {
    id: "aws-nlb",
    label: "NLB",
    icon: NLBIcon,
    category: "Networking",
  },
  {
    id: "aws-route53",
    label: "Route 53",
    icon: Route53Icon,
    category: "Networking",
  },
  {
    id: "aws-cloudfront",
    label: "CloudFront",
    icon: CloudFrontIcon,
    category: "Networking",
  },
  {
    id: "aws-ebs",
    label: "EBS",
    icon: EBSIcon,
    category: "Storage",
  },
  {
    id: "aws-efs",
    label: "EFS",
    icon: EFSIcon,
    category: "Storage",
  },
  {
    id: "aws-elasticache",
    label: "ElastiCache",
    icon: ElastiCacheIcon,
    category: "Database",
  },
];
