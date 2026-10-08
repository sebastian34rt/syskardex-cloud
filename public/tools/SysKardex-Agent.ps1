<#
.SYNOPSIS
LabVault Agent - Cloud RMM Telemetry Daemon (SaaS Mode)

.DESCRIPTION
Este script debe instalarse silenciosamente en las computadoras del colegio.
Envía latidos (heartbeats) e inventario de periféricos al servidor central
LabVault alojado en la nube.
#>

# ==============================================================
# CONFIGURACION DE LA INSTITUCION (SaaS)
# ==============================================================
# 1. Coloca aqui el ID de tu escuela (tu UID de Firebase)
$TenantId = "TU_ID_DE_FIREBASE_AQUI"

# 2. Si ya publicaste LabVault en Vercel, cambia esta URL. 
# Si sigues en tu casa haciendo pruebas, déjalo en localhost.
$ServerUrl = "http://localhost:3005/api/telemetry"

# Frecuencia de envío: 60 segundos es ideal para no saturar 
# el plan gratuito de la Nube.
$IntervalSeconds = 60 

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LabVault Cloud Agent (SaaS Edition)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conectando al servidor central: $ServerUrl" -ForegroundColor Yellow
Write-Host "Tenant ID: $TenantId" -ForegroundColor Magenta

while ($true) {
    try {
        $pcName = $env:COMPUTERNAME
        
        # Contar Ratones y Teclados
        $miceCount = @(Get-CimInstance Win32_PointingDevice -ErrorAction SilentlyContinue).Count
        $kbdCount = @(Get-CimInstance Win32_Keyboard -ErrorAction SilentlyContinue).Count

        # Construir paquete JSON
        $payload = @{
            tenantId = $TenantId
            hostname = $pcName
            mice = $miceCount
            keyboards = $kbdCount
        } | ConvertTo-Json -Compress

        # Enviar al servidor de Next.js (que lo guarda en Firebase)
        Invoke-RestMethod -Uri $ServerUrl -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop | Out-Null
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Datos enviados a la nube. Ratones: $miceCount, Teclados: $kbdCount" -ForegroundColor Green

    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Servidor inalcanzable o sin internet. Esperando..." -ForegroundColor Red
    }

    Start-Sleep -Seconds $IntervalSeconds
}
