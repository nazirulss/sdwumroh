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
                } else if (action === 'getAllProfileData') {
                    let inst = null, dir = null, gds = null, leg = null;
                    try {
                        const rawInst = localStorage.getItem('sdw_admin_profile_institution');
                        if (rawInst) inst = JSON.parse(rawInst);
                        const rawDir = localStorage.getItem('sdw_admin_profile_director');
                        if (rawDir) dir = JSON.parse(rawDir);
                        const rawGds = localStorage.getItem('sdw_admin_profile_guides');
                        if (rawGds) gds = JSON.parse(rawGds);
                        const rawLeg = localStorage.getItem('sdw_admin_profile_legality');
                        if (rawLeg) leg = JSON.parse(rawLeg);
                    } catch (_) {}
                    resolve({
                        success: true,
                        data: {
                            institution: inst,
                            director: dir,
                            guides: gds,
                            legality: leg,
                            mitra_syiar: (leg && leg.mitra_syiar) || []
                        },
                        source: 'mock'
                    });
                } else if (action === 'getProfileInstitution') {
                    let inst = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_profile_institution');
                        if (raw) inst = JSON.parse(raw);
                    } catch (_) {}
                    resolve({ success: true, data: inst, source: 'mock' });
                } else if (action === 'getProfileDirector') {
                    let dir = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_profile_director');
                        if (raw) dir = JSON.parse(raw);
                    } catch (_) {}
                    resolve({ success: true, data: dir, source: 'mock' });
                } else if (action === 'getProfileGuides') {
                    let gds = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_profile_guides');
                        if (raw) gds = JSON.parse(raw);
                    } catch (_) {}
                    resolve({ success: true, data: gds, source: 'mock' });
                } else if (action === 'getProfileLegality') {
                    let leg = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_profile_legality');
                        if (raw) leg = JSON.parse(raw);
                    } catch (_) {}
                    resolve({ success: true, data: leg, source: 'mock' });
                } else if (action === 'getProfileMitraSyiar') {
                    let leg = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_profile_legality');
                        if (raw) leg = JSON.parse(raw);
                    } catch (_) {}
                    resolve({ success: true, data: (leg && leg.mitra_syiar) || [], source: 'mock' });
                } else if (action === 'getContactSocial') {
                    let cs = null;
                    try {
                        const raw = localStorage.getItem('sdw_admin_contact_social');
                        if (raw) cs = JSON.parse(raw);
                    } catch (_) {}
                    if (!cs) {
                        cs = {
                            id: "CNT-000001",
                            company_name: "PT Sahabat Dhuha Wisata (SDW UMROH)",
                            address_line: "Jl. Raya Kudus - Jepara KM 5",
                            city_province_postal: "Kabupaten Kudus, Jawa Tengah 59333",
                            google_maps_url: "https://maps.google.com/?q=SDW+Umroh+Kudus",
                            whatsapp_number: "+62 812-3456-7890",
                            whatsapp_clean: "6281234567890",
                            whatsapp_template: "Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.",
                            phone_office: "(0291) 438-999",
                            hotline_24h: "+62 812-3456-7890",
                            email_official: "layanan@sdwumroh.co.id",
                            operational_hours: "Senin – Jumat: 08:30 – 17:00 WIB | Sabtu: 08:30 – 14:00 WIB",
                            instagram_url: "https://instagram.com/sdwumroh.official",
                            instagram_handle: "@sdwumroh.official",
                            facebook_url: "https://facebook.com/sdwumrohofficial",
                            facebook_name: "SDW Umroh Official",
                            youtube_url: "https://youtube.com/@sdwumroh",
                            youtube_name: "SDW Umroh TV & Manasik",
                            tiktok_url: "https://tiktok.com/@sdwumroh",
                            tiktok_handle: "@sdwumroh"
                        };
                    }
                    resolve({ success: true, data: cs, source: 'mock' });
                } else {
                    resolve({ success: true, data: null, source: 'mock' });
                }
            }, 100);
        });
    }

    function handleMockPost(action, payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (action === 'uploadCertificatePhoto' || action === 'uploadPilgrimPhoto' || action === 'uploadProfilePhoto') {
                    const mockFileId = '1mock_photo_' + Date.now();
                    const mockDriveUrl = 'https://lh3.googleusercontent.com/d/' + mockFileId;
                    resolve({
                        success: true,
                        data: {
                            id: 'DOC-SIM-' + Date.now(),
                            fileId: mockFileId,
                            driveUrl: payload.photoBase64 || mockDriveUrl,
                            viewLink: mockDriveUrl,
                            url: payload.photoBase64 || mockDriveUrl,
                            regId: payload.regId,
                            status: 'PHOTO_UPLOADED',
                            entity: 'DB_Pilgrim_Documents'
                        },
                        message: "Foto berhasil diunggah (Simulasi Drive & Spreadsheet)",
                        source: 'mock'
                    });
                    return;
                }

                if (action === 'saveAllProfileData' || action === 'saveProfileInstitution' || action === 'saveProfileDirector' || action === 'saveProfileGuide' || action === 'saveProfileLegalityDoc' || action === 'saveProfileMitraSyiar' || action === 'deleteProfileGuide' || action === 'deleteProfileLegalityDoc' || action === 'deleteProfileMitraSyiar' || action === 'saveContactSocial') {
                    if (action === 'saveContactSocial') {
                        try {
                            localStorage.setItem('sdw_admin_contact_social', JSON.stringify(payload));
                        } catch (_) {}
                    }
                    resolve({
                        success: true,
                        message: "Data berhasil disimpan (Simulasi Database)",
                        data: payload,
                        source: 'mock'
                    });
                    return;
                }

                if (action === 'syncBatch') {
                    const mutations = payload.mutations || [];
                    const results = mutations.map(m => ({
                        mutationId: m.id || m.clientMutationId,
                        action: m.action,
                        success: true,
                        data: {
                            id: m.payload && (m.payload.id || m.payload.leadId || m.payload.regId || m.payload.paymentId || ('SIM-' + Date.now())),
                            simulated: true,
                            syncedAt: new Date().toISOString()
                        }
                    }));
                    resolve({
                        success: true,
                        data: {
                            processed: results.length,
                            successCount: results.length,
                            details: results,
                            message: "Batch sync berhasil diproses (Simulasi Local/Offline-First Engine)"
                        },
                        source: 'mock'
                    });
                    return;
                }

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
