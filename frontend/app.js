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

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchAccounts();
    updateTypeOptions();
});

// Navigation
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.nav-links li[onclick="switchView('${view}')"]`).classList.add('active');

    if (view === 'accounts') {
        accountsView.classList.add('active');
        charactersView.classList.remove('active');
        pageTitle.innerHTML = `Accounts <span id="account-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${accounts.length})</span>`;
        fetchAccounts();
    } else {
        accountsView.classList.remove('active');
        charactersView.classList.add('active');
        pageTitle.innerHTML = `Characters <span id="char-count" style="font-size:1rem; opacity:0.7; font-weight:400;">(${characters.length})</span>`;

        // Hack: Append Import Button for Characters if not exists logic can be complex in vanilla JS 
        // simpler to just hide/show buttons if we had them in HTML, but consistent with current structure:
        // We will just let the "Import CSV" button in header be context aware or add another one?
        // Let's add specific handling in updateHeader() if we had one.
        // For simplicity: We will just toggle visibility of a new button we add to HTML in next step.
        fetchAccounts().then(() => fetchCharacters()); // Ensure accounts loaded for filter
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
                <p>PIN <span class="value">${acc.pin || 'N/A'}</span></p>
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
    const sortBy = document.getElementById('sort-by')?.value;

    let list = [...characters];

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
