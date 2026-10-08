"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { 
  ShieldCheck, 
  History, 
  ArrowRightLeft, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  User, 
  Download,
  Search
} from "lucide-react";
import { toast } from "sonner";

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useInventory();
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchAction = filterAction === "all" || log.action === filterAction;
    const matchSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.assetTag && log.assetTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.workstationCode && log.workstationCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchAction && matchSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ASSET_CREATED":
        return { label: "Alta Activo", icon: PlusCircle, color: "text-emerald-800 bg-emerald-100 border-emerald-200" };
      case "STATUS_CHANGED":
        return { label: "Cambio Estado", icon: AlertTriangle, color: "text-amber-800 bg-amber-100 border-amber-200" };
      case "WORKSTATION_REASSIGNED":
        return { label: "Transferencia Puesto", icon: ArrowRightLeft, color: "text-indigo-800 bg-indigo-100 border-indigo-200" };
      case "TICKET_CREATED":
        return { label: "Incidencia Abierta", icon: Wrench, color: "text-orange-800 bg-orange-100 border-orange-200" };
      case "TICKET_RESOLVED":
        return { label: "Incidencia Resuelta", icon: CheckCircle2, color: "text-teal-800 bg-teal-100 border-teal-200" };
      case "ASSET_DECOMMISSIONED":
        return { label: "Baja Definitiva", icon: Trash2, color: "text-rose-800 bg-rose-100 border-rose-200" };
      default:
        return { label: action, icon: History, color: "text-slate-800 bg-slate-100 border-slate-200" };
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Fecha/Hora", "Acción", "Activo", "Puesto", "Responsable", "Rol", "Detalle"];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      l.assetTag || "",
      l.workstationCode || "",
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Auditoria_LabVault_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Historial de auditoría exportado en CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="clean-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Trazabilidad & Registro Histórico de Auditoría
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historial inmutable de transferencias físicas de piezas, cambios de estado y resoluciones técnicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en historial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-200 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">Todas las Acciones</option>
            <option value="ASSET_CREATED">Alta de Activos</option>
            <option value="WORKSTATION_REASSIGNED">Transferencias</option>
            <option value="STATUS_CHANGED">Cambios de Estado</option>
            <option value="TICKET_CREATED">Tickets Creados</option>
            <option value="TICKET_RESOLVED">Tickets Resueltos</option>
            <option value="ASSET_DECOMMISSIONED">Bajas</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-press flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="clean-card p-6">
        <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-6">
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-500">No hay registros con los filtros seleccionados.</p>
          ) : (
            filteredLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[30px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-indigo-600 shadow-xs" />

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 transition-all hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${badge.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {badge.label}
                        </span>

                        {log.assetTag && (
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {log.assetTag}
                          </span>
                        )}

                        {log.workstationCode && (
                          <span className="text-xs font-bold text-indigo-700">
                            Puesto: {log.workstationCode}
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        {log.timestamp}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium">
                      {log.details}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        <strong className="text-slate-700">{log.userName}</strong> • {log.userRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
