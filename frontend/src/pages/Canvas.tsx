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
  hydrateCanvas,
  loadCanvas,
  saveCanvas,
  serializeEdges,
  serializeNodes,
} from "@/lib/canvas-storage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Boxes,
  FolderOpen,
  Gauge,
  Leaf,
  Save,
  ScanSearch,
  WandSparkles,
} from "lucide-react";
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
import TemplateGallery from "@/components/TemplateGallery";
import type { Template } from "@/lib/templates";
import ReviewPanel, { type ReviewResult } from "@/components/ReviewPanel";
import UserMenu from "@/components/UserMenu";
import ProjectsMenu from "@/components/ProjectsMenu";
import { useAuth } from "@/lib/auth";

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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const { user } = useAuth();

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

  const { screenToFlowPosition, fitView } = useReactFlow();

  // Replace the canvas with a fresh set of nodes/edges (from a template or a
  // loaded cloud project), persist locally, and reframe.
  const applyCanvas = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(sortNodes(newNodes));
      setEdges(newEdges);
      setSelectedNode(null);
      saveCanvas(newNodes, newEdges);
      requestAnimationFrame(() => fitView({ padding: 0.2 }));
    },
    [fitView],
  );

  const applyTemplate = useCallback(
    (template: Template) => {
      if (
        nodes.length > 0 &&
        !window.confirm(
          "Replace the current canvas with this template? Unsaved changes will be lost.",
        )
      ) {
        return;
      }

      const hydrated = hydrateCanvas(template.data, { mergeConfigDefaults: true });
      applyCanvas(hydrated.nodes, hydrated.edges);
      setTemplatesOpen(false);
      toast.success(`Loaded "${template.name}"`);
    },
    [nodes, applyCanvas],
  );

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
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <header className="z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/82 px-3 backdrop-blur-xl">
          {/* Logo — links back to landing */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <div className="brand-mark flex size-7 items-center justify-center rounded-lg text-primary-foreground">
              <Leaf className="size-3.5" />
            </div>
            <span className="hidden text-sm tracking-tight sm:inline">Terrarium</span>
          </Link>

          <div className="w-px h-4 bg-border mx-1" />

          <SidebarTrigger />
          <ModeToggle />

          <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/25 px-2.5 py-1.5 lg:flex">
            <span className="signal-dot size-1.5 rounded-full bg-primary" />
            <span className="font-mono text-[8px] uppercase tracking-[0.13em] text-muted-foreground">
              Local canvas · {nodes.length} nodes
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTemplatesOpen(true)}
            title="Open templates"
          >
            <Boxes className="size-3.5" />
            <span className="hidden xl:inline">Templates</span>
          </Button>
          {user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setProjectsOpen(true)}
              title="Open saved projects"
            >
              <FolderOpen className="size-3.5" />
              <span className="hidden xl:inline">Projects</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              saveCanvas(nodes, edges);
              toast.success("Canvas saved!");
            }}
            title="Save canvas locally"
          >
            <Save className="size-3.5" />
            <span className="hidden xl:inline">Save</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCostPanelOpen(true)}
            title="Estimated monthly cost"
          >
            <Gauge className="size-3.5" />
            <span className="font-mono text-[10px]">~$
            {costEstimate.monthlyTotal.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
            /mo</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReview}
            disabled={isReviewing}
            title="Review architecture"
          >
            <ScanSearch className="size-3.5" />
            <span className="hidden 2xl:inline">
              {isReviewing ? "Reviewing..." : "Review architecture"}
            </span>
          </Button>
          <Button size="sm" onClick={onGenerate} disabled={isGenerating} title="Generate Terraform">
            <WandSparkles className="size-3.5" />
            <span className="hidden lg:inline">
              {isGenerating ? "Generating..." : "Generate Terraform"}
            </span>
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <UserMenu />
        </header>

        {/* Canvas fills remaining height */}
        <div
          className="app-canvas relative flex-1 overflow-hidden"
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
            fitView
            fitViewOptions={fitViewOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            onSelectionChange={onSelectionChange}
          >
            <Background gap={24} size={1} />
            <Controls />
          </ReactFlow>
          {nodes.length === 0 && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(90%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card/78 px-6 py-5 text-center shadow-2xl backdrop-blur-md">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Boxes className="size-4" />
              </div>
              <p className="text-sm font-medium tracking-tight">Plant the first resource</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Drag an AWS service from the library. Connect resources to describe how the system works.
              </p>
            </div>
          )}
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
          <TemplateGallery
            open={templatesOpen}
            onClose={() => setTemplatesOpen(false)}
            onApply={applyTemplate}
          />
          <ProjectsMenu
            open={projectsOpen}
            onClose={() => setProjectsOpen(false)}
            nodes={nodes}
            edges={edges}
            onApply={applyCanvas}
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
