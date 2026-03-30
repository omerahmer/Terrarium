import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </div>
          <span className="text-lg tracking-tight">Terrarium</span>
        </Link>

        {/* CTA */}
        <Link to="/app">
          <Button size="sm">
            Start Building →
          </Button>
        </Link>
      </div>
    </header>
  );
}
