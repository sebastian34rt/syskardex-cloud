"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Asset } from "@/types/inventory";
import { 
  X, 
  QrCode, 
  Wrench, 
  CheckCircle2, 
  Sparkles
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportTicket: (asset: Asset) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenReportTicket,
}) => {
  const { assets, getAssetByTag, workstations, labs, changeAssetStatus } = useInventory();
  const [scannedTag, setScannedTag] = useState("");
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null);

  if (!isOpen) return null;

  const handleSearchTag = (tagToSearch?: string) => {
    const query = (tagToSearch || scannedTag).trim();
    if (!query) return;

    const match = getAssetByTag(query);
    if (match) {
      setFoundAsset(match);
      toast.success(`Activo identificado: ${match.assetTag}`);
    } else {
      setFoundAsset(null);
      toast.error(`No se encontró ningún activo con el tag "${query}"`);
    }
  };

  const getWorkstation = (wsId: string | null) => {
    if (!wsId) return "Bodega / Sin puesto fijo";
    const ws = workstations.find((w) => w.id === wsId);
    return ws ? `${ws.code} - ${ws.name}` : "Asignado";
  };

  const getLab = (labId: string) => {
    const l = labs.find((item) => item.id === labId);
    return l ? l.name : "Laboratorio";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Simulador de Escaneo QR Móvil
              </h3>
              <p className="text-xs text-slate-500">
                Consulta la ficha del equipo o reporta una falla rápidamente
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

        {/* Input Bar */}
        <div className="mt-5 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Escribe o pega el código (ej: LV-2026-001)"
                value={scannedTag}
                onChange={(e) => setScannedTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchTag()}
                className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 font-mono text-xs text-slate-900 placeholder-slate-400 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white uppercase font-bold"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearchTag()}
              className="btn-press rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Consultar
            </button>
          </div>

          {/* Quick Demo Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Prueba rápida:</span>
            {["LV-2026-001", "LV-2026-011", "LV-2026-021", "LV-2026-101", "LV-2026-402"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setScannedTag(tag);
                  handleSearchTag(tag);
                }}
                className="btn-press rounded-md bg-slate-100 px-2 py-0.5 font-mono text-indigo-700 hover:bg-indigo-50 border border-slate-200 font-semibold"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Found Asset Card */}
        {foundAsset ? (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 border border-slate-200 shadow-sm animate-fade-in-up">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded border border-indigo-200">
                  {foundAsset.assetTag}
                </span>
                <h4 className="mt-1 text-base font-bold text-slate-900">{foundAsset.name}</h4>
                <p className="text-xs text-slate-500">
                  {foundAsset.brand} {foundAsset.model} • S/N: {foundAsset.serialNumber}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  foundAsset.status === "operational"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : foundAsset.status === "in_maintenance"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {foundAsset.status}
              </span>
            </div>

            {/* Location & Specs */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Ubicación Física</span>
                <span className="font-bold text-slate-800">{getLab(foundAsset.labId)}</span>
                <span className="text-[11px] text-indigo-600 block mt-0.5 font-semibold">
                  {getWorkstation(foundAsset.workstationId)}
                </span>
              </div>

              <div className="rounded-xl bg-white p-2.5 border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Garantía & Compra</span>
                <span className="text-slate-800 font-semibold">{foundAsset.supplier}</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5 font-bold">
                  Vence: {foundAsset.warrantyExpires}
                </span>
              </div>
            </div>

            {/* Specs */}
            {foundAsset.specs && Object.keys(foundAsset.specs).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                {foundAsset.specs.processor && (
                  <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">{foundAsset.specs.processor}</span>
                )}
                {foundAsset.specs.ram && (
                  <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">{foundAsset.specs.ram}</span>
                )}
                {foundAsset.specs.storage && (
                  <span className="rounded-md bg-white px-2 py-0.5 border border-slate-200">{foundAsset.specs.storage}</span>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReportTicket(foundAsset);
                }}
                className="btn-press flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 px-3 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                <Wrench className="h-4 w-4" />
                <span>Reportar Falla</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newSt = foundAsset.status === "operational" ? "in_maintenance" : "operational";
                  changeAssetStatus(foundAsset.id, newSt, "Cambio rápido vía escaneo QR");
                  setFoundAsset({ ...foundAsset, status: newSt });
                }}
                className="btn-press flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Cambiar Estado</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 mb-2 shadow-xs border border-slate-200">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">Esperando código QR</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Escribe un código o haz clic en cualquiera de las etiquetas de prueba sugeridas.
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
