@echo off
title Servidor Manager Account - Flyff
setlocal enabledelayedexpansion

:: Solicitar permisos de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permisos de administrador para ejecutar el servidor y el cliente de Flyff...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~dpnx0\"' -Verb RunAs"
    exit /b
)

:: Regresar al directorio del script
cd /d "%~dp0"

echo ==========================================================
echo         INICIANDO MANAGER ACCOUNT - FLYFF
echo ==========================================================
echo.

:: 1. Verificar si existe Git para buscar actualizaciones
where git >nul 2>&1
if %errorLevel% EQU 0 (
    echo [*] Verificando actualizaciones en Git...
    git fetch origin main >nul 2>&1
    
    for /f %%i in ('git rev-parse HEAD') do set local=%%i
    for /f %%i in ('git rev-parse origin/main') do set remote=%%i
    
    if not "!local!"=="!remote!" (
        echo.
        echo [!] ¡NUEVA VERSION DETECTADA EN GIT!
        echo [*] Actualizando automaticamente a la ultima version...
        git pull origin main
        echo [OK] Actualizacion finalizada.
    ) else (
        echo [OK] El sistema esta actualizado.
    )
) else (
    echo [!] Git no detectado. Saltando comprobacion de actualizaciones.
)

:: 2. Verificar que el sistema este instalado (venv)
if not exist "backend\venv" (
    echo.
    echo [ERROR] No hemos detectado la instalacion del sistema.
    echo POR FAVOR, EJECUTA PRIMERO EL ARCHIVO 'instalar.bat'.
    echo.
    pause
    exit /b
)

:: 3. Iniciar aplicacion
echo.
:: Cerrar instancia previa si existe en el puerto 5000
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [*] Iniciando el servidor en segundo plano...
cd backend
call venv\Scripts\activate.bat

:: Lanzar navegador
start "" http://localhost:5000

:: Iniciar aplicacion en segundo plano
start "" pythonw run.py
exit
