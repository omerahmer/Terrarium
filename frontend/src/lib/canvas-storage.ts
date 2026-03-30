import type { Edge, Node } from "@xyflow/react";
import { awsResources } from "./aws-resources";

interface SavedNode {
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
  };
}

interface SavedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

interface CanvasData {
  version: number;
  nodes: SavedNode[];
  edges: SavedEdge[];
}

const STORAGE_KEY = "terrarium-canvas" as const;

export function saveCanvas(nodes: Node[], edges: Edge[]): void {
  const data: CanvasData = {
    version: 1,
    nodes: nodes.map((node) => {
      const saved: SavedNode = {
        id: node.id,
        type: node.type ?? "aws-resource",
        position: node.position,
        data: {
          label: node.data.label as string,
          resourceType: node.data.resourceType as string,
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
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadCanvas(): { nodes: Node[]; edges: Edge[] } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data: CanvasData = JSON.parse(raw);

    const nodes: Node[] = data.nodes.map((saved) => {
      const resource = awsResources.find(
        (r) => r.id === saved.data.resourceType,
      );

      const node: Node = {
        id: saved.id,
        type: saved.type,
        position: saved.position,
        data: {
          ...saved.data,
          icon: resource?.icon ?? "",
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

    return { nodes, edges: data.edges };
  } catch {
    return null;
  }
}
