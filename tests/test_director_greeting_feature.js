/**
 * ====================================================================
 * UNIT TEST: Fitur Foto & Sambutan Pimpinan SDW Umroh
 * File: tests/test_director_greeting_feature.js
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const tentangHtmlPath = path.join(rootDir, 'tentang.html');
const indexHtmlPath = path.join(rootDir, 'index.html');
const swJsPath = path.join(rootDir, 'sw.js');
const photoPath = path.join(rootDir, 'assets/direktur-utama.jpg');

const tentangHtml = fs.readFileSync(tentangHtmlPath, 'utf8');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const swJs = fs.readFileSync(swJsPath, 'utf8');

console.log('🧪 Memulai Pengujian Fitur Foto + Sambutan Pimpinan SDW Umroh...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
    }
}

// 1. Verifikasi File Fisik Foto Direktur Utama
runTest('1. File fisik foto pimpinan (assets/direktur-utama.jpg) tersedia dan valid di disk', () => {
    assert(fs.existsSync(photoPath), 'File assets/direktur-utama.jpg tidak ditemukan di disk');
    const stats = fs.statSync(photoPath);
    assert(stats.size > 10000, 'File assets/direktur-utama.jpg terlalu kecil atau kosong');
});

// 2. Verifikasi Section Sambutan di tentang.html
runTest('2. tentang.html memuat section #sambutan-pimpinan lengkap dengan foto, identitas, dan naskah sambutan', () => {
    assert(tentangHtml.includes('id="sambutan-pimpinan"'), 'Section id="sambutan-pimpinan" tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('src="assets/direktur-utama.jpg"'), 'Foto direktur-utama.jpg tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('H. Muhammad Syarif'), 'Nama H. Muhammad Syarif tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('Direktur Utama'), 'Jabatan Direktur Utama tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('Assalamu\'alaikum Warahmatullahi Wabarakatuh'), 'Salam pembuka tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('Wassalamu\'alaikum Warahmatullahi Wabarakatuh'), 'Salam penutup tidak ditemukan di tentang.html');
    assert(tentangHtml.includes('VERIFIED PPIU NO. U.123/2026'), 'Badge verifikasi PPIU tidak ditemukan di tentang.html');
});

// 3. Verifikasi Section Sambutan di index.html (Halaman Utama Beranda)
runTest('3. index.html memuat section komitmen pimpinan dengan foto, kutipan, dan CTA ke tentang.html', () => {
    assert(indexHtml.includes('assets/direktur-utama.jpg'), 'Foto direktur-utama.jpg tidak ditemukan di index.html');
    assert(indexHtml.includes('H. Muhammad Syarif'), 'Nama H. Muhammad Syarif tidak ditemukan di index.html');
    assert(indexHtml.includes('Direktur Utama PT Sahabat Dhuha Wisata'), 'Gelar direktur tidak ditemukan di index.html');
    assert(indexHtml.includes('tentang.html#sambutan-pimpinan'), 'Tautan ke tentang.html#sambutan-pimpinan tidak ditemukan di index.html');
    assert(indexHtml.includes('Tamu Allah yang Mulia'), 'Kutipan tema Tamu Allah tidak ditemukan di index.html');
    assert(indexHtml.includes('Pasti Seat &amp; Jadwal'), 'Pilar kepastian seat tidak ditemukan di index.html');
});

// 4. Verifikasi Precache PWA Service Worker
runTest('4. sw.js mem-precache foto direktur dan menaikkan cache version ke v79+', () => {
    assert(swJs.includes('/assets/direktur-utama.jpg'), 'sw.js tidak mem-precache /assets/direktur-utama.jpg');
    const versionMatch = swJs.match(/sdw-umroh-pwa-v(\d+)/);
    const v = versionMatch ? parseInt(versionMatch[1], 10) : 0;
    assert(v >= 79, 'Cache version di sw.js harus minimal v79');
});

console.log(`\n======================================================`);
console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`======================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
