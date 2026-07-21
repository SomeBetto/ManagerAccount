# Manager Account - Flyff

**Manager Account** es una herramienta integral diseñada para gestionar cuentas y personajes del videojuego **Flyff**. Utiliza una base de datos basada en archivos Excel (.xlsx), lo que permite una gestión flexible, persistente y compatible con herramientas de hoja de cálculo externas.

---

## 🚀 Funcionalidades Principales

### 🔑 Gestión y Automatización de Cuentas
- **Gestión de Cuentas y Credenciales:** Almacena y organiza correos electrónicos, contraseñas, códigos PIN y tokens OTP de seguridad.
- **Control de Cuentas Compartidas:** Módulo de etiquetas de disponibilidad (*Personal*, *Prestada*, *Compartida Gremio*), asignación de responsable (*Prestada a...*) y notas del equipo.
- **Auto-Login Inteligente (Windows Native):** 
    - Escribe automáticamente el correo y contraseña en la ventana de login del juego usando la API nativa `SendInput` (vía `ctypes`).
    - Detecta la ventana del juego de forma automática y espera a que el usuario presione y suelte la tecla `Tab` físicamente para iniciar la inyección de forma segura.
    - Requiere ejecutar el servidor como Administrador (UAC) para interactuar con la ventana del juego.
- **Zona de Logeo (Login Zone):** Organiza y asigna cuentas y personajes por computadoras o zonas de trabajo para un logeo masivo y ordenado.
- **Modo Compacto / Overlay:** Interfaz en ventana reducida diseñada para mantenerse superpuesta al cliente de juego para copiado/inyección rápida de credenciales.

### 🛡️ Gestión de Personajes, Equipamiento y Fashion
- **Administración de Personajes:** Registra nombres, niveles, clases, roles/tipos de personaje y estado de favoritos.
- **Gestor de Equipamiento y Fashion (*Gear & Build Tracker*):**
    - **Catálogo Oficial del Juego:** Selección de armas, armaduras, escudos, capas, joyería y prendas **Fashion/Cosméticas** (Cabeza, Torso, Guantes, Botas) utilizando listas desplegables (*combo boxes*) predefinidas con los ítems reales de Flyff.
    - **Controles de Upgrade:** Selección mediante combo box para niveles de refinado (`+0` a `+20`), atribución elemental (`Fuego`, `Agua`, etc.) y perforaciones/cartas (*piercings*).
    - **Buscador Cruzado:** Búsqueda instantánea para localizar en qué personaje está guardado o equipado cualquier ítem o pieza fashion.
- **Control de Inventario Cruzado:** Buscador global de objetos guardados entre todos los personajes.

### 📋 Productividad y Organización
- **Checklist de Rutinas Diarias y Semanales:** Panel interactivo de tareas diarias/semanales (instancias, cobro de login, Guild Siege) con reseteo automático diario por personaje.
- **Control de Expiración de Ítems Temporales:** Seguimiento de pases VIP (Azria/Coral), Mascotas (*Pickup Pets*) y pergaminos con indicadores de urgencia por color (Rojo: < 24h, Amarillo: < 3 días, Verde: Activo).
- **Contadores de Respawn con Alarma sintetizada:** Panel de temporizadores para jefes gigantes con alarmas sonoras dinámicas vía **Web Audio API**.
- **Herramientas Automáticas (Auto Tool):** Módulo con función **Auto Ress** para detectar y confirmar automáticamente la ventana de resurrección en el juego.
- **Prioridades de Leveling / Zona de Leveo:** Planificador de metas de nivel por personaje.
- **Eventos Diarios y Sistema de Cupones:** Registro y control de cupones canjeados por personaje.

### 💾 Almacenamiento y Seguridad
- **Base de Datos Dinámica (Excel):** Mapeo inteligente de cabeceras en inglés/español con persistencia directa en `.xlsx`.
- **Sistema de Copias de Seguridad (Backups):** Creación de respaldos manuales y automáticos fechados con panel de restauración directa en un clic desde la sección de Configuración.

---

## 🛠️ Requisitos del Sistema

- **Sistema Operativo:** Windows (recomendado por la API nativa de Auto-Login `ctypes`).
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
