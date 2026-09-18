import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Eye, EyeOff, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { signUpSchema, type SignUpValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — CreatorHive" },
      {
        name: "description",
        content: "Join CreatorHive as a creator selling gigs or a client booking talent.",
      },
      { property: "og:title", content: "Create your account — CreatorHive" },
      { property: "og:description", content: "Join CreatorHive as a creator or a client." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", role: "creator" },
  });

  useEffect(() => {
    if (loading || !user) return;
    void navigate({ to: role === "creator" ? "/creator/dashboard" : "/marketplace" });
  }, [loading, user, role, navigate]);

  async function submit(values: SignUpValues) {
    setSubmitting(true);
    try {
      const result = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role as "creator" | "client",
      });
      toast.success(
        result.requiresEmailConfirmation
          ? "Account created. Check your email to confirm your account."
          : "Account created. Welcome to CreatorHive!",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gradient-hero">
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sell your creative skills or book the talent you need.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">I want to join as</legend>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: "creator",
                        label: "Creator",
                        hint: "Publish gigs and get booked",
                        Icon: Palette,
                      },
                      {
                        value: "client",
                        label: "Client",
                        hint: "Discover and book creators",
                        Icon: Briefcase,
                      },
                    ].map((option) => {
                      const selected = field.value === option.value;
                      return (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => field.onChange(option.value)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-2xl border p-4 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                              : "border-border hover:bg-secondary",
                          )}
                        >
                          <option.Icon className="size-5 text-primary" aria-hidden="true" />
                          <p className="mt-2 text-sm font-semibold">
                            {option.label}
                            {selected ? " ✓" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">{option.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.role && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.role.message}
                </p>
              )}
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" autoComplete="name" {...register("fullName")} />
              {errors.fullName && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/sign-in" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
