import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  DollarSign,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RequireRole } from "@/components/RequireRole";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState, ErrorState, RowSkeleton } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import {
  bookingKeys,
  deleteGig,
  fetchCreatorBookings,
  fetchCreatorGigs,
  gigKeys,
  setGigActive,
  updateBookingStatus,
} from "@/lib/api";
import { formatDate, formatMoney, formatRate, truncate } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

export const Route = createFileRoute("/creator/dashboard")({
  head: () => ({
    meta: [
      { title: "Creator dashboard — CreatorHive" },
      {
        name: "description",
        content: "Manage your gigs, review booking requests and track earnings.",
      },
      { property: "og:title", content: "Creator dashboard — CreatorHive" },
      { property: "og:description", content: "Manage gigs and booking requests on CreatorHive." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireRole role="creator">
      <CreatorDashboardPage />
    </RequireRole>
  ),
});

type PendingAction = { booking: Booking; status: Exclude<BookingStatus, "pending"> };

function CreatorDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const creatorId = user?.id ?? "";

  const gigsQuery = useQuery({
    queryKey: gigKeys.mine(creatorId),
    queryFn: () => fetchCreatorGigs(creatorId),
    enabled: Boolean(user),
  });
  const bookingsQuery = useQuery({
    queryKey: bookingKeys.creator(creatorId),
    queryFn: () => fetchCreatorBookings(creatorId),
    enabled: Boolean(user),
  });

  const [action, setAction] = useState<PendingAction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const gigs = gigsQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];

  const stats = useMemo(() => {
    const accepted = bookings.filter((booking) => booking.status === "accepted");
    return {
      activeGigs: gigs.filter((gig) => gig.is_active).length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      accepted: accepted.length,
      earnings: accepted.reduce((total, booking) => total + Number(booking.budget), 0),
    };
  }, [gigs, bookings]);

  async function confirmStatus() {
    if (!action || busy) return;
    setBusy(true);
    try {
      await updateBookingStatus(action.booking.id, action.status);
      await queryClient.invalidateQueries({ queryKey: bookingKeys.creator(creatorId) });
      toast.success(action.status === "accepted" ? "Booking accepted" : "Booking declined");
      setAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the booking");
    } finally {
      setBusy(false);
    }
  }

  async function toggleGig(id: string, isActive: boolean) {
    try {
      await setGigActive(id, isActive);
      await queryClient.invalidateQueries({ queryKey: gigKeys.all });
      toast.success(isActive ? "Gig activated" : "Gig deactivated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the gig");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || busy) return;
    setBusy(true);
    try {
      await deleteGig(deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: gigKeys.all });
      toast.success("Gig deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the gig");
    } finally {
      setBusy(false);
    }
  }

  function bookingsFor(status: string) {
    return status === "all" ? bookings : bookings.filter((booking) => booking.status === status);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Creator dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Review requests and manage the gigs you offer.
          </p>
        </div>
        <Button asChild>
          <Link to="/gigs/new">
            <Plus className="size-4" aria-hidden="true" />
            Post a gig
          </Link>
        </Button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active gigs", value: String(stats.activeGigs), Icon: BriefcaseBusiness },
          { label: "Pending requests", value: String(stats.pending), Icon: Clock },
          { label: "Accepted bookings", value: String(stats.accepted), Icon: CheckCircle2 },
          { label: "Potential earnings", value: formatMoney(stats.earnings), Icon: DollarSign },
        ].map((card) => (
          <div key={card.label} className="surface-card p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <card.Icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Booking requests</h2>
        <Tabs defaultValue="all" className="mt-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>

          {["all", "pending", "accepted", "declined"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {bookingsQuery.isError ? (
                <ErrorState
                  message={
                    bookingsQuery.error instanceof Error ? bookingsQuery.error.message : undefined
                  }
                  onRetry={() => void bookingsQuery.refetch()}
                />
              ) : bookingsQuery.isLoading ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : bookingsFor(tab).length === 0 ? (
                <EmptyState
                  title="No booking requests here"
                  description="When clients send briefs for your gigs, they appear in this list."
                />
              ) : (
                bookingsFor(tab).map((booking) => (
                  <article key={booking.id} className="surface-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.project_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.client_name} · {booking.gig_title} · {booking.reference_number}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {truncate(booking.requirements, 160)}
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-muted-foreground">Requested</dt>
                        <dd className="font-medium">{formatDate(booking.created_at)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Start</dt>
                        <dd className="font-medium">{formatDate(booking.preferred_start_date)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Delivery</dt>
                        <dd className="font-medium">
                          {formatDate(booking.expected_delivery_date)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Budget</dt>
                        <dd className="font-medium">{formatMoney(booking.budget)}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/bookings/$id" params={{ id: booking.id }}>
                          View Details
                        </Link>
                      </Button>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setAction({ booking, status: "accepted" })}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setAction({ booking, status: "declined" })}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold">My gigs</h2>
        <div className="mt-4 space-y-4">
          {gigsQuery.isError ? (
            <ErrorState
              message={gigsQuery.error instanceof Error ? gigsQuery.error.message : undefined}
              onRetry={() => void gigsQuery.refetch()}
            />
          ) : gigsQuery.isLoading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : gigs.length === 0 ? (
            <EmptyState
              title="You haven't published a gig yet"
              description="Create your first gig so clients can discover and book you."
              action={
                <Button asChild>
                  <Link to="/gigs/new">Post a gig</Link>
                </Button>
              }
            />
          ) : (
            gigs.map((gig) => (
              <article
                key={gig.id}
                className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{gig.title}</h3>
                    <Badge variant={gig.is_active ? "secondary" : "outline"}>
                      {gig.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {gig.category} · {formatRate(gig.rate, gig.rate_type)} · {gig.delivery_days}-day
                    delivery
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/gigs/$id" params={{ id: gig.id }}>
                      View
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/gigs/$id/edit" params={{ id: gig.id }}>
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void toggleGig(gig.id, !gig.is_active)}
                  >
                    {gig.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget({ id: gig.id, title: gig.title })}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <AlertDialog open={action !== null} onOpenChange={(open) => !open && setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action?.status === "accepted" ? "Accept this booking?" : "Decline this booking?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action?.status === "accepted"
                ? `${action?.booking.client_name} will see this request as accepted. This can't be changed afterwards.`
                : `${action?.booking.client_name} will see this request as declined. This can't be changed afterwards.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmStatus();
              }}
              disabled={busy}
            >
              {busy
                ? "Saving…"
                : action?.status === "accepted"
                  ? "Accept booking"
                  : "Decline booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the gig from the marketplace. Existing bookings are not
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Delete gig"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
