import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type Connection,
  type OnSelectionChangeParams,
  type DefaultEdgeOptions,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useState } from "react";
import "@xyflow/react/dist/style.css";
import AWSNode from "@/components/AWSNode";
import VPCNode from "@/components/VPCNode";
import PropertyPanel from "@/components/PropertyPanel";
import AppSidebar from "@/components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  loadCanvas,
  saveCanvas,
  serializeEdges,
  serializeNodes,
} from "@/lib/canvas-storage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { getDefaultNodeConfig } from "@/lib/aws-schema";
import {
  buildRelationshipLabel,
  validateConnection,
} from "@/lib/relationship-rules";
import TerraformOutput, {
  type GenerateResult,
} from "@/components/TerraformOutput";
import CostPanel from "@/components/CostPanel";
import { estimateCanvasCost } from "@/lib/pricing";
import ReviewPanel, { type ReviewResult } from "@/components/ReviewPanel";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const nodeTypes = {
  "aws-resource": AWSNode,
  "vpc-container": VPCNode,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

// React Flow requires parent nodes to appear before their children in the array.
// Without this sort, dragging a VPC won't move its children correctly.
function sortNodes(nodes: Node[]): Node[] {
  return [...nodes].sort((a, b) => {
    if (!a.parentId && b.parentId) return -1;
    if (a.parentId && !b.parentId) return 1;
    return 0;
  });
}

function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(() =>
    sortNodes(loadCanvas()?.nodes ?? []),
  );
  const [edges, setEdges] = useState<Edge[]>(() => loadCanvas()?.edges ?? []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [costPanelOpen, setCostPanelOpen] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Live cost estimate — recomputes whenever nodes or their config change.
  const costEstimate = useMemo(() => estimateCanvasCost(nodes), [nodes]);

  const selectNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const updated = nds.map((n) => ({ ...n, selected: n.id === nodeId }));
      setSelectedNode(updated.find((n) => n.id === nodeId) ?? null);
      return updated;
    });
  }, []);

  const onGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: serializeNodes(nodes),
          edges: serializeEdges(edges),
        }),
      });

      if (!response.ok) {
        throw new Error(`Generate failed with status ${response.status}`);
      }

      const result: GenerateResult = await response.json();
      setGenerateResult(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate Terraform",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges]);

  const onReview = useCallback(async () => {
    setIsReviewing(true);
    try {
      const response = await fetch(`${API_URL}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: serializeNodes(nodes),
          edges: serializeEdges(edges),
        }),
      });

      if (!response.ok) {
        throw new Error(`Review failed with status ${response.status}`);
      }

      const result: ReviewResult = await response.json();
      setReviewResult(result);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to review architecture",
      );
    } finally {
      setIsReviewing(false);
    }
  }, [nodes, edges]);

  const highlightNodes = useCallback((nodeIds: string[]) => {
    const idSet = new Set(nodeIds);
    const first = nodeIds[0];
    setNodes((nds) => {
      const updated = nds.map((n) => ({ ...n, selected: idSet.has(n.id) }));
      setSelectedNode(updated.find((n) => n.id === first) ?? null);
      return updated;
    });
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes.length > 0 ? nodes[0] : null);
    },
    [],
  );

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds) ?? nds;
      setSelectedNode((sel) => {
        if (!sel) return null;
        const synced = updated.find((n) => n.id === sel.id);
        return synced ?? sel;
      });
      return updated;
    });
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds) ?? eds),
    [],
  );

  const tryCreateEdge = useCallback(
    (connection: Connection) => {
      let created = false;
      let reason = "Invalid relationship";

      setEdges((eds) => {
        const result = validateConnection({
          connection,
          nodes,
          edges: eds,
        });

        if (!result.isValid) {
          reason = result.reason ?? reason;
          return eds;
        }

        created = true;
        return (
          addEdge(
            {
              ...connection,
              animated: true,
              label: buildRelationshipLabel(
                result.sourceDefinition,
                result.targetDefinition,
              ),
              data: {
                relationship: buildRelationshipLabel(
                  result.sourceDefinition,
                  result.targetDefinition,
                ),
              },
            },
            eds,
          ) ?? eds
        );
      });

      if (!created) {
        toast.error(reason);
      }
    },
    [nodes],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      tryCreateEdge(connection);
    },
    [tryCreateEdge],
  );

  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const resourceType = event.dataTransfer.getData("application/reactflow");
      if (!resourceType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const label = event.dataTransfer.getData("resourceLabel");
      const icon = event.dataTransfer.getData("resourceIcon");

      // VPC gets its own container node type with a default size
      if (resourceType === "aws-vpc") {
        const vpcId = `aws-vpc-${Date.now()}`;
        const vpcWidth = 420;
        const vpcHeight = 300;

        const vpcNode: Node = {
          id: vpcId,
          type: "vpc-container",
          position,
          width: vpcWidth,
          height: vpcHeight,
          style: { width: vpcWidth, height: vpcHeight },
          data: {
            label,
            resourceType,
            icon,
            config: getDefaultNodeConfig(resourceType),
          },
        };

        setNodes((nds) => {
          // Adopt any existing non-VPC nodes that fall within the new VPC's bounds
          const adopted = nds.map((n) => {
            // Skip other VPC containers and nodes already owned by a VPC
            if (n.type === "vpc-container" || n.parentId) return n;

            const nodeX = n.position.x;
            const nodeY = n.position.y;
            const insideX =
              nodeX >= position.x && nodeX <= position.x + vpcWidth;
            const insideY =
              nodeY >= position.y && nodeY <= position.y + vpcHeight;

            if (!insideX || !insideY) return n;

            // Convert absolute position to relative position within the VPC
            return {
              ...n,
              parentId: vpcId,
              extent: "parent" as const,
              position: {
                x: nodeX - position.x,
                y: nodeY - position.y,
              },
            };
          });

          return sortNodes(adopted.concat(vpcNode));
        });
        return;
      }

      // For all other resources, check if drop landed inside a VPC container
      setNodes((nds) => {
        const parentVPC = nds.find((n) => {
          if (n.type !== "vpc-container") return false;
          const width = n.width ?? (n.style?.width as number) ?? 420;
          const height = n.height ?? (n.style?.height as number) ?? 300;
          return (
            position.x >= n.position.x &&
            position.x <= n.position.x + width &&
            position.y >= n.position.y &&
            position.y <= n.position.y + height
          );
        });

        const newNode: Node = {
          id: `${resourceType}-${Date.now()}`,
          type: "aws-resource",
          position: parentVPC
            ? {
                x: position.x - parentVPC.position.x,
                y: position.y - parentVPC.position.y,
              }
            : position,
          ...(parentVPC && {
            parentId: parentVPC.id,
            extent: "parent" as const,
          }),
          data: {
            label,
            resourceType,
            icon,
            config: getDefaultNodeConfig(resourceType),
          },
        };

        return sortNodes(nds.concat(newNode));
      });
    },
    [screenToFlowPosition],
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        {/* Header */}
        <header className="shrink-0 h-12 border-b border-border bg-background/80 backdrop-blur-sm flex items-center gap-2 px-3 z-10">
          {/* Logo — links back to landing */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Leaf className="size-3.5" />
            </div>
            <span className="text-sm tracking-tight">Terrarium</span>
          </Link>

          <div className="w-px h-4 bg-border mx-1" />

          <SidebarTrigger />
          <ModeToggle />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              saveCanvas(nodes, edges);
              toast.success("Canvas saved!");
            }}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCostPanelOpen(true)}
            title="Estimated monthly cost"
          >
            ~$
            {costEstimate.monthlyTotal.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            /mo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReview}
            disabled={isReviewing}
          >
            {isReviewing ? "Reviewing..." : "Review Architecture"}
          </Button>
          <Button size="sm" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Terraform"}
          </Button>
        </header>

        {/* Canvas fills remaining height */}
        <div
          className="flex-1 relative overflow-hidden"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDrag={onNodeDrag}
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            onSelectionChange={onSelectionChange}
          >
            <Background />
            <Controls />
          </ReactFlow>
          <PropertyPanel
            node={selectedNode}
            allNodes={nodes}
            onChange={(updated) => {
              setNodes((nds) =>
                nds.map((n) => (n.id === updated.id ? updated : n)),
              );
              setSelectedNode(updated);
            }}
            onRequestConnect={(targetId) => {
              if (!selectedNode) return;
              tryCreateEdge({
                source: selectedNode.id,
                target: targetId,
                sourceHandle: null,
                targetHandle: null,
              });
            }}
            onClose={() => setSelectedNode(null)}
          />
          <TerraformOutput
            result={generateResult}
            onClose={() => setGenerateResult(null)}
          />
          <CostPanel
            estimate={costEstimate}
            open={costPanelOpen}
            onClose={() => setCostPanelOpen(false)}
            onSelectNode={selectNode}
          />
          <ReviewPanel
            result={reviewResult}
            onClose={() => setReviewResult(null)}
            onSelectNodes={highlightNodes}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
