/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - MASTER FAQ & LAYANAN BANTUAN CS
 * File: tests/test_admin_faq_helpdesk.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Master FAQ & Layanan Bantuan CS...\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✅ PASS: ${name}`);
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
        }
    }

    const root = path.resolve(__dirname, '..');

    // 1. Verifikasi Keberadaan File Esensial
    test('File-file esensial modul FAQ & Helpdesk harus tersedia', () => {
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-faq.js')), 'admin-faq.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'faq.html')), 'faq.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'components.js')), 'components.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Setup.gs')), 'Setup.gs tidak ditemukan');
    });

    // 2. Verifikasi UI Admin Sidebar & Tab Container
    test('admin.html harus memuat menu sidebar, subtab, dan modal tab-faq', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('data-admin-tab="tab-faq"'), 'Sidebar item tab-faq tidak ditemukan');
        assert.ok(adminHtml.includes('id="tab-faq"'), 'Tab container #tab-faq tidak ditemukan');
        assert.ok(adminHtml.includes('id="secFaqList"'), 'Subtab FAQ #secFaqList tidak ditemukan');
        assert.ok(adminHtml.includes('id="secHelpdeskList"'), 'Subtab helpdesk #secHelpdeskList tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalFaqEditor"'), 'Modal #modalFaqEditor tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalHelpdeskEditor"'), 'Modal #modalHelpdeskEditor tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-faq.js?v=1.0.0"'), 'Script tag admin-faq.js tidak ditemukan');
    });

    // 3. Verifikasi Logika Controller admin-faq.js
    test('admin-faq.js harus mengekspor fungsi-fungsi CRUD dan state terpadu', () => {
        const scriptCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-faq.js'), 'utf8');
        assert.ok(scriptCode.includes('renderFaq'), 'renderFaq tidak ditemukan');
        assert.ok(scriptCode.includes('switchFaqSubtab'), 'switchFaqSubtab tidak ditemukan');
        assert.ok(scriptCode.includes('renderFaqList'), 'renderFaqList tidak ditemukan');
        assert.ok(scriptCode.includes('renderHelpdeskList'), 'renderHelpdeskList tidak ditemukan');
        assert.ok(scriptCode.includes('openFaqModal'), 'openFaqModal tidak ditemukan');
        assert.ok(scriptCode.includes('openHelpdeskModal'), 'openHelpdeskModal tidak ditemukan');
        assert.ok(scriptCode.includes('saveFaq'), 'saveFaq tidak ditemukan');
        assert.ok(scriptCode.includes('saveHelpdeskContact'), 'saveHelpdeskContact tidak ditemukan');
        assert.ok(scriptCode.includes('setPrimaryHelpdeskContact'), 'setPrimaryHelpdeskContact tidak ditemukan');
        assert.ok(scriptCode.includes('deleteFaq'), 'deleteFaq tidak ditemukan');
        assert.ok(scriptCode.includes('deleteHelpdeskContact'), 'deleteHelpdeskContact tidak ditemukan');
        assert.ok(scriptCode.includes('syncFaqFromCloud'), 'syncFaqFromCloud tidak ditemukan');
        assert.ok(scriptCode.includes('getPrimaryWhatsAppContact'), 'getPrimaryWhatsAppContact tidak ditemukan');
    });

    // 4. Verifikasi State & Router
    test('admin-state.js dan admin-nav.js harus mengintegrasikan tab-faq', () => {
        const stateCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-state.js'), 'utf8');
        assert.ok(stateCode.includes("FAQ: 'sdw_admin_faq'"), 'Storage key FAQ tidak ditemukan di state');
        assert.ok(stateCode.includes("CONTACTS: 'sdw_admin_contacts'"), 'Storage key CONTACTS tidak ditemukan di state');
        assert.ok(stateCode.includes("'tab-faq'"), 'Permission tab-faq tidak terdaftar di RBAC');

        const navCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-nav.js'), 'utf8');
        assert.ok(navCode.includes("tabId === 'tab-faq'"), 'Routing tab-faq tidak ditemukan di admin-nav.js');
        assert.ok(navCode.includes('admin.renderFaq()'), 'Pemanggilan admin.renderFaq() tidak ditemukan');
    });

    // 5. Verifikasi Skema Otoritatif & Apps Script Backend
    test('Setup.gs dan Code.gs harus memiliki skema DB_Faq dan DB_Helpdesk_Contacts', () => {
        const setupCode = fs.readFileSync(path.join(root, 'backend', 'Setup.gs'), 'utf8');
        assert.ok(setupCode.includes('DB_Faq'), 'DB_Faq tidak ada di Setup.gs');
        assert.ok(setupCode.includes('DB_Helpdesk_Contacts'), 'DB_Helpdesk_Contacts tidak ada di Setup.gs');
        assert.ok(setupCode.includes('setupFaqAndHelpdeskSheets'), 'setupFaqAndHelpdeskSheets tidak ditemukan');

        const codeCode = fs.readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
        assert.ok(codeCode.includes('getFaq'), 'Handler getFaq tidak ada di Code.gs');
        assert.ok(codeCode.includes('getHelpdeskContacts'), 'Handler getHelpdeskContacts tidak ada di Code.gs');
        assert.ok(codeCode.includes('saveFaq'), 'Handler saveFaq tidak ada di Code.gs');
        assert.ok(codeCode.includes('saveHelpdeskContact'), 'Handler saveHelpdeskContact tidak ada di Code.gs');
        assert.ok(codeCode.includes('deleteFaq'), 'Handler deleteFaq tidak ada di Code.gs');
        assert.ok(codeCode.includes('deleteHelpdeskContact'), 'Handler deleteHelpdeskContact tidak ada di Code.gs');
    });

    // 6. Verifikasi Integrasi Public faq.html & components.js
    test('faq.html dan components.js harus mengonsumsi data FAQ dan primary WhatsApp kontak', () => {
        const faqHtml = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
        assert.ok(faqHtml.includes('initDynamicFaq'), 'initDynamicFaq tidak ditemukan di faq.html');
        assert.ok(faqHtml.includes('sdw_admin_faq'), 'Pembacaan sdw_admin_faq tidak ditemukan di faq.html');
        assert.ok(faqHtml.includes('sdw_admin_contacts'), 'Pembacaan sdw_admin_contacts tidak ditemukan di faq.html');

        const compCode = fs.readFileSync(path.join(root, 'js', 'components.js'), 'utf8');
        assert.ok(compCode.includes('getPrimaryWhatsAppLink'), 'getPrimaryWhatsAppLink tidak ditemukan di components.js');
        assert.ok(compCode.includes('sdw_admin_contacts'), 'Pembacaan sdw_admin_contacts tidak ditemukan di components.js');
    });

    // 7. Verifikasi Service Worker Precaching
    test('sw.js harus mem-precache admin-faq.js dan menggunakan cache versi v66', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(swCode.includes('/js/admin/admin-faq.js'), 'admin-faq.js tidak terdaftar di PRECACHE_URLS');
        assert.ok(/sdw-umroh-pwa-v(6[6-9]|[7-9]\d)/.test(swCode), 'Cache version di sw.js harus minimal v66');
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();
