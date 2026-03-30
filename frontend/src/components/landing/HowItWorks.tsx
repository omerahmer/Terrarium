import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Drag AWS resources onto the canvas",
    description:
      "Browse 20+ AWS services from the sidebar — EC2, RDS, Lambda, S3, VPC, and more. Drag them onto the visual canvas to start composing your architecture.",
  },
  {
    number: "02",
    title: "Connect resources to define relationships",
    description:
      "Draw connections between resources to define how they communicate. ALB to EC2, EC2 to RDS, Lambda to SQS — the connections become the wiring in your Terraform.",
  },
  {
    number: "03",
    title: "Generate production-ready Terraform with AI",
    description:
      "Hit generate and Claude turns your diagram into valid, annotated Terraform HCL. The AI validation loop runs terraform validate and self-corrects until the code is clean.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            From diagram to infrastructure in minutes
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            No YAML. No hand-written HCL. Just draw what you want and let the AI
            handle the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col md:flex-row gap-6">
              <Card className="flex-1 relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
                {/* Subtle number watermark */}
                <div className="absolute top-3 right-4 text-6xl font-black text-muted/30 dark:text-muted/20 select-none leading-none">
                  {step.number}
                </div>

                <CardContent className="pt-8 pb-6 px-6 flex flex-col gap-3 relative z-10">
                  <span className="text-xs font-mono font-semibold text-primary">
                    Step {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow connector between cards — hidden on mobile and after last card */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center text-muted-foreground/40 text-2xl select-none -mx-3">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
