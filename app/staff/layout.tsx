"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Box, Truck, Route, LogOut } from "lucide-react";
import { setAuthenticated } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/staff/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/shipments", label: "Shipments", icon: Package },
  { href: "/staff/cargo", label: "Cargo", icon: Box },
  { href: "/staff/trucks", label: "Trucks", icon: Truck },
  { href: "/staff/routes", label: "Routes", icon: Route },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show sidebar for login page
  if (pathname === "/staff/login") return children;

  const handleLogout = () => {
    setAuthenticated(false);
    router.push("/");
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border shrink-0">
        <div className="p-6">
          <Link href="/" className="font-mono text-[10px] font-bold tracking-[0.25em] text-foreground hover:text-accent transition-colors">
            PIGGYBACK
          </Link>
          <p className="font-mono text-[9px] tracking-[0.15em] text-muted mt-1">OPERATIONS</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.8} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-accent">S</span>
            </div>
            <div>
              <p className="text-xs font-medium">Supervisor</p>
              <p className="text-[10px] text-muted font-mono">Online</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-xs text-muted hover:text-error transition-colors rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-50">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.8} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
