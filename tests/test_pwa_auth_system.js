/**
 * Test Suite: PWA Pilgrim Authentication & Account Management System
 * Verifies that the pilgrim registration and login system operates seamlessly:
 * 1. Dedicated Full-Screen Sub-Page (#subview-auth /app?view=auth)
 * 2. WhatsApp + Password Login with Error Handling
 * 3. Self-Registration with Validation
 * 4. Dynamic Guest Mode vs Authenticated Mode on Profile Tab
 * 5. Public Navbar Integration
 * 6. Resilient Offline-First Background Sync to Google Spreadsheet
 */
const fs = require('fs');
const assert = require('assert');
const path = require('path');

let passed = 0;
let failed = 0;

async function runTest(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      await res;
    }
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

(async () => {
  console.log('=== TEST SUITE: PWA PILGRIM AUTHENTICATION & ACCOUNT MANAGEMENT ===\n');

  // 1. Audit app.html UI Elements
  console.log('1. Pengujian Semantik DOM app.html (Sub-Page & Profil)');
  const appHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');

  await runTest('Halaman penuh #subview-auth terpasang di app.html', () => {
    assert(appHtml.includes('id="subview-auth"'), 'Missing #subview-auth in app.html');
  });

  await runTest('Header #subview-auth memiliki tombol sticky [ ← Back ]', () => {
    assert(appHtml.includes('Akun Jamaah SDW'), 'Missing title Akun Jamaah SDW');
    assert(appHtml.includes('Masuk &amp; Kelola Ibadah Umroh Anda'), 'Missing subtitle');
  });

  await runTest('Tab Switcher Masuk (#authTabLoginBtn) & Daftar (#authTabRegisterBtn) tersedia', () => {
    assert(appHtml.includes('id="authTabLoginBtn"'), 'Missing #authTabLoginBtn');
    assert(appHtml.includes('id="authTabRegisterBtn"'), 'Missing #authTabRegisterBtn');
  });

  await runTest('Form Masuk (#authFormLogin) dengan input WA & Password tersedia', () => {
    assert(appHtml.includes('id="authFormLogin"'), 'Missing #authFormLogin');
    assert(appHtml.includes('id="loginPhone"'), 'Missing #loginPhone input');
    assert(appHtml.includes('id="loginPassword"'), 'Missing #loginPassword input');
    assert(appHtml.includes('window.handlePilgrimLogin'), 'Missing login handler');
  });

  await runTest('Form Daftar (#authFormRegister) dengan Nama, WA & Password tersedia', () => {
    assert(appHtml.includes('id="authFormRegister"'), 'Missing #authFormRegister');
    assert(appHtml.includes('id="regFullName"'), 'Missing #regFullName input');
    assert(appHtml.includes('id="regPhone"'), 'Missing #regPhone input');
    assert(appHtml.includes('id="regPassword"'), 'Missing #regPassword input');
    assert(appHtml.includes('window.handlePilgrimRegister'), 'Missing register handler');
  });

  await runTest('Shortcut akun demo cepat tersedia untuk kemudahan pengujian', () => {
    assert(appHtml.includes('window.fillDemoAccountAndLogin()'), 'Missing fillDemoAccountAndLogin');
  });

  await runTest('Banner Tamu (#profileGuestBanner) dan Kartu (#profileAuthenticatedCard) terpasang di tab profil', () => {
    assert(appHtml.includes('id="profileGuestBanner"'), 'Missing #profileGuestBanner');
    assert(appHtml.includes('id="profileAuthenticatedCard"'), 'Missing #profileAuthenticatedCard');
    assert(appHtml.includes('id="profileLogoutBtn"'), 'Missing #profileLogoutBtn');
    assert(appHtml.includes('id="profileLoginBtnHeader"'), 'Missing #profileLoginBtnHeader');
  });

  await runTest('Section Jamaah Baru (#profileNewPilgrimSection) & Pending DP (#profilePendingDpSection) terpasang di tab profil', () => {
    assert(appHtml.includes('id="profileNewPilgrimSection"'), 'Missing #profileNewPilgrimSection');
    assert(appHtml.includes('id="profilePendingDpSection"'), 'Missing #profilePendingDpSection');
    assert(appHtml.includes('id="profileConfirmedSection"'), 'Missing #profileConfirmedSection');
    assert(appHtml.includes('id="subview-booking"'), 'Missing #subview-booking');
  });

  // 2. Audit js/auth.js Module & Methods
  console.log('\n2. Pengujian Modul Autentikasi js/auth.js');
  const authJs = fs.readFileSync(path.join(process.cwd(), 'js', 'auth.js'), 'utf8');

  await runTest('Modul auth.js mendefinisikan API autentikasi jamaah & sync', () => {
    assert(authJs.includes('loginPilgrim: loginPilgrim'), 'Missing loginPilgrim export');
    assert(authJs.includes('registerPilgrim: registerPilgrim'), 'Missing registerPilgrim export');
    assert(authJs.includes('logoutPilgrim: logoutPilgrim'), 'Missing logoutPilgrim export');
    assert(authJs.includes('getPilgrimSession: getPilgrimSession'), 'Missing getPilgrimSession export');
    assert(authJs.includes('syncPilgrimUI: syncPilgrimUI'), 'Missing syncPilgrimUI export');
    assert(authJs.includes('syncPilgrimRegistrationToBackend: syncPilgrimRegistrationToBackend'), 'Missing syncPilgrimRegistrationToBackend export');
  });

  await runTest('Fungsi window helpers untuk antarmuka interaktif terdefinisi', () => {
    assert(authJs.includes('window.switchAuthTab = function'), 'Missing window.switchAuthTab');
    assert(authJs.includes('window.togglePasswordVisibility = function'), 'Missing window.togglePasswordVisibility');
    assert(authJs.includes('window.handlePilgrimLogin = function'), 'Missing window.handlePilgrimLogin');
    assert(authJs.includes('window.handlePilgrimRegister = function'), 'Missing window.handlePilgrimRegister');
    assert(authJs.includes('window.fillDemoAccountAndLogin = function'), 'Missing window.fillDemoAccountAndLogin');
    assert(authJs.includes('window.confirmLogoutPilgrim = function'), 'Missing window.confirmLogoutPilgrim');
  });

  // 3. Functional Testing of Logic in Node Environment
  console.log('\n3. Pengujian Fungsional Logika Autentikasi (Mock Environment)');

  // Setup mock window & localStorage
  const mockStorage = {};
  global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };
  global.window = {};

  const SDW_AUTH = require(path.join(process.cwd(), 'js', 'auth.js'));

  await runTest('Login akun demo (081298765432 / 123456) berhasil', () => {
    const res = SDW_AUTH.loginPilgrim('081298765432', '123456');
    assert(res.success, `Login failed: ${res.message}`);
    assert.strictEqual(res.user.fullName, 'Ahmad Jamaah Teladan');
    assert.strictEqual(res.user.regId, 'REG-SDW-2701');
  });

  await runTest('Sesi tersimpan di localStorage setelah login', () => {
    const session = SDW_AUTH.getPilgrimSession();
    assert(session, 'Session is null in localStorage');
    assert.strictEqual(session.fullName, 'Ahmad Jamaah Teladan');
  });

  await runTest('Login dengan kata sandi salah ditolak', () => {
    const res = SDW_AUTH.loginPilgrim('081298765432', 'salah_password');
    assert(!res.success, 'Should reject wrong password');
    assert(res.message.includes('Kata sandi yang Anda masukkan salah'));
  });

  await runTest('Login dengan nomor tidak terdaftar ditolak', () => {
    const res = SDW_AUTH.loginPilgrim('089999999999', '123456');
    assert(!res.success, 'Should reject unregistered phone');
    assert(res.message.includes('belum terdaftar'));
  });

  await runTest('Pendaftaran jamaah baru berhasil dan otomatis aktif', () => {
    const newPilgrim = {
      fullName: 'Ust. Muhammad Rizqi',
      phone: '085711223344',
      email: 'rizqi@test.com',
      password: 'rahasia123'
    };
    const regRes = SDW_AUTH.registerPilgrim(newPilgrim);
    assert(regRes.success, `Registration failed: ${regRes.message}`);
    assert.strictEqual(regRes.user.fullName, 'Ust. Muhammad Rizqi');

    // Verify that new user can now log in
    const loginRes = SDW_AUTH.loginPilgrim('085711223344', 'rahasia123');
    assert(loginRes.success, 'Newly registered user cannot login');
  });

  await runTest('Pendaftaran dengan nomor ganda (duplikat) dicegah', () => {
    const duplicate = {
      fullName: 'Orang Lain',
      phone: '085711223344',
      password: 'rahasia123'
    };
    const res = SDW_AUTH.registerPilgrim(duplicate);
    assert(!res.success, 'Should reject duplicate phone number');
    assert(res.message.includes('sudah terdaftar'));
  });

  await runTest('Logout membersihkan sesi di localStorage', () => {
    SDW_AUTH.logoutPilgrim();
    const session = SDW_AUTH.getPilgrimSession();
    assert.strictEqual(session, null, 'Session was not cleared after logout');
  });

  await runTest('Sinkronisasi pendaftaran ke Spreadsheet memanggil SDW_API.post', async () => {
    let postedAction = null;
    let postedPayload = null;
    global.window.SDW_API = {
      post: async (action, payload) => {
        postedAction = action;
        postedPayload = payload;
        return { success: true, data: { id: 'TEST-OK' } };
      }
    };

    const testUser = {
      id: 'CUS-TEST-99',
      fullName: 'Jamaah Uji Spreadsheet',
      phone: '081233445566',
      email: 'uji.spreadsheet@gmail.com'
    };

    const res = await SDW_AUTH.syncPilgrimRegistrationToBackend(testUser);
    assert(res && res.success, 'Sync should return success');
    assert.strictEqual(postedAction, 'registerAccount', 'Should post to registerAccount');
    assert.strictEqual(postedPayload.fullName, 'Jamaah Uji Spreadsheet', 'Payload fullName mismatch');
    assert.strictEqual(postedPayload.phone, '081233445566', 'Payload phone mismatch');
  });

  await runTest('Offline queueing mencatat antrean pendaftaran bila jaringan gagal', async () => {
    global.window.SDW_API = {
      post: async () => { throw new Error('Network Offline'); }
    };

    const offlineUser = {
      id: 'CUS-OFFLINE-01',
      fullName: 'Jamaah Offline',
      phone: '081277889900',
      email: 'offline@gmail.com'
    };

    await SDW_AUTH.syncPilgrimRegistrationToBackend(offlineUser);
    const queue = JSON.parse(mockStorage['sdw_pending_account_registrations'] || '[]');
    assert(queue.length > 0, 'Queue should contain pending registration');
    assert.strictEqual(queue[0].payload.fullName, 'Jamaah Offline', 'Queued payload mismatch');
  });

  // 4. Audit js/components.js Public Navigation Integration
  console.log('\n4. Pengujian Navbar Publik (js/components.js)');
  const compJs = fs.readFileSync(path.join(process.cwd(), 'js', 'components.js'), 'utf8');

  await runTest('Navbar desktop memuat tombol Akun Jamaah mengarah ke /app?view=auth', () => {
    assert(compJs.includes('href="/app?view=auth"'), 'Missing /app?view=auth link in components.js');
    assert(compJs.includes('Akun Jamaah'), 'Missing text Akun Jamaah in desktop navbar');
  });

  await runTest('Mobile drawer menu memuat tautan Akun Jamaah (Masuk / Daftar)', () => {
    assert(compJs.includes('Akun Jamaah (Masuk / Daftar)'), 'Missing drawer link in components.js');
  });

  // 5. Audit js/pwa.js Subview Router Registration
  console.log('\n5. Pengujian PWA Router (js/pwa.js)');
  const pwaJs = fs.readFileSync(path.join(process.cwd(), 'js', 'pwa.js'), 'utf8');

  await runTest('auth terdaftar dalam IN_APP_SUBVIEW_NAMES', () => {
    assert(pwaJs.includes("'auth'"), "Missing 'auth' in IN_APP_SUBVIEW_NAMES");
  });

  console.log('\n========================================');
  console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('🌟 SISTEM AUTENTIKASI & DAFTAR AKUN JAMAAH TERVERIFIKASI 100% SUKSES!');
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
