import {
  NodeResizer,
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

type VPCNodeType = Node<
  { label: string; resourceType: "aws-vpc"; icon: string },
  "vpc-container"
>;

export default function VPCNode({
  data,
  selected,
  width,
  height,
}: NodeProps<VPCNodeType>) {
  return (
    <div
      style={{ width: width ?? 420, height: height ?? 300 }}
      className="relative"
    >
      <NodeResizer
        minWidth={240}
        minHeight={180}
        isVisible={selected}
        lineStyle={{ stroke: "#6366f1", strokeWidth: 1 }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: "#6366f1",
          border: "none",
        }}
      />

      {/* Container body */}
      <div className="w-full h-full rounded-xl border-2 border-dashed border-indigo-400/60 bg-indigo-400/5">
        {/* Label bar at top */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-indigo-400/40">
          {data.icon && (
            <img
              src={data.icon}
              alt={data.label}
              className="w-5 h-5 shrink-0 pointer-events-none"
            />
          )}
          <span className="text-xs font-semibold text-indigo-400 tracking-wide select-none">
            {data.label}
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ opacity: 0.4 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ opacity: 0.4 }}
      />
    </div>
  );
}
