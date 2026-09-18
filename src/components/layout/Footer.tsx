import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="gradient-brand flex size-8 items-center justify-center rounded-lg text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold">CreatorHive</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            The marketplace where young creators turn their skills into paid work.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/marketplace" className="hover:text-foreground">
                Browse gigs
              </Link>
            </li>
            <li>
              <Link to="/sign-up" className="hover:text-foreground">
                Start selling
              </Link>
            </li>
            <li>
              <Link to="/sign-in" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">For creators</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Publish unlimited gigs</li>
            <li>Manage booking requests</li>
            <li>Accept or decline in one click</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">For clients</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Discover vetted creators</li>
            <li>Book with a clear brief</li>
            <li>Track every request</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} CreatorHive. A demo marketplace built for creative work.
        </p>
      </div>
    </footer>
  );
}
