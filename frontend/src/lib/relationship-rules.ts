import type { Connection, Edge, Node } from "@xyflow/react";
import {
  getAwsResourceDefinition,
  type AwsResourceDefinition,
  type AwsResourceType,
} from "./aws-schema";

interface ValidationContext {
  connection: Connection;
  nodes: Node[];
  edges: Edge[];
}

export interface ConnectionValidationResult {
  isValid: boolean;
  reason?: string;
  source?: Node;
  target?: Node;
  sourceDefinition?: AwsResourceDefinition;
  targetDefinition?: AwsResourceDefinition;
}

function getNodeById(nodes: Node[], id?: string | null) {
  if (!id) return undefined;
  return nodes.find((node) => node.id === id);
}

function hasDuplicateConnection(edges: Edge[], source: string, target: string) {
  return edges.some((edge) => edge.source === source && edge.target === target);
}

function formatAllowedTargets(definition: AwsResourceDefinition) {
  if (definition.allowedTargets.length === 0) return "none";

  return definition.allowedTargets
    .map((type) => getAwsResourceDefinition(type)?.label ?? type)
    .join(", ");
}

function getResourceType(node?: Node): AwsResourceType | undefined {
  return node?.data?.resourceType as AwsResourceType | undefined;
}

export function validateConnection({
  connection,
  nodes,
  edges,
}: ValidationContext): ConnectionValidationResult {
  const source = getNodeById(nodes, connection.source);
  const target = getNodeById(nodes, connection.target);

  if (!source || !target) {
    return {
      isValid: false,
      reason: "Both source and target nodes are required.",
    };
  }

  if (source.id === target.id) {
    return {
      isValid: false,
      reason: "A node cannot connect to itself.",
      source,
      target,
    };
  }

  if (hasDuplicateConnection(edges, source.id, target.id)) {
    return {
      isValid: false,
      reason: "This relationship already exists.",
      source,
      target,
    };
  }

  const sourceDefinition = getAwsResourceDefinition(getResourceType(source));
  const targetDefinition = getAwsResourceDefinition(getResourceType(target));

  if (!sourceDefinition || !targetDefinition) {
    return {
      isValid: false,
      reason:
        "Unknown resource type detected. Re-drop the resource from the sidebar.",
      source,
      target,
      sourceDefinition,
      targetDefinition,
    };
  }

  if (!sourceDefinition.allowedTargets.includes(targetDefinition.id)) {
    return {
      isValid: false,
      reason: `${sourceDefinition.label} cannot connect to ${targetDefinition.label}. Allowed targets: ${formatAllowedTargets(sourceDefinition)}.`,
      source,
      target,
      sourceDefinition,
      targetDefinition,
    };
  }

  return {
    isValid: true,
    source,
    target,
    sourceDefinition,
    targetDefinition,
  };
}

export function buildRelationshipLabel(
  sourceDefinition?: AwsResourceDefinition,
  targetDefinition?: AwsResourceDefinition,
) {
  if (!sourceDefinition || !targetDefinition) return "connected to";
  return `${sourceDefinition.label} -> ${targetDefinition.label}`;
}

