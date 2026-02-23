/**
 * auth.js – JWT management utilities for LastPrice frontend
 */

const AUTH_TOKEN_KEY = 'lastprice_token';
const AUTH_USER_KEY = 'lastprice_user';

function setAuth(token, user) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getUser() {
    try {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth(redirectTo = '/login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

function redirectIfLoggedIn(redirectTo = '/dashboard.html') {
    if (isLoggedIn()) {
        window.location.href = redirectTo;
        return true;
    }
    return false;
}

async function refreshUser() {
    try {
        const data = await window.api.get('/api/auth/me');
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        return data.user;
    } catch { return null; }
}

window.authHelper = { setAuth, getToken, getUser, clearAuth, isLoggedIn, requireAuth, redirectIfLoggedIn, refreshUser };
