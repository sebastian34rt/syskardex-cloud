import { LabRoom, Workstation, Asset, MaintenanceTicket, AuditLogEntry } from "@/types/inventory";

export const INITIAL_LABS: LabRoom[] = [
  {
    id: "lab-1",
    name: "Laboratorio Central",
    code: "LAB-01",
    capacity: 20,
    location: {
      campus: "Campus Principal",
      building: "Edificio A",
      floor: "Piso 1",
      roomName: "Sala de Cómputo",
    },
    supervisor: "Administrador de TI",
    supervisorEmail: "admin@institucion.edu",
    rows: 4,
    cols: 5,
  }
];

export const INITIAL_WORKSTATIONS: Workstation[] = [];
export const INITIAL_ASSETS: Asset[] = [];
export const INITIAL_TICKETS: MaintenanceTicket[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
