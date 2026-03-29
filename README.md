# Manager Account - Flyff

**Manager Account** es una herramienta integral diseñada para gestionar cuentas y personajes del videojuego **Flyff**. Utiliza una base de datos basada en archivos Excel (.xlsx), lo que permite una gestión flexible y compatible con herramientas de hoja de cálculo externas.

## 🚀 Funcionalidades Principales

- **Gestión de Cuentas:** Almacena y organiza correos electrónicos, contraseñas y códigos PIN de seguridad.
- **Administración de Personajes:** Registra nombres, niveles, clases y tipos de personajes asociados a cada cuenta.
- **Control de Inventario:** Seguimiento de ítems importantes por personaje con descripciones detalladas.
- **Prioridades de Leveling:** Sistema para anotar y priorizar los objetivos de nivel de cada personaje.
- **Eventos Diarios:** Seguimiento de participación y progreso en eventos del juego.
- **Sistema de Cupones:** Registro de códigos promocionales y control de cuáles han sido canjeados por qué personaje.
- **Base de Datos Dinámica (Excel):**
    - Mapeo inteligente de cabeceras (detecta alias en español e inglés como "Cuenta", "Account", "Personaje", "Name", etc.).
    - Persistencia automática de datos en el archivo Excel configurado.
    - Soporte para fórmulas y VLOOKUPs en el Excel (lectura de valores evaluados).

## 🛠️ Requisitos del Sistema

Para utilizar esta aplicación, necesitas tener instalados los siguientes componentes:

- **Sistema Operativo:** Windows (recomendado por los scripts de automatización .bat).
- **Python 3.12+**: El lenguaje de programación base para el servidor.
- **Git**: Necesario para la descarga inicial y las actualizaciones automáticas del sistema.
- **Navegador Web**: Google Chrome, Microsoft Edge o cualquier navegador moderno.

## 📥 Instalación

El proyecto incluye un script de instalación automatizado que configura todo el entorno necesario:

1. Clona el repositorio o descarga los archivos en una carpeta.
2. Haz doble clic en el archivo `instalar.bat`.
3. El script verificará si tienes Python y Git instalados. Si no los tienes, los descargará e instalará por ti de forma silenciosa.
4. Se creará automáticamente un entorno virtual (`venv`) en la carpeta `backend` y se instalarán las dependencias necesarias.

## 📖 Modo de Uso

Una vez instalado, sigue estos pasos para iniciar la aplicación:

1. Ejecuta el archivo `ManagerAccount.bat`.
2. El script verificará si hay nuevas actualizaciones en el repositorio (requiere Git).
3. Se iniciará el servidor Flask localmente.
4. Tu navegador predeterminado se abrirá automáticamente en: `http://localhost:5000`.
5. **Configuración Inicial:** Al abrir la aplicación por primera vez, deberás seleccionar la ruta de tu archivo Excel de base de datos. Si no tienes uno, el sistema creará uno base con la estructura necesaria.

## 💻 Stack Tecnológico

- **Backend:** Python con el framework **Flask**.
- **Base de Datos:** **openpyxl** para la manipulación de archivos Excel (.xlsx).
- **Frontend:** HTML5, CSS3 (Vanilla) y JavaScript (Vanilla) para una interfaz ágil y moderna.
- **Automatización:** Scripts de procesamiento por lotes (Windows Batch).

---
*Desarrollado para la comunidad de Flyff. ¡Disfruta gestionando tus cuentas de forma eficiente!*
