import { useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AwsPropertyOption } from "@/lib/aws-schema";

interface PropertyComboboxProps {
  value: string;
  options: AwsPropertyOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

// Cap rendered results so a 1000+ option list (e.g. EC2 instance types) stays
// responsive without a virtualization dependency.
const MAX_RESULTS = 100;

export default function PropertyCombobox({
  value,
  options,
  onChange,
  placeholder = "Select…",
}: PropertyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? options.filter(
          (o) =>
            o.value.toLowerCase().includes(q) ||
            o.label.toLowerCase().includes(q),
        )
      : options;
    return matches.slice(0, MAX_RESULTS);
  }, [options, query]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-muted px-2 text-sm text-foreground"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-[60] w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-popover shadow-md"
        >
          <div className="p-1.5">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-8"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No matches.
              </div>
            )}
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent",
                  option.value === value && "bg-accent",
                )}
              >
                <Check
                  className={cn(
                    "size-3.5 shrink-0",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{option.label}</span>
              </button>
            ))}
            {!query && options.length > MAX_RESULTS && (
              <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                Showing {MAX_RESULTS} of {options.length} — type to search.
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
