"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { AssetCategory } from "@/types/inventory";
import { X, Plus } from "lucide-react";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose }) => {
  const { labs, workstations, addAsset, assets } = useInventory();

  const nextNum = assets.length + 1;
  const initialTag = `LV-2026-${String(nextNum).padStart(3, "0")}`;

  const [name, setName] = useState("");
  const [assetTag, setAssetTag] = useState(initialTag);
  const [category, setCategory] = useState<AssetCategory>("cpu");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [labId, setLabId] = useState(labs[0]?.id || "lab-1");
  const [workstationId, setWorkstationId] = useState<string>("");
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [warrantyExpires, setWarrantyExpires] = useState("2028-12-31");
  
  // Specs
  const [processor, setProcessor] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [gpu, setGpu] = useState("");
  const [resolution, setResolution] = useState("");

  if (!isOpen) return null;

  const currentLabWorkstations = workstations.filter((w) => w.labId === labId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAsset({
      name,
      assetTag: assetTag.trim().toUpperCase(),
      category,
      brand,
      model,
      serialNumber: serialNumber.trim().toUpperCase(),
      status: "operational",
      labId,
      workstationId: workstationId ? workstationId : null,
      specs: {
        processor: processor || undefined,
        ram: ram || undefined,
        storage: storage || undefined,
        gpu: gpu || undefined,
        resolution: resolution || undefined,
      },
      purchaseDate,
      warrantyExpires,
      purchaseCost,
      supplier: supplier || "Distribuidor Oficial Institucional",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Alta de Nuevo Activo Tecnológico
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registra hardware en el inventario con generación inmediata de código QR
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Tag & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Código de Activo (Tag) *</label>
              <input
                type="text"
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 font-mono font-bold text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white uppercase"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Categoría de Hardware *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full rounded-xl bg-slate-50 p-2.5 font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="cpu">CPU / Computadora</option>
                <option value="monitor">Monitor / Pantalla</option>
                <option value="keyboard">Teclado</option>
                <option value="mouse">Mouse</option>
                <option value="networking">Switch / Red</option>
                <option value="ups">UPS / Energía</option>
                <option value="projector">Proyector</option>
                <option value="lab_instrument">Instrumento de Laboratorio</option>
              </select>
            </div>
          </div>

          {/* Name & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Nombre Descriptivo *</label>
              <input
                type="text"
                required
                placeholder="ej: Dell OptiPlex 7010 Micro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Número de Serie (S/N) *</label>
              <input
                type="text"
                required
                placeholder="ej: SN-DELL-9812-CN"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 font-mono text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white uppercase"
              />
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Marca *</label>
              <input
                type="text"
                required
                placeholder="ej: Dell, HP, Logitech, Asus"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Modelo Exacto *</label>
              <input
                type="text"
                required
                placeholder="ej: OptiPlex 7010 Micro"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Workstation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Laboratorio Asignado *</label>
              <select
                value={labId}
                onChange={(e) => {
                  setLabId(e.target.value);
                  setWorkstationId("");
                }}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Puesto de Trabajo</label>
              <select
                value={workstationId}
                onChange={(e) => setWorkstationId(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="">📦 Bodega de Respaldo / Sin Puesto Fijo</option>
                {currentLabWorkstations.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Costo Adquisición ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-slate-50 p-2.5 font-mono text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Fecha de Compra</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Vencimiento Garantía</label>
              <input
                type="date"
                value={warrantyExpires}
                onChange={(e) => setWarrantyExpires(e.target.value)}
                className="w-full rounded-xl bg-slate-50 p-2.5 text-slate-900 border border-slate-300 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Technical Specs Accordion */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
              Especificaciones de Hardware (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Procesador (ej: Intel Core i7-13700)"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                className="rounded-xl bg-white p-2 text-slate-800 border border-slate-300"
              />
              <input
                type="text"
                placeholder="Memoria RAM (ej: 32 GB DDR5)"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="rounded-xl bg-white p-2 text-slate-800 border border-slate-300"
              />
              <input
                type="text"
                placeholder="Almacenamiento (ej: 1 TB NVMe SSD)"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="rounded-xl bg-white p-2 text-slate-800 border border-slate-300"
              />
              <input
                type="text"
                placeholder="GPU o Resolución"
                value={gpu || resolution}
                onChange={(e) => {
                  setGpu(e.target.value);
                  setResolution(e.target.value);
                }}
                className="rounded-xl bg-white p-2 text-slate-800 border border-slate-300"
              />
            </div>
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
              className="btn-press rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Guardar y Generar Código QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
