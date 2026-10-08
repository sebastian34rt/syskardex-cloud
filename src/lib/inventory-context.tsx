"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Asset, 
  Workstation, 
  LabRoom, 
  MaintenanceTicket, 
  AuditLogEntry, 
  AssetStatus,
  TicketSeverity,
  WorkstationStatus 
} from "@/types/inventory";
import { 
  INITIAL_LABS, 
  INITIAL_WORKSTATIONS, 
  INITIAL_ASSETS, 
  INITIAL_TICKETS, 
  INITIAL_AUDIT_LOGS 
} from "./mock-data";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

interface InventoryContextType {
  labs: LabRoom[];
  selectedLabId: string;
  setSelectedLabId: (id: string) => void;
  selectedLab: LabRoom;
  
  workstations: Workstation[];
  labWorkstations: Workstation[];
  getWorkstationAssets: (workstationId: string) => Asset[];
  updateWorkstationStatus: (wsId: string, status: WorkstationStatus, notes?: string) => void;
  
  assets: Asset[];
  getAssetById: (id: string) => Asset | undefined;
  getAssetByTag: (tag: string) => Asset | undefined;
  addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt" | "qrPayload">) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  reassignAsset: (assetId: string, targetWorkstationId: string | null) => void;
  changeAssetStatus: (assetId: string, newStatus: AssetStatus, reason?: string) => void;
  
  tickets: MaintenanceTicket[];
  createTicket: (data: {
    assetId: string;
    title: string;
    description: string;
    severity: TicketSeverity;
    reportedBy: string;
  }) => MaintenanceTicket;
  resolveTicket: (ticketId: string, resolutionNotes: string, cost?: number) => void;
  
  auditLogs: AuditLogEntry[];
  
  // Stats
  metrics: {
    totalAssets: number;
    operationalAssets: number;
    inMaintenanceAssets: number;
    inStorageAssets: number;
    totalValuation: number;
    activeTicketsCount: number;
    operationalWorkstations: number;
    totalWorkstations: number;
    healthRate: number;
  };
  exportData: () => void;
  importData: (jsonData: string) => void;
  processUsbScan: (scanJson: string) => void;
  liveTelemetry: Record<string, { lastSeen: string; mice: number; keyboards: number; status: string }>;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const STORAGE_KEYS = {
  ASSETS: "labvault_assets_v2",
  WORKSTATIONS: "labvault_workstations_v2",
  TICKETS: "labvault_tickets_v2",
  AUDIT: "labvault_audit_v2",
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labs] = useState<LabRoom[]>(INITIAL_LABS);
  const [selectedLabId, setSelectedLabId] = useState<string>("lab-1");

  const [workstations, setWorkstations] = useState<Workstation[]>(INITIAL_WORKSTATIONS);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState<Record<string, { lastSeen: string; mice: number; keyboards: number; status: string }>>({});

  const { user } = useAuth();

  // Live Telemetry Polling (Nube)
  useEffect(() => {
    if (!user) return; // Si no hay colegio logueado, no consultar telemetria

    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`/api/telemetry?tenantId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          const now = new Date().getTime();
          Object.keys(data).forEach(host => {
            const lastSeen = new Date(data[host].lastSeen).getTime();
            // Si pasaron más de 70 segundos sin pulso, está apagada
            if (now - lastSeen > 70000) data[host].status = "offline";
          });
          setLiveTelemetry(data);
        }
      } catch (e) {
        // Silently fail on network error
      }
    };
    fetchTelemetry();
    
    // Consultar la nube cada 20 segundos (Para ahorrar costos de Firebase en Producción)
    const interval = setInterval(fetchTelemetry, 20000);
    return () => clearInterval(interval);
  }, [user]);

  // Load from Firebase on mount
  useEffect(() => {
    if (!user) {
      setIsHydrated(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "institutions", user.uid), (document) => {
      if (document.exists()) {
        const data = document.data();
        if (data.assets) setAssets(data.assets);
        if (data.workstations) setWorkstations(data.workstations);
        if (data.tickets) setTickets(data.tickets);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
      setIsHydrated(true);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setIsHydrated(true);
    });

    return () => unsubscribe();
  }, [user]);

  // Save to Firebase when state changes
  useEffect(() => {
    if (!isHydrated || !user) return;
    
    const saveToCloud = async () => {
      try {
        await setDoc(doc(db, "institutions", user.uid), {
          assets,
          workstations,
          tickets,
          auditLogs,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error("Firebase save error:", error);
      }
    };

    // Debounce to avoid slamming Firestore on every rapid keystroke/drag
    const timeoutId = setTimeout(saveToCloud, 1000);
    return () => clearTimeout(timeoutId);
  }, [assets, workstations, tickets, auditLogs, isHydrated, user]);

  const selectedLab = labs.find((l) => l.id === selectedLabId) || labs[0];
  const labWorkstations = workstations.filter((w) => w.labId === selectedLabId);

  const getWorkstationAssets = (workstationId: string) => {
    return assets.filter((a) => a.workstationId === workstationId);
  };

  const getAssetById = (id: string) => assets.find((a) => a.id === id);
  const getAssetByTag = (tag: string) => assets.find((a) => a.assetTag.toLowerCase() === tag.toLowerCase());

  // Record audit log
  const recordAudit = (entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Add Asset
  const addAsset = (data: Omit<Asset, "id" | "createdAt" | "updatedAt" | "qrPayload">): Asset => {
    const id = `ast-${Date.now()}`;
    const newAsset: Asset = {
      ...data,
      id,
      qrPayload: data.assetTag,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setAssets((prev) => [newAsset, ...prev]);
    recordAudit({
      action: "ASSET_CREATED",
      assetId: id,
      assetTag: newAsset.assetTag,
      userName: "Administrador TI",
      userRole: "Gestión de Activos",
      details: `Registrado nuevo activo: ${newAsset.name} (${newAsset.brand} ${newAsset.model})`,
    });

    toast.success("Activo registrado con éxito", {
      description: `${newAsset.name} [${newAsset.assetTag}] guardado en inventario.`,
    });

    return newAsset;
  };

  // Update Asset
  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            ...updates,
            updatedAt: new Date().toISOString().split("T")[0],
          };
          recordAudit({
            action: "ASSET_UPDATED",
            assetId: id,
            assetTag: item.assetTag,
            userName: "Administrador TI",
            userRole: "Soporte Técnico",
            details: `Modificadas propiedades de activo ${item.assetTag}`,
          });
          return updated;
        }
        return item;
      })
    );
    toast.info("Activo actualizado");
  };

  // Delete Asset
  const deleteAsset = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;

    setAssets((prev) => prev.filter((a) => a.id !== id));
    recordAudit({
      action: "ASSET_DECOMMISSIONED",
      assetId: id,
      assetTag: asset.assetTag,
      userName: "Administrador TI",
      userRole: "Auditoría de Activos",
      details: `Eliminado del catálogo activo: ${asset.name} (${asset.assetTag})`,
    });
    toast.error("Activo eliminado del sistema");
  };

  // Reassign Asset to different Workstation
  const reassignAsset = (assetId: string, targetWorkstationId: string | null) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const oldWs = workstations.find((w) => w.id === asset.workstationId);
    const newWs = workstations.find((w) => w.id === targetWorkstationId);

    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, workstationId: targetWorkstationId } : a))
    );

    const targetDesc = newWs ? newWs.code : "Bodega / Sin puesto";
    const originDesc = oldWs ? oldWs.code : "Sin puesto";

    recordAudit({
      action: "WORKSTATION_REASSIGNED",
      assetId: asset.id,
      assetTag: asset.assetTag,
      workstationCode: newWs?.code,
      userName: "Técnico de Laboratorio",
      userRole: "Operaciones TI",
      details: `Transferido activo ${asset.name} desde [${originDesc}] a [${targetDesc}]`,
    });

    toast.success("Movimiento completado", {
      description: `${asset.name} ahora asignado a ${targetDesc}`,
    });
  };

  // Change Asset Status
  const changeAssetStatus = (assetId: string, newStatus: AssetStatus, reason?: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: newStatus } : a))
    );

    recordAudit({
      action: "STATUS_CHANGED",
      assetId: asset.id,
      assetTag: asset.assetTag,
      userName: "Técnico de Laboratorio",
      userRole: "Operaciones TI",
      details: `Estado de ${asset.assetTag} cambiado a '${newStatus}'. ${reason || ""}`,
    });

    // Check if workstation needs status update
    if (asset.workstationId) {
      const ws = workstations.find((w) => w.id === asset.workstationId);
      if (ws) {
        if (newStatus === "in_maintenance" && ws.status === "operational") {
          updateWorkstationStatus(ws.id, "degraded", `Activo ${asset.name} en mantenimiento`);
        }
      }
    }

    toast.info(`Estado actualizado: ${newStatus.toUpperCase()}`);
  };

  // Update Workstation Status
  const updateWorkstationStatus = (wsId: string, status: WorkstationStatus, notes?: string) => {
    setWorkstations((prev) =>
      prev.map((w) => (w.id === wsId ? { ...w, status, notes: notes ?? w.notes } : w))
    );
  };

  // Create Ticket
  const createTicket = (data: {
    assetId: string;
    title: string;
    description: string;
    severity: TicketSeverity;
    reportedBy: string;
  }): MaintenanceTicket => {
    const asset = assets.find((a) => a.id === data.assetId);
    const workstation = asset?.workstationId
      ? workstations.find((w) => w.id === asset.workstationId)
      : null;
    const lab = asset ? labs.find((l) => l.id === asset.labId) : selectedLab;

    const ticketNumber = `TCK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, "0")}`;
    const newTicket: MaintenanceTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber,
      assetId: data.assetId,
      assetTag: asset?.assetTag || "N/A",
      assetName: asset?.name || "Equipo",
      workstationId: asset?.workstationId || null,
      workstationCode: workstation?.code,
      labId: lab?.id || "lab-1",
      labName: lab?.name || "Laboratorio",
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: "open",
      reportedBy: data.reportedBy,
      assignedTechnician: null,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      resolvedAt: null,
      resolutionNotes: null,
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Automatically set asset to in_maintenance if high or critical
    if (asset && (data.severity === "high" || data.severity === "critical")) {
      changeAssetStatus(asset.id, "in_maintenance", `Por apertura de ticket ${ticketNumber}`);
    }

    recordAudit({
      action: "TICKET_CREATED",
      assetId: data.assetId,
      assetTag: asset?.assetTag,
      workstationCode: workstation?.code,
      userName: data.reportedBy,
      userRole: "Reportante",
      details: `Incidencia registrada [${ticketNumber}]: ${data.title}`,
    });

    toast.warning(`Ticket generado: ${ticketNumber}`, {
      description: `Reporte de incidencia ingresado para ${asset?.name || "activo"}.`,
    });

    return newTicket;
  };

  // Resolve Ticket
  const resolveTicket = (ticketId: string, resolutionNotes: string, cost?: number) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "resolved",
              resolvedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              resolutionNotes,
              cost,
            }
          : t
      )
    );

    // Prompt or restore asset status
    if (ticket.assetId) {
      changeAssetStatus(ticket.assetId, "operational", `Ticket ${ticket.ticketNumber} resuelto: ${resolutionNotes}`);
    }

    recordAudit({
      action: "TICKET_RESOLVED",
      assetId: ticket.assetId,
      assetTag: ticket.assetTag,
      workstationCode: ticket.workstationCode,
      userName: "Téc. Soporte Especializado",
      userRole: "Técnico Asignado",
      details: `Ticket ${ticket.ticketNumber} resuelto con éxito. ${resolutionNotes}`,
    });

    toast.success(`Ticket ${ticket.ticketNumber} resuelto`);
  };

  // Metrics calculation
  const totalAssets = assets.length;
  const operationalAssets = assets.filter((a) => a.status === "operational").length;
  const inMaintenanceAssets = assets.filter((a) => a.status === "in_maintenance").length;
  const inStorageAssets = assets.filter((a) => a.status === "in_storage").length;
  const totalValuation = assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
  const activeTicketsCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const operationalWorkstations = workstations.filter((w) => w.status === "operational").length;
  const totalWorkstations = workstations.length;
  const healthRate = totalWorkstations > 0 ? Math.round((operationalWorkstations / totalWorkstations) * 100) : 100;

  const metrics = {
    totalAssets,
    operationalAssets,
    inMaintenanceAssets,
    inStorageAssets,
    totalValuation,
    activeTicketsCount,
    operationalWorkstations,
    totalWorkstations,
    healthRate,
  };

  const exportData = () => {
    const data = {
      assets,
      workstations,
      tickets,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `labvault-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Base de datos exportada con éxito.");
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.assets && data.workstations && data.tickets && data.auditLogs) {
        setAssets(data.assets);
        setWorkstations(data.workstations);
        setTickets(data.tickets);
        setAuditLogs(data.auditLogs);
        toast.success("Base de datos restaurada correctamente.");
      } else {
        throw new Error("Formato inválido");
      }
    } catch (e) {
      toast.error("Error al importar el archivo. El formato no es válido.");
    }
  };

  const processUsbScan = (scanJson: string) => {
    try {
      const data = JSON.parse(scanJson);
      if (!data.hostname || !data.hardware) {
        throw new Error("Formato de escaneo USB inválido");
      }

      const { hostname, hardware } = data;
      
      // 1. Encontrar o crear el puesto de trabajo (Workstation)
      let ws = workstations.find(w => w.code.toLowerCase() === hostname.toLowerCase());
      if (!ws) {
        const newWs: Workstation = {
          id: `ws-${Date.now()}`,
          labId: selectedLabId,
          code: hostname,
          name: `PC ${hostname}`,
          status: "operational",
          row: 0,
          col: 0,
          lastAuditedAt: new Date().toISOString().split("T")[0]
        };
        setWorkstations(prev => [...prev, newWs]);
        ws = newWs;
      }

      // 2. Verificar si el activo base (CPU/Torre) ya existe por su Serial
      const existingAsset = assets.find(a => a.serialNumber === hardware.serial);
      
      if (existingAsset) {
        // Actualizar hardware specs si ya existe
        updateAsset(existingAsset.id, {
          workstationId: ws.id, // Reasignar si se movió
          notes: `CPU: ${hardware.cpu} | RAM: ${hardware.ramGB}GB | Disco: ${hardware.disk} | MAC: ${hardware.macAddress}`,
        });
        toast.info(`Torre actualizada: ${hostname}`);
      } else {
        // Crear el nuevo activo (CPU/Torre Principal)
        addAsset({
          labId: selectedLabId,
          workstationId: ws.id,
          category: "cpu",
          assetTag: `TAG-${hardware.serial.substring(0,6).toUpperCase()}`,
          name: `Torre ${hostname}`,
          brand: "Generico",
          model: hardware.cpu.substring(0, 20),
          serialNumber: hardware.serial,
          status: "operational",
          purchaseDate: new Date().toISOString().split("T")[0],
          notes: `RAM: ${hardware.ramGB}GB | Disco: ${hardware.disk} | MAC: ${hardware.macAddress}`,
          specs: {},
          warrantyExpires: "",
          purchaseCost: 0,
          supplier: "Desconocido"
        });
        toast.success(`Nuevo equipo registrado: ${hostname}`);
      }

      recordAudit({
        action: "ASSET_CREATED",
        assetId: ws.id,
        assetTag: "USB-SCAN",
        userName: "Sistema Automático",
        userRole: "Soporte",
        details: `Importación vía USB Pendrive para ${hostname}`,
      });

    } catch (e) {
      toast.error("Error al procesar el archivo USB. El formato no es válido.");
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        labs,
        selectedLabId,
        setSelectedLabId,
        selectedLab,
        workstations,
        labWorkstations,
        getWorkstationAssets,
        updateWorkstationStatus,
        assets,
        getAssetById,
        getAssetByTag,
        addAsset,
        updateAsset,
        deleteAsset,
        reassignAsset,
        changeAssetStatus,
        tickets,
        createTicket,
        resolveTicket,
        auditLogs,
        metrics,
        exportData,
        importData,
        processUsbScan,
        liveTelemetry,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
