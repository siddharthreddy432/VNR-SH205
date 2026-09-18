"use client";

import { useEffect, useState } from "react";
import { getShipments, createShipment, searchShipments, getTrucks, assignShipmentToTruck } from "@/lib/store";
import type { StaffShipment } from "@/types";
import { CITIES } from "@/types";
import { Search, Plus, X, Package, ArrowRight } from "lucide-react";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<StaffShipment[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShipments(getShipments());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShipments(searchShipments(query));
  }, [query]);

  // Create form state
  const [form, setForm] = useState({
    origin: "Hyderabad", destination: "Chennai", priority: "Medium" as StaffShipment["priority"],
    weight: "", volume: "", deadline: "", cargoDescription: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(form.weight);
    const v = parseFloat(form.volume);
    if (!w || !v || !form.deadline || !form.cargoDescription.trim()) return;

    createShipment({
      origin: form.origin, destination: form.destination, priority: form.priority,
      weight: w, volume: v, deadline: form.deadline, cargoDescription: form.cargoDescription,
    });

    setShipments(getShipments());
    setShowCreate(false);
    setForm({ origin: "Hyderabad", destination: "Chennai", priority: "Medium", weight: "", volume: "", deadline: "", cargoDescription: "" });
    setSuccess("Shipment created successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAssign = (truckId: string) => {
    if (!showAssign) return;
    assignShipmentToTruck(showAssign, truckId);
    setShipments(getShipments());
    setShowAssign(null);
    setSuccess("Shipment assigned successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const trucks = getTrucks().filter(t => t.status === "Available");

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Shipments</h1>
          <p className="text-sm text-muted mt-1">{shipments.length} total shipments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> New Shipment
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-success/10 text-success border border-success/20 rounded-xl px-4 py-3 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by ID, code, cargo, or truck..."
          className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
        />
      </div>

      {/* Table */}
      <div className="hidden md:block bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">SHIPMENT</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">CARGO</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">ROUTE</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">PRIORITY</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">STATUS</th>
              <th className="text-left px-5 py-3 font-mono text-[10px] text-muted tracking-wider">TRUCK</th>
              <th className="text-right px-5 py-3 font-mono text-[10px] text-muted tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-mono font-bold text-xs">{s.id}</p>
                  <p className="font-mono text-[10px] text-muted">{s.code}</p>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-muted">{s.cargoId}</td>
                <td className="px-5 py-4 text-xs">{s.origin} → {s.destination}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium ${s.priority === "High" ? "text-accent" : s.priority === "Medium" ? "text-foreground" : "text-muted"}`}>
                    {s.priority}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                    s.status === "Recovered" || s.status === "Recovery Found" ? "status-recovered" :
                    s.status === "Misplaced" ? "status-misplaced" :
                    s.status === "In Transit" ? "status-transit" :
                    s.status === "Assigned" ? "status-assigned" : "status-pending"
                  }`}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-muted">{s.assignedTruck ?? "—"}</td>
                <td className="px-5 py-4 text-right">
                  {!s.assignedTruck && (
                    <button
                      onClick={() => setShowAssign(s.id)}
                      className="text-xs text-accent hover:text-foreground transition-colors font-medium"
                    >
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {shipments.map(s => (
          <div key={s.id} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <div>
                  <p className="font-mono text-sm font-bold">{s.id}</p>
                  <p className="font-mono text-[10px] text-muted">{s.code}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                s.status === "Recovered" || s.status === "Recovery Found" ? "status-recovered" :
                s.status === "Misplaced" ? "status-misplaced" :
                s.status === "In Transit" ? "status-transit" :
                s.status === "Assigned" ? "status-assigned" : "status-pending"
              }`}>
                {s.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted mb-2">{s.origin} → {s.destination}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{s.weight} kg · {s.volume} m³</span>
              {!s.assignedTruck && (
                <button onClick={() => setShowAssign(s.id)} className="text-accent font-medium">Assign</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-background border border-border rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">New Shipment</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">ORIGIN</label>
                  <select value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">DESTINATION</label>
                  <select value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">PRIORITY</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as StaffShipment["priority"]})} className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">WEIGHT (kg)</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="42" className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">VOLUME (m³)</label>
                  <input type="number" step="0.1" value={form.volume} onChange={e => setForm({...form, volume: e.target.value})} placeholder="0.8" className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">DEADLINE</label>
                <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted tracking-wider block mb-1">CARGO DESCRIPTION</label>
                <input type="text" value={form.cargoDescription} onChange={e => setForm({...form, cargoDescription: e.target.value})} placeholder="Consumer Electronics" className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
              </div>
              <button type="submit" className="w-full bg-foreground text-background py-3 rounded-xl font-medium hover:bg-accent transition-colors mt-2">
                Create Shipment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-foreground/40 flex items-center justify-center p-4" onClick={() => setShowAssign(null)}>
          <div className="bg-background border border-border rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Assign Truck</h2>
              <button onClick={() => setShowAssign(null)} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted mb-4">Select a truck for <span className="font-mono font-bold text-foreground">{showAssign}</span></p>
            {trucks.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No available trucks.</p>
            ) : (
              <div className="space-y-2">
                {trucks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleAssign(t.id)}
                    className="w-full flex items-center justify-between bg-surface border border-border rounded-xl p-4 hover:border-accent transition-colors text-left"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold">{t.numberPlate}</p>
                      <p className="text-xs text-muted">{t.driverName} · {t.destination}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-accent">{t.availableCapacity} kg</p>
                      <ArrowRight className="w-3.5 h-3.5 text-muted ml-auto mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
