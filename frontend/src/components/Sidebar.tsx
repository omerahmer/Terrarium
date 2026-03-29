import {
  Sidebar,
  SidebarContent,
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
      className="cursor-grab active:cursor-grabbing h-auto py-1.5 border border-border rounded-md"
      tooltip={resource.label}
    >
      <img
        src={resource.icon}
        alt={resource.label}
        className="size-6 shrink-0 pointer-events-none"
      />
      <span className="pointer-events-none truncate">{resource.label}</span>
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
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        {Object.entries(groupedResources).map(([category, resources]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel className="text-lg pb-6 pt-4 pl-2">
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
