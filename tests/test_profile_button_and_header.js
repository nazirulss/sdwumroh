const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: WARNA TOMBOL MASUK & PEMBERSIHAN TOMBOL PENGATURAN ===\n');

// 1. Verifikasi app.html
console.log('1. Verifikasi app.html');
const appHtml = fs.readFileSync('app.html', 'utf8');

// Tombol Masuk / Buat Akun Jamaah
assert(appHtml.includes('Masuk / Buat Akun Jamaah'), 'Tombol Masuk / Buat Akun Jamaah harus ada');
assert(appHtml.includes('linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)'), 'Tombol Masuk harus menggunakan styling warna emas kontras tinggi');
assert(appHtml.includes('color: #020617;'), 'Warna teks tombol Masuk harus hitam pekat/slate-950 agar sangat jelas terbaca');

// Tombol Pengaturan di card Profil & Kartu Jamaah
// Pastikan di sekitar profileLoginBtnHeader TIDAK ada tombol settings lagi
const idxHeader = appHtml.indexOf('id="profileLoginBtnHeader"');
const profileHeaderSnippet = appHtml.slice(idxHeader - 50, idxHeader + 450);
assert(!profileHeaderSnippet.includes('openSettingsModal'), 'Tombol pengaturan di sebelah tombol masuk profil harus sudah dihilangkan');

// Pastikan tombol pengaturan utama pada app header tetap ada
assert(appHtml.includes('onclick="window.openSettingsModal()"'), 'Tombol pengaturan pada header utama aplikasi harus tetap ada');

console.log('  [PASS] Styling emas kontras tinggi & eliminasi tombol pengaturan ganda terverifikasi!');

// 2. Verifikasi sw.js
console.log('\n2. Verifikasi sw.js');
const swCode = fs.readFileSync('sw.js', 'utf8');
assert(/sdw-umroh-pwa-v(4[6-9]|[5-9]\d)/.test(swCode), 'sw.js cache version harus v46 atau lebih tinggi');
console.log('  [PASS] Service Worker v46+ terverifikasi!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');

