import { awsResources } from "@/lib/aws-resources";
import { ScrollArea } from "./ui/scroll-area";

const groupedResources = awsResources.reduce<
  Record<string, (typeof awsResources)[number][]>
>((acc, resource) => {
  const category = resource.category || "Other";
  if (!acc[category]) acc[category] = [];
  acc[category].push(resource);
  return acc;
}, {});

export default function Sidebar() {
  const handleDragStart = (
    event: React.DragEvent,
    resource: (typeof awsResources)[number],
  ) => {
    event.dataTransfer.setData("application/reactflow", resource.id);
    event.dataTransfer.setData("resourceLabel", resource.label);
    event.dataTransfer.setData("resourceIcon", resource.icon);
  };

  return (
    <div className="fixed left-0 top-0 w-60 h-screen bg-slate-800 border-r border-slate-600 p-4 z-10">
      <div className="text-gray-200 text-lg font-bold mb-4">AWS Resources</div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        {Object.entries(groupedResources).map(([category, resources]) => (
          <div key={category} className="mb-6">
            <h3 className="text-slate-400 text-xs uppercase mb-2">
              {category}
            </h3>

            <div>
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  draggable={true}
                  onDragStart={(event) => handleDragStart(event, resource)}
                  className="mb-2 cursor-grab p-3 bg-slate-700 rounded-lg border border-slate-600 flex items-center gap-2 hover:bg-slate-600 active:cursor-grabbing"
                >
                  <img
                    src={resource.icon}
                    alt={resource.label}
                    className="w-8 h-8 pointer-events-none"
                  />
                  <span className="text-gray-200 text-sm pointer-events-none">
                    {resource.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
