"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Server, AlertTriangle, CheckCircle } from "lucide-react";
import { Asset, MaintenanceTicket } from "@/types/inventory";

export default function PublicReportPage({ params }: { params: { tenantId: string, assetId: string } }) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [reportedBy, setReportedBy] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const snap = await getDoc(doc(db, "institutions", params.tenantId));
        if (snap.exists()) {
          const data = snap.data();
          const found = data.assets?.find((a: Asset) => a.id === params.assetId);
          if (found) setAsset(found);
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setLoading(true);

    try {
      const docRef = doc(db, "institutions", params.tenantId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentTickets: MaintenanceTicket[] = data.tickets || [];
        
        const newTicket: MaintenanceTicket = {
          id: `tkt-${Date.now()}`,
          ticketNumber: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
          assetId: asset.id,
          assetTag: asset.assetTag || "S/N",
          assetName: asset.name,
          workstationId: asset.workstationId,
          labId: asset.labId || "unknown",
          labName: "Laboratorio", // We don't have labName easily here, mock it
          title: `Reporte Público: ${asset.name}`,
          description,
          status: "open",
          severity: "medium",
          reportedBy: reportedBy || "Anónimo",
          assignedTechnician: null,
          createdAt: new Date().toISOString(),
          resolvedAt: null,
          resolutionNotes: null,
        };

        await updateDoc(docRef, {
          tickets: [...currentTickets, newTicket]
        });
        
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting ticket", error);
      alert("Hubo un error al enviar el reporte. Por favor, avisa a soporte.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center animate-pulse">Cargando...</div>;
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 text-center">
        <div>
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-zinc-900">Equipo no encontrado</h1>
          <p className="text-zinc-500 text-sm mt-2">El código QR parece ser inválido o el equipo fue eliminado.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="h-16 w-16 text-emerald-500 mb-6" />
        <h1 className="text-2xl font-bold text-zinc-900">¡Reporte Enviado!</h1>
        <p className="text-zinc-500 mt-2 max-w-sm">
          El equipo de soporte ha sido notificado y revisará el equipo <strong>{asset.name}</strong> pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-6 md:py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 px-6 py-8 text-center">
          <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Server className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">Soporte Técnico</h1>
          <p className="text-zinc-400 text-xs mt-1">Reporte rápido de fallas</p>
        </div>

        {/* Asset Info */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Equipo Identificado</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-zinc-900">{asset.name}</div>
              <div className="text-xs text-zinc-500 font-mono mt-0.5">{asset.assetTag}</div>
            </div>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-sm border border-indigo-100">
              {asset.category}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tu Nombre (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Prof. García o Alumno"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">¿Qué está fallando?</label>
              <textarea
                required
                rows={4}
                placeholder="Describe el problema. Ej: El mouse no funciona, la pantalla parpadea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || description.trim() === ""}
              className="w-full mt-4 bg-indigo-600 text-white rounded-md px-4 py-3 text-sm font-bold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Enviando..." : "Enviar Reporte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
