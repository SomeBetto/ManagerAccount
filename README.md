# Manager Account - Flyff

**Manager Account** es una herramienta integral diseñada para gestionar cuentas, personajes, inventario y automatización del videojuego **Flyff**. Utiliza una base de datos dinámica basada en archivos Excel (.xlsx) combinada con una caché inteligente en memoria RAM, ofreciendo un rendimiento ultrarrápido y compatibilidad total con hojas de cálculo.

---

## 🚀 Funcionalidades Principales

### 🔑 Gestión y Automatización de Cuentas
- **Gestión de Cuentas y Credenciales:** Almacena y organiza correos electrónicos, contraseñas, códigos PIN y tokens OTP de seguridad.
- **Control de Cuentas Compartidas:** Módulo de etiquetas de disponibilidad (*Personal*, *Prestada*, *Compartida Gremio*), asignación de responsable (*Prestada a...*) y notas del equipo.
- **Auto-Login Inteligente (Windows Native):** 
    - Escribe automáticamente el correo y contraseña en la ventana de login del juego usando la API nativa `SendInput` (vía `ctypes`).
    - Detecta la ventana del juego de forma automática y espera a que el usuario presione y suelte la tecla `Tab` físicamente para iniciar la inyección de forma segura.
    - Requiere ejecutar el servidor como Administrador (UAC) para interactuar con la ventana del juego.
- **Zona de Logeo Sincronizada (Login Zones):** Organiza y asigna cuentas y personajes por computadoras o zonas de trabajo para un logeo masivo y ordenado, persistido en el servidor backend (`/api/config/login-zones`).
- **Modo Compacto / Overlay:** Interfaz en ventana reducida diseñada para mantenerse superpuesta al cliente de juego para copiado/inyección rápida de credenciales.

### 🛡️ Gestión de Personajes, Equipamiento y Catálogo Unificado
- **Administración de Personajes:** Registra nombres, niveles, clases, roles/tipos de personaje y estado de favoritos.
- **Gestor de Equipamiento y Fashion (*Gear & Build Tracker*):**
    - **Catálogo Oficial Unificado (`catalogo/`):** Selección de armas por clase, armaduras por clase, capas, joyería y prendas **Fashion/Cosméticas** (Cabeza, Torso, Guantes, Botas) utilizando listas desplegables (*combo boxes*) predefinidas con los ítems reales de Flyff.
    - **Ranuras Especiales:** Soporte completo para los 19 slots de equipamiento oficial, incluyendo `talisman1` (izquierda de Anillo 1) y `talisman2` (derecha de Anillo 2).
    - **Controles de Upgrade:** Refinados de upgrade (`+0` a `+20`), atribución elemental (`Fuego`, `Agua`, `Tierra`, `Viento`, `Electricidad`) con habilitación dinámica y perforaciones/cartas (*piercings*).
- **Búsqueda Global de Inventario en Tiempo Real:** 
    - Buscador global cruzado que localiza al instante en qué personaje o alijo está guardado o equipado cualquier ítem, ranura, elemento o refinado.
    - Panel interactivo con acceso en 1-clic a la ranura e inventario del personaje.

### 📋 Productividad y Organización
- **Checklist de Rutinas Diarias y Semanales:** Panel interactivo de tareas diarias/semanales (instancias, cobro de login, Guild Siege) con reseteo automático diario por personaje.
- **Control de Expiración de Ítems Temporales:** Seguimiento de pases VIP (Azria/Coral), Mascotas (*Pickup Pets*) y pergaminos con selector dinámico de personaje y alertas por color (Rojo: < 24h, Amarillo: < 3 días, Verde: Activo).
- **Contadores de Respawn con Alarma sintetizada:** Panel de temporizadores para jefes gigantes con alarmas sonoras dinámicas vía **Web Audio API**.
- **Herramientas Automáticas (Auto Tool):** Módulo con función **Auto Ress** para detectar y confirmar automáticamente la ventana de resurrección en el juego.
- **Prioridades de Leveling / Zona de Leveo:** Planificador de metas de nivel por personaje.
- **Eventos Diarios y Sistema de Cupones:** Registro y control de cupones canjeados por personaje.

### 💾 Almacenamiento, Rendimiento y Seguridad
- **Base de Datos Dinámica (Excel + Caché RAM):** Mapeo inteligente de cabeceras en inglés/español con lectura en memoria ultrarrápida (`0ms`) e invalidación automática al escribir.
- **Copias de Seguridad Automáticas (Auto-Backups):** Generación automática diaria de respaldos fechados (`backup_YYYYMMDD_HHMMSS.xlsx`) en la carpeta `backups/` con panel de restauración directa desde la vista de Configuración.
- **Registro Físico de Errores (`backend/log/error.log`):** Sistema de logging exclusivo para errores con fecha, día de la semana, hora, nombre de módulo y captura global de excepciones 500.
- **Atajos de Teclado UX:** Cierre inmediato de modales y menús desplegables mediante la tecla **`Escape`**.

---

## 🛠️ Requisitos del Sistema

- **Sistema Operativo:** Windows (recomendado para la API nativa de Auto-Login `ctypes`).
- **Python 3.12+**: Lenguaje base para el servidor backend Flask.
- **Git**: Para descarga y actualizaciones del proyecto.
- **Navegador Web**: Chrome, Edge o cualquier navegador moderno.

---

## 📥 Instalación y Uso

1. Ejecuta el archivo `instalar.bat` para configurar Python, Git y el entorno virtual (`venv`).
2. Inicia la aplicación mediante `ManagerAccount.bat`.
3. El navegador abrirá automáticamente `http://localhost:5000`.

---

*Desarrollado para la comunidad de Flyff. ¡Gestiona tus cuentas y personajes de forma eficiente!*
