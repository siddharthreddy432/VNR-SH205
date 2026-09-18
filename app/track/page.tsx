"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, MapPin, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { getTrackingResult } from "@/lib/store";
import type { TrackingResult } from "@/types";

import Link from "next/link";

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") ?? "";

  const [input, setInput] = useState(initialId);
  const [state, setState] = useState<"idle" | "searching" | "found" | "not-found">("idle");
  const [result, setResult] = useState<TrackingResult | null>(null);

  const doSearch = useCallback((id: string) => {
    if (!id.trim()) return;
    setState("searching");
    // Simulate brief search — fast enough to feel responsive, visible enough to feel intelligent
    setTimeout(() => {
      const r = getTrackingResult(id.trim().toUpperCase());
      if (r) {
        setResult(r);
        setState("found");
      } else {
        setState("not-found");
      }
    }, 800);
  }, []);

  // Auto-search if URL has id
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialId) doSearch(initialId);
  }, [initialId, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(input);
  };

  return (
    <main className="min-h-dvh bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 sm:px-8 md:px-10 lg:px-14 pt-6 pb-4 border-b border-border/50">
        <Link href="/" className="font-mono text-xs font-bold tracking-[0.28em] text-foreground hover:text-accent transition-colors">
          PIGGYBACK
        </Link>
        <Link href="/staff/login" className="text-xs font-medium text-muted hover:text-foreground transition-colors">
          Staff →
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="font-mono text-xs tracking-[0.2em] text-accent mb-4">SHIPMENT TRACKING</p>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            Track Your Shipment
          </h1>
          <p className="text-muted text-lg">Enter your shipment ID to see real-time recovery status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-0 max-w-xl mx-auto mb-16">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="SHP-2048"
              aria-label="Shipment ID"
              className="w-full pl-11 pr-4 py-4 bg-surface border border-border rounded-l-2xl text-base text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-foreground text-background font-medium rounded-r-2xl hover:bg-accent transition-colors shrink-0"
          >
            Track →
          </button>
        </form>

        {/* Searching */}
        {state === "searching" && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin" />
            <p className="font-mono text-sm text-muted animate-pulse">Locating shipment...</p>
          </div>
        )}

        {/* Not Found */}
        {state === "not-found" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
              <Package className="w-7 h-7 text-error" />
            </div>
            <h2 className="text-xl font-medium mb-2">Shipment not found</h2>
            <p className="text-muted text-sm">Try <span className="font-mono text-foreground">SHP-2048</span> for a demo result.</p>
          </div>
        )}

        {/* Found */}
        {state === "found" && result && (
          <div className="space-y-8">
            {/* Shipment Card */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <div>
                  <p className="font-mono text-xs text-muted tracking-wider mb-1">SHIPMENT</p>
                  <p className="text-xl font-bold font-mono">{result.shipment.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                  result.shipment.status === "Recovered" || result.shipment.status === "Recovery Found" ? "status-recovered" :
                  result.shipment.status === "Misplaced" ? "status-misplaced" :
                  result.shipment.status === "In Transit" || result.shipment.status === "Assigned" ? "status-transit" :
                  "status-pending"
                }`}>
                  {result.shipment.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="font-mono text-[10px] text-muted tracking-wider mb-1">FROM</p>
                  <p className="font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted" />{result.shipment.origin}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted tracking-wider mb-1">TO</p>
                  <p className="font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-accent" />{result.shipment.destination}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted tracking-wider mb-1">PRIORITY</p>
                  <p className="font-medium flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-accent" />{result.shipment.priority}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted tracking-wider mb-1">DEADLINE</p>
                  <p className="font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-muted" />18 Sep, 20:00</p>
                </div>
              </div>

              {result.shipment.status === "Recovery Found" && (
                <div className="mt-6 pt-6 border-t border-border/50 bg-accent/5 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 pb-6 md:pb-8 rounded-b-3xl">
                  <p className="text-sm text-accent font-medium mb-1">Recovery Match Found</p>
                  <p className="text-sm text-muted">Your shipment has been matched to an existing route heading to {result.shipment.destination}.</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <p className="font-mono text-xs text-muted tracking-wider mb-6">TRACKING TIMELINE</p>
              <div className="space-y-0">
                {result.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        step.active ? "bg-accent ring-4 ring-accent/20" :
                        step.completed ? "bg-foreground" : "bg-border"
                      }`} />
                      {i < result.steps.length - 1 && (
                        <div className={`w-px flex-1 min-h-[2rem] ${step.completed ? "bg-foreground/30" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${step.active ? "text-accent" : step.completed ? "text-foreground" : "text-muted"}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted font-mono mt-0.5">{step.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <p className="font-mono text-xs text-muted tracking-wider mb-6">RECOVERY ROUTE</p>
              <div className="flex flex-wrap items-center gap-2">
                {result.route.map((stop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${i === 0 ? "text-foreground" : i === result.route.length - 1 ? "text-accent" : "text-muted"}`}>
                      {stop}
                    </span>
                    {i < result.route.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-border" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh bg-background flex items-center justify-center">
        <p className="font-mono text-sm text-muted">Loading...</p>
      </main>
    }>
      <TrackingContent />
    </Suspense>
  );
}
