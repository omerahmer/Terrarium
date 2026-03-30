import type { Edge, Node } from "@xyflow/react";

interface SavedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    resourceType: string;
  };
}
import { awsResources } from "./aws-resources";

const STORAGE_KEY = "terrarium-canvas" as const;

export function saveCanvas(nodes: Node[], edges: Edge[]): void {
  const data = {
    version: 1,
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        resourceType: node.data.resourceType,
      },
    })),
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
    const data = JSON.parse(raw);
    const nodes: Node[] = data.nodes.map((saved: SavedNode) => {
      const resource = awsResources.find(
        (r) => r.id === saved.data.resourceType,
      );
      return {
        ...saved,
        data: {
          ...saved.data,
          icon: resource?.icon ?? " ",
        },
      };
    });
    return { nodes, edges: data.edges };
  } catch {
    return null;
  }
}
