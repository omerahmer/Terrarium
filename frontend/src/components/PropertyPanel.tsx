import { useMemo, type ChangeEvent } from "react";
import { type Node } from "@xyflow/react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  getAwsResourceDefinition,
  type AwsPropertyDefinition,
  type AwsPropertyValue,
  type AwsResourceType,
} from "@/lib/aws-schema";

interface PropertyPanelProps {
  node: Node | null;
  allNodes: Node[];
  onChange: (updated: Node) => void;
  onRequestConnect: (targetId: string) => void;
  onClose: () => void;
}

export default function PropertyPanel({
  node,
  allNodes,
  onChange,
  onRequestConnect,
  onClose,
}: PropertyPanelProps) {
  const isOpen = node !== null;

  const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!node) return;
    onChange({
      ...node,
      data: {
        ...node.data,
        label: e.target.value,
      },
    });
  };

  const resourceType = node?.data?.resourceType as string | undefined;
  const resourceDefinition = getAwsResourceDefinition(resourceType);
  const resourceLabel = resourceDefinition?.label ?? resourceType ?? "";
  const icon = node?.data?.icon as string | undefined;
  const config = (node?.data?.config ?? {}) as Record<string, AwsPropertyValue>;

  const groupedProperties = useMemo(() => {
    if (!resourceDefinition) return [];

    const bySection = new Map<string, AwsPropertyDefinition[]>();
    for (const property of resourceDefinition.properties) {
      const section = bySection.get(property.section) ?? [];
      section.push(property);
      bySection.set(property.section, section);
    }

    return Array.from(bySection.entries());
  }, [resourceDefinition]);

  const validTargets = useMemo(() => {
    if (!node || !resourceDefinition) return [];
    return allNodes.filter((candidate) => {
      if (candidate.id === node.id) return false;
      const candidateType = candidate.data?.resourceType as string | undefined;
      return (
        !!candidateType &&
        resourceDefinition.allowedTargets.includes(candidateType as AwsResourceType)
      );
    });
  }, [allNodes, node, resourceDefinition]);

  const updateConfig = (key: string, value: AwsPropertyValue) => {
    if (!node) return;
    onChange({
      ...node,
      data: {
        ...node.data,
        config: {
          ...(node.data?.config as Record<string, AwsPropertyValue>),
          [key]: value,
        },
      },
    });
  };

  const resolvePropertyOptions = (property: AwsPropertyDefinition) => {
    if (property.options && property.options.length > 0) return property.options;
    if (!property.optionResourceTypes) return [];

    return allNodes
      .filter((candidate) => {
        const type = candidate.data?.resourceType as string | undefined;
        return (
          !!type &&
          property.optionResourceTypes?.includes(type as AwsResourceType) &&
          candidate.id !== node?.id
        );
      })
      .map((candidate) => ({
        value: candidate.id,
        label: `${candidate.data?.label ?? candidate.id} (${candidate.id})`,
      }));
  };

  return (
    <div
      className={[
        "fixed top-4 bottom-4 right-4 z-50 w-72",
        "transition-all duration-300 ease-in-out",
        isOpen
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-4 pointer-events-none",
      ].join(" ")}
    >
      <Card className="shadow-xl border-border bg-card gap-0 py-0 overflow-hidden h-full flex flex-col">
        {/* Header */}
        <CardHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {icon && (
                <img
                  src={icon}
                  alt={resourceLabel}
                  className="w-6 h-6 shrink-0"
                />
              )}
              <div className="min-w-0">
                <CardTitle className="text-sm truncate">
                  {resourceLabel || "Resource"}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {node?.id ?? ""}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 ml-2"
              onClick={onClose}
            >
              <X />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>
        </CardHeader>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <CardContent className="px-4 py-4 flex flex-col gap-4">
            {/* Display name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="node-label"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                Display Name
              </label>
              <Input
                id="node-label"
                value={(node?.data?.label as string) ?? ""}
                onChange={handleLabelChange}
                placeholder="Enter a name..."
              />
            </div>

            <Separator />

            {/* Resource type — read only */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Resource Type
              </span>
              <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md break-all">
                {resourceLabel || "—"}
              </span>
            </div>

            {/* Node ID — read only */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Node ID
              </span>
              <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md break-all">
                {node?.id ?? "—"}
              </span>
            </div>

            <Separator />

            {/* Position — read only, useful for debugging */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  X
                </span>
                <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md">
                  {Math.round(node?.position?.x ?? 0)}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Y
                </span>
                <span className="text-sm text-foreground font-mono bg-muted px-2 py-1.5 rounded-md">
                  {Math.round(node?.position?.y ?? 0)}
                </span>
              </div>
            </div>

            {/* Schema-driven properties */}
            {groupedProperties.map(([section, properties]) => (
              <div key={section} className="flex flex-col gap-3">
                <Separator />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {section}
                </span>

                {properties.map((property) => {
                  const value = config[property.key];
                  const options = resolvePropertyOptions(property);

                  if (property.inputType === "text") {
                    return (
                      <div key={property.key} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`prop-${property.key}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          {property.label}
                        </label>
                        <Input
                          id={`prop-${property.key}`}
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) =>
                            updateConfig(property.key, e.target.value)
                          }
                          placeholder={property.placeholder}
                        />
                      </div>
                    );
                  }

                  if (property.inputType === "select") {
                    return (
                      <div key={property.key} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`prop-${property.key}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          {property.label}
                        </label>
                        <select
                          id={`prop-${property.key}`}
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) =>
                            updateConfig(property.key, e.target.value)
                          }
                          className="h-9 w-full rounded-md border border-border bg-muted px-2 text-sm text-foreground"
                        >
                          <option value="">Select an option</option>
                          {options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  const selectedValues = Array.isArray(value) ? value : [];

                  return (
                    <div key={property.key} className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {property.label}
                      </span>
                      <div className="max-h-28 overflow-y-auto rounded-md border border-border bg-muted p-2 flex flex-col gap-1.5">
                        {options.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No matching options on canvas.
                          </span>
                        )}
                        {options.map((option) => {
                          const isChecked = selectedValues.includes(option.value);
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 text-xs text-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...selectedValues, option.value]
                                    : selectedValues.filter(
                                        (item) => item !== option.value,
                                      );
                                  updateConfig(property.key, next);
                                }}
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      {property.helperText && (
                        <span className="text-[11px] text-muted-foreground">
                          {property.helperText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Connection helper */}
            {resourceDefinition && (
              <div className="flex flex-col gap-2">
                <Separator />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Connect To (Valid Targets)
                </span>
                {validTargets.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    No compatible targets currently on canvas.
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    {validTargets.map((target) => (
                      <div
                        key={target.id}
                        className="flex items-center justify-between gap-2 border border-border rounded-md px-2 py-1.5 bg-muted"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">
                            {String(target.data?.label ?? target.id)}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {String(target.data?.resourceType ?? "")}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRequestConnect(target.id)}
                        >
                          Connect
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
