import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MousePointerClick,
  Sparkles,
  ShieldCheck,
  SearchCode,
  FileDown,
  Github,
} from "lucide-react";

const features = [
  {
    icon: MousePointerClick,
    title: "Visual Canvas Designer",
    description:
      "Drag, drop, and connect AWS resources on an infinite canvas powered by React Flow. Intuitive and fast.",
    badge: null,
  },
  {
    icon: Sparkles,
    title: "AI Terraform Generation",
    description:
      "Claude reads your diagram and writes production-quality Terraform HCL — with proper resource naming, variables, and outputs.",
    badge: null,
  },
  {
    icon: ShieldCheck,
    title: "Validation Loop",
    description:
      "A LangGraph agent runs terraform validate on the generated code and sends errors back to Claude to self-correct — up to 3 attempts.",
    badge: "Coming Soon",
  },
  {
    icon: SearchCode,
    title: "Architecture Review",
    description:
      "A second AI agent checks your diagram for anti-patterns, missing security groups, single points of failure, and cost inefficiencies.",
    badge: "Coming Soon",
  },
  {
    icon: FileDown,
    title: "Export & Deploy",
    description:
      "Download your Terraform files as a zip, ready to drop into your repo or run with terraform apply.",
    badge: "Coming Soon",
  },
  {
    icon: Github,
    title: "Open Source",
    description:
      "Terrarium is fully open source. Self-host it, extend it, and bring your own Anthropic API key.",
    badge: null,
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Everything you need to ship infrastructure
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Terrarium combines a visual designer with an AI backend to handle
            the full lifecycle — from diagram to deployed infrastructure.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:border-primary/50 transition-colors duration-300"
              >
                <CardContent className="pt-6 pb-6 px-6 flex flex-col gap-4">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    {feature.badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {feature.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
