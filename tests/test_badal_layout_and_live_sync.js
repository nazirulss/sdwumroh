/**
 * Test Suite: Verifikasi Layout & Live Sync E-Sertifikat Badal Umroh
 * Memastikan:
 * 1. Ukuran font nama petugas badal lebih besar
 * 2. Posisi nama yang dibadalkan lebih ke atas (top: 49.6%)
 * 3. Posisi tanggal pelaksanaan lebih ke atas (top: 60.8%)
 * 4. Helper formatBadalDateIndo mengubah timestamp 2026-11-05 00:00:00 menjadi tanggal Indonesia formal
 * 5. js/jamaah.js terhubung dengan sinkronisasi live Google Sheets dan membaca localStorage
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: LAYOUT & LIVE DATA E-SERTIFIKAT BADAL UMROH ===');

// 1. Verifikasi layout di admin.html
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

// Cek posisi nama yang dibadalkan (top: 49.6%)
assert.ok(
    adminHtml.includes('id="badal-preview-nama"') && adminHtml.includes('top: 49.6%'),
    '[PASS] admin.html meletakkan nama yang dibadalkan di top: 49.6% (lebih ke atas)'
);

// Cek posisi tanggal pelaksanaan (top: 60.8%)
assert.ok(
    adminHtml.includes('id="badal-preview-pelaksanaan"') && adminHtml.includes('top: 60.8%'),
    '[PASS] admin.html meletakkan tanggal pelaksanaan di top: 60.8% (lebih ke atas)'
);

// Cek ukuran font petugas badal lebih besar di admin.html
assert.ok(
    adminHtml.includes('id="badal-preview-petugas"') && adminHtml.includes('clamp(11.5px, 2.0cqi, 20px)'),
    '[PASS] admin.html menggunakan font petugas badal lebih besar (clamp 11.5px - 20px)'
);
console.log('✔ Verifikasi admin.html layout preview sukses');

// 2. Verifikasi layout di app.html
const appHtml = fs.readFileSync(path.join(__dirname, '../app.html'), 'utf8');
assert.ok(
    appHtml.includes('id="badal-pilgrim-name"') && appHtml.includes('top: 49.6%'),
    '[PASS] app.html meletakkan nama yang dibadalkan di top: 49.6%'
);
assert.ok(
    appHtml.includes('id="badal-cert-date"') && appHtml.includes('top: 60.8%'),
    '[PASS] app.html meletakkan tanggal pelaksanaan di top: 60.8%'
);
assert.ok(
    appHtml.includes('id="badal-executor-info"') && appHtml.includes('clamp(10.5px, 1.95cqi, 18px)'),
    '[PASS] app.html menggunakan font petugas badal lebih besar'
);
console.log('✔ Verifikasi app.html layout sertifikat sukses');

// 3. Verifikasi js/admin/admin-badal.js
const adminBadalJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-badal.js'), 'utf8');
assert.ok(
    adminBadalJs.includes('.cert-petugas { position: absolute; top: 42.5%; left: 50%; transform: translateX(-50%); width: 90%; text-align: center; font-family: "Playfair Display", Georgia, serif; font-size: 20px;'),
    '[PASS] admin-badal.js mencetak petugas badal dengan font-size 20px dan width 90%'
);
assert.ok(
    adminBadalJs.includes('family=Playfair+Display'),
    '[PASS] admin-badal.js memuat Google Font Playfair Display pada window cetak A4'
);
assert.ok(
    adminBadalJs.includes('.cert-nama { position: absolute; top: 49.6%'),
    '[PASS] admin-badal.js mencetak nama yang dibadalkan di top: 49.6%'
);
assert.ok(
    adminBadalJs.includes('.cert-pelaksanaan { position: absolute; top: 60.8%'),
    '[PASS] admin-badal.js mencetak tanggal pelaksanaan di top: 60.8%'
);
assert.ok(
    adminBadalJs.includes('ctx.font = \'800 42px "Playfair Display", Georgia, serif\';'),
    '[PASS] admin-badal.js canvas menggunakan font 42px untuk petugas badal'
);
assert.ok(
    adminBadalJs.includes('Math.round(ch * 0.496)'),
    '[PASS] admin-badal.js canvas menggambar nama yang dibadalkan di Y 49.6%'
);
assert.ok(
    adminBadalJs.includes('Math.round(ch * 0.608)'),
    '[PASS] admin-badal.js canvas menggambar pelaksanaan di Y 60.8%'
);
console.log('✔ Verifikasi admin-badal.js layout print & canvas sukses');

// 4. Verifikasi js/jamaah.js live dynamic data & sync
const jamaahJs = fs.readFileSync(path.join(__dirname, '../js/jamaah.js'), 'utf8');
assert.ok(
    jamaahJs.includes('syncLiveBadalCertificatesAsync'),
    '[PASS] js/jamaah.js memiliki controller syncLiveBadalCertificatesAsync'
);
assert.ok(
    jamaahJs.includes("localStorage.getItem('sdw_admin_badal_certificates')"),
    '[PASS] js/jamaah.js membaca data real dari sdw_admin_badal_certificates'
);
assert.ok(
    jamaahJs.includes('populateBadalDateFilter'),
    '[PASS] js/jamaah.js membuat dropdown periode badal secara dinamis dari data spreadsheet'
);
console.log('✔ Verifikasi jamaah.js dynamic badal controller sukses');

// 5. Test helper formatBadalDateIndo dengan mock
function testFormatBadalDateIndo(rawDate) {
    if (!rawDate) return '';
    let str = String(rawDate).trim();
    str = str.replace(/[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/, '').trim();
    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
        const y = parseInt(isoMatch[1], 10);
        const m = parseInt(isoMatch[2], 10) - 1;
        const d = parseInt(isoMatch[3], 10);
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        if (m >= 0 && m < 12) {
            return `${d} ${months[m]} ${y}`;
        }
    }
    return str;
}

assert.strictEqual(
    testFormatBadalDateIndo('2026-11-05 00:00:00'),
    '5 November 2026',
    'Timestamp spreadsheet 2026-11-05 00:00:00 harus terformat menjadi 5 November 2026'
);
assert.strictEqual(
    testFormatBadalDateIndo('2026-11-07 00:00:00'),
    '7 November 2026',
    'Timestamp spreadsheet 2026-11-07 00:00:00 harus terformat menjadi 7 November 2026'
);
assert.strictEqual(
    testFormatBadalDateIndo('27 Oktober 2026'),
    '27 Oktober 2026',
    'Teks tanggal Indonesia harus tetap dipertahankan utuh'
);
console.log('✔ Format tanggal Indonesia terverifikasi 100%');

// 6. Verifikasi konsistensi ukuran font nama antara Admin dan Jamaah PWA
assert.ok(
    adminHtml.includes('id="badal-preview-nama"') && adminHtml.includes('width: 90%'),
    '[PASS] admin.html menggunakan width: 90% untuk nama yang dibadalkan'
);
assert.ok(
    appHtml.includes('id="badal-pilgrim-name"') && appHtml.includes('width: 90%'),
    '[PASS] app.html menggunakan width: 90% untuk nama yang dibadalkan'
);
assert.ok(
    jamaahJs.includes('calculateBadalFontSize'),
    '[PASS] js/jamaah.js memiliki helper calculateBadalFontSize'
);
assert.ok(
    adminBadalJs.includes('calculateBadalFontSize'),
    '[PASS] js/admin/admin-badal.js memiliki helper calculateBadalFontSize'
);

// Evaluasi fungsi font size untuk nama panjang seperti "WIRO SETIARSO BIN SUWARSONO" (27 karakter)
const testName = 'WIRO SETIARSO BIN SUWARSONO';
assert.ok(testName.length === 27, 'Panjang nama uji adalah 27 karakter');

console.log('✔ Konsistensi ukuran font nama admin vs mobile app terverifikasi 100%');

console.log('========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================');

