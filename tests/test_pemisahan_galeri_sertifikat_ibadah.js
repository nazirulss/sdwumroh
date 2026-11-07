/**
 * Test Suite: Pemisahan Menu Galeri, E-Sertifikat & Menu Ibadah Full-Screen SPA
 * Memverifikasi:
 * 1. Reorganisasi Grid 8: Posisi Item 4 adalah E-Sertifikat (bukan Arah Kiblat)
 * 2. Bottom Nav Item 3: Membuka Sub-Page Penuh Ibadah (window.openAppSubView('ibadah'))
 * 3. Menu Galeri: Khusus Foto Dokumentasi Kloter (Album kloter, filter select, Google Drive batch)
 * 4. Menu Sertifikat: Tab Umroh & Tab Badal mandiri dengan filter kloter & WhatsApp sharing
 * 5. Menu Ibadah: Full-Screen SPA (Bebas Popup Modal) dengan 4 Tab: Kiblat, Sholat, Manasik, Doa
 * 6. PWA Router & Service Worker v39
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: PEMISAHAN GALERI, E-SERTIFIKAT & PUSAT IBADAH SPA ===\n');

const appHtmlPath = path.join(__dirname, '..', 'app.html');
const appHtml = fs.readFileSync(appHtmlPath, 'utf8');

const pwaJsPath = path.join(__dirname, '..', 'js', 'pwa.js');
const pwaJs = fs.readFileSync(pwaJsPath, 'utf8');

const jamaahJsPath = path.join(__dirname, '..', 'js', 'jamaah.js');
const jamaahJs = fs.readFileSync(jamaahJsPath, 'utf8');

const swJsPath = path.join(__dirname, '..', 'sw.js');
const swJs = fs.readFileSync(swJsPath, 'utf8');

// 1. Verifikasi Grid 8 Menu Utama
console.log('1. Verifikasi Grid 8 Menu Utama (Beranda PWA)');
assert(appHtml.includes("onclick=\"window.openAppSubView('sertifikat')\""), 'Grid 8 item 4 harus memanggil window.openAppSubView("sertifikat")');
assert(appHtml.includes('fa-award'), 'Icon E-Sertifikat harus menggunakan fa-award');
assert(appHtml.includes('>E-Sertifikat</span>'), 'Label Grid 8 item 4 harus "E-Sertifikat"');
console.log('  [PASS] Menu E-Sertifikat menggantikan posisi Arah Kiblat di Grid 8!');

// 2. Verifikasi Bottom Navigation Item 3 (Ibadah Elevated Button)
console.log('\n2. Verifikasi Bottom Navigation Item 3 (Pusat Ibadah)');
assert(appHtml.includes("onclick=\"window.openAppSubView('ibadah')\""), 'Tombol tengah bottom bar harus memanggil openAppSubView("ibadah")');
assert(!appHtml.includes("onclick=\"window.openIbadahModal()\""), 'Tombol tengah TIDAK BOLEH memicu modal popup lama');
console.log('  [PASS] Bottom bar Item 3 memicu Full-Screen Sub-Page Ibadah (Bebas Popup Modal)!');

// 3. Verifikasi Subview Galeri Dokumentasi Kloter (#subview-galeri)
console.log('\n3. Verifikasi Subview Galeri Dokumentasi Kloter (#subview-galeri)');
assert(appHtml.includes('id="subview-galeri"'), 'Subview #subview-galeri harus ada di app.html');
assert(appHtml.includes('id="galeriFilterKloterSelect"'), 'Dropdown filter kloter galeri harus ada');
assert(appHtml.includes('id="galeriFotoGridContainer"'), 'Container foto dokumentasi galeri harus ada');
assert(appHtml.includes('id="galeriDriveLinkBtn"'), 'Tombol link Google Drive kloter harus ada');
console.log('  [PASS] Subview Galeri mandiri untuk dokumentasi foto perjalanan kloter terverifikasi!');

// 4. Verifikasi Subview E-Sertifikat Mandiri (#subview-sertifikat)
console.log('\n4. Verifikasi Subview E-Sertifikat Mandiri (#subview-sertifikat)');
assert(appHtml.includes('id="subview-sertifikat"'), 'Subview #subview-sertifikat harus ada di app.html');
assert(appHtml.includes('id="certTabUmrohBtn"'), 'Tombol Tab Sertifikat Umroh harus ada');
assert(appHtml.includes('id="certTabBadalBtn"'), 'Tombol Tab Sertifikat Badal harus ada');
assert(appHtml.includes('id="certTabContentUmroh"'), 'Container konten Tab Umroh harus ada');
assert(appHtml.includes('id="certTabContentBadal"'), 'Container konten Tab Badal harus ada');
assert(appHtml.includes('id="badalCertContainer"'), 'Template frame piagam badal harus ada');
assert(appHtml.includes('id="badalFilterDate"'), 'Filter periode badal harus ada');
console.log('  [PASS] Subview E-Sertifikat mandiri dengan 2 Tab (Umroh & Badal) terverifikasi!');

// 5. Verifikasi Subview Ibadah Full-Screen SPA (#subview-ibadah)
console.log('\n5. Verifikasi Subview Ibadah Full-Screen SPA (#subview-ibadah)');
assert(appHtml.includes('id="subview-ibadah"'), 'Subview #subview-ibadah harus ada di app.html');
assert(appHtml.includes('id="ibadahTabKiblatBtn"'), 'Tab Kiblat di menu ibadah harus ada');
assert(appHtml.includes('id="ibadahTabSholatBtn"'), 'Tab Sholat di menu ibadah harus ada');
assert(appHtml.includes('id="ibadahTabManasikBtn"'), 'Tab Manasik di menu ibadah harus ada');
assert(appHtml.includes('id="ibadahTabDoaBtn"'), 'Tab Doa di menu ibadah harus ada');
assert(appHtml.includes('id="compassNeedleInIbadah"'), 'Jarum kompas digital harus ada di dalam menu ibadah');
assert(appHtml.includes('QS. Al-Baqarah: 144'), 'Dalil kiblat Al-Baqarah 144 harus terpasang di menu ibadah');
console.log('  [PASS] Pusat Ibadah Full-Screen SPA (Kompas Kiblat, Sholat, Manasik, Doa) terverifikasi!');

// 6. Verifikasi Router & Navigation Engine di js/pwa.js
console.log('\n6. Verifikasi Router & Navigation Engine di js/pwa.js');
assert(pwaJs.includes("'sertifikat'"), 'IN_APP_SUBVIEW_NAMES harus memuat sertifikat');
assert(pwaJs.includes("'ibadah'"), 'IN_APP_SUBVIEW_NAMES harus memuat ibadah');
assert(pwaJs.includes("v === 'sertifikat' || v === 'cert'"), 'openAppSubView harus menangani sertifikat');
assert(pwaJs.includes("v === 'ibadah'"), 'openAppSubView harus menangani ibadah');
assert(pwaJs.includes("document.getElementById('compassNeedleInIbadah')"), 'handleOrientation harus memperbarui kompas di menu ibadah');
console.log('  [PASS] Router PWA & orientasi kompas digital terverifikasi!');

// 7. Verifikasi Controller Jamaah di js/jamaah.js
console.log('\n7. Verifikasi Controller Jamaah di js/jamaah.js');
assert(jamaahJs.includes('function switchCertificateTab('), 'switchCertificateTab harus terdefinisi');
assert(jamaahJs.includes('function renderBadalCertificate('), 'renderBadalCertificate harus terdefinisi');
assert(jamaahJs.includes('function renderGaleriKloter('), 'renderGaleriKloter harus terdefinisi');
assert(jamaahJs.includes('function switchIbadahTab('), 'switchIbadahTab harus terdefinisi');
assert(jamaahJs.includes('function switchSholatCity('), 'switchSholatCity harus terdefinisi');
assert(jamaahJs.includes('window.switchCertificateTab = switchCertificateTab'), 'switchCertificateTab harus diekspos ke window');
assert(jamaahJs.includes('window.renderBadalCertificate = renderBadalCertificate'), 'renderBadalCertificate harus diekspos ke window');
assert(jamaahJs.includes('window.renderGaleriKloter = renderGaleriKloter'), 'renderGaleriKloter harus diekspos ke window');
assert(jamaahJs.includes('window.switchIbadahTab = switchIbadahTab'), 'switchIbadahTab harus diekspos ke window');
assert(jamaahJs.includes('window.switchSholatCity = switchSholatCity'), 'switchSholatCity harus diekspos ke window');
console.log('  [PASS] Seluruh controller baru di js/jamaah.js terdefinisi dan terekspos ke window!');

// 8. Verifikasi Cache Version di sw.js
console.log('\n8. Verifikasi Cache Version di sw.js');
assert(swJs.includes('sdw-umroh-pwa-v39'), 'sw.js harus menggunakan CACHE_NAME v39');
assert(swJs.includes('sdw-runtime-v39'), 'sw.js harus menggunakan RUNTIME_CACHE v39');
console.log('  [PASS] Service Worker telah diperbarui ke versi v39!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');
