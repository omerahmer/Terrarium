import { ArrowDownRight, Braces, GitBranch, MousePointer2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointer2,
    title: "Compose the system",
    description: "Drag real AWS resources into place and configure the details that matter. The canvas stays fast, legible, and spatial.",
    meta: "Visual model",
  },
  {
    number: "02",
    icon: GitBranch,
    title: "Describe the relationships",
    description: "Connect services to express traffic, dependencies, and data flow. Terrarium validates what can actually talk to what.",
    meta: "Typed connections",
  },
  {
    number: "03",
    icon: Braces,
    title: "Ship the infrastructure",
    description: "Generate editable Terraform, review architectural risks, understand monthly cost, and export the finished project.",
    meta: "Production output",
  },
];

export default function HowItWorks() {
  return (
    <section id="workflow" className="border-y border-border bg-card/35 px-5 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
          <div>
            <span className="section-kicker">Workflow</span>
            <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl">
              Diagramming with an opinion about the output.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Every interaction adds structure to the final Terraform. The visual model and the deployable model stay connected.
            </p>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className="group grid gap-5 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:gap-6">
                  <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-background/60 text-primary transition-colors group-hover:border-primary/35 group-hover:bg-primary/10">
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-mono text-[9px] tracking-[0.14em] text-primary">{step.number}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{step.meta}</span>
                    </div>
                    <h3 className="text-xl font-medium tracking-[-0.025em]">{step.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                  <ArrowDownRight className="hidden size-4 text-muted-foreground/50 transition-colors group-hover:text-primary sm:block" />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
