import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Monitor, Moon, Sparkles, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/format";
import { useTheme } from "@/components/theme-context";

type NavItem = {
  label: string;
  to: "/marketplace" | "/gigs/new" | "/creator/dashboard" | "/my-bookings";
};

export function Header() {
  const { user, profile, role, isCreator, isClient, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems: NavItem[] = [{ label: "Marketplace", to: "/marketplace" }];
  if (isCreator) {
    navItems.push({ label: "Post a Gig", to: "/gigs/new" });
    navItems.push({ label: "Creator Dashboard", to: "/creator/dashboard" });
  }
  if (isClient) {
    navItems.push({ label: "My Bookings", to: "/my-bookings" });
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      void navigate({ to: "/" });
    } catch {
      toast.error("Could not sign out. Please try again.");
    }
  }

  const displayName = profile?.full_name || user?.email || "Account";
  const themeLabel = theme === "system" ? "system preference" : `${theme} mode`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="CreatorHive home">
          <span className="gradient-brand flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">CreatorHive</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-lg border border-border bg-card p-0.5"
            aria-label="Theme"
          >
            {(
              [
                ["light", Sun, "Use light mode"],
                ["dark", Moon, "Use dark mode"],
                ["system", Monitor, "Use system theme"],
              ] as const
            ).map(([value, Icon, label]) => (
              <Button
                key={value}
                type="button"
                variant={theme === value ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                aria-label={label}
                aria-pressed={theme === value}
                title={label}
                onClick={() => setTheme(value)}
              >
                <Icon className="size-4" aria-hidden="true" />
              </Button>
            ))}
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2" aria-label="Account menu">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="text-xs font-normal capitalize text-muted-foreground">
                    {role ?? "member"} account
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isCreator && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/creator/dashboard">Creator dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/gigs/new">Post a gig</Link>
                    </DropdownMenuItem>
                  </>
                )}
                {isClient && (
                  <DropdownMenuItem asChild>
                    <Link to="/my-bookings">My bookings</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/marketplace">Browse marketplace</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Get started</Link>
              </Button>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu · {themeLabel}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1 px-4 pb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-foreground" }}
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <Link
                      to="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Sign In
                    </Link>
                    <Button asChild className="mt-2">
                      <Link to="/sign-up" onClick={() => setMobileOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                  </>
                )}
                {user && (
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setMobileOpen(false);
                      void handleSignOut();
                    }}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sign out
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
