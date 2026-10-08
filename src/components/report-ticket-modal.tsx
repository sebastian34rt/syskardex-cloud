"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Asset, TicketSeverity } from "@/types/inventory";
import { X, Wrench } from "lucide-react";

interface ReportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAsset: Asset | null;
}

export const ReportTicketModal: React.FC<ReportTicketModalProps> = ({
  isOpen,
  onClose,
  preselectedAsset,
}) => {
  const { assets, createTicket, workstations } = useInventory();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    preselectedAsset?.id || (assets[0]?.id ?? "")
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<TicketSeverity>("medium");
  const [reportedBy, setReportedBy] = useState("Estudiante / Docente");

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === (preselectedAsset?.id || selectedAssetId));
  const currentWorkstation = currentAsset?.workstationId
    ? workstations.find((w) => w.id === currentAsset.workstationId)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;

    createTicket({
      assetId: currentAsset.id,
      title: title.trim(),
      description: description.trim(),
      severity,
      reportedBy: reportedBy.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Reportar Falla Técnica
              </h3>
              <p className="text-xs text-slate-500">
                Abre un ticket para que el personal de soporte revise el equipo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-press rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Target Asset */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">
              Equipo o componente averiado *
            </label>
            {preselectedAsset ? (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-700">
                    {preselectedAsset.assetTag}
                  </span>
                  <p className="font-bold text-slate-900">{preselectedAsset.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Serie: {preselectedAsset.serialNumber} {currentWorkstation ? `• Puesto: ${currentWorkstation.code}` : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {preselectedAsset.category}
                </span>
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetTag}] {a.name} ({a.brand}) - S/N: {a.serialNumber}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">
              Resumen del problema *
            </label>
            <input
              type="text"
              required
              placeholder="ej: Monitor parpadea / Teclado no escribe / CPU no enciende"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">
              Nivel de Urgencia / Severidad *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["low", "medium", "high", "critical"] as TicketSeverity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`btn-press rounded-xl py-2 px-2 text-center text-xs font-bold capitalize border transition-all ${
                    severity === sev
                      ? sev === "critical"
                        ? "bg-rose-600 text-white border-rose-600"
                        : sev === "high"
                        ? "bg-orange-600 text-white border-orange-600"
                        : sev === "medium"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-slate-700 text-white border-slate-700"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {sev === "low" ? "Baja" : sev === "medium" ? "Media" : sev === "high" ? "Alta" : "Crítica"}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">
              Detalle de lo que ocurre *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explica qué estaba haciendo el usuario cuando ocurrió la falla..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-50 p-3 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {/* Reporter */}
          <div>
            <label className="text-slate-800 font-bold block mb-1">
              Nombre de quien reporta *
            </label>
            <input
              type="text"
              required
              placeholder="ej: Juan Pérez (Estudiante) o Ing. Carlos Mendoza"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-press rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Registrar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
