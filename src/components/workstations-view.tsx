"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Workstation, Asset } from "@/types/inventory";
import { WorkstationDrawer } from "./workstation-drawer";
import { NetworkTopologyView } from "./network-topology";
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  Monitor, 
  Cpu, 
  Keyboard, 
  Mouse, 
  Presentation,
  AlertTriangle,
  Wrench,
  ChevronRight,
  Server
} from "lucide-react";

interface WorkstationsViewProps {
  onOpenReportTicket: (asset: Asset) => void;
  onOpenNewAsset: () => void;
}

export const WorkstationsView: React.FC<WorkstationsViewProps> = ({
  onOpenReportTicket,
  onOpenNewAsset,
}) => {
  const { selectedLab, labWorkstations, getWorkstationAssets, reassignAsset, liveTelemetry } = useInventory();
  const [selectedWs, setSelectedWs] = useState<Workstation | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "topology">("grid");

  const total = labWorkstations.length;
  const operational = labWorkstations.filter((w) => w.status === "operational").length;
  const degraded = labWorkstations.filter((w) => w.status === "degraded").length;
  const maintenance = labWorkstations.filter((w) => w.status === "maintenance").length;
  const healthPercent = total > 0 ? Math.round((operational / total) * 100) : 100;

  return (
    <div className="space-y-4 p-4">
      {/* Lab Header Summary Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900">{selectedLab.name}</span>
            <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-600 border border-zinc-200">
              {selectedLab.code}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {selectedLab.location.building} • {selectedLab.location.floor} | Supervisor: {selectedLab.supervisor}
          </p>
        </div>

        <div className="mt-3 md:mt-0 flex flex-col sm:flex-row items-end sm:items-center gap-4">
          {/* Status Dots */}
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-600">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"/>{operational} OK</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"/>{degraded} Degraded</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"/>{maintenance} Repair</div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-md border border-zinc-200 ml-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("topology")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${viewMode === "topology" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              Topología
            </button>
          </div>
        </div>
      </div>

      {/* Visual Lab Floor Plan / Architectural Grid */}
      <div>
        {/* Front Area (Teacher Podium) */}
        <div className="mb-4">
          <div className="w-full rounded-md bg-zinc-100 py-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border border-zinc-200">
            Teacher Podium / Front Screen
          </div>
        </div>

        {/* Workstations Grid or Topology */}
        {viewMode === "topology" ? (
          <NetworkTopologyView />
        ) : labWorkstations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-zinc-50 border border-zinc-200 border-dashed rounded-md">
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Server className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">El Laboratorio está vacío</h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              Aún no hay computadoras registradas en este laboratorio. Puedes registrarlas manualmente o usar el escáner USB para importarlas automáticamente.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={onOpenNewAsset} className="bg-zinc-900 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-zinc-800 transition-colors">
                + Crear Computadora
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`,
            }}
          >
            {labWorkstations.map((ws) => {
            const wsAssets = getWorkstationAssets(ws.id);
            const cpu = wsAssets.find((a) => a.category === "cpu");
            const monitor = wsAssets.find((a) => a.category === "monitor");
            const keyboard = wsAssets.find((a) => a.category === "keyboard");
            const mouse = wsAssets.find((a) => a.category === "mouse");

            const isOperational = ws.status === "operational";
            const isDegraded = ws.status === "degraded";
            const isMaintenance = ws.status === "maintenance";
            
            // Verificación de Telemetría (Ping en vivo)
            const telemetry = liveTelemetry[ws.code.toLowerCase()];
            const missingHardwareAlert = telemetry && telemetry.status === "online" && (telemetry.mice === 0 || telemetry.keyboards === 0);

            return (
              <div
                key={ws.id}
                onClick={() => setSelectedWs(ws)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("ring-2", "ring-indigo-500", "ring-offset-2");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("ring-2", "ring-indigo-500", "ring-offset-2");
                  const assetId = e.dataTransfer.getData("application/x-labvault-asset-id");
                  if (assetId) {
                    reassignAsset(assetId, ws.id);
                  }
                }}
                className={`group cursor-pointer relative rounded-md p-3 transition-colors border ${
                  isOperational
                    ? "bg-white border-zinc-200 hover:border-zinc-400"
                    : isDegraded
                    ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                    : "bg-rose-50/30 border-rose-200 hover:border-rose-300"
                } ${telemetry && telemetry.status === "offline" ? "opacity-70" : ""}`}
              >
                {/* Top header of desk card */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-600 border border-zinc-200">
                      {ws.code}
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 truncate max-w-[120px]">
                      {ws.name}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="flex items-center gap-1.5">
                    {/* Telemetry Status Ping */}
                    {telemetry ? (
                      telemetry.status === "online" ? (
                        <div className="relative flex h-2 w-2 mr-1" title="Online (LAN)">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-zinc-400 mr-1" title="Offline" />
                      )
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-zinc-200 mr-1" title="No Agent" />
                    )}

                    <span
                      className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border ${
                        isOperational
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : isDegraded
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      {isOperational ? "OK" : isDegraded ? "WARN" : "ERR"}
                    </span>
                  </div>
                </div>

                {/* Hardware Components Snapshot */}
                <div className="mt-3 space-y-2 text-xs">
                  {/* CPU info */}
                  <div 
                    draggable={!!cpu}
                    onDragStart={(e) => {
                      if (!cpu) return;
                      e.stopPropagation();
                      e.dataTransfer.setData("application/x-labvault-asset-id", cpu.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={`flex items-center gap-2 rounded-md p-1 -ml-1 transition-colors ${cpu ? "text-slate-700 hover:bg-slate-100 cursor-grab active:cursor-grabbing" : "text-slate-300"}`}
                  >
                    <Cpu className={`h-4 w-4 shrink-0 ${cpu ? "text-indigo-600" : "text-slate-300"}`} />
                    <span className="truncate text-xs font-medium">
                      {cpu ? `${cpu.brand} ${cpu.model}` : "Sin CPU asignada"}
                    </span>
                  </div>

                  {/* Monitor info */}
                  <div 
                    draggable={!!monitor}
                    onDragStart={(e) => {
                      if (!monitor) return;
                      e.stopPropagation();
                      e.dataTransfer.setData("application/x-labvault-asset-id", monitor.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={`flex items-center gap-2 rounded-md p-1 -ml-1 transition-colors ${monitor ? "text-slate-700 hover:bg-slate-100 cursor-grab active:cursor-grabbing" : "text-slate-300"}`}
                  >
                    <Monitor className={`h-4 w-4 shrink-0 ${monitor ? "text-sky-600" : "text-slate-300"}`} />
                    <span className="truncate text-xs font-medium">
                      {monitor ? monitor.name : "Sin Monitor"}
                    </span>
                  </div>

                  {/* Peripherals indicators */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div 
                        draggable={!!keyboard}
                        onDragStart={(e) => {
                          if (!keyboard) return;
                          e.stopPropagation();
                          e.dataTransfer.setData("application/x-labvault-asset-id", keyboard.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className={`flex items-center gap-1 rounded p-0.5 transition-colors ${keyboard ? "text-slate-700 font-medium hover:bg-slate-100 cursor-grab" : "text-slate-300"}`}
                      >
                        <Keyboard className="h-3.5 w-3.5" />
                        {keyboard ? "OK" : "--"}
                      </div>
                      <div 
                        draggable={!!mouse}
                        onDragStart={(e) => {
                          if (!mouse) return;
                          e.stopPropagation();
                          e.dataTransfer.setData("application/x-labvault-asset-id", mouse.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className={`flex items-center gap-1 rounded p-0.5 transition-colors ${mouse ? "text-slate-700 font-medium hover:bg-slate-100 cursor-grab" : "text-slate-300"}`}
                      >
                        <Mouse className="h-3.5 w-3.5" />
                        {mouse ? "OK" : "--"}
                      </div>
                    </div>

                    <span className="text-[11px] text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Abrir <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Hardware Alert from Telemetry */}
                {missingHardwareAlert && (
                  <div className="mt-2.5 rounded-sm bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-700 border border-rose-200 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <strong>ALERTA EN VIVO:</strong> Periférico desconectado físicamente.
                  </div>
                )}

                {/* Degraded/Maintenance Warning Note */}
                {ws.notes && (
                  <div className="mt-2.5 rounded-sm bg-amber-50 px-2.5 py-1 text-[11px] text-amber-900 border border-amber-200">
                    <strong>Nota:</strong> {ws.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Operativo (Equipo completo)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Alerta (Falla en algún periférico)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              En Mantenimiento (En reparación)
            </span>
          </div>
          <span className="text-slate-400 font-medium">
            💡 Haz clic en cualquier recuadro para ver el detalle de la computadora o transferir piezas.
          </span>
        </div>
      </div>

      {/* Selected Workstation Slide-over Drawer */}
      <WorkstationDrawer
        workstation={selectedWs}
        onClose={() => setSelectedWs(null)}
        onOpenReportTicket={(asset) => {
          setSelectedWs(null);
          onOpenReportTicket(asset);
        }}
      />
    </div>
  );
};
