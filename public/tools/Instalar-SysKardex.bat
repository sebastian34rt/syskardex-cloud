@echo off
title Instalador LabVault Agent
color 0B

:: 1. Verificar si se ejecuta como Administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Privilegios de Administrador confirmados.
) else (
    color 0C
    echo =======================================================
    echo ERROR: Faltan Permisos
    echo =======================================================
    echo Por favor, cierra esta ventana, haz clic derecho sobre
    echo este archivo (Instalar-LabVault.bat) y selecciona:
    echo "Ejecutar como administrador".
    echo =======================================================
    pause
    exit /b 1
)

echo.
echo =======================================================
echo   INSTALADOR AUTOMATICO: LABVAULT AGENT (SILENCIOSO)
echo =======================================================
echo.

:: Definir rutas
set "TARGET_DIR=C:\ProgramData\LabVault"
set "SCRIPT_NAME=LabVault-Agent.ps1"

:: 2. Crear directorio protegido del sistema
echo [*] Creando directorio oculto en el sistema...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: 3. Copiar el script desde el USB al disco duro
echo [*] Instalando el Agente RMM...
copy /Y "%~dp0%SCRIPT_NAME%" "%TARGET_DIR%\%SCRIPT_NAME%" >nul
if %errorLevel% neq 0 (
    echo [ERROR] No se pudo copiar el archivo. Asegurate de que "%SCRIPT_NAME%" este en la misma carpeta que este instalador.
    pause
    exit /b 1
)

:: 4. Programar la Tarea Oculta en Windows
echo [*] Configurando persistencia y arranque automatico...
:: Eliminar tarea previa si existiera (para actualizaciones)
schtasks /Delete /TN "LabVault_Agent" /F >nul 2>&1

:: Crear la tarea: Ejecutar al iniciar sesion, con maximos privilegios (RL HIGHEST), ventana oculta
schtasks /Create /TN "LabVault_Agent" /TR "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%TARGET_DIR%\%SCRIPT_NAME%\"" /SC ONLOGON /RL HIGHEST /F >nul

:: 5. Iniciar el Agente inmediatamente para no tener que reiniciar
echo [*] Iniciando el servicio en segundo plano...
schtasks /Run /TN "LabVault_Agent" >nul

echo.
echo =======================================================
echo [EXITO] INSTALACION COMPLETADA PERFECTAMENTE
echo =======================================================
echo El agente esta ahora oculto en la computadora.
echo Se ejecutara automaticamente en cada reinicio sin
echo mostrar ventanas a los estudiantes.
echo.
echo Ya puedes retirar el Pendrive y pasar a la siguiente PC.
echo =======================================================
pause
