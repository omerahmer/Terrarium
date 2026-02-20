import { useState, useCallback } from "react";
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
  type DefaultEdgeOptions,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import EC2Icon from "./assets/icons/Resource-Icons_01302026/Res_Compute/Res_Amazon-EC2_AMI_48.svg";
import ALBIcon from "./assets/icons/Resource-Icons_01302026/Res_Networking-Content-Delivery/Res_Elastic-Load-Balancing_Application-Load-Balancer_48.svg";
import AWSNode from "./components/AWSNode";

const nodeTypes = {
  "aws-resource": AWSNode,
};

const initialNodes: Node[] = [
  {
    id: "ec2-1",
    type: "aws-resource",
    data: { label: "EC2 server", resourceType: "aws-ec2", icon: EC2Icon },
    position: { x: 5, y: 5 },
  },
  {
    id: "ec2-2",
    type: "aws-resource",
    data: { label: "EC2 server", resourceType: "aws-ec2", icon: EC2Icon },
    position: { x: 5, y: 5 },
  },
  {
    id: "ec2-3",
    type: "aws-resource",
    data: { label: "EC2 server", resourceType: "aws-ec2", icon: EC2Icon },
    position: { x: 5, y: 5 },
  },
  {
    id: "alb-1",
    type: "aws-resource",
    data: { label: "ALB", resourceType: "aws-alb", icon: ALBIcon },
    position: { x: 5, y: 200 },
  },
];

const initialEdges: Edge[] = [];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

export default function Flow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
