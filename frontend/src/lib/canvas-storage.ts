import type { Edge, Node } from "@xyflow/react";
import { awsResources } from "./aws-resources";
import { getDefaultNodeConfig, type AwsPropertyValue } from "./aws-schema";

export interface SavedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  parentId?: string;
  extent?: "parent";
  width?: number;
  height?: number;
  style?: { width?: number; height?: number };
  data: {
    label: string;
    resourceType: string;
    config?: Record<string, AwsPropertyValue>;
  };
}

export interface SavedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  data?: {
    relationship?: string;
  };
}

export interface CanvasData {
  version: number;
  nodes: SavedNode[];
  edges: SavedEdge[];
}

const STORAGE_KEY = "terrarium-canvas" as const;

export function serializeNodes(nodes: Node[]): SavedNode[] {
  return nodes.map((node) => {
    const saved: SavedNode = {
      id: node.id,
      type: node.type ?? "aws-resource",
      position: node.position,
      data: {
        label: node.data.label as string,
        resourceType: node.data.resourceType as string,
        config:
          (node.data.config as Record<string, AwsPropertyValue> | undefined) ??
          getDefaultNodeConfig(node.data.resourceType as string),
      },
    };

    // Persist VPC container fields
    if (node.parentId) saved.parentId = node.parentId;
    if (node.extent === "parent") saved.extent = "parent";
    // Save width/height as direct properties (updated by NodeResizer)
    // and also as style (used for initial CSS sizing)
    const w = node.width ?? (node.style?.width as number | undefined);
    const h = node.height ?? (node.style?.height as number | undefined);
    if (w) {
      saved.width = w;
      saved.style = { ...saved.style, width: w };
    }
    if (h) {
      saved.height = h;
      saved.style = { ...saved.style, height: h };
    }

    return saved;
  });
}

export function serializeEdges(edges: Edge[]): SavedEdge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label as string | undefined,
    data: edge.data as { relationship?: string } | undefined,
  }));
}

export function saveCanvas(nodes: Node[], edges: Edge[]): void {
  const data: CanvasData = {
    version: 2,
    nodes: serializeNodes(nodes),
    edges: serializeEdges(edges),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Turn a saved/template CanvasData payload into live React Flow nodes/edges.
// Used by both loadCanvas (localStorage) and the template gallery.
//
// `mergeConfigDefaults` layers each node's (possibly partial) config over the
// resource's default config, so templates only need to specify the interesting
// overrides while every other field still gets a sensible default — important
// for the cost estimate and Terraform generation to have complete config.
export function hydrateCanvas(
  data: CanvasData,
  opts: { mergeConfigDefaults?: boolean } = {},
): { nodes: Node[]; edges: Edge[] } {
  const isLegacyVersion = !data.version || data.version <= 1;

  const nodes: Node[] = data.nodes.map((saved) => {
    const resource = awsResources.find((r) => r.id === saved.data.resourceType);

    const config = opts.mergeConfigDefaults
      ? {
          ...getDefaultNodeConfig(saved.data.resourceType),
          ...(saved.data.config ?? {}),
        }
      : saved.data.config ?? getDefaultNodeConfig(saved.data.resourceType);

    const node: Node = {
      id: saved.id,
      type: saved.type,
      position: saved.position,
      data: {
        ...saved.data,
        icon: resource?.icon ?? "",
        config,
      },
    };

    // Restore VPC container fields
    if (saved.parentId) node.parentId = saved.parentId;
    if (saved.extent === "parent") node.extent = "parent";
    // Restore both width/height and style so React Flow and CSS both have correct dimensions
    if (saved.width) node.width = saved.width;
    if (saved.height) node.height = saved.height;
    if (saved.style) node.style = saved.style;

    return node;
  });

  const edges: Edge[] = data.edges.map((edge) => {
    if (!isLegacyVersion) return edge as Edge;

    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    const sourceLabel = sourceNode?.data?.label as string | undefined;
    const targetLabel = targetNode?.data?.label as string | undefined;

    const relationship =
      sourceLabel && targetLabel
        ? `${sourceLabel} -> ${targetLabel}`
        : edge.data?.relationship ?? "connected to";

    return {
      ...edge,
      label: edge.label ?? relationship,
      data: {
        ...edge.data,
        relationship,
      },
    };
  });

  return { nodes, edges };
}

export function loadCanvas(): { nodes: Node[]; edges: Edge[] } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return hydrateCanvas(JSON.parse(raw) as CanvasData);
  } catch {
    return null;
  }
}
