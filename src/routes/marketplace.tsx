import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
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
import { GigCard } from "@/components/GigCard";
import { EmptyState, ErrorState, GigCardSkeleton } from "@/components/States";
import { fetchActiveGigs, gigKeys } from "@/lib/api";
import { GIG_CATEGORIES } from "@/lib/constants";

const PAGE_SIZE = 9;

type Sort = "newest" | "price-asc" | "price-desc";

export const Route = createFileRoute("/marketplace")({
  validateSearch: (search: Record<string, unknown>): { category?: string } =>
    typeof search["category"] === "string" ? { category: search["category"] } : {},
  head: () => ({
    meta: [
      { title: "Marketplace — browse creative gigs on CreatorHive" },
      {
        name: "description",
        content:
          "Search and filter creative gigs by category, price and delivery time, then book in a few clicks.",
      },
      { property: "og:title", content: "Marketplace — CreatorHive" },
      {
        property: "og:description",
        content: "Search creative gigs by category, price and delivery time.",
      },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const initial = Route.useSearch();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: gigKeys.active,
    queryFn: fetchActiveGigs,
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(initial.category ?? "all");
  const [rateType, setRateType] = useState<string>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const gigs = data ?? [];
    const term = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    const result = gigs.filter((gig) => {
      const matchesTerm =
        !term ||
        [gig.title, gig.creator_name, gig.category, gig.description].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesCategory = category === "all" || gig.category === category;
      const matchesRateType = rateType === "all" || gig.rate_type === rateType;
      const rate = Number(gig.rate);
      const matchesMin = min === null || Number.isNaN(min) || rate >= min;
      const matchesMax = max === null || Number.isNaN(max) || rate <= max;
      return matchesTerm && matchesCategory && matchesRateType && matchesMin && matchesMax;
    });

    return result.sort((a, b) => {
      if (sort === "price-asc") return Number(a.rate) - Number(b.rate);
      if (sort === "price-desc") return Number(b.rate) - Number(a.rate);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [data, query, category, rateType, minPrice, maxPrice, sort]);

  const hasFilters =
    query !== "" ||
    category !== "all" ||
    rateType !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== "newest";

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setRateType("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Discover creators across design, video, photography, writing, audio and code.
        </p>
      </header>

      <section aria-label="Filters" className="surface-card mt-8 space-y-5 p-5 sm:p-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search gigs, creators, categories…"
            aria-label="Search gigs"
            className="pl-9"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="filter-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setVisible(PAGE_SIZE);
              }}
            >
              <SelectTrigger id="filter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {GIG_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-rate-type">Rate type</Label>
            <Select value={rateType} onValueChange={setRateType}>
              <SelectTrigger id="filter-rate-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rate type</SelectItem>
                <SelectItem value="fixed">Fixed price</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-min">Min price</Label>
            <Input
              id="filter-min"
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-max">Max price</Label>
            <Input
              id="filter-max"
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="2000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filter-sort">Sort by</Label>
            <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
              <SelectTrigger id="filter-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Lowest price</SelectItem>
                <SelectItem value="price-desc">Highest price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isLoading
              ? "Loading gigs…"
              : `${filtered.length} ${filtered.length === 1 ? "gig" : "gigs"} found`}
          </p>
          <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters}>
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Clear Filters
          </Button>
        </div>
      </section>

      <section className="mt-8">
        {isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <GigCardSkeleton key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No gigs match those filters"
            description="Try a different search term, widen your price range, or clear the filters to see everything."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visible).map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisible((value) => value + PAGE_SIZE)}
                >
                  Load more gigs
                </Button>
              </div>
            )}
          </>
        )}
        {isRefetching && !isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">Refreshing…</p>
        )}
      </section>
    </div>
  );
}
