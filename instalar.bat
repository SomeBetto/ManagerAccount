@echo off
title Instalar Manager Account - Flyff
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Fijar el directorio del proyecto antes de cualquier elevacion.
cd /d "%~dp0"

if not exist "backend\requirements.txt" (
    echo [ERROR] No se encuentra backend\requirements.txt.
    echo Ejecuta este script desde la raiz del proyecto.
    pause
    exit /b 1
)

:: 1. Solicitar permisos de Administrador
net session >nul 2>&1
if errorlevel 1 (
    echo Solicitando permisos de administrador para la instalacion...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"%~dpnx0\"' -Verb RunAs"
    if errorlevel 1 (
        echo [ERROR] No se pudo solicitar permisos de administrador.
        pause
        exit /b 1
    )
    exit /b 0
)

echo ==========================================================
echo   INSTALACION Y CONFIGURACION - MANAGER ACCOUNT (FLYFF)
echo ==========================================================
echo.

:: 2. Verificar Python
echo [*] Verificando instalacion de Python...
python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 12) and sys.maxsize > 2**32 else 1)" >nul 2>&1
if errorlevel 1 (
    echo [!] Python no detectado. Descargando instalador oficial...
    set "PYTHON_INSTALLER=%TEMP%\manager-account-python-installer.exe"
    if exist "!PYTHON_INSTALLER!" del /q "!PYTHON_INSTALLER!"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.2/python-3.12.2-amd64.exe' -OutFile '!PYTHON_INSTALLER!'"
    if errorlevel 1 (
        echo [ERROR] No se pudo descargar Python.
        pause
        exit /b 1
    )
    if not exist "!PYTHON_INSTALLER!" (
        echo [ERROR] La descarga de Python no genero el instalador.
        pause
        exit /b 1
    )

    echo [*] Instalando Python silenciosamente - espere un momento...
    start /wait "" "!PYTHON_INSTALLER!" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    if errorlevel 1 (
        del /q "!PYTHON_INSTALLER!" >nul 2>&1
        echo [ERROR] La instalacion de Python fallo.
        pause
        exit /b 1
    )
    del /q "!PYTHON_INSTALLER!" >nul 2>&1

    echo.
    echo [OK] Instalacion de Python completada.
    echo [!] POR FAVOR, CIERRA ESTA VENTANA Y VUELVE A EJECUTAR 'instalar.bat'.
    pause
    exit /b 0
)

:: 3. Verificar Git
echo [*] Verificando instalacion de Git...
where git >nul 2>&1
if errorlevel 1 (
    echo [!] Git no detectado. Descargando instalador desatendido...
    set "GIT_INSTALLER=%TEMP%\manager-account-git-installer.exe"
    if exist "!GIT_INSTALLER!" del /q "!GIT_INSTALLER!"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe' -OutFile '!GIT_INSTALLER!'"
    if errorlevel 1 (
        echo [ERROR] No se pudo descargar Git.
        pause
        exit /b 1
    )
    if not exist "!GIT_INSTALLER!" (
        echo [ERROR] La descarga de Git no genero el instalador.
        pause
        exit /b 1
    )

    echo [*] Instalando Git de forma desatendida...
    start /wait "" "!GIT_INSTALLER!" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS
    if errorlevel 1 (
        del /q "!GIT_INSTALLER!" >nul 2>&1
        echo [ERROR] La instalacion de Git fallo.
        pause
        exit /b 1
    )
    del /q "!GIT_INSTALLER!" >nul 2>&1

    echo.
    echo [OK] Instalacion de Git completada.
    echo [!] POR FAVOR, CIERRA ESTA VENTANA Y VUELVE A EJECUTAR 'instalar.bat'.
    pause
    exit /b 0
)

:: 4. Preparar Entorno Virtual
echo [*] Configurando entorno virtual en la carpeta backend...
if not exist "backend" (
    echo [ERROR] No se encuentra la carpeta 'backend'. Asegurate de estar en la raiz del proyecto.
    pause
    exit /b 1
)

cd backend
if not exist "venv" (
    echo     -- Creando venv...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        pause
        exit /b 1
    )
)

if not exist "venv\Scripts\python.exe" (
    echo [ERROR] El entorno virtual no contiene venv\Scripts\python.exe.
    echo Elimina backend\venv y vuelve a ejecutar el instalador.
    pause
    exit /b 1
)

echo [*] Instalando/Actualizando dependencias de Flask...
venv\Scripts\python.exe -m pip install --upgrade pip
if errorlevel 1 (
    echo [ERROR] No se pudo actualizar pip dentro del entorno virtual.
    pause
    exit /b 1
)
venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] No se pudieron instalar las dependencias.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo         ¡INSTALACION COMPLETADA CON EXITO!
echo ==========================================================
echo.
echo Ahora puedes cerrar este script e iniciar la aplicacion
echo usando directamente 'ManagerAccount.bat'.
echo.
pause
exit /b
