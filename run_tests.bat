@echo off
title Pruebas Automáticas - ManagerAccount
setlocal enabledelayedexpansion

:: Cambiar al directorio del script
cd /d "%~dp0"

echo ==========================================================
echo       EJECUTANDO PRUEBAS AUTOMATICAS - PYTEST
echo ==========================================================
echo.

:: Verificar que el entorno virtual exista
if not exist "backend\venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual venv en backend.
    echo Por favor, ejecuta primero el script 'instalar.bat'.
    echo.
    pause
    exit /b 1
)

:: Activar entorno virtual
cd backend
call venv\Scripts\activate.bat

:: Ejecutar las pruebas
pytest tests/ -v

echo.
echo ==========================================================
echo                  EJECUCION COMPLETADA
echo ==========================================================
echo.
pause
exit /b
