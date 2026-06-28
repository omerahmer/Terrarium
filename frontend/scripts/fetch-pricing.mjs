// Generates frontend/src/lib/{aws-catalog-data,pricing-data}.ts from AWS's
// public Price List Bulk API (no AWS credentials required).
//
//   npm run fetch-pricing
//
// The big EC2 us-east-1 offer file (~477MB) is stream-parsed so we never hold it
// in memory; the other service files are small enough to JSON.parse directly.
//
// Dev: set PRICING_LOCAL_DIR=/path/to/predownloaded to read *.json from disk
// instead of downloading (used while iterating on this script).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import StreamJson from "stream-json";
import Pick from "stream-json/filters/Pick.js";
import StreamObject from "stream-json/streamers/StreamObject.js";

const { parser } = StreamJson;
const { pick } = Pick;
const { streamObject } = StreamObject;

const BASE = "https://pricing.us-east-1.amazonaws.com";
const REGION = "us-east-1";
const LOCAL_DIR = process.env.PRICING_LOCAL_DIR;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../src/lib");

// ---------- helpers ----------

async function regionFileUrl(service) {
  const idxUrl = `${BASE}/offers/v1.0/aws/${service}/current/region_index.json`;
  const idx = await (await fetch(idxUrl)).json();
  return BASE + idx.regions[REGION].currentVersionUrl;
}

// Resolve a service's us-east-1 offer file to a local path (download if needed).
async function offerFile(service, localName) {
  if (LOCAL_DIR) {
    const p = path.join(LOCAL_DIR, localName);
    if (fs.existsSync(p)) return p;
  }
  const url = await regionFileUrl(service);
  const tmp = path.join(os.tmpdir(), `terrarium-${localName}`);
  console.log(`  downloading ${service} → ${tmp}`);
  const res = await fetch(url);
  await pipeline(res.body, fs.createWriteStream(tmp));
  return tmp;
}

function priceOf(termsForSku) {
  // A SKU may have multiple tiered price dimensions (e.g. first 25GB free, then
  // $0.25). Take the largest rate, which is the meaningful unit price and is a
  // no-op for single-dimension products.
  let best = null;
  for (const term of Object.values(termsForSku ?? {})) {
    for (const dim of Object.values(term.priceDimensions ?? {})) {
      const usd = Number(dim.pricePerUnit?.USD);
      if (Number.isFinite(usd) && (best == null || usd > best)) best = usd;
    }
  }
  return best;
}

// memGiB("8 GiB") -> 8
function memGiB(raw) {
  const m = /([\d.]+)\s*GiB/i.exec(raw ?? "");
  return m ? Number(m[1]) : null;
}

// ---------- EC2 (streamed): instances + EBS + NAT ----------

async function loadEc2(file) {
  // Pass 1: products we care about → sku -> meta
  const instanceProducts = new Map(); // sku -> {instanceType, vcpu, memoryGiB}
  const ebsProducts = new Map(); // sku -> volumeApiName
  const ebsIopsProducts = new Map(); // sku -> volumeApiName
  const natProducts = new Set(); // sku

  await pipeline(
    fs.createReadStream(file),
    parser(),
    pick({ filter: "products" }),
    streamObject(),
    async function* (source) {
      for await (const { value: p } of source) {
        const a = p.attributes ?? {};
        const fam = p.productFamily;
        if (
          fam === "Compute Instance" &&
          a.operatingSystem === "Linux" &&
          a.tenancy === "Shared" &&
          a.capacitystatus === "Used" &&
          a.preInstalledSw === "NA" &&
          a.currentGeneration === "Yes"
        ) {
          instanceProducts.set(p.sku, {
            instanceType: a.instanceType,
            vcpu: Number(a.vcpu) || null,
            memoryGiB: memGiB(a.memory),
          });
        } else if (fam === "Storage" && a.volumeApiName) {
          ebsProducts.set(p.sku, a.volumeApiName);
        } else if (fam === "System Operation" && a.group === "EBS IOPS") {
          ebsIopsProducts.set(p.sku, a.volumeApiName ?? "io2");
        } else if (fam === "NAT Gateway" && /NatGateway-Hours/.test(a.usagetype ?? "")) {
          natProducts.add(p.sku);
        }
      }
    },
  );

  // Pass 2: on-demand prices for the collected SKUs
  const instances = {}; // instanceType -> {price, vcpu, memoryGiB}
  const ebs = {}; // volumeApiName -> $/GB-Mo
  const ebsIops = {}; // volumeApiName -> $/IOPS-Mo
  let nat = null;

  await pipeline(
    fs.createReadStream(file),
    parser(),
    pick({ filter: "terms.OnDemand" }),
    streamObject(),
    async function* (source) {
      for await (const { key: sku, value: terms } of source) {
        const price = priceOf(terms);
        if (price == null) continue;
        if (instanceProducts.has(sku)) {
          const meta = instanceProducts.get(sku);
          // Keep the cheapest (some types have multiple matching SKUs)
          const cur = instances[meta.instanceType];
          if (!cur || price < cur.price)
            instances[meta.instanceType] = { price, vcpu: meta.vcpu, memoryGiB: meta.memoryGiB };
        } else if (ebsProducts.has(sku)) {
          ebs[ebsProducts.get(sku)] = price;
        } else if (ebsIopsProducts.has(sku)) {
          ebsIops[ebsIopsProducts.get(sku)] = price;
        } else if (natProducts.has(sku) && nat == null) {
          nat = price;
        }
      }
    },
  );

  return { instances, ebs, ebsIops, nat };
}

// ---------- in-memory services ----------

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadRds(d) {
  const classes = {}; // instanceClass -> {vcpu, memoryGiB, engines: {engine: price}}
  let storage = null; // $/GB-Mo (general purpose)
  for (const [sku, p] of Object.entries(d.products)) {
    const a = p.attributes ?? {};
    if (
      p.productFamily === "Database Instance" &&
      a.deploymentOption === "Single-AZ" &&
      a.instanceType?.startsWith("db.") &&
      a.currentGeneration === "Yes"
    ) {
      const price = priceOf(d.terms.OnDemand[sku]);
      if (price == null) continue;
      const cls = (classes[a.instanceType] ??= {
        vcpu: Number(a.vcpu) || null,
        memoryGiB: memGiB(a.memory),
        engines: {},
      });
      cls.engines[a.databaseEngine] = price;
    } else if (
      p.productFamily === "Database Storage" &&
      a.deploymentOption === "Single-AZ" &&
      /General Purpose/i.test(a.volumeType ?? "") &&
      !/Aurora/i.test(a.volumeType ?? "") &&
      storage == null
    ) {
      storage = priceOf(d.terms.OnDemand[sku]);
    }
  }
  return { classes, storage };
}

function loadElastiCache(d) {
  const nodes = {}; // nodeType -> {vcpu, memoryGiB, price}
  for (const [sku, p] of Object.entries(d.products)) {
    const a = p.attributes ?? {};
    if (p.productFamily === "Cache Instance" && a.instanceType?.startsWith("cache.")) {
      const price = priceOf(d.terms.OnDemand[sku]);
      if (price == null) continue;
      const cur = nodes[a.instanceType];
      if (!cur || price < cur.price)
        nodes[a.instanceType] = { vcpu: Number(a.vcpu) || null, memoryGiB: memGiB(a.memory), price };
    }
  }
  return { nodes };
}

// Map AWS S3 "volumeType" → our storageClass option ids
const S3_CLASS_MAP = {
  Standard: "standard",
  "Intelligent-Tiering Frequent Access": "intelligent-tiering",
  "Glacier Instant Retrieval": "glacier-instant",
};
function loadS3(d) {
  const storage = {}; // storageClass id -> $/GB-Mo
  for (const [sku, p] of Object.entries(d.products)) {
    const a = p.attributes ?? {};
    const id = S3_CLASS_MAP[a.volumeType];
    if (p.productFamily === "Storage" && id && storage[id] == null) {
      storage[id] = priceOf(d.terms.OnDemand[sku]);
    }
  }
  return { storage };
}

// Pick the real regional (USE1- prefixed) non-zero price for a usagetype match.
function pickRegional(d, predicate) {
  let fallback = null;
  for (const [sku, p] of Object.entries(d.products)) {
    const a = p.attributes ?? {};
    if (!predicate(a, p)) continue;
    const price = priceOf(d.terms.OnDemand[sku]);
    if (price == null) continue;
    if ((a.usagetype ?? "").startsWith("USE1-") && price > 0) return price;
    if (price > 0 && fallback == null) fallback = price;
  }
  return fallback;
}

function loadLambda(d) {
  return {
    gbSecond: pickRegional(d, (a) => a.group === "AWS-Lambda-Duration"),
    request: pickRegional(d, (a) => a.group === "AWS-Lambda-Requests"),
  };
}

function loadDynamo(d) {
  return {
    readRequest: pickRegional(
      d,
      (a) => a.group === "DDB-ReadUnits" && /ReadRequestUnits/.test(a.usagetype ?? ""),
    ),
    writeRequest: pickRegional(
      d,
      (a) => a.group === "DDB-WriteUnits" && /WriteRequestUnits/.test(a.usagetype ?? ""),
    ),
    // The bulk file only exposes the free-tier ($0) rows for provisioned
    // capacity in us-east-1; fall back to AWS's published provisioned rates.
    rcuHour:
      pickRegional(
        d,
        (a) => a.group === "DDB-ReadUnits" && /ReadCapacityUnit-Hrs/.test(a.usagetype ?? ""),
      ) ?? 0.00013,
    wcuHour:
      pickRegional(
        d,
        (a) => a.group === "DDB-WriteUnits" && /WriteCapacityUnit-Hrs/.test(a.usagetype ?? ""),
      ) ?? 0.00065,
    // Standard table storage ($/GB-Mo beyond the 25GB free tier) — not the
    // PITR/backup or infrequent-access storage rows.
    storage: pickRegional(
      d,
      (a) =>
        /(^|-)TimedStorage-ByteHrs$/.test(a.usagetype ?? "") &&
        !/PITR|Backup|^IA-|-IA-/.test(a.usagetype ?? ""),
    ),
  };
}

function loadElb(d) {
  // ALB (Application) and NLB (Network) hourly LoadBalancerUsage — the plain
  // regional rate, excluding Outposts/LCU/dedicated variants.
  const pick = (family) =>
    pickRegional(
      d,
      (a, p) =>
        p.productFamily === family &&
        /LoadBalancerUsage/.test(a.usagetype ?? "") &&
        !/Outposts|Dedicated/.test(a.usagetype ?? ""),
    );
  return { alb: pick("Load Balancer-Application"), nlb: pick("Load Balancer-Network") };
}

// ---------- emit ----------

function sortedInstanceList(instances) {
  return Object.entries(instances)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, m]) => ({
      value,
      label: `${value} · ${m.vcpu ?? "?"} vCPU · ${m.memoryGiB ?? "?"} GiB`,
      vcpu: m.vcpu,
      memoryGiB: m.memoryGiB,
    }));
}

function ts(obj) {
  return JSON.stringify(obj, null, 2);
}

async function main() {
  console.log("Fetching AWS Price List (us-east-1, on-demand)…");
  const ec2 = await loadEc2(await offerFile("AmazonEC2", "ec2-useast1.json"));
  const rds = loadRds(loadJson(await offerFile("AmazonRDS", "rds.json")));
  const ec = loadElastiCache(loadJson(await offerFile("AmazonElastiCache", "elasticache.json")));
  const s3 = loadS3(loadJson(await offerFile("AmazonS3", "amazons3.json")));
  const lambda = loadLambda(loadJson(await offerFile("AWSLambda", "awslambda.json")));
  const dynamo = loadDynamo(loadJson(await offerFile("AmazonDynamoDB", "amazondynamodb.json")));
  const elb = loadElb(loadJson(await offerFile("AWSELB", "awselb.json")));

  const date = new Date().toISOString().slice(0, 10);

  const catalog = `// AUTO-GENERATED by scripts/fetch-pricing.mjs — do not edit by hand.
// AWS Price List, us-east-1, on-demand. Current-generation resources only.
export const CATALOG_SNAPSHOT_DATE = ${JSON.stringify(date)};

export interface SizingOption {
  value: string;
  label: string;
  vcpu: number | null;
  memoryGiB: number | null;
}

export const EC2_INSTANCE_TYPES: SizingOption[] = ${ts(sortedInstanceList(ec2.instances))};

export const RDS_INSTANCE_CLASSES: SizingOption[] = ${ts(
    sortedInstanceList(
      Object.fromEntries(Object.entries(rds.classes).map(([k, v]) => [k, { vcpu: v.vcpu, memoryGiB: v.memoryGiB }])),
    ),
  )};

export const ELASTICACHE_NODE_TYPES: SizingOption[] = ${ts(sortedInstanceList(ec.nodes))};
`;

  const pricing = `// AUTO-GENERATED by scripts/fetch-pricing.mjs — do not edit by hand.
// AWS Price List, us-east-1, on-demand. USD. Hourly unless noted.
export const PRICING_SNAPSHOT_DATE = ${JSON.stringify(date)};

export const PRICES = {
  ec2HourlyByType: ${ts(Object.fromEntries(Object.entries(ec2.instances).map(([k, v]) => [k, v.price])))} as Record<string, number>,
  rdsHourlyByClassEngine: ${ts(Object.fromEntries(Object.entries(rds.classes).map(([k, v]) => [k, v.engines])))} as Record<string, Record<string, number>>,
  rdsStoragePerGbMonth: ${rds.storage},
  elasticacheHourlyByNode: ${ts(Object.fromEntries(Object.entries(ec.nodes).map(([k, v]) => [k, v.price])))} as Record<string, number>,
  ebsPerGbMonth: ${ts(ec2.ebs)} as Record<string, number>,
  ebsIopsPerMonth: ${ts(ec2.ebsIops)} as Record<string, number>,
  s3PerGbMonth: ${ts(s3.storage)} as Record<string, number>,
  lambdaGbSecond: ${lambda.gbSecond},
  lambdaRequest: ${lambda.request},
  dynamoReadRequest: ${dynamo.readRequest},
  dynamoWriteRequest: ${dynamo.writeRequest},
  dynamoRcuHour: ${dynamo.rcuHour},
  dynamoWcuHour: ${dynamo.wcuHour},
  dynamoStoragePerGbMonth: ${dynamo.storage},
  natGatewayHourly: ${ec2.nat},
  albHourly: ${elb.alb},
  nlbHourly: ${elb.nlb},
} as const;
`;

  fs.writeFileSync(path.join(OUT_DIR, "aws-catalog-data.ts"), catalog);
  fs.writeFileSync(path.join(OUT_DIR, "pricing-data.ts"), pricing);
  console.log(
    `Wrote aws-catalog-data.ts (${Object.keys(ec2.instances).length} EC2 types, ` +
      `${Object.keys(rds.classes).length} RDS classes, ${Object.keys(ec.nodes).length} cache nodes) ` +
      `and pricing-data.ts.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
