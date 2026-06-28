import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CostCategory, CostEstimate } from "@/lib/pricing";

interface CostPanelProps {
  estimate: CostEstimate | null;
  open: boolean;
  onClose: () => void;
  onSelectNode: (nodeId: string) => void;
}

const CATEGORY_ORDER: CostCategory[] = ["compute", "storage", "usage", "free"];

const CATEGORY_STYLE: Record<CostCategory, { label: string; badge: string }> = {
  compute: { label: "Compute", badge: "bg-blue-500 text-white" },
  storage: { label: "Storage", badge: "bg-violet-500 text-white" },
  usage: { label: "Usage", badge: "bg-amber-500 text-white" },
  free: { label: "Free", badge: "bg-muted text-muted-foreground" },
};

function money(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.01) return "<$0.01";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CostPanel({
  estimate,
  open,
  onClose,
  onSelectNode,
}: CostPanelProps) {
  if (!estimate) return null;

  const items = [...estimate.lineItems].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      b.monthlyCost - a.monthlyCost,
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>
            <span className="text-2xl font-semibold">
              {money(estimate.monthlyTotal)}
            </span>
            <span className="text-sm text-muted-foreground"> / month</span>
          </SheetTitle>
          <SheetDescription>
            Estimated · us-east-1 · on-demand · AWS prices {estimate.snapshotDate}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-2">
          {items.length === 0 && (
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Add resources to the canvas to see a cost estimate.
            </div>
          )}

          {items.map((item) => {
            const style = CATEGORY_STYLE[item.category];
            return (
              <button
                key={item.nodeId}
                type="button"
                onClick={() => onSelectNode(item.nodeId)}
                className="text-left rounded-md border border-border p-3 hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={cn("shrink-0", style.badge)}>
                      {style.label}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-mono shrink-0">
                    {money(item.monthlyCost)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.basis}</p>
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-4 text-[11px] text-muted-foreground border-t border-border pt-3">
          Rough estimate. Excludes data transfer / egress, taxes, free-tier
          credits, and request-level charges not modeled above.
        </div>
      </SheetContent>
    </Sheet>
  );
}
