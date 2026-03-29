import { useCallback } from "react";
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
  type OnSelectionChangeParams,
  type DefaultEdgeOptions,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useState } from "react";
import "@xyflow/react/dist/style.css";
import EC2Icon from "./assets/icons/Resource-Icons_01302026/Res_Compute/Res_Amazon-EC2_AMI_48.svg";
import ALBIcon from "./assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg";
import AWSNode from "./components/AWSNode";
import PropertyPanel from "./components/PropertyPanel";
import AppSidebar from "./components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

const nodeTypes = {
  "aws-resource": AWSNode,
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

function FlowCanvas() {
  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onSelectionChange = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes.length > 0 ? nodes[0] : null);
    },
    [],
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
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

      const newNode: Node = {
        id: `${resourceType}-${Date.now()}`,
        type: "aws-resource",
        position,
        data: { label, resourceType, icon },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition],
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="relative">
        <div className="absolute top-3 left-3 z-10">
          <SidebarTrigger />
          <ModeToggle />
        </div>

        <div
          className="w-full h-screen"
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
            onChange={(updated) => {
              setNodes((nds) =>
                nds.map((n) => (n.id === updated.id ? updated : n)),
              );
              setSelectedNode(updated);
            }}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}
