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
echo [*] Iniciando el servidor...
cd backend
call venv\Scripts\activate.bat

echo.
echo ==========================================================
echo       EL SERVIDOR SE ESTA EJECUTANDO (NO CIERRES ESTO)
echo ==========================================================
echo   Aperturando la interfaz en tu navegador predeterminado...
echo   Para apagar el servidor presiona Ctrl + C
echo ==========================================================
echo.

:: Lanzar navegador
start "" http://localhost:5000

:: Iniciar aplicacion
python run.py

pause
exit /b
