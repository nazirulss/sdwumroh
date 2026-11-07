const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: TOMBOL AKSI ICON-ONLY & DOWNLOAD SERTIFIKAT ===\n');

// 1. Verifikasi js/admin/admin-certificates.js
console.log('1. Verifikasi js/admin/admin-certificates.js');
const certsCode = fs.readFileSync('js/admin/admin-certificates.js', 'utf8');

// Aksi Icon Only (Tanpa Teks)
assert(certsCode.includes('w-8 h-8 rounded-lg bg-sdw-pine'), 'Tombol Edit & Preview harus icon-only');
assert(certsCode.includes('w-8 h-8 rounded-lg bg-amber-100'), 'Tombol Cetak Fisik A4 harus icon-only');
assert(certsCode.includes('w-8 h-8 rounded-lg bg-emerald-100'), 'Tombol Download harus icon-only');

// Pastikan span teks lama sudah dibuang dari baris aksi
assert(!certsCode.includes('<span>Edit &amp; Preview</span>'), 'Teks Edit & Preview harus dihapus dari tombol tabel');
assert(!certsCode.includes('<span>Cetak A4</span>'), 'Teks Cetak A4 harus dihapus dari tombol tabel');

// Fungsi-fungsi Download
assert(certsCode.includes('function generateCertificateCanvas('), 'generateCertificateCanvas harus terdefinisi');
assert(certsCode.includes('function downloadSingleCertificate('), 'downloadSingleCertificate harus terdefinisi');
assert(certsCode.includes('function downloadBulkCertificates('), 'downloadBulkCertificates harus terdefinisi');
assert(certsCode.includes('admin.downloadSingleCertificate = downloadSingleCertificate'), 'downloadSingleCertificate harus diekspor');
assert(certsCode.includes('admin.downloadBulkCertificates = downloadBulkCertificates'), 'downloadBulkCertificates harus diekspor');

console.log('  [PASS] Aksi icon-only dan fungsi download di js/admin/admin-certificates.js terverifikasi!');

// 2. Verifikasi admin.html
console.log('\n2. Verifikasi admin.html');
const adminHtml = fs.readFileSync('admin.html', 'utf8');

assert(adminHtml.includes('SDW_ADMIN.downloadBulkCertificates()'), 'Tombol Download Massal harus memanggil downloadBulkCertificates()');
assert(adminHtml.includes('<span>Download Massal</span>'), 'Label Download Massal harus ada di admin.html');
assert(adminHtml.includes('Terbitkan Massal Kloter'), 'Tombol Terbitkan Massal Kloter harus tetap ada');
assert(adminHtml.includes('SDW_ADMIN.downloadSingleCertificate(document.getElementById'), 'Tombol Download JPG harus ada di modal preview');

console.log('  [PASS] Tombol Download Massal & tombol modal di admin.html terverifikasi!');

// 3. Verifikasi sw.js
console.log('\n3. Verifikasi sw.js');
const swCode = fs.readFileSync('sw.js', 'utf8');
assert(swCode.includes('sdw-umroh-pwa-v45'), 'sw.js cache version harus v45');
console.log('  [PASS] Service Worker v45 terverifikasi!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');
