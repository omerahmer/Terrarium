import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { awsResources } from "@/lib/aws-resources";
import { Boxes, GripVertical } from "lucide-react";

const groupedResources = awsResources.reduce<
  Record<string, (typeof awsResources)[number][]>
>((acc, resource) => {
  const category = resource.category || "Other";
  if (!acc[category]) acc[category] = [];
  acc[category].push(resource);
  return acc;
}, {});

function ResourceItem({
  resource,
}: {
  resource: (typeof awsResources)[number];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", resource.id);
    event.dataTransfer.setData("resourceLabel", resource.label);
    event.dataTransfer.setData("resourceIcon", resource.icon);
    event.dataTransfer.effectAllowed = "move";
  };

  const button = (
    <SidebarMenuButton
      draggable
      onDragStart={handleDragStart}
      className="h-auto cursor-grab rounded-lg border border-transparent bg-background/20 py-2 transition-[background-color,border-color,transform] hover:translate-x-0.5 hover:border-sidebar-border hover:bg-sidebar-accent active:cursor-grabbing"
      tooltip={resource.label}
    >
      <img
        src={resource.icon}
        alt={resource.label}
        className="size-6 shrink-0 pointer-events-none"
      />
      <span className="pointer-events-none truncate">{resource.label}</span>
      <GripVertical className="ml-auto size-3 text-muted-foreground/35 opacity-0 transition-opacity group-hover/menu-item:opacity-100" />
    </SidebarMenuButton>
  );

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right">{resource.label}</TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return <SidebarMenuItem>{button}</SidebarMenuItem>;
}

export default function AppSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon" className="z-30">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Boxes className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">AWS library</p>
            <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">
              {awsResources.length} resources · drag to canvas
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 py-1">
        {Object.entries(groupedResources).map(([category, resources]) => (
          <SidebarGroup key={category} className="py-2">
            <SidebarGroupLabel className="h-7 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              {category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resources.map((resource) => (
                  <ResourceItem key={resource.id} resource={resource} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
