const API_URL = '/api';

let currentView = 'accounts';
let accounts = [];
let characters = [];
let selectedAccountIds = new Set();

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

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();
    updateTypeOptions();
    // Pre-fetch events if needed? Or just when view switches.
});

// Navigation
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.nav-links li[onclick="switchView('${view}')"]`).classList.add('active');

    if (view === 'accounts') {
        accountsView.classList.add('active');
        charactersView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        pageTitle.innerHTML = `Accounts <span id="account-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${accounts.length})</span>`;
        fetchAccounts();
    } else if (view === 'characters') {
        accountsView.classList.remove('active');
        charactersView.classList.add('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        pageTitle.innerHTML = `Characters <span id="char-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${characters.length})</span>`;
        fetchAccounts().then(() => fetchCharacters());
    } else if (view === 'levelzone') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.add('active');
        if (dailyEventView) dailyEventView.classList.remove('active');
        pageTitle.innerHTML = `LevelZone`;
        fetchCharacters().then(() => fetchLevelQueue());
    } else if (view === 'dailyevent') {
        accountsView.classList.remove('active');
        charactersView.classList.remove('active');
        if (levelZoneView) levelZoneView.classList.remove('active');
        if (dailyEventView) dailyEventView.classList.add('active');
        pageTitle.innerHTML = `Daily Events`;
        fetchDailyEvents();
    }
    updateHeaderButtons(view);
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
    } catch (e) { console.error(e); }
}

async function fetchCharacters() {
    try {
        const res = await fetch(`${API_URL}/characters`);
        characters = await res.json();
        renderCharacters();
    } catch (e) { console.error(e); }
}

// Rendering
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
                    <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem; margin-left:8px;" onclick="copyAccountEmail(${acc.id})" title="Copy Email"></i>
                </div>
            </div>
            <div class="card-content">
                <p>ID <span class="value">#${acc.id}</span></p>
                <p>PIN 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        <span id="acc-pin-${acc.id}">****</span>
                        <i class="fa-solid fa-eye" style="cursor:pointer; font-size:0.8rem;" onclick="togglePin(${acc.id})" title="Toggle PIN"></i>
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyAccountPin(${acc.id})" title="Copy PIN"></i>
                    </span>
                </p>
                <p>Pass 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        <span id="acc-pass-${acc.id}">******</span>
                        <i class="fa-solid fa-eye" style="cursor:pointer; font-size:0.8rem;" onclick="togglePassword(${acc.id})" title="Toggle Password"></i>
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyAccountPassword(${acc.id})" title="Copy Password"></i>
                    </span>
                </p>
            </div>
        </div>
    `}).join('');

    // Update Batch Button
    const btn = document.getElementById('btn-delete-selected');
    if (btn) btn.style.display = selectedAccountIds.size > 0 ? 'inline-flex' : 'none';
}

function renderCharacters(filtered = null) {
    const list = filtered || characters;
    const grid = document.getElementById('characters-grid');

    // Update Count
    const countEl = document.getElementById('char-count');
    if (countEl) countEl.innerText = `(${list.length})`;

    // Helper to get Account Email
    const getAccountEmail = (id) => accounts.find(a => a.id === id)?.email || 'Unknown';

    grid.innerHTML = list.map(char => `
        <div class="card">
            <div class="card-bar" style="display:flex; justify-content:flex-end; padding-bottom:0.8rem; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div class="card-actions" style="opacity:1;">
                    <button class="icon-btn" onclick="openModal('character', ${char.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteItem('characters', ${char.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-header" style="padding-top:0; margin-bottom:0.5rem;">
                <div class="card-title" style="word-break:break-all;">${char.name}</div>
            </div>
            <div class="card-content">
                <p>Account 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        ${getAccountEmail(char.account_id)}
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyToClipboard('${getAccountEmail(char.account_id)}')" title="Copy Email"></i>
                    </span>
                </p>
                <p>Pass 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        ****** 
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyCharacterPassword(${char.id})" title="Copy Password"></i>
                    </span>
                </p>
                <p>Level <span class="value">${char.level}</span></p>
                <p>Class <span class="value">${char.class_name}</span></p>
                <p>Type <span class="badge badge-${char.char_type?.toLowerCase()}">${char.char_type}</span></p>
            </div>
        </div>
    `).join('');
}

// Configuration
let levelThreshold = parseInt(localStorage.getItem('levelThreshold')) || 0;
// Dynamic Character Types
let charTypes = JSON.parse(localStorage.getItem('charTypes')) || ['Main', 'AFK Farm', 'Party Filler'];

// Config Modal Logic
function openConfigModal() {
    document.getElementById('config-threshold').value = levelThreshold;
    renderTypesConfig();
    document.getElementById('config-modal').classList.add('show');
}

function closeConfigModal() {
    document.getElementById('config-modal').classList.remove('show');
}

function saveConfig() {
    const val = parseInt(document.getElementById('config-threshold').value);
    levelThreshold = isNaN(val) ? 0 : val;
    localStorage.setItem('levelThreshold', levelThreshold);
    // Note: Types are saved immediately on add/delete
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
    if (confirm(`Delete type "${type}"?`)) {
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
    const nameSearch = document.getElementById('name-filter')?.value.toLowerCase();
    const sortBy = document.getElementById('sort-by')?.value;

    let list = [...characters];

    // Filter by Name
    if (nameSearch) {
        list = list.filter(c => c.name.toLowerCase().includes(nameSearch));
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
            list = list.filter(c => c.level >= min && c.level <= max);
        }
    }

    // Sorting
    if (sortBy === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'level') {
        list.sort((a, b) => (b.level || 0) - (a.level || 0));
    } else if (sortBy === 'class') {
        list.sort((a, b) => (a.class_name || '').localeCompare(b.class_name || ''));
    }

    // Pass to render
    renderCharactersHTML(list);
}

// Separate Render HTML function to avoid recursion confusion
function renderCharactersHTML(list) {
    const grid = document.getElementById('characters-grid');
    // Helper to get Account Email
    const getAccountEmail = (id) => accounts.find(a => a.id === id)?.email || 'Unknown';

    grid.innerHTML = list.map(char => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${char.name}</div>
                <div class="card-actions">
                    <button class="icon-btn" onclick="openModal('character', ${char.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn delete" onclick="deleteItem('characters', ${char.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <div class="card-content">
                <p>Account 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        ${getAccountEmail(char.account_id)}
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyToClipboard('${getAccountEmail(char.account_id)}')" title="Copy Email"></i>
                    </span>
                </p>
                <p>Pass 
                    <span class="value" style="display:flex; align-items:center; gap:5px;">
                        ****** 
                        <i class="fa-solid fa-copy" style="cursor:pointer; font-size:0.8rem;" onclick="copyCharacterPassword(${char.id})" title="Copy Password"></i>
                    </span>
                </p>
                <p>Level <span class="value">${char.level}</span></p>
                <p>Class <span class="value">${char.class_name}</span></p>
                <p>Type <span class="badge badge-${char.char_type?.toLowerCase()}">${char.char_type}</span></p>
            </div>
        </div>
    `).join('');
}

// Forms & Modals
let editingId = null;
let editingType = null;

function openModal(type = null, id = null) {
    // If no type passed, infer from current view
    if (!type) type = currentView === 'accounts' ? 'account' : 'character';

    editingType = type;
    editingId = id;

    modalTitle.innerText = id ? `Edit ${capitalize(type)}` : `New ${capitalize(type)}`;

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
                <label>Password</label>
                <input type="text" name="password" value="${data.password || ''}" required>
            </div> <!-- Note: In real app, don't show password or mask it -->
            <div class="form-group">
                <label>PIN</label>
                <input type="text" name="pin" value="${data.pin || ''}">
            </div>
        `;
    } else {
        // Character Form
        const data = id ? characters.find(c => c.id === id) : {};
        const accountOptions = accounts.map(a => `<option value="${a.id}" ${data.account_id === a.id ? 'selected' : ''}>${a.email}</option>`).join('');

        html = `
            <div class="form-group">
                <label>Account</label>
                <select name="account_id" required>
                    ${accountOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" value="${data.name || ''}" required>
            </div>

            <!-- Password hidden/inherited -->
            <div class="form-group">
                <div style="display:flex; gap: 10px;">
                    <div style="flex:1">
                        <label>Level</label>
                        <input type="number" name="level" value="${data.level || ''}">
                    </div>
                    <div style="flex:1">
                        <label>Class</label>
                        <input type="text" name="class_name" value="${data.class_name || ''}">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select name="char_type">
                    ${charTypes.map(t => `<option value="${t}" ${data.char_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
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

    const type = editingType === 'account' ? 'accounts' : 'characters';
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${type}/${editingId}` : `${API_URL}/${type}`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeModal();
            if (currentView === 'accounts') fetchAccounts();
            else fetchCharacters();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error); // Simple alert for now
        }
    } catch (e) {
        console.error(e);
        alert('Request failed');
    }
}

async function deleteItem(type, id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
        if (type === 'accounts') fetchAccounts();
        else fetchCharacters();
    } catch (e) { console.error(e); }
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

function copyAccountPin(id) {
    const acc = accounts.find(a => a.id === id);
    if (acc) copyToClipboard(acc.pin);
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
        alert('Upload failed');
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

    if (!confirm(`Are you sure you want to delete ${count} accounts?\nThis will also delete linked characters.`)) return;

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
        alert('Batch delete failed');
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
                <p>Account <span class="value">${entry.account_email}</span></p>
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
    if (!confirm('Remove from leveling queue?')) return;
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
            alert('Error adding to queue');
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
    if (!confirm('Are you sure you want to delete this event?')) return;

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
            
            <div style="display:flex; gap:10px; margin-bottom:1rem;">
                <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyToClipboard('${p.account_email}')"><i class="fa-solid fa-envelope"></i> Email</button>
                <button class="btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" onclick="copyCharacterPassword(${p.character_id})"><i class="fa-solid fa-key"></i> Pass</button>
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
    if (!confirm('Remove participant?')) return;

    fetch(`${API_URL}/daily-events/participants/${participantId}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(() => {
            fetchEventParticipants(currentEventId);
        });
}
