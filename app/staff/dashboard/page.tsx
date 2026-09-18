"use client";

import { useEffect, useState } from "react";
import { getShipments, getTrucks, getRoutes } from "@/lib/store";
import type { StaffShipment, Truck } from "@/types";
import { Package, Truck as TruckIcon, Route, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [shipments, setShipments] = useState<StaffShipment[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [routeCount, setRouteCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShipments(getShipments());
    setTrucks(getTrucks());
    setRouteCount(getRoutes().length);
  }, []);

  const active = shipments.filter(s => s.status === "In Transit" || s.status === "Assigned").length;
  const recovered = shipments.filter(s => s.status === "Recovered" || s.status === "Recovery Found").length;
  const pending = shipments.filter(s => s.status === "Misplaced" || s.status === "Pending").length;
  const availableTrucks = trucks.filter(t => t.status === "Available").length;

  const recoveryQueue = shipments.filter(s => s.status === "Misplaced" || s.status === "Pending" || s.status === "Recovery Found");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Overview</h1>
        <p className="text-sm text-muted mt-1">Piggyback Operations Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Active Shipments", value: active, icon: Package, color: "text-accent" },
          { label: "Recovered", value: recovered, icon: CheckCircle2, color: "text-success" },
          { label: "Pending Recovery", value: pending, icon: AlertCircle, color: "text-error" },
          { label: "Available Trucks", value: availableTrucks, icon: TruckIcon, color: "text-foreground" },
          { label: "Active Routes", value: routeCount, icon: Route, color: "text-accent" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-muted tracking-wider">{stat.label.toUpperCase()}</span>
            </div>
            <p className="text-3xl font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recovery Queue */}
      <div>
        <h2 className="text-lg font-medium mb-4">Live Recovery Queue</h2>
        {recoveryQueue.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-8 text-center">
            <p className="text-muted mb-1">No shipments waiting for recovery.</p>
            <p className="text-sm text-muted/60 italic">Everything is moving.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recoveryQueue.map(s => (
              <div key={s.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold">{s.id}</p>
                    <p className="text-xs text-muted">{s.origin} → {s.destination}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                    s.status === "Recovery Found" ? "status-recovered" :
                    s.status === "Misplaced" ? "status-misplaced" : "status-pending"
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted font-mono">{s.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
