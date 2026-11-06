// Test suite: Interactive Journey Stepper on Pilgrim PWA (/app)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: INTERACTIVE JOURNEY STEPPER (NO POPUP) ===\n');

const appHtmlPath = path.join(__dirname, '../app.html');
const jamaahJsPath = path.join(__dirname, '../js/jamaah.js');

const appHtml = fs.readFileSync(appHtmlPath, 'utf8');
const jamaahJs = fs.readFileSync(jamaahJsPath, 'utf8');

// 1. Verifikasi Elemen DOM Inline Stepper & Panels
console.log('1. Pengujian Semantik DOM Stepper & Inline Panels di app.html');
assert(appHtml.includes('id="step-btn-1"'), 'Tombol Step 1 harus ada');
assert(appHtml.includes('id="step-btn-2"'), 'Tombol Step 2 harus ada');
assert(appHtml.includes('id="step-btn-3"'), 'Tombol Step 3 harus ada');
assert(appHtml.includes('id="step-btn-4"'), 'Tombol Step 4 harus ada');
assert(appHtml.includes('id="step-btn-5"'), 'Tombol Step 5 harus ada');
assert(appHtml.includes('id="journey-active-badge"'), 'Badge status tahapan aktif harus ada');

assert(appHtml.includes('id="journey-panel-1"'), 'Panel 1 (DP Booking) harus ada secara inline');
assert(appHtml.includes('id="journey-panel-2"'), 'Panel 2 (Paspor & Berkas) harus ada secara inline');
assert(appHtml.includes('id="journey-panel-3"'), 'Panel 3 (Pelunasan) harus ada secara inline');
assert(appHtml.includes('id="journey-panel-4"'), 'Panel 4 (Bimbingan Manasik) harus ada secara inline');
assert(appHtml.includes('id="journey-panel-5"'), 'Panel 5 (Terbang & Kloter) harus ada secara inline');

assert(appHtml.includes('id="jamaah-documents-list"'), 'List dokumen tetap terpelihara');
assert(appHtml.includes('id="jamaah-inv-total"'), 'Total invoice tetap terpelihara');
assert(appHtml.includes('id="manasik-title"'), 'Manasik info tetap terpelihara');
console.log('  [PASS] Seluruh 5 tombol stepper dan 5 inline panels terpasang dengan presisi!');

// 2. Verifikasi Fungsi Switcher di js/jamaah.js
console.log('\n2. Pengujian Controller Navigasi switchJourneyStep di js/jamaah.js');
assert(jamaahJs.includes('function switchJourneyStep('), 'Fungsi switchJourneyStep harus didefinisikan');
assert(jamaahJs.includes('window.switchJourneyStep = switchJourneyStep'), 'switchJourneyStep harus diekspos ke window');
assert(jamaahJs.includes('journey-panel-${step}'), 'Harus mengaktifkan target panel sesuai parameter step');
console.log('  [PASS] Controller switchJourneyStep terpasang dan terekspor dengan benar!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');

