/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - DASHBOARD CANVAS & 4 VIBRANT GRADIENT CARDS
 * File: tests/test_admin_dashboard_canvas.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Dashboard Canvas & 4 Kartu KPI Gradien (Asnawiyyah Style)...\n');

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

    // 1. Verifikasi Greeting Header & Live Clock Banner di admin.html
    test('admin.html harus memuat banner greeting personal dan live clock format Indonesia', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="dashGreetingName"'), 'Elemen #dashGreetingName tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashRoleBadge"'), 'Elemen #dashRoleBadge tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashLiveDateTime"'), 'Elemen #dashLiveDateTime tidak ditemukan');
        assert.ok(adminHtml.includes('Selamat Bertugas'), 'Teks default Selamat Bertugas tidak ditemukan');
    });

    // 2. Verifikasi Time-range Filter Bar di admin.html
    test('admin.html harus memuat bilah filter waktu Overall Data dan tombol refresh', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('Overall Data'), 'Label Overall Data tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashPeriodFilterContainer"'), 'Container #dashPeriodFilterContainer tidak ditemukan');
        assert.ok(adminHtml.includes('data-dash-period="TODAY"'), 'Pill filter TODAY tidak ditemukan');
        assert.ok(adminHtml.includes('data-dash-period="7D"'), 'Pill filter 7D tidak ditemukan');
        assert.ok(adminHtml.includes('data-dash-period="30D"'), 'Pill filter 30D tidak ditemukan');
        assert.ok(adminHtml.includes('data-dash-period="90D"'), 'Pill filter 90D tidak ditemukan');
        assert.ok(adminHtml.includes('data-dash-period="ALL"'), 'Pill filter ALL tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashBtnRefresh"'), 'Tombol refresh #dashBtnRefresh tidak ditemukan');
        assert.ok(adminHtml.includes('SDW_ADMIN.setDashboardPeriod'), 'Handler SDW_ADMIN.setDashboardPeriod tidak ditemukan');
        assert.ok(adminHtml.includes('SDW_ADMIN.refreshDashboardData()'), 'Handler SDW_ADMIN.refreshDashboardData() tidak ditemukan');
    });

    // 3. Verifikasi 4 Kartu KPI Gradien Berwarna di admin.html
    test('admin.html harus memuat 4 kartu KPI gradien (Emerald, Blue, Magenta, Orange) beserta ID metriknya', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="kpi-total-pilgrims"'), 'Metrik #kpi-total-pilgrims tidak ditemukan');
        assert.ok(adminHtml.includes('id="kpi-seat-occupancy"'), 'Metrik #kpi-seat-occupancy tidak ditemukan');
        assert.ok(adminHtml.includes('id="kpi-active-muthawwif"'), 'Metrik #kpi-active-muthawwif tidak ditemukan');
        assert.ok(adminHtml.includes('id="kpi-docs-accuracy"'), 'Metrik #kpi-docs-accuracy tidak ditemukan');
        assert.ok(adminHtml.includes('Total Jamaah Terdaftar'), 'Label Total Jamaah Terdaftar tidak ditemukan');
        assert.ok(adminHtml.includes('Kapasitas Seat Kloter'), 'Label Kapasitas Seat Kloter tidak ditemukan');
        assert.ok(adminHtml.includes('Muthawwif &amp; Pembina'), 'Label Muthawwif & Pembina tidak ditemukan');
        assert.ok(adminHtml.includes('Verifikasi Dokumen &amp; Visa'), 'Label Verifikasi Dokumen & Visa tidak ditemukan');
        assert.ok(adminHtml.includes('Data Induk'), 'Tombol footer Data Induk tidak ditemukan');
        assert.ok(adminHtml.includes('Jadwal Kloter'), 'Tombol footer Jadwal Kloter tidak ditemukan');
        assert.ok(adminHtml.includes('Tim Lapangan'), 'Tombol footer Tim Lapangan tidak ditemukan');
    });

    // 4. Verifikasi Kompatibilitas Elemen Metrik Sebelumnya
    test('admin.html harus mempertahankan elemen backwards-compatible untuk skrip modul lain', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="kpi-active-leads"'), 'Elemen backwards-compatible #kpi-active-leads tidak ditemukan');
        assert.ok(adminHtml.includes('id="kpi-pending-docs"'), 'Elemen backwards-compatible #kpi-pending-docs tidak ditemukan');
        assert.ok(adminHtml.includes('id="kpi-total-revenue"'), 'Elemen backwards-compatible #kpi-total-revenue tidak ditemukan');
    });

    // 5. Verifikasi Controller admin-nav.js
    test('admin-nav.js harus mengekspor fungsi-fungsi dashboard Asnawiyyah lengkap', () => {
        const navModule = require('../js/admin/admin-nav.js');
        assert.ok(typeof navModule.renderDashboard === 'function', 'renderDashboard bukan fungsi');
        assert.ok(typeof navModule.updateDashboardClock === 'function', 'updateDashboardClock bukan fungsi');
        assert.ok(typeof navModule.setDashboardPeriod === 'function', 'setDashboardPeriod bukan fungsi');
        assert.ok(typeof navModule.refreshDashboardData === 'function', 'refreshDashboardData bukan fungsi');
        assert.ok(navModule.dashboardPeriod !== undefined, 'dashboardPeriod tidak diekspor');
    });

    // 6. Verifikasi Service Worker Caching
    test('sw.js harus menggunakan cache versi v70+', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(/sdw-umroh-pwa-v(7\d|[8-9]\d)/.test(swCode), 'Cache version di sw.js harus minimal v70');
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();

