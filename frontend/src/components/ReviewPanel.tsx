import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Severity = "error" | "warning" | "info";

export interface Finding {
  severity: Severity;
  title: string;
  message: string;
  suggestion?: string | null;
  node_ids: string[];
  source: "deterministic" | "llm";
}

export interface ReviewResult {
  findings: Finding[];
}

interface ReviewPanelProps {
  result: ReviewResult | null;
  onClose: () => void;
  onSelectNodes: (nodeIds: string[]) => void;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

const SEVERITY_STYLES: Record<
  Severity,
  { badge: string; border: string; label: string }
> = {
  error: {
    badge: "bg-destructive text-white",
    border: "border-destructive/50 bg-destructive/5",
    label: "Error",
  },
  warning: {
    badge: "bg-amber-500 text-white",
    border: "border-amber-500/50 bg-amber-500/5",
    label: "Warning",
  },
  info: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border bg-muted/30",
    label: "Info",
  },
};

export default function ReviewPanel({
  result,
  onClose,
  onSelectNodes,
}: ReviewPanelProps) {
  if (!result) return null;

  const findings = [...result.findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity] += 1;
      return acc;
    },
    { error: 0, warning: 0, info: 0 } as Record<Severity, number>,
  );

  return (
    <Sheet open={!!result} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Architecture Review</SheetTitle>
          <SheetDescription>
            {findings.length === 0
              ? "No issues found."
              : `${counts.error} error(s), ${counts.warning} warning(s), ${counts.info} info.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-3">
          {findings.length === 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Your architecture passed all checks. Nice work.
            </div>
          )}

          {findings.map((finding, i) => {
            const styles = SEVERITY_STYLES[finding.severity];
            const clickable = finding.node_ids.length > 0;
            return (
              <button
                key={i}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onSelectNodes(finding.node_ids)}
                className={cn(
                  "text-left rounded-md border p-3 transition-colors",
                  styles.border,
                  clickable
                    ? "cursor-pointer hover:brightness-105"
                    : "cursor-default",
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className={styles.badge}>{styles.label}</Badge>
                  <span className="text-sm font-semibold">{finding.title}</span>
                  {finding.source === "llm" && (
                    <Badge variant="outline" className="ml-auto">
                      AI
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {finding.message}
                </p>
                {finding.suggestion && (
                  <p className="text-xs mt-1.5">
                    <span className="font-medium">Fix: </span>
                    {finding.suggestion}
                  </p>
                )}
                {clickable && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Click to highlight on canvas
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
