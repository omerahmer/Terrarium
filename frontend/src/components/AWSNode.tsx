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
    <div className="aws-resource-node cursor-pointer p-3">
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
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-background/50">
          <img src={data.icon} alt="" className="size-6 object-contain" />
        </div>
        <span className="mt-1 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.11em] text-primary">
          <span className="size-1 rounded-full bg-primary" />
          active
        </span>
      </div>
      <span className="block max-w-28 truncate text-left text-[12px] font-medium text-foreground">
        {data.label}
      </span>
      <span className="mt-1 block truncate font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
        {data.resourceType.replace("aws-", "")}
      </span>
    </div>
  );
}
