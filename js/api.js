/**
 * ====================================================================
 * SDW UMROH — API ADAPTER LAYER
 * ====================================================================
 * Komunikasi data client-side ke backend Google Apps Script / Vercel API.
 * Mengadopsi pola Mubarokah_App:
 * 1. POST dengan Content-Type: text/plain;charset=utf-8 (Bypass CORS Preflight OPTIONS).
 * 2. Menggunakan redirect: "follow" dan credentials: "omit".
 * 3. Graceful offline fallback ke MOCK_DATA jika backend sedang PENDING atau offline.
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_API = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function getApiUrl() {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.infrastructure) {
            const url = APP_CONFIG.infrastructure.apiBaseUrl || APP_CONFIG.infrastructure.appsScriptWebAppUrl || "";
            if (url && !url.includes("__SDW_CONFIG_PENDING__")) {
                return url;
            }
        }
        return "";
    }

    function getActiveToken() {
        if (typeof APP_CONFIG === 'undefined' || !APP_CONFIG.storage) return "";
        const keys = APP_CONFIG.storage.keys;
        return sessionStorage.getItem(keys.adminToken) ||
               localStorage.getItem(keys.adminToken) ||
               sessionStorage.getItem(keys.jamaahToken) ||
               localStorage.getItem(keys.jamaahToken) || "";
    }

    /**
     * HTTP GET Request
     */
    async function apiGet(action, params = {}) {
        const baseUrl = getApiUrl();
        if (!baseUrl) {
            console.info(`[SDW_API] Mode Demo/Offline: Memanggil simulasi local untuk action=${action}`);
            return handleMockGet(action, params);
        }

        const url = new URL(baseUrl);
        url.searchParams.set("action", action);
        url.searchParams.set("tenantId", "sdw_umroh");

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        });

        const response = await fetch(url.toString(), {
            method: "GET",
            redirect: "follow",
            credentials: "omit",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        return await response.json();
    }

    /**
     * HTTP POST Request (Non-Preflight bypass CORS)
     */
    async function apiPost(action, payload = {}) {
        const targetUrl = getApiUrl();
        if (!targetUrl) {
            console.info(`[SDW_API] Mode Demo/Offline: Menyimulasikan mutasi local untuk action=${action}`);
            return handleMockPost(action, payload);
        }

        const resolvedToken = getActiveToken();
        const bodyPayload = {
            ...payload,
            action,
            tenantId: "sdw_umroh"
        };

        if (resolvedToken && !bodyPayload.token) {
            bodyPayload.token = resolvedToken;
        }

        const response = await fetch(targetUrl, {
            method: "POST",
            redirect: "follow",
            credentials: "omit",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
                "Accept": "application/json"
            },
            body: JSON.stringify(bodyPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * MOCK Fallback Handler untuk pengujian lokal mandiri
     */
    function handleMockGet(action, params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (action === 'getPackages') {
                    resolve({
                        success: true,
                        data: (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.packages : []),
                        source: 'mock'
                    });
                } else if (action === 'getDepartures') {
                    resolve({
                        success: true,
                        data: (typeof MOCK_DATA !== 'undefined' ? MOCK_DATA.departures : []),
                        source: 'mock'
                    });
                } else {
                    resolve({ success: true, data: null, source: 'mock' });
                }
            }, 100);
        });
    }

    function handleMockPost(action, payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: { id: "SIM-" + Date.now(), received: payload },
                    message: "Aksi disimulasikan berhasil (Mode Prototipe)",
                    source: 'mock'
                });
            }, 250);
        });
    }

    return {
        get: apiGet,
        post: apiPost,
        getToken: getActiveToken
    };
});
