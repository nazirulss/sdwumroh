/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - GALERI DOKUMENTASI & TESTIMONI JAMAAH
 * File: tests/test_admin_gallery_testimonials.js
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Galeri Dokumentasi & Testimoni Jamaah...\n');

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

    // 1. Verifikasi File Esensial
    test('File-file esensial modul galeri & testimoni harus tersedia', () => {
        const root = path.resolve(__dirname, '..');
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-gallery.js')), 'admin-gallery.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'galeri.html')), 'galeri.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'index.html')), 'index.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Setup.gs')), 'Setup.gs tidak ditemukan');
    });

    // 2. Verifikasi UMD Module admin-gallery.js
    test('admin-gallery.js mengekspor fungsi dan default data dengan benar', () => {
        const adminState = require('../js/admin/admin-state.js');
        const adminGallery = require('../js/admin/admin-gallery.js');

        assert.ok(adminGallery, 'Modul admin-gallery gagal di-load');
        assert.strictEqual(typeof adminGallery.renderGallery, 'function');
        assert.strictEqual(typeof adminGallery.switchGallerySubtab, 'function');
        assert.strictEqual(typeof adminGallery.openGalleryModal, 'function');
        assert.strictEqual(typeof adminGallery.saveGalleryItem, 'function');
        assert.strictEqual(typeof adminGallery.deleteGalleryItem, 'function');
        assert.strictEqual(typeof adminGallery.openTestimonialModal, 'function');
        assert.strictEqual(typeof adminGallery.saveTestimonial, 'function');
        assert.strictEqual(typeof adminGallery.deleteTestimonial, 'function');
        assert.strictEqual(typeof adminGallery.syncGalleryFromCloud, 'function');
        assert.ok(Array.isArray(adminGallery.DEFAULT_GALLERY), 'DEFAULT_GALLERY harus berupa array');
        assert.ok(Array.isArray(adminGallery.DEFAULT_TESTIMONIALS), 'DEFAULT_TESTIMONIALS harus berupa array');
        assert.ok(adminGallery.DEFAULT_GALLERY.length >= 6, 'DEFAULT_GALLERY minimal 6 item');
        assert.ok(adminGallery.DEFAULT_TESTIMONIALS.length >= 4, 'DEFAULT_TESTIMONIALS minimal 4 item');
    });

    // 3. Verifikasi Skema Kolom Canonical Galeri
    test('Skema canonical DB_Gallery dan DB_Testimonials harus valid', () => {
        const setupGs = fs.readFileSync(path.resolve(__dirname, '..', 'backend', 'Setup.gs'), 'utf8');
        assert.ok(setupGs.includes('"DB_Gallery"'), 'DB_Gallery belum terdaftar di AUTHORITATIVE_SCHEMAS_');
        assert.ok(setupGs.includes('"DB_Testimonials"'), 'DB_Testimonials belum terdaftar di AUTHORITATIVE_SCHEMAS_');
        assert.ok(setupGs.includes('setupGalleryAndTestimonialsSheets'), 'Fungsi setupGalleryAndTestimonialsSheets belum ada');
    });

    // 4. Verifikasi Backend Handlers di Code.gs
    test('Code.gs memiliki handler getGallery, getTestimonials, dan mutasi CRUD', () => {
        const codeGs = fs.readFileSync(path.resolve(__dirname, '..', 'backend', 'Code.gs'), 'utf8');
        assert.ok(codeGs.includes("action === 'getGallery'"), 'Handler getGallery tidak ditemukan');
        assert.ok(codeGs.includes("action === 'getTestimonials'"), 'Handler getTestimonials tidak ditemukan');
        assert.ok(codeGs.includes("action === 'saveGalleryItem'"), 'Handler saveGalleryItem tidak ditemukan');
        assert.ok(codeGs.includes("action === 'deleteGalleryItem'"), 'Handler deleteGalleryItem tidak ditemukan');
        assert.ok(codeGs.includes("action === 'saveTestimonial'"), 'Handler saveTestimonial tidak ditemukan');
        assert.ok(codeGs.includes("action === 'deleteTestimonial'"), 'Handler deleteTestimonial tidak ditemukan');
        assert.ok(codeGs.includes("action === 'upgradeGallerySchema'"), 'Handler upgradeGallerySchema tidak ditemukan');
        assert.ok(codeGs.includes("function autoUpgradeGallerySheets_"), 'autoUpgradeGallerySheets_ helper tidak ditemukan');
    });

    // 5. Verifikasi State Keys dan Permissions di admin-state.js
    test('admin-state.js memuat galleryData, testimonialsData, dan permission tab-gallery', () => {
        const stateJs = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'admin', 'admin-state.js'), 'utf8');
        assert.ok(stateJs.includes("GALLERY: 'sdw_admin_gallery'"), 'STORAGE_KEYS.GALLERY tidak ditemukan');
        assert.ok(stateJs.includes("TESTIMONIALS: 'sdw_admin_testimonials'"), 'STORAGE_KEYS.TESTIMONIALS tidak ditemukan');
        assert.ok(stateJs.includes("'tab-gallery'"), 'tab-gallery tidak ada di ADMIN_PERMISSIONS');
        assert.ok(stateJs.includes("'galleryData'"), 'galleryData tidak ada di stateKeys');
        assert.ok(stateJs.includes("'testimonialsData'"), 'testimonialsData tidak ada di stateKeys');
    });

    // 6. Verifikasi Router di admin-nav.js
    test('admin-nav.js memiliki routing untuk tab-gallery', () => {
        const navJs = fs.readFileSync(path.resolve(__dirname, '..', 'js', 'admin', 'admin-nav.js'), 'utf8');
        assert.ok(navJs.includes("tabId === 'tab-gallery'"), 'Router tab-gallery belum didaftarkan di admin-nav.js');
        assert.ok(navJs.includes("admin.renderGallery()"), 'Panggilan admin.renderGallery() belum ada');
    });

    // 7. Verifikasi admin.html Sidebar, Container Tab, dan Modals
    test('admin.html memuat tombol sidebar, tab container, subtab, dan modal editor lengkap', () => {
        const adminHtml = fs.readFileSync(path.resolve(__dirname, '..', 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('data-admin-tab="tab-gallery"'), 'Tombol sidebar tab-gallery tidak ada');
        assert.ok(adminHtml.includes('id="tab-gallery"'), 'Container #tab-gallery tidak ada');
        assert.ok(adminHtml.includes('id="btnSubtabGalleryPhotos"'), 'Tombol subtab foto tidak ada');
        assert.ok(adminHtml.includes('id="btnSubtabGalleryTestimonials"'), 'Tombol subtab testimoni tidak ada');
        assert.ok(adminHtml.includes('id="secGalleryPhotos"'), 'Section galeri foto tidak ada');
        assert.ok(adminHtml.includes('id="secGalleryTestimonials"'), 'Section testimoni tidak ada');
        assert.ok(adminHtml.includes('id="galleryTableBody"'), 'Tbody galleryTableBody tidak ada');
        assert.ok(adminHtml.includes('id="testimonialsTableBody"'), 'Tbody testimonialsTableBody tidak ada');
        assert.ok(adminHtml.includes('id="modalGalleryEditor"'), 'Modal modalGalleryEditor tidak ada');
        assert.ok(adminHtml.includes('id="modalTestimonialEditor"'), 'Modal modalTestimonialEditor tidak ada');
        assert.ok(adminHtml.includes('src="js/admin/admin-gallery.js?v=1.0.0"'), 'Script admin-gallery.js belum dimuat');
    });

    // 8. Verifikasi Dynamic Sync di galeri.html
    test('galeri.html mengintegrasikan dynamic sync dari getGallery', () => {
        const galeriHtml = fs.readFileSync(path.resolve(__dirname, '..', 'galeri.html'), 'utf8');
        assert.ok(galeriHtml.includes('initDynamicGallery'), 'Fungsi initDynamicGallery belum ada di galeri.html');
        assert.ok(galeriHtml.includes('action=getGallery'), 'Endpoint getGallery belum di-fetch di galeri.html');
        assert.ok(galeriHtml.includes('sdw_admin_gallery'), 'Fallback cache sdw_admin_gallery belum diterapkan');
    });

    // 9. Verifikasi Testimonials Section di index.html
    test('index.html memuat section ulasan testimoni jamaah dan dynamic loader', () => {
        const indexHtml = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
        assert.ok(indexHtml.includes('id="testimoni"'), 'Section #testimoni tidak ada di index.html');
        assert.ok(indexHtml.includes('id="landingTestimonialsGrid"'), 'Container #landingTestimonialsGrid tidak ada');
        assert.ok(indexHtml.includes('initDynamicTestimonials'), 'Fungsi initDynamicTestimonials belum ada di index.html');
        assert.ok(indexHtml.includes('action=getTestimonials'), 'Endpoint getTestimonials belum di-fetch di index.html');
    });

    // 10. Verifikasi Precache dan Versi Cache di sw.js
    test('sw.js melakukan precache admin-gallery.js dan cache version bumped', () => {
        const swJs = fs.readFileSync(path.resolve(__dirname, '..', 'sw.js'), 'utf8');
        assert.ok(swJs.includes('/js/admin/admin-gallery.js'), 'admin-gallery.js belum di-precache di sw.js');
        assert.ok(/sdw-umroh-pwa-v6[0-9]/.test(swJs), 'Versi cache sw.js tidak sesuai pola v6x');
    });

    console.log(`\n📊 Ringkasan Pengujian: ${passedTests}/${totalTests} Test Berhasil.`);
    if (passedTests === totalTests) {
        console.log('🎉 SELURUH PENGUJIAN MODUL GALERI & TESTIMONI JAMAAH LULUS 100%!\n');
    } else {
        process.exit(1);
    }
})();

