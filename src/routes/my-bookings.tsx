import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireRole } from "@/components/RequireRole";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState, ErrorState, RowSkeleton } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { bookingKeys, fetchClientBookings } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/my-bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — CreatorHive" },
      { name: "description", content: "Track every gig you've booked and its current status." },
      { property: "og:title", content: "My bookings — CreatorHive" },
      { property: "og:description", content: "Track every gig you've booked on CreatorHive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireRole role="client">
      <MyBookingsPage />
    </RequireRole>
  ),
});

function MyBookingsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: bookingKeys.client(user?.id ?? ""),
    queryFn: () => fetchClientBookings(user!.id),
    enabled: Boolean(user),
  });

  const bookings = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? []).filter((booking) => {
      const matchesStatus = status === "all" || booking.status === status;
      const matchesTerm =
        !term ||
        booking.gig_title.toLowerCase().includes(term) ||
        booking.creator_name.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [data, status, query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <p className="mt-2 text-muted-foreground">Every request you've sent, newest first.</p>

      <div className="surface-card mt-8 grid gap-4 p-5 sm:grid-cols-[1fr_200px]">
        <div className="space-y-1.5">
          <Label htmlFor="booking-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="booking-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by gig or creator"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="booking-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="When you book a gig, it shows up here with its reference number and status."
            action={
              <Button asChild>
                <Link to="/marketplace">Browse Gigs</Link>
              </Button>
            }
          />
        ) : (
          bookings.map((booking) => (
            <article key={booking.id} className="surface-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{booking.gig_title}</h2>
                  <p className="text-sm text-muted-foreground">
                    with {booking.creator_name} · {booking.reference_number}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <p className="mt-3 font-medium">{booking.project_title}</p>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Booked on</dt>
                  <dd className="font-medium">{formatDate(booking.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Start</dt>
                  <dd className="font-medium">{formatDate(booking.preferred_start_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">{formatDate(booking.expected_delivery_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="font-medium">{formatMoney(booking.budget)}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <Button asChild variant="outline" size="sm">
                  <Link to="/bookings/$id" params={{ id: booking.id }}>
                    View Details
                  </Link>
                </Button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
