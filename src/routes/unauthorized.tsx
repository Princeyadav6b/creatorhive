import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access restricted — CreatorHive" },
      {
        name: "description",
        content: "This CreatorHive page is available to a different account type.",
      },
      { property: "og:title", content: "Access restricted — CreatorHive" },
      {
        property: "og:description",
        content: "This page is available to a different account type.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">You don't have access to this page</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Creator pages are for creator accounts and booking pages are for client accounts. Switch
        accounts or head back to the marketplace.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/marketplace">Browse gigs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/sign-in">Sign in with another account</Link>
        </Button>
      </div>
    </div>
  );
}
