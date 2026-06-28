import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Guard: this page requires a signed-in user.
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  if (!user) return null;

  const email = user.email ?? "";
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center gap-2 px-4">
        <Link to="/app" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Leaf className="size-3.5" />
          </div>
          <span className="tracking-tight">Terrarium</span>
        </Link>
        <div className="flex-1" />
        <Button asChild size="sm" variant="outline">
          <Link to="/app">
            <ArrowLeft className="size-3.5" />
            Back to canvas
          </Link>
        </Button>
      </header>

      <div className="flex-1 flex justify-center px-4 py-10">
        <Card className="w-full max-w-lg h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="truncate">{email}</CardTitle>
                <CardDescription>Your Terrarium account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Separator />

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="col-span-2 truncate">{email}</span>

              <span className="text-muted-foreground">Member since</span>
              <span className="col-span-2">{createdAt}</span>

              <span className="text-muted-foreground">User ID</span>
              <span className="col-span-2 font-mono text-xs break-all">
                {user.id}
              </span>
            </div>

            <Separator />

            <Button
              variant="outline"
              className="self-start"
              onClick={async () => {
                await signOut();
                toast.success("Signed out");
                navigate("/");
              }}
            >
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
