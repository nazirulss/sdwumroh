/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - AUTENTIKASI STAF & MODAL LOGIN DB_USERS
 * File: tests/test_admin_auth_and_login.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(async function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Autentikasi Staf & Modal Login DB_Users...\n');

    let totalTests = 0;
    let passedTests = 0;

    async function test(name, fn) {
        totalTests++;
        try {
            await fn();
            passedTests++;
            console.log(`  ✅ PASS: ${name}`);
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
        }
    }

    const root = path.resolve(__dirname, '..');

    // 1. Verifikasi Keberadaan File Esensial
    await test('File-file esensial modul Autentikasi harus tersedia', () => {
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-auth.js')), 'admin-auth.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin-core.js')), 'admin-core.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
    });

    // 2. Verifikasi UI Modal Login di admin.html
    await test('admin.html harus memuat markup Modal Form Login Admin dan elemen pendukung', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('id="modalAdminLogin"'), 'Modal #modalAdminLogin tidak ditemukan di admin.html');
        assert.ok(adminHtml.includes('id="adminLoginIdentifier"'), 'Input #adminLoginIdentifier tidak ditemukan');
        assert.ok(adminHtml.includes('id="adminLoginPassword"'), 'Input #adminLoginPassword tidak ditemukan');
        assert.ok(adminHtml.includes('id="adminLoginRemember"'), 'Checkbox #adminLoginRemember tidak ditemukan');
        assert.ok(adminHtml.includes('id="adminLoginError"'), 'Banner #adminLoginError tidak ditemukan');
        assert.ok(adminHtml.includes('id="btnAdminLoginSubmit"'), 'Tombol #btnAdminLoginSubmit tidak ditemukan');
        assert.ok(adminHtml.includes('SDW_ADMIN.openLoginModal()'), 'Trigger SDW_ADMIN.openLoginModal() tidak ditemukan di dropdown');
        assert.ok(adminHtml.includes('SDW_ADMIN.quickFillLogin(\'SUPER_ADMIN\')'), 'Quick fill demo Super Admin tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-auth.js?v=1.0.0"'), 'Script tag admin-auth.js tidak ditemukan');
    });

    // 3. Verifikasi Ekspor Controller admin-auth.js
    await test('admin-auth.js harus mengekspor fungsi-fungsi autentikasi lengkap', () => {
        const authModule = require('../js/admin/admin-auth.js');
        assert.ok(typeof authModule.getAdminSession === 'function', 'getAdminSession bukan fungsi');
        assert.ok(typeof authModule.setAdminSession === 'function', 'setAdminSession bukan fungsi');
        assert.ok(typeof authModule.clearAdminSession === 'function', 'clearAdminSession bukan fungsi');
        assert.ok(typeof authModule.loginAdminAsync === 'function', 'loginAdminAsync bukan fungsi');
        assert.ok(typeof authModule.openLoginModal === 'function', 'openLoginModal bukan fungsi');
        assert.ok(typeof authModule.closeLoginModal === 'function', 'closeLoginModal bukan fungsi');
        assert.ok(typeof authModule.toggleLoginPasswordVisibility === 'function', 'toggleLoginPasswordVisibility bukan fungsi');
        assert.ok(typeof authModule.quickFillLogin === 'function', 'quickFillLogin bukan fungsi');
        assert.ok(typeof authModule.handleAdminLogin === 'function', 'handleAdminLogin bukan fungsi');
        assert.ok(typeof authModule.checkAdminAuth === 'function', 'checkAdminAuth bukan fungsi');
        assert.ok(typeof authModule.switchAccount === 'function', 'switchAccount bukan fungsi');
    });

    // 4. Verifikasi Logika Login & Kredensial DB_Users
    await test('loginAdminAsync harus memvalidasi data pengguna DB_Users dengan benar', async () => {
        const authModule = require('../js/admin/admin-auth.js');

        // Test A: Login Berhasil dengan Email Super Admin
        const res1 = await authModule.loginAdminAsync('admin@sdwumroh.com', 'admin123');
        assert.strictEqual(res1.success, true, 'Login dengan email Super Admin harus sukses');
        assert.strictEqual(res1.user.role, 'SUPER_ADMIN', 'Role harus SUPER_ADMIN');
        assert.ok(res1.user.token, 'Token sesi harus di-generate');

        // Test B: Login Berhasil dengan No. WhatsApp Admin Ops
        const res2 = await authModule.loginAdminAsync('6281122334455', 'admin123');
        assert.strictEqual(res2.success, true, 'Login dengan No. HP Admin Ops harus sukses');
        assert.strictEqual(res2.user.role, 'ADMIN', 'Role harus ADMIN');

        // Test C: Gagal karena Password Salah
        const res3 = await authModule.loginAdminAsync('admin@sdwumroh.com', 'passwordsalah999');
        assert.strictEqual(res3.success, false, 'Login dengan kata sandi salah harus gagal');
        assert.ok(res3.message.includes('Kata sandi'), 'Pesan error harus menyebut kata sandi');

        // Test D: Gagal karena Email Tidak Terdaftar
        const res4 = await authModule.loginAdminAsync('hacker@unknown.com', 'admin123');
        assert.strictEqual(res4.success, false, 'Login akun tak terdaftar harus gagal');
        assert.ok(res4.message.includes('tidak ditemukan'), 'Pesan error harus menyebut tidak ditemukan');
    });

    // 5. Verifikasi Backend Google Apps Script (Code.gs)
    await test('Code.gs harus memuat handler adminLogin di doGet dan handleAction_', () => {
        const codeCode = fs.readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
        assert.ok(codeCode.includes("action === 'adminLogin'"), 'Handler adminLogin tidak ditemukan di Code.gs');
        assert.ok(codeCode.includes('SDW_ADM_'), 'Prefix token sesi SDW_ADM_ tidak ditemukan di Code.gs');
        assert.ok(codeCode.includes('USER_LOGIN'), 'Audit log USER_LOGIN tidak ditemukan di Code.gs');
    });

    // 6. Verifikasi Service Worker Caching
    await test('sw.js harus mem-precache admin-auth.js dan menggunakan cache versi v68+', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(swCode.includes('/js/admin/admin-auth.js'), 'admin-auth.js tidak ada di PRECACHE_URLS');
        assert.ok(/sdw-umroh-pwa-v(6[8-9]|[7-9]\d)/.test(swCode), 'Cache version di sw.js harus minimal v68');
    });

    // 7. Verifikasi Integrasi admin-core.js
    await test('admin-core.js harus memuat admin-auth.js dan mengintegrasikan checkAdminAuth', () => {
        const coreCode = fs.readFileSync(path.join(root, 'js', 'admin-core.js'), 'utf8');
        assert.ok(coreCode.includes("require('./admin/admin-auth.js')"), 'admin-auth.js tidak di-require di admin-core.js');
        assert.ok(coreCode.includes('admin.checkAdminAuth'), 'checkAdminAuth tidak dipanggil di admin-core.js');
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();
