"use client";

import React, { useState } from "react";
import { useInventory } from "@/lib/inventory-context";
import { 
  Server, 
  QrCode, 
  Plus, 
  FileText, 
  LayoutGrid, 
  Cpu, 
  Wrench, 
  History, 
  ChevronDown,
  Building2,
  HelpCircle,
  PieChart,
  DatabaseBackup,
  UploadCloud,
  Usb,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

import { motion } from "framer-motion";

interface NavbarProps {
  currentTab: "workstations" | "inventory" | "maintenance" | "audit" | "analytics";
  onTabChange: (tab: "workstations" | "inventory" | "maintenance" | "audit" | "analytics") => void;
  onOpenNewAsset: () => void;
  onOpenScanQR: () => void;
  onOpenExportPDF: () => void;
  onOpenUsbScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewAsset,
  onOpenScanQR,
  onOpenExportPDF,
  onOpenUsbScan,
}) => {
  const { labs, selectedLabId, setSelectedLabId, selectedLab, metrics, exportData, importData } = useInventory();
  const { signOut } = useAuth();
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white">
      <div className="flex h-12 items-center justify-between px-4 sm:px-6 max-w-[1400px] mx-auto">
        
        {/* Left: Brand & Dropdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <motion.img 
              src="/logo.png" 
              alt="SysKardex Logo" 
              className="h-6 w-6 object-contain"
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <span className="text-sm font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">SysKardex</span>
          </div>

          <div className="h-4 w-px bg-zinc-200" />

          {/* Lab Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLabDropdownOpen(!labDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900"
            >
              <Building2 className="h-3 w-3" />
              <span>{selectedLab.code}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {labDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-md bg-white border border-zinc-200 shadow-md py-1 z-50">
                {labs.map(lab => (
                  <button
                    key={lab.id}
                    onClick={() => { setSelectedLabId(lab.id); setLabDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    {lab.code} - {lab.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center gap-4">
          {[
            { id: "workstations", label: "Workstations" },
            { id: "inventory", label: "Inventory" },
            { id: "maintenance", label: "Maintenance" },
            { id: "audit", label: "Audit" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as any)}
              className={`text-xs font-medium relative h-12 flex items-center transition-colors ${
                currentTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tab.label}
              {currentTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
           <button onClick={onOpenScanQR} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
             <QrCode className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Scan</span>
           </button>
           <button onClick={onOpenExportPDF} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
             <FileText className="h-3.5 w-3.5" /> <span className="hidden sm:inline">PDF</span>
           </button>
           
           <div className="h-4 w-px bg-zinc-200" />
           
           <button onClick={onOpenUsbScan} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1" title="Escáner USB Automático">
             <Usb className="h-3.5 w-3.5 text-indigo-600" /> <span className="hidden sm:inline font-medium">USB Auto-Scan</span>
           </button>

           <div className="relative group flex items-center">
             <button onClick={() => exportData()} className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
               <DatabaseBackup className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Backup</span>
             </button>
             <input type="file" accept=".json" className="hidden" id="import-db" onChange={(e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               const reader = new FileReader();
               reader.onload = (ev) => ev.target?.result && importData(ev.target.result as string);
               reader.readAsText(file);
             }} />
             <label htmlFor="import-db" className="cursor-pointer text-[10px] text-emerald-600 font-semibold absolute top-full mt-1 right-0 hidden group-hover:block whitespace-nowrap bg-white border border-emerald-200 px-2 py-1 rounded shadow-sm">
               Restore
             </label>
           </div>
           
           <button onClick={onOpenNewAsset} className="bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors ml-2">
             + Asset
           </button>
           
           <div className="h-4 w-px bg-zinc-200 ml-1" />
           
           <button 
             onClick={() => signOut()} 
             className="text-xs text-zinc-500 hover:text-rose-600 flex items-center gap-1 ml-1 transition-colors"
             title="Cerrar Sesión"
           >
             <LogOut className="h-3.5 w-3.5" />
           </button>
        </div>
      </div>
    </header>
  );
};
