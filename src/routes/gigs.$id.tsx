import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDialog } from "@/components/BookingDialog";
import { GigCard } from "@/components/GigCard";
import { EmptyState, ErrorState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { fetchActiveGigs, fetchGig, gigKeys } from "@/lib/api";
import { CATEGORY_GRADIENTS } from "@/lib/constants";
import { formatMoney, initials, rateTypeLabel } from "@/lib/format";

export const Route = createFileRoute("/gigs/$id")({
  head: () => ({
    meta: [
      { title: "Gig details — CreatorHive" },
      {
        name: "description",
        content: "See what's included in this creative gig and send a booking request.",
      },
      { property: "og:title", content: "Gig details — CreatorHive" },
      {
        property: "og:description",
        content: "See what's included in this gig and book the creator.",
      },
    ],
  }),
  component: GigDetailPage,
});

function GigDetailPage() {
  const { id } = Route.useParams();
  const { user, profile, isClient } = useAuth();
  const [open, setOpen] = useState(false);

  const {
    data: gig,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: gigKeys.byId(id),
    queryFn: () => fetchGig(id),
  });
  const { data: allGigs } = useQuery({ queryKey: gigKeys.active, queryFn: fetchActiveGigs });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12 sm:px-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
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

  if (!gig || !gig.is_active) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="This gig isn't available"
          description="It may have been removed or deactivated by the creator."
          action={
            <Button asChild variant="outline">
              <Link to="/marketplace">Back to marketplace</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isOwnGig = user?.id === gig.creator_id;
  const similar = (allGigs ?? [])
    .filter((item) => item.category === gig.category && item.id !== gig.id)
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <article>
          {gig.cover_image_url ? (
            <img
              src={gig.cover_image_url}
              alt={`Cover image for ${gig.title}`}
              className="h-72 w-full rounded-3xl object-cover"
            />
          ) : (
            <div
              className={`h-72 w-full rounded-3xl bg-gradient-to-br ${CATEGORY_GRADIENTS[gig.category] ?? "from-primary to-accent"}`}
              aria-hidden="true"
            />
          )}

          <Badge variant="secondary" className="mt-6">
            <Tag className="size-3.5" aria-hidden="true" />
            {gig.category}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{gig.title}</h1>

          <div className="mt-5 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials(gig.creator_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{gig.creator_name}</p>
              <p className="text-sm text-muted-foreground">Creator on CreatorHive</p>
            </div>
          </div>

          <div className="prose mt-8 max-w-none">
            <h2 className="text-lg font-semibold">About this gig</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{gig.description}</p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              `Delivered in ${gig.delivery_days} ${gig.delivery_days === 1 ? "day" : "days"}`,
              `${rateTypeLabel(gig.rate_type)} pricing`,
              "Structured brief with dates and budget",
              "Creator confirms before work starts",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-card space-y-5 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-3xl font-bold">{formatMoney(gig.rate)}</p>
              <p className="text-sm text-muted-foreground">{rateTypeLabel(gig.rate_type)}</p>
            </div>

            <div className="space-y-2 rounded-xl bg-secondary/70 p-4 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                {gig.delivery_days}-day delivery
              </p>
              <p className="flex items-center gap-2">
                <CalendarClock className="size-4 text-muted-foreground" aria-hidden="true" />
                You choose the start date
              </p>
            </div>

            {isOwnGig ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This is your gig, so you can't book it.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/gigs/$id/edit" params={{ id: gig.id }}>
                    Edit gig
                  </Link>
                </Button>
              </div>
            ) : !user ? (
              <Button asChild size="lg" className="w-full">
                <Link to="/sign-in" search={{ redirect: `/gigs/${gig.id}` }}>
                  Sign in to book
                </Link>
              </Button>
            ) : isClient ? (
              <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
                Book this gig
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only client accounts can book gigs. Create a client account to send a request.
              </p>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">More in {gig.category}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <GigCard key={item.id} gig={item} />
            ))}
          </div>
        </section>
      )}

      {user && isClient && (
        <BookingDialog
          gig={gig}
          clientId={user.id}
          clientName={profile?.full_name ?? "Client"}
          clientEmail={user.email ?? ""}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}
