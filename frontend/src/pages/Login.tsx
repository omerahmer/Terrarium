import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "signup";

export default function Login() {
  const { signIn, signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!configured) {
      toast.error("Auth is not configured (missing Supabase env vars).");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) return toast.error(error);
        toast.success("Signed in");
        navigate("/app");
      } else {
        const { error } = await signUp(email, password);
        if (error) return toast.error(error);
        toast.success("Account created — check your email to confirm, then sign in.");
        setMode("signin");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <Link
        to="/"
        className="flex items-center gap-2 font-semibold mb-6"
      >
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Leaf className="size-4" />
        </div>
        <span className="tracking-tight">Terrarium</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "signin" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in to save and load your projects in the cloud."
              : "Create an account to store projects across devices."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div className="mb-4 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              Auth isn't configured yet. Set <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> to enable sign-in.
            </div>
          )}
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={busy} className="mt-1">
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Link
        to="/app"
        className="mt-6 text-xs text-muted-foreground hover:text-foreground"
      >
        Continue without an account →
      </Link>
    </div>
  );
}
