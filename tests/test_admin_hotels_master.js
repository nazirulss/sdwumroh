/**
 * ====================================================================
 * TEST SUITE: MASTER DATA HOTEL HARAMAIN (MAKKAH & MADINAH)
 * File: tests/test_admin_hotels_master.js
 * Verification of admin UI, state container, navigation wiring,
 * hotel controller, public hotel.html sync, and backend contract.
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('\n[TEST SUITE] Memulai verifikasi Master Data Hotel Haramain Admin & Web Sync...\n');

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
    const backendCodeGs = fs.readFileSync(path.join(rootDir, 'backend/Code.gs'), 'utf8');
    const backendSetupGs = fs.readFileSync(path.join(rootDir, 'backend/Setup.gs'), 'utf8');
    const hotelHtml = fs.readFileSync(path.join(rootDir, 'hotel.html'), 'utf8');
    const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf8');

    // ----------------------------------------------------
    // 1. Verifikasi Sidebar & Antarmuka HTML Tab Hotel
    // ----------------------------------------------------
    test('1. Sidebar memiliki menu Master Data Hotel dengan data-admin-tab="tab-hotels"', () => {
        assert(adminHtml.includes('data-admin-tab="tab-hotels"'), 'Menu tab-hotels tidak ditemukan di sidebar');
        assert(adminHtml.includes('badgeHotelCount'), 'Badge hotel count tidak ditemukan di sidebar');
        assert(adminHtml.includes('fa-hotel'), 'Icon hotel tidak ditemukan di menu sidebar');
    });

    test('2. Container tab-hotels terpasang lengkap dengan KPI Stats', () => {
        assert(adminHtml.includes('id="tab-hotels"'), 'Container tab-hotels tidak ditemukan');
        assert(adminHtml.includes('id="statTotalHotels"'), 'Stat total hotels tidak ditemukan');
        assert(adminHtml.includes('id="statHotelsMakkah"'), 'Stat hotels makkah tidak ditemukan');
        assert(adminHtml.includes('id="statHotelsMadinah"'), 'Stat hotels madinah tidak ditemukan');
        assert(adminHtml.includes('id="statHotelsStar5"'), 'Stat hotels star 5 tidak ditemukan');
    });

    test('3. Toolbar filter dan datagrid tabel terpasang dengan rapi', () => {
        assert(adminHtml.includes('id="searchHotelsInput"'), 'Input search hotels tidak ditemukan');
        assert(adminHtml.includes('id="filterHotelCitySelect"'), 'Filter dropdown city tidak ditemukan');
        assert(adminHtml.includes('id="filterHotelStarSelect"'), 'Filter dropdown star tidak ditemukan');
        assert(adminHtml.includes('id="filterHotelZoneSelect"'), 'Filter dropdown zone tidak ditemukan');
        assert(adminHtml.includes('id="filterHotelStatusSelect"'), 'Filter dropdown status tidak ditemukan');
        assert(adminHtml.includes('id="hotelTableView"'), 'Table view container tidak ditemukan');
        assert(adminHtml.includes('id="table-hotels-body"'), 'Table body table-hotels-body tidak ditemukan');
        assert(adminHtml.includes('id="hotelCardsView"'), 'Cards view container tidak ditemukan');
        assert(adminHtml.includes('id="hotel-cards-grid"'), 'Cards grid container tidak ditemukan');
        assert(adminHtml.includes('id="hotelEmptyState"'), 'Empty state container tidak ditemukan');
    });

    test('4. Modal editor hotel modalHotelEditor terpasang dengan field lengkap', () => {
        assert(adminHtml.includes('id="modalHotelEditor"'), 'Modal modalHotelEditor tidak ditemukan');
        assert(adminHtml.includes('id="formHotelEditor"'), 'Form formHotelEditor tidak ditemukan');
        assert(adminHtml.includes('id="htlModalId"'), 'Input htlModalId tidak ditemukan');
        assert(adminHtml.includes('id="htlModalName"'), 'Input htlModalName tidak ditemukan');
        assert(adminHtml.includes('id="htlModalCity"'), 'Select htlModalCity tidak ditemukan');
        assert(adminHtml.includes('id="htlModalStar"'), 'Select htlModalStar tidak ditemukan');
        assert(adminHtml.includes('id="htlModalDistanceMeters"'), 'Input htlModalDistanceMeters tidak ditemukan');
        assert(adminHtml.includes('id="htlModalDistanceText"'), 'Input htlModalDistanceText tidak ditemukan');
        assert(adminHtml.includes('id="htlModalZone"'), 'Select htlModalZone tidak ditemukan');
        assert(adminHtml.includes('id="htlModalGate"'), 'Input htlModalGate tidak ditemukan');
        assert(adminHtml.includes('id="htlModalImage"'), 'Input htlModalImage tidak ditemukan');
        assert(adminHtml.includes('id="htlModalMaps"'), 'Input htlModalMaps tidak ditemukan');
        assert(adminHtml.includes('id="htlModalFacilities"'), 'Input htlModalFacilities tidak ditemukan');
        assert(adminHtml.includes('id="htlModalDescription"'), 'Textarea htlModalDescription tidak ditemukan');
        assert(adminHtml.includes('id="htlModalStatus"'), 'Select htlModalStatus tidak ditemukan');
    });

    test('5. Form Paket Umroh terintegrasi dengan dropdown master hotel Makkah & Madinah', () => {
        assert(adminHtml.includes('id="pkgHotelMakkahSelect"'), 'Dropdown pkgHotelMakkahSelect tidak ditemukan di modal paket');
        assert(adminHtml.includes('id="pkgHotelMadinahSelect"'), 'Dropdown pkgHotelMadinahSelect tidak ditemukan di modal paket');
        assert(adminHtml.includes('src="js/admin/admin-hotels.js'), 'Script tag admin-hotels.js tidak ditemukan');
    });

    // ----------------------------------------------------
    // 2. Verifikasi State & Router Navigasi
    // ----------------------------------------------------
    test('6. admin-state.js mendaftarkan storage key HOTELS dan RBAC permissions', () => {
        assert(adminStateJs.includes("HOTELS: 'sdw_admin_hotels'"), 'Storage key HOTELS tidak terdaftar');
        assert(adminStateJs.includes("'tab-hotels'"), 'tab-hotels tidak didaftarkan pada ADMIN_PERMISSIONS');
        assert(adminStateJs.includes("hotelsFilter:"), 'hotelsFilter tidak ada di initial state');
        assert(adminStateJs.includes("hotelsData:"), 'hotelsData tidak ada di initial state');
    });

    test('7. admin-nav.js meneruskan switchTab tab-hotels ke admin.renderHotels', () => {
        assert(adminNavJs.includes("tabId === 'tab-hotels'"), 'Router nav tidak menangani tab-hotels');
        assert(adminNavJs.includes("admin.renderHotels()"), 'renderHotels tidak dipanggil pada switchTab');
    });

    // ----------------------------------------------------
    // 3. Verifikasi Logika Controller Admin Hotels
    // ----------------------------------------------------
    test('8. Controller js/admin/admin-hotels.js mengekspor fungsi-fungsi CRUD dan UI', () => {
        const initialized = require(path.join(rootDir, 'js/admin/admin-hotels.js'));

        assert(typeof initialized.renderHotels === 'function', 'renderHotels harus diekspor');
        assert(typeof initialized.openHotelModal === 'function', 'openHotelModal harus diekspor');
        assert(typeof initialized.closeHotelModal === 'function', 'closeHotelModal harus diekspor');
        assert(typeof initialized.saveHotelForm === 'function', 'saveHotelForm harus diekspor');
        assert(typeof initialized.deleteHotel === 'function', 'deleteHotel harus diekspor');
        assert(typeof initialized.syncHotelsFromCloud === 'function', 'syncHotelsFromCloud harus diekspor');
        assert(typeof initialized.previewHotelWeb === 'function', 'previewHotelWeb harus diekspor');
        assert(typeof initialized.getHotelsList === 'function', 'getHotelsList harus diekspor');
        assert(typeof initialized.populateHotelDropdownsInPackageEditor === 'function', 'populateHotelDropdownsInPackageEditor harus diekspor');

        const list = initialized.getHotelsList();
        assert(Array.isArray(list) && list.length >= 9, 'Default hotels list harus minimal 9 hotel resmi');
        assert.strictEqual(list[0].id, 'HTL-000001', 'ID hotel pertama harus HTL-000001');
        assert.strictEqual(list[0].city, 'MAKKAH', 'Kota hotel pertama harus MAKKAH');
        assert.strictEqual(list[5].id, 'HTL-000006', 'ID hotel keenam harus HTL-000006');
        assert.strictEqual(list[5].city, 'MADINAH', 'Kota hotel keenam harus MADINAH');
    });

    // ----------------------------------------------------
    // 4. Verifikasi Backend Apps Script & Setup
    // ----------------------------------------------------
    test('9. backend/Code.gs memiliki getHotels, upgradeHotelsSchema, dan mutasi hotel', () => {
        assert(backendCodeGs.includes("action === 'getHotels'"), 'getHotels tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'upgradeHotelsSchema'"), 'upgradeHotelsSchema tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'saveHotel'"), 'saveHotel tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'setHotelStatus'"), 'setHotelStatus tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("action === 'deleteHotel'"), 'deleteHotel tidak ditemukan di Code.gs');
        assert(backendCodeGs.includes("function autoUpgradeHotelsSheet_"), 'autoUpgradeHotelsSheet_ tidak ditemukan');
    });

    test('10. backend/Setup.gs memiliki helper setupHotelsSheet dan skema DB_Hotels', () => {
        assert(backendSetupGs.includes('"DB_Hotels":'), 'Skema DB_Hotels tidak ditemukan di AUTHORITATIVE_SCHEMAS_');
        assert(backendSetupGs.includes("function setupHotelsSheet()"), 'setupHotelsSheet tidak ditemukan di Setup.gs');
        assert(backendSetupGs.includes("setupHotelsSheet();"), 'setupHotelsSheet tidak dipanggil di initialize');
    });

    // ----------------------------------------------------
    // 5. Verifikasi Halaman Publik & Service Worker
    // ----------------------------------------------------
    test('11. hotel.html memiliki skrip sinkronisasi dinamis dari Master Hotel', () => {
        assert(hotelHtml.includes('id="hotel-cards-grid"'), 'hotel-cards-grid tidak ditemukan di hotel.html');
        assert(hotelHtml.includes('initDynamicHotels'), 'initDynamicHotels tidak ditemukan di hotel.html');
    });

    test('12. sw.js mendaftarkan /js/admin/admin-hotels.js dan menaikkan cache ke v62+', () => {
        assert(/sdw-umroh-pwa-v6[2-9]/.test(swJs), 'CACHE_NAME belum dinaikkan ke v62+');
        assert(swJs.includes("'/js/admin/admin-hotels.js'"), 'admin-hotels.js belum masuk ke PRECACHE_URLS');
    });

    console.log(`\nHasil: ${passedTests} / ${totalTests} pengujian berhasil dilalui (100% PASS).\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();

