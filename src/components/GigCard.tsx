import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_GRADIENTS } from "@/lib/constants";
import { formatRate, initials, rateTypeLabel, truncate } from "@/lib/format";
import type { Gig } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GigCard({ gig }: { gig: Gig }) {
  const gradient = CATEGORY_GRADIENTS[gig.category] ?? CATEGORY_GRADIENTS["Other"];

  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div className="relative h-40 w-full overflow-hidden">
        {gig.cover_image_url ? (
          <img
            src={gig.cover_image_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={cn("flex size-full items-center justify-center bg-gradient-to-br", gradient)}
          >
            <span className="px-4 text-center text-sm font-semibold text-foreground/70">
              {gig.category}
            </span>
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-card text-card-foreground shadow-sm hover:bg-card">
          {gig.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{gig.title}</h3>

        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
              {initials(gig.creator_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{gig.creator_name}</span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {truncate(gig.description, 120)}
        </p>

        <div className="mt-auto space-y-4 pt-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="text-lg font-bold">{formatRate(gig.rate, gig.rate_type)}</p>
              <p className="text-xs text-muted-foreground">{rateTypeLabel(gig.rate_type)}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              {gig.delivery_days} {gig.delivery_days === 1 ? "day" : "days"}
            </span>
          </div>

          <Button asChild className="w-full" variant="secondary">
            <Link to="/gigs/$id" params={{ id: gig.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
