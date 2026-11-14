/**
 * ====================================================================
 * TEST SUITE: DAFTAR MITRA SYIAR PADA HALAMAN BERANDA UTAMA (INDEX.HTML)
 * File: tests/test_mitra_home_carousel.js
 * Inspired by: PPTQ ROUDLOTUL MUBAROKAH (https://mubarokah.my.id)
 * ====================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

console.log('🧪 Memulai Pengujian Seksi Daftar Mitra Syiar pada Halaman Beranda (index.html)...\n');

let passCount = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        process.exit(1);
    }
}

test('1. index.html memuat section #mitra-syiar-home dengan tema background hijau institusi', () => {
    assert(indexHtml.includes('id="mitra-syiar-home"'), 'Harus memiliki section id="mitra-syiar-home"');
    assert(indexHtml.includes('JARINGAN MITRA SYIAR &amp; PERWAKILAN CABANG'), 'Harus memuat judul JARINGAN MITRA SYIAR & PERWAKILAN CABANG');
    assert(indexHtml.includes('bg-gradient-to-r from-[#072416] via-[#0E3A25] to-[#061F13]'), 'Harus berlatar belakang gradasi hijau tua elegan');
});

test('2. Seksi Mitra memuat sub-headline kontinu scroll persis seperti referensi PPTQ ROUDLOTUL MUBAROKAH', () => {
    assert(indexHtml.includes('bergeser pelan secara kontinu (Arahkan kursor untuk jeda)'), 'Harus memuat teks sub-headline interaktif');
    assert(indexHtml.includes('id="homeMitraCountText"'), 'Harus memiliki elemen dinamis id="homeMitraCountText"');
});

test('3. index.html memiliki kontrol navigasi slider (Prev/Next) dan tombol "Lihat Semua Mitra →"', () => {
    assert(indexHtml.includes('id="btnMitraHomePrev"'), 'Harus memiliki tombol id="btnMitraHomePrev"');
    assert(indexHtml.includes('id="btnMitraHomeNext"'), 'Harus memiliki tombol id="btnMitraHomeNext"');
    assert(indexHtml.includes('href="legalitas.html#mitraSyiarSection"'), 'Harus mengarah ke legalitas.html#mitraSyiarSection');
    assert(indexHtml.includes('Lihat Semua Mitra'), 'Harus memiliki tombol teks "Lihat Semua Mitra"');
});

test('4. Carousel track #homeMitraTrack terpasang dengan rapi tanpa scrollbar bawaan', () => {
    assert(indexHtml.includes('id="homeMitraTrack"'), 'Harus memiliki container track id="homeMitraTrack"');
    assert(indexHtml.includes('overflow-x-auto'), 'Harus dapat di-scroll horizontal');
});

test('5. index.html mengimplementasikan logika JavaScript continuous auto-scroll dengan pause on hover', () => {
    assert(indexHtml.includes('function initMitraSyiarHomeCarousel()'), 'Harus memiliki fungsi initMitraSyiarHomeCarousel');
    assert(indexHtml.includes("track.addEventListener('mouseenter'"), 'Harus memiliki listener pause saat mouseenter');
    assert(indexHtml.includes("track.addEventListener('mouseleave'"), 'Harus memiliki listener resume saat mouseleave');
    assert(indexHtml.includes("initMitraSyiarHomeCarousel();"), 'Harus dipanggil saat DOMContentLoaded');
});

console.log(`\n======================================================`);
console.log(`Pengujian Selesai: ${passCount} / 5 Berhasil (100%)`);
console.log(`======================================================\n`);
