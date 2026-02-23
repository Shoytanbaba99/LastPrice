/**
 * api.js – Shared fetch wrapper for HaggleArena
 * Automatically attaches JWT Bearer token from localStorage.
 * Usage: const data = await api.get('/api/listings');
 *        const data = await api.post('/api/bids', { listing_id: 1, amount: 50 });
 */
const API_BASE = '';

async function request(method, url, body = null, isFormData = false) {
    const token = localStorage.getItem('haggle_token');
    const headers = {};

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const response = await fetch(API_BASE + url, opts);
    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!response.ok) {
        const err = new Error(data.error || `HTTP ${response.status}`);
        err.status = response.status;
        err.data = data;
        throw err;
    }
    return data;
}

const api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    patch: (url, body) => request('PATCH', url, body),
    del: (url) => request('DELETE', url),
    upload: (url, formData) => request('POST', url, formData, true),
};

window.api = api;
