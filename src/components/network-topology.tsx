"use client";

import React, { useMemo } from "react";
import { useInventory } from "@/lib/inventory-context";
import { Server, Monitor, AlertTriangle } from "lucide-react";

export const NetworkTopologyView: React.FC = () => {
  const { labWorkstations, liveTelemetry } = useInventory();

  // Constantes del mapa
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 220;

  // Calcular las posiciones de cada computadora en un círculo
  const nodes = useMemo(() => {
    return labWorkstations.map((ws, index) => {
      const angle = (index / (labWorkstations.length || 1)) * 2 * Math.PI - Math.PI / 2; // Empezar arriba
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const telemetry = liveTelemetry[ws.code.toLowerCase()];
      const isOnline = telemetry?.status === "online";
      const hasHardwareAlert = isOnline && (telemetry.mice === 0 || telemetry.keyboards === 0);

      return {
        ...ws,
        x,
        y,
        isOnline,
        hasHardwareAlert
      };
    });
  }, [labWorkstations, liveTelemetry]);

  if (labWorkstations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No hay computadoras para mostrar en la topología.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-zinc-950 rounded-lg border border-zinc-800 shadow-inner relative flex items-center justify-center p-4">
      
      {/* Etiqueta de la Vista */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-zinc-400 text-xs font-mono tracking-widest uppercase">
          Live Network Topology
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-4xl h-auto drop-shadow-2xl">
        
        {/* Definiciones de Filtros y Gradientes */}
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Dibujar Líneas (Conexiones al Servidor Central) */}
        {nodes.map((node) => (
          <g key={`line-${node.id}`}>
            {/* Línea base oscura */}
            <line 
              x1={centerX} y1={centerY} 
              x2={node.x} y2={node.y} 
              stroke="#27272a" 
              strokeWidth="2" 
            />
            {/* Línea animada si está online */}
            {node.isOnline && (
              <line 
                x1={centerX} y1={centerY} 
                x2={node.x} y2={node.y} 
                stroke="#10b981" 
                strokeWidth="2"
                strokeDasharray="4 8"
                className="animate-[dash_2s_linear_infinite]"
                style={{ animationDirection: "reverse" }} // Flujo hacia el centro
              />
            )}
            {/* Línea de Alerta si hay problemas físicos */}
            {node.hasHardwareAlert && (
              <line 
                x1={centerX} y1={centerY} 
                x2={node.x} y2={node.y} 
                stroke="#ef4444" 
                strokeWidth="2"
                strokeDasharray="4 8"
                className="animate-[dash_1s_linear_infinite]"
              />
            )}
          </g>
        ))}

        {/* 2. Nodo Central (Switch / Servidor Maestro) */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          <circle r="40" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
          <circle r="30" fill="#27272a" />
          <foreignObject x="-20" y="-20" width="40" height="40">
            <div className="flex items-center justify-center w-full h-full text-zinc-300">
              <Server className="w-6 h-6" />
            </div>
          </foreignObject>
          <text x="0" y="55" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace" fontWeight="bold">
            MASTER / CORE
          </text>
        </g>

        {/* 3. Nodos de Computadoras (Workstations) */}
        {nodes.map((node) => (
          <g key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
            {/* Círculo de estado */}
            <circle 
              r="22" 
              fill="#18181b" 
              stroke={node.isOnline ? (node.hasHardwareAlert ? "#ef4444" : "#10b981") : "#3f3f46"} 
              strokeWidth={node.isOnline ? "2" : "1"}
              filter={node.isOnline ? "url(#glow)" : undefined}
            />
            
            <foreignObject x="-12" y="-12" width="24" height="24">
              <div className={`flex items-center justify-center w-full h-full ${node.isOnline ? "text-zinc-100" : "text-zinc-600"}`}>
                {node.hasHardwareAlert ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </div>
            </foreignObject>

            {/* Texto del Hostname */}
            <rect x="-35" y="28" width="70" height="18" rx="4" fill="#18181b" stroke="#27272a" />
            <text x="0" y="40" textAnchor="middle" fill={node.isOnline ? "#f4f4f5" : "#71717a"} fontSize="9" fontFamily="monospace" fontWeight="bold">
              {node.code}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
