/**
 * ====================================================================
 * SDW UMROH — PWA INSTALL & SERVICE WORKER CONTROLLER
 * File: js/pwa.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function () {
    'use strict';

    // 1. Daftarkan Service Worker jika didukung browser
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then((reg) => {
                console.log('[PWA] ServiceWorker terdaftar dengan scope:', reg.scope);
            }).catch((err) => {
                console.log('[PWA] Pendaftaran ServiceWorker gagal:', err);
            });
        });
    }

    // 2. Deteksi Standalone Mode (Saat dibuka dari ikon layar utama / Homescreen HP)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
        document.body.classList.add('is-pwa-standalone');
        console.log('[PWA] Berjalan dalam mode Standalone PWA.');
    }
})();
