import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-150 h-100 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-3xl">
        {/* Badge */}
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
          <Sparkles className="size-3.5 text-primary" />
          AI-Powered · Open Source
        </Badge>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight">
          Design AWS infrastructure.{" "}
          <span className="text-primary">Generate Terraform</span> instantly.
        </h1>

        {/* Subheading */}
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          Terrarium is a visual AWS infrastructure designer that turns your
          drag-and-drop diagrams into production-ready Terraform code — powered
          by Claude AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link to="/app">
            <Button size="lg" className="gap-2">
              Start Building
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="size-4" />
              View on GitHub
            </Button>
          </a>
        </div>

        {/* Canvas preview hint */}
        <div className="mt-12 w-full max-w-4xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Fake toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-500/70" />
              <div className="size-3 rounded-full bg-yellow-500/70" />
              <div className="size-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">
              terrarium — canvas
            </span>
          </div>

          {/* Fake canvas */}
          <div className="relative h-64 bg-background overflow-hidden">
            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Fake nodes */}
            <div className="absolute top-8 left-1/4 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg px-4 py-3 shadow-md text-xs font-medium text-foreground w-28">
              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                EC2
              </div>
              Web Server
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg px-4 py-3 shadow-md text-xs font-medium text-foreground w-28">
              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                ALB
              </div>
              Load Balancer
            </div>

            <div className="absolute top-8 left-3/4 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg px-4 py-3 shadow-md text-xs font-medium text-foreground w-28">
              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                RDS
              </div>
              Database
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-card border border-border rounded-lg px-4 py-3 shadow-md text-xs font-medium text-foreground w-28">
              <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                S3
              </div>
              Storage
            </div>

            {/* Fake connecting lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="25%"
                y1="60"
                x2="50%"
                y2="60"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.2"
                strokeDasharray="4 3"
              />
              <line
                x1="50%"
                y1="60"
                x2="75%"
                y2="60"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.2"
                strokeDasharray="4 3"
              />
              <line
                x1="50%"
                y1="80"
                x2="50%"
                y2="170"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.2"
                strokeDasharray="4 3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
