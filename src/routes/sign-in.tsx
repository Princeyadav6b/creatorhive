import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { signInSchema, type SignInValues } from "@/lib/validation";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Sign in — CreatorHive" },
      { name: "description", content: "Sign in to manage your CreatorHive gigs and bookings." },
      { property: "og:title", content: "Sign in — CreatorHive" },
      {
        property: "og:description",
        content: "Sign in to manage your CreatorHive gigs and bookings.",
      },
    ],
  }),
  component: SignInPage,
});

function safePath(value: string | undefined): string | null {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function SignInPage() {
  const { signIn, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (loading || !user) return;
    const target = safePath(search.redirect);
    if (target) {
      void navigate({ to: target });
      return;
    }
    void navigate({ to: role === "creator" ? "/creator/dashboard" : "/marketplace" });
  }, [loading, user, role, search.redirect, navigate]);

  async function submit(values: SignInValues) {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
    void submit({ email, password });
  }

  return (
    <div className="gradient-hero">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your CreatorHive account.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 rounded-xl bg-secondary/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Try a demo account
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                  onClick={() => fillDemo(account.email, account.password)}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to CreatorHive?{" "}
            <Link to="/sign-up" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
