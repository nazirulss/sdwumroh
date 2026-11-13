/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - MASTER DATA MASKAPAI & BANDARA PENERBANGAN
 * File: tests/test_admin_airlines_airports.js
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Master Data Maskapai & Bandara Penerbangan...\n');

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
    test('File-file esensial modul maskapai & bandara harus tersedia', () => {
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-airlines.js')), 'admin-airlines.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'jadwal.html')), 'jadwal.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Setup.gs')), 'Setup.gs tidak ditemukan');
    });

    // 2. Verifikasi UI Admin Sidebar & Tab Container
    test('admin.html harus memuat menu sidebar dan tab container tab-airlines', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('data-admin-tab="tab-airlines"'), 'Sidebar item tab-airlines tidak ditemukan');
        assert.ok(adminHtml.includes('id="tab-airlines"'), 'Tab container #tab-airlines tidak ditemukan');
        assert.ok(adminHtml.includes('id="secAirlinesList"'), 'Subtab maskapai #secAirlinesList tidak ditemukan');
        assert.ok(adminHtml.includes('id="secAirportsList"'), 'Subtab bandara #secAirportsList tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalAirlineEditor"'), 'Modal #modalAirlineEditor tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalAirportEditor"'), 'Modal #modalAirportEditor tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-airlines.js?v=1.0.0"'), 'Script tag admin-airlines.js tidak ditemukan');
    });

    // 3. Verifikasi Logika Controller admin-airlines.js
    test('admin-airlines.js harus mengekspor fungsi-fungsi CRUD dan UI terpadu', () => {
        const scriptCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-airlines.js'), 'utf8');
        assert.ok(scriptCode.includes('renderAirlines'), 'renderAirlines tidak ditemukan');
        assert.ok(scriptCode.includes('switchAirlinesSubtab'), 'switchAirlinesSubtab tidak ditemukan');
        assert.ok(scriptCode.includes('renderAirlinesList'), 'renderAirlinesList tidak ditemukan');
        assert.ok(scriptCode.includes('renderAirportsList'), 'renderAirportsList tidak ditemukan');
        assert.ok(scriptCode.includes('openAirlineModal'), 'openAirlineModal tidak ditemukan');
        assert.ok(scriptCode.includes('openAirportModal'), 'openAirportModal tidak ditemukan');
        assert.ok(scriptCode.includes('saveAirline'), 'saveAirline tidak ditemukan');
        assert.ok(scriptCode.includes('saveAirport'), 'saveAirport tidak ditemukan');
        assert.ok(scriptCode.includes('deleteAirline'), 'deleteAirline tidak ditemukan');
        assert.ok(scriptCode.includes('deleteAirport'), 'deleteAirport tidak ditemukan');
        assert.ok(scriptCode.includes('syncAirlinesFromCloud'), 'syncAirlinesFromCloud tidak ditemukan');
        assert.ok(scriptCode.includes('populateAirlinesSelect'), 'populateAirlinesSelect tidak ditemukan');
        assert.ok(scriptCode.includes('populateAirportsSelect'), 'populateAirportsSelect tidak ditemukan');
    });

    // 4. Verifikasi State & Router
    test('admin-state.js dan admin-nav.js harus mengintegrasikan tab-airlines', () => {
        const stateCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-state.js'), 'utf8');
        const navCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-nav.js'), 'utf8');

        assert.ok(stateCode.includes("AIRLINES: 'sdw_admin_airlines'"), 'State key AIRLINES tidak terdaftar');
        assert.ok(stateCode.includes("AIRPORTS: 'sdw_admin_airports'"), 'State key AIRPORTS tidak terdaftar');
        assert.ok(stateCode.includes("'tab-airlines'"), 'tab-airlines tidak terdaftar dalam role permissions');
        assert.ok(navCode.includes("admin.renderAirlines()"), 'admin-nav.js tidak mendispatch renderAirlines()');
    });

    // 5. Verifikasi Backend Apps Script Endpoints & Schemas
    test('backend/Code.gs dan backend/Setup.gs harus mendukung skema DB_Airlines & DB_Airports', () => {
        const codeGs = fs.readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
        const setupGs = fs.readFileSync(path.join(root, 'backend', 'Setup.gs'), 'utf8');

        assert.ok(codeGs.includes('getAirlines'), 'Endpoint getAirlines tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('getAirports'), 'Endpoint getAirports tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('saveAirline'), 'Mutation saveAirline tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('saveAirport'), 'Mutation saveAirport tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('deleteAirline'), 'Mutation deleteAirline tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('deleteAirport'), 'Mutation deleteAirport tidak ditemukan di Code.gs');

        assert.ok(setupGs.includes('DB_Airlines'), 'DB_Airlines tidak terdaftar di Setup.gs');
        assert.ok(setupGs.includes('DB_Airports'), 'DB_Airports tidak terdaftar di Setup.gs');
        assert.ok(setupGs.includes('setupAirlinesAndAirportsSheets'), 'setupAirlinesAndAirportsSheets tidak ditemukan di Setup.gs');
    });

    // 6. Verifikasi Integrasi Dropdown pada Form Paket dan Form Kloter
    test('admin.html harus memuat dropdown select dari Master Maskapai & Bandara', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="pkgAirlineSelect"'), 'Dropdown pkgAirlineSelect tidak ditemukan di form paket');
        assert.ok(adminHtml.includes('id="depModalAirlineSelect"'), 'Dropdown depModalAirlineSelect tidak ditemukan di form kloter');
        assert.ok(adminHtml.includes('id="depModalOriginAirportSelect"'), 'Dropdown depModalOriginAirportSelect tidak ditemukan di form kloter');
    });

    // 7. Verifikasi Integrasi Public Web jadwal.html
    test('jadwal.html harus memuat sinkronisasi dinamis initDynamicAirlineFilter', () => {
        const jadwalHtml = fs.readFileSync(path.join(root, 'jadwal.html'), 'utf8');
        assert.ok(jadwalHtml.includes('initDynamicAirlineFilter'), 'initDynamicAirlineFilter tidak ditemukan di jadwal.html');
        assert.ok(jadwalHtml.includes('sdw_admin_airlines'), 'Lookup sdw_admin_airlines tidak ditemukan di jadwal.html');
    });

    // 8. Verifikasi Service Worker Caching
    test('sw.js harus menyertakan admin-airlines.js dan versi cache terbaru v65', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(swCode.includes('sdw-umroh-pwa-v65'), 'Cache version v65 tidak ditemukan di sw.js');
        assert.ok(swCode.includes('/js/admin/admin-airlines.js'), 'admin-airlines.js tidak di-precache di sw.js');
    });

    console.log(`\n📊 Ringkasan Pengujian: ${passedTests}/${totalTests} Pengujian Berhasil.`);
    if (passedTests === totalTests) {
        console.log('🎉 SELURUH PENGUJIAN MODUL MASKAPAI & BANDARA BERHASIL 100%!\n');
        process.exit(0);
    } else {
        console.error('⚠️ Terdapat pengujian yang gagal, mohon periksa log di atas.\n');
        process.exit(1);
    }
})();
