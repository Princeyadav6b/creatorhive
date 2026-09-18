# CreatorHive — Creator Gig Marketplace

A full-stack marketplace where creators publish gigs and clients book them.

## Stack decision

The project already runs on a modern full-stack setup (TanStack Start + React + TypeScript + Tailwind + shadcn/ui), which is equivalent to the Next.js App Router stack you described — so I'll build on it rather than rewrite the project.

For accounts and data I'll use Lovable Cloud (built-in database, authentication, and server functions) instead of Firebase. No external accounts, keys, or `.env` setup needed, and security rules live in the database itself. Everything else from your brief (React Hook Form, Zod, Lucide icons, Sonner toasts) stays as specified.

## Data model

- **profiles** — id, full name, email, avatar, created/updated
- **user_roles** — separate table (creator / client) so roles can't be tampered with from the browser
- **gigs** — creator, title, category, rate, rate type, description, delivery days, cover image, active flag
- **bookings** — reference number, gig + creator + client snapshots, project title, requirements, start/delivery dates, budget, contact email, reference link, status (pending/accepted/declined)

Row-level security: anyone reads active gigs; creators write only their own gigs; clients create and read only their own bookings; creators read bookings on their gigs and are the only ones who can accept/decline; status limited to the three allowed values.

## Pages

`/` landing · `/marketplace` · `/gigs/:id` · `/gigs/new` · `/gigs/:id/edit` · `/creator/dashboard` · `/my-bookings` · `/bookings/:id` · `/sign-in` · `/sign-up` · `/unauthorized` · 404

## Features

1. **Landing** — hero ("Turn your creative skills into opportunities."), featured gigs, categories, how it works, trust & safety, final CTA, footer.
2. **Marketplace** — card grid, instant search, category / rate-type / price filters, sorting, clear filters, results count, load more, skeletons, empty and error states.
3. **Gig details + booking** — full gig view, similar gigs, validated booking modal, duplicate-submit protection, creators blocked from booking themselves, confirmation screen with reference number.
4. **Creator dashboard** — summary cards, bookings list with tabs and accept/decline confirmation dialogs, My Gigs management (create, edit, delete, activate/deactivate).
5. **My Bookings** — client's bookings with status filter, search, newest first, skeletons, empty state.
6. **Auth** — sign up with role choice, sign in, sign out, password visibility toggle, protected routes, unauthorized page, demo login buttons.

## Design

Light neutral background, white cards with 16–24px radius and soft shadows, purple + electric-blue accents, warm highlight accent, Inter-style typography, generous spacing, subtle hover/focus states. All colors as design tokens; accessible focus rings, labels, and dialogs throughout.

## Demo data

Seeded at setup: 4 creators, 2 clients, 10 gigs across categories, 8 bookings spread across pending/accepted/declined. Demo credentials surfaced on the sign-in page.

## Verification

Type checking, lint, and a browser pass over the full flow: register/sign in both roles, publish a gig, find it via search and category filter, book it, confirm pending status appears in My Bookings and the creator dashboard, accept one booking and decline another, check unauthorized access is blocked, and check mobile/tablet/desktop layouts plus console errors.
