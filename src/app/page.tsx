"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { WorkstationsView } from "@/components/workstations-view";
import { AssetCatalog } from "@/components/asset-catalog";
import { MaintenanceView } from "@/components/maintenance-view";
import { AuditLogView } from "@/components/audit-log-view";
import { AnalyticsView } from "@/components/analytics-view";
import { AddAssetModal } from "@/components/add-asset-modal";
import { ReportTicketModal } from "@/components/report-ticket-modal";
import { QRScannerModal } from "@/components/qr-scanner-modal";
import { PDFExportModal } from "@/components/pdf-export-modal";
import { UsbScannerModal } from "@/components/usb-scanner-modal";
import { useInventory } from "@/lib/inventory-context";
import { Asset } from "@/types/inventory";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";

export default function SystemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { metrics } = useInventory();

  const [currentTab, setCurrentTab] = useState<"workstations" | "inventory" | "maintenance" | "audit" | "analytics">("workstations");
  
  const [isNewAssetOpen, setIsNewAssetOpen] = useState(false);
  const [isScanQROpen, setIsScanQROpen] = useState(false);
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [isUsbScanOpen, setIsUsbScanOpen] = useState(false);
  const [ticketTargetAsset, setTicketTargetAsset] = useState<Asset | null>(null);
  const [isReportTicketOpen, setIsReportTicketOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleOpenReportTicket = (asset: Asset | null = null) => {
    setTicketTargetAsset(asset);
    setIsReportTicketOpen(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-zinc-200 rounded-md mb-4"></div>
          <div className="h-4 w-32 bg-zinc-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200">
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewAsset={() => setIsNewAssetOpen(true)}
        onOpenScanQR={() => setIsScanQROpen(true)}
        onOpenExportPDF={() => setIsExportPDFOpen(true)}
        onOpenUsbScan={() => setIsUsbScanOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        
        {/* KPI Row - Dense and Professional */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-zinc-200 rounded-md p-3 shadow-sm">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Assets</div>
            <div className="text-xl font-mono text-zinc-900">{metrics.totalAssets}</div>
            <div className="text-[10px] text-zinc-500 mt-1">{metrics.operationalAssets} operational</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-md p-3 shadow-sm">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Health Rate</div>
            <div className="text-xl font-mono text-emerald-600">{metrics.healthRate}%</div>
            <div className="text-[10px] text-zinc-500 mt-1">{metrics.operationalWorkstations} / {metrics.totalWorkstations} ready</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-md p-3 shadow-sm">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Active Tickets</div>
            <div className="text-xl font-mono text-amber-600">{metrics.activeTicketsCount}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Require technical attention</div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-md p-3 shadow-sm md:col-span-2">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Valuation</div>
            <div className="text-xl font-mono text-zinc-900">${metrics.totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Capital expenditure in current lab</div>
          </div>
        </div>

        {/* System Views */}
        <div className="flex-1 bg-white border border-zinc-200 rounded-md shadow-sm min-h-[500px]">
          {currentTab === "workstations" && <WorkstationsView onOpenReportTicket={handleOpenReportTicket} onOpenNewAsset={() => setIsNewAssetOpen(true)} />}
          {currentTab === "inventory" && <AssetCatalog onOpenReportTicket={handleOpenReportTicket} onOpenNewAsset={() => setIsNewAssetOpen(true)} />}
          {currentTab === "maintenance" && <MaintenanceView onOpenNewTicketManual={() => handleOpenReportTicket(null)} />}
          {currentTab === "audit" && <AuditLogView />}
          {currentTab === "analytics" && <AnalyticsView />}
        </div>

      </main>

      <AddAssetModal isOpen={isNewAssetOpen} onClose={() => setIsNewAssetOpen(false)} />
      <ReportTicketModal isOpen={isReportTicketOpen} onClose={() => setIsReportTicketOpen(false)} preselectedAsset={ticketTargetAsset} />
      <QRScannerModal isOpen={isScanQROpen} onClose={() => setIsScanQROpen(false)} onOpenReportTicket={handleOpenReportTicket} />
      <PDFExportModal isOpen={isExportPDFOpen} onClose={() => setIsExportPDFOpen(false)} />
      <UsbScannerModal isOpen={isUsbScanOpen} onClose={() => setIsUsbScanOpen(false)} />
    </div>
  );
}
