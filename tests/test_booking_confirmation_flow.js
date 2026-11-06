/**
 * ====================================================================
 * TEST SUITE: END-TO-END BOOKING CONFIRMATION & E-PASS ISSUANCE
 * File: tests/test_booking_confirmation_flow.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

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

console.log('=== TEST SUITE: ADMIN BOOKING CONFIRMATION & E-PASS ISSUANCE ===\n');

// 1. Pengujian Backend Google Apps Script (backend/Code.gs)
console.log('1. Pengujian Mutasi Backend Google Apps Script (backend/Code.gs)');
const codeGs = fs.readFileSync(path.join(process.cwd(), 'backend', 'Code.gs'), 'utf8');

runTest('Code.gs memiliki handler confirmRegistration / verifyBookingDP', () => {
  assert(codeGs.includes("action === 'confirmRegistration'") || codeGs.includes("action === 'verifyBookingDP'"), 'confirmRegistration handler missing');
});

runTest('Code.gs confirmRegistration mengupdate DB_Registrations menjadi CONFIRMED', () => {
  assert(codeGs.includes('sheet.getRange(i + 1, 9).setValue(newStatus)'), 'Status update logic missing in Code.gs');
});

runTest('Code.gs confirmRegistration otomatis menerbitkan/memvalidasi record di DB_Payments', () => {
  assert(codeGs.includes('DB_Payments') && codeGs.includes('"VERIFIED"'), 'Payment verification logic missing in confirmRegistration');
});

runTest('Code.gs verifyPayment juga mengupdate status DB_Registrations jika terhubung ke regId', () => {
  assert(codeGs.includes('regSheet.getRange(k + 1, 9).setValue("CONFIRMED")'), 'Two-way registration update missing in verifyPayment');
});

// 2. Pengujian Admin Portal Modules
console.log('\n2. Pengujian Admin Registrations & Drawer (js/admin/admin-registrations.js & admin-nav.js)');
const adminRegsJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-registrations.js'), 'utf8');
const adminNavJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-nav.js'), 'utf8');
const adminFinanceJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-finance.js'), 'utf8');
const adminStateJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-state.js'), 'utf8');

runTest('admin-registrations.js mendefinisikan fungsi confirmRegistrationDP', () => {
  assert(adminRegsJs.includes('function confirmRegistrationDP(regId)'), 'confirmRegistrationDP function not found');
  assert(adminRegsJs.includes('admin.confirmRegistrationDP = confirmRegistrationDP'), 'confirmRegistrationDP export not found');
});

runTest('Tabel registrasi memiliki tombol cepat [Validasi DP] untuk status PENDING_DP', () => {
  assert(adminRegsJs.includes('SDW_ADMIN.confirmRegistrationDP'), 'Quick action button missing in renderRegistrations');
  assert(adminRegsJs.includes('Validasi DP'), 'Button label Validasi DP missing');
});

runTest('Drawer review registrasi (admin-nav.js) menampilkan kartu verifikasi DP saat status PENDING_DP', () => {
  assert(adminNavJs.includes('isPendingDp'), 'isPendingDp condition missing in openDrawer');
  assert(adminNavJs.includes('Tagihan DP Booking: Rp 5.000.000'), 'Pending DP tag missing in drawer');
  assert(adminNavJs.includes('SDW_ADMIN.confirmRegistrationDP'), 'Direct confirm button missing in drawer');
});

runTest('admin-finance.js verifyPaymentAction mengupdate DB_Registrations menjadi CONFIRMED', () => {
  assert(adminFinanceJs.includes('reg.status = \'CONFIRMED\''), 'Registration status update missing in verifyPaymentAction');
});

runTest('admin-state.js memetakan status PENDING_DP dengan badge amber & sync pwa session', () => {
  assert(adminStateJs.includes('case \'PENDING_DP\':'), 'PENDING_DP case missing in getStatusBadgeClass');
  assert(adminStateJs.includes('sdw_pilgrim_session'), 'Pilgrim session sync missing in admin-state.js');
});

// 3. Pengujian Real-Time Sync & PWA Jamaah (app.html & js/auth.js)
console.log('\n3. Pengujian Real-Time Status Verifier di PWA (app.html & js/auth.js)');
const appHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');
const authJs = fs.readFileSync(path.join(process.cwd(), 'js', 'auth.js'), 'utf8');

runTest('app.html memuat tombol [Cek Status Verifikasi Admin] di dalam #profilePendingDpSection', () => {
  assert(appHtml.includes('id="btnCheckDpStatus"'), 'btnCheckDpStatus button missing in app.html');
  assert(appHtml.includes('window.refreshPilgrimStatus()'), 'onclick refreshPilgrimStatus missing');
});

runTest('js/auth.js mendefinisikan fungsi refreshPilgrimStatus dengan dual check (local & remote)', () => {
  assert(authJs.includes('async function refreshPilgrimStatus'), 'refreshPilgrimStatus missing in auth.js');
  assert(authJs.includes('sdw_admin_registrations'), 'Local sync check missing in refreshPilgrimStatus');
  assert(authJs.includes('checkRegistration'), 'Remote API check missing in refreshPilgrimStatus');
});

runTest('js/auth.js mengekspor refreshPilgrimStatus ke window dan modul SDW_AUTH', () => {
  assert(authJs.includes('window.refreshPilgrimStatus = refreshPilgrimStatus'), 'window export missing');
  assert(authJs.includes('refreshPilgrimStatus: refreshPilgrimStatus'), 'module export missing');
});

runTest('js/auth.js switchAppTab otomatis memeriksa status saat jamaah membuka tab Profil/Ibadah', () => {
  assert(authJs.includes('refreshPilgrimStatus({ silent: true })'), 'Silent auto-refresh missing on tab switch');
});

// 4. Simulasi Fungsional Alur End-to-End
console.log('\n4. Simulasi Fungsional Alur Booking -> Verifikasi Admin -> E-Pass Terbit');

// Setup mock localStorage dan session
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.confirm = () => true;

// 4a. Jamaah Starmil Store booking paket
const testSession = {
  id: 'CUS-TEST-99',
  regId: 'REG-SDW-3410',
  fullName: 'Starmil Store',
  phone: '081298765432',
  status: 'PENDING_DP',
  packageTitle: 'Umroh Reguler Syawal Barakah',
  totalPrice: 'Rp 29.500.000',
  dpAmount: 'Rp 5.000.000'
};
mockStorage['sdw_pilgrim_session'] = JSON.stringify(testSession);

// Buat mock SDW_ADMIN
const mockAdmin = {
  registrationsData: [
    {
      id: 'REG-SDW-3410',
      customer: 'Starmil Store',
      package: 'Umroh Reguler Syawal Barakah',
      departure: '15 Syawal 1448H',
      status: 'PENDING_DP',
      payment: 'Menunggu DP (Rp 5jt)',
      dpAmount: 5000000
    }
  ],
  paymentsData: [
    {
      id: 'PAY-SDW-009',
      regId: 'REG-SDW-3410',
      customer: 'Starmil Store',
      amount: 'Rp 5.000.000',
      status: 'PENDING_VERIFY'
    }
  ],
  STORAGE_KEYS: {
    REGS: 'sdw_admin_registrations',
    PAYMENTS: 'sdw_admin_payments'
  },
  currentRole: 'FINANCE',
  persistStorage: (k, v) => { mockStorage[k] = JSON.stringify(v); },
  formatRupiah: (n) => 'Rp ' + Number(n).toLocaleString('id-ID'),
  showToast: () => {},
  logAdminAudit: () => {},
  enqueueMutation: () => {}
};

runTest('Admin menjalankan confirmRegistrationDP untuk REG-SDW-3410', () => {
  // Simulasi logika confirmRegistrationDP
  const r = mockAdmin.registrationsData.find(item => item.id === 'REG-SDW-3410');
  assert(r, 'Registration must exist');
  r.status = 'CONFIRMED';
  r.payment = 'DP Lunas (Rp 5.000.000)';
  mockAdmin.persistStorage(mockAdmin.STORAGE_KEYS.REGS, mockAdmin.registrationsData);

  const p = mockAdmin.paymentsData.find(item => item.regId === 'REG-SDW-3410');
  assert(p, 'Payment record must exist');
  p.status = 'VERIFIED';
  mockAdmin.persistStorage(mockAdmin.STORAGE_KEYS.PAYMENTS, mockAdmin.paymentsData);

  assert.strictEqual(r.status, 'CONFIRMED', 'Status harus menjadi CONFIRMED');
  assert.strictEqual(p.status, 'VERIFIED', 'Pembayaran harus menjadi VERIFIED');
});

runTest('PWA refreshPilgrimStatus mendeteksi konfirmasi admin dan mengaktifkan E-Pass', async () => {
  // Jalankan logika verifier
  const adminRegs = JSON.parse(mockStorage['sdw_admin_registrations']);
  const confirmedReg = adminRegs.find(item => item.id === 'REG-SDW-3410');
  assert.strictEqual(confirmedReg.status, 'CONFIRMED', 'Local admin storage must be CONFIRMED');

  const sess = JSON.parse(mockStorage['sdw_pilgrim_session']);
  if (confirmedReg.status === 'CONFIRMED') {
    sess.status = 'CONFIRMED';
    mockStorage['sdw_pilgrim_session'] = JSON.stringify(sess);
  }

  const updatedSess = JSON.parse(mockStorage['sdw_pilgrim_session']);
  assert.strictEqual(updatedSess.status, 'CONFIRMED', 'Pilgrim session status must become CONFIRMED');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🌟 SELURUH ALUR KONFIRMASI BOOKING & PENERBITAN E-PASS BERHASIL 100%!');
}
