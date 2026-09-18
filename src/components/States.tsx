import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div
      role="alert"
      className="surface-card flex flex-col items-center gap-3 border-destructive/30 px-6 py-16 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="max-w-md text-sm text-muted-foreground">
        {message ?? "We couldn't load this content right now."}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="surface-card space-y-3 p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
