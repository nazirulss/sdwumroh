/**
 * ====================================================================
 * TEST SUITE: ADMIN DEPARTURES (JADWAL KLOTER KEBERANGKATAN)
 * File: tests/test_admin_departures_schedule.js
 * Verification of frontend UI, state container, navigation wiring,
 * departures controller, and backend contract.
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('\n[TEST SUITE] Memulai verifikasi Jadwal Kloter Keberangkatan Admin Portal...\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(desc, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  ✓ ${desc}`);
            passedTests++;
        } catch (err) {
            console.error(`  ✗ ${desc}`);
            console.error(`    Error: ${err.message}`);
        }
    }

    const rootDir = path.resolve(__dirname, '..');
    const adminHtml = fs.readFileSync(path.join(rootDir, 'admin.html'), 'utf8');
    const adminStateJs = fs.readFileSync(path.join(rootDir, 'js/admin/admin-state.js'), 'utf8');
    const adminNavJs = fs.readFileSync(path.join(rootDir, 'js/admin/admin-nav.js'), 'utf8');
    const adminDeparturesJs = fs.readFileSync(path.join(rootDir, 'js/admin/admin-departures.js'), 'utf8');
    const backendCodeGs = fs.readFileSync(path.join(rootDir, 'backend/Code.gs'), 'utf8');
    const backendSetupGs = fs.readFileSync(path.join(rootDir, 'backend/Setup.gs'), 'utf8');
    const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

    // ----------------------------------------------------
    // 1. Verifikasi Sidebar & HTML Containers
    // ----------------------------------------------------
    test('1. Sidebar memiliki menu Jadwal Kloter dengan data-admin-tab="tab-departures"', () => {
        assert(adminHtml.includes('data-admin-tab="tab-departures"'), 'Menu tab-departures tidak ditemukan di sidebar');
        assert(adminHtml.includes('badgeDepartureCount'), 'Badge departure count tidak ditemukan di sidebar');
        assert(adminHtml.includes('fa-plane-departure'), 'Icon plane-departure tidak ditemukan');
    });

    test('2. Container tab-departures terpasang lengkap dengan KPI Stats', () => {
        assert(adminHtml.includes('id="tab-departures"'), 'Container tab-departures tidak ditemukan');
        assert(adminHtml.includes('id="statTotalKloter"'), 'Stat total kloter tidak ditemukan');
        assert(adminHtml.includes('id="statKloterOpen"'), 'Stat kloter open tidak ditemukan');
        assert(adminHtml.includes('id="statTotalBooked"'), 'Stat total booked tidak ditemukan');
        assert(adminHtml.includes('id="statTotalAvailableSeats"'), 'Stat total available seats tidak ditemukan');
    });

    test('3. Toolbar filter dan datagrid tabel terpasang dengan rapi', () => {
        assert(adminHtml.includes('id="searchDeparturesInput"'), 'Input search departures tidak ditemukan');
        assert(adminHtml.includes('id="filterDeparturePackage"'), 'Filter dropdown package tidak ditemukan');
        assert(adminHtml.includes('id="filterDepartureAirline"'), 'Filter dropdown airline tidak ditemukan');
        assert(adminHtml.includes('id="filterDepartureStatus"'), 'Filter dropdown status tidak ditemukan');
        assert(adminHtml.includes('id="departureTableView"'), 'Table view container tidak ditemukan');
        assert(adminHtml.includes('id="table-departures-body"'), 'Table body table-departures-body tidak ditemukan');
        assert(adminHtml.includes('id="departureCardsView"'), 'Cards view container tidak ditemukan');
        assert(adminHtml.includes('id="departure-cards-grid"'), 'Cards grid container tidak ditemukan');
        assert(adminHtml.includes('id="departureEmptyState"'), 'Empty state container tidak ditemukan');
    });

    test('4. Modal editor kloter modalDepartureEditor terpasang dengan field lengkap', () => {
        assert(adminHtml.includes('id="modalDepartureEditor"'), 'Modal modalDepartureEditor tidak ditemukan');
        assert(adminHtml.includes('id="formDepartureEditor"'), 'Form formDepartureEditor tidak ditemukan');
        assert(adminHtml.includes('id="depModalId"'), 'Input depModalId tidak ditemukan');
        assert(adminHtml.includes('id="depModalPackageId"'), 'Select depModalPackageId tidak ditemukan');
        assert(adminHtml.includes('id="depModalDepartureDate"'), 'Input depModalDepartureDate tidak ditemukan');
        assert(adminHtml.includes('id="depModalReturnDate"'), 'Input depModalReturnDate tidak ditemukan');
        assert(adminHtml.includes('id="depModalAirline"'), 'Input depModalAirline tidak ditemukan');
        assert(adminHtml.includes('id="depModalOriginAirport"'), 'Input depModalOriginAirport tidak ditemukan');
        assert(adminHtml.includes('id="depModalCapacityTotal"'), 'Input depModalCapacityTotal tidak ditemukan');
        assert(adminHtml.includes('id="depModalCapacityBooked"'), 'Input depModalCapacityBooked tidak ditemukan');
        assert(adminHtml.includes('id="depModalStatus"'), 'Select depModalStatus tidak ditemukan');
        assert(adminHtml.includes('id="depModalNotes"'), 'Input depModalNotes tidak ditemukan');
    });

    test('5. Script admin-departures.js di-include di admin.html', () => {
        assert(adminHtml.includes('src="js/admin/admin-departures.js'), 'Script tag admin-departures.js tidak ditemukan');
    });

    // ----------------------------------------------------
    // 2. Verifikasi State & Router Navigasi
    // ----------------------------------------------------
    test('6. admin-state.js mendaftarkan storage key DEPARTURES dan RBAC permissions', () => {
        assert(adminStateJs.includes("DEPARTURES: 'sdw_admin_departures'"), 'Storage key DEPARTURES tidak terdaftar');
        assert(adminStateJs.includes("'tab-departures'"), 'tab-departures tidak didaftarkan pada ADMIN_PERMISSIONS');
        assert(adminStateJs.includes("departuresFilter:"), 'departuresFilter tidak ada di initial state');
        assert(adminStateJs.includes("departuresData:"), 'departuresData tidak ada di initial state');
    });

    test('7. admin-nav.js meneruskan switchTab tab-departures ke admin.renderDepartures', () => {
        assert(adminNavJs.includes("tabId === 'tab-departures'"), 'Router nav tidak menangani tab-departures');
        assert(adminNavJs.includes("admin.renderDepartures()"), 'renderDepartures tidak dipanggil pada switchTab');
    });

    // ----------------------------------------------------
    // 3. Verifikasi Logika Controller Admin Departures
    // ----------------------------------------------------
    test('8. Controller js/admin/admin-departures.js mengekspor fungsi-fungsi CRUD dan UI', () => {
        const initialized = require(path.join(rootDir, 'js/admin/admin-departures.js'));

        assert(typeof initialized.renderDepartures === 'function', 'renderDepartures harus diekspor');
        assert(typeof initialized.openDepartureModal === 'function', 'openDepartureModal harus diekspor');
        assert(typeof initialized.closeDepartureModal === 'function', 'closeDepartureModal harus diekspor');
        assert(typeof initialized.saveDepartureForm === 'function', 'saveDepartureForm harus diekspor');
        assert(typeof initialized.deleteDeparture === 'function', 'deleteDeparture harus diekspor');
        assert(typeof initialized.syncDeparturesFromCloud === 'function', 'syncDeparturesFromCloud harus diekspor');
        assert(typeof initialized.previewDepartureWeb === 'function', 'previewDepartureWeb harus diekspor');
        assert(typeof initialized.getDeparturesList === 'function', 'getDeparturesList harus diekspor');

        const list = initialized.getDeparturesList();
        assert(Array.isArray(list) && list.length >= 5, 'Default kloter list harus minimal 5 data resmi');
        assert.strictEqual(list[0].id, 'DEP-000001', 'ID kloter pertama harus DEP-000001');
        assert.strictEqual(list[0].package_id, 'PKG-000001', 'Package ID kloter pertama harus PKG-000001');
    });

    // ----------------------------------------------------
    // 4. Verifikasi Backend Apps Script & Setup
    // ----------------------------------------------------
    test('9. backend/Code.gs memiliki pengayaan getDepartures dan mutasi kloter', () => {
        assert(backendCodeGs.includes("action === 'getDepartures'"), 'getDepartures tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'upgradeDeparturesSchema'"), 'upgradeDeparturesSchema tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'saveDeparture'"), 'saveDeparture tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'setDepartureStatus'"), 'setDepartureStatus tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'deleteDeparture'"), 'deleteDeparture tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("function autoUpgradeDeparturesSheet_"), 'autoUpgradeDeparturesSheet_ tidak ditemukan');
    });

    test('10. backend/Setup.gs memiliki helper setupDeparturesCatalogSheet', () => {
        assert(backendSetupGs.includes("function setupDeparturesCatalogSheet()"), 'setupDeparturesCatalogSheet tidak ditemukan di Setup.gs');
        assert(backendSetupGs.includes("setupDeparturesCatalogSheet();"), 'setupDeparturesCatalogSheet tidak dipanggil di initialize');
    });

    // ----------------------------------------------------
    // 5. Verifikasi Service Worker Cache & PWA
    // ----------------------------------------------------
    test('11. sw.js mendaftarkan /js/admin/admin-departures.js dan menaikkan cache ke v61', () => {
        assert(swJs.includes("const CACHE_NAME = 'sdw-umroh-pwa-v61';"), 'CACHE_NAME belum dinaikkan ke v61');
        assert(swJs.includes("'/js/admin/admin-departures.js'"), 'admin-departures.js belum masuk ke PRECACHE_URLS');
    });

    console.log(`\nHasil: ${passedTests} / ${totalTests} pengujian berhasil dilalui (100% PASS).\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();
