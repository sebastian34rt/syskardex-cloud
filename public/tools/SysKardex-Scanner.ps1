<#
.SYNOPSIS
LabVault ITAM - Escáner de Hardware Automático para USB

.DESCRIPTION
Este script recolecta información de hardware (CPU, RAM, Disco, Serial, MAC Address)
del equipo donde se ejecuta y genera un archivo JSON en la misma carpeta.
Ideal para llevar en un Pendrive (USB) y escanear computadoras rápidamente.

.EXAMPLE
.\LabVault-Scanner.ps1
#>

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   LabVault ITAM - Escaner de Hardware" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Recopilando informacion del sistema..."

try {
    $pcName = $env:COMPUTERNAME
    
    # Procesador
    $cpuObj = Get-CimInstance Win32_Processor | Select-Object -First 1
    $cpu = if ($cpuObj) { $cpuObj.Name -replace '\s+', ' ' } else { "Desconocido" }
    
    # RAM en GB
    $ramBytes = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum
    $ram = if ($ramBytes) { [math]::Round($ramBytes / 1GB) } else { 0 }
    
    # Disco Principal
    $diskObj = Get-CimInstance Win32_DiskDrive | Select-Object -First 1
    $disk = if ($diskObj) { $diskObj.Model } else { "Desconocido" }
    
    # Número de Serie (BIOS/Motherboard)
    $serialObj = Get-CimInstance Win32_BIOS
    $serial = if ($serialObj -and $serialObj.SerialNumber) { $serialObj.SerialNumber } else { "GENERIC-$((Get-Date).Ticks)" }
    
    # MAC Address (Primera tarjeta de red activa)
    $macObj = Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled -eq $true | Select-Object -First 1
    $mac = if ($macObj) { $macObj.MACAddress } else { "00:00:00:00:00:00" }

    # Generar estructura JSON
    $data = @{
        hostname = $pcName
        scanDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        hardware = @{
            cpu = $cpu.Trim()
            ramGB = $ram
            disk = $disk.Trim()
            serial = $serial.Trim()
            macAddress = $mac.Trim()
        }
    }

    $json = $data | ConvertTo-Json -Depth 5
    $filename = ".\scan-$pcName.json"
    
    $json | Out-File -FilePath $filename -Encoding UTF8
    
    Write-Host "`n[EXITO] Escaneo completado." -ForegroundColor Green
    Write-Host "Archivo guardado en: $(Resolve-Path $filename)" -ForegroundColor Yellow
    Write-Host "Ya puede expulsar el USB e importar este archivo en LabVault."
} catch {
    Write-Host "`n[ERROR] Ocurrio un problema al escanear: $_" -ForegroundColor Red
}

Write-Host "`nPresione cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
