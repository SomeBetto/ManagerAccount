@echo off
chcp 65001 >nul
title Manager Account - Flyff (Menú Principal)
setlocal enabledelayedexpansion

:: 1. Solicitar permisos de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permisos de administrador para ejecutar el menú de Manager Account...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"%~dpnx0\"' -Verb RunAs"
    exit /b
)

:: Regresar al directorio del script
cd /d "%~dp0"

:MENU
cls
echo ==========================================================
echo         MANAGER ACCOUNT - FLYFF (MENÚ PRINCIPAL)
echo ==========================================================
echo.
echo   [1] Iniciar Aplicación
echo   [2] Actualizar Aplicación (Git Pull)
echo   [3] Detener / Quitar de Ejecución
echo   [4] Reparar Instalación y Dependencias
echo   [5] Ver Logs del Servidor
echo   [6] Salir
echo.
echo ==========================================================
set /p opcion="Seleccione una opción [1-6]: "

if "%opcion%"=="1" goto INICIAR
if "%opcion%"=="2" goto ACTUALIZAR
if "%opcion%"=="3" goto DETENER
if "%opcion%"=="4" goto REPARAR
if "%opcion%"=="5" goto VER_LOGS
if "%opcion%"=="6" goto SALIR

echo.
echo [!] Opción no válida. Intente de nuevo.
timeout /t 2 >nul
goto MENU

:INICIAR
cls
echo ==========================================================
echo                INICIANDO MANAGER ACCOUNT
echo ==========================================================
echo.

if not exist "backend\venv" (
    echo [ERROR] No se detectó el entorno virtual en backend\venv.
    echo Por favor, ejecuta primero la Opción [4] Reparar o 'instalar.bat'.
    echo.
    pause
    goto MENU
)

:: Verificar si el servidor ya está corriendo en el puerto 5000 usando netstat nativo
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [!] El servidor ya se encuentra en ejecución en el puerto 5000.
    echo [*] Abriendo interfaz en el navegador web...
    start "" http://localhost:5000
    echo.
    pause
    goto MENU
)

echo [*] Iniciando servidor en segundo plano...
cd backend
if not exist "log" mkdir "log"
if exist "venv\Scripts\python.exe" (
    start "" /b cmd /c ""venv\Scripts\python.exe" run.py >> "log\server.log" 2>&1"
    goto SERVER_STARTED
)

if exist "venv\Scripts\pythonw.exe" (
    start "" /b "venv\Scripts\pythonw.exe" run.py >> "log\server.log" 2>&1
    goto SERVER_STARTED
)

echo [ERROR] No se encontró el ejecutable de Python en backend\venv\Scripts\
cd /d "%~dp0"
pause
goto MENU

:SERVER_STARTED
start "" http://localhost:5000
cd /d "%~dp0"

echo [OK] Servidor iniciado correctamente en http://localhost:5000
echo.
pause
goto MENU

:VER_LOGS
cls
echo ==========================================================
echo             LOGS DE MANAGER ACCOUNT
echo ==========================================================
echo.

if not exist "backend\log" mkdir "backend\log"

echo ------------------- server.log --------------------------
if exist "backend\log\server.log" (
    powershell -NoProfile -Command "Get-Content -Path 'backend\log\server.log' -Tail 80"
) else (
    echo No existe server.log. Inicia la aplicacion para generarlo.
)

echo.
echo ------------------- error.log ---------------------------
if exist "backend\log\error.log" (
    powershell -NoProfile -Command "Get-Content -Path 'backend\log\error.log' -Tail 80"
) else (
    echo No existe error.log. Todavia no se han registrado errores del backend.
)

echo.
echo Se muestran las ultimas 80 lineas de cada archivo.
echo Puedes seleccionar esta opcion nuevamente despues de intentar iniciar.
echo.
pause
goto MENU

:ACTUALIZAR
cls
echo ==========================================================
echo               ACTUALIZANDO MANAGER ACCOUNT
echo ==========================================================
echo.

where git >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Git no está instalado o no se encuentra en el PATH.
    echo.
    pause
    goto MENU
)

echo [*] Deteniendo servidor previo si estuviera activo...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Buscando actualizaciones en el repositorio Git...
git fetch origin main >nul 2>&1

set "local="
set "remote="
for /f %%i in ('git rev-parse HEAD 2^>nul') do set local=%%i
for /f %%i in ('git rev-parse origin/main 2^>nul') do set remote=%%i

if "%local%"=="" goto GIT_ERROR
if "%remote%"=="" goto GIT_ERROR

if "%local%"=="%remote%" (
    echo [OK] La aplicación ya está en la última versión disponible.
    goto ACTUALIZAR_FIN
)

echo.
echo [!] ¡NUEVA VERSIÓN DETECTADA!
echo [*] Descargando e instalando actualización...
git pull origin main

echo [*] Verificando y actualizando paquetes de Python...
cd backend
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd /d "%~dp0"

echo.
echo [OK] Actualización completada con éxito.
goto ACTUALIZAR_FIN

:GIT_ERROR
echo [!] No se pudo verificar la versión con el servidor remoto. Intente manualmente con 'git pull'.

:ACTUALIZAR_FIN
echo.
pause
goto MENU

:DETENER
cls
echo ==========================================================
echo            DETENIENDO MANAGER ACCOUNT (PUERTO 5000)
echo ==========================================================
echo.

echo [*] Deteniendo procesos en puerto 5000 y scripts run.py...
set "stopped=0"

for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000 .*LISTENING"') do (
    set "stopped=1"
    taskkill /F /PID %%a >nul 2>&1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-WmiObject Win32_Process | Where-Object { $_.CommandLine -like '*run.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

if "!stopped!"=="1" (
    echo [OK] El servidor de Manager Account fue detenido exitosamente.
) else (
    echo [!] No se detectó ninguna instancia de Manager Account activa en el puerto 5000.
)

echo.
pause
goto MENU

:REPARAR
cls
echo ==========================================================
echo           REPARANDO INSTALACIÓN DE MANAGER ACCOUNT
echo ==========================================================
echo.

echo [*] 1. Deteniendo instancias previas...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] 2. Verificando Python...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Python no se encuentra instalado o en la variable PATH.
    echo Por favor, instala Python 3.12+ o ejecuta 'instalar.bat'.
    echo.
    pause
    goto MENU
)

echo [*] 3. Verificando Git...
where git >nul 2>&1
if !errorlevel! neq 0 (
    echo [WARNING] Git no fue encontrado. Algunas funciones de actualización no estarán disponibles.
)

echo [*] 4. Verificando estructura de carpetas necesarias...
if not exist "backups" mkdir backups
if not exist "backend\log" mkdir backend\log
if not exist "catalogo" mkdir catalogo

echo [*] 5. Verificando archivo de configuración (config.json)...
if not exist "backend\config.json" (
    echo     -- Creando config.json por defecto...
    (
        echo {
        echo     "excel_path": "Flyff.xlsx",
        echo     "flyff_path": "C:/FlyffUS/Flyff.exe",
        echo     "flyff_params": "",
        echo     "login_zones": []
        echo }
    ) > backend\config.json
)

echo [*] 6. Reconstruyendo/Reparando entorno virtual de Python (venv)...
if not exist "backend" (
    echo [ERROR] No se encontró la carpeta 'backend'.
    echo.
    pause
    goto MENU
)

cd backend
if not exist "venv" (
    echo     -- Creando entorno venv...
    python -m venv venv
)

echo [*] 7. Reinstalando todas las dependencias (pip install)...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
pip install --force-reinstall -r requirements.txt
cd /d "%~dp0"

echo.
echo ==========================================================
echo        ¡REPARACIÓN COMPLETADA CORRECTAMENTE!
echo ==========================================================
echo.
pause
goto MENU

:SALIR
exit /b
