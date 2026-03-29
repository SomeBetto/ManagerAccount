const API_URL = '/api';

let currentView = 'accounts';
let accounts = [];
let characters = [];
let items = [];
let selectedAccountIds = new Set();

// i18n
let currentLang = localStorage.getItem('appLang') || 'en';
const translations = {
    en: {
        // Sidebar
        sidebar_accounts: "Accounts",
        sidebar_characters: "Characters",
        sidebar_favorites: "Favorites",
        sidebar_items: "Important Items",
        sidebar_vacantes: "Vacantes",
        sidebar_levelzone: "Leveling Zone",
        sidebar_dailyevent: "Daily Events",
        sidebar_coupons: "Coupons",
        // General UI
        btn_add_account: "New Account",
        btn_add_character: "New Character",
        btn_upload: "Upload Excel",
        btn_settings: "Settings",
        page_title_accounts: "Accounts",
        page_title_characters: "Characters",
        page_title_favorites: "Favorites",
        page_title_items: "Important Items",
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
        action_toggle_pin: "Toggle PIN",
        action_toggle_pass: "Toggle Pass",
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
        msg_fetch_error: "Error loading data from server."
    },
    es: {
        // Sidebar
        sidebar_accounts: "Cuentas",
        sidebar_characters: "Personajes",
        sidebar_favorites: "Favoritos",
        sidebar_items: "Objetos Importantes",
        sidebar_vacantes: "Vacantes",
        sidebar_levelzone: "Zona de Leveo",
        sidebar_dailyevent: "Eventos Diarios",
        sidebar_coupons: "Cupones",
        // General UI
        btn_add_account: "Nueva Cuenta",
        btn_add_character: "Nuevo Personaje",
        btn_upload: "Subir Excel",
        btn_settings: "Configuración",
        page_title_accounts: "Cuentas",
        page_title_characters: "Personajes",
        page_title_favorites: "Favoritos",
        page_title_items: "Objetos Importantes",
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
        action_toggle_pin: "Ver/Ocultar PIN",
        action_toggle_pass: "Ver/Ocultar Contraseña",
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
        msg_fetch_error: "Error al cargar datos del servidor."
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
const itemsView = document.getElementById('items-view');
const vacantesView = document.getElementById('vacantes-view');
const couponsView = document.getElementById('coupons-view');

let coupons = [];
let activeCouponId = null;
let redemptionStep = 'coupons'; // 'coupons', 'accounts', 'characters'
let selectedRedeemAccountId = null;

// Init
let dbPath = '';

async function fetchConfig() {
    try {
        const res = await fetch(`${API_URL}/config/db-path`);
        const data = await res.json();
        dbPath = data.path || '';
    } catch (e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchConfig().then(() => {
        fetchAccounts();
        applyTranslations();
        initSidebar();
    });
    updateTypeOptions();
    // Pre-fetch events if needed? Or just when view switches.
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

// Navigation
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.nav-links li[onclick="switchView('${view}')"]`).classList.add('active');

    if (view === 'accounts') {
        accountsView.classList.add('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = `${i18n('page_title_accounts')} <span id="account-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${accounts.length})</span>`;
        fetchAccounts();
    } else if (view === 'characters') {
        accountsView.classList.remove('active');
        charactersView.classList.add('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = `${i18n('page_title_characters')} <span id="char-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${characters.length})</span>`;
        fetchAccounts().then(() => fetchCharacters());
    } else if (view === 'favorites') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.add('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = `${i18n('page_title_favorites')} <span id="fav-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(0)</span>`;
        fetchAccounts().then(() => fetchCharacters());
    } else if (view === 'items') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.add('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = i18n('page_title_items');
        fetchCharacters().then(() => fetchItems());
    } else if (view === 'vacantes') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.add('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = `${i18n('page_title_vacantes')} <span id="vacantes-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(0)</span>`;
        fetchAccounts().then(() => fetchCharacters().then(() => renderVacantes()));
    } else if (view === 'levelzone') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.add('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = i18n('page_title_levelzone');
        fetchLevelQueue();
    } else if (view === 'dailyevent') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.add('active');
        if (couponsView) couponsView.classList.remove('active');
        pageTitle.innerHTML = i18n('page_title_dailyevent');
        fetchDailyEvents();
    } else if (view === 'coupons') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (favoritesView) favoritesView.classList.remove('active');
        if (itemsView) itemsView.classList.remove('active');
        if (vacantesView) vacantesView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        if (couponsView) couponsView.classList.add('active');
        pageTitle.innerHTML = i18n('page_title_coupons');
        // Ensure data exists before starting flow
        fetchAccounts().then(() => fetchCharacters().then(() => resetCouponFlow()));
    }
    updateHeaderButtons(view);
}

function updateHeaderButtons(view) {
    const accUpload = document.getElementById('btn-upload-accounts');
    const charUpload = document.getElementById('btn-upload-characters');

    if (view === 'accounts') {
        if (accUpload) accUpload.style.display = 'inline-flex';
        if (charUpload) charUpload.style.display = 'none';
    } else {
        if (accUpload) accUpload.style.display = 'none';
        if (charUpload) charUpload.style.display = 'inline-flex';
    }
}

// API Calls
async function fetchAccounts() {
    try {
        const res = await fetch(`${API_URL}/accounts`);
        accounts = await res.json();
        renderAccounts();
        updateFilterOptions();
        if (currentView === 'vacantes') renderVacantes();
    } catch (e) { console.error(e); }
}

async function fetchCharacters() {
    try {
        const res = await fetch(`${API_URL}/characters`);
        characters = await res.json();
        renderCharacters();
        if (currentView === 'vacantes') renderVacantes();
    } catch (e) { console.error(e); }
}

async function fetchItems() {
    try {
        const res = await fetch(`${API_URL}/items`);
        items = await res.json();
        renderItems();
    } catch (e) { console.error(e); }
}

// Rendering
function renderItems() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;

    grid.innerHTML = items.map(item => {
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

    const grid = document.getElementById('accounts-grid');
    grid.innerHTML = accounts.map(acc => {
        const isSelected = selectedAccountIds.has(acc.id);
        const borderStyle = isSelected ? 'border: 1px solid var(--primary);' : '';

        return `
        <div class="card" style="${borderStyle}">
            <div class="card-bar" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div onclick="event.stopPropagation()">
                    <input type="checkbox" onchange="toggleAccountSelection(${acc.id})" ${isSelected ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:var(--primary);">
                </div>
                <div class="card-actions" style="opacity:1;">
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
                <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountEmail(${acc.id})" title="${i18n('action_copy_email')}"><i class="fa-solid fa-envelope"></i> Email</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPassword(${acc.id})" title="${i18n('action_copy_pass')}"><i class="fa-solid fa-key"></i> Pass</button>
                    <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${acc.id})" title="${i18n('action_copy_pin')}"><i class="fa-solid fa-lock"></i> PIN</button>
                </div>
            </div>
        </div>
    `}).join('');

    // Update Batch Button
    const btn = document.getElementById('btn-delete-selected');
    if (btn) btn.style.display = selectedAccountIds.size > 0 ? 'inline-flex' : 'none';
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

function saveConfig() {
    const val = parseInt(document.getElementById('config-threshold').value);
    levelThreshold = isNaN(val) ? 0 : val;
    localStorage.setItem('levelThreshold', levelThreshold);
    // Note: Types are saved immediately on add/delete
    
    const newPath = document.getElementById('config-db-path').value.trim();
    if (newPath !== dbPath) {
        dbPath = newPath;
        fetch(`${API_URL}/config/db-path`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: dbPath })
        }).then(res => res.json()).then(data => {
            if(data.error) alert(data.error);
            else {
                alert(i18n('msg_save_config_success'));
                fetchAccounts();
                if (currentView === 'characters' || currentView === 'vacantes' || currentView === 'levelzone') {
                    fetchCharacters();
                }
            }
        });
    }

    closeConfigModal();
    renderCharacters(); // Re-render to apply new threshold if filter is active
}

// Character Types Logic
function renderTypesConfig() {
    const list = document.getElementById('config-types-list');
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
                        <div class="card-title" style="word-break:break-all;">${char.name || 'Unnamed'}</div>
                    </div>
                    <div class="card-content">
                        <p>${i18n('field_level')} <span class="value">${char.level || 0}</span></p>
                        <p>${i18n('field_class')} <span class="value">${char.class_name || 'None'}</span></p>
                        <p>${i18n('settings_char_types')} <span class="badge badge-${charTypeLower}">${charType}</span></p>

                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyToClipboard('${getAccountEmail(char.account_id)}')" title="${i18n('action_copy_email')}"><i class="fa-solid fa-envelope"></i> Email</button>
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyCharacterPassword(${char.id})" title="${i18n('action_copy_pass')}"><i class="fa-solid fa-key"></i> Pass</button>
                            <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyAccountPin(${char.account_id})" title="${i18n('action_copy_pin')}"><i class="fa-solid fa-lock"></i> PIN</button>
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
            if (currentView === 'accounts') fetchAccounts();
            else if (currentView === 'items') fetchItems();
            else fetchCharacters();
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

    // Try modern API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback();
        }).catch(err => {
            console.error('Async: Could not copy text: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
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
        if (successful) showCopyFeedback();
        else alert('Copy failed. Please manually copy.');
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('Copy failed. Please manually copy.');
    }

    document.body.removeChild(textArea);
}

function showCopyFeedback() {
    const el = document.activeElement;
    if (el) {
        const original = el.style.color;
        el.style.color = 'var(--success)';
        setTimeout(() => el.style.color = original || 'var(--text-muted)', 500);
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
        levelQueue = await res.json();
        renderLevelQueue();
    } catch (e) { console.error(e); }
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
        .then(res => res.json())
        .then(data => {
            dailyEvents = data;
            renderDailyEvents();
        })
        .catch(err => console.error(err));
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
        .then(res => res.json())
        .then(data => {
            renderEventParticipants(data, eventId);
        });
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

