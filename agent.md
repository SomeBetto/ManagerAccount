# Guía de Reglas para Desarrolladores y Agentes (Antigravity)

Este archivo contiene las reglas de arquitectura, convenciones e instrucciones especiales sobre cómo funciona y debe modificarse la aplicación **Manager Account - Flyff**.

---

## 1. Persistencia y Base de Datos (Excel)
- **Backend de Excel (`backend/app/excel_db.py`):**
  - Todo el almacenamiento persistente de cuentas, personajes y objetos se gestiona a través de un archivo `.xlsx` (Excel).
  - La ruta del archivo se almacena en el backend en `backend/config.json`.
  - El helper de Excel utiliza **openpyxl** y realiza un mapeo inteligente de cabeceras en inglés y español (por ejemplo, empareja tanto `Email` como `Cuenta` a la columna de correo).
  - **Caché en Memoria RAM (`_cache`):** Las consultas de lectura `get_all` utilizan una caché en memoria para ofrecer respuestas instantáneas (`0ms`). La caché se invalida de forma automática en cada operación de escritura (`insert`, `update`, `delete`, `restore_backup`).
  - **Normalización de IDs:** Las claves numéricas (`id`, `character_id`, `account_id`) se normalizan a números enteros (`int`) para prevenir discrepancias por flotantes de Excel (ej. `1.0` vs `'1'`).
  - **Copias de Seguridad Automáticas:** El sistema verifica al iniciar y ejecuta automáticamente una copia de seguridad estampada con fecha (`backup_YYYYMMDD_HHMMSS.xlsx`) en `backups/` si el último respaldo tiene más de 24 horas.

---

## 2. Catálogo Unificado y Reglas de Equipamiento
- **Directorio Único de Catálogos (`catalogo/`):**
  - Toda la información del catálogo oficial del juego reside exclusivamente en la carpeta raíz `catalogo/`:
    - `catalogo/flyff_catalog.json`: Catálogo completo de armas por clase, armaduras por clase, cosméticos/fashion, joyería y talismanes.
    - `catalogo/piercing_catalog.json`: Configuración y reglas para los 19 slots de equipamiento Flyff (incluyendo `talisman1` y `talisman2`).
  - **Prohibición de Duplicados:** No se deben crear carpetas secundarias como `backend/app/catalogo/` ni archivos JSON dispersos fuera del directorio oficial `catalogo/`.
- **Lógica de Refinado y Elementos:**
  - Anillos, pendientes, collares, capas y talismanes soportan refinados de upgrade de hasta **+20**.
  - El selector de **Upgrade de Elemento** (+1 a +20) se habilita dinámicamente al seleccionar un elemento activo (`Fuego`, `Agua`, `Tierra`, `Viento`, `Electricidad`) y se deshabilita cuando el tipo es `Ninguno`.

---

## 3. Registro Físico de Errores (Logging System)
- **Archivo de Registro (`backend/log/error.log`):**
  - Los errores del backend en Python se registran en un archivo físico en `backend/log/error.log` mediante un `RotatingFileHandler` rotativo.
  - **Filtro Exclusivo:** Registra **únicamente eventos de nivel `ERROR` y `CRITICAL`**.
- **Formato Estandarizado:**
  ```text
  [YYYY-MM-DD (Día) HH:MM:SS] | MÓDULO: <modulo> (<archivo.py> -> <función>) | ERROR: <mensaje>
  ```
  *Ejemplo:* `[2026-07-21 (Martes) 20:39:22] | MÓDULO: gear (gear.py -> submit_gear) | ERROR: Mensaje de error`
- **Manejador Global de Excepciones:** Las excepciones `500` no controladas se capturan automáticamente en Flask y se escriben al log físico con su respectivo informe de depuración.

---

## 4. Zonas de Logeo y Auto-Login
- **Sincronización mediante API Backend (`/api/config/login-zones`):**
  - Las Zonas de Logeo creadas por los usuarios se persisten en el servidor (`backend/config.json`), garantizando que todos los clientes conectados a la API compartan y visualicen las mismas zonas en tiempo real.
- **Implementación del Auto-Login (`backend/app/routes/accounts.py`):**
  - Utiliza la API nativa de Windows (mediante la librería `ctypes`) con `SendInput` en modo Unicode (`KEYEVENTF_UNICODE`) para simular la escritura de credenciales.
  - **Requisito de Privilegios:** El servidor debe ejecutarse con privilegios de Administrador (UAC) para inyectar eventos de teclado en el cliente de juego.
  - **Sincronización mediante Hook de Teclado:** Monitorea la tecla `Tab` usando `GetAsyncKeyState(0x09)` y espera su liberación física para iniciar la inyección de credenciales.
  - **Enfoque de Ventana:** Busca activamente la ventana de juego (que contenga `login` en su título), ignorando navegadores y consolas, y calcula su centro geográfico para enfocarla mediante un clic de ratón.

---

## 5. Temporizadores / Contadores
- **Terminología y UI ("Contadores"):**
  - La característica se denomina **Contadores** (singular: *Contador*, plural: *Contadores*) en toda la interfaz de usuario.
- **Persistencia y Alarmas:**
  - Se almacenan localmente en el navegador bajo la clave `contadores` de `localStorage`.
  - Las alarmas de respawn utilizan un sintetizador de audio dinámico basado en la **Web Audio API** (`playAlarmSound()`), generando tonos electrónicos bi-tono en tiempo real sin requerir archivos de audio externos.

---

## 6. Estilos, UX y Atajos de Teclado
- **Diseño Visual (`frontend/style.css`):**
  - Estética oscura premium HSL basada en Glassmorphism, acentos dorados (`--primary: #d4af37`), y clases CSS reutilizables para dropdowns de búsqueda (`.searchable-dropdown-panel`), chips y tarjetas de zonas.
- **Atajos Globales de Teclado:**
  - Presionar la tecla **`Escape`** en cualquier momento cierra automáticamente todos los modales abiertos y paneles desplegables activos.
- **Búsqueda Global de Inventario:**
  - El buscador de equipamiento consulta simultáneamente el inventario y ítems de todos los personajes, mostrando un panel superior con acceso directo a cada ranura e ítem.
