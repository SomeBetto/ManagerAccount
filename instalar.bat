@echo off
title Instalar Manager Account - Flyff
setlocal enabledelayedexpansion

:: 1. Solicitar permisos de Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permisos de administrador para la instalacion...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~dpnx0\"' -Verb RunAs"
    exit /b
)

:: Regresar al directorio del script
cd /d "%~dp0"

echo ===================================================
echo   INSTALACION Y CONFIGURACION - MANAGER ACCOUNT
echo ===================================================
echo.

:: 2. Verificar Python
echo [*] Verificando instalacion de Python...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Python no detectado. Descargando instalador oficial...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.2/python-3.12.2-amd64.exe' -OutFile 'python-installer.exe'"
    
    echo [*] Instalando Python silenciosamente ^(espere un momento^)...
    start /wait "" python-installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python-installer.exe
    
    echo.
    echo [OK] Instalacion de Python completada.
    echo [!] POR FAVOR, CIERRA ESTA VENTANA Y VUELVE A EJECUTAR 'instalar.bat'.
    pause
    exit /b
)

:: 3. Verificar Git
echo [*] Verificando instalacion de Git...
where git >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Git no detectado. Descargando instalador desatendido...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe' -OutFile 'git-installer.exe'"
    
    echo [*] Instalando Git de forma desatendida...
    start /wait "" git-installer.exe /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS
    del git-installer.exe
    
    echo.
    echo [OK] Instalacion de Git completada.
    echo [!] POR FAVOR, CIERRA ESTA VENTANA Y VUELVE A EJECUTAR 'instalar.bat'.
    pause
    exit /b
)

:: 4. Preparar Entorno Virtual
echo [*] Configurando entorno virtual en la carpeta backend...
if not exist "backend" (
    echo [ERROR] No se encuentra la carpeta 'backend'. Asegurate de estar en la raiz del proyecto.
    pause
    exit /b
)

cd backend
if not exist "venv" (
    echo     -- Creando venv...
    python -m venv venv
)

echo [*] Instalando/Actualizando dependencias de Flask...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt

echo.
echo ===================================================
echo      ¡INSTALACION COMPLETADA CON EXITO!
echo ===================================================
echo.
echo Ahora puedes cerrar este script e iniciar la aplicacion
echo usando directamente 'ManagerAccount.bat'.
echo.
pause
exit /b
