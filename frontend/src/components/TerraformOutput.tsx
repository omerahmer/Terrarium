import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function TerraformOutput({
  result,
  onClose,
}: TerraformOutputProps) {
  const [activeFile, setActiveFile] = useState<string>("main.tf");

  if (!result) return null;

  const files = FILE_ORDER.filter((name) => result.files[name] !== undefined);
  const activeContent = result.files[activeFile] ?? "";

  return (
    <Sheet open={!!result} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-2xl w-full">
        <SheetHeader>
          <SheetTitle>Generated Terraform</SheetTitle>
          <SheetDescription>
            {result.validated
              ? `Validated successfully after ${result.attempts} attempt(s).`
              : `Validation did not pass after ${result.attempts} attempt(s).`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-1 px-4">
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
        </div>

        <div className="flex-1 overflow-auto px-4 pb-4">
          <pre className="text-xs bg-muted rounded-md p-3 whitespace-pre-wrap break-words">
            {activeContent || "// empty"}
          </pre>

          {!result.validated && result.errors.length > 0 && (
            <div
              className={cn(
                "mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3",
                "text-xs text-destructive",
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
