"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Shield, Building2, Cpu, Activity, LogOut, AlertTriangle } from "lucide-react";

export default function SuperAdminPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no está logueado o no es el superadmin (correo oficial del dueño), patearlo
    // NOTA: Reemplazar por tu correo real en producción
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Lista de correos autorizados
    const adminEmails = ["admin@colegio.edu", "tu_correo@gmail.com"]; 
    if (!adminEmails.includes(user.email || "")) {
      router.push("/");
      return;
    }

    const fetchTenants = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "institutions"));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setTenants(data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [user, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando SuperAdmin...</div>;
  }

  // Cálculos globales
  const totalSchools = tenants.length;
  const totalAssets = tenants.reduce((acc, tenant) => acc + (tenant.assets?.length || 0), 0);
  const totalWorkstations = tenants.reduce((acc, tenant) => acc + (tenant.workstations?.length || 0), 0);
  const activeTickets = tenants.reduce((acc, tenant) => {
    return acc + (tenant.tickets?.filter((t: any) => t.status === "open").length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center p-1">
            <img src="/logo.png" alt="SysKardex" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SysKardex <span className="text-indigo-400">HQ</span></h1>
            <p className="text-xs text-zinc-400">Panel de Control Global SaaS</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
            {user?.email}
          </span>
          <button 
            onClick={() => { signOut(); router.push("/login"); }}
            className="flex items-center gap-2 text-xs font-semibold bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-md hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Global KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Building2 className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Escuelas (Tenants)</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalSchools}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Cpu className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Activos Totales</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{totalAssets}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <Activity className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Estaciones de Trabajo</span>
            </div>
            <div className="text-3xl font-bold text-indigo-400">{totalWorkstations}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> <span className="text-xs font-semibold uppercase">Tickets Globales</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{activeTickets}</div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white">Directorio de Instituciones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950/50 text-xs uppercase font-semibold text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Tenant ID (Firebase UID)</th>
                  <th className="px-6 py-3">Activos</th>
                  <th className="px-6 py-3">PCs</th>
                  <th className="px-6 py-3">Tickets (Abiertos)</th>
                  <th className="px-6 py-3">Última Sincronización</th>
                  <th className="px-6 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{t.id}</td>
                    <td className="px-6 py-4">{t.assets?.length || 0}</td>
                    <td className="px-6 py-4">{t.workstations?.length || 0}</td>
                    <td className="px-6 py-4 text-amber-400">
                      {t.tickets?.filter((x: any) => x.status === "open").length || 0}
                    </td>
                    <td className="px-6 py-4">
                      {t.lastUpdated ? new Date(t.lastUpdated).toLocaleString() : "Nunca"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-sm border border-emerald-500/20">
                        ACTIVO
                      </span>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No hay escuelas registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
