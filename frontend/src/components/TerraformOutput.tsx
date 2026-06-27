import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import JSZip from "jszip";

// Lazy-loaded so Monaco (a large dependency) is split into its own chunk and
// kept out of the initial bundle.
const MonacoHcl = lazy(() => import("./MonacoHcl"));

export interface GenerateResult {
  files: Record<string, string>;
  validated: boolean;
  attempts: number;
  errors: string[];
}

interface TerraformOutputProps {
  result: GenerateResult | null;
  onClose: () => void;
}

const FILE_ORDER = ["main.tf", "variables.tf", "outputs.tf"];

function resolveEditorTheme(theme: string): "vs-dark" | "light" {
  if (theme === "dark") return "vs-dark";
  if (theme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "vs-dark"
    : "light";
}

function downloadZip(files: Record<string, string>) {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(files)) {
    zip.file(name, content);
  }
  zip.generateAsync({ type: "blob" }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "terraform.zip";
    anchor.click();
    URL.revokeObjectURL(url);
  });
}

export default function TerraformOutput({
  result,
  onClose,
}: TerraformOutputProps) {
  const { theme } = useTheme();
  const [activeFile, setActiveFile] = useState<string>("main.tf");
  // Local, editable copy of the generated files. Copy/download read from here,
  // so the user's in-panel edits are what get exported.
  const [edited, setEdited] = useState<Record<string, string>>({});

  // Reseed the editor whenever a fresh generation result arrives.
  useEffect(() => {
    if (result) {
      setEdited({ ...result.files });
      setActiveFile("main.tf");
    }
  }, [result]);

  const editorTheme = useMemo(() => resolveEditorTheme(theme), [theme]);

  if (!result) return null;

  const files = FILE_ORDER.filter((name) => result.files[name] !== undefined);
  const activeContent = edited[activeFile] ?? result.files[activeFile] ?? "";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(activeContent)
      .then(() => toast.success(`Copied ${activeFile}`))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <Sheet open={!!result} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-3xl w-full">
        <SheetHeader>
          <SheetTitle>Generated Terraform</SheetTitle>
          <SheetDescription>
            {result.validated
              ? `Validated successfully after ${result.attempts} attempt(s).`
              : `Validation did not pass after ${result.attempts} attempt(s).`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-1 px-4">
          {files.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={name === activeFile ? "default" : "outline"}
              onClick={() => setActiveFile(name)}
            >
              {name}
            </Button>
          ))}
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={handleCopy}>
            Copy
          </Button>
          <Button size="sm" onClick={() => downloadZip(edited)}>
            Download .zip
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 gap-3">
          <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full grid place-items-center text-xs text-muted-foreground">
                  Loading editor…
                </div>
              }
            >
              <MonacoHcl
                value={activeContent}
                onChange={(value) =>
                  setEdited((prev) => ({ ...prev, [activeFile]: value }))
                }
                theme={editorTheme}
              />
            </Suspense>
          </div>

          {!result.validated && result.errors.length > 0 && (
            <div
              className={cn(
                "rounded-md border border-destructive/50 bg-destructive/10 p-3",
                "text-xs text-destructive max-h-40 overflow-auto",
              )}
            >
              <p className="font-semibold mb-1">Validation errors</p>
              <ul className="list-disc pl-4 space-y-1">
                {result.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
