"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { MaintenanceTicket, TicketSeverity } from "@/types/inventory";
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Plus, 
  FileCheck2, 
  Search
} from "lucide-react";

interface MaintenanceViewProps {
  onOpenNewTicketManual: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenNewTicketManual,
}) => {
  const { tickets, resolveTicket } = useInventory();

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [resolvingTicket, setResolvingTicket] = useState<MaintenanceTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [repairCost, setRepairCost] = useState<number>(0);

  const filteredTickets = tickets.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSeverity = filterSeverity === "all" || t.severity === filterSeverity;
    return matchStatus && matchSeverity;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    resolveTicket(resolvingTicket.id, resolutionNotes, repairCost);
    setResolvingTicket(null);
    setResolutionNotes("");
    setRepairCost(0);
  };

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;
  const critical = tickets.filter((t) => t.severity === "critical" && t.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="clean-card p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tickets Abiertos</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">{openTickets}</div>
          <span className="text-[11px] text-slate-500">Pendientes de revisión</span>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">En Taller</span>
            <Wrench className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">{inProgress}</div>
          <span className="text-[11px] text-slate-500">En reparación activa</span>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Fallas Críticas</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 font-mono">{critical}</div>
          <span className="text-[11px] text-slate-500">Impiden usar la máquina</span>
        </div>

        <div className="clean-card p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Resueltos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono">{resolved}</div>
          <span className="text-[11px] text-slate-500">Reparaciones con éxito</span>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="clean-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">Todos los Estados</option>
            <option value="open">Abiertos</option>
            <option value="in_progress">En Taller</option>
            <option value="resolved">Resueltos</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">Todas las Severidades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenNewTicketManual}
          className="btn-press flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          <span>Abrir Incidencia</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="clean-card p-12 text-center text-slate-500">
            No hay incidencias registradas con los filtros seleccionados.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isResolved = ticket.status === "resolved";
            const isCritical = ticket.severity === "critical";

            return (
              <div
                key={ticket.id}
                className={`clean-card p-5 transition-all ${
                  isResolved
                    ? "bg-slate-50/70 border-slate-200"
                    : isCritical
                    ? "bg-rose-50/40 border-rose-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          ticket.severity === "critical"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : ticket.severity === "high"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : ticket.severity === "medium"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {ticket.severity}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          ticket.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : ticket.status === "in_progress"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ticket.status === "resolved"
                          ? "Resuelto"
                          : ticket.status === "in_progress"
                          ? "En Taller"
                          : "Pendiente"}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900">{ticket.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>
                        <strong className="text-slate-700">Activo:</strong> {ticket.assetName} [{ticket.assetTag}]
                      </span>
                      {ticket.workstationCode && (
                        <span>
                          <strong className="text-slate-700">Puesto:</strong> {ticket.workstationCode}
                        </span>
                      )}
                      <span>
                        <strong className="text-slate-700">Ubicación:</strong> {ticket.labName}
                      </span>
                      <span>
                        <strong className="text-slate-700">Reportó:</strong> {ticket.reportedBy} ({ticket.createdAt})
                      </span>
                    </div>

                    {/* Resolution Note */}
                    {ticket.resolutionNotes && (
                      <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-200 flex items-start gap-2">
                        <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Diagnóstico & Solución Técnica ({ticket.resolvedAt}):</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">{ticket.resolutionNotes}</p>
                          {ticket.cost ? (
                            <span className="mt-1 inline-block text-[11px] font-mono text-emerald-700 font-bold">
                              Costo repuestos/servicio: ${ticket.cost.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => setResolvingTicket(ticket)}
                      className="btn-press shrink-0 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Diagnosticar y Resolver</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-indigo-600" />
              Cerrar y Resolver Incidencia
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ticket: <strong className="text-slate-900">{resolvingTicket.ticketNumber}</strong> • {resolvingTicket.assetName}
            </p>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Diagnóstico y Solución Aplicada *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe qué repuesto se reemplazó o qué pruebas de funcionamiento se realizaron..."
                  className="w-full rounded-xl bg-slate-50 p-3 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Costo de Repuestos / Materiales ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={repairCost}
                  onChange={(e) => setRepairCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono focus:bg-white"
                />
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900 border border-indigo-200">
                Al resolver esta incidencia, el activo <strong>{resolvingTicket.assetTag}</strong> volverá automáticamente al estado <strong>OPERATIVO</strong> y se registrará en el historial inmutable de auditoría.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-press rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Guardar Reparación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
