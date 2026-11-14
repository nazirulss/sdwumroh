/**
 * Test Suite: Adopsi Konsep Halaman Profil MTs YASUA untuk SDW UMROH (Multi-Page Architecture)
 * Memverifikasi struktur header, dropdown institusional murni, dan 4 halaman mandiri:
 * 1. tentang.html (/tentang) - Profil, Visi, Misi & Sejarah
 * 2. sambutan.html (/sambutan) - Sambutan Direktur Utama
 * 3. muthawwif.html (/muthawwif) - Dewan Pembimbing & Muthawwif
 * 4. legalitas.html (/legalitas) - Legalitas, Akreditasi & Kemitraan Resmi
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: ARSITEKTUR MULTI-PAGE PROFIL PERSIS MTS YASUA ===\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
    try {
        fn();
        console.log(`  [PASS] ${desc}`);
        passCount++;
    } catch (err) {
        console.error(`  [FAIL] ${desc}: ${err.message}`);
        failCount++;
    }
}

const componentsJs = fs.readFileSync(path.join(__dirname, '../js/components.js'), 'utf8');
const tentangHtml = fs.readFileSync(path.join(__dirname, '../tentang.html'), 'utf8');
const sambutanHtml = fs.readFileSync(path.join(__dirname, '../sambutan.html'), 'utf8');
const muthawwifHtml = fs.readFileSync(path.join(__dirname, '../muthawwif.html'), 'utf8');
const legalitasHtml = fs.readFileSync(path.join(__dirname, '../legalitas.html'), 'utf8');
const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');

// 1. Pengujian Universal Header & Dropdown Profil
console.log('1. Pengujian Universal Header & Dropdown Profil Multi-Page (js/components.js)');

it('Header menu menggunakan nama "Profil" dan bersih dari "Tentang Kami"', () => {
    assert(componentsJs.includes('<span>Profil</span>'), 'Must contain <span>Profil</span>');
    assert(!componentsJs.includes('<span>Tentang Kami</span>'), 'Must NOT contain <span>Tentang Kami</span>');
});

it('Dropdown Profil TIDAK LAGI memuat link aplikasi teknis / admin backoffice', () => {
    const profilDropdownRegex = /(?:<!-- Nav Item 2: Profil|<!-- Dropdown.*?Profil)[\s\S]*?<div class="nav-dropdown-menu">([\s\S]*?)<\/div>/;
    const match = componentsJs.match(profilDropdownRegex);
    assert(match, 'Profil dropdown block must exist');
    const dropdownHtml = match[1];
    assert(!dropdownHtml.includes('Aplikasi Jamaah (PWA)'), 'Must NOT contain Aplikasi Jamaah (PWA)');
    assert(!dropdownHtml.includes('Portal Staf Backoffice'), 'Must NOT contain Portal Staf Backoffice');
    assert(!dropdownHtml.includes('/app'), 'Dropdown profil must not link to /app');
    assert(!dropdownHtml.includes('/admin'), 'Dropdown profil must not link to /admin');
});

it('Header menu diatur dengan urutan: Beranda -> Profil -> Paket -> Layanan -> Panduan', () => {
    const berandaPos = componentsJs.indexOf('<span>Beranda</span>');
    const profilPos = componentsJs.indexOf('<span>Profil</span>');
    const paketPos = componentsJs.indexOf('<span>Paket</span>');
    const layananPos = componentsJs.indexOf('<span>Layanan</span>');
    const panduanPos = componentsJs.indexOf('<span>Panduan</span>');

    assert(berandaPos !== -1, 'Beranda menu must exist');
    assert(profilPos !== -1, 'Profil menu must exist');
    assert(paketPos !== -1, 'Paket menu must exist');
    assert(layananPos !== -1, 'Layanan menu must exist');
    assert(panduanPos !== -1, 'Panduan menu must exist');

    assert(berandaPos < profilPos, 'Beranda must come before Profil');
    assert(profilPos < paketPos, 'Profil must be between Beranda and Paket');
    assert(paketPos < layananPos, 'Paket must come before Layanan');
    assert(layananPos < panduanPos, 'Layanan must come before Panduan');
});

it('Nama menu disederhanakan: "Paket" (bukan Pilihan Paket) dan "Panduan" (bukan Panduan & Ziarah)', () => {
    assert(componentsJs.includes('<span>Paket</span>'), 'Must contain <span>Paket</span>');
    assert(componentsJs.includes('<span>Panduan</span>'), 'Must contain <span>Panduan</span>');
    assert(!componentsJs.includes('<span>Pilihan Paket</span>'), 'Must NOT contain <span>Pilihan Paket</span> in top nav');
    assert(!componentsJs.includes('<span>Panduan &amp; Ziarah</span>'), 'Must NOT contain <span>Panduan &amp; Ziarah</span> in top nav');
});

it('Dropdown Profil mengarahkan ke 4 URL halaman mandiri (Multi-Page ala MTs YASUA)', () => {
    assert(componentsJs.includes('href="/tentang"'), 'Must link to /tentang');
    assert(componentsJs.includes('Profil, Visi &amp; Misi'), 'Must contain Profil, Visi & Misi');
    
    assert(componentsJs.includes('href="/sambutan"'), 'Must link to /sambutan');
    assert(componentsJs.includes('Sambutan Direktur Utama'), 'Must contain Sambutan Direktur Utama');
    
    assert(componentsJs.includes('href="/muthawwif"'), 'Must link to /muthawwif');
    assert(componentsJs.includes('Dewan Pembimbing &amp; Muthawwif'), 'Must contain Dewan Pembimbing & Muthawwif');
    
    assert(componentsJs.includes('href="/legalitas"'), 'Must link to /legalitas');
    assert(componentsJs.includes('Legalitas &amp; Jaringan Mitra') || componentsJs.includes('Legalitas &amp; Kemitraan Resmi'), 'Must contain Legalitas & Jaringan Mitra');
});

// 2. Pengujian Halaman 1: Profil, Visi & Misi (tentang.html)
console.log('\n2. Pengujian Halaman Profil, Visi & Misi (tentang.html)');

it('tentang.html memuat 4 Kartu KPI Kredensial di bagian atas', () => {
    assert(tentangHtml.includes('IZIN PPIU KEMENAG'), 'Must have KPI Card: IZIN PPIU KEMENAG');
    assert(tentangHtml.includes('No. U.123/2026'), 'Must display PPIU Number No. U.123/2026');
    assert(tentangHtml.includes('AKREDITASI MUTU'), 'Must have KPI Card: AKREDITASI MUTU');
    assert(tentangHtml.includes('Peringkat A (Unggul)'), 'Must display Akreditasi A (Unggul)');
    assert(tentangHtml.includes('BADAN HUKUM'), 'Must have KPI Card: BADAN HUKUM');
    assert(tentangHtml.includes('PT Sahabat Dhuha Wisata'), 'Must display PT Sahabat Dhuha Wisata');
    assert(tentangHtml.includes('AFILIASI RESMI'), 'Must have KPI Card: AFILIASI RESMI');
    assert(tentangHtml.includes('AMPHURI &amp; IATA'), 'Must display AMPHURI & IATA');
});

it('tentang.html memuat Sejarah Linimasa dan Struktur Direksi Perusahaan', () => {
    assert(tentangHtml.includes('Sejarah &amp; Perjalanan Lembaga'), 'Must contain Sejarah & Perjalanan Lembaga');
    assert(tentangHtml.includes('Dewan Direksi &amp; Manajemen PT Sahabat Dhuha Wisata'), 'Must contain Struktur Direksi');
});

// 3. Pengujian Halaman 2: Sambutan Direktur Utama (sambutan.html)
console.log('\n3. Pengujian Halaman Sambutan Direktur Utama (sambutan.html)');

it('sambutan.html memuat foto pimpinan, naskah sambutan, dan 4 pilar pengasuhan', () => {
    assert(sambutanHtml.includes('assets/direktur-utama.jpg'), 'Must have photo of Direktur Utama');
    assert(sambutanHtml.includes('H. Muhammad Syarif'), 'Must mention H. Muhammad Syarif');
    assert(sambutanHtml.includes('4 Pilar Utama Pengasuhan &amp; Pendampingan'), 'Must have 4 Pilar Utama Pengasuhan');
    assert(sambutanHtml.includes('VERIFIED PPIU NO. U.123/2026'), 'Must have verified stamp');
});

// 4. Pengujian Halaman 3: Dewan Pembimbing & Muthawwif (muthawwif.html)
console.log('\n4. Pengujian Halaman Dewan Pembimbing & Muthawwif (muthawwif.html)');

it('muthawwif.html memuat profil ketua pembimbing, katalog asatidz, dan rasio 1:35', () => {
    assert(muthawwifHtml.includes('Ust. H. Ahmad Fauzan, Lc., M.Ag.'), 'Must feature Ketua Dewan Pembimbing');
    assert(muthawwifHtml.includes('Muthawwif Senior Makkah'), 'Must have Muthawwif Senior Makkah');
    assert(muthawwifHtml.includes('dr. Hj. Siti Fatimah, Sp.PD'), 'Must have Koordinator Tim Medis');
    assert(muthawwifHtml.includes('1 : 35'), 'Must state 1:35 ratio');
});

// 5. Pengujian Halaman 4: Legalitas & Kemitraan Resmi (legalitas.html)
console.log('\n5. Pengujian Halaman Legalitas & Kemitraan Resmi (legalitas.html)');

it('legalitas.html memuat bukti izin PPIU, Akreditasi A, dan katalog MOU mitra', () => {
    assert(legalitasHtml.includes('U.123 Tahun 2026') || legalitasHtml.includes('No. U.123/2026'), 'Must display SK Kemenag');
    assert(legalitasHtml.includes('Kemitraan Strategis &amp; Nota Kesepahaman (MOU)'), 'Must have MOU Catalog');
    assert(legalitasHtml.includes('Saudia &amp; Garuda Indonesia'), 'Must list Airline Partners');
    assert(legalitasHtml.includes('Bank Syariah Indonesia (BSI)'), 'Must list Banking Partner');
    assert(legalitasHtml.includes('AMPHURI'), 'Must list Association Partner');
});

// 6. Pengujian Precache Service Worker
console.log('\n6. Pengujian Precache Service Worker (sw.js)');

it('sw.js mem-precache ke-4 halaman profil mandiri', () => {
    assert(swJs.includes("'/tentang.html'"), 'sw.js must precache /tentang.html');
    assert(swJs.includes("'/sambutan.html'"), 'sw.js must precache /sambutan.html');
    assert(swJs.includes("'/muthawwif.html'"), 'sw.js must precache /muthawwif.html');
    assert(swJs.includes("'/legalitas.html'"), 'sw.js must precache /legalitas.html');
});

console.log(`\n========================================`);
console.log(`TEST RESULT: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================\n`);

if (failCount > 0) process.exit(1);
