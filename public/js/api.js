/**
 * api.js – Shared fetch wrapper for LastPrice
 * Automatically attaches JWT Bearer token from localStorage.
 */
const API_BASE = '';

async function request(method, url, body = null, isFormData = false) {
    const token = localStorage.getItem('lastprice_token');
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
    
    // Time synchronization
    timeOffset: 0,
    auctionDurationMins: 6,
    async syncTime() {
        try {
            const start = Date.now();
            const data = await this.get('/api/time');
            const end = Date.now();
            const latency = (end - start) / 2;
            this.timeOffset = data.serverTime - (end - latency);
            this.auctionDurationMins = data.auctionDurationMins || 6;
            console.log(`[TimeSync] Offset: ${this.timeOffset}ms, Latency: ${latency}ms, Duration: ${this.auctionDurationMins}m`);
        } catch (e) {
            console.error('Time sync failed:', e);
        }
    },
    getSyncedDate() {
        return new Date(Date.now() + this.timeOffset);
    }
};

window.api = api;
