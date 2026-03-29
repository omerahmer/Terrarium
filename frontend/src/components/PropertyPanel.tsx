import { type Node } from "@xyflow/react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertyPanelProps {
  node: Node | null;
  onChange: (updated: Node) => void;
  onClose: () => void;
}

// Map resourceType IDs to human-readable names
const resourceTypeLabels: Record<string, string> = {
  "aws-ec2": "EC2 Instance",
  "aws-vpc": "VPC",
  "aws-s3": "S3 Bucket",
  "aws-rds": "RDS Database",
  "aws-lambda": "Lambda Function",
  "aws-ecs": "ECS Service",
  "aws-ecr": "ECR Registry",
  "aws-iam": "IAM Role",
  "aws-cloudwatch": "CloudWatch Alarm",
  "aws-sns": "SNS Topic",
  "aws-sqs": "SQS Queue",
  "aws-api-gateway": "API Gateway",
  "aws-dynamodb": "DynamoDB Table",
  "aws-elb": "ELB (Classic)",
  "aws-alb": "Application Load Balancer",
  "aws-nlb": "Network Load Balancer",
  "aws-route53": "Route 53",
  "aws-cloudfront": "CloudFront Distribution",
  "aws-ebs": "EBS Volume",
  "aws-efs": "EFS File System",
  "aws-elasticache": "ElastiCache",
};

export default function PropertyPanel({
  node,
  onChange,
  onClose,
}: PropertyPanelProps) {
  const isOpen = node !== null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!node) return;
    onChange({
      ...node,
      data: {
        ...node.data,
        label: e.target.value,
      },
    });
  };

  const resourceType = node?.data?.resourceType as string | undefined;
  const resourceLabel = resourceType
    ? (resourceTypeLabels[resourceType] ?? resourceType)
    : "";
  const icon = node?.data?.icon as string | undefined;

  return (
    <div
      className={[
        "fixed top-4 right-4 z-50 w-72",
        "transition-all duration-300 ease-in-out",
        isOpen
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-4 pointer-events-none",
      ].join(" ")}
    >
      <Card className="shadow-xl border-border bg-card gap-0 py-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {icon && (
                <img
                  src={icon}
                  alt={resourceLabel}
                  className="w-6 h-6 shrink-0"
                />
              )}
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">
                  {resourceLabel || "Resource"}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {node?.id ?? ""}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 ml-2"
              onClick={onClose}
            >
              <X />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        </CardHeader>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[calc(100vh-8rem)]">
          <CardContent className="px-4 py-4 flex flex-col gap-4">
            {/* Display name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="node-label"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Display Name
              </label>
              <Input
                id="node-label"
                value={(node?.data?.label as string) ?? ""}
                onChange={handleLabelChange}
                placeholder="Enter a name..."
              />
            </div>

            <Separator />

            {/* Resource type — read only */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Resource Type
              </span>
              <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md">
                {resourceType ?? "—"}
              </span>
            </div>

            {/* Node ID — read only */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Node ID
              </span>
              <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md break-all">
                {node?.id ?? "—"}
              </span>
            </div>

            <Separator />

            {/* Position — read only, useful for debugging */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  X
                </span>
                <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md">
                  {Math.round(node?.position?.x ?? 0)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Y
                </span>
                <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md">
                  {Math.round(node?.position?.y ?? 0)}
                </span>
              </div>
            </div>

            {/* Placeholder for future resource-specific fields */}
            <Separator />
            <div className="text-xs text-muted-foreground text-center py-1">
              Resource-specific configuration coming soon
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
