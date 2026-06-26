// src/components/UserNavbar.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SignedIn, UserButton, useUser } from "@clerk/clerk-react";

import "./UserNavbar.css";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app", label: "Snapshot", icon: Search },
];

export default function UserNavbar() {
  const location = useLocation();
  const { user } = useUser();

  return (
    <SignedIn>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border/40 shadow-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-6 px-4">
          {/* Brand */}
          <Link to="/" className="font-semibold text-xl tracking-tight text-foreground">
            FlipNova
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Quick search any product..."
                className="pl-10 bg-muted/50 border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-primary h-9"
              />
            </div>
          </div>

          {/* Navigation + user */}
          <div className="flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors",
                  location.pathname === item.href && "text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}

            {/* Show Upgrade only if user is not Pro */}
            {user?.publicMetadata?.subscriptionStatus !== 'active' && (
              <Link
                to="/pricing"
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
    </SignedIn>
  );
}