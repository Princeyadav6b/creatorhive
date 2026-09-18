import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState, ErrorState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { bookingKeys, fetchBooking } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking details — CreatorHive" },
      { name: "description", content: "Full brief, dates, budget and status for this booking." },
      { property: "og:title", content: "Booking details — CreatorHive" },
      {
        property: "og:description",
        content: "Full brief, dates and status for this CreatorHive booking.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { id } = Route.useParams();
  const { user, isCreator, loading } = useAuth();

  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: bookingKeys.byId(id),
    queryFn: () => fetchBooking(id),
    enabled: Boolean(user),
  });

  if (loading || isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!user || !booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Booking not available"
          description="This booking doesn't exist, or you don't have access to it."
          action={
            <Button asChild variant="outline">
              <Link to="/marketplace">Browse Gigs</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        {isCreator ? (
          <Link to="/creator/dashboard">Back to dashboard</Link>
        ) : (
          <Link to="/my-bookings">Back to my bookings</Link>
        )}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{booking.project_title}</h1>
          <p className="mt-1 text-muted-foreground">
            {booking.gig_title} · {booking.reference_number}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <section className="surface-card mt-8 p-6">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <p className="mt-3 whitespace-pre-line text-muted-foreground">{booking.requirements}</p>
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="text-lg font-semibold">Details</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Creator</dt>
            <dd className="font-medium">{booking.creator_name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Client</dt>
            <dd className="font-medium">{booking.client_name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Submitted</dt>
            <dd className="font-medium">{formatDate(booking.created_at)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Budget</dt>
            <dd className="font-medium">{formatMoney(booking.budget)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Preferred start</dt>
            <dd className="font-medium">{formatDate(booking.preferred_start_date)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expected delivery</dt>
            <dd className="font-medium">{formatDate(booking.expected_delivery_date)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Contact email</dt>
            <dd className="font-medium break-all">{booking.contact_email}</dd>
          </div>
          {booking.reference_link && (
            <div>
              <dt className="text-muted-foreground">Reference link</dt>
              <dd>
                <a
                  className="font-medium text-primary underline underline-offset-4 break-all"
                  href={booking.reference_link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {booking.reference_link}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
