"use client";

import type { StaffShipment, Cargo, Truck, DemoRoute, TrackingResult, TrackingStep } from "@/types";
import { SEED_SHIPMENTS, SEED_CARGO, SEED_TRUCKS, SEED_ROUTES } from "@/data/seed";

// ─── Keys ───────────────────────────────────────────────────────
const KEYS = {
  shipments: "pgb_shipments",
  cargo: "pgb_cargo",
  trucks: "pgb_trucks",
  routes: "pgb_routes",
  auth: "pgb_auth",
  counters: "pgb_counters",
} as const;

// ─── Helpers ────────────────────────────────────────────────────
function read<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch { return fallback; }
}

function write<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function readCounters(): { shipment: number; cargo: number } {
  if (typeof window === "undefined") return { shipment: 2056, cargo: 78439 };
  try {
    const raw = localStorage.getItem(KEYS.counters);
    return raw ? JSON.parse(raw) : { shipment: 2056, cargo: 78439 };
  } catch { return { shipment: 2056, cargo: 78439 }; }
}

function writeCounters(c: { shipment: number; cargo: number }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.counters, JSON.stringify(c));
}

// ─── Shipments ──────────────────────────────────────────────────
export function getShipments(): StaffShipment[] {
  return read<StaffShipment>(KEYS.shipments, SEED_SHIPMENTS);
}

export function getShipment(id: string): StaffShipment | undefined {
  return getShipments().find(s => s.id === id);
}

export function createShipment(input: {
  origin: string; destination: string; priority: StaffShipment["priority"];
  weight: number; volume: number; deadline: string; cargoDescription: string;
}): { shipment: StaffShipment; cargo: Cargo } {
  const counters = readCounters();
  const shipmentId = `SHP-${counters.shipment}`;
  const prefix = input.origin.slice(0, 3).toUpperCase();
  const suffix = String.fromCharCode(65 + (counters.shipment % 26)) + (counters.shipment % 10);
  const code = `PGB-${prefix}-${counters.shipment}-${suffix}`;
  const cargoId = `CRG-${counters.cargo}`;

  const shipment: StaffShipment = {
    id: shipmentId, code, cargoId, ...input,
    status: "Created", assignedTruck: null, assignedRoute: null, currentLocation: input.origin,
  };

  const cargo: Cargo = {
    id: cargoId, shipmentId, description: input.cargoDescription,
    weight: input.weight, volume: input.volume, origin: input.origin,
    destination: input.destination, priority: input.priority, specialHandling: "None", status: "Pending",
  };

  const shipments = getShipments();
  shipments.push(shipment);
  write(KEYS.shipments, shipments);

  const cargoList = getCargo();
  cargoList.push(cargo);
  write(KEYS.cargo, cargoList);

  writeCounters({ shipment: counters.shipment + 1, cargo: counters.cargo + 1 });
  return { shipment, cargo };
}

export function updateShipment(id: string, patch: Partial<StaffShipment>) {
  const shipments = getShipments().map(s => s.id === id ? { ...s, ...patch } : s);
  write(KEYS.shipments, shipments);
}

// ─── Cargo ──────────────────────────────────────────────────────
export function getCargo(): Cargo[] {
  return read<Cargo>(KEYS.cargo, SEED_CARGO);
}

export function createCargo(input: Omit<Cargo, "id">): Cargo {
  const counters = readCounters();
  const cargo: Cargo = { id: `CRG-${counters.cargo}`, ...input };
  const list = getCargo();
  list.push(cargo);
  write(KEYS.cargo, list);
  writeCounters({ ...counters, cargo: counters.cargo + 1 });
  return cargo;
}

// ─── Trucks ─────────────────────────────────────────────────────
export function getTrucks(): Truck[] {
  return read<Truck>(KEYS.trucks, SEED_TRUCKS);
}

export function createTruck(input: Omit<Truck, "id" | "status">): Truck {
  const list = getTrucks();
  const nextNum = list.length + 1;
  const truck: Truck = { id: `TRK-${String(nextNum).padStart(3, "0")}`, status: "Available", ...input };
  list.push(truck);
  write(KEYS.trucks, list);
  return truck;
}

export function getTruck(id: string): Truck | undefined {
  return getTrucks().find(t => t.id === id || t.numberPlate === id);
}

// ─── Routes ─────────────────────────────────────────────────────
export function getRoutes(): DemoRoute[] {
  return read<DemoRoute>(KEYS.routes, SEED_ROUTES);
}

// ─── Assignment ─────────────────────────────────────────────────
export function assignShipmentToTruck(shipmentId: string, truckId: string): boolean {
  const truck = getTruck(truckId);
  const shipment = getShipment(shipmentId);
  if (!truck || !shipment) return false;

  updateShipment(shipmentId, {
    assignedTruck: truck.numberPlate,
    status: "Assigned",
  });

  const trucks = getTrucks().map(t =>
    t.id === truck.id ? { ...t, status: "Assigned" as const } : t
  );
  write(KEYS.trucks, trucks);
  return true;
}

// ─── Auth ───────────────────────────────────────────────────────
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEYS.auth) === "true";
}

export function setAuthenticated(val: boolean) {
  if (typeof window === "undefined") return;
  if (val) localStorage.setItem(KEYS.auth, "true");
  else localStorage.removeItem(KEYS.auth);
}

// ─── Tracking ───────────────────────────────────────────────────
export function getTrackingResult(id: string): TrackingResult | null {
  const shipment = getShipment(id);
  if (!shipment) return null;
  const cargo = getCargo().find(c => c.shipmentId === id);
  if (!cargo) return null;

  const statusOrder: StaffShipment["status"][] = [
    "Created", "In Transit", "Misplaced", "Recovery Found", "Recovered", "Delivered",
  ];
  const currentIdx = statusOrder.indexOf(shipment.status);

  const steps: TrackingStep[] = [
    { label: "Order Created", timestamp: "Sep 17, 09:00", completed: currentIdx >= 0, active: currentIdx === 0 },
    { label: "In Transit", timestamp: "Sep 17, 14:30", completed: currentIdx >= 1, active: currentIdx === 1 },
    { label: "Misplaced", timestamp: "Sep 18, 02:15", completed: currentIdx >= 2, active: currentIdx === 2 },
    { label: "Recovery Found", timestamp: "Sep 18, 08:40", completed: currentIdx >= 3, active: currentIdx === 3 },
    { label: "On Recovery Route", timestamp: "Sep 18, 12:00", completed: currentIdx >= 4, active: currentIdx === 4 },
    { label: "Delivered", timestamp: "Estimated 18:40", completed: currentIdx >= 5, active: currentIdx === 5 },
  ];

  const route = shipment.assignedRoute
    ? (getRoutes().find(r => r.id === shipment.assignedRoute)?.hubs ?? [shipment.origin, shipment.destination])
    : [shipment.origin, shipment.destination];

  return { shipment, cargo, steps, route };
}

// ─── Search ─────────────────────────────────────────────────────
export function searchShipments(query: string): StaffShipment[] {
  const q = query.toLowerCase().trim();
  if (!q) return getShipments();
  return getShipments().filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.cargoId.toLowerCase().includes(q) ||
    (s.assignedTruck?.toLowerCase().includes(q) ?? false)
  );
}
