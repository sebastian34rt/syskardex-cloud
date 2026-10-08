"use client";

import React, { useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";
import { Activity, ShieldAlert, DollarSign } from "lucide-react";

export const AnalyticsView: React.FC = () => {
  const { assets, workstations, tickets } = useInventory();

  // Data for Asset Categories (Pie Chart)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = { cpu: 0, monitor: 0, keyboard: 0, mouse: 0, other: 0 };
    assets.forEach(a => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      } else {
        counts.other++;
      }
    });
    return [
      { name: "CPUs", value: counts.cpu, color: "#4f46e5" }, // Indigo
      { name: "Monitores", value: counts.monitor, color: "#0ea5e9" }, // Sky
      { name: "Teclados", value: counts.keyboard, color: "#8b5cf6" }, // Violet
      { name: "Mouses", value: counts.mouse, color: "#ec4899" }, // Pink
      { name: "Otros", value: counts.other, color: "#94a3b8" }, // Slate
    ].filter(d => d.value > 0);
  }, [assets]);

  // Data for Asset Status (Pie Chart)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { operational: 0, in_maintenance: 0, in_storage: 0, retired: 0 };
    assets.forEach(a => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      } else {
        counts.retired++;
      }
    });
    return [
      { name: "Operativos", value: counts.operational, color: "#10b981" }, // Emerald
      { name: "En Mantenimiento", value: counts.in_maintenance, color: "#f59e0b" }, // Amber
      { name: "Bodega", value: counts.in_storage, color: "#64748b" }, // Slate
      { name: "Retirados", value: counts.retired, color: "#ef4444" }, // Red
    ].filter(d => d.value > 0);
  }, [assets]);

  // Ticket severity distribution
  const ticketData = useMemo(() => {
    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    tickets.forEach(t => {
      severityCount[t.severity]++;
    });
    return [
      { name: "Baja", value: severityCount.low, fill: "#3b82f6" },
      { name: "Media", value: severityCount.medium, fill: "#f59e0b" },
      { name: "Alta", value: severityCount.high, fill: "#ef4444" },
      { name: "Crítica", value: severityCount.critical, fill: "#7f1d1d" },
    ];
  }, [tickets]);

  // Total valuation
  const totalValue = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Analytics & Intelligence</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Distribution, status, and maintenance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Total Value</div>
            <div className="text-sm font-mono font-medium text-zinc-900">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4 bg-zinc-50 flex-1">
        
        {/* Category Distribution */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold text-zinc-800 mb-4">Category Distribution</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: "6px", padding: '4px 8px' }} />
                <Legend verticalAlign="bottom" height={20} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold text-zinc-800 mb-4">Hardware Status</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: "6px", padding: '4px 8px' }} />
                <Legend verticalAlign="bottom" height={20} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets Severity */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm md:col-span-2">
          <h3 className="text-xs font-semibold text-zinc-800 mb-4">Tickets by Severity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                <Tooltip cursor={{ fill: "#f4f4f5" }} contentStyle={{ fontSize: '12px', borderRadius: "6px", padding: '4px 8px' }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
