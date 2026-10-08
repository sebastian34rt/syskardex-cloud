"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { X, FileText, QrCode, Download, Printer } from "lucide-react";
import { generateQRLabelsPDF, generateActaEntregaPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({ isOpen, onClose }) => {
  const { assets, labs } = useInventory();
  const { user } = useAuth();
  const [tab, setTab] = useState<"labels" | "acta">("labels");

  // Labels
  const [targetLabId, setTargetLabId] = useState<string>("all");

  // Acta
  const [actaType, setActaType] = useState<"ENTREGA" | "BAJA" | "TRANSFERENCIA">("ENTREGA");
  const [custodianName, setCustodianName] = useState("Ing. Carlos Mendoza (Custodio TIC)");
  const [receiverName, setReceiverName] = useState("Lic. Andrea Viteri (Docente Responsable)");
  const [department, setDepartment] = useState("Facultad de Sistemas y Telecomunicaciones");
  const [reason, setReason] = useState(
    "Entrega y dotación de equipamiento tecnológico para prácticas de laboratorio del periodo académico 2026."
  );

  if (!isOpen) return null;

  const handleGenerateLabels = async () => {
    const targetAssets = targetLabId === "all" ? assets : assets.filter((a) => a.labId === targetLabId);
    if (targetAssets.length === 0) {
      toast.error("No hay activos disponibles en este laboratorio.");
      return;
    }

    const labName = targetLabId === "all" ? "Todos_Los_Laboratorios" : labs.find((l) => l.id === targetLabId)?.name || "Lab";
    const tenantId = user?.uid || "DEMO"; // El tenantId para los QRs públicos
    const baseUrl = window.location.origin;

    toast.loading("Generando pliego A4 de etiquetas QR...", { id: "pdf-modal-toast" });
    try {
      await generateQRLabelsPDF(targetAssets, labName, tenantId, baseUrl);
      toast.success(`PDF descargado con ${targetAssets.length} etiquetas listas para imprimir!`, { id: "pdf-modal-toast" });
      onClose();
    } catch {
      toast.error("Error al generar las etiquetas.", { id: "pdf-modal-toast" });
    }
  };

  const handleGenerateActa = () => {
    const targetAssets = targetLabId === "all" ? assets.slice(0, 15) : assets.filter((a) => a.labId === targetLabId);
    if (targetAssets.length === 0) {
      toast.error("No hay activos para incluir en el acta.");
      return;
    }

    generateActaEntregaPDF({
      actaNumber: `ACT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      custodianName,
      receiverName,
      department,
      reason,
      type: actaType,
      assets: targetAssets,
    });

    toast.success("Acta oficial institucional descargada en formato PDF.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Generador de Documentos Oficiales en PDF
              </h3>
              <p className="text-xs text-slate-500">
                Impresión en lote de etiquetas QR recortables y actas de entrega con firmas
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

        {/* Tab switch */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setTab("labels")}
            className={`btn-press flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === "labels" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Pliego de Etiquetas QR (A4)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("acta")}
            className={`btn-press flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === "acta" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Actas Oficiales con Firmas</span>
          </button>
        </div>

        {/* Labels Content */}
        {tab === "labels" ? (
          <div className="mt-5 space-y-4 text-xs">
            <div>
              <label className="text-slate-800 font-bold block mb-1">
                Seleccionar Laboratorio
              </label>
              <select
                value={targetLabId}
                onChange={(e) => setTargetLabId(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="all">🌐 Todos los Laboratorios (Catálogo Completo)</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-slate-700">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="h-4 w-4 text-indigo-600" />
                Características del PDF generado:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Formato estándar internacional <strong>A4 (210 x 297 mm)</strong>.</li>
                <li>Cuadrícula de <strong>10 etiquetas adhesivas</strong> por página.</li>
                <li>Cada etiqueta incluye el código QR, serie, modelo y marco de corte.</li>
                <li>Listo para mandar a imprimir en papel autoadhesivo.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateLabels}
                className="btn-press flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Etiquetas en PDF</span>
              </button>
            </div>
          </div>
        ) : (
          /* Acta Form */
          <div className="mt-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Tipo de Documento</label>
                <select
                  value={actaType}
                  onChange={(e) => setActaType(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="ENTREGA">Acta de Entrega - Recepción</option>
                  <option value="BAJA">Acta de Baja Definitiva</option>
                  <option value="TRANSFERENCIA">Acta de Transferencia</option>
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Laboratorio</label>
                <select
                  value={targetLabId}
                  onChange={(e) => setTargetLabId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="all">Todos los Activos</option>
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Custodio Entrega</label>
                <input
                  type="text"
                  value={custodianName}
                  onChange={(e) => setCustodianName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1">Funcionario Receptor</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Departamento / Carrera</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Motivo / Justificación</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateActa}
                className="btn-press flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" />
                <span>Descargar Acta PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
