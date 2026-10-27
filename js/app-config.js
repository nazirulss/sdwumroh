/**
 * ====================================================================
 * SDW UMROH — TENANT CONFIGURATION & IDENTITY CONTRACT
 * ====================================================================
 * Single Source of Truth for SDW UMROH tenant identity,
 * branding, contact, infrastructure pointers, authentication endpoints,
 * centralized storage key namespace, and PWA options.
 *
 * Pattern: Adapted from Mubarokah_App UMD frozen contract.
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node / CommonJS
        module.exports = factory();
    } else {
        // Browser Global
        root.APP_CONFIG = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const PENDING = "__SDW_CONFIG_PENDING__";

    const APP_CONFIG = Object.freeze({
        // A. Tenant & Legal Identity
        tenant: Object.freeze({
            tenantId: "sdw_umroh",
            institutionName: "PT. Sahabat Dhuha Wisata (SDW UMROH)",
            institutionShortName: "SDW UMROH",
            licenseNumber: "PPIU No. U.123/2026 (Simulasi Kemenag RI)",
            accreditation: "Akreditasi A Kemenag RI",
            association: "Anggota AMPHURI / HIMPUH",
            tagline: "One Journey, One Platform"
        }),

        // B. Brand Aesthetics (Pine Green, Warm Gold, Sand)
        branding: Object.freeze({
            appName: "SDW UMROH",
            shortName: "SDW Umroh",
            tagline: "Ibadah Tenang, Fasilitas Terpercaya",
            logo: "assets/hero-haram.png",
            favicon: "assets/icons/favicon.ico",
            primaryColor: "#0F3D2E",     // Pine Green
            secondaryColor: "#C5A059",   // Warm Gold
            accentColor: "#165B44",      // Emerald Pine
            surfaceColor: "#FFFFFF",
            sandColor: "#F8F7F4"
        }),

        // C. Official Contact & Support Channels
        contact: Object.freeze({
            address: "Jl. TB Simatupang Kav. 88, Cilandak, Jakarta Selatan",
            phone: "+62 21 7890 1234",
            whatsapp: "6281234567890",
            email: "salam@sdwumroh.com",
            website: "https://sdwumroh.com",
            operationalHours: "Senin – Jumat: 08:30 – 17:00 WIB"
        }),

        // D. Infrastructure Pointers (Google Apps Script / Vercel API)
        infrastructure: Object.freeze({
            apiBaseUrl: PENDING,
            appsScriptWebAppUrl: PENDING,
            spreadsheetId: PENDING,
            driveRootFolderId: PENDING,
            drivePilgrimDocumentsFolderId: PENDING
        }),

        // E. Centralized Storage Keys Namespace (Mencegah Tabrakan Key)
        storage: Object.freeze({
            prefix: "sdw_",
            keys: Object.freeze({
                adminToken: "sdw_admin_token",
                adminRole: "sdw_admin_role",
                adminData: "sdw_admin_data",
                jamaahToken: "sdw_jamaah_token",
                jamaahData: "sdw_jamaah_data",
                theme: "sdw_theme",
                cartEstimate: "sdw_cart_estimate",
                pwaDismissed: "sdw_pwa_dismissed",
                readNotifIds: "sdw_read_notif_ids",
                cachedNotifikasi: "sdw_cached_notifikasi"
            })
        }),

        // F. Progressive Web App (PWA) Options
        pwa: Object.freeze({
            manifestName: "SDW UMROH — Digital Umrah Platform",
            manifestShortName: "SDW Umroh",
            manifestDescription: "Platform Digital Perjalanan Ibadah Umroh Terpadu",
            serviceWorkerCacheName: "sdw-umroh-cache-v1"
        })
    });

    return APP_CONFIG;
});
