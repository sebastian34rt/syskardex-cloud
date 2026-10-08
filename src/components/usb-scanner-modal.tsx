import React from "react";
import { Download, Upload, X, Usb } from "lucide-react";
import { useInventory } from "@/lib/inventory-context";

interface UsbScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsbScannerModal: React.FC<UsbScannerModalProps> = ({ isOpen, onClose }) => {
  const { processUsbScan } = useInventory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl border border-zinc-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Usb className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Escáner USB (Pendrive)</h2>
              <p className="text-xs text-zinc-500">Recopilación automática de hardware</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          
          {/* Step 1 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">1. Preparar el Pendrive</h3>
            <p className="text-xs text-zinc-600 mb-3">
              Puedes extraer los datos manualmente con el <strong>Scanner</strong> (1 vez) o instalar el <strong>Agente en vivo</strong> permanente en la PC de los alumnos para verlos en el mapa de Topología.
            </p>
            <div className="flex gap-2">
              <a 
                href="/tools/SysKardex-Scanner.ps1" 
                download="SysKardex-Scanner.ps1"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-[11px] font-medium text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                Scanner (.ps1)
              </a>
              <a 
                href="/tools/SysKardex-Agent.ps1" 
                download="SysKardex-Agent.ps1"
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-2 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                <Download className="h-3.5 w-3.5" />
                Agent (.ps1)
              </a>
              <a 
                href="/tools/Instalar-SysKardex.bat" 
                download="Instalar-SysKardex.bat"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-[11px] font-medium text-white hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                Instalador 1-Clic (.bat)
              </a>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 italic">
              Para el Agente: Descarga ambos archivos (Agent y BAT) en la misma carpeta de tu USB y ejecuta el Instalador (.bat) como Administrador.
            </p>
          </div>

          <div className="h-px w-full bg-zinc-100" />

          {/* Step 2 */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">2. Importar Resultados</h3>
            <p className="text-xs text-zinc-600 mb-3">
              Conecta el USB de vuelta a este equipo y sube los archivos <code>scan-NOMBREEQUIPO.json</code> generados.
            </p>
            
            <div className="relative group flex items-center justify-center w-full h-24 rounded-md border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-indigo-400 transition-colors">
              <input 
                type="file" 
                accept=".json"
                multiple 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  
                  Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        processUsbScan(ev.target.result as string);
                      }
                    };
                    reader.readAsText(file);
                  });
                  onClose();
                }} 
              />
              <div className="flex flex-col items-center text-zinc-500 pointer-events-none">
                <Upload className="h-6 w-6 mb-1 text-zinc-400 group-hover:text-indigo-500" />
                <span className="text-xs font-medium">Haz clic o arrastra los archivos .json aquí</span>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};
