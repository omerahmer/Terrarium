import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Github, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 px-6">
      <div className="mx-auto max-w-6xl">
        <Separator className="mb-10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Leaf className="size-3.5" />
              </div>
              <span className="tracking-tight">Terrarium</span>
            </Link>
            <Separator orientation="vertical" className="hidden sm:block h-4" />
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              Built with Claude + React Flow. Open source, forever.
            </span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Terrarium. MIT License.
        </p>
      </div>
    </footer>
  );
}
