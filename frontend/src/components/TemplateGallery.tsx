import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAwsResourceDefinition } from "@/lib/aws-schema";
import { TEMPLATES, type Template } from "@/lib/templates";

interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
  onApply: (template: Template) => void;
}

export default function TemplateGallery({
  open,
  onClose,
  onApply,
}: TemplateGalleryProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Start from a template</SheetTitle>
          <SheetDescription>
            Drop a ready-made architecture onto the canvas, then customize it.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-3">
          {TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="rounded-md border border-border p-3 flex flex-col gap-2"
            >
              <div>
                <h3 className="text-sm font-semibold">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {template.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.resourceTypes.map((rt) => (
                  <Badge key={rt} variant="outline" className="text-[10px]">
                    {getAwsResourceDefinition(rt)?.label ?? rt}
                  </Badge>
                ))}
              </div>

              <Button
                size="sm"
                className="self-start mt-1"
                onClick={() => onApply(template)}
              >
                Use this template
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
