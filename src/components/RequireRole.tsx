import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { RowSkeleton } from "@/components/States";
import type { AppRole } from "@/lib/types";

export function RequireRole({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user, role: currentRole, loading } = useAuth();
  const navigate = useNavigate();

  const allowed = Boolean(user) && currentRole === role;
  const denied = !loading && !allowed;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: window.location.pathname } });
      return;
    }
    if (currentRole !== role) {
      void navigate({ to: "/unauthorized" });
    }
  }, [loading, user, currentRole, role, navigate]);

  if (loading || denied) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-16 sm:px-6">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
