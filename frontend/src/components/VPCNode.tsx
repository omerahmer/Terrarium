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
        lineStyle={{ stroke: "var(--primary)", strokeWidth: 1 }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: "var(--primary)",
          border: "none",
        }}
      />

      {/* Container body */}
      <div className="vpc-resource-node h-full w-full rounded-2xl border border-dashed border-primary/45 bg-primary/[0.035] shadow-[inset_0_0_70px_color-mix(in_oklab,var(--primary)_3%,transparent)]">
        {/* Label bar at top */}
        <div className="flex items-center gap-2 border-b border-dashed border-primary/25 px-3 py-2.5">
          {data.icon && (
            <img
              src={data.icon}
              alt={data.label}
              className="w-5 h-5 shrink-0 pointer-events-none"
            />
          )}
          <span className="select-none text-xs font-medium tracking-tight text-primary">
            {data.label}
          </span>
          <span className="ml-auto font-mono text-[8px] uppercase tracking-[0.13em] text-primary/60">
            network boundary
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
