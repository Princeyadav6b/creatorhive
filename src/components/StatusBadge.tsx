import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; className: string; Icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/15 text-warning-foreground border-warning/40",
    Icon: Clock,
  },
  accepted: {
    label: "Accepted",
    className: "bg-success/15 text-success border-success/40",
    Icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/40",
    Icon: XCircle,
  },
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const { label, className: statusClass, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusClass,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
