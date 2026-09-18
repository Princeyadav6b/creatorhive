import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GigCard } from "@/components/GigCard";
import { GigCardSkeleton } from "@/components/States";
import { fetchActiveGigs, gigKeys } from "@/lib/api";
import { GIG_CATEGORIES } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CreatorHive — Turn your creative skills into opportunities" },
      {
        name: "description",
        content:
          "CreatorHive connects young creators with clients who need design, video, photography, writing and code. Publish a gig or book one today.",
      },
      {
        property: "og:title",
        content: "CreatorHive — Turn your creative skills into opportunities",
      },
      {
        property: "og:description",
        content: "Publish creative gigs, get booked, and manage every request in one place.",
      },
    ],
  }),
  component: LandingPage,
});

const CREATOR_STEPS = [
  {
    title: "Create your gig",
    body: "Describe your service, set your rate and delivery time in minutes.",
    Icon: Sparkles,
  },
  {
    title: "Receive requests",
    body: "Clients send a detailed brief with dates and budget attached.",
    Icon: MessageSquare,
  },
  {
    title: "Accept and deliver",
    body: "Approve the work you want, decline the rest, keep everything tracked.",
    Icon: CalendarCheck,
  },
];

const CLIENT_STEPS = [
  {
    title: "Browse the marketplace",
    body: "Search by skill, category, price or delivery speed.",
    Icon: Search,
  },
  {
    title: "Send a clear brief",
    body: "Share requirements, dates and budget in one structured form.",
    Icon: BadgeCheck,
  },
  {
    title: "Track your bookings",
    body: "Follow every request from pending to accepted in My Bookings.",
    Icon: Wallet,
  },
];

function LandingPage() {
  const { data: gigs, isLoading } = useQuery({
    queryKey: gigKeys.active,
    queryFn: fetchActiveGigs,
  });
  const featured = (gigs ?? []).slice(0, 3);

  return (
    <div>
      <section className="gradient-hero">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              The marketplace for young creative talent
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Turn your creative skills into{" "}
              <span className="text-gradient-brand">opportunities.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              CreatorHive is where designers, editors, photographers, writers and developers publish
              their services — and where clients book them with a clear brief, dates and budget.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Button asChild size="lg" className="hero-action hero-action-browse">
                <Link to="/marketplace">
                  Browse Gigs
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="hero-action hero-action-sell">
                <Link to="/sign-up">Start Selling</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                { value: "9", label: "Creative categories" },
                { value: "48h", label: "Median first reply" },
                { value: "100%", label: "Briefs with budgets" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-bold">{stat.value}</dt>
                  <dd className="text-xs text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="surface-card hidden flex-col justify-center gap-5 p-8 lg:flex">
            <h2 className="text-lg font-semibold">What a booking looks like</h2>
            {[
              { label: "Brief", value: "Rebrand for Lumen Coffee" },
              { label: "Creator", value: "Maya Rivera · Graphic Design" },
              { label: "Dates", value: "Start in 3 days · deliver in 17" },
              { label: "Budget", value: "$520 fixed price" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-secondary/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.label}</p>
                <p className="mt-1 font-semibold">{row.value}</p>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Every request arrives structured, so creators can accept or decline in one click.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured gigs</h2>
            <p className="mt-1 text-muted-foreground">
              Fresh services from creators on the platform.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link to="/marketplace">
              See all gigs
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => <GigCardSkeleton key={index} />)
            : featured.map((gig) => <GigCard key={gig.id} gig={gig} />)}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Popular categories</h2>
          <p className="mt-1 text-muted-foreground">Find the creative skill your project needs.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {GIG_CATEGORIES.map((category) => (
              <Link
                key={category}
                to="/marketplace"
                search={{ category }}
                className="surface-card flex items-center justify-between px-5 py-4 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                {category}
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {[
            { title: "For creators", steps: CREATOR_STEPS },
            { title: "For clients", steps: CLIENT_STEPS },
          ].map((group) => (
            <div key={group.title} className="surface-card p-7">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <ol className="mt-5 space-y-5">
                {group.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold">
                        {index + 1}. {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
          {[
            {
              title: "Verified accounts",
              body: "Every gig is tied to a real creator account with a role that decides what they can do.",
              Icon: ShieldCheck,
            },
            {
              title: "Clear agreements",
              body: "Briefs capture requirements, dates and budget up front, so nothing is left to guesswork.",
              Icon: BadgeCheck,
            },
            {
              title: "You stay in control",
              body: "Creators accept or decline each request, and clients see the status change immediately.",
              Icon: CalendarCheck,
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <item.Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="gradient-brand rounded-3xl px-8 py-14 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to get booked?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Publish your first gig in under five minutes, or find the creator your next project
            needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/sign-up">Start Selling</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent"
            >
              <Link to="/marketplace">Browse Gigs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
