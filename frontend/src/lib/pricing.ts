import type { Node } from "@xyflow/react";
import { PRICES, PRICING_SNAPSHOT_DATE } from "./pricing-data";

export const HOURS_PER_MONTH = 730;

// Blended S3 request price (GET/PUT mix), us-east-1. The bulk price file splits
// this across many tiered usage types, so we use a documented blended rate.
const S3_BLENDED_REQUEST = 0.0000004;

export type CostCategory = "compute" | "storage" | "usage" | "free";

export interface CostLineItem {
  nodeId: string;
  label: string;
  resourceType: string;
  monthlyCost: number;
  basis: string;
  category: CostCategory;
}

export interface CostEstimate {
  lineItems: CostLineItem[];
  monthlyTotal: number;
  snapshotDate: string;
}

const ENGINE_MAP: Record<string, string> = {
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
};

type Config = Record<string, string | string[]>;

function num(config: Config, key: string, fallback = 0): number {
  const v = config[key];
  const n = typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function str(config: Config, key: string, fallback = ""): string {
  const v = config[key];
  return typeof v === "string" ? v : fallback;
}

const FREE_TYPES = new Set([
  "aws-vpc",
  "aws-subnet",
  "aws-security-group",
  "aws-internet-gateway",
  "aws-network-acl",
  "aws-iam",
  "aws-cloudwatch",
]);

interface Priced {
  cost: number;
  basis: string;
  category: CostCategory;
}

function priceNode(resourceType: string, config: Config): Priced | null {
  switch (resourceType) {
    case "aws-ec2": {
      const type = str(config, "instanceType", "t3.micro");
      const hourly = PRICES.ec2HourlyByType[type];
      if (hourly == null) return null;
      return {
        cost: hourly * HOURS_PER_MONTH,
        basis: `${type} · $${hourly}/hr · ${HOURS_PER_MONTH} hrs/mo`,
        category: "compute",
      };
    }
    case "aws-rds": {
      const cls = str(config, "instanceClass", "db.t3.micro");
      const engine = ENGINE_MAP[str(config, "engine", "postgres")] ?? "PostgreSQL";
      const hourly = PRICES.rdsHourlyByClassEngine[cls]?.[engine];
      const multiAz = str(config, "multiAz") === "enabled";
      const storage = num(config, "allocatedStorageGb", 20) * PRICES.rdsStoragePerGbMonth;
      if (hourly == null) return null;
      const instance = hourly * HOURS_PER_MONTH * (multiAz ? 2 : 1);
      return {
        cost: instance + storage,
        basis: `${cls} ${engine}${multiAz ? " Multi-AZ" : ""} + ${num(config, "allocatedStorageGb", 20)}GB storage`,
        category: "compute",
      };
    }
    case "aws-elasticache": {
      const node = str(config, "nodeType", "cache.t3.micro");
      const hourly = PRICES.elasticacheHourlyByNode[node];
      const nodes = Math.max(1, num(config, "numNodes", 1));
      if (hourly == null) return null;
      return {
        cost: hourly * HOURS_PER_MONTH * nodes,
        basis: `${nodes}× ${node} · $${hourly}/hr`,
        category: "compute",
      };
    }
    case "aws-ebs": {
      const vt = str(config, "volumeType", "gp3");
      const size = num(config, "sizeGb", 20);
      const perGb = PRICES.ebsPerGbMonth[vt] ?? 0;
      const iops = num(config, "iops", 0);
      const iopsPrice = vt === "io2" ? iops * (PRICES.ebsIopsPerMonth[vt] ?? 0) : 0;
      return {
        cost: size * perGb + iopsPrice,
        basis: `${size}GB ${vt}${iopsPrice ? ` + ${iops} IOPS` : ""}`,
        category: "storage",
      };
    }
    case "aws-s3": {
      const cls = str(config, "storageClass", "standard");
      const gb = num(config, "estimatedStorageGb", 0);
      const reqs = num(config, "requestsPerMonth", 0);
      const perGb = PRICES.s3PerGbMonth[cls] ?? PRICES.s3PerGbMonth["standard"] ?? 0;
      return {
        cost: gb * perGb + reqs * S3_BLENDED_REQUEST,
        basis: `${gb}GB ${cls} + ${reqs.toLocaleString()} requests/mo`,
        category: "storage",
      };
    }
    case "aws-lambda": {
      const invocations = num(config, "invocationsPerMonth", 0);
      const memGb = num(config, "memoryMb", 512) / 1024;
      const durSec = num(config, "avgDurationMs", 200) / 1000;
      const cost =
        invocations * PRICES.lambdaRequest +
        invocations * memGb * durSec * PRICES.lambdaGbSecond;
      return {
        cost,
        basis: `${invocations.toLocaleString()} inv/mo · ${num(config, "memoryMb", 512)}MB · ${num(config, "avgDurationMs", 200)}ms`,
        category: "usage",
      };
    }
    case "aws-dynamodb": {
      const storage = num(config, "storageGb", 0) * PRICES.dynamoStoragePerGbMonth;
      if (str(config, "capacityMode") === "provisioned") {
        const rcu = num(config, "provisionedRcu", 0) * PRICES.dynamoRcuHour * HOURS_PER_MONTH;
        const wcu = num(config, "provisionedWcu", 0) * PRICES.dynamoWcuHour * HOURS_PER_MONTH;
        return {
          cost: rcu + wcu + storage,
          basis: `provisioned ${num(config, "provisionedRcu", 0)} RCU / ${num(config, "provisionedWcu", 0)} WCU + storage`,
          category: "usage",
        };
      }
      const reads = num(config, "readsPerMonth", 0) * PRICES.dynamoReadRequest;
      const writes = num(config, "writesPerMonth", 0) * PRICES.dynamoWriteRequest;
      return {
        cost: reads + writes + storage,
        basis: `on-demand ${num(config, "readsPerMonth", 0).toLocaleString()} reads / ${num(config, "writesPerMonth", 0).toLocaleString()} writes + storage`,
        category: "usage",
      };
    }
    case "aws-nat-gateway":
      return {
        cost: PRICES.natGatewayHourly * HOURS_PER_MONTH,
        basis: `$${PRICES.natGatewayHourly}/hr · ${HOURS_PER_MONTH} hrs/mo (excl. data processing)`,
        category: "compute",
      };
    case "aws-alb":
      return {
        cost: PRICES.albHourly * HOURS_PER_MONTH,
        basis: `$${PRICES.albHourly}/hr · ${HOURS_PER_MONTH} hrs/mo (excl. LCU)`,
        category: "compute",
      };
    case "aws-nlb":
      return {
        cost: PRICES.nlbHourly * HOURS_PER_MONTH,
        basis: `$${PRICES.nlbHourly}/hr · ${HOURS_PER_MONTH} hrs/mo (excl. LCU)`,
        category: "compute",
      };
    default:
      return null;
  }
}

export function estimateCanvasCost(nodes: Node[]): CostEstimate {
  const lineItems: CostLineItem[] = [];

  for (const node of nodes) {
    const resourceType = (node.data?.resourceType as string) ?? "";
    if (!resourceType) continue;
    const label = (node.data?.label as string) ?? node.id;
    const config = (node.data?.config as Config) ?? {};

    if (FREE_TYPES.has(resourceType)) {
      lineItems.push({
        nodeId: node.id,
        label,
        resourceType,
        monthlyCost: 0,
        basis: "No hourly charge",
        category: "free",
      });
      continue;
    }

    const priced = priceNode(resourceType, config);
    if (priced) {
      lineItems.push({ nodeId: node.id, label, resourceType, ...priced, monthlyCost: priced.cost });
    } else {
      lineItems.push({
        nodeId: node.id,
        label,
        resourceType,
        monthlyCost: 0,
        basis: "Usage-based — not modeled",
        category: "usage",
      });
    }
  }

  const monthlyTotal = lineItems.reduce((sum, item) => sum + item.monthlyCost, 0);
  return { lineItems, monthlyTotal, snapshotDate: PRICING_SNAPSHOT_DATE };
}
