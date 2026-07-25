import {
  BadgeDollarSign,
  Braces,
  Boxes,
  FileDown,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Boxes,
    eyebrow: "Canvas",
    title: "An architecture surface, not a form builder",
    description: "Arrange services spatially, nest resources inside VPCs, and keep complex systems readable as they grow.",
    className: "md:col-span-2",
  },
  {
    icon: BadgeDollarSign,
    eyebrow: "Cost",
    title: "See the monthly shape",
    description: "A live estimate keeps infrastructure decisions grounded before anything reaches AWS.",
    className: "",
  },
  {
    icon: Braces,
    eyebrow: "Generation",
    title: "Terraform that remains yours",
    description: "Inspect and edit generated HCL in a real code editor, then export the exact files you reviewed.",
    className: "",
  },
  {
    icon: ScanSearch,
    eyebrow: "Review",
    title: "Architectural feedback in context",
    description: "Surface security gaps, single points of failure, and cost concerns—then jump directly to the affected nodes.",
    className: "md:col-span-2",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Validation",
    title: "Typed connections",
    description: "Relationships follow AWS-aware rules so the diagram expresses a system that makes sense.",
    className: "",
  },
  {
    icon: FileDown,
    eyebrow: "Ownership",
    title: "Open source by design",
    description: "Self-host the full stack, use your own AI credentials, and extend the resource catalog for your team.",
    className: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="capabilities" className="relative overflow-hidden px-5 py-24 sm:px-6 lg:py-32">
      <div className="technical-grid absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="section-kicker">Capabilities</span>
            <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl">
              One continuous model, from first node to final file.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            The useful parts of diagramming, estimation, review, and generation—kept together in one focused workspace.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={`panel-sheen group min-h-56 rounded-2xl border border-border bg-card/76 p-6 transition-[border-color,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card ${feature.className}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                    <Icon className="size-4" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">{feature.eyebrow}</span>
                </div>
                <h3 className="mt-9 max-w-lg text-xl font-medium tracking-[-0.025em]">{feature.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
