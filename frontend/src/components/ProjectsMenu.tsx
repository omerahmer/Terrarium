import { useCallback, useEffect, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  listProjects,
  saveProject,
  loadProject,
  deleteProject,
  type ProjectSummary,
} from "@/lib/projects";

interface ProjectsMenuProps {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  onApply: (nodes: Node[], edges: Edge[]) => void;
}

export default function ProjectsMenu({
  open,
  onClose,
  nodes,
  edges,
  onApply,
}: ProjectsMenuProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load projects");
    }
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error("Give the project a name.");
    setBusy(true);
    try {
      await saveProject(trimmed, nodes, edges);
      toast.success(`Saved "${trimmed}"`);
      setName("");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  };

  const onOpen = async (id: string, projectName: string) => {
    try {
      const { nodes: n, edges: e } = await loadProject(id);
      onApply(n, e);
      toast.success(`Opened "${projectName}"`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteProject(id);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Cloud projects</SheetTitle>
          <SheetDescription>
            Save the current canvas to your account, or open a saved project.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name…"
            onKeyDown={(e) => e.key === "Enter" && onSave()}
          />
          <Button onClick={onSave} disabled={busy}>
            Save
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-4 mt-3 flex flex-col gap-2">
          {projects.length === 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              No saved projects yet.
            </div>
          )}
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border p-3"
            >
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => onOpen(p.id, p.name)}
              >
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(p.updated_at).toLocaleString()}
                </div>
              </button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => onDelete(p.id)}
                title="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
