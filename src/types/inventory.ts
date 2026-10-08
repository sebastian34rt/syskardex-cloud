export type AssetStatus = 'operational' | 'in_maintenance' | 'in_storage' | 'decommissioned';

export type AssetCategory = 
  | 'cpu' 
  | 'monitor' 
  | 'keyboard' 
  | 'mouse' 
  | 'projector' 
  | 'networking' 
  | 'ups' 
  | 'lab_instrument';

export type WorkstationStatus = 'operational' | 'degraded' | 'maintenance' | 'offline';

export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface LocationInfo {
  campus: string;
  building: string;
  floor: string;
  roomName: string;
}

export interface AssetSpecs {
  processor?: string;
  ram?: string;
  storage?: string;
  gpu?: string;
  resolution?: string;
  connectivity?: string;
  ipAddress?: string;
  macAddress?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  assetTag: string; // e.g. "LV-2026-001"
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  labId: string;
  workstationId: string | null; // ID of the desk/station it's attached to
  specs: AssetSpecs;
  purchaseDate: string;
  warrantyExpires: string;
  purchaseCost: number;
  supplier: string;
  assignedTo?: string;
  notes?: string;
  qrPayload: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workstation {
  id: string;
  code: string; // e.g. "LAB1-WS05"
  name: string; // e.g. "Estación #05"
  labId: string;
  row: number;
  col: number;
  status: WorkstationStatus;
  notes?: string;
  lastAuditedAt: string;
}

export interface LabRoom {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location: LocationInfo;
  supervisor: string;
  supervisorEmail: string;
  rows: number;
  cols: number;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  workstationId: string | null;
  workstationCode?: string;
  labId: string;
  labName: string;
  title: string;
  description: string;
  severity: TicketSeverity;
  status: TicketStatus;
  reportedBy: string;
  assignedTechnician: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  cost?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'ASSET_CREATED' | 'ASSET_UPDATED' | 'STATUS_CHANGED' | 'WORKSTATION_REASSIGNED' | 'TICKET_CREATED' | 'TICKET_RESOLVED' | 'ASSET_DECOMMISSIONED';
  assetId?: string;
  assetTag?: string;
  workstationCode?: string;
  userName: string;
  userRole: string;
  details: string;
}
