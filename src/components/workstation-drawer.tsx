"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Workstation, Asset, WorkstationStatus } from "@/types/inventory";
import { useInventory } from "@/lib/inventory-context";
import { 
  X, 
  Cpu, 
  Monitor, 
  Keyboard, 
  Mouse, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Wrench, 
  QrCode, 
  Layers, 
  Calendar
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface WorkstationDrawerProps {
  workstation: Workstation | null;
  onClose: () => void;
  onOpenReportTicket: (asset: Asset) => void;
}

export const WorkstationDrawer: React.FC<WorkstationDrawerProps> = ({
  workstation,
  onClose,
  onOpenReportTicket,
}) => {
  const { 
    getWorkstationAssets, 
    updateWorkstationStatus, 
    workstations, 
    reassignAsset 
  } = useInventory();

  const [reassigningAssetId, setReassigningAssetId] = useState<string | null>(null);
  const [targetWsId, setTargetWsId] = useState<string>("");
  const [selectedAssetQR, setSelectedAssetQR] = useState<Asset | null>(null);

  if (!workstation) return null;

  const assets = getWorkstationAssets(workstation.id);
  const cpu = assets.find((a) => a.category === "cpu");
  const monitor = assets.find((a) => a.category === "monitor");
  const keyboard = assets.find((a) => a.category === "keyboard");
  const mouse = assets.find((a) => a.category === "mouse");
  const otherAssets = assets.filter(
    (a) => !["cpu", "monitor", "keyboard", "mouse"].includes(a.category)
  );

  const handleStatusChange = (newStatus: WorkstationStatus) => {
    updateWorkstationStatus(workstation.id, newStatus);
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningAssetId) return;
    const dest = targetWsId === "storage" ? null : targetWsId;
    reassignAsset(reassigningAssetId, dest);
    setReassigningAssetId(null);
    setTargetWsId("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="absolute inset-y-0 right-0 w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700 border border-indigo-200">
                    {workstation.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Fila {workstation.row + 1} • Columna {workstation.col + 1}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900 tracking-tight">
                  {workstation.name}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Última revisión técnica: {workstation.lastAuditedAt}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-press rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Health & Status Controller */}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block mb-2">
                Estado Actual del Puesto
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("operational")}
                  className={`btn-press flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    workstation.status === "operational"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Operativo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("degraded")}
                  className={`btn-press flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    workstation.status === "degraded"
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Con Falla</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("maintenance")}
                  className={`btn-press flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    workstation.status === "maintenance"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  <span>En Taller</span>
                </button>
              </div>

              {workstation.notes && (
                <div className="mt-3 rounded-xl bg-amber-100/70 p-2.5 text-xs text-amber-900 border border-amber-200">
                  <span className="font-bold">Observación:</span> {workstation.notes}
                </div>
              )}
            </div>

            {/* Hardware Inventory in this Workstation */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  Hardware Asignado ({assets.length} componentes)
                </h3>
              </div>

              <div className="space-y-3">
                {/* CPU Card */}
                {cpu ? (
                  <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Cpu className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{cpu.name}</span>
                            <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                              {cpu.assetTag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cpu.brand} {cpu.model} • Serie: {cpu.serialNumber}
                          </p>
                          {cpu.specs.processor && (
                            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5">{cpu.specs.processor}</span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5">{cpu.specs.ram}</span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5">{cpu.specs.storage}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        cpu.status === "operational" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {cpu.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-3 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedAssetQR(cpu)}
                        className="btn-press text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <QrCode className="h-3.5 w-3.5 text-indigo-600" /> Ver QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setReassigningAssetId(cpu.id)}
                        className="btn-press text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Transferir
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReportTicket(cpu)}
                        className="btn-press text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Wrench className="h-3.5 w-3.5" /> Reportar Daño
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-rose-300 bg-rose-50 p-4 text-center">
                    <p className="text-xs font-bold text-rose-800">Falta Unidad Central (CPU no asignada)</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Asigna una torre o CPU a este puesto para habilitarlo.</p>
                  </div>
                )}

                {/* Monitor Card */}
                {monitor ? (
                  <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                        <Monitor className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{monitor.name}</span>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">[{monitor.assetTag}]</span>
                        </div>
                        <p className="text-[11px] text-slate-500">S/N: {monitor.serialNumber} • {monitor.specs.resolution || ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setReassigningAssetId(monitor.id)}
                        className="btn-press text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100"
                        title="Transferir monitor"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReportTicket(monitor)}
                        className="btn-press text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50"
                        title="Reportar daño"
                      >
                        <Wrench className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-800 font-medium">
                    Sin Monitor vinculado
                  </div>
                )}

                {/* Peripherals Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Keyboard */}
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                          {keyboard?.name || "Sin Teclado"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {keyboard?.assetTag || "Pendiente"}
                        </p>
                      </div>
                    </div>
                    {keyboard && (
                      <button
                        type="button"
                        onClick={() => onOpenReportTicket(keyboard)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Reportar daño"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Mouse */}
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mouse className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                          {mouse?.name || "Sin Mouse"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {mouse?.assetTag || "Pendiente"}
                        </p>
                      </div>
                    </div>
                    {mouse && (
                      <button
                        type="button"
                        onClick={() => onOpenReportTicket(mouse)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Reportar daño"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Other lab instruments */}
                {otherAssets.map((asset) => (
                  <div key={asset.id} className="rounded-xl bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{asset.name}</span>
                      <p className="text-[10px] text-slate-500">Tag: {asset.assetTag} • S/N: {asset.serialNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenReportTicket(asset)}
                      className="btn-press text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Wrench className="h-3.5 w-3.5" /> Reportar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reassign Asset Box */}
            {reassigningAssetId && (
              <div className="mt-5 rounded-xl bg-indigo-50 p-4 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                    Reasignar Pieza a Otro Puesto
                  </h4>
                  <button
                    type="button"
                    onClick={() => setReassigningAssetId(null)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                  >
                    Cancelar
                  </button>
                </div>
                <form onSubmit={handleReassignSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Destino de la transferencia:
                    </label>
                    <select
                      value={targetWsId}
                      onChange={(e) => setTargetWsId(e.target.value)}
                      required
                      className="w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-800 border border-slate-300 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="">Selecciona estación o bodega...</option>
                      <option value="storage">📦 Bodega de Respaldo / Sin Puesto</option>
                      {workstations
                        .filter((w) => w.id !== workstation.id)
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn-press w-full rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Confirmar Cambio de Ubicación
                  </button>
                </form>
              </div>
            )}

            {/* QR Preview Box */}
            {selectedAssetQR && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <QRCodeSVG value={selectedAssetQR.qrPayload} size={130} />
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 mt-2">
                  {selectedAssetQR.assetTag}
                </span>
                <p className="text-xs text-slate-500">{selectedAssetQR.name}</p>
                <button
                  type="button"
                  onClick={() => setSelectedAssetQR(null)}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Cerrar QR
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-5 border-t border-slate-200 mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">ID: {workstation.id}</span>
            <button
              type="button"
              onClick={onClose}
              className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
            >
              Cerrar Panel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
