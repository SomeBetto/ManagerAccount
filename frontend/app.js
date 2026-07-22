const API_URL = '/api';

let currentView = 'dashboard';
let accounts = [];
let characters = [];
let items = [];
let selectedAccountIds = new Set();
let autotoolInterval = null;

// i18n
let currentLang = localStorage.getItem('appLang') || 'en';
const translations = {
    en: {
        // Sidebar
        sidebar_dashboard: "Dashboard",
        sidebar_accounts: "Accounts",
        sidebar_characters: "Characters",
        sidebar_favorites: "Favorites",
        sidebar_loginzone: "Login Zone",
        sidebar_items: "Important Items",
        sidebar_vacantes: "Vacantes",
        sidebar_levelzone: "Leveling Zone",
        sidebar_dailyevent: "Daily Events",
        sidebar_coupons: "Coupons",
        sidebar_contadores: "Counters",
        sidebar_gear: "Gear",
        menu_accounts_chars: "Accounts & Chars",
        menu_equipment: "Equipment & Items",
        menu_leveling_activities: "Leveling & Activities",
        menu_tools: "Tools & Extras",
        page_title_contadores: "Counters",
        // General UI
        btn_add_account: "New Account",
        btn_add_character: "New Character",
        btn_upload: "Upload Excel",
        btn_settings: "Settings",
        page_title_accounts: "Accounts",
        page_title_characters: "Characters",
        page_title_favorites: "Favorites",
        page_title_loginzone: "Login Zone",
        page_title_items: "Important Items",
        btn_new_zone: "New Zone",
        modal_new_login_zone: "New Login Zone",
        label_zone_name: "Computer / Zone Name",
        page_title_vacantes: "Vacantes",
        page_title_levelzone: "Leveling Zone",
        page_title_dailyevent: "Daily Events",
        page_title_coupons: "Coupons",
        // Forms & Modals
        modal_save: "Save",
        btn_browse: "Browse",
        btn_create_new: "Create New",
        modal_cancel: "Cancel",
        modal_close: "Close",
        modal_delete_confirm: "Are you sure you want to delete this?",
        // Coupons
        coupon_new: "New Coupon",
        coupon_code: "Code",
        coupon_redeem: "Redeem",
        coupon_history: "History",
        coupon_step1: "Step 1: Select Account",
        coupon_step2: "Step 2: Select Character",
        coupon_skip: "Skip this Account",
        coupon_redeemed_by: "Redeemed By",
        coupon_no_chars: "This account has no characters.",
        // Settings
        settings_title: "Settings",
        settings_db_path: "Excel Database Path",
        settings_db_help: "Absolute path to the .xlsx file. The system will create missing sheets.",
        settings_threshold: "Level Threshold (+/-)",
        settings_threshold_help: "Used when filtering by 'Target Level'.",
        settings_char_types: "Character Types",
        settings_lang: "Language",
        settings_lang_en: "English",
        settings_lang_es: "Spanish",
        // Character/Account fields
        field_id: "ID",
        field_pin: "PIN",
        field_pass: "Pass",
        field_otp: "OTP Token",
        field_class: "Class",
        field_level: "Level",
        field_owner: "Owner",
        field_account: "Account",
        field_desc: "Description",
        field_date: "Date",
        // Actions
        action_copy_email: "Copy Email",
        action_copy_pin: "Copy PIN",
        action_copy_pass: "Copy Pass",
        action_copy_otp: "Copy OTP Token",
        action_toggle_pin: "Toggle PIN",
        action_toggle_pass: "Toggle Pass",
        action_toggle_otp: "Toggle OTP Token",
        action_redeem_here: "Click to Redeem Here",
        action_history: "Redemption History",
        // Vacantes
        vacantes_empty: "No slot data for these characters.",
        // LevelZone
        levelzone_queue: "Leveling Queue",
        levelzone_add: "Add to LevelZone",
        levelzone_high: "High",
        levelzone_medium: "Medium",
        levelzone_low: "Low",
        field_desc_empty: "No description provided.",
        // Notifications & Alerts
        msg_added_success: "Added successfully.",
        msg_updated_success: "Updated successfully.",
        msg_deleted_success: "Deleted successfully.",
        msg_error: "An error occurred. Check console.",
        msg_confirm_delete: "Are you sure you want to delete this item?",
        msg_redeem_success: "Coupon redeemed successfully!",
        msg_redeem_confirm: "Redeem coupon for character \"{name}\"?",
        msg_skip_confirm: "Mark this account as \"Skipped\" for this coupon? It will no longer appear as pending.",
        msg_skip_success: "Account skipped successfully.",
        msg_copy_success: "Copied to clipboard.",
        msg_no_redemptions: "No redemptions found.",
        msg_save_config_success: "Settings saved. Page will reload.",
        coupon_skip_help: "If you don't want to redeem this coupon for any character in this account, you can skip it.",
        coupon_delete_confirm: "Delete this coupon? Redemption history will remain but the coupon selection will be removed from the list.",
        msg_fetch_error: "Error loading data from server.",
        btn_edit_account: "Edit Account",
        kpi_accounts: "Total Accounts",
        kpi_characters: "Total Characters",
        kpi_vacantes: "Vacant Accounts",
        kpi_leveling: "Leveling Queue",
        kpi_timers: "Active Counters",
        chart_classes: "Class Distribution",
        chart_roles: "Character Roles",
        chart_levels: "Level Ranges",
        sidebar_autotool: "Auto Tool",
        autotool_card_autoress: "Auto Ress",
        autotool_card_autoress_desc: "Detects the Resurrection Confirm Window in open game instances and automatically clicks Accept.",
        autotool_card_coming_soon: "Coming Soon",
        autotool_card_autopot: "Auto Pot",
        autotool_card_autopot_desc: "Automatically uses HP/MP potions when health drops below a configured threshold.",
        autotool_card_autobuff: "Auto Buff",
        autotool_card_autobuff_desc: "Automatically keeps buffs active on your character and party members."
    },
    es: {
        // Sidebar
        sidebar_dashboard: "Panel de Control",
        sidebar_accounts: "Cuentas",
        sidebar_characters: "Personajes",
        sidebar_favorites: "Favoritos",
        sidebar_loginzone: "Zona de Logeo",
        sidebar_items: "Objetos Importantes",
        sidebar_vacantes: "Vacantes",
        sidebar_levelzone: "Zona de Leveo",
        sidebar_dailyevent: "Eventos Diarios",
        sidebar_coupons: "Cupones",
        sidebar_contadores: "Contadores",
        sidebar_gear: "Equipamiento",
        menu_accounts_chars: "Cuentas & Personajes",
        menu_equipment: "Equipamiento & Ítems",
        menu_leveling_activities: "Leveo & Eventos",
        menu_tools: "Herramientas & Extras",
        page_title_contadores: "Contadores",
        // General UI
        btn_add_account: "Nueva Cuenta",
        btn_add_character: "Nuevo Personaje",
        btn_upload: "Subir Excel",
        btn_settings: "Configuración",
        page_title_accounts: "Cuentas",
        page_title_characters: "Personajes",
        page_title_favorites: "Favoritos",
        page_title_loginzone: "Zona de Logeo",
        page_title_items: "Objetos Importantes",
        btn_new_zone: "Nueva Zona",
        modal_new_login_zone: "Nueva Zona de Logeo",
        label_zone_name: "Nombre de la Computadora / Zona",
        page_title_vacantes: "Vacantes",
        page_title_levelzone: "Zona de Leveo",
        page_title_dailyevent: "Eventos Diarios",
        page_title_coupons: "Cupones",
        // Forms & Modals
        modal_save: "Guardar",
        btn_browse: "Buscar",
        btn_create_new: "Crear Nuevo",
        modal_cancel: "Cancelar",
        modal_close: "Cerrar",
        modal_delete_confirm: "¿Estás seguro de que quieres eliminar esto?",
        // Coupons
        coupon_new: "Nuevo Cupón",
        coupon_code: "Código",
        coupon_redeem: "Canjear",
        coupon_history: "Historial",
        coupon_step1: "Paso 1: Seleccionar Cuenta",
        coupon_step2: "Paso 2: Seleccionar Personaje",
        coupon_skip: "Omitir para esta Cuenta",
        coupon_redeemed_by: "Canjeado por",
        coupon_no_chars: "Esta cuenta no tiene personajes.",
        // Settings
        settings_title: "Configuración",
        settings_db_path: "Ruta de Base de Datos Excel",
        settings_db_help: "Ruta absoluta al archivo .xlsx. El sistema creará las pestañas faltantes.",
        settings_threshold: "Margen de Nivel (+/-)",
        settings_threshold_help: "Usado al filtrar por 'Nivel Objetivo'.",
        settings_char_types: "Tipos de Personaje",
        settings_lang: "Idioma",
        settings_lang_en: "Inglés",
        settings_lang_es: "Español",
        btn_browse: "Buscar",
        // Character/Account fields
        field_id: "ID",
        field_pin: "PIN",
        field_pass: "Contraseña",
        field_otp: "OTP Token",
        field_class: "Clase",
        field_level: "Nivel",
        field_owner: "Dueño",
        field_account: "Cuenta",
        field_desc: "Descripción",
        field_date: "Fecha",
        // Actions
        action_copy_email: "Copiar Correo",
        action_copy_pin: "Copiar PIN",
        action_copy_pass: "Copiar Contraseña",
        action_copy_otp: "Copiar OTP Token",
        action_toggle_pin: "Ver/Ocultar PIN",
        action_toggle_pass: "Ver/Ocultar Contraseña",
        action_toggle_otp: "Ver/Ocultar OTP Token",
        action_redeem_here: "Clic para Canjear Aquí",
        action_history: "Historial de Canje",
        // Vacantes
        vacantes_empty: "No hay datos de ranuras para estos personajes.",
        // LevelZone
        levelzone_queue: "Cola de Leveo",
        levelzone_add: "Añadir a Zona de Leveo",
        levelzone_high: "Alta",
        levelzone_medium: "Media",
        levelzone_low: "Baja",
        field_desc_empty: "Sin descripción proporcionada.",
        // Notifications & Alerts
        msg_added_success: "Añadido con éxito.",
        msg_updated_success: "Actualizado con éxito.",
        msg_deleted_success: "Eliminado con éxito.",
        msg_error: "Ocurrió un error. Revisa la consola.",
        msg_confirm_delete: "¿Estás seguro de que quieres eliminar este elemento?",
        msg_redeem_success: "¡Cupón canjeado con éxito!",
        msg_redeem_confirm: "¿Canjear cupón para el personaje \"{name}\"?",
        msg_skip_confirm: "¿Marcar esta cuenta como \"Omitida\" para este cupón? Ya no aparecerá como pendiente.",
        msg_skip_success: "Cuenta omitida con éxito.",
        msg_copy_success: "Copiado al portapapeles.",
        msg_no_redemptions: "No se encontraron canjes.",
        msg_save_config_success: "Configuración guardada. La página se recargará.",
        coupon_skip_help: "Si no quieres canjear este cupón para ningún personaje de esta cuenta, puedes omitirlo.",
        coupon_delete_confirm: "¿Eliminar este cupón? El histórico de canjes se mantendrá, pero el cupón ya no aparecerá en la lista para nuevos canjes.",
        msg_fetch_error: "Error al cargar datos del servidor.",
        btn_edit_account: "Editar Cuenta",
        kpi_accounts: "Total Cuentas",
        kpi_characters: "Total Personajes",
        kpi_vacantes: "Cuentas con Vacante",
        kpi_leveling: "Cola de Leveo",
        kpi_timers: "Contadores Activos",
        chart_classes: "Distribución de Clases",
        chart_roles: "Roles de Personaje",
        chart_levels: "Rango de Niveles",
        sidebar_autotool: "Auto Tool",
        autotool_card_autoress: "Auto Ress",
        autotool_card_autoress_desc: "Detecta la ventana de confirmación de resurrección en las instancias de juego abiertas y hace clic automáticamente en Aceptar.",
        autotool_card_coming_soon: "Próximamente",
        autotool_card_autopot: "Auto Poción",
        autotool_card_autopot_desc: "Usa automáticamente pociones de HP/MP cuando la vida cae por debajo del umbral configurado.",
        autotool_card_autobuff: "Auto Buff",
        autotool_card_autobuff_desc: "Mantiene los buffs activos en tu personaje y miembros del grupo de forma automática."
    }
};

function i18n(key, params = {}) {
    let text = translations[currentLang][key] || key;
    for (const [p, val] of Object.entries(params)) {
        text = text.replace(`{${p}}`, val);
    }
    return text;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    applyTranslations();
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = i18n(key);
        if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'password' || el.type === 'number')) {
            el.placeholder = text;
        } else {
            el.innerText = text;
        }
    });

    const langSelect = document.getElementById('config-lang');
    if (langSelect) langSelect.value = currentLang;

    // Update dynamic titles if needed
    switchView(currentView);
}

// DOM Elements
const dashboardView = document.getElementById('dashboard-view');
const accountsView = document.getElementById('accounts-view');
const charactersView = document.getElementById('characters-view');
const modal = document.getElementById('item-modal');
const form = document.getElementById('item-form');
const modalTitle = document.getElementById('modal-title');
const pageTitle = document.getElementById('page-title');
const accountCount = document.getElementById('account-count'); // Placeholder if needed globally
const levelZoneView = document.getElementById('levelzone-view');
const dailyEventView = document.getElementById('dailyevent-view');
const favoritesView = document.getElementById('favorites-view');
const loginZoneView = document.getElementById('loginzone-view');
const itemsView = document.getElementById('items-view');
const vacantesView = document.getElementById('vacantes-view');
const couponsView = document.getElementById('coupons-view');
const contadoresView = document.getElementById('contadores-view');
const autotoolView = document.getElementById('autotool-view');

let loginZones = [];
let coupons = [];
let activeCouponId = null;
let redemptionStep = 'coupons'; // 'coupons', 'accounts', 'characters'
let selectedRedeemAccountId = null;

// Init
let dbPath = '';
let flyffPath = '';
let flyffParams = '';

async function fetchConfig() {
    try {
        const res = await fetch(`${API_URL}/config/db-path`);
        const data = await res.json();
        dbPath = data.path || '';
    } catch (e) { console.error(e); }

    try {
        const res = await fetch(`${API_URL}/config/flyff`);
        const data = await res.json();
        flyffPath = data.flyff_path || '';
        flyffParams = data.flyff_params || '';
    } catch (e) { console.error(e); }
}

// Initialize Timer Engine when document loads
document.addEventListener('DOMContentLoaded', () => {
    loadContadores();
    startTimerEngine();
    fetchConfig().then(async () => {
        await fetchAccounts();
        await fetchCharacters();
        applyTranslations();
        initSidebar();
    });
    updateTypeOptions();
});

function initSidebar() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        document.querySelector('.sidebar').classList.add('collapsed');
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// Navigation & Submenu Accordion
function toggleNavGroup(headerEl) {
    const group = headerEl.closest('.nav-group');
    if (group) {
        group.classList.toggle('expanded');
    }
}

function switchView(view) {
    if (autotoolInterval) {
        clearInterval(autotoolInterval);
        autotoolInterval = null;
    }
    currentView = view;
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const clickedLi = document.querySelector(`.nav-links li[data-view="${view}"]`) || document.querySelector(`.nav-links li[onclick="switchView('${view}')"]`);
    if (clickedLi) {
        clickedLi.classList.add('active');
        const parentGroup = clickedLi.closest('.nav-group');
        if (parentGroup) {
            parentGroup.classList.add('expanded');
        }
    }

    // Remove active from all view sections
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));

    if (view === 'dashboard') {
        if (dashboardView) dashboardView.classList.add('active');
        pageTitle.innerHTML = i18n('sidebar_dashboard');
        // Fetch queue and render stats
        fetchLevelQueue().then(() => renderDashboard());
    } else if (view === 'accounts') {
        accountsView.classList.add('active');
        pageTitle.innerHTML = `${i18n('page_title_accounts')} <span id="account-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${accounts.length})</span>`;
        const searchInput = document.getElementById('account-search-input');
        if (searchInput) {
            searchInput.value = '';
            checkSearchClearButton('account-search-input');
        }
        fetchAccounts();
    } else if (view === 'characters') {
        charactersView.classList.add('active');
        pageTitle.innerHTML = `${i18n('page_title_characters')} <span id="char-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${characters.length})</span>`;
        fetchAccounts().then(() => fetchCharacters());
    } else if (view === 'favorites') {
        if (favoritesView) favoritesView.classList.add('active');
        pageTitle.innerHTML = `${i18n('page_title_favorites')} <span id="fav-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(0)</span>`;
        fetchAccounts().then(() => fetchCharacters());
    } else if (view === 'loginzone') {
        if (loginZoneView) loginZoneView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_loginzone');
        fetchAccounts().then(() => fetchCharacters().then(() => renderLoginZones()));
    } else if (view === 'items') {
        if (itemsView) itemsView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_items');
        fetchCharacters().then(() => fetchItems());
    } else if (view === 'vacantes') {
        if (vacantesView) vacantesView.classList.add('active');
        pageTitle.innerHTML = `${i18n('page_title_vacantes')} <span id="vacantes-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(0)</span>`;
        fetchAccounts().then(() => fetchCharacters().then(() => renderVacantes()));
    } else if (view === 'levelzone') {
        if (levelZoneView) levelZoneView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_levelzone');
        fetchLevelQueue();
    } else if (view === 'dailyevent') {
        if (dailyEventView) dailyEventView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_dailyevent');
        fetchDailyEvents();
    } else if (view === 'coupons') {
        if (couponsView) couponsView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_coupons');
        // Ensure data exists before starting flow
        fetchAccounts().then(() => fetchCharacters().then(() => resetCouponFlow()));
    } else if (view === 'contadores') {
        if (contadoresView) contadoresView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_contadores');
        renderContadores();
    } else if (view === 'autotool') {
        if (autotoolView) autotoolView.classList.add('active');
        pageTitle.innerHTML = i18n('sidebar_autotool');
        fetchAutoToolStatus();
        autotoolInterval = setInterval(fetchAutoToolStatus, 2000);
    } else if (view === 'gear') {
        const gearView = document.getElementById('gear-view');
        if (gearView) gearView.classList.add('active');
        pageTitle.innerHTML = i18n('sidebar_gear') || 'Equipamiento';
        fetchGearData();
    } else if (view === 'routines') {
        const routinesView = document.getElementById('routines-view');
        if (routinesView) routinesView.classList.add('active');
        pageTitle.innerHTML = i18n('sidebar_routines') || 'Rutinas Diarias';
        fetchRoutinesData();
    } else if (view === 'expiring') {
        const expiringView = document.getElementById('expiring-view');
        if (expiringView) expiringView.classList.add('active');
        pageTitle.innerHTML = i18n('sidebar_expiring') || 'Ítems por Expire';
        fetchExpiringData();
    }
    updateHeaderButtons(view);
}

function updateHeaderButtons(view) {
    const accUpload = document.getElementById('btn-upload-accounts');
    const charUpload = document.getElementById('btn-upload-characters');
    const launchBtn = document.getElementById('btn-launch-selected');

    if (view === 'accounts') {
        if (accUpload) accUpload.style.display = 'inline-flex';
        if (charUpload) charUpload.style.display = 'none';
        if (launchBtn) launchBtn.style.display = selectedAccountIds.size > 0 ? 'inline-flex' : 'none';
    } else {
        if (accUpload) accUpload.style.display = 'none';
        if (charUpload) charUpload.style.display = 'inline-flex';
        if (launchBtn) launchBtn.style.display = 'none';
    }
}

// API Calls
async function fetchAccounts() {
    try {
        const res = await fetch(`${API_URL}/accounts`);
        if (res.ok) {
            accounts = await res.json();
            renderAccounts();
            updateFilterOptions();
            if (currentView === 'vacantes') renderVacantes();
            if (currentView === 'dashboard') renderDashboard();
        } else {
            console.warn("Error fetching accounts:", await res.json());
            accounts = [];
        }
    } catch (e) { console.error(e); accounts = []; }
}

function syncCharacterTypesWithDatabase() {
    let updated = false;
    characters.forEach(c => {
        if (c.char_type && typeof c.char_type === 'string') {
            const val = c.char_type.trim();
            if (val && !charTypes.includes(val)) {
                charTypes.push(val);
                updated = true;
            }
        }
    });
    if (updated) {
        localStorage.setItem('charTypes', JSON.stringify(charTypes));
        updateTypeOptions();
        renderTypesConfig();
    }
}

async function fetchCharacters() {
    try {
        const res = await fetch(`${API_URL}/characters`);
        if (res.ok) {
            characters = await res.json();
            syncCharacterTypesWithDatabase();
            renderCharacters();
            if (currentView === 'vacantes') renderVacantes();
            if (currentView === 'dashboard') renderDashboard();
        } else {
            console.warn("Error fetching characters:", await res.json());
            characters = [];
        }
    } catch (e) { console.error(e); characters = []; }
}

async function fetchItems() {
    try {
        const res = await fetch(`${API_URL}/items`);
        if (res.ok) {
            items = await res.json();
            renderItems();
        } else {
            console.warn("Error fetching items:", await res.json());
            items = [];
        }
    } catch (e) { console.error(e); items = []; }
}

// Rendering
function renderItems() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;

    const searchVal = document.getElementById('item-search-input')?.value.toLowerCase().trim() || '';

    let filteredItems = [...items];
    if (searchVal) {
        filteredItems = filteredItems.filter(item => {
            const char = characters.find(c => c.id === parseInt(item.character_id));
            const charName = char ? char.name.toLowerCase() : '';
            const itemName = (item.name || '').toLowerCase();
            const itemType = (item.item_type || '').toLowerCase();
            const itemDesc = (item.description || '').toLowerCase();

            return itemName.includes(searchVal) ||
                itemType.includes(searchVal) ||
                itemDesc.includes(searchVal) ||
                charName.includes(searchVal);
        });
    }

    grid.innerHTML = filteredItems.map(item => {
        const char = characters.find(c => c.id === parseInt(item.character_id));
        const charName = char ? char.name : 'Unknown';

        return `
        <div class="card">
            <div class="card-bar" style="display:flex; justify-content:flex-end; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div class="card-actions" style="opacity:1;">
                    <button class="icon-btn" onclick="openModal('item', ${item.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteItem('items', ${item.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-header" style="padding-top:0; margin-bottom:0.5rem;">
                <div class="card-title" style="word-break:break-all;">${item.name}</div>
            </div>
            <div class="card-content">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="opacity:0.6; font-size:0.8rem;">Type</span>
                    <span class="badge" style="background:var(--primary); color:white;">${item.item_type || 'Misc'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="opacity:0.6; font-size:0.8rem;">${i18n('field_owner')}</span>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="openCharInfoModal(${item.character_id})"><i class="fa-solid fa-user"></i> ${charName}</button>
                </div>
                <div style="margin-top:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0; font-size:0.9rem; font-style:italic; opacity:0.9;">${item.description || i18n('field_desc_empty')}</p>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function renderAccounts() {
    const countEl = document.getElementById('account-count');
    if (countEl) countEl.innerText = `(${accounts.length})`;

    const searchVal = document.getElementById('account-search-input')?.value.toLowerCase().trim() || '';

    let filteredAccounts = [...accounts];
    if (searchVal) {
        filteredAccounts = filteredAccounts.filter(acc => (acc.email || '').toLowerCase().includes(searchVal));
    }

    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = filteredAccounts.map(acc => {
        const isSelected = selectedAccountIds.has(acc.id);
        const borderStyle = isSelected ? 'border: 1px solid var(--primary);' : '';

        return `
        <div class="card" style="${borderStyle}; cursor:pointer;" onclick="openAccountDetailsModal(${acc.id})">
            <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div onclick="event.stopPropagation()">
                    <input type="checkbox" onchange="toggleAccountSelection(${acc.id})" ${isSelected ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:var(--primary);">
                </div>
                <div class="card-actions" style="opacity:1;" onclick="event.stopPropagation()">
                    <button class="icon-btn" onclick="openModal('account', ${acc.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteItem('accounts', ${acc.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-header" style="padding-top:0; margin-bottom:0.5rem;">
                <div class="card-title" style="word-break:break-all;">
                    ${acc.email}
                </div>
            </div>
            <div class="card-content">
                <p>${i18n('field_id')} <span class="value">#${acc.id}</span></p>
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;" onclick="event.stopPropagation()">
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountEmail(${acc.id})" title="${i18n('action_copy_email')}"><i class="fa-solid fa-envelope"></i> Email</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPassword(${acc.id})" title="${i18n('action_copy_pass')}"><i class="fa-solid fa-key"></i> Pass</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${acc.id})" title="${i18n('action_copy_pin')}"><i class="fa-solid fa-lock"></i> PIN</button>
                    ${acc.otp_token ? `
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountOtp(${acc.id})" title="${i18n('action_copy_otp')}"><i class="fa-solid fa-shield-halved"></i> OTP</button>
                    ` : ''}
                    <button class="btn-autologin" onclick="triggerAutoLogin(${acc.id})" title="Auto-Login (UAC)"><i class="fa-solid fa-keyboard"></i> Auto-Login</button>
                </div>
            </div>
        </div>
    `}).join('');

    // Update Batch Button
    const btn = document.getElementById('btn-delete-selected');
    if (btn) btn.style.display = selectedAccountIds.size > 0 ? 'inline-flex' : 'none';

    const launchBtn = document.getElementById('btn-launch-selected');
    if (launchBtn) launchBtn.style.display = (selectedAccountIds.size > 0 && currentView === 'accounts') ? 'inline-flex' : 'none';
}

// Count remains at 240 as anchor
function updateCharacterCount(count) {
    const countEl = document.getElementById('char-count');
    if (countEl) countEl.innerText = `(${count})`;
}

// Configuration
let levelThreshold = parseInt(localStorage.getItem('levelThreshold')) || 0;
// Dynamic Character Types
let charTypes = JSON.parse(localStorage.getItem('charTypes')) || ['Main', 'AFK Farm', 'Party Filler'];

// Config Modal Logic
function openConfigModal() {
    document.getElementById('config-db-path').value = dbPath;
    document.getElementById('config-flyff-path').value = flyffPath;
    document.getElementById('config-flyff-params').value = flyffParams;
    document.getElementById('config-threshold').value = levelThreshold;
    renderTypesConfig();
    document.getElementById('config-modal').classList.add('show');
}

async function browseExcelPath() {
    try {
        const res = await fetch(`${API_URL}/config/browse`);
        const data = await res.json();
        if (data.path) {
            document.getElementById('config-db-path').value = data.path;
        } else if (data.error) {
            alert(data.error);
        }
    } catch (e) { console.error(e); }
}

async function browseFlyffExePath() {
    try {
        const res = await fetch(`${API_URL}/config/browse-exe`);
        const data = await res.json();
        if (data.path) {
            document.getElementById('config-flyff-path').value = data.path;
        } else if (data.error) {
            alert(data.error);
        }
    } catch (e) { console.error(e); }
}

async function browseAndCreateExcel() {
    try {
        const res = await fetch(`${API_URL}/config/browse-new`);
        const data = await res.json();
        if (data.path) {
            document.getElementById('config-db-path').value = data.path;
            // Auto-save to initialize the file
            saveConfig();
        } else if (data.error) {
            alert(data.error);
        }
    } catch (e) {
        console.error(e);
        alert(i18n('msg_error'));
    }
}

function closeConfigModal() {
    document.getElementById('config-modal').classList.remove('show');
}

async function saveConfig() {
    const val = parseInt(document.getElementById('config-threshold').value);
    levelThreshold = isNaN(val) ? 0 : val;
    localStorage.setItem('levelThreshold', levelThreshold);

    const newPath = document.getElementById('config-db-path').value.trim();
    const newFlyffPath = document.getElementById('config-flyff-path').value.trim();
    const newFlyffParams = document.getElementById('config-flyff-params').value.trim();

    if (newPath !== dbPath) {
        dbPath = newPath;
        try {
            const res = await fetch(`${API_URL}/config/db-path`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: dbPath })
            });
            const data = await res.json();
            if (data.error) alert(data.error);
        } catch (e) { console.error(e); }
    }

    if (newFlyffPath !== flyffPath || newFlyffParams !== flyffParams) {
        flyffPath = newFlyffPath;
        flyffParams = newFlyffParams;
        try {
            const res = await fetch(`${API_URL}/config/flyff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flyff_path: flyffPath, flyff_params: flyffParams })
            });
            const data = await res.json();
            if (data.error) alert(data.error);
        } catch (e) { console.error(e); }
    }

    alert(i18n('msg_save_config_success'));
    fetchAccounts();
    if (currentView === 'characters' || currentView === 'vacantes' || currentView === 'levelzone') {
        fetchCharacters();
    }

    closeConfigModal();
    renderCharacters(); // Re-render to apply new threshold if filter is active
}

// Character Types Logic
function renderTypesConfig() {
    const list = document.getElementById('config-types-list');
    if (!list) return;
    list.innerHTML = charTypes.map(t => `
        <span class="type-tag">
            ${t}
            <i class="fa-solid fa-xmark" onclick="deleteCharType('${t}')"></i>
        </span>
    `).join('');
}

function addCharType() {
    const input = document.getElementById('new-type-input');
    const val = input.value.trim();
    if (val && !charTypes.includes(val)) {
        charTypes.push(val);
        localStorage.setItem('charTypes', JSON.stringify(charTypes));
        input.value = '';
        renderTypesConfig();
        updateTypeOptions(); // Update dropdowns immediately
    }
}

function deleteCharType(type) {
    if (confirm(i18n('msg_confirm_delete'))) {
        charTypes = charTypes.filter(t => t !== type);
        localStorage.setItem('charTypes', JSON.stringify(charTypes));
        renderTypesConfig();
        updateTypeOptions();
    }
}

function updateTypeOptions() {
    // Update Filter Dropdown
    const filterSelect = document.getElementById('type-filter');
    if (filterSelect) {
        const current = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Types</option>' +
            charTypes.map(t => `<option value="${t}">${t}</option>`).join('');
        filterSelect.value = current;
    }
}

// Filtering
function updateFilterOptions() {
    const select = document.getElementById('account-filter');
    select.innerHTML = '<option value="">All Accounts</option>' +
        accounts.map(a => `<option value="${a.id}">${a.email}</option>`).join('');
}

function renderCharacters() {
    // Get Filter Values
    const accountId = document.getElementById('account-filter')?.value;
    const type = document.getElementById('type-filter')?.value;
    const classFilter = document.getElementById('class-filter')?.value;
    const targetLevelStr = document.getElementById('level-filter')?.value;
    const nameSearch = document.getElementById('name-filter')?.value ? document.getElementById('name-filter').value.toLowerCase() : "";
    const sortBy = document.getElementById('sort-by')?.value;

    let list = [...characters];

    // Filter by Name
    if (nameSearch) {
        list = list.filter(c => (c.name || "").toLowerCase().includes(nameSearch));
    }

    // Filter by Account
    if (accountId) {
        list = list.filter(c => c.account_id == accountId);
    }

    // Filter by Type
    if (type) {
        list = list.filter(c => c.char_type === type);
    }

    // Filter by Class
    if (classFilter) {
        list = list.filter(c => c.class_name === classFilter);
    }

    // Filter by Level Threshold
    if (targetLevelStr) {
        const target = parseInt(targetLevelStr);
        if (!isNaN(target)) {
            const min = target - levelThreshold;
            const max = target + levelThreshold;
            list = list.filter(c => (c.level || 0) >= min && (c.level || 0) <= max);
        }
    }

    // Sorting
    if (sortBy === 'name') {
        list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === 'level') {
        list.sort((a, b) => (b.level || 0) - (a.level || 0));
    } else if (sortBy === 'class') {
        list.sort((a, b) => (a.class_name || '').localeCompare(b.class_name || ''));
    }

    updateCharacterCount(list.length);
    renderCharactersHTML(list, 'characters-grid');
    if (currentView === 'favorites') {
        renderFavorites();
    }
}

function renderFavorites() {
    let list = characters.filter(c => c.is_favorite);
    renderCharactersHTML(list, 'favorites-grid');
}

async function toggleFavorite(id) {
    const char = characters.find(c => c.id == id);
    if (!char) return;

    // 1. Immediate UI Feedback (Optimistic UI)
    const oldState = char.is_favorite;
    char.is_favorite = !oldState;

    // Find the button and update it immediately
    const stars = document.querySelectorAll(`.favorite[onclick="toggleFavorite(${id})"]`);
    stars.forEach(btn => {
        btn.classList.toggle('active');
        btn.style.color = char.is_favorite ? '#fbbf24' : 'rgba(255,255,255,0.3)';
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = `fa-${char.is_favorite ? 'solid' : 'regular'} fa-star`;
        }
    });

    // Update global counter in sidebar
    const count = characters.filter(c => c.is_favorite).length;
    const favCount = document.getElementById('fav-count');
    if (favCount) favCount.innerText = `(${count})`;

    try {
        const res = await fetch(`${API_URL}/characters/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_favorite: char.is_favorite })
        });

        if (!res.ok) {
            // Revert on error
            char.is_favorite = oldState;
            alert(i18n('msg_error'));
            if (currentView === 'favorites') renderFavorites();
            else renderCharacters();
        } else {
            // Success - keep state, maybe Refresh if in favorites view to remove item
            if (currentView === 'favorites' && !char.is_favorite) {
                renderFavorites();
            }
        }
    } catch (e) {
        console.error(e);
        char.is_favorite = oldState; // Revert
    }
}

function renderCharactersHTML(list, targetGridId = 'characters-grid') {
    const grid = document.getElementById(targetGridId);
    if (!grid) return;

    // Helper to get Account Email - Using loose equality == for ID resilience
    const getAccountEmail = (id) => {
        if (!id) return 'No Account';
        const acc = accounts.find(a => a.id == id);
        return acc ? acc.email : 'Unknown ID: ' + id;
    };

    try {
        grid.innerHTML = list.map((char, index) => {
            try {
                const charType = char.char_type || 'Unknown';
                const charTypeLower = charType.toLowerCase ? charType.toLowerCase() : 'unknown';

                return `
                <div class="card">
                    <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <button class="icon-btn favorite ${char.is_favorite ? 'active' : ''}" 
                                onclick="toggleFavorite(${char.id})" 
                                title="Toggle Favorite"
                                style="color: ${char.is_favorite ? '#fbbf24' : 'rgba(255,255,255,0.3)'};">
                            <i class="fa-${char.is_favorite ? 'solid' : 'regular'} fa-star"></i>
                        </button>
                        <div class="card-actions" style="opacity:1;">
                            <button class="icon-btn" onclick="openModal('character', ${char.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="icon-btn delete" onclick="deleteItem('characters', ${char.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="card-header" style="padding-top:0; margin-bottom:0.5rem;">
                        <div class="card-title clickable" style="word-break:break-all;" onclick="openAccountDetailsModal(${char.account_id})">${char.name || 'Unnamed'}</div>
                    </div>
                    <div class="card-content">
                        <p>${i18n('field_level')} <span class="value" style="font-weight:700; color:var(--primary);"><i class="fa-solid fa-angles-up"></i> Lvl ${char.level || 0}</span></p>
                        <p>${i18n('field_class')} <span class="badge badge-${(char.class_name || 'Vagrant').toLowerCase()}">${char.class_name || 'None'}</span></p>
                        <p>${i18n('settings_char_types')} <span class="badge badge-${charTypeLower}">${charType}</span></p>
                        <div class="recommended-spot">
                            <i class="fa-solid fa-map-location-dot"></i> <span>${getRecommendedZone(char.level)}</span>
                        </div>

                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyToClipboard('${getAccountEmail(char.account_id)}')" title="${i18n('action_copy_email')}"><i class="fa-solid fa-envelope"></i> Email</button>
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyCharacterPassword(${char.id})" title="${i18n('action_copy_pass')}"><i class="fa-solid fa-key"></i> Pass</button>
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${char.account_id})" title="${i18n('action_copy_pin')}"><i class="fa-solid fa-lock"></i> PIN</button>
                            <button class="btn-autologin" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="triggerAutoLogin(${char.account_id})" title="Auto-Login (UAC)"><i class="fa-solid fa-keyboard"></i> Auto-Login</button>
                        </div>
                    </div>
                </div>
            `;
            } catch (err) {
                console.error(`Error rendering character at index ${index}:`, err, char);
                return ''; // skip bad char
            }
        }).join('');
    } catch (globalErr) {
        console.error("Global rendering error:", globalErr);
    }
}

// Vacantes Functions
function renderVacantes() {
    const grid = document.getElementById('vacantes-grid');
    if (!grid) return;

    const vacantes = accounts.filter(acc => {
        const charCount = characters.filter(c => c.account_id == acc.id).length;
        return charCount < 3;
    });

    const countEl = document.getElementById('vacantes-count');
    if (countEl) countEl.innerText = `(${vacantes.length})`;

    grid.innerHTML = vacantes.map(acc => {
        const charCount = characters.filter(c => c.account_id == acc.id).length;
        return `
        <div class="card" onclick="openVacanteModal(${acc.id})" style="cursor:pointer; border-left: 4px solid var(--primary);">
            <div class="card-header" style="margin-bottom:0.5rem; justify-content:space-between; align-items:flex-start;">
                <div class="card-title" style="word-break:break-all;">${acc.email}</div>
                <div class="badge badge-default" style="font-size:0.8rem;">${charCount}/3 Chars</div>
            </div>
            <div class="card-content">
                <p>${i18n('action_redeem_here')}</p>
            </div>
        </div>
        `;
    }).join('');
}

function openVacanteModal(accountId) {
    prefillAccountId = accountId;
    const acc = accounts.find(a => a.id == accountId);
    if (!acc) return;

    const accChars = characters.filter(c => c.account_id == accountId);

    document.getElementById('vd-title').innerText = acc.email;
    document.getElementById('vd-credentials').innerHTML = `
        <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountEmail(${acc.id})"><i class="fa-solid fa-envelope"></i> Email</button>
        <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPassword(${acc.id})"><i class="fa-solid fa-key"></i> Pass</button>
        <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${acc.id})"><i class="fa-solid fa-lock"></i> PIN</button>
    `;
    document.getElementById('vd-count').innerText = accChars.length;

    const grid = document.getElementById('vd-characters-grid');
    grid.innerHTML = accChars.map(char => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${char.name} <span style="opacity:0.6; font-size:0.8rem; font-weight:normal;">${i18n('field_level')} ${char.level}</span></div>
            </div>
            <div class="card-content">
                <p>${i18n('field_class')} <span class="value">${char.class_name}</span></p>
                <p>${i18n('settings_char_types')} <span class="badge badge-${char.char_type?.toLowerCase()}">${char.char_type}</span></p>
            </div>
        </div>
    `).join('') || `<p style="opacity:0.6; font-style:italic; padding:10px;">${i18n('field_desc_empty')}</p>`;

    document.getElementById('vacante-details-modal').classList.add('show');
}

function closeVacanteModal() {
    document.getElementById('vacante-details-modal').classList.remove('show');
}

function openPreFilledCharacterModal() {
    closeVacanteModal();
    openModal('character');
}

// Forms & Modals
let editingId = null;
let editingType = null;
let prefillAccountId = null;
let lastOpenAccountId = null;

async function openModal(type = null, id = null) {
    if (!type) {
        if (currentView === 'accounts') type = 'account';
        else if (currentView === 'items') type = 'item';
        else type = 'character';
    }

    editingType = type;
    editingId = id;

    modalTitle.innerText = id ? `${i18n('modal_save')} ${capitalize(type)}` : `${i18n('btn_add_account').replace('New ', '')} ${capitalize(type)}`;

    const isAccount = type === 'account';
    let html = '';

    if (isAccount) {
        // Account Form
        const data = id ? accounts.find(a => a.id === id) : {};
        html = `
            <div class="form-group">
                <label>Email</label>
                <input type="email" name="email" value="${data.email || ''}" required>
            </div>
            <div class="form-group">
                <label>${i18n('field_pass')}</label>
                <input type="text" name="password" value="${data.password || ''}" required>
            </div>
            <div class="form-group">
                <label>${i18n('field_pin')}</label>
                <input type="text" name="pin" value="${data.pin || ''}">
            </div>
            <div class="form-group">
                <label>${i18n('field_otp')}</label>
                <input type="text" name="otp_token" value="${data.otp_token || ''}">
            </div>
        `;
    } else if (type === 'character') {
        // Character Form
        const data = id ? characters.find(c => c.id == id) : { account_id: prefillAccountId };
        prefillAccountId = null; // Clear after use

        const accountOptions = accounts.map(a => `<option value="${a.id}" ${data.account_id == a.id ? 'selected' : ''}>${a.email}</option>`).join('');

        // Fetch Class Catalog
        let classOptions = '<option value="">Select Class</option>';
        try {
            const res = await fetch(`${API_URL}/catalog/classes`);
            if (res.ok) {
                const classes = await res.json();
                classOptions += classes.map(cls => `<option value="${cls}" ${data.class_name === cls ? 'selected' : ''}>${cls}</option>`).join('');
            }
        } catch (e) {
            console.error("Error fetching class catalog:", e);
        }

        html = `
            <div class="form-group">
                <label>${i18n('field_account')}</label>
                <select name="account_id" required>
                    ${accountOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>

            <div class="form-group">
                <div style="display:flex; gap: 10px;">
                    <div style="flex:1">
                        <label>${i18n('field_level')}</label>
                        <input type="number" name="level" value="${data.level || ''}">
                    </div>
                    <div style="flex:1">
                        <label>${i18n('field_class')}</label>
                        <select name="class_name">
                            ${classOptions}
                        </select>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>${i18n('settings_char_types')}</label>
                <select name="char_type">
                    ${charTypes.map(t => `<option value="${t}" ${data.char_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (type === 'item') {
        const data = id ? items.find(i => i.id === id) : {};
        const characterOptions = characters.map(c => `<option value="${c.id}" ${data.character_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('');

        let typeOptions = '<option value="">Select Type</option>';
        try {
            const res = await fetch(`${API_URL}/catalog/item_types`);
            if (res.ok) {
                const types = await res.json();
                typeOptions += types.map(t => `<option value="${t}" ${data.item_type === t ? 'selected' : ''}>${t}</option>`).join('');
            }
        } catch (e) {
            console.error("Error fetching item types catalog:", e);
        }

        html = `
            <div class="form-group">
                <label>Assign to Character</label>
                <select name="character_id" required>
                    ${characterOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Item Type</label>
                <select name="item_type" required>
                    ${typeOptions}
                </select>
            </div>
            <div class="form-group">
                <label>${i18n('field_desc')} (Max 50 chars)</label>
                <textarea name="description" rows="2" maxlength="50" style="width:100%; padding:0.75rem; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; min-width:100%; max-width:100%;">${data.description || ''}</textarea>
            </div>
        `;
    }

    form.innerHTML = html;
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    editingId = null;
    editingType = null;
}

async function submitForm() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Fix number types
    if (data.level) data.level = parseInt(data.level);
    if (data.account_id) data.account_id = parseInt(data.account_id);

    if (data.character_id) data.character_id = parseInt(data.character_id);

    let endpoint = editingType;
    if (editingType === 'account') endpoint = 'accounts';
    if (editingType === 'character') endpoint = 'characters';
    if (editingType === 'item') endpoint = 'items';

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${endpoint}/${editingId}` : `${API_URL}/${endpoint}`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            if (editingType === 'character' && lastOpenAccountId) {
                fetchCharacters().then(() => {
                    openAccountDetailsModal(lastOpenAccountId);
                    lastOpenAccountId = null;
                });
            } else {
                if (currentView === 'accounts') fetchAccounts();
                else if (currentView === 'items') fetchItems();
                else fetchCharacters();
            }
        } else {
            const err = await res.json();
            alert(i18n('msg_error') + ': ' + err.error);
        }
    } catch (e) {
        console.error(e);
        alert(i18n('msg_error'));
    }
}

async function deleteItem(type, id) {
    if (!confirm(i18n('msg_confirm_delete'))) return;
    try {
        await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
        if (type === 'accounts') fetchAccounts();
        else if (type === 'items') fetchItems();
        else fetchCharacters();
    } catch (e) { console.error(e); }
}

function openCharInfoModal(charId) {
    if (!charId) return;
    const char = characters.find(c => c.id === parseInt(charId));
    if (!char) return;
    const acc = accounts.find(a => a.id === char.account_id);
    if (!acc) return;

    document.getElementById('ci-name').innerText = char.name;
    document.getElementById('ci-actions').innerHTML = `
        <button class="btn-secondary" onclick="copyAccountEmail(${acc.id})"><i class="fa-solid fa-envelope"></i> Email</button>
        <button class="btn-secondary" onclick="copyAccountPassword(${acc.id})"><i class="fa-solid fa-key"></i> Pass</button>
        <button class="btn-secondary" onclick="copyAccountPin(${acc.id})"><i class="fa-solid fa-lock"></i> PIN</button>
        ${acc.otp_token ? `
        <button class="btn-secondary" onclick="copyAccountOtp(${acc.id})"><i class="fa-solid fa-shield-halved"></i> OTP</button>
        ` : ''}
    `;
    document.getElementById('char-info-modal').classList.add('show');
}

function closeCharInfoModal() {
    document.getElementById('char-info-modal').classList.remove('show');
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function copyAccountEmail(id) {
    const acc = accounts.find(a => a.id === id);
    if (acc) copyToClipboard(acc.email);
}

function copyAccountPassword(id) {
    const acc = accounts.find(a => a.id === id);
    if (acc) copyToClipboard(acc.password);
}

function copyAccountPin(id) {
    const acc = accounts.find(a => a.id === id);
    if (acc) copyToClipboard(acc.pin);
}

function copyAccountOtp(id) {
    const acc = accounts.find(a => a.id === id);
    if (acc) copyToClipboard(acc.otp_token);
}

function copyCharacterPassword(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;

    let password = char.password;
    if (!password) {
        const acc = accounts.find(a => a.id === char.account_id);
        if (acc) password = acc.password;
    }

    copyToClipboard(password);
}

function copyToClipboard(text) {
    if (!text || text === 'null' || text === 'undefined') {
        alert("No text available to copy");
        return;
    }

    const triggerEl = document.activeElement;

    // Try modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(triggerEl);
        }).catch(err => {
            console.error('Async: Could not copy text: ', err);
            fallbackCopyTextToClipboard(text, triggerEl);
        });
    } else {
        fallbackCopyTextToClipboard(text, triggerEl);
    }
}

function fallbackCopyTextToClipboard(text, triggerEl) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) showCopyFeedback(triggerEl);
        else alert('Copy failed. Please manually copy.');
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('Copy failed. Please manually copy.');
    }

    document.body.removeChild(textArea);
    if (triggerEl) triggerEl.focus();
}

function showCopyFeedback(el) {
    if (!el) el = document.activeElement;
    if (el) {
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.innerText = i18n('msg_copy_success') || '¡Copiado!';
        document.body.appendChild(tooltip);

        const rect = el.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Position it center-aligned horizontally, above the target button
        const top = window.scrollY + rect.top - tooltipRect.height - 8;
        const left = window.scrollX + rect.left + (rect.width / 2);

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        setTimeout(() => {
            tooltip.classList.add('fade-out');
            setTimeout(() => {
                if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
            }, 300);
        }, 1000);
    }
}

function togglePassword(id) {
    const el = document.getElementById(`acc-pass-${id}`);
    if (el.innerText === '******') {
        const acc = accounts.find(a => a.id === id);
        el.innerText = (acc && acc.password) ? acc.password : 'No Password';
    } else {
        el.innerText = '******';
    }
}

function togglePin(id) {
    const el = document.getElementById(`acc-pin-${id}`);
    if (el.innerText === '****') {
        const acc = accounts.find(a => a.id === id);
        el.innerText = (acc && acc.pin) ? acc.pin : 'N/A';
    } else {
        el.innerText = '****';
    }
}

// CSV Import Logic
function triggerUpload(type) {
    const input = document.getElementById(`upload-${type}`);
    if (input) input.click();
}

async function handleFileUpload(type, event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${API_URL}/upload/${type}`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            if (type === 'accounts') fetchAccounts();
            else fetchCharacters();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (e) {
        console.error(e);
        alert(i18n('msg_error'));
    }

    // Reset input
    event.target.value = '';
}

// Batch Actions
function toggleAccountSelection(id) {
    if (selectedAccountIds.has(id)) {
        selectedAccountIds.delete(id);
    } else {
        selectedAccountIds.add(id);
    }
    renderAccounts();
}

async function deleteSelectedAccounts() {
    const count = selectedAccountIds.size;
    if (count === 0) return;

    if (!confirm(i18n('msg_confirm_delete'))) return;

    try {
        const res = await fetch(`${API_URL}/accounts/batch-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(selectedAccountIds) })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            selectedAccountIds.clear();
            fetchAccounts();
            fetchCharacters(); // Refresh chars too as they might be deleted
        } else {
            alert('Error: ' + data.error);
        }
    } catch (e) {
        console.error(e);
        alert(i18n('msg_error'));
    }
}

// LevelZone Logic
let levelQueue = [];

async function fetchLevelQueue() {
    try {
        const res = await fetch(`${API_URL}/leveling`);
        if (res.ok) {
            levelQueue = await res.json();
            renderLevelQueue();
            if (currentView === 'dashboard') renderDashboard();
        } else {
            const err = await res.json().catch(() => ({}));
            console.warn("Error fetching level queue:", err);
            levelQueue = [];
        }
    } catch (e) { console.error('Error fetching level queue:', e); levelQueue = []; }
}

function renderLevelQueue() {
    const grid = document.getElementById('level-grid');
    const search = document.getElementById('level-search').value.toLowerCase();

    // Filter
    let list = levelQueue;
    if (search) {
        list = list.filter(e => e.character_name.toLowerCase().includes(search) || (e.note && e.note.toLowerCase().includes(search)));
    }

    grid.innerHTML = list.map(entry => `
        <div class="card">
            <div class="card-bar" style="justify-content:space-between; display:flex;">
                <span style="font-weight:bold; color:var(--primary); font-size:1.1rem;">#${entry.priority}</span>
                <button class="icon-btn delete" onclick="removeFromLevelQueue(${entry.id})"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="card-header" style="padding-top:0;">
                <div class="card-title">${entry.character_name}</div>
            </div>
            <div class="card-content">
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountEmail(${entry.account_id})"><i class="fa-solid fa-envelope"></i> Email</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPassword(${entry.account_id})"><i class="fa-solid fa-key"></i> Pass</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${entry.account_id})"><i class="fa-solid fa-lock"></i> PIN</button>
                </div>
                <div style="margin-top:10px;">
                    <label style="font-size:0.8rem; color:rgba(255,255,255,0.5);">Priority</label>
                    <input type="number" value="${entry.priority}" onchange="updateLevelEntry(${entry.id}, 'priority', this.value)" style="width:100%; padding:5px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                </div>
                <div style="margin-top:10px;">
                    <label style="font-size:0.8rem; color:rgba(255,255,255,0.5);">Note</label>
                    <textarea onchange="updateLevelEntry(${entry.id}, 'note', this.value)" rows="3" style="width:100%; padding:5px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px; max-width:100%; min-width:100%;">${entry.note || ''}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

// Search Listener
document.getElementById('level-search')?.addEventListener('input', renderLevelQueue);

async function updateLevelEntry(id, field, value) {
    try {
        await fetch(`${API_URL}/leveling/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });
        // Silent update unless error
        // Update local state to avoid jumpy re-render
        const entry = levelQueue.find(e => e.id === id);
        if (entry) {
            if (field === 'priority') entry.priority = parseInt(value);
            if (field === 'note') entry.note = value;
        }
    } catch (e) { console.error(e); }
}

async function removeFromLevelQueue(id) {
    if (!confirm(i18n('msg_confirm_delete'))) return;
    try {
        await fetch(`${API_URL}/leveling/${id}`, { method: 'DELETE' });
        fetchLevelQueue();
    } catch (e) { console.error(e); }
}

// Level Modal
function openLevelModal() {
    // Populate select
    const select = document.getElementById('level-char-select');
    // Exclude chars already in queue
    const queuedIds = new Set(levelQueue.map(e => e.character_id));
    const available = characters.filter(c => !queuedIds.has(c.id));

    select.innerHTML = available.map(c => `<option value="${c.id}">${c.name} (${c.class_name || '?'})</option>`).join('');

    document.getElementById('level-modal').classList.add('show');
}

function closeLevelModal() {
    document.getElementById('level-modal').classList.remove('show');
}

async function submitLevelAdd() {
    const charId = document.getElementById('level-char-select').value;
    const priority = document.getElementById('level-priority-input').value;
    const note = document.getElementById('level-note-input').value;

    if (!charId) return alert('Select a character');

    try {
        const res = await fetch(`${API_URL}/leveling`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                character_id: charId,
                priority: parseInt(priority),
                note: note
            })
        });

        if (res.ok) {
            closeLevelModal();
            fetchLevelQueue();
        } else {
            alert(i18n('msg_error'));
        }
    } catch (e) { console.error(e); }
}

// ---------------------------------------------------------
// Daily Event Logic
// ---------------------------------------------------------
let dailyEvents = [];
let currentEventId = null;

function fetchDailyEvents() {
    fetch(`${API_URL}/daily-events`)
        .then(res => res.ok ? res.json() : (console.warn("Error fetching daily events"), []))
        .then(data => {
            dailyEvents = data;
            renderDailyEvents();
        })
        .catch(err => { console.error(err); dailyEvents = []; });
}

function renderDailyEvents() {
    const grid = document.getElementById('dailyevent-grid');
    grid.innerHTML = dailyEvents.map(event => `
        <div class="card event-card" onclick="openEventDetailsModal(${event.id})">
            <div class="card-header">
                <h3>${event.name}</h3>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span class="badge badge-date">${formatDate(event.start_date)} - ${formatDate(event.end_date)}</span>
                    <button class="icon-btn delete" onclick="deleteDailyEvent(${event.id}, event)" style="z-index:10;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-body">
                <p style="opacity:0.8; margin-bottom:1rem;">${event.description || 'No description'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.9rem; opacity:0.6;"><i class="fa-solid fa-users"></i> ${event.participants_count} Participants</span>
                </div>
            </div>
        </div>
    `).join('');
}

function deleteDailyEvent(id, e) {
    if (e) e.stopPropagation();
    if (!confirm(i18n('msg_confirm_delete'))) return;

    fetch(`${API_URL}/daily-events/${id}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else fetchDailyEvents();
        })
        .catch(err => console.error(err));
}

function formatDate(dateStr) {
    if (!dateStr) return '???';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

function openDailyEventModal() {
    document.getElementById('dailyevent-modal').classList.add('show');
}

function closeDailyEventModal() {
    document.getElementById('dailyevent-modal').classList.remove('show');
}

function submitDailyEvent() {
    const name = document.getElementById('de-name-input').value;
    const desc = document.getElementById('de-desc-input').value;
    const start = document.getElementById('de-start-input').value;
    const end = document.getElementById('de-end-input').value;

    if (!name || !start || !end) {
        alert('Name, Start Date, and End Date are required.');
        return;
    }

    fetch(`${API_URL}/daily-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, start_date: start, end_date: end })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                closeDailyEventModal();
                fetchDailyEvents();
            }
        })
        .catch(err => console.error(err));
}

// Event Details & Participants
function openEventDetailsModal(eventId) {
    currentEventId = eventId;
    const event = dailyEvents.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('ed-title').textContent = event.name;
    document.getElementById('ed-desc').textContent = event.description || '';
    document.getElementById('ed-dates').textContent = `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`;

    document.getElementById('event-details-modal').classList.add('show');
    fetchEventParticipants(eventId);
}

function closeEventDetailsModal() {
    document.getElementById('event-details-modal').classList.remove('show');
    currentEventId = null;
    fetchDailyEvents(); // Refresh in case counts changed
}

function fetchEventParticipants(eventId) {
    fetch(`${API_URL}/daily-events/${eventId}/participants`)
        .then(res => res.ok ? res.json() : (console.warn("Error fetching event participants"), []))
        .then(data => {
            renderEventParticipants(data, eventId);
        })
        .catch(err => console.error(err));
}

function renderEventParticipants(participants, eventId) {
    const grid = document.getElementById('ed-participants-grid');
    const event = dailyEvents.find(e => e.id === eventId);

    // Calculate dates array
    const dates = getDatesInRange(event.start_date, event.end_date);

    grid.innerHTML = participants.map(p => {
        // Build checklist
        const checks = dates.map(dateStr => {
            const progress = p.progress.find(prog => prog.event_date === dateStr);
            const mid = progress ? progress.id : null;
            const checked = progress ? progress.is_completed : false;

            // Just display day number or date? Let's verify format.
            // dateStr is assumed YYYY-MM-DD
            const displayDate = new Date(dateStr).getDate();
            // Fix timezone issue for display:
            // Actually getDatesInRange produces simple YYYY-MM-DD strings.
            // new Date(dateStr) treats as UTC or Local? If hyphenated, usually UTC.
            const dateObj = new Date(dateStr + 'T12:00:00');
            const dayNum = dateObj.getDate();

            return `
                <div class="day-check" 
                     onclick="toggleEventProgress(${p.id}, '${dateStr}', ${!checked}, event)"
                     style="
                        width:25px; height:25px; 
                        border:1px solid rgba(255,255,255,0.2); 
                        border-radius:4px; 
                        display:flex; justify-content:center; align-items:center;
                        cursor:pointer;
                        background: ${checked ? '#22c55e' : 'rgba(255,255,255,0.05)'};
                        color: white;
                        font-size: 0.8rem;
                     "
                     title="${dateStr}">
                    ${dayNum}
                </div>
            `;
        }).join('');

        return `
        <div class="card participant-card" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <h4 style="margin:0;">${p.character_name} <span style="font-size:0.8rem; opacity:0.6; font-weight:normal;">(${p.character_class})</span></h4>
                <button class="icon-btn" onclick="removeParticipant(${p.id})" style="color:#ef4444; width:25px; height:25px; min-height:0;"><i class="fa-solid fa-trash"></i></button>
            </div>
            
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1rem;">
                <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountEmail(${p.account_id})"><i class="fa-solid fa-envelope"></i> Email</button>
                <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPassword(${p.account_id})"><i class="fa-solid fa-key"></i> Pass</button>
                <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${p.account_id})"><i class="fa-solid fa-lock"></i> PIN</button>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:5px;">
                ${checks}
            </div>
        </div>
        `;
    }).join('');
}

function getDatesInRange(startDate, endDate) {
    if (!startDate || !endDate) return [];

    // Parse as local dates relative to user provided string to avoid timezone shifts
    // Assuming API returns 'YYYY-MM-DD'
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');

    const dates = [];
    let current = new Date(start);

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function toggleEventProgress(participantId, dateStr, newState, e) {
    if (e) e.stopPropagation(); // Prevent card click?

    fetch(`${API_URL}/daily-events/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            participant_id: participantId,
            date: dateStr,
            completed: newState
        })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.error) {
                // Optimistic update or refresh? Refresh is safer
                fetchEventParticipants(currentEventId);
            }
        });
}

function openAddParticipantModal() {
    // Populate char select
    const select = document.getElementById('ap-char-select');
    select.innerHTML = '<option value="">Loading...</option>';

    fetch(`${API_URL}/characters`)
        .then(res => res.json())
        .then(chars => {
            select.innerHTML = chars.map(c => `
                <option value="${c.id}">${c.name} (Lvl ${c.level || '?'}) - ${c.class_name || '?'}</option>
            `).join('');
        });

    document.getElementById('add-participant-modal').classList.add('show');
}

function closeAddParticipantModal() {
    document.getElementById('add-participant-modal').classList.remove('show');
}

function submitAddParticipant() {
    const charId = document.getElementById('ap-char-select').value;
    if (!charId || !currentEventId) return;

    fetch(`${API_URL}/daily-events/${currentEventId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_id: charId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                closeAddParticipantModal();
                fetchEventParticipants(currentEventId);
            }
        });
}

function removeParticipant(participantId) {
    if (!confirm(i18n('msg_confirm_delete'))) return;

    fetch(`${API_URL}/daily-events/participants/${participantId}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(() => {
            fetchEventParticipants(currentEventId);
        });
}

// ---------------------------------------------------------
// Coupon System Logic
// ---------------------------------------------------------

function fetchCoupons() {
    fetch(`${API_URL}/coupons`)
        .then(res => res.json())
        .then(data => {
            coupons = data;
            if (redemptionStep === 'coupons') renderCoupons();
        })
        .catch(err => console.error(err));
}

function renderCoupons() {
    const grid = document.getElementById('coupons-grid');
    if (!grid) return;
    grid.innerHTML = coupons.map(coupon => `
        <div class="card coupon-card">
            <div class="card-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-ticket" style="color:var(--primary); font-size:1.5rem;"></i>
                    <h3 style="margin:0;">${coupon.name}</h3>
                </div>
                <button class="icon-btn delete" onclick="deleteCoupon(${coupon.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div class="card-body" style="padding:1rem;">
                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:5px; margin-bottom:1rem; font-family:monospace; text-align:center; border:1px dashed rgba(255,255,255,0.2); position:relative;">
                    ${coupon.code}
                    <button class="icon-btn" onclick="copyText('${coupon.code}', event)" style="position:absolute; right:5px; top:50%; transform:translateY(-50%); opacity:0.6;"><i class="fa-solid fa-copy"></i></button>
                </div>
                <p style="opacity:0.7; font-size:0.9rem; margin-bottom:1.5rem;">${coupon.description || 'No description provided.'}</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button class="btn-primary" onclick="startRedemption(${coupon.id})" style="width:100%;">
                        <i class="fa-solid fa-gift"></i> ${i18n('coupon_redeem')}
                    </button>
                    <button class="btn-secondary" onclick="showRedeemedCharacters(${coupon.id})" style="width:100%;">
                        <i class="fa-solid fa-list"></i> ${i18n('coupon_history')}
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<p style="opacity:0.5; font-style:italic; padding:20px;">No coupons available. Create one to get started!</p>';
}

function resetCouponFlow() {
    redemptionStep = 'coupons';
    activeCouponId = null;
    selectedRedeemAccountId = null;
    const stepContainer = document.getElementById('coupon-step-container');
    if (stepContainer) stepContainer.style.display = 'none';
    fetchCoupons();
}

// Step 1: Show accounts that haven't redeemed
async function startRedemption(couponId) {
    activeCouponId = couponId;
    redemptionStep = 'accounts';
    const coupon = coupons.find(c => c.id === couponId);

    document.getElementById('coupon-step-container').style.display = 'block';
    document.getElementById('coupon-step-text').innerText = `${i18n('coupon_step1')}: [${coupon.name}]`;

    const grid = document.getElementById('coupons-grid');
    grid.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const res = await fetch(`${API_URL}/coupons/${couponId}/unredeemed`);
        const unredeemed = await res.json();

        grid.innerHTML = (unredeemed.length > 0) ? unredeemed.map(acc => `
            <div class="card account-card" onclick="selectAccountForRedemption(${acc.id})" style="cursor:pointer; transition:transform 0.2s;">
                <div class="card-header">
                    <div class="card-title"><i class="fa-solid fa-user"></i> ${acc.email}</div>
                </div>
                <div class="card-content">
                    <p style="opacity:0.6; font-size:0.8rem;">${i18n('action_redeem_here')}</p>
                </div>
            </div>
        `).join('') : `<p style="opacity:0.5; font-style:italic; padding:20px;">${i18n('vacantes_empty')}</p>`;
    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p style="color:var(--danger);">Error loading accounts.</p>';
    }
}

// Step 2: Show characters for the selected account
function selectAccountForRedemption(accountId) {
    selectedRedeemAccountId = accountId;
    redemptionStep = 'characters';
    const acc = accounts.find(a => a.id === accountId);
    const coupon = coupons.find(c => c.id === activeCouponId);

    document.getElementById('coupon-step-text').innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.1rem; font-weight:700;">${i18n('coupon_step2')}</span>
                <div style="background:var(--primary); color:white; padding:4px 10px; border-radius:4px; font-size:0.85rem; display:flex; gap:10px; align-items:center; box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);">
                    ${i18n('coupon_code')}: <strong style="letter-spacing:1px;">${coupon.code}</strong>
                    <i class="fa-solid fa-copy" style="cursor:pointer;" onclick="copyText('${coupon.code}', event)"></i>
                </div>
            </div>
            
            <!-- Quick Credentials -->
            <div style="display:flex; gap:10px; flex-wrap:wrap; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                <div class="credential-pill" onclick="copyText('${acc.email}', event)">
                    <i class="fa-solid fa-envelope"></i> <span>${acc.email}</span> <i class="fa-solid fa-copy" style="opacity:0.5; font-size:0.8rem;" title="${i18n('action_copy_email')}"></i>
                </div>
                <div class="credential-pill" onclick="copyText('${acc.password}', event)">
                    <i class="fa-solid fa-key"></i> <span>••••••••</span> <i class="fa-solid fa-copy" style="opacity:0.5; font-size:0.8rem;" title="${i18n('action_copy_pass')}"></i>
                </div>
                ${acc.pin ? `
                <div class="credential-pill" onclick="copyText('${acc.pin}', event)">
                    <i class="fa-solid fa-shield"></i> <span>••••</span> <i class="fa-solid fa-copy" style="opacity:0.5; font-size:0.8rem;" title="${i18n('action_copy_pin')}"></i>
                </div>
                ` : ''}
                ${acc.otp_token ? `
                <div class="credential-pill" onclick="copyText('${acc.otp_token}', event)">
                    <i class="fa-solid fa-shield-halved"></i> <span>••••••</span> <i class="fa-solid fa-copy" style="opacity:0.5; font-size:0.8rem;" title="${i18n('action_copy_otp')}"></i>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const accChars = characters.filter(c => c.account_id == accountId);
    const grid = document.getElementById('coupons-grid');

    let html = `
        <div style="grid-column: 1 / -1; margin-bottom: 1.5rem;">
            <div class="card" style="background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); padding:20px; text-align:center;">
                <p style="opacity:0.7; margin-bottom:15px;">${i18n('coupon_skip_help')}</p>
                <button class="btn-secondary" onclick="skipAccountForCoupon(${accountId})" style="background:rgba(255,87,87,0.1); color:#ff5757; border-color:rgba(255,87,87,0.2);">
                    <i class="fa-solid fa-ban"></i> ${i18n('coupon_skip')}
                </button>
            </div>
        </div>
    `;

    html += accChars.map(char => `
        <div class="card char-card" onclick="confirmRedemption(${char.id})" style="cursor:pointer; border:2px solid transparent; transition:all 0.2s;">
            <div class="card-header">
                <div class="card-title">${char.name} <span style="opacity:0.6; font-size:0.8rem;">${i18n('field_level')} ${char.level}</span></div>
            </div>
            <div class="card-content">
                <p>${i18n('field_class')}: <span class="value">${char.class_name}</span></p>
                <p style="margin-top:10px; font-weight:600; color:var(--primary);">${i18n('action_redeem_here')}</p>
            </div>
        </div>
    `).join('') || (accChars.length === 0 ? `<p style="opacity:0.5; font-style:italic; padding:20px; grid-column:1/-1;">${i18n('coupon_no_chars')}</p>` : '');

    grid.innerHTML = html;
}

async function skipAccountForCoupon(accountId) {
    if (!confirm(i18n('msg_skip_confirm'))) return;

    try {
        const res = await fetch(`${API_URL}/coupons/skip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                coupon_id: activeCouponId,
                account_id: accountId
            })
        });

        if (res.ok) {
            alert('Account skipped successfully.');
            resetCouponFlow();
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
        }
    } catch (e) {
        console.error(e);
        alert('Fetch error during skip.');
    }
}

// Step 3: API Call to redeem
async function confirmRedemption(charId) {
    const char = characters.find(c => c.id === charId);
    if (!confirm(`Redeem coupon for character "${char.name}"?`)) return;

    try {
        const res = await fetch(`${API_URL}/coupons/redeem`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                coupon_id: activeCouponId,
                account_id: selectedRedeemAccountId,
                character_id: charId
            })
        });

        if (res.ok) {
            alert('Coupon redeemed successfully!');
            resetCouponFlow();
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
        }
    } catch (e) {
        console.error(e);
        alert('Fetch error during redemption.');
    }
}

// Modal History Logic
async function showRedeemedCharacters(couponId) {
    const coupon = coupons.find(c => c.id === couponId);
    document.getElementById('redeemed-modal-title').innerText = `Redeemed By: ${coupon.name}`;
    document.getElementById('redeemed-chars-grid').innerHTML = '<div class="loading-spinner"></div>';
    document.getElementById('redeemed-modal').classList.add('show');

    try {
        const res = await fetch(`${API_URL}/coupons/${couponId}/redeemed`);
        const redeemedChars = await res.json();
        if (redeemedChars.error) {
            grid.innerHTML = `<p style="color:var(--danger); padding:20px;">Error: ${redeemedChars.error}</p>`;
        } else {
            renderRedeemedCharacters(redeemedChars);
        }
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<p style="color:var(--danger); padding:20px;">Fetch error loading history.</p>`;
    }
}

function renderRedeemedCharacters(chars) {
    const grid = document.getElementById('redeemed-chars-grid');
    if (!Array.isArray(chars)) {
        grid.innerHTML = `<p style="opacity:0.5; font-style:italic; padding:20px;">${i18n('msg_no_redemptions')}</p>`;
        return;
    }
    grid.innerHTML = chars.map(char => `
        <div class="card" style="border-left: 4px solid var(--primary);">
            <div class="card-header">
                <div class="card-title">${char.name}</div>
                <span class="badge badge-date">${char.redemption_date ? char.redemption_date.split(' ')[0] : 'Unknown'}</span>
            </div>
            <div class="card-content">
                <p>${i18n('field_level')}: <span class="value">${char.level}</span></p>
                <p>${i18n('field_class')}: <span class="value">${char.class_name}</span></p>
            </div>
        </div>
    `).join('') || `<p style="opacity:0.5; font-style:italic; padding:20px;">${i18n('msg_no_redemptions')}</p>`;
}

function closeRedeemedModal() {
    document.getElementById('redeemed-modal').classList.remove('show');
}

// Create Coupon Modal
function openCouponCreateModal() {
    document.getElementById('coupon-modal').classList.add('show');
}

function closeCouponModal() {
    document.getElementById('coupon-modal').classList.remove('show');
}

// Wait until DOM is ready to add event listener if not already there
const couponForm = document.getElementById('coupon-form');
if (couponForm) {
    couponForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('coupon-name').value,
            code: document.getElementById('coupon-code').value,
            description: document.getElementById('coupon-desc').value
        };

        try {
            const res = await fetch(`${API_URL}/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                closeCouponModal();
                document.getElementById('coupon-form').reset();
                fetchCoupons();
            }
        } catch (e) { console.error(e); }
    });
}

async function deleteCoupon(id) {
    if (!confirm(i18n('coupon_delete_confirm'))) return;
    try {
        await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE' });
        fetchCoupons();
    } catch (e) { console.error(e); }
}

function copyText(text, event) {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
        // Optional: change icon temporarily or show popup
        const icon = event?.target.classList.contains('fa-copy') ? event.target : event?.target.querySelector('.fa-copy');
        if (icon) {
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');
            icon.style.color = '#4ade80';
            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-copy');
                icon.style.color = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Copy failed:', err);
        alert(i18n('msg_error'));
    });
}

// =========================================================
// PC Launcher, Compact Mode, & Leveling Recommendations
// =========================================================

async function launchSelectedAccounts() {
    const ids = Array.from(selectedAccountIds);
    if (ids.length === 0) return;

    try {
        const res = await fetch(`${API_URL}/accounts/launch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            selectedAccountIds.clear();
            renderAccounts();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (e) {
        console.error(e);
        alert(i18n('msg_error'));
    }
}

let isCompact = false;
let compactCycles = {}; // Stores { accountId: 'email' | 'password' | 'pin' | 'otp' }

async function toggleCompactMode() {
    isCompact = !isCompact;
    document.body.classList.toggle('compact-mode', isCompact);

    const compactView = document.getElementById('compact-view');

    if (isCompact) {
        compactView.style.display = 'flex';
        const searchInput = document.getElementById('compact-search');
        if (searchInput) searchInput.value = ''; // Reset search on open

        try {
            await fetchAccounts();
            await fetchCharacters();
        } catch (e) { console.error("Error fetching compact mode data:", e); }
        renderCompactList();
    } else {
        compactView.style.display = 'none';
        switchView(currentView);
    }
}

function renderCompactList() {
    const listEl = document.getElementById('compact-list');
    if (!listEl) return;

    const searchVal = document.getElementById('compact-search')?.value.toLowerCase().trim() || '';

    // Filter accounts by email or character names
    let filteredAccounts = [...accounts];
    if (searchVal) {
        filteredAccounts = filteredAccounts.filter(acc => {
            const emailMatch = acc.email.toLowerCase().includes(searchVal);

            const accChars = characters.filter(c => c.account_id == acc.id);
            const charMatch = accChars.some(char => char.name.toLowerCase().includes(searchVal));

            return emailMatch || charMatch;
        });
    }

    listEl.innerHTML = filteredAccounts.map(acc => {
        const accChars = characters.filter(c => c.account_id == acc.id);
        const charHtml = accChars.map(char => `
            <div class="compact-char-item">
                <span>${char.name} (${char.class_name || 'Vagrant'})</span>
                <span class="lvl">Lvl ${char.level || 0}</span>
            </div>
        `).join('');

        const currentState = compactCycles[acc.id] || 'email';
        let buttonText = 'Copiar Email';
        if (currentState === 'password') buttonText = 'Copiar Contraseña';
        if (currentState === 'pin') buttonText = `PIN: ${acc.pin || 'N/A'}`;
        if (currentState === 'otp') buttonText = `OTP: ${acc.otp_token || 'N/A'}`;

        return `
            <div class="compact-card" id="compact-card-${acc.id}">
                <div class="compact-card-header">
                    <span style="font-size:0.85rem; opacity:0.8; word-break:break-all;">${acc.email}</span>
                    <div style="display:flex; gap:4px;">
                        <button class="icon-btn" onclick="triggerAutoLogin(${acc.id})" title="Auto-Login (UAC)"><i class="fa-solid fa-keyboard" style="font-size:0.8rem;"></i></button>
                        <button class="icon-btn" onclick="launchSingleAccount(${acc.id})" title="Lanzar en PC"><i class="fa-solid fa-play" style="font-size:0.8rem;"></i></button>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; margin: 4px 0;">
                    ${charHtml || '<div style="font-size:0.7rem; opacity:0.5; font-style:italic;">Sin personajes</div>'}
                </div>
                <button class="compact-btn-cycle" id="cycle-btn-${acc.id}" onclick="cycleCredentials(${acc.id})">
                    ${buttonText}
                </button>
            </div>
        `;
    }).join('');
}

async function launchSingleAccount(accountId) {
    try {
        const res = await fetch(`${API_URL}/accounts/launch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [accountId] })
        });
        const data = await res.json();
        if (!res.ok) alert(data.error);
    } catch (e) { console.error(e); }
}

function cycleCredentials(accountId) {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;

    const currentState = compactCycles[accountId] || 'email';
    const btn = document.getElementById(`cycle-btn-${accountId}`);

    if (currentState === 'email') {
        copyToClipboard(acc.email);
        compactCycles[accountId] = 'password';
        if (btn) btn.innerText = 'Copiar Contraseña';
    } else if (currentState === 'password') {
        copyToClipboard(acc.password);
        compactCycles[accountId] = 'pin';
        if (btn) {
            btn.innerText = `PIN: ${acc.pin || 'N/A'}`;
        }
    } else if (currentState === 'pin') {
        if (acc.pin) copyToClipboard(acc.pin);
        compactCycles[accountId] = 'otp';
        if (btn) {
            btn.innerText = `OTP: ${acc.otp_token || 'N/A'}`;
        }
    } else if (currentState === 'otp') {
        if (acc.otp_token) copyToClipboard(acc.otp_token);
        compactCycles[accountId] = 'email';
        if (btn) btn.innerText = 'Copiar Email';
    }
}

function getRecommendedZone(level) {
    if (!level) return 'Desconocido';
    const lvl = parseInt(level);
    if (lvl < 15) return 'Flaris (Aibatts/Lawolfs)';
    if (lvl >= 15 && lvl < 25) return 'Flaris (Bangs) / Saint Morning (Wagsacks)';
    if (lvl >= 25 && lvl < 40) return 'Saint Morning (Mr. Pumpkins / Dumbulls)';
    if (lvl >= 40 && lvl < 50) return 'Garden of Rhisis (Basques / Pranksters)';
    if (lvl >= 50 && lvl < 60) return 'Darkon 2 (Leyenas / Fangubs)';
    if (lvl >= 60 && lvl < 70) return 'Darkon 2 (Cranes) / Azria (Yettis)';
    if (lvl >= 70 && lvl < 80) return 'Darkon 3 (Carrierbombs) / Azria (Augus)';
    if (lvl >= 80 && lvl < 90) return 'Darkon 3 (Mushpoies) / Azria (Ghosts)';
    if (lvl >= 90 && lvl < 100) return 'Darkon 3 (Watangkas) / Azria (Mammoths)';
    if (lvl >= 100 && lvl < 110) return 'Darkon 3 (Luias) / Azria (Cannibal Yettis)';
    if (lvl >= 110 && lvl < 120) return 'Volcane (Meteonyker)';
    if (lvl >= 120 && lvl < 130) return 'Shaduwar (Lykan) / Tower B1-B2';
    return 'Valley of the Risen / Kaillun / Bahara';
}

// ---------------------------------------------------------
// Auto-Login API call
// ---------------------------------------------------------
async function triggerAutoLogin(accountId) {
    // Visual feedback
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(212, 175, 55, 0.95)';
    toast.style.color = '#000';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '30px';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.border = '1px solid #fff';
    toast.innerHTML = '<i class="fa-solid fa-keyboard"></i> Iniciando juego y Auto-Login... Por favor espera';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);

    try {
        const res = await fetch(`${API_URL}/accounts/${accountId}/autologin`, {
            method: 'POST'
        });
        if (!res.ok) {
            const data = await res.json();
            alert(`Error en Auto-Login: ${data.error || 'Desconocido'}`);
        }
    } catch (e) {
        console.error(e);
        alert('Error conectando al servidor para el Auto-Login.');
    }
}

// ---------------------------------------------------------
// Contadores Engine
// ---------------------------------------------------------
let contadores = [];

// Lista de contadores por defecto
const DEFAULT_CONTADORES = [
    { id: 'default_cw', name: 'Clockworks', respawnTime: 2880, endTime: null, isMuted: false },
    { id: 'default_rm', name: 'Red Meteonyker', respawnTime: 120, endTime: null, isMuted: false },
    { id: 'default_gm', name: 'Giant Mushpoie', respawnTime: 30, endTime: null, isMuted: false }
];

// Sound Synthesizer using Web Audio API (Dual-beeps, completely virtual)
let audioCtx = null;
function playAlarmSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = audioCtx.currentTime;

        // Synthesize Beep 1
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5 note
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        // Synthesize Beep 2 (offset)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.5, now + 0.25); // C6 note
        gain2.gain.setValueAtTime(0.3, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.6);

    } catch (e) {
        console.error("No se pudo reproducir la alarma por restricciones de la API de Audio:", e);
    }
}

// Cargar contadores desde localStorage (con migración desde legacy bossTimers)
function loadContadores() {
    let saved = localStorage.getItem('contadores');
    if (!saved) {
        saved = localStorage.getItem('bossTimers');
        if (saved) {
            localStorage.setItem('contadores', saved);
            localStorage.removeItem('bossTimers');
        }
    }

    if (saved) {
        try {
            contadores = JSON.parse(saved);
        } catch (e) {
            contadores = [...DEFAULT_CONTADORES];
        }
    } else {
        contadores = [...DEFAULT_CONTADORES];
        saveContadores();
    }
}

function saveContadores() {
    localStorage.setItem('contadores', JSON.stringify(contadores));
}

// Renders the Contadores Grid
function renderContadores() {
    const grid = document.getElementById('contadores-grid');
    if (!grid) return;

    loadContadores();

    grid.innerHTML = contadores.map(contador => {
        const isActive = contador.endTime !== null;
        let timeLeft = 0;
        let timeString = '00:00:00';
        let cardClass = 'card contador-card';

        if (isActive) {
            timeLeft = Math.max(0, contador.endTime - Date.now());

            // Format time left
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);

            timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (timeLeft > 0) {
                cardClass += ' timer-active';
            } else {
                cardClass += ' timer-warning';
            }
        } else {
            // Default time string shown is the respawn duration
            const hours = Math.floor((contador.respawnTime * 60000) / 3600000);
            const minutes = Math.floor(((contador.respawnTime * 60000) % 3600000) / 60000);
            timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        }

        const deleteButton = `<button class="icon-btn delete" onclick="deleteContador('${contador.id}')" title="Eliminar Contador" style="width:28px; height:28px;"><i class="fa-solid fa-trash"></i></button>`;

        return `
            <div class="${cardClass}" id="contador-card-${contador.id}">
                <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <button class="icon-btn" onclick="toggleMuteContador('${contador.id}')" title="${contador.isMuted ? 'Desmutear Alarma' : 'Mutear Alarma'}" style="color:${contador.isMuted ? 'rgba(255,255,255,0.3)' : 'var(--primary)'}; width:28px; height:28px;">
                        <i class="fa-solid ${contador.isMuted ? 'fa-volume-mute' : 'fa-volume-high'}"></i>
                    </button>
                    <div style="font-size:0.8rem; opacity:0.6;"><i class="fa-solid fa-rotate-left"></i> ${contador.respawnTime}m</div>
                    ${deleteButton}
                </div>
                <div class="card-header" style="padding:0; margin-bottom:0.5rem; justify-content:center;">
                    <div class="card-title" style="font-size:1.2rem; text-align:center; font-weight:700;">${contador.name}</div>
                </div>
                <div class="card-content">
                    <div class="timer-display" id="timer-display-${contador.id}">${timeString}</div>
                </div>
                <div class="contador-card-footer">
                    ${isActive && timeLeft > 0 ?
                `<button class="btn-secondary" onclick="stopContador('${contador.id}')"><i class="fa-solid fa-stop"></i> Detener</button>` :
                `<button class="btn-primary" onclick="startContador('${contador.id}')"><i class="fa-solid fa-play"></i> Iniciar</button>`
            }
                    <button class="btn-secondary" onclick="startContador('${contador.id}')" title="Reiniciar desde el inicio"><i class="fa-solid fa-redo"></i> Reset</button>
                </div>
            </div>
        `;
    }).join('');
}

// Timer loops every second updating countdown displays
let timerInterval = null;
function startTimerEngine() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        contadores.forEach(contador => {
            if (contador.endTime !== null) {
                const timeLeft = contador.endTime - Date.now();
                const card = document.getElementById(`contador-card-${contador.id}`);
                const display = document.getElementById(`timer-display-${contador.id}`);

                if (timeLeft <= 0) {
                    if (display) display.innerText = '00:00:00';
                    if (card && !card.classList.contains('timer-warning')) {
                        card.className = 'card contador-card timer-warning';
                        if (!contador.isMuted) {
                            playAlarmSound();
                        }
                    }
                } else {
                    const hours = Math.floor(timeLeft / 3600000);
                    const minutes = Math.floor((timeLeft % 3600000) / 60000);
                    const seconds = Math.floor((timeLeft % 60000) / 1000);

                    if (display) {
                        display.innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    }
                    if (card && !card.classList.contains('timer-active')) {
                        card.className = 'card contador-card timer-active';
                    }
                }
            }
        });
    }, 1000);
}

// Timer actions
function startContador(contadorId) {
    const contador = contadores.find(c => c.id === contadorId);
    if (!contador) return;

    contador.endTime = Date.now() + (contador.respawnTime * 60 * 1000);
    saveContadores();
    renderContadores();
}

function stopContador(contadorId) {
    const contador = contadores.find(c => c.id === contadorId);
    if (!contador) return;

    contador.endTime = null;
    saveContadores();
    renderContadores();
}

function toggleMuteContador(contadorId) {
    const contador = contadores.find(c => c.id === contadorId);
    if (!contador) return;

    contador.isMuted = !contador.isMuted;
    saveContadores();
    renderContadores();
}

function deleteContador(contadorId) {
    if (!confirm('¿Eliminar este contador?')) return;
    contadores = contadores.filter(c => c.id !== contadorId);
    saveContadores();
    renderContadores();
}

function restoreDefaultContadores() {
    if (!confirm('¿Restaurar los contadores por defecto (Clockworks, Red Meteonyker, Giant Mushpoie)? Esto agregará los que falten.')) return;

    DEFAULT_CONTADORES.forEach(defCont => {
        if (!contadores.some(c => c.id === defCont.id)) {
            contadores.push({ ...defCont });
        }
    });

    saveContadores();
    renderContadores();
}

// Modal actions
function openContadorModal() {
    document.getElementById('bt-name-input').value = '';
    document.getElementById('bt-time-input').value = '';
    document.getElementById('contadores-modal').classList.add('show');
}

function closeContadorModal() {
    document.getElementById('contadores-modal').classList.remove('show');
}

function submitAddContador() {
    const name = document.getElementById('bt-name-input').value.trim();
    const duration = parseInt(document.getElementById('bt-time-input').value);

    if (!name || isNaN(duration) || duration <= 0) {
        alert('Por favor introduce un nombre válido y un tiempo en minutos.');
        return;
    }

    const newContador = {
        id: 'custom_' + Date.now(),
        name: name,
        respawnTime: duration,
        endTime: null,
        isMuted: false
    };

    contadores.push(newContador);
    saveContadores();
    closeContadorModal();
    renderContadores();
}

// Initialize Timer Engine when document loads
document.addEventListener('DOMContentLoaded', () => {
    loadContadores();
    startTimerEngine();
});

// ---------------------------------------------------------
// Account Details Modal Functions
// ---------------------------------------------------------
function openAccountDetailsModal(accountId) {
    lastOpenAccountId = accountId;
    prefillAccountId = accountId;
    const acc = accounts.find(a => a.id == accountId);
    if (!acc) return;

    const accChars = characters.filter(c => c.account_id == accountId);

    document.getElementById('ad-title').innerText = acc.email;

    // Set the click event for the add character button
    const addCharBtn = document.getElementById('ad-add-char-btn');
    if (addCharBtn) {
        addCharBtn.onclick = () => {
            lastOpenAccountId = accountId;
            closeAccountDetailsModal();
            prefillAccountId = accountId;
            openModal('character');
        };
    }

    // Set the click event for the edit account button
    const editAccBtn = document.getElementById('ad-edit-acc-btn');
    if (editAccBtn) {
        editAccBtn.onclick = () => {
            closeAccountDetailsModal();
            openModal('account', accountId);
        };
    }

    // Render credentials with visibility toggle
    renderAccountModalCredentials(acc);

    const grid = document.getElementById('ad-characters-grid');
    grid.innerHTML = accChars.map(char => {
        const charType = char.char_type || 'Unknown';
        const charTypeLower = charType.toLowerCase ? charType.toLowerCase() : 'unknown';
        return `
        <div class="card">
            <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                <button class="icon-btn favorite ${char.is_favorite ? 'active' : ''}" 
                        onclick="toggleFavoriteFromAccountDetails(${char.id}, ${accountId})" 
                        title="Toggle Favorite"
                        style="color: ${char.is_favorite ? '#fbbf24' : 'rgba(255,255,255,0.3)'};">
                    <i class="fa-${char.is_favorite ? 'solid' : 'regular'} fa-star"></i>
                </button>
                <div class="card-actions" style="opacity:1;">
                    <button class="icon-btn" onclick="lastOpenAccountId = ${accountId}; closeAccountDetailsModal(); openModal('character', ${char.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteCharacterFromAccountDetails(${char.id}, ${accountId})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-header" style="padding-top:0; margin-bottom:0.5rem;">
                <div class="card-title" style="word-break:break-all;">${char.name || 'Unnamed'}</div>
            </div>
            <div class="card-content">
                <p>${i18n('field_level')} <span class="value">${char.level || 0}</span></p>
                <p>${i18n('field_class')} <span class="value">${char.class_name || 'None'}</span></p>
                <p>${i18n('settings_char_types')} <span class="badge badge-${charTypeLower}">${charType}</span></p>
                <div class="recommended-spot">
                    <i class="fa-solid fa-map-location-dot"></i> <span>${getRecommendedZone(char.level)}</span>
                </div>
            </div>
        </div>
    `}).join('') || `<p style="opacity:0.6; font-style:italic; padding:10px;">No characters associated with this account.</p>`;

    document.getElementById('account-details-modal').classList.add('show');
}

function closeAccountDetailsModal() {
    document.getElementById('account-details-modal').classList.remove('show');
}

function renderAccountModalCredentials(acc) {
    document.getElementById('ad-credentials').innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.2); padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <span style="opacity:0.6; font-size:0.8rem;">Email:</span>
            <span style="font-weight:bold; font-size:0.9rem;">${acc.email}</span>
            <button class="icon-btn" onclick="copyAccountEmail(${acc.id})" title="${i18n('action_copy_email')}" style="padding:2px 6px;"><i class="fa-solid fa-envelope"></i></button>
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.2); padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <span style="opacity:0.6; font-size:0.8rem;">Pass:</span>
            <span style="font-weight:bold; font-size:0.9rem; font-family:monospace;">******</span>
            <button class="icon-btn" onclick="copyAccountPassword(${acc.id})" title="${i18n('action_copy_pass')}" style="padding:2px 6px;"><i class="fa-solid fa-key"></i></button>
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.2); padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <span style="opacity:0.6; font-size:0.8rem;">PIN:</span>
            <span style="font-weight:bold; font-size:0.9rem; font-family:monospace;">****</span>
            <button class="icon-btn" onclick="copyAccountPin(${acc.id})" title="${i18n('action_copy_pin')}" style="padding:2px 6px;"><i class="fa-solid fa-lock"></i></button>
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.2); padding:6px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <span style="opacity:0.6; font-size:0.8rem;">OTP:</span>
            <span style="font-weight:bold; font-size:0.9rem; font-family:monospace;">******</span>
            <button class="icon-btn" onclick="copyAccountOtp(${acc.id})" title="${i18n('action_copy_otp')}" style="padding:2px 6px;"><i class="fa-solid fa-shield-halved"></i></button>
        </div>
        <button class="btn-autologin" onclick="triggerAutoLogin(${acc.id})" title="Auto-Login (UAC)" style="padding:6px 12px; border-radius:8px;"><i class="fa-solid fa-keyboard"></i> Auto-Login</button>
    `;
}

// ---------------------------------------------------------
// Search Clear Buttons
// ---------------------------------------------------------
function clearSearchInput(inputId, callback) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        const clearBtn = input.nextElementSibling;
        if (clearBtn && clearBtn.classList.contains('clear-search-btn')) {
            clearBtn.style.display = 'none';
        }
        callback();
    }
}

function checkSearchClearButton(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        const clearBtn = input.nextElementSibling;
        if (clearBtn && clearBtn.classList.contains('clear-search-btn')) {
            clearBtn.style.display = input.value ? 'inline-flex' : 'none';
        }
    }
}

async function deleteCharacterFromAccountDetails(charId, accountId) {
    if (!confirm(i18n('msg_confirm_delete'))) return;
    try {
        await fetch(`${API_URL}/characters/${charId}`, { method: 'DELETE' });
        await fetchCharacters();
        openAccountDetailsModal(accountId);
    } catch (e) { console.error(e); }
}

async function toggleFavoriteFromAccountDetails(charId, accountId) {
    await toggleFavorite(charId);
    openAccountDetailsModal(accountId);
}

// ---------------------------------------------------------
// Zona de Logeo (Login Zones)
// ---------------------------------------------------------

async function loadLoginZones() {
    try {
        const res = await fetch(`${API_URL}/config/login-zones`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                loginZones = data;
                localStorage.setItem('login_zones', JSON.stringify(loginZones));
                return loginZones;
            }
        }
    } catch (e) {
        console.warn("Error fetching login_zones from backend API, using localStorage fallback:", e);
    }
    const saved = localStorage.getItem('login_zones');
    if (saved) {
        try {
            loginZones = JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing login_zones:", e);
            loginZones = [];
        }
    } else {
        loginZones = [];
    }
    return loginZones;
}

async function saveLoginZones() {
    localStorage.setItem('login_zones', JSON.stringify(loginZones));
    try {
        await fetch(`${API_URL}/config/login-zones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginZones)
        });
    } catch (e) {
        console.error("Error saving login_zones to backend API:", e);
    }
}

async function renderLoginZones() {
    const grid = document.getElementById('loginzone-grid');
    if (!grid) return;

    await loadLoginZones();

    if (loginZones.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--glass-bg); border: 1px dashed var(--glass-border); border-radius: 16px; opacity: 0.7;">
                <i class="fa-solid fa-desktop" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem; display: block;"></i>
                <p>No hay zonas de logeo creadas.</p>
                <button class="btn-primary" onclick="openLoginZoneModal()" style="margin-top: 1rem;">Crear Primera Zona</button>
            </div>
        `;
        return;
    }

    // Helper to get Account Email
    const getAccountEmail = (id) => {
        if (!id) return 'No Account';
        const acc = accounts.find(a => a.id == id);
        return acc ? acc.email : 'Unknown';
    };

    grid.innerHTML = loginZones.map(zone => {
        // HTML for assigned characters list
        let zoneCharactersHtml = '';
        if (!zone.characterIds || zone.characterIds.length === 0) {
            zoneCharactersHtml = `<p style="opacity:0.5; font-style:italic; font-size:0.85rem; padding:10px 0; text-align:center;">Sin personajes asignados.</p>`;
        } else {
            zoneCharactersHtml = zone.characterIds.map(charId => {
                const char = characters.find(c => c.id == charId);
                if (!char) return ''; // Skip if not found

                const charType = char.char_type || 'Unknown';
                const charTypeLower = charType.toLowerCase ? charType.toLowerCase() : 'unknown';

                return `
                    <div class="zone-char-item" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:8px; border-radius:8px; display:flex; flex-direction:column; gap:5px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:600; color:white; font-size:0.9rem; cursor:pointer;" class="clickable" onclick="openAccountDetailsModal(${char.account_id})">${char.name}</span>
                            <button class="icon-btn delete" onclick="removeCharacterFromZone(${zone.id}, ${char.id})" title="Desasignar" style="padding:2px; font-size:0.75rem;">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; opacity:0.7;">
                            <span>Niv. ${char.level} - ${char.class_name}</span>
                            <span class="badge badge-${charTypeLower}" style="font-size:0.65rem; padding:1px 4px;">${charType}</span>
                        </div>
                        <div style="display:flex; gap:5px; margin-top:3px; justify-content:flex-end;">
                            <button class="btn-secondary" style="padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;" onclick="copyToClipboard('${getAccountEmail(char.account_id)}')" title="${i18n('action_copy_email')}"><i class="fa-solid fa-envelope"></i></button>
                            <button class="btn-secondary" style="padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;" onclick="copyCharacterPassword(${char.id})" title="${i18n('action_copy_pass')}"><i class="fa-solid fa-key"></i></button>
                            <button class="btn-secondary" style="padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;" onclick="copyAccountPin(${char.account_id})" title="${i18n('action_copy_pin')}"><i class="fa-solid fa-lock"></i></button>
                            <button class="btn-autologin" style="padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;" onclick="triggerAutoLogin(${char.account_id})" title="Auto-Login"><i class="fa-solid fa-keyboard"></i></button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="card">
                <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-desktop" style="color:var(--primary); font-size:1.1rem;"></i>
                        <span style="font-weight:600; font-size:1.05rem;">${zone.name}</span>
                    </div>
                    <div class="card-actions" style="opacity:1;">
                        <button class="icon-btn" onclick="openLoginZoneModal(${zone.id})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button class="icon-btn delete" onclick="deleteLoginZone(${zone.id})" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                
                <div class="card-content" style="display:flex; flex-direction:column; gap:10px; padding:0;">
                    <div style="font-size:0.8rem; font-weight:600; opacity:0.8; display:flex; justify-content:space-between; align-items:center;">
                        <span>Personajes Asignados (${(zone.characterIds || []).length})</span>
                    </div>
                    <div class="zone-characters-list" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:3px;">
                        ${zoneCharactersHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openLoginZoneModal(id = null) {
    const modalEl = document.getElementById('loginzone-modal');
    if (!modalEl) return;

    const titleEl = document.getElementById('loginzone-modal-title');
    const idInput = document.getElementById('loginzone-id-input');
    const nameInput = document.getElementById('loginzone-name-input');
    const checklistContainer = document.getElementById('loginzone-chars-checklist');

    let zone = null;
    if (id) {
        zone = loginZones.find(z => z.id == id);
        if (zone) {
            titleEl.innerText = currentLang === 'es' ? "Editar Zona de Logeo" : "Edit Login Zone";
            idInput.value = zone.id;
            nameInput.value = zone.name;
        }
    } else {
        titleEl.innerText = currentLang === 'es' ? "Nueva Zona de Logeo" : "New Login Zone";
        idInput.value = '';
        nameInput.value = '';
    }

    // Populate checklist of characters
    if (checklistContainer) {
        const assignedSet = zone && zone.characterIds ? new Set(zone.characterIds.map(cid => parseInt(cid))) : new Set();

        checklistContainer.innerHTML = characters
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            .map(char => {
                const isChecked = assignedSet.has(parseInt(char.id));
                return `
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; padding: 4px; border-radius: 4px; transition: background 0.2s;">
                        <input type="checkbox" class="zone-char-checkbox" value="${char.id}" ${isChecked ? 'checked' : ''} style="accent-color: var(--primary); cursor: pointer; width: 16px; height: 16px;">
                        <span>${char.name} <span style="font-size:0.75rem; opacity:0.6;">(Niv. ${char.level} - ${char.class_name || 'None'})</span></span>
                    </label>
                `;
            }).join('') || `<p style="opacity:0.5; font-style:italic; font-size:0.85rem; padding:5px; text-align:center;">${currentLang === 'es' ? 'No hay personajes disponibles.' : 'No characters available.'}</p>`;
    }

    modalEl.classList.add('show');
}

function closeLoginZoneModal() {
    const modalEl = document.getElementById('loginzone-modal');
    if (modalEl) modalEl.classList.remove('show');
}

async function submitLoginZone() {
    const idInput = document.getElementById('loginzone-id-input');
    const nameInput = document.getElementById('loginzone-name-input');
    const name = nameInput.value.trim();

    if (!name) {
        alert(currentLang === 'es' ? "Por favor ingrese un nombre para la zona." : "Please enter a zone name.");
        return;
    }

    // Get checked character IDs
    const checkedCheckboxes = document.querySelectorAll('.zone-char-checkbox:checked');
    const characterIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));

    const id = idInput.value;
    if (id) {
        // Edit
        const zone = loginZones.find(z => z.id == id);
        if (zone) {
            zone.name = name;
            zone.characterIds = characterIds;
        }
    } else {
        // Create new
        const newZone = {
            id: Date.now(),
            name: name,
            characterIds: characterIds
        };
        loginZones.push(newZone);
    }

    await saveLoginZones();
    closeLoginZoneModal();
    renderLoginZones();
}

async function deleteLoginZone(id) {
    if (!confirm(currentLang === 'es' ? "¿Estás seguro de que quieres eliminar esta zona?" : "Are you sure you want to delete this zone?")) {
        return;
    }
    loginZones = loginZones.filter(z => z.id != id);
    await saveLoginZones();
    renderLoginZones();
}

async function removeCharacterFromZone(zoneId, charId) {
    const zone = loginZones.find(z => z.id == zoneId);
    if (zone && zone.characterIds) {
        zone.characterIds = zone.characterIds.filter(id => id != charId);
        await saveLoginZones();
        renderLoginZones();
    }
}

function renderDashboard() {
    // 1. KPI Cards data
    const totalAccounts = accounts.length;
    const totalCharacters = characters.length;

    const vacantAccounts = accounts.filter(acc => {
        const charCount = characters.filter(c => c.account_id == acc.id).length;
        return charCount < 3;
    }).length;

    const levelingQueue = levelQueue.length;

    const activeTimers = contadores.filter(c => c.endTime !== null && c.endTime > Date.now()).length;

    // Update KPI UI
    const elAccounts = document.getElementById('kpi-total-accounts');
    if (elAccounts) elAccounts.innerText = totalAccounts;

    const elCharacters = document.getElementById('kpi-total-characters');
    if (elCharacters) elCharacters.innerText = totalCharacters;

    const elVacantes = document.getElementById('kpi-total-vacantes');
    if (elVacantes) elVacantes.innerText = vacantAccounts;

    const elLeveling = document.getElementById('kpi-leveling-queue');
    if (elLeveling) elLeveling.innerText = levelingQueue;

    const elTimers = document.getElementById('kpi-active-timers');
    if (elTimers) elTimers.innerText = activeTimers;

    // 2. Class Distribution Progress List
    const classChart = document.getElementById('class-dist-chart');
    if (classChart) {
        if (totalCharacters === 0) {
            classChart.innerHTML = `<p style="opacity:0.5; font-style:italic;">${i18n('field_desc_empty')}</p>`;
        } else {
            const classCounts = {};
            characters.forEach(c => {
                const cls = c.class_name || 'Vagrant';
                classCounts[cls] = (classCounts[cls] || 0) + 1;
            });

            // Sort descending
            const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);

            let html = '<div class="progress-list">';
            sortedClasses.forEach(([cls, count]) => {
                const pct = Math.round((count / totalCharacters) * 100);
                const clsLower = cls.toLowerCase();
                html += `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-name">
                            <span class="badge badge-${clsLower}">${cls}</span>
                        </span>
                        <span class="progress-value" style="font-weight:600; color:var(--text-main);">${count} (${pct}%)</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-bar" style="width: ${pct}%; background: var(--cls-${clsLower}, var(--primary));"></div>
                    </div>
                </div>`;
            });
            html += '</div>';
            classChart.innerHTML = html;
        }
    }

    // 3. Roles and Types Progress List
    const roleChart = document.getElementById('role-dist-chart');
    if (roleChart) {
        if (totalCharacters === 0) {
            roleChart.innerHTML = `<p style="opacity:0.5; font-style:italic;">${i18n('field_desc_empty')}</p>`;
        } else {
            const typeCounts = {};
            characters.forEach(c => {
                const type = c.char_type || 'Unknown';
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

            let html = '<div class="progress-list">';
            sortedTypes.forEach(([type, count]) => {
                const pct = Math.round((count / totalCharacters) * 100);
                let icon = '<i class="fa-solid fa-users-gear" style="color:var(--primary);"></i>';
                if (type.toLowerCase().includes('main')) icon = '<i class="fa-solid fa-star" style="color:#fbbf24;"></i>';
                else if (type.toLowerCase().includes('farm')) icon = '<i class="fa-solid fa-wheat-awn" style="color:#f59e0b;"></i>';
                else if (type.toLowerCase().includes('filler') || type.toLowerCase().includes('party')) icon = '<i class="fa-solid fa-user-plus" style="color:#3b82f6;"></i>';

                html += `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="progress-name">${icon} ${type}</span>
                        <span class="progress-value" style="font-weight:600; color:var(--text-main);">${count} (${pct}%)</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-bar" style="width: ${pct}%; background: linear-gradient(90deg, var(--primary), var(--primary-hover));"></div>
                    </div>
                </div>`;
            });
            html += '</div>';
            roleChart.innerHTML = html;
        }
    }

    // 4. Level Ranges Bar Chart
    const levelChart = document.getElementById('level-dist-chart');
    if (levelChart) {
        if (totalCharacters === 0) {
            levelChart.innerHTML = `<p style="opacity:0.5; font-style:italic;">${i18n('field_desc_empty')}</p>`;
        } else {
            const ranges = [
                { label: '1-15', min: 1, max: 15, count: 0 },
                { label: '16-60', min: 16, max: 60, count: 0 },
                { label: '61-90', min: 61, max: 90, count: 0 },
                { label: '91-120', min: 91, max: 120, count: 0 },
                { label: '121+', min: 121, max: 200, count: 0 }
            ];

            characters.forEach(c => {
                const lvl = c.level || 1;
                for (const r of ranges) {
                    if (lvl >= r.min && lvl <= r.max) {
                        r.count++;
                        break;
                    }
                }
            });

            const maxCount = Math.max(...ranges.map(r => r.count), 1);

            let html = `<div style="display:flex; justify-content:space-around; align-items:flex-end; height:180px; width:100%; padding-top:20px;">`;
            ranges.forEach(r => {
                const pctHeight = Math.max(5, Math.round((r.count / maxCount) * 140)); // Max height of bar is 140px
                html += `
                <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
                    <span style="font-size:0.75rem; color:var(--text-main); font-weight:600; margin-bottom:4px;">${r.count}</span>
                    <div style="width:28px; height:${pctHeight}px; background:linear-gradient(to top, var(--secondary), var(--primary)); border-radius:4px 4px 0 0; border:1px solid var(--glass-border); transition: height 0.5s;"></div>
                    <span style="font-size:0.7rem; color:var(--text-muted); margin-top:8px;">${r.label}</span>
                </div>`;
            });
            html += '</div>';
            levelChart.innerHTML = html;
        }
    }
}

// Auto Tool Integration
async function fetchAutoToolStatus() {
    try {
        const res = await fetch(`${API_URL}/autotool/status`);
        if (res.ok) {
            const data = await res.json();
            updateAutoToolUI(data);
        }
    } catch (e) {
        console.error("Error fetching autotool status:", e);
    }
}

async function toggleAutoRess(enabled) {
    try {
        const res = await fetch(`${API_URL}/autotool/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
        if (res.ok) {
            const data = await res.json();
            updateAutoToolUI(data);
        }
    } catch (e) {
        console.error("Error toggling autoress:", e);
    }
}

function updateAutoToolUI(data) {
    const toggle = document.getElementById('autoress-toggle');
    const badge = document.getElementById('autoress-status-badge');
    const countEl = document.getElementById('autoress-count');

    if (toggle) toggle.checked = data.enabled;
    if (countEl) countEl.innerText = data.count;

    if (badge) {
        if (data.enabled) {
            badge.className = 'tool-status-badge active';
            badge.querySelector('.status-text').innerText = 'ON';
        } else {
            badge.className = 'tool-status-badge inactive';
            badge.querySelector('.status-text').innerText = 'OFF';
        }
    }
}

/* ==========================================================================
   FEATURE 1: GEAR & FASHION TRACKER (FLYFF INVENTORY GRID REDESIGN)
   ========================================================================== */
let gearCatalog = null;
let piercingCatalog = null;
let characterGear = [];

const FLYFF_SLOT_LABELS = {
    talisman1: 'Talismán 1',
    jewelry_ring1: 'Anillo 1',
    jewelry_earring1: 'Pendiente 1',
    jewelry_necklace: 'Collar',
    jewelry_earring2: 'Pendiente 2',
    jewelry_ring2: 'Anillo 2',
    talisman2: 'Talismán 2',
    weapon: 'Arma Principal',
    shield: 'Escudo / Secundario',
    cloak: 'Capa / Alas',
    suit_head: 'Casco / Cabeza',
    suit_body: 'Torso / Pecho',
    suit_gloves: 'Guantes',
    suit_shoes: 'Botas / Calzado',
    fashion_head: 'Gorro Fashion',
    fashion_suit: 'Traje Fashion',
    fashion_gloves: 'Guantes Fashion',
    fashion_shoes: 'Botas Fashion',
    talisman: 'Talismán'
};

async function fetchGearData() {
    try {
        if (!gearCatalog) {
            const catRes = await fetch(`${API_URL}/gear/catalog`);
            gearCatalog = await catRes.json();
        }
        if (!piercingCatalog) {
            try {
                const pRes = await fetch(`${API_URL}/gear/piercing-catalog`);
                piercingCatalog = await pRes.json();
            } catch (e) { piercingCatalog = { piercing_rules: {} }; }
        }
        const gearRes = await fetch(`${API_URL}/gear`);
        characterGear = await gearRes.json();
        populateGearFilters();
        renderGearView();
    } catch (e) {
        console.error('Error fetching gear data:', e);
    }
}

function populateGearFilters() {
    const charSelect = document.getElementById('gear-char-filter');
    if (charSelect) {
        let html = '<option value="">Todos los Personajes</option>';
        characters.forEach(c => {
            html += `<option value="${c.id}">${c.name} (Lvl ${c.level} ${c.class_name || ''})</option>`;
        });
        charSelect.innerHTML = html;
    }
}

function isSameId(id1, id2) {
    if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) return false;
    const s1 = String(id1).trim().replace(/\.0$/, '');
    const s2 = String(id2).trim().replace(/\.0$/, '');
    return s1 === s2;
}

function populateGearCharSelects() {
    const safeCharacters = Array.isArray(characters) ? characters : [];
    const charSelect = document.getElementById('gear-char-select');
    const targetCharSelect = document.getElementById('gear-target-char-select');

    let html = '';
    safeCharacters.forEach(c => {
        html += `<option value="${c.id}">${c.name} (${c.class_name || 'Sin clase'})</option>`;
    });

    if (charSelect) {
        const curVal = charSelect.value;
        charSelect.innerHTML = html || '<option value="">(Sin personajes)</option>';
        if (curVal && safeCharacters.some(c => isSameId(c.id, curVal))) {
            charSelect.value = curVal;
        }
    }
    if (targetCharSelect) {
        const curTargetVal = targetCharSelect.value;
        targetCharSelect.innerHTML = html || '<option value="">(Sin personajes)</option>';
        if (curTargetVal && safeCharacters.some(c => isSameId(c.id, curTargetVal))) {
            targetCharSelect.value = curTargetVal;
        }
    }
}

function openGearModal(gearItemOrCharId = null) {
    const modal = document.getElementById('gear-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('show');

    const safeCharacters = Array.isArray(characters) ? characters : [];
    if (!characterGear || !Array.isArray(characterGear)) characterGear = [];

    populateGearCharSelects();
    populateGearCombos();

    let targetCharId = safeCharacters.length > 0 ? safeCharacters[0].id : null;

    if (gearItemOrCharId && typeof gearItemOrCharId === 'object') {
        targetCharId = gearItemOrCharId.character_id;
    } else if (gearItemOrCharId) {
        targetCharId = gearItemOrCharId;
    }

    const charSelect = document.getElementById('gear-char-select');
    if (targetCharId && charSelect) {
        charSelect.value = targetCharId;
    }

    const activeId = charSelect?.value || targetCharId;
    if (activeId) {
        onGearCharSelectChange(activeId);
    }
}

function openGearModalForChar(charId) {
    openGearModal(charId);
}

function openGearModalByGearId(gearId) {
    const safeGear = Array.isArray(characterGear) ? characterGear : [];
    const item = safeGear.find(g => isSameId(g.id, gearId));
    if (item) {
        openGearModal(item.character_id);
    } else {
        openGearModal();
    }
}

function closeGearModal() {
    const modal = document.getElementById('gear-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    renderGearView();
}

function parseElementAndRefine(elementStr) {
    if (!elementStr || elementStr === 'Ninguno') {
        return { type: 'Ninguno', refine: '+0' };
    }
    const match = elementStr.match(/^(.*?)\s*(?:\(\+?(\d+)\)|\+?(\d+))?$/);
    if (match) {
        const type = match[1].trim();
        const levelNum = match[2] || match[3] || '0';
        return { type: type || 'Ninguno', refine: `+${levelNum}` };
    }
    return { type: elementStr, refine: '+0' };
}

function formatElementAndRefine(type, refine) {
    if (!type || type === 'Ninguno') return 'Ninguno';
    if (!refine || refine === '+0' || refine === '0') return type;
    return `${type} (${refine})`;
}

function populateGearCombos() {
    const refineSelect = document.getElementById('gear-refine-select');
    const elemRefineSelect = document.getElementById('gear-element-refine-select');

    const refines = Array.from({ length: 21 }, (_, i) => `+${i}`);

    if (refineSelect) {
        refineSelect.innerHTML = refines.map(r => `<option value="${r}">${r}</option>`).join('');
    }
    if (elemRefineSelect) {
        elemRefineSelect.innerHTML = refines.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function getSlotConfig(slotKey) {
    const cfg = piercingCatalog?.slot_config || piercingCatalog?.piercing_rules || {};
    return cfg[slotKey] || { allow_refine: false, allow_element: false, max_piercings: 0 };
}

function updatePiercingForSlot(slotKey) {
    const cardSelect = document.getElementById('gear-card-select');
    const cardGroup = cardSelect?.closest('.form-group');
    if (!cardSelect) return;

    const slotCfg = getSlotConfig(slotKey);
    const maxP = slotCfg.max_piercings || 0;

    if (maxP === 0) {
        cardSelect.innerHTML = '<option value="Sin Piercings">Sin Piercings</option>';
        cardSelect.disabled = true;
        if (cardGroup) cardGroup.style.opacity = '0.4';
    } else {
        cardSelect.disabled = false;
        if (cardGroup) cardGroup.style.opacity = '1';
        let opts = `<option value="0/${maxP}">0/${maxP} (Sin Piercings)</option>`;
        for (let i = 1; i <= maxP; i++) {
            opts += `<option value="${i}/${maxP}">${i}/${maxP}</option>`;
        }
        cardSelect.innerHTML = opts;
    }
}

function onGearElementTypeChange() {
    const elemTypeSelect = document.getElementById('gear-element-type-select');
    const elemRefineSelect = document.getElementById('gear-element-refine-select');
    const slotKey = document.getElementById('gear-selected-slot')?.value || 'weapon';
    const slotCfg = getSlotConfig(slotKey);

    if (!elemTypeSelect || !elemRefineSelect) return;

    const selectedType = elemTypeSelect.value;
    const maxElemRefine = slotCfg.max_refine || 20;

    const currentRefineVal = elemRefineSelect.value;
    const refines = Array.from({ length: maxElemRefine + 1 }, (_, i) => `<option value="+${i}">+${i}</option>`).join('');
    elemRefineSelect.innerHTML = refines;

    if (!slotCfg.allow_element || selectedType === 'Ninguno') {
        elemRefineSelect.disabled = true;
        elemRefineSelect.value = '+0';
    } else {
        elemRefineSelect.disabled = false;
        if (currentRefineVal && currentRefineVal !== '+0') {
            elemRefineSelect.value = currentRefineVal;
        }
    }
}

function updateRefineForSlot(slotKey) {
    const slotCfg = getSlotConfig(slotKey);

    const refineSelect = document.getElementById('gear-refine-select');
    const refineGroup = refineSelect?.closest('.form-group');
    const elemTypeSelect = document.getElementById('gear-element-type-select');
    const elemRefineSelect = document.getElementById('gear-element-refine-select');
    const elemRow = elemTypeSelect?.closest('div[style*="display:flex"]');

    if (!slotCfg.allow_refine) {
        if (refineSelect) {
            refineSelect.innerHTML = '<option value="+0">+0</option>';
            refineSelect.disabled = true;
            refineSelect.value = '+0';
        }
        if (refineGroup) refineGroup.style.opacity = '0.4';
    } else {
        const maxR = slotCfg.max_refine || 20;
        if (refineSelect) {
            refineSelect.innerHTML = Array.from({ length: maxR + 1 }, (_, i) => `<option value="+${i}">+${i}</option>`).join('');
            refineSelect.disabled = false;
        }
        if (refineGroup) refineGroup.style.opacity = '1';
    }

    if (!slotCfg.allow_element) {
        if (elemTypeSelect) { elemTypeSelect.disabled = true; elemTypeSelect.value = 'Ninguno'; }
        if (elemRefineSelect) { elemRefineSelect.disabled = true; elemRefineSelect.value = '+0'; }
        if (elemRow) elemRow.style.opacity = '0.4';
    } else {
        if (elemTypeSelect) elemTypeSelect.disabled = false;
        if (elemRow) elemRow.style.opacity = '1';
        onGearElementTypeChange();
    }
}

function onGearCharSelectChange(charId) {
    const safeCharacters = Array.isArray(characters) ? characters : [];
    const char = safeCharacters.find(c => isSameId(c.id, charId));

    const charSelect = document.getElementById('gear-char-select');
    if (charSelect && charId) {
        charSelect.value = charId;
    }

    const avatarNameEl = document.getElementById('flyff-avatar-char-name');
    if (avatarNameEl) {
        avatarNameEl.innerText = char ? char.name : 'Personaje';
    }

    refreshFlyffSlotLabels(charId);
}

function refreshFlyffSlotLabels(charId) {
    const safeGear = characterGear || [];
    const charItems = safeGear.filter(g => isSameId(g.character_id, charId));

    Object.keys(FLYFF_SLOT_LABELS).forEach(slotKey => {
        const slotBtn = document.querySelector(`.flyff-slot[data-slot="${slotKey}"]`);
        const nameEl = document.getElementById(`slot-name-${slotKey}`);
        const equipped = charItems.find(g => g.slot === slotKey);

        if (slotBtn) {
            if (equipped) {
                slotBtn.classList.add('equipped');
                if (nameEl) nameEl.innerText = equipped.item_name;
            } else {
                slotBtn.classList.remove('equipped');
                if (nameEl) nameEl.innerText = 'Vacio';
            }
        }
    });
}

let _currentGearItemsList = [];

function filterGearCatalogByClass() {
    const slotKey = document.getElementById('gear-selected-slot')?.value || 'weapon';
    const currentCharId = document.getElementById('gear-char-select')?.value;
    const char = (typeof characters !== 'undefined' && characters) ? characters.find(c => isSameId(c.id, currentCharId)) : null;
    const charClass = char ? (char.class_name || char.job || '') : '';
    const isChecked = document.getElementById('gear-class-filter-check')?.checked;

    let catalogItems = (gearCatalog && gearCatalog.categories)
        ? (gearCatalog.categories[slotKey] || (slotKey.startsWith('talisman') ? gearCatalog.categories['talisman'] : []))
        : [];
    let filteredItems = catalogItems;

    if (isChecked && charClass) {
        if (slotKey === 'weapon' && gearCatalog?.categories?.weapon_by_class?.[charClass]) {
            filteredItems = gearCatalog.categories.weapon_by_class[charClass];
        }
        else if (['suit_head', 'suit_body', 'suit_gloves', 'suit_shoes'].includes(slotKey) && gearCatalog?.categories?.armor_by_class?.[charClass]) {
            const classArmors = gearCatalog.categories.armor_by_class[charClass];
            let slotKw = [];
            if (slotKey === 'suit_head') slotKw = ['helm', 'cap', 'hat', 'mask', 'crown'];
            else if (slotKey === 'suit_body') slotKw = ['suit', 'armor', 'vest', 'robe', 'shirt', 'set'];
            else if (slotKey === 'suit_gloves') slotKw = ['gaunt', 'glove', 'muffler', 'bracer'];
            else if (slotKey === 'suit_shoes') slotKw = ['boot', 'shoe'];

            const classSlotArmors = classArmors.filter(item => slotKw.some(k => item.toLowerCase().includes(k)));
            filteredItems = classSlotArmors.length > 0 ? classSlotArmors : classArmors;
        }
    }

    if (!filteredItems || filteredItems.length === 0) {
        filteredItems = catalogItems.length > 0 ? catalogItems : [];
    }

    const currentSearchVal = document.getElementById('gear-name-search')?.value;
    if (currentSearchVal && !filteredItems.includes(currentSearchVal)) {
        filteredItems = [currentSearchVal, ...filteredItems];
    }

    _currentGearItemsList = filteredItems;

    const searchInput = document.getElementById('gear-name-search');
    if (searchInput) {
        renderGearNameDropdown(filteredItems, searchInput.value || '');
    }
}

function renderGearNameDropdown(items, filter = '') {
    const dropdown = document.getElementById('gear-name-dropdown');
    if (!dropdown) return;

    const lowerFilter = filter.toLowerCase();
    const filtered = lowerFilter ? items.filter(item => item.toLowerCase().includes(lowerFilter)) : items;

    if (filtered.length === 0) {
        dropdown.innerHTML = '<div style="padding:8px 12px; color:rgba(255,255,255,0.4); font-size:0.85rem;">Sin resultados</div>';
    } else {
        dropdown.innerHTML = filtered.map(item =>
            `<div class="gear-dropdown-option" style="padding:7px 12px; cursor:pointer; font-size:0.85rem; color:white; border-bottom:1px solid rgba(255,255,255,0.05);"
                  onmousedown="selectGearNameOption('${item.replace(/'/g, "\\'")}')"
                  onmouseenter="this.style.background='rgba(99,102,241,0.3)'"
                  onmouseleave="this.style.background='transparent'">${item}</div>`
        ).join('');
    }
}

function showGearNameDropdown() {
    const dropdown = document.getElementById('gear-name-dropdown');
    const searchInput = document.getElementById('gear-name-search');
    if (dropdown) {
        renderGearNameDropdown(_currentGearItemsList, searchInput?.value || '');
        dropdown.style.display = 'block';
    }
}

function hideGearNameDropdown() {
    const dropdown = document.getElementById('gear-name-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function filterGearNameDropdown(value) {
    renderGearNameDropdown(_currentGearItemsList, value);
    const dropdown = document.getElementById('gear-name-dropdown');
    if (dropdown) dropdown.style.display = 'block';

    const hiddenSelect = document.getElementById('gear-name-select');
    if (hiddenSelect) hiddenSelect.value = value;
}

function selectGearNameOption(itemName) {
    const searchInput = document.getElementById('gear-name-search');
    const hiddenSelect = document.getElementById('gear-name-select');
    if (searchInput) searchInput.value = itemName;
    if (hiddenSelect) hiddenSelect.value = itemName;
    hideGearNameDropdown();
}

document.addEventListener('click', function (e) {
    const searchInput = document.getElementById('gear-name-search');
    const dropdown = document.getElementById('gear-name-dropdown');
    if (searchInput && dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        hideGearNameDropdown();
    }
});

function closeSlotItemModal() {
    const modal = document.getElementById('slot-item-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
    hideGearNameDropdown();
}

function selectFlyffSlot(slotKey, specificGearId = null) {
    populateGearCharSelects();

    document.querySelectorAll('.flyff-slot').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`.flyff-slot[data-slot="${slotKey}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    const slotSelectedInput = document.getElementById('gear-selected-slot');
    if (slotSelectedInput) slotSelectedInput.value = slotKey;

    const isFashion = slotKey.startsWith('fashion_');
    const category = isFashion ? 'Fashion' : 'Combat';
    const slotTitle = FLYFF_SLOT_LABELS[slotKey] || slotKey;

    const modalTitleEl = document.getElementById('slot-modal-title');
    const modalBadgeEl = document.getElementById('slot-modal-badge');

    if (modalTitleEl) modalTitleEl.innerHTML = `<i class="fa-solid fa-box-archive"></i> Configurar ${slotTitle}`;
    if (modalBadgeEl) {
        modalBadgeEl.innerText = category;
        modalBadgeEl.style.background = isFashion ? '#ec4899' : 'var(--primary)';
    }

    const currentCharId = document.getElementById('gear-char-select')?.value;
    const char = (typeof characters !== 'undefined' && characters) ? characters.find(c => isSameId(c.id, currentCharId)) : null;
    const charClass = char ? (char.class_name || char.job || 'Sin Clase') : 'Sin Clase';

    const classLabelEl = document.getElementById('gear-class-label');
    if (classLabelEl) classLabelEl.innerText = charClass;

    filterGearCatalogByClass();
    updatePiercingForSlot(slotKey);
    updateRefineForSlot(slotKey);

    const nameSelect = document.getElementById('gear-name-select');
    const nameSearch = document.getElementById('gear-name-search');
    const safeGear = characterGear || [];
    let equipped = null;
    if (specificGearId) {
        equipped = safeGear.find(g => isSameId(g.id, specificGearId));
    } else {
        equipped = safeGear.find(g => isSameId(g.character_id, currentCharId) && g.slot === slotKey);
    }

    const idInput = document.getElementById('gear-id-input');
    const targetCharSelect = document.getElementById('gear-target-char-select');
    const refineSelect = document.getElementById('gear-refine-select');
    const elemTypeSelect = document.getElementById('gear-element-type-select');
    const elemRefineSelect = document.getElementById('gear-element-refine-select');
    const cardSelect = document.getElementById('gear-card-select');
    const noteInput = document.getElementById('gear-note-input');
    const slotCfg = getSlotConfig(slotKey);

    if (equipped) {
        if (idInput) idInput.value = equipped.id;
        if (targetCharSelect) targetCharSelect.value = equipped.character_id || currentCharId;
        if (nameSelect) nameSelect.value = equipped.item_name || '';
        if (nameSearch) nameSearch.value = equipped.item_name || '';
        if (refineSelect && slotCfg.allow_refine) refineSelect.value = equipped.refine_level || '+0';

        const parsedElem = parseElementAndRefine(equipped.element);
        if (elemTypeSelect && slotCfg.allow_element) {
            elemTypeSelect.value = parsedElem.type;
            onGearElementTypeChange();
            if (elemRefineSelect) elemRefineSelect.value = parsedElem.refine;
        }

        if (cardSelect) cardSelect.value = equipped.card_pierce || 'Sin Piercings';
        if (noteInput) noteInput.value = equipped.note || '';
    } else {
        if (idInput) idInput.value = '';
        if (targetCharSelect) targetCharSelect.value = currentCharId;
        if (nameSearch) nameSearch.value = '';
        if (nameSelect) nameSelect.value = '';
        if (refineSelect) refineSelect.value = '+0';
        if (elemTypeSelect) {
            elemTypeSelect.value = 'Ninguno';
            onGearElementTypeChange();
        }
        if (elemRefineSelect) elemRefineSelect.value = '+0';
        if (cardSelect) cardSelect.value = 'Sin Piercings';
        if (noteInput) noteInput.value = '';
    }

    hideGearNameDropdown();

    const slotModal = document.getElementById('slot-item-modal');
    if (slotModal) {
        slotModal.style.display = 'flex';
        slotModal.classList.add('show');
    }
}

async function submitGearForm() {
    const id = document.getElementById('gear-id-input')?.value;
    const slotKey = document.getElementById('gear-selected-slot')?.value || 'weapon';
    const charId = document.getElementById('gear-char-select')?.value;
    const targetCharId = document.getElementById('gear-target-char-select')?.value || charId;
    const isFashion = slotKey.startsWith('fashion_');

    const itemName = (document.getElementById('gear-name-select')?.value || document.getElementById('gear-name-search')?.value || '').trim();
    if (!itemName) {
        alert('Por favor ingrese o seleccione un ítem para el equipamiento.');
        return;
    }

    const elemType = document.getElementById('gear-element-type-select')?.value || 'Ninguno';
    const elemRefine = document.getElementById('gear-element-refine-select')?.value || '+0';
    const formattedElement = formatElementAndRefine(elemType, elemRefine);

    const data = {
        character_id: targetCharId,
        gear_category: isFashion ? 'Fashion' : 'Combat',
        slot: slotKey,
        item_name: itemName,
        refine_level: document.getElementById('gear-refine-select')?.value || '+0',
        element: formattedElement,
        card_pierce: document.getElementById('gear-card-select')?.value || 'Sin Piercings',
        note: (document.getElementById('gear-note-input')?.value || '').trim()
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/gear/${id}` : `${API_URL}/gear`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeSlotItemModal();
            await fetchGearData();
            if (targetCharId) {
                const charSelect = document.getElementById('gear-char-select');
                if (charSelect) charSelect.value = targetCharId;
                refreshFlyffSlotLabels(targetCharId);
            }
        } else {
            const err = await res.json().catch(() => ({}));
            alert('Error al guardar equipamiento: ' + (err.error || 'Error del servidor'));
        }
    } catch (e) {
        console.error('Error al guardar equipamiento:', e);
    }
}

async function unequipCurrentSlot() {
    const id = document.getElementById('gear-id-input')?.value;
    const charId = document.getElementById('gear-char-select')?.value;
    const slotKey = document.getElementById('gear-selected-slot')?.value;

    if (!id) {
        alert('Este slot ya está vacío.');
        return;
    }

    if (!confirm('¿Desequipar este ítem?')) return;

    try {
        const res = await fetch(`${API_URL}/gear/${id}`, { method: 'DELETE' });
        if (res.ok) {
            closeSlotItemModal();
            await fetchGearData();
            if (charId) refreshFlyffSlotLabels(charId);
        }
    } catch (e) { console.error('Error desequipando:', e); }
}

async function moveGearToCharacter(gearId, targetCharId) {
    if (!gearId || !targetCharId) return;
    const item = (characterGear || []).find(g => isSameId(g.id, gearId));
    if (!item) return;

    const data = { ...item, character_id: targetCharId };
    try {
        const res = await fetch(`${API_URL}/gear/${gearId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            await fetchGearData();
            const activeCharId = document.getElementById('gear-char-select')?.value;
            if (activeCharId) refreshFlyffSlotLabels(activeCharId);
        } else {
            alert('Error al transferir equipamiento.');
        }
    } catch (e) {
        console.error('Error transfiriendo equipamiento:', e);
    }
}

async function deleteGearItem(id) {
    if (!confirm(i18n('msg_confirm_delete') || '¿Eliminar este ítem de equipamiento?')) return;
    try {
        const res = await fetch(`${API_URL}/gear/${id}`, { method: 'DELETE' });
        if (res.ok) await fetchGearData();
    } catch (e) { console.error('Error eliminando ítem:', e); }
}

function openSlotItemModalByGearId(gearId) {
    populateGearCharSelects();
    const safeGear = Array.isArray(characterGear) ? characterGear : [];
    const item = safeGear.find(g => isSameId(g.id, gearId));
    if (!item) return;

    const charSelect = document.getElementById('gear-char-select');
    if (charSelect && item.character_id) {
        charSelect.value = item.character_id;
    }

    selectFlyffSlot(item.slot, gearId);
}

function renderGearView() {
    const grid = document.getElementById('gear-grid');
    if (!grid) return;

    const safeCharacters = Array.isArray(characters) ? characters : [];
    const searchText = (document.getElementById('gear-search')?.value || '').toLowerCase().trim();

    let html = '';
    const charIdsInList = new Set();

    // Global Search Header Panel
    if (searchText) {
        const matchingGear = (characterGear || []).filter(g =>
            (g.item_name || '').toLowerCase().includes(searchText) ||
            (g.slot || '').toLowerCase().includes(searchText) ||
            (g.refine_level || '').toLowerCase().includes(searchText) ||
            (g.element || '').toLowerCase().includes(searchText) ||
            (FLYFF_SLOT_LABELS[g.slot] || '').toLowerCase().includes(searchText)
        );

        if (matchingGear.length > 0) {
            html += `
            <div style="grid-column: 1 / -1; background: rgba(99, 102, 241, 0.1); border: 1px solid var(--primary); border-radius: 12px; padding: 15px; margin-bottom: 10px;">
                <h4 style="margin: 0 0 10px 0; color: var(--primary); font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-magnifying-glass"></i> Resultados de Búsqueda Global ("${searchText}"): ${matchingGear.length} coincidencia(s)
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto;">
                    ${matchingGear.map(g => {
                        const char = safeCharacters.find(c => isSameId(c.id, g.character_id));
                        const charName = char ? char.name : 'Sin Asignar / Alijo';
                        const charClass = char ? (char.class_name || 'Sin Clase') : '';
                        const slotName = FLYFF_SLOT_LABELS[g.slot] || g.slot;
                        return `
                            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="font-weight: 700; color: #ffffff; font-size: 0.92rem;">${g.item_name}</span>
                                    ${g.refine_level && g.refine_level !== '+0' ? `<span style="color:#f59e0b; font-weight:700; margin-left:6px;">(${g.refine_level})</span>` : ''}
                                    ${g.element && g.element !== 'Ninguno' ? `<span style="color:#38bdf8; font-weight:600; margin-left:6px;">[${g.element}]</span>` : ''}
                                    <div style="font-size: 0.78rem; opacity: 0.75; margin-top: 2px;">
                                        <span>Ranura: <strong>${slotName}</strong></span> | 
                                        <span>Personaje: <strong style="color:var(--primary);">${charName}</strong> ${charClass ? `(${charClass})` : ''}</span>
                                    </div>
                                </div>
                                <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.8rem; border-radius: 6px; cursor: pointer;" onclick="${char ? `openGearModalForChar(${char.id})` : `openSlotItemModalByGearId(${g.id})`}">
                                    <i class="fa-solid fa-eye"></i> Ver Inventario
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            `;
        }
    }

    safeCharacters.forEach(char => {
        charIdsInList.add(String(char.id));
        let itemsForChar = (characterGear || []).filter(g => isSameId(g.character_id, char.id));
        const charMatches = (char.name || '').toLowerCase().includes(searchText) || (char.class_name || '').toLowerCase().includes(searchText);

        if (searchText && !charMatches) {
            itemsForChar = itemsForChar.filter(g =>
                (g.item_name || '').toLowerCase().includes(searchText) ||
                (g.slot || '').toLowerCase().includes(searchText) ||
                (g.note || '').toLowerCase().includes(searchText) ||
                (FLYFF_SLOT_LABELS[g.slot] || '').toLowerCase().includes(searchText)
            );
        }

        if (itemsForChar.length > 0 || !searchText || charMatches) {
            html += `
            <div class="card glass-panel" style="display:flex; flex-direction:column; justify-content:space-between; gap:12px; transition:transform 0.2s ease;" onmouseenter="this.style.borderColor='var(--primary)'" onmouseleave="this.style.borderColor='var(--glass-border)'">
                <div>
                    <!-- Header -->
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:10px;">
                        <div>
                            <h3 style="margin:0; color:var(--primary); font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-user-shield"></i> ${char.name}
                            </h3>
                            <span style="font-size:0.8rem; opacity:0.75;">Lvl ${char.level} - ${char.class_name || 'Sin Clase'}</span>
                        </div>
                        <span style="background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.3); color:var(--primary); font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:12px;">
                            <i class="fa-solid fa-shield-halved"></i> ${itemsForChar.length} Ítems
                        </span>
                    </div>

                    <!-- Compact Chips Preview -->
                    <div style="margin-top:10px;">
            `;

            if (itemsForChar.length === 0) {
                html += `<p style="font-size:0.85rem; opacity:0.5; margin:8px 0; font-style:italic;">Sin equipamiento registrado.</p>`;
            } else {
                html += `<div style="display:flex; flex-wrap:wrap; gap:6px; max-height:110px; overflow-y:auto; padding-right:4px;">`;
                itemsForChar.forEach(g => {
                    const isFashion = g.gear_category === 'Fashion';
                    const badgeColor = isFashion ? '#ec4899' : 'var(--primary)';
                    const slotName = FLYFF_SLOT_LABELS[g.slot] || g.slot;

                    html += `
                    <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:4px 8px; font-size:0.78rem; display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="openSlotItemModalByGearId(${g.id})" title="Editar / Mover ${g.item_name}">
                        <span style="color:${badgeColor}; font-weight:700;">${slotName}:</span>
                        <span style="color:white; font-weight:600;">${g.item_name} ${g.refine_level && g.refine_level !== '+0' ? `<span style="color:#f59e0b;">(${g.refine_level})</span>` : ''}</span>
                    </div>
                    `;
                });
                html += `</div>`;
            }

            html += `
                    </div>
                </div>

                <!-- Action Button -->
                <button class="btn-primary" style="width:100%; padding:9px; font-weight:700; font-size:0.88rem; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:8px; cursor:pointer;" onclick="openGearModalForChar(${char.id})">
                    <i class="fa-solid fa-shirt"></i> Abrir Inventario Grid
                </button>
            </div>
            `;
        }
    });

    // Handle unassigned gear items (if any)
    const unassignedItems = (characterGear || []).filter(g => !g.character_id || !Array.from(charIdsInList).some(cId => isSameId(cId, g.character_id)));
    if (unassignedItems.length > 0) {
        html += `
        <div class="card glass-panel" style="display:flex; flex-direction:column; justify-content:space-between; gap:12px; border-color:rgba(239, 68, 68, 0.4);">
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:10px;">
                    <div>
                        <h3 style="margin:0; color:#ef4444; font-size:1.15rem; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-box-open"></i> Sin Asignar / Banco
                        </h3>
                        <span style="font-size:0.8rem; opacity:0.75;">Ítems en alijo general</span>
                    </div>
                    <span style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#ef4444; font-weight:700; font-size:0.75rem; padding:4px 10px; border-radius:12px;">
                        ${unassignedItems.length} Ítems
                    </span>
                </div>
                <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px; max-height:110px; overflow-y:auto;">
        `;
        unassignedItems.forEach(g => {
            const isFashion = g.gear_category === 'Fashion';
            const badgeColor = isFashion ? '#ec4899' : 'var(--primary)';
            const slotName = FLYFF_SLOT_LABELS[g.slot] || g.slot;

            html += `
            <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:4px 8px; font-size:0.78rem; display:flex; align-items:center; gap:6px; cursor:pointer;" onclick="openSlotItemModalByGearId(${g.id})" title="Editar / Asignar ${g.item_name}">
                <span style="color:${badgeColor}; font-weight:700;">${slotName}:</span>
                <span style="color:white; font-weight:600;">${g.item_name} ${g.refine_level && g.refine_level !== '+0' ? `<span style="color:#f59e0b;">(${g.refine_level})</span>` : ''}</span>
            </div>
            `;
        });
        html += `
                </div>
            </div>
            <button class="btn-secondary" style="width:100%; padding:9px; font-weight:700; font-size:0.88rem; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:8px;" onclick="openGearModal()">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> Asignar Equipamiento
            </button>
        </div>
        `;
    }

    grid.innerHTML = html || `<p style="grid-column: 1/-1; text-align:center; opacity:0.5;">No se encontraron ítems de equipamiento.</p>`;
}


/* ==========================================================================
   FEATURE 2: DAILY/WEEKLY ROUTINES CHECKLIST
   ========================================================================== */
let routineTasks = [];
let routineProgress = [];

async function fetchRoutinesData() {
    try {
        const tasksRes = await fetch(`${API_URL}/routines/tasks`);
        routineTasks = await tasksRes.json();
        const progRes = await fetch(`${API_URL}/routines/progress`);
        routineProgress = await progRes.json();
        populateRoutinesFilters();
        renderRoutinesView();
    } catch (e) {
        console.error('Error fetching routines data:', e);
    }
}

function populateRoutinesFilters() {
    const charSelect = document.getElementById('routines-char-filter');
    if (charSelect) {
        let html = '<option value="">Todos los Personajes</option>';
        characters.forEach(c => {
            html += `<option value="${c.id}">${c.name}</option>`;
        });
        charSelect.innerHTML = html;
    }
}

function openRoutineModal() {
    const modal = document.getElementById('routine-modal');
    if (modal) {
        document.getElementById('rt-title-input').value = '';
        document.getElementById('rt-cat-input').value = '';
        modal.classList.add('show');
    }
}

function closeRoutineModal() {
    const modal = document.getElementById('routine-modal');
    if (modal) modal.classList.remove('show');
}

async function submitRoutineTask() {
    const title = document.getElementById('rt-title-input').value.trim();
    if (!title) return;

    const data = {
        title,
        frequency: document.getElementById('rt-freq-select').value,
        category: document.getElementById('rt-cat-input').value.trim() || 'General'
    };

    try {
        const res = await fetch(`${API_URL}/routines/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeRoutineModal();
            fetchRoutinesData();
        }
    } catch (e) { console.error(e); }
}

async function deleteRoutineTask(taskId) {
    if (!confirm(i18n('msg_confirm_delete'))) return;
    try {
        const res = await fetch(`${API_URL}/routines/tasks/${taskId}`, { method: 'DELETE' });
        if (res.ok) fetchRoutinesData();
    } catch (e) { console.error(e); }
}

async function toggleRoutineProgress(taskId, charId, isCompleted) {
    const today = new Date().toISOString().split('T')[0];
    try {
        await fetch(`${API_URL}/routines/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_id: taskId,
                character_id: charId,
                completed_date: today,
                is_completed: isCompleted
            })
        });
        const progRes = await fetch(`${API_URL}/routines/progress`);
        routineProgress = await progRes.json();
        renderRoutinesView();
    } catch (e) { console.error(e); }
}

function renderRoutinesView() {
    const container = document.getElementById('routines-container');
    if (!container) return;

    const charFilter = document.getElementById('routines-char-filter')?.value;
    const today = new Date().toISOString().split('T')[0];

    let targetChars = characters;
    if (charFilter) {
        targetChars = characters.filter(c => String(c.id) === String(charFilter));
    }

    let html = '';
    routineTasks.forEach(task => {
        html += `
        <div class="card glass-panel" style="padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="background:var(--primary); color:#000; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                        ${task.frequency === 'daily' ? 'Diaria' : 'Semanal'}
                    </span>
                    <h3 style="margin:0; font-size:1.1rem; color:white;">${task.title}</h3>
                    <span style="font-size:0.8rem; opacity:0.6; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${task.category || 'General'}</span>
                </div>
                <button class="icon-btn delete" onclick="deleteRoutineTask(${task.id})" title="Eliminar Rutina"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
        `;

        targetChars.forEach(char => {
            const isDone = routineProgress.some(p =>
                String(p.task_id) === String(task.id) &&
                String(p.character_id) === String(char.id) &&
                p.completed_date === today &&
                (p.is_completed === true || p.is_completed === 'true' || p.is_completed === 'True')
            );

            html += `
            <label style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; border:1px solid ${isDone ? 'var(--success)' : 'var(--glass-border)'}; cursor:pointer;">
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleRoutineProgress(${task.id}, ${char.id}, this.checked)" style="accent-color:var(--success); width:18px; height:18px; cursor:pointer;">
                <span style="font-size:0.9rem; font-weight:600; color:${isDone ? 'var(--success)' : 'white'}; text-decoration:${isDone ? 'line-through' : 'none'};">
                    ${char.name}
                </span>
            </label>
            `;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html || `<p style="text-align:center; opacity:0.5;">No hay rutinas creadas aún.</p>`;
}


/* ==========================================================================
   FEATURE 3: EXPIRING ITEMS TRACKER
   ========================================================================== */
let expiringItems = [];

async function fetchExpiringData() {
    try {
        const res = await fetch(`${API_URL}/expiring-items`);
        expiringItems = await res.json();
        renderExpiringView();
    } catch (e) { console.error('Error fetching expiring items:', e); }
}

function renderExpiringCharDropdown(filterText = '') {
    const dropdown = document.getElementById('expiring-char-dropdown');
    if (!dropdown) return;

    const safeCharacters = Array.isArray(characters) ? characters : [];
    const lowerFilter = filterText.toLowerCase().trim();

    let filtered = safeCharacters;
    if (lowerFilter) {
        filtered = safeCharacters.filter(c =>
            (c.name || '').toLowerCase().includes(lowerFilter) ||
            (c.class_name || '').toLowerCase().includes(lowerFilter)
        );
    }

    let html = `
    <div class="expiring-char-option" style="padding:8px 12px; cursor:pointer; font-size:0.85rem; color:rgba(255,255,255,0.6); border-bottom:1px solid rgba(255,255,255,0.05);"
          onmousedown="selectExpiringChar('', '(Sin asignar a personaje)')"
          onmouseenter="this.style.background='rgba(99,102,241,0.3)'"
          onmouseleave="this.style.background='transparent'">(Sin asignar a personaje)</div>
    `;

    if (filtered.length === 0 && lowerFilter) {
        html += '<div style="padding:8px 12px; color:rgba(255,255,255,0.4); font-size:0.85rem;">Sin resultados</div>';
    } else {
        filtered.forEach(c => {
            const displayName = `${c.name} (Lvl ${c.level} ${c.class_name || ''})`.trim();
            const safeName = displayName.replace(/'/g, "\\'");
            html += `
            <div class="expiring-char-option" style="padding:8px 12px; cursor:pointer; font-size:0.85rem; color:white; border-bottom:1px solid rgba(255,255,255,0.05);"
                  onmousedown="selectExpiringChar('${c.id}', '${safeName}')"
                  onmouseenter="this.style.background='rgba(99,102,241,0.3)'"
                  onmouseleave="this.style.background='transparent'">${displayName}</div>
            `;
        });
    }

    dropdown.innerHTML = html;
}

function showExpiringCharDropdown() {
    const dropdown = document.getElementById('expiring-char-dropdown');
    const searchInput = document.getElementById('expiring-char-search');
    if (dropdown) {
        renderExpiringCharDropdown(searchInput?.value || '');
        dropdown.style.display = 'block';
    }
}

function hideExpiringCharDropdown() {
    const dropdown = document.getElementById('expiring-char-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function filterExpiringCharDropdown(value) {
    renderExpiringCharDropdown(value);
    const dropdown = document.getElementById('expiring-char-dropdown');
    if (dropdown) dropdown.style.display = 'block';

    const hiddenSelect = document.getElementById('expiring-char-select');
    if (hiddenSelect) hiddenSelect.value = '';
}

function selectExpiringChar(charId, displayName) {
    const searchInput = document.getElementById('expiring-char-search');
    const hiddenSelect = document.getElementById('expiring-char-select');
    if (searchInput) searchInput.value = displayName;
    if (hiddenSelect) hiddenSelect.value = charId;
    hideExpiringCharDropdown();
}

document.addEventListener('click', function (e) {
    const searchInput = document.getElementById('expiring-char-search');
    const dropdown = document.getElementById('expiring-char-dropdown');
    if (searchInput && dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        hideExpiringCharDropdown();
    }
});

function openExpiringModal(item = null) {
    const modal = document.getElementById('expiring-modal');
    if (!modal) return;

    const charSearchInput = document.getElementById('expiring-char-search');
    const charSelectInput = document.getElementById('expiring-char-select');

    if (item) {
        document.getElementById('expiring-modal-title').innerText = 'Editar Ítem Temporal';
        document.getElementById('expiring-id-input').value = item.id;

        const safeChars = Array.isArray(characters) ? characters : [];
        const char = safeChars.find(c => isSameId(c.id, item.character_id));
        if (charSelectInput) charSelectInput.value = item.character_id || '';
        if (charSearchInput) charSearchInput.value = char ? `${char.name} (Lvl ${char.level} ${char.class_name || ''})`.trim() : '';

        document.getElementById('expiring-name-input').value = item.item_name;
        document.getElementById('expiring-cat-select').value = item.item_category || 'Ticket VIP';
        document.getElementById('expiring-date-input').value = item.expiration_date || '';
        document.getElementById('expiring-note-input').value = item.note || '';
    } else {
        document.getElementById('expiring-modal-title').innerText = 'Registrar Ítem Temporal';
        document.getElementById('expiring-id-input').value = '';
        if (charSelectInput) charSelectInput.value = '';
        if (charSearchInput) charSearchInput.value = '';
        document.getElementById('expiring-name-input').value = '';
        document.getElementById('expiring-note-input').value = '';

        const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        document.getElementById('expiring-date-input').value = future.toISOString().slice(0, 16);
    }

    hideExpiringCharDropdown();
    modal.classList.add('show');
}

function closeExpiringModal() {
    const modal = document.getElementById('expiring-modal');
    if (modal) modal.classList.remove('show');
    hideExpiringCharDropdown();
}

async function submitExpiringForm() {
    const id = document.getElementById('expiring-id-input').value;
    const name = document.getElementById('expiring-name-input').value.trim();
    const expDate = document.getElementById('expiring-date-input').value;

    if (!name || !expDate) {
        alert('Por favor ingresa el nombre del ítem y la fecha de expiración.');
        return;
    }

    const data = {
        character_id: document.getElementById('expiring-char-select')?.value || '',
        item_name: name,
        item_category: document.getElementById('expiring-cat-select').value,
        expiration_date: expDate,
        note: document.getElementById('expiring-note-input').value.trim()
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/expiring-items/${id}` : `${API_URL}/expiring-items`;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeExpiringModal();
            fetchExpiringData();
        }
    } catch (e) { console.error('Error al guardar ítem temporal:', e); }
}

async function deleteExpiringItem(id) {
    if (!confirm(i18n('msg_confirm_delete'))) return;
    try {
        const res = await fetch(`${API_URL}/expiring-items/${id}`, { method: 'DELETE' });
        if (res.ok) fetchExpiringData();
    } catch (e) { console.error(e); }
}

function renderExpiringView() {
    const grid = document.getElementById('expiring-grid');
    if (!grid) return;

    let html = '';
    const now = new Date();

    expiringItems.forEach(item => {
        const expDate = new Date(item.expiration_date);
        const diffMs = expDate - now;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = (diffMs / (1000 * 60 * 60 * 24)).toFixed(1);

        let badgeColor = 'var(--success)';
        let badgeText = `${diffDays} días restantes`;

        if (diffMs <= 0) {
            badgeColor = 'var(--danger)';
            badgeText = 'EXPIRADO';
        } else if (diffHours <= 24) {
            badgeColor = 'var(--danger)';
            badgeText = `Urgente: ${diffHours}h restantes`;
        } else if (diffHours <= 72) {
            badgeColor = '#f59e0b';
            badgeText = `Próximo: ${diffDays} días`;
        }

        const charObj = characters.find(c => String(c.id) === String(item.character_id));

        html += `
        <div class="card glass-panel" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <div>
                        <span style="background:rgba(255,255,255,0.1); font-size:0.75rem; padding:2px 6px; border-radius:4px; color:var(--primary);">
                            ${item.item_category || 'Ítem Temporal'}
                        </span>
                        <h3 style="margin:5px 0 0 0; color:white; font-size:1.1rem;">${item.item_name}</h3>
                    </div>
                    <span style="background:${badgeColor}; color:#000; font-weight:700; font-size:0.75rem; padding:4px 8px; border-radius:6px;">
                        ${badgeText}
                    </span>
                </div>
                <div style="font-size:0.85rem; opacity:0.8; margin-top:8px;">
                    <p style="margin:3px 0;"><i class="fa-solid fa-user" style="color:var(--primary);"></i> Personaje: <strong>${charObj ? charObj.name : 'General'}</strong></p>
                    <p style="margin:3px 0;"><i class="fa-solid fa-calendar-xmark" style="color:rgba(255,255,255,0.6);"></i> Expira: <strong>${item.expiration_date.replace('T', ' ')}</strong></p>
                    ${item.note ? `<p style="margin:5px 0 0 0; font-style:italic; opacity:0.7;">"${item.note}"</p>` : ''}
                </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:15px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <button class="icon-btn" onclick='openExpiringModal(${JSON.stringify(item).replace(/'/g, "&apos;")})' title="Editar"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn delete" onclick="deleteExpiringItem(${item.id})" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
        `;
    });

    grid.innerHTML = html || `<p style="grid-column: 1/-1; text-align:center; opacity:0.5;">No hay ítems temporales registrados.</p>`;
}


/* ==========================================================================
   FEATURE 5: EXCEL DATABASE BACKUP SYSTEM
   ========================================================================== */
async function loadBackupsList() {
    const listEl = document.getElementById('backups-list');
    if (!listEl) return;
    try {
        const res = await fetch(`${API_URL}/config/backups`);
        const files = await res.json();
        let html = '';
        if (files.length === 0) {
            html = '<p style="opacity:0.5; margin:5px 0;">No hay respaldos creados aún.</p>';
        } else {
            files.forEach(f => {
                const dateStr = new Date(f.modified * 1000).toLocaleString();
                const kb = (f.size / 1024).toFixed(1);
                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:6px;">
                    <div>
                        <strong style="color:white; font-size:0.8rem;">${f.filename}</strong>
                        <div style="font-size:0.7rem; opacity:0.6;">${dateStr} (${kb} KB)</div>
                    </div>
                    <button class="btn-secondary" style="font-size:0.7rem; padding:2px 8px;" onclick="restoreExcelBackup('${f.filename}')">
                        <i class="fa-solid fa-rotate-left"></i> Restaurar
                    </button>
                </div>
                `;
            });
        }
        listEl.innerHTML = html;
    } catch (e) { console.error('Error loading backups list:', e); }
}

async function createExcelBackup() {
    try {
        const res = await fetch(`${API_URL}/config/backups/create`, { method: 'POST' });
        if (res.ok) {
            alert('Copia de seguridad creada con éxito.');
            loadBackupsList();
        } else {
            alert('Error al crear la copia de seguridad.');
        }
    } catch (e) { console.error(e); }
}

async function restoreExcelBackup(filename) {
    if (!confirm(`¿Restaurar la copia de seguridad "${filename}"? Los datos actuales serán reemplazados.`)) return;
    try {
        const res = await fetch(`${API_URL}/config/backups/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename })
        });
        if (res.ok) {
            alert('Base de datos restaurada con éxito. Se recargará la página.');
            window.location.reload();
        } else {
            alert('Error al restaurar respaldo.');
        }
    } catch (e) { console.error(e); }
}

function openConfigModal() {
    const modal = document.getElementById('config-modal');
    if (modal) {
        document.getElementById('config-db-path').value = dbPath || '';
        document.getElementById('config-flyff-path').value = flyffPath || '';
        document.getElementById('config-flyff-params').value = flyffParams || '';
        loadBackupsList();
        modal.classList.add('show');
    }
}

function closeConfigModal() {
    const modal = document.getElementById('config-modal');
    if (modal) modal.classList.remove('show');
}

// Global Keyboard Shortcuts: Escape key closes active modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            if (modal.style.display === 'flex') modal.style.display = 'none';
        });
        if (typeof hideGearNameDropdown === 'function') hideGearNameDropdown();
        if (typeof hideExpiringCharDropdown === 'function') hideExpiringCharDropdown();
    }
});


