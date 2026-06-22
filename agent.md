# Guía de Reglas para Desarrolladores y Agentes (Antigravity)

Este archivo contiene las reglas de arquitectura, convenciones e instrucciones especiales sobre cómo funciona y debe modificarse la aplicación **Manager Account - Flyff**.

---

## 1. Persistencia y Base de Datos (Excel)
- **Backend de Excel (`backend/app/excel_db.py`):**
  - Todo el almacenamiento persistente de cuentas, personajes y objetos se gestiona a través de un archivo `.xlsx` (Excel).
  - La ruta del archivo se almacena en el backend en `backend/config.json`.
  - El helper de Excel utiliza **openpyxl** y realiza un mapeo inteligente de cabeceras en inglés y español (por ejemplo, empareja tanto `Email` como `Cuenta` a la columna de correo).
  - **Importante:** Cualquier inserción, actualización o eliminación debe persistir de inmediato en las hojas de cálculo correspondientes sin corromper fórmulas o formatos preexistentes.

---

## 2. Lógica del Auto-Login (Escritura Automática)
- **Implementación del Backend (`backend/app/routes/accounts.py`):**
  - Utiliza la API nativa de Windows (mediante la librería `ctypes`) con `SendInput` en modo Unicode (`KEYEVENTF_UNICODE`) para simular la escritura de credenciales.
  - **Requisito de Privilegios:** Dado que interactúa con ventanas del sistema operativo, el servidor debe ejecutarse con privilegios de Administrador (UAC) para poder inyectar eventos de teclado en la ventana del cliente de juego de Flyff.
  - **Sincronización mediante Hook de Teclado:**
    - Para iniciar el autocompletado de forma natural, el servidor inicia un hilo secundario y monitorea el estado físico de la tecla `Tab` usando `GetAsyncKeyState(0x09)`.
    - La escritura no empieza hasta que se detecta que el usuario ha pulsado `Tab` y lo ha **soltado** por completo (bucle de espera de liberación).
    - Esto previene conflictos entre la pulsación física del usuario y las pulsaciones virtuales enviadas por el sistema.
  - **Enfoque de Ventana:**
    - El backend busca activamente una ventana activa que contenga la palabra `login` (o `LOGIN`) en su título o clase de ventana.
    - Se ignoran las ventanas de navegadores comunes (como Chrome, Firefox, Edge, Opera) y consolas (como powershell.exe, cmd.exe, conhost.exe, devenv.exe, py.exe, python.exe) para evitar inyectar credenciales en el lugar equivocado.
    - Una vez hallada la ventana de login, se calcula su centro geográfico y se emula un clic de mouse izquierdo físico para asegurar el enfoque de la ventana antes de escribir las credenciales (Email, Tabulador, Contraseña, Enter).

---

## 3. Temporizadores / Contadores
- **Terminología y UI ("Contadores"):**
  - La característica se denomina **Contadores** (singular: *Contador*, plural: *Contadores*) en toda la interfaz de usuario, sidebar, títulos y diálogos. No se debe usar el término "Boss Timers" de cara al usuario.
- **Persistencia en Frontend (`frontend/app.js`):**
  - Se almacenan localmente en el navegador bajo la clave `contadores` de `localStorage`.
  - **Migración de Datos:** Existe una rutina de compatibilidad que importa datos del antiguo key `bossTimers` si existe, los guarda bajo `contadores` y borra el key antiguo automáticamente para preservar la configuración del usuario.
  - **Botón de Restaurar Defectos:** En la barra superior de la sección de Contadores existe una opción `Restaurar Defectos` (`restoreDefaultContadores()`) que recrea los temporizadores iniciales de jefes gigantes si han sido eliminados, sin sobreescribir los personalizados creados por el usuario.
  - **Eliminación Habilitada:** Todos los contadores (por defecto o personalizados) muestran el botón de papelera y pueden ser eliminados en cualquier momento por el usuario.
- **Generación de Alarma de Audio:**
  - No se utilizan archivos de audio externos (como `.mp3` o `.wav`).
  - Las alarmas de respawn usan un sintetizador dinámico basado en la **Web Audio API** (`playAlarmSound()`), el cual genera tonos electrónicos bi-tono en tiempo real directamente desde el navegador.

---

## 4. Estilos y Estructura CSS
- **Clases del CSS (`frontend/style.css`):**
  - Los contadores utilizan las clases `.contador-card` y `.contador-card-footer`.
  - Para asegurar la compatibilidad con componentes previos o cachés, se conservan las clases `.boss-card` y `.boss-card-footer` heredando las mismas reglas de diseño.
- **Diseño Visual:**
  - El frontend utiliza una estética premium oscura basada en HSL, bordes semitransparentes (Glassmorphism), acentos dorados/ámbar (`--primary: #d4af37`), y animaciones de advertencia parpadeantes en color rojo/naranja (`.timer-warning`) cuando el contador llega a cero.
