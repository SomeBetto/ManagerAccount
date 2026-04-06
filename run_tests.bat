@echo off
title Pruebas Automáticas - ManagerAccount
echo ========================================================
echo Iniciando entorno virtual y ejecutando pytest...
echo ========================================================
echo.

:: Cambiar al directorio 'backend' relativo a donde se encuentra el .bat
cd /d "%~dp0backend"

:: Verificar que el entorno virtual exista
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual venv en la carpeta backend.
    echo Asegurate de haber instalado las dependencias primero.
    echo.
    pause
    exit /b 1
)

:: Activar entorno virtual
call venv\Scripts\activate.bat

:: Ejecutar las pruebas
pytest tests/ -v

echo.
echo ========================================================
echo Ejecucion completada. Puedes seguir usando esta terminal.
echo ========================================================
cmd /k
