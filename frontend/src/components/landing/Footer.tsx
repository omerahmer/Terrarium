import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 font-semibold">
              <div className="brand-mark flex size-8 items-center justify-center rounded-lg text-primary-foreground">
                <Leaf className="size-4" />
              </div>
              <span>Terrarium</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">Grow an AWS architecture. Leave with the code.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/app">
              Open the canvas
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Terrarium · Open source under MIT</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="size-3.5" />
            Source on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
