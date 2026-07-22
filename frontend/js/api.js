// API Configuration and Helper Utilities
export const API_URL = 'http://localhost:5000/api';

export function isSameId(id1, id2) {
    if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) return false;
    const clean1 = strNormalizeId(id1);
    const clean2 = strNormalizeId(id2);
    return clean1 === clean2;
}

export function strNormalizeId(id) {
    let s = String(id).trim();
    if (s.endsWith('.0')) {
        s = s.substring(0, s.length - 2);
    }
    return s;
}

export function parseElementAndRefine(elemStr) {
    if (!elemStr || elemStr === 'Ninguno' || elemStr === 'None') {
        return { type: 'Ninguno', refine: '+0' };
    }
    const match = elemStr.match(/^([A-Za-zÁÉÍÓÚáéíóú]+)\s*\(\+?(\d+)\)$/);
    if (match) {
        return { type: match[1], refine: `+${match[2]}` };
    }
    return { type: elemStr, refine: '+0' };
}

export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startswith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, options);
    return response;
}
