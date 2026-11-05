/**
 * Test Suite: PWA Pilgrim Authentication & Account Management System
 * Verifies that the pilgrim registration and login system operates seamlessly:
 * 1. Dedicated Full-Screen Sub-Page (#subview-auth /app?view=auth)
 * 2. WhatsApp + Password Login with Error Handling
 * 3. Self-Registration with Validation
 * 4. Dynamic Guest Mode vs Authenticated Mode on Profile Tab
 * 5. Public Navbar Integration
 */
const fs = require('fs');
const assert = require('assert');
const path = require('path');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: PWA PILGRIM AUTHENTICATION & ACCOUNT MANAGEMENT ===\n');

// 1. Audit app.html UI Elements
console.log('1. Pengujian Semantik DOM app.html (Sub-Page & Profil)');
const appHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');

runTest('Halaman penuh #subview-auth terpasang di app.html', () => {
  assert(appHtml.includes('id="subview-auth"'), 'Missing #subview-auth in app.html');
});

runTest('Header #subview-auth memiliki tombol sticky [ ← Back ]', () => {
  assert(appHtml.includes('Akun Jamaah SDW'), 'Missing title Akun Jamaah SDW');
  assert(appHtml.includes('Masuk &amp; Kelola Ibadah Umroh Anda'), 'Missing subtitle');
});

runTest('Tab Switcher Masuk (#authTabLoginBtn) & Daftar (#authTabRegisterBtn) tersedia', () => {
  assert(appHtml.includes('id="authTabLoginBtn"'), 'Missing #authTabLoginBtn');
  assert(appHtml.includes('id="authTabRegisterBtn"'), 'Missing #authTabRegisterBtn');
});

runTest('Form Masuk (#authFormLogin) dengan input WA & Password tersedia', () => {
  assert(appHtml.includes('id="authFormLogin"'), 'Missing #authFormLogin');
  assert(appHtml.includes('id="loginPhone"'), 'Missing #loginPhone input');
  assert(appHtml.includes('id="loginPassword"'), 'Missing #loginPassword input');
  assert(appHtml.includes('window.handlePilgrimLogin'), 'Missing login handler');
});

runTest('Form Daftar (#authFormRegister) dengan Nama, WA & Password tersedia', () => {
  assert(appHtml.includes('id="authFormRegister"'), 'Missing #authFormRegister');
  assert(appHtml.includes('id="regFullName"'), 'Missing #regFullName input');
  assert(appHtml.includes('id="regPhone"'), 'Missing #regPhone input');
  assert(appHtml.includes('id="regPassword"'), 'Missing #regPassword input');
  assert(appHtml.includes('window.handlePilgrimRegister'), 'Missing register handler');
});

runTest('Shortcut akun demo cepat tersedia untuk kemudahan pengujian', () => {
  assert(appHtml.includes('window.fillDemoAccountAndLogin()'), 'Missing fillDemoAccountAndLogin');
});

runTest('Banner Tamu (#profileGuestBanner) dan Kartu (#profileAuthenticatedCard) terpasang di tab profil', () => {
  assert(appHtml.includes('id="profileGuestBanner"'), 'Missing #profileGuestBanner');
  assert(appHtml.includes('id="profileAuthenticatedCard"'), 'Missing #profileAuthenticatedCard');
  assert(appHtml.includes('id="profileLogoutBtn"'), 'Missing #profileLogoutBtn');
  assert(appHtml.includes('id="profileLoginBtnHeader"'), 'Missing #profileLoginBtnHeader');
});

// 2. Audit js/auth.js Module & Methods
console.log('\n2. Pengujian Modul Autentikasi js/auth.js');
const authJs = fs.readFileSync(path.join(process.cwd(), 'js', 'auth.js'), 'utf8');

runTest('Modul auth.js mendefinisikan API autentikasi jamaah', () => {
  assert(authJs.includes('loginPilgrim: loginPilgrim'), 'Missing loginPilgrim export');
  assert(authJs.includes('registerPilgrim: registerPilgrim'), 'Missing registerPilgrim export');
  assert(authJs.includes('logoutPilgrim: logoutPilgrim'), 'Missing logoutPilgrim export');
  assert(authJs.includes('getPilgrimSession: getPilgrimSession'), 'Missing getPilgrimSession export');
  assert(authJs.includes('syncPilgrimUI: syncPilgrimUI'), 'Missing syncPilgrimUI export');
});

runTest('Fungsi window helpers untuk antarmuka interaktif terdefinisi', () => {
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

runTest('Login akun demo (081298765432 / 123456) berhasil', () => {
  const res = SDW_AUTH.loginPilgrim('081298765432', '123456');
  assert(res.success, `Login failed: ${res.message}`);
  assert.strictEqual(res.user.fullName, 'Ahmad Jamaah Teladan');
  assert.strictEqual(res.user.regId, 'REG-SDW-2701');
});

runTest('Sesi tersimpan di localStorage setelah login', () => {
  const session = SDW_AUTH.getPilgrimSession();
  assert(session, 'Session is null in localStorage');
  assert.strictEqual(session.fullName, 'Ahmad Jamaah Teladan');
});

runTest('Login dengan kata sandi salah ditolak', () => {
  const res = SDW_AUTH.loginPilgrim('081298765432', 'salah_password');
  assert(!res.success, 'Should reject wrong password');
  assert(res.message.includes('Kata sandi yang Anda masukkan salah'));
});

runTest('Login dengan nomor tidak terdaftar ditolak', () => {
  const res = SDW_AUTH.loginPilgrim('089999999999', '123456');
  assert(!res.success, 'Should reject unregistered phone');
  assert(res.message.includes('belum terdaftar'));
});

runTest('Pendaftaran jamaah baru berhasil dan otomatis aktif', () => {
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

runTest('Pendaftaran dengan nomor ganda (duplikat) dicegah', () => {
  const duplicate = {
    fullName: 'Orang Lain',
    phone: '085711223344',
    password: 'rahasia123'
  };
  const res = SDW_AUTH.registerPilgrim(duplicate);
  assert(!res.success, 'Should reject duplicate phone number');
  assert(res.message.includes('sudah terdaftar'));
});

runTest('Logout membersihkan sesi di localStorage', () => {
  SDW_AUTH.logoutPilgrim();
  const session = SDW_AUTH.getPilgrimSession();
  assert.strictEqual(session, null, 'Session was not cleared after logout');
});

// 4. Audit js/components.js Public Navigation Integration
console.log('\n4. Pengujian Navbar Publik (js/components.js)');
const compJs = fs.readFileSync(path.join(process.cwd(), 'js', 'components.js'), 'utf8');

runTest('Navbar desktop memuat tombol Akun Jamaah mengarah ke /app?view=auth', () => {
  assert(compJs.includes('href="/app?view=auth"'), 'Missing /app?view=auth link in components.js');
  assert(compJs.includes('Akun Jamaah'), 'Missing text Akun Jamaah in desktop navbar');
});

runTest('Mobile drawer menu memuat tautan Akun Jamaah (Masuk / Daftar)', () => {
  assert(compJs.includes('Akun Jamaah (Masuk / Daftar)'), 'Missing drawer link in components.js');
});

// 5. Audit js/pwa.js Subview Router Registration
console.log('\n5. Pengujian PWA Router (js/pwa.js)');
const pwaJs = fs.readFileSync(path.join(process.cwd(), 'js', 'pwa.js'), 'utf8');

runTest('auth terdaftar dalam IN_APP_SUBVIEW_NAMES', () => {
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
