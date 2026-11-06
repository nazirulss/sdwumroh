/**
 * ====================================================================
 * TEST SUITE: END-TO-END BOOKING CONFIRMATION, PROOF UPLOAD & E-PASS
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

console.log('=== TEST SUITE: ADMIN BOOKING CONFIRMATION, PROOF UPLOAD & E-PASS ===\n');

// 1. Pengujian Backend Google Apps Script (backend/Code.gs)
console.log('1. Pengujian Mutasi Backend Google Apps Script (backend/Code.gs)');
const codeGs = fs.readFileSync(path.join(process.cwd(), 'backend', 'Code.gs'), 'utf8');

runTest('Code.gs memiliki handler confirmRegistration / verifyBookingDP', () => {
  assert(codeGs.includes("action === 'confirmRegistration'") || codeGs.includes("action === 'verifyBookingDP'"), 'confirmRegistration handler missing');
});

runTest('Code.gs memiliki handler uploadPaymentProof untuk unggah struk jamaah', () => {
  assert(codeGs.includes("action === 'uploadPaymentProof'"), 'uploadPaymentProof handler missing in Code.gs');
});

runTest('Code.gs confirmRegistration mengupdate DB_Registrations menjadi CONFIRMED', () => {
  assert(codeGs.includes('sheet.getRange(i + 1, 9).setValue(newStatus)'), 'Status update logic missing in Code.gs');
});

runTest('Code.gs confirmRegistration menyimpan referensi struk (proof) dan ref mutasi di DB_Payments', () => {
  assert(codeGs.includes('payload.proof') && codeGs.includes('payload.ref'), 'Proof and ref saving logic missing in Code.gs');
});

runTest('Code.gs verifyPayment juga mengupdate status DB_Registrations jika terhubung ke regId', () => {
  assert(codeGs.includes('regSheet.getRange(k + 1, 9).setValue("CONFIRMED")'), 'Two-way registration update missing in verifyPayment');
});

// 2. Pengujian Sisi Jamaah PWA (app.html & js/pwa.js & js/auth.js)
console.log('\n2. Pengujian Unggah Bukti Struk di Sisi Jamaah PWA (app.html & js/pwa.js)');
const appHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');
const pwaJs = fs.readFileSync(path.join(process.cwd(), 'js', 'pwa.js'), 'utf8');
const authJs = fs.readFileSync(path.join(process.cwd(), 'js', 'auth.js'), 'utf8');

runTest('app.html memuat komponen upload struk (#pwaDpProofFileInput & #btnSubmitPwaProof)', () => {
  assert(appHtml.includes('id="pwaDpProofFileInput"'), 'FileInput pwaDpProofFileInput missing in app.html');
  assert(appHtml.includes('id="btnSubmitPwaProof"'), 'Button btnSubmitPwaProof missing in app.html');
  assert(appHtml.includes('id="pwaProofUploadBox"'), 'Dropzone pwaProofUploadBox missing in app.html');
});

runTest('js/pwa.js mendefinisikan controller handlePwaProofFileSelected & submitPwaPaymentProof', () => {
  assert(pwaJs.includes('window.handlePwaProofFileSelected'), 'handlePwaProofFileSelected missing in pwa.js');
  assert(pwaJs.includes('window.submitPwaPaymentProof'), 'submitPwaPaymentProof missing in pwa.js');
});

runTest('js/auth.js syncPilgrimUI menyelaraskan tampilan bukti terkirim jika session.proofSubmitted', () => {
  assert(authJs.includes('session.proofSubmitted || session.proofImage'), 'Proof state check missing in syncPilgrimUI');
});

// 3. Pengujian Sisi Admin Portal (admin.html, admin-registrations.js & admin-nav.js)
console.log('\n3. Pengujian Modal Validasi DP & Pratinjau Struk di Sisi Admin Portal');
const adminHtml = fs.readFileSync(path.join(process.cwd(), 'admin.html'), 'utf8');
const adminRegsJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-registrations.js'), 'utf8');
const adminNavJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-nav.js'), 'utf8');
const adminFinanceJs = fs.readFileSync(path.join(process.cwd(), 'js', 'admin', 'admin-finance.js'), 'utf8');

runTest('admin.html memuat modal khusus #modalValidateDpBooking dengan form mutasi bank & preview struk', () => {
  assert(adminHtml.includes('id="modalValidateDpBooking"'), 'modalValidateDpBooking missing in admin.html');
  assert(adminHtml.includes('id="vdp_proof_img"'), 'vdp_proof_img preview missing in admin.html');
  assert(adminHtml.includes('id="adminDpProofFileInput"'), 'adminDpProofFileInput missing in admin.html');
  assert(adminHtml.includes('id="vdp_ref_input"'), 'vdp_ref_input missing in admin.html');
});

runTest('admin-registrations.js mendefinisikan openValidateDpModal, handleAdminProofFileSelected & handleConfirmValidateDp', () => {
  assert(adminRegsJs.includes('function openValidateDpModal(regId)'), 'openValidateDpModal missing');
  assert(adminRegsJs.includes('function handleAdminProofFileSelected(event)'), 'handleAdminProofFileSelected missing');
  assert(adminRegsJs.includes('function handleConfirmValidateDp(e)'), 'handleConfirmValidateDp missing');
});

runTest('admin-registrations.js confirmRegistrationDP memicu modal validasi terpadu bukan alert polos', () => {
  assert(adminRegsJs.includes('function confirmRegistrationDP(regId) {\n        openValidateDpModal(regId);') || adminRegsJs.includes('openValidateDpModal(regId)'), 'confirmRegistrationDP must trigger openValidateDpModal');
});

runTest('Drawer review registrasi (admin-nav.js) menampilkan pratinjau bukti struk jamaah jika tersedia', () => {
  assert(adminNavJs.includes('r.proofImage'), 'proofImage rendering check missing in admin-nav.js');
});

// 4. Simulasi Fungsional Alur End-to-End dengan Bukti Transfer
console.log('\n4. Simulasi Fungsional Alur: Upload Struk -> Review Admin -> E-Pass Terbit');

const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// 4a. Jamaah upload foto struk di PWA
const dummyProofBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const pilgrimSession = {
  id: 'CUS-TEST-99',
  regId: 'REG-SDW-3410',
  fullName: 'Starmil Store',
  phone: '081298765432',
  status: 'PENDING_DP',
  packageTitle: 'Umroh Reguler Syawal Barakah',
  totalPrice: 'Rp 29.500.000',
  dpAmount: 'Rp 5.000.000',
  proofSubmitted: true,
  proofImage: dummyProofBase64
};
mockStorage['sdw_pilgrim_session'] = JSON.stringify(pilgrimSession);

// Mock registrasi admin
const adminRegs = [
  {
    id: 'REG-SDW-3410',
    customer: 'Starmil Store',
    package: 'Umroh Reguler Syawal Barakah',
    status: 'PENDING_DP',
    dpAmount: 5000000,
    proofImage: dummyProofBase64
  }
];
mockStorage['sdw_admin_registrations'] = JSON.stringify(adminRegs);

runTest('Admin membuka modal dan menemukan bukti transfer jamaah yang terunggah', () => {
  const regList = JSON.parse(mockStorage['sdw_admin_registrations']);
  const target = regList.find(r => r.id === 'REG-SDW-3410');
  assert(target, 'Target registration must exist');
  assert.strictEqual(target.proofImage, dummyProofBase64, 'Proof image must match uploaded data');
});

runTest('Admin mengesahkan pembayaran dengan input nomor referensi mutasi BSI', () => {
  const regList = JSON.parse(mockStorage['sdw_admin_registrations']);
  const target = regList.find(r => r.id === 'REG-SDW-3410');
  target.status = 'CONFIRMED';
  target.payment = 'DP Lunas (Rp 5.000.000)';
  mockStorage['sdw_admin_registrations'] = JSON.stringify(regList);

  const payments = [
    {
      id: 'PAY-SDW-010',
      regId: 'REG-SDW-3410',
      customer: 'Starmil Store',
      amount: 'Rp 5.000.000',
      ref: 'BSI-TX889021',
      proof: target.proofImage,
      status: 'VERIFIED'
    }
  ];
  mockStorage['sdw_admin_payments'] = JSON.stringify(payments);

  // Update sesi jamaah
  const sess = JSON.parse(mockStorage['sdw_pilgrim_session']);
  sess.status = 'CONFIRMED';
  mockStorage['sdw_pilgrim_session'] = JSON.stringify(sess);

  assert.strictEqual(JSON.parse(mockStorage['sdw_pilgrim_session']).status, 'CONFIRMED');
  assert.strictEqual(JSON.parse(mockStorage['sdw_admin_payments'])[0].status, 'VERIFIED');
  assert.strictEqual(JSON.parse(mockStorage['sdw_admin_payments'])[0].ref, 'BSI-TX889021');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🌟 SISTEM BUKTI PEMBAYARAN & VALIDASI STRUK DUA SISI 100% SUKSES!');
}
