/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - HEADER & DROPDOWN POLISH (ASNAWIYYAH STYLE)
 * File: tests/test_admin_header_and_dropdown.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Top Header & Dropdown Polish (Asnawiyyah Style)...\n');

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

    // 1. Verifikasi Keberadaan Elemen Header di admin.html
    test('admin.html harus memuat breadcrumb dinamis, Alt+F search, dan pill Web Publik', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="headerBreadcrumbContainer"'), 'Container #headerBreadcrumbContainer tidak ditemukan');
        assert.ok(adminHtml.includes('id="headerBreadcrumbCurrent"'), 'Elemen #headerBreadcrumbCurrent tidak ditemukan');
        assert.ok(adminHtml.includes('Alt+F'), 'Badge keyboard Alt+F tidak ditemukan');
        assert.ok(adminHtml.includes('id="headerBtnWebPublic"'), 'Tombol #headerBtnWebPublic tidak ditemukan');
        assert.ok(adminHtml.includes('Web Publik'), 'Label teks Web Publik tidak ditemukan');
        assert.ok(adminHtml.includes('href="index.html"'), 'Link href index.html tidak ditemukan pada tombol web publik');
    });

    // 2. Verifikasi Dropdown Sesi Asnawiyyah di admin.html
    test('admin.html harus memuat menu dropdown profil Asnawiyyah dengan lengkap', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="userProfileDropdownContainer"'), 'Container kapsul profil sesi tidak ditemukan');
        assert.ok(adminHtml.includes('id="userProfileDropdownMenu"'), 'Menu dropdown profil tidak ditemukan');
        assert.ok(adminHtml.includes('Akun Travel (SDW Pusat)'), 'Header kartu identitas Akun Travel tidak ditemukan');
        assert.ok(adminHtml.includes('SDW_ADMIN.openProfileModal()'), 'Aksi SDW_ADMIN.openProfileModal() tidak ditemukan di dropdown');
        assert.ok(adminHtml.includes('Profil Saya'), 'Label menu Profil Saya tidak ditemukan');
        assert.ok(adminHtml.includes('Pengaturan Sistem &amp; RBAC'), 'Label menu Pengaturan Sistem tidak ditemukan');
        assert.ok(adminHtml.includes('Kelola Pengguna'), 'Label menu Kelola Pengguna tidak ditemukan');
        assert.ok(adminHtml.includes('Ganti Akun / Login Baru'), 'Label menu Ganti Akun tidak ditemukan');
        assert.ok(adminHtml.includes('Kunci Layar (Security Lock)'), 'Label menu Kunci Layar tidak ditemukan');
        assert.ok(adminHtml.includes('Keluar'), 'Label tombol Keluar tidak ditemukan');
    });

    // 3. Verifikasi Modal Profil Saya di admin.html
    test('admin.html harus memuat modal #modalUserProfile dengan field identitas lengkap', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="modalUserProfile"'), 'Modal #modalUserProfile tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalAvatar"'), 'Avatar profil #profileModalAvatar tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalName"'), 'Nama profil #profileModalName tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalRoleBadge"'), 'Badge role #profileModalRoleBadge tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalUserId"'), 'User ID #profileModalUserId tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalEmail"'), 'Email #profileModalEmail tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalPhone"'), 'Phone #profileModalPhone tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalConnectedEntity"'), 'Connected entity #profileModalConnectedEntity tidak ditemukan');
        assert.ok(adminHtml.includes('id="profileModalNewPassword"'), 'Input sandi baru #profileModalNewPassword tidak ditemukan');
        assert.ok(adminHtml.includes('SDW_ADMIN.saveProfilePassword(event)'), 'Form submit saveProfilePassword tidak ditemukan');
    });

    // 4. Verifikasi Controller admin-nav.js (Breadcrumb Dictionary & Updates)
    test('admin-nav.js harus mengekspor TAB_BREADCRUMBS dan updateBreadcrumb', () => {
        const navModule = require('../js/admin/admin-nav.js');
        assert.ok(navModule.TAB_BREADCRUMBS, 'TAB_BREADCRUMBS tidak diekspor');
        assert.strictEqual(navModule.TAB_BREADCRUMBS['tab-dashboard'], 'Dashboard Utama');
        assert.strictEqual(navModule.TAB_BREADCRUMBS['tab-users'], 'Manajemen Pengguna Terpadu');
        assert.strictEqual(navModule.TAB_BREADCRUMBS['tab-roles'], 'Manajemen Peran & Hak Akses');
        assert.strictEqual(navModule.TAB_BREADCRUMBS['tab-packages'], 'Katalog Paket Umroh');
        assert.strictEqual(navModule.TAB_BREADCRUMBS['tab-departures'], 'Jadwal Kloter Keberangkatan');
        assert.ok(typeof navModule.updateBreadcrumb === 'function', 'updateBreadcrumb bukan fungsi');
    });

    // 5. Verifikasi Controller admin-auth.js (Profile Modal Controls)
    test('admin-auth.js harus mengekspor fungsi modal profil', () => {
        const authModule = require('../js/admin/admin-auth.js');
        assert.ok(typeof authModule.openProfileModal === 'function', 'openProfileModal bukan fungsi');
        assert.ok(typeof authModule.closeProfileModal === 'function', 'closeProfileModal bukan fungsi');
        assert.ok(typeof authModule.saveProfilePassword === 'function', 'saveProfilePassword bukan fungsi');
    });

    // 6. Verifikasi Global Keyboard Shortcuts di admin-core.js
    test('admin-core.js harus mendukung Alt+F dan Ctrl+K untuk pencarian global', () => {
        const coreCode = fs.readFileSync(path.join(root, 'js', 'admin-core.js'), 'utf8');
        assert.ok(coreCode.includes("e.key.toLowerCase() === 'k'"), 'Shortcut Ctrl+K tidak ditemukan');
        assert.ok(coreCode.includes("e.altKey && e.key.toLowerCase() === 'f'"), 'Shortcut Alt+F tidak ditemukan');
    });

    // 7. Verifikasi Service Worker Caching
    test('sw.js harus menggunakan cache versi v69+', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(/sdw-umroh-pwa-v(69|[7-9]\d)/.test(swCode), 'Cache version di sw.js harus minimal v69');
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();

