import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Workflow", href: "#workflow" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-border/70 bg-background/76 px-3 shadow-[0_12px_40px_color-mix(in_oklab,black_16%,transparent)] backdrop-blur-xl sm:px-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold text-foreground"
          aria-label="Terrarium home"
        >
          <div className="brand-mark flex size-8 items-center justify-center rounded-lg text-primary-foreground">
            <Leaf className="size-4" />
          </div>
          <span className="text-[15px] tracking-[-0.02em]">Terrarium</span>
          <span className="hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline-flex">
            Open source
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/55 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Terrarium on GitHub"
            >
              <Github className="size-4" />
            </a>
          </Button>
          <Button asChild size="sm">
            <Link to="/app">
              Open canvas
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
