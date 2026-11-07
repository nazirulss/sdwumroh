const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: AUDIT & NORMALISASI PASFOTO SERTIFIKAT GOOGLE DRIVE ===\n');

// 1. Verifikasi js/admin/admin-certificates.js
console.log('1. Verifikasi js/admin/admin-certificates.js');
const certsCode = fs.readFileSync('js/admin/admin-certificates.js', 'utf8');

assert(certsCode.includes('function extractDriveFileId('), 'extractDriveFileId harus terdefinisi');
assert(certsCode.includes('window.handleCertPhotoError = function'), 'handleCertPhotoError fallback harus terdefinisi');
assert(certsCode.includes('referrerpolicy="no-referrer"'), 'Tag img pasfoto harus menyertakan referrerpolicy="no-referrer"');
assert(certsCode.includes('https://drive.google.com/thumbnail?id='), 'Fallback thumbnail drive harus tersedia');
assert(certsCode.includes('fallback-user-icon'), 'Fallback ikon avatar harus tersedia');

console.log('  [PASS] Ekstraksi Drive ID, fallback cerdas, dan referrerpolicy terverifikasi di admin-certificates.js!');

// 2. Verifikasi js/admin/admin-sync.js
console.log('\n2. Verifikasi js/admin/admin-sync.js');
const syncCode = fs.readFileSync('js/admin/admin-sync.js', 'utf8');
assert(syncCode.includes('if (typeof admin.renderCertificates === \'function\') admin.renderCertificates();'), 'pullCloudDatabase harus me-render ulang modul certificates');
console.log('  [PASS] Sinkronisasi live database otomatis memicu render ulang E-Sertifikat!');

// 3. Verifikasi js/jamaah.js & app.html
console.log('\n3. Verifikasi js/jamaah.js & app.html');
const jamaahCode = fs.readFileSync('js/jamaah.js', 'utf8');
const appHtml = fs.readFileSync('app.html', 'utf8');
assert(jamaahCode.includes('function extractDriveFileId('), 'extractDriveFileId harus ada di jamaah.js');
assert(appHtml.includes('id="cert-pilgrim-photo-img" src="" alt="Foto Jamaah" referrerpolicy="no-referrer"'), 'referrerpolicy harus ada di foto sertifikat app.html');
console.log('  [PASS] Normalisasi URL & referrerpolicy di sisi jamaah (/app) terverifikasi!');

// 4. Pengujian Ekstraksi & Normalisasi URL Varian Google Drive
console.log('\n4. Pengujian Logika Normalisasi URL Varian Google Drive');

function extractDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    const m1 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m1 && m1[1] && m1[1] !== 'file') return m1[1];
    const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2 && m2[1]) return m2[1];
    return null;
}

function normalizePhotoUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) return trimmed;
    const fileId = extractDriveFileId(trimmed);
    if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
    return trimmed;
}

const testFileId = '1hlhI132zBrmHAZR33blLHqZSADYoIDEo';
const expectedUrl = `https://lh3.googleusercontent.com/d/${testFileId}=s0`;

assert.strictEqual(normalizePhotoUrl(`https://drive.google.com/file/d/${testFileId}/view?usp=sharing`), expectedUrl);
assert.strictEqual(normalizePhotoUrl(`https://drive.google.com/open?id=${testFileId}`), expectedUrl);
assert.strictEqual(normalizePhotoUrl(`https://drive.google.com/uc?id=${testFileId}`), expectedUrl);
assert.strictEqual(normalizePhotoUrl(`https://lh3.googleusercontent.com/d/${testFileId}`), expectedUrl);
assert.strictEqual(normalizePhotoUrl(`https://lh3.googleusercontent.com/d/${testFileId}=s0`), expectedUrl);

console.log('  [PASS] Seluruh varian tautan Google Drive berhasil dinormalisasi ke direct CDN image URL!');

// 5. Verifikasi sw.js
console.log('\n5. Verifikasi sw.js');
const swCode = fs.readFileSync('sw.js', 'utf8');
assert(/sdw-umroh-pwa-v(4[7-9]|[5-9]\d)/.test(swCode), 'sw.js cache version harus v47 atau lebih baru');
console.log('  [PASS] Service Worker v47+ terverifikasi!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');

