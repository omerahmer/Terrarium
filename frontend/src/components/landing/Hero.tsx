import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Check,
  Database,
  Github,
  HardDrive,
  ServerCog,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const canvasNodes = [
  { label: "Load balancer", code: "ALB", icon: Boxes, className: "left-[8%] top-[15%]" },
  { label: "Web service", code: "EC2", icon: ServerCog, className: "left-[39%] top-[15%]" },
  { label: "Primary data", code: "RDS", icon: Database, className: "left-[68%] top-[15%]" },
  { label: "Object store", code: "S3", icon: HardDrive, className: "left-[39%] top-[62%]" },
];

function PreviewNode({
  label,
  code,
  icon: Icon,
  className,
}: (typeof canvasNodes)[number]) {
  return (
    <div className={`absolute z-10 w-28 rounded-xl border border-border bg-card/95 p-2.5 shadow-xl ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex size-7 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </div>
        <span className="font-mono text-[8px] tracking-wider text-muted-foreground">{code}</span>
      </div>
      <p className="truncate text-[10px] font-medium text-foreground">{label}</p>
      <div className="mt-2 h-px w-full bg-border" />
      <div className="mt-1.5 flex items-center gap-1 font-mono text-[7px] text-muted-foreground">
        <span className="size-1 rounded-full bg-primary" /> healthy
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-32 sm:px-6 lg:pb-32 lg:pt-40">
      <div className="technical-grid absolute inset-0 -z-20" />
      <div className="fine-noise pointer-events-none absolute inset-0 -z-10" />
      <div className="hero-orbit absolute -right-40 top-16 -z-10 h-[38rem] w-[38rem] rounded-full" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
        <div className="rise-in max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
            <Sparkles className="size-3" />
            Visual infrastructure, production output
          </div>

          <h1 className="max-w-xl text-[3.35rem] font-semibold leading-[0.98] tracking-[-0.065em] text-foreground sm:text-6xl lg:text-[4.65rem]">
            Infrastructure that grows into <span className="text-primary">code.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Compose AWS architecture on a living canvas. Terrarium understands the relationships, reviews the system, and produces Terraform you can actually ship.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/app">
                Start composing
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="size-4" />
                Explore the source
              </a>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {["20+ AWS resources", "Cost-aware", "Editable Terraform"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Check className="size-2.5" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rise-in relative min-w-0 [animation-delay:120ms]">
          <div className="absolute -inset-7 -z-10 rounded-[2.5rem] bg-primary/[0.04] blur-2xl" />
          <div className="panel-surface overflow-hidden rounded-[1.4rem] border border-border/90">
            <div className="flex h-12 items-center justify-between border-b border-border bg-card/75 px-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2 rounded-full bg-foreground/15" />
                  <span className="size-2 rounded-full bg-foreground/10" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">prod-network / canvas</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-wider text-primary">
                <span className="signal-dot size-1.5 rounded-full bg-primary" />
                synced
              </div>
            </div>

            <div className="grid h-[25rem] grid-cols-[8rem_1fr] sm:grid-cols-[10rem_1fr]">
              <aside className="border-r border-border bg-muted/20 p-3">
                <p className="mb-3 font-mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground">Resources</p>
                {[
                  ["Compute", "04"],
                  ["Networking", "06"],
                  ["Database", "08"],
                  ["Storage", "05"],
                ].map(([label, count], index) => (
                  <div
                    key={label}
                    className={`mb-1 flex items-center justify-between rounded-lg border px-2.5 py-2 text-[9px] ${index === 1 ? "border-primary/25 bg-primary/[0.08] text-foreground" : "border-transparent text-muted-foreground"}`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[8px]">{count}</span>
                  </div>
                ))}

                <div className="mt-6 border-t border-border pt-3">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">Estimate</p>
                  <p className="mt-1 text-lg font-medium tracking-tight">$186<span className="text-[10px] text-muted-foreground"> / mo</span></p>
                </div>
              </aside>

              <div className="relative overflow-hidden bg-background/55">
                <div className="absolute inset-0 bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="absolute left-[26%] top-[23%] h-px w-[18%] bg-primary/40" />
                <div className="absolute left-[57%] top-[23%] h-px w-[16%] bg-primary/40" />
                <div className="absolute left-[53%] top-[41%] h-[24%] w-px bg-primary/40" />
                <div className="absolute left-[43.5%] top-[22%] size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                <div className="absolute left-[70%] top-[22%] size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                {canvasNodes.map((node) => (
                  <PreviewNode key={node.code} {...node} />
                ))}
                <div className="absolute bottom-4 right-4 rounded-lg border border-border bg-card/90 px-2.5 py-2 font-mono text-[8px] text-muted-foreground shadow-lg backdrop-blur">
                  4 nodes · 3 relations
                </div>
              </div>
            </div>

            <div className="flex h-11 items-center justify-between border-t border-border bg-card/75 px-4">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted-foreground">Architecture status: healthy</span>
              <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-[8px] font-semibold uppercase tracking-wider text-primary-foreground">Generate Terraform</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
