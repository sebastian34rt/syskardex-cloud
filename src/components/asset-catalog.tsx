"use client";

import React, { useState, useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Asset } from "@/types/inventory";
import { 
  Search, 
  QrCode, 
  CheckSquare, 
  Square, 
  Wrench, 
  FileText, 
  Trash2, 
  Download,
  Info
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generateQRLabelsPDF, generateActaEntregaPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";

interface AssetCatalogProps {
  onOpenReportTicket: (asset: Asset) => void;
  onOpenNewAsset: () => void;
}

export const AssetCatalog: React.FC<AssetCatalogProps> = ({
  onOpenReportTicket,
  onOpenNewAsset,
}) => {
  const { assets, labs, workstations, deleteAsset } = useInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>("all");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [activeAssetModal, setActiveAssetModal] = useState<Asset | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || asset.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || asset.status === selectedStatus;

      const matchesLab =
        selectedLabFilter === "all" || asset.labId === selectedLabFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesLab;
    });
  }, [assets, searchQuery, selectedCategory, selectedStatus, selectedLabFilter]);

  const toggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchPrintQR = async () => {
    const targetAssets =
      selectedAssetIds.length > 0
        ? assets.filter((a) => selectedAssetIds.includes(a.id))
        : filteredAssets;

    if (targetAssets.length === 0) {
      toast.error("No hay activos seleccionados para imprimir");
      return;
    }

    setIsGeneratingPDF(true);
    toast.loading("Generando pliego de etiquetas QR en PDF...", { id: "pdf-toast" });
    try {
      await generateQRLabelsPDF(targetAssets, "Lote_Institucional");
      toast.success(`Pliego con ${targetAssets.length} etiquetas generado con éxito!`, { id: "pdf-toast" });
    } catch {
      toast.error("Error al generar el PDF de etiquetas", { id: "pdf-toast" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleBatchGenerateAct = (type: "ENTREGA" | "BAJA") => {
    const targetAssets =
      selectedAssetIds.length > 0
        ? assets.filter((a) => selectedAssetIds.includes(a.id))
        : filteredAssets;

    if (targetAssets.length === 0) {
      toast.error("Selecciona al menos un activo para generar el acta");
      return;
    }

    generateActaEntregaPDF({
      actaNumber: `ACT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      custodianName: "Ing. Carlos Mendoza (Custodio TIC)",
      receiverName: "Lic. Dirección de Carrera / Docente",
      department: "Laboratorios de Informática y Electrónica",
      reason:
        type === "BAJA"
          ? "Baja técnica definitiva de componentes por obsolescencia o daño no reparable."
          : "Entrega formal de inventario para el equipamiento de puestos de trabajo.",
      type,
      assets: targetAssets,
    });

    toast.success(`Acta oficial de ${type} generada correctamente en PDF.`);
  };

  const getWorkstationName = (wsId: string | null) => {
    if (!wsId) return "Bodega / Sin Puesto";
    const ws = workstations.find((w) => w.id === wsId);
    return ws ? `${ws.code} (${ws.name})` : "Asignado";
  };

  const getLabName = (labId: string) => {
    const lab = labs.find((l) => l.id === labId);
    return lab ? lab.name : "Laboratorio";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="clean-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Código de Activo (LV-...), Serie (S/N), Marca o Modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Todas las Categorías</option>
              <option value="cpu">CPUs / Computadoras</option>
              <option value="monitor">Monitores</option>
              <option value="keyboard">Teclados</option>
              <option value="mouse">Mouses</option>
              <option value="networking">Redes / Switches</option>
              <option value="ups">UPS / Energía</option>
              <option value="projector">Proyectores</option>
              <option value="lab_instrument">Instrumentos Lab</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Todos los Estados</option>
              <option value="operational">Operativo</option>
              <option value="in_maintenance">En Mantenimiento</option>
              <option value="in_storage">En Bodega</option>
              <option value="decommissioned">Dado de Baja</option>
            </select>

            <select
              value={selectedLabFilter}
              onChange={(e) => setSelectedLabFilter(e.target.value)}
              className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Todos los Laboratorios</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="btn-press flex items-center gap-1.5 font-semibold text-slate-700 hover:text-slate-900"
            >
              {selectedAssetIds.length > 0 && selectedAssetIds.length === filteredAssets.length ? (
                <CheckSquare className="h-4 w-4 text-indigo-600" />
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
              <span>
                {selectedAssetIds.length > 0
                  ? `${selectedAssetIds.length} seleccionados`
                  : "Seleccionar todos"}
              </span>
            </button>
            <span className="text-slate-300">|</span>
            <span>Mostrando {filteredAssets.length} de {assets.length} activos</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPDF}
              onClick={handleBatchPrintQR}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Imprimir Etiquetas QR ({selectedAssetIds.length || filteredAssets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchGenerateAct("ENTREGA")}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Acta Entrega PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchGenerateAct("BAJA")}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Acta de Baja PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="clean-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10 text-center">#</th>
                <th className="py-3 px-4">Código / Tag</th>
                <th className="py-3 px-4">Descripción del Activo</th>
                <th className="py-3 px-4">Número de Serie</th>
                <th className="py-3 px-4">Ubicación / Puesto</th>
                <th className="py-3 px-4">Valor Adquisición</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No se encontraron activos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/60" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(asset.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 border border-slate-200">
                          {asset.assetTag}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{asset.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {asset.brand} {asset.model} • <span className="uppercase text-[10px] text-indigo-700 font-semibold">{asset.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {asset.serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{getWorkstationName(asset.workstationId)}</div>
                        <div className="text-[11px] text-slate-500">{getLabName(asset.labId)}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        ${asset.purchaseCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            asset.status === "operational"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : asset.status === "in_maintenance"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : asset.status === "in_storage"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {asset.status === "operational"
                            ? "Operativo"
                            : asset.status === "in_maintenance"
                            ? "En Taller"
                            : asset.status === "in_storage"
                            ? "Bodega"
                            : "De Baja"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveAssetModal(asset)}
                            title="Ver Ficha Técnica y QR"
                            className="btn-press rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <QrCode className="h-4 w-4 text-indigo-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReportTicket(asset)}
                            title="Reportar Daño / Abrir Ticket"
                            className="btn-press rounded-lg p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Deseas dar de baja o eliminar el activo ${asset.assetTag}?`)) {
                                deleteAsset(asset.id);
                              }
                            }}
                            title="Eliminar Activo"
                            className="btn-press rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Technical Sheet / Hoja de Vida Modal */}
      {activeAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {activeAssetModal.assetTag}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {activeAssetModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeAssetModal.brand} {activeAssetModal.model}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="btn-press rounded-lg p-1 text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4 border border-slate-200 text-center">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                  <QRCodeSVG value={activeAssetModal.qrPayload} size={130} />
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 mt-2">
                  {activeAssetModal.assetTag}
                </span>
                <p className="text-[11px] text-slate-500">Escaneable desde celular</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Número de Serie</span>
                  <span className="font-mono font-bold text-slate-800">{activeAssetModal.serialNumber}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Proveedor & Compra</span>
                  <span className="text-slate-800 font-semibold">{activeAssetModal.supplier}</span>
                  <span className="text-[11px] text-slate-500 block">Fecha: {activeAssetModal.purchaseDate}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Garantía</span>
                  <span className="text-emerald-700 font-bold">{activeAssetModal.warrantyExpires}</span>
                </div>
              </div>
            </div>

            {/* Technical Specs Details */}
            {activeAssetModal.specs && Object.keys(activeAssetModal.specs).length > 0 && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">
                  Especificaciones Técnicas
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px]">
                  {activeAssetModal.specs.processor && (
                    <div><span className="text-slate-400 font-medium">CPU:</span> {activeAssetModal.specs.processor}</div>
                  )}
                  {activeAssetModal.specs.ram && (
                    <div><span className="text-slate-400 font-medium">RAM:</span> {activeAssetModal.specs.ram}</div>
                  )}
                  {activeAssetModal.specs.storage && (
                    <div><span className="text-slate-400 font-medium">Disco:</span> {activeAssetModal.specs.storage}</div>
                  )}
                  {activeAssetModal.specs.gpu && (
                    <div><span className="text-slate-400 font-medium">GPU:</span> {activeAssetModal.specs.gpu}</div>
                  )}
                  {activeAssetModal.specs.resolution && (
                    <div><span className="text-slate-400 font-medium">Pantalla:</span> {activeAssetModal.specs.resolution}</div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => {
                  generateQRLabelsPDF([activeAssetModal], "Individual");
                }}
                className="btn-press flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Download className="h-3.5 w-3.5" /> Descargar Etiqueta PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveAssetModal(null)}
                className="btn-press rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
