import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
type AwsResourceNodeData = {
  label: string;
  resourceType: string;
  icon: string;
  config?: Record<string, string | string[]>;
};

export default function AWSNode({
  data,
}: NodeProps<Node<AwsResourceNodeData, "aws-resource">>) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "#1e293b",
        border: "2px solid #475569",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        minWidth: "120px",
        cursor: "pointer",
        transition: "border-color 0.2s",
      }}
    >
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ opacity: 0 }}
      />

      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ opacity: 0 }}
      />
      <img src={data.icon} alt={data.label} />
      <span
        style={{
          color: "#e2e8f0",
          fontSize: "13px",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {data.label}
      </span>
    </div>
  );
}
