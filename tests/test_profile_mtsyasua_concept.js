/**
 * Test Suite: Adopsi Konsep Halaman Profil MTs YASUA untuk SDW UMROH
 * Memverifikasi struktur header, dropdown institusional murni, 4 kartu KPI kredensial, dan section anchors.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: ADOPSI KONSEP PROFIL MTS YASUA UNTUK SDW UMROH ===\n');

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

// 1. Pengujian Navbar Header & Dropdown Profil
console.log('1. Pengujian Universal Header & Dropdown Profil (js/components.js)');

it('Header menu diubah dari "Tentang Kami" menjadi "Profil"', () => {
    assert(componentsJs.includes('<span>Profil</span>'), 'Must contain <span>Profil</span>');
    assert(!componentsJs.includes('<span>Tentang Kami</span>'), 'Must NOT contain <span>Tentang Kami</span>');
});

it('Dropdown Profil TIDAK LAGI memuat link aplikasi teknis / admin backoffice', () => {
    // Cari blok nav-dropdown-menu di dropdown profil
    const profilDropdownRegex = /<!-- Dropdown 4: Profil Lembaga[\s\S]*?<div class="nav-dropdown-menu">([\s\S]*?)<\/div>/;
    const match = componentsJs.match(profilDropdownRegex);
    assert(match, 'Profil dropdown block must exist');
    const dropdownHtml = match[1];
    assert(!dropdownHtml.includes('Aplikasi Jamaah (PWA)'), 'Must NOT contain Aplikasi Jamaah (PWA)');
    assert(!dropdownHtml.includes('Portal Staf Backoffice'), 'Must NOT contain Portal Staf Backoffice');
    assert(!dropdownHtml.includes('/app'), 'Dropdown profil must not link to /app');
    assert(!dropdownHtml.includes('/admin'), 'Dropdown profil must not link to /admin');
});

it('Dropdown Profil memuat 4 pilar profil institusional ala MTs YASUA', () => {
    assert(componentsJs.includes('href="/tentang#visi-misi"'), 'Must link to /tentang#visi-misi');
    assert(componentsJs.includes('Profil, Visi &amp; Misi'), 'Must contain Profil, Visi & Misi');
    
    assert(componentsJs.includes('href="/tentang#sambutan-pimpinan"'), 'Must link to /tentang#sambutan-pimpinan');
    assert(componentsJs.includes('Sambutan Direktur Utama'), 'Must contain Sambutan Direktur Utama');
    
    assert(componentsJs.includes('href="/tentang#muthawwif"'), 'Must link to /tentang#muthawwif');
    assert(componentsJs.includes('Dewan Pembimbing &amp; Muthawwif'), 'Must contain Dewan Pembimbing & Muthawwif');
    
    assert(componentsJs.includes('href="/tentang#legalitas"'), 'Must link to /tentang#legalitas');
    assert(componentsJs.includes('Legalitas &amp; Akreditasi Resmi'), 'Must contain Legalitas & Akreditasi Resmi');
});

// 2. Pengujian Halaman Profil (tentang.html)
console.log('\n2. Pengujian Halaman Profil & 4 Kartu KPI Kredensial (tentang.html)');

it('Title dan breadcrumb menggunakan nama Profil Lembaga', () => {
    assert(tentangHtml.includes('Profil Lembaga — Visi, Misi & Legalitas Resmi PPIU | SDW UMROH'), 'Title must be updated to Profil Lembaga');
    assert(tentangHtml.includes('<span class="text-white font-bold">Profil</span>'), 'Breadcrumb must be Profil');
});

it('Memiliki 4 Kartu KPI Kredensial horizontal di bagian atas', () => {
    assert(tentangHtml.includes('IZIN PPIU KEMENAG'), 'Must have KPI Card: IZIN PPIU KEMENAG');
    assert(tentangHtml.includes('No. U.123/2026'), 'Must display PPIU Number No. U.123/2026');
    assert(tentangHtml.includes('AKREDITASI MUTU'), 'Must have KPI Card: AKREDITASI MUTU');
    assert(tentangHtml.includes('Peringkat A (Unggul)'), 'Must display Akreditasi A (Unggul)');
    assert(tentangHtml.includes('BADAN HUKUM'), 'Must have KPI Card: BADAN HUKUM');
    assert(tentangHtml.includes('PT Sahabat Dhuha Wisata'), 'Must display PT Sahabat Dhuha Wisata');
    assert(tentangHtml.includes('AFILIASI RESMI'), 'Must have KPI Card: AFILIASI RESMI');
    assert(tentangHtml.includes('AMPHURI &amp; IATA'), 'Must display AMPHURI & IATA');
});

it('Memiliki 4 Section Anchor yang selaras dengan dropdown menu', () => {
    assert(tentangHtml.includes('id="visi-misi"'), 'Section #visi-misi must exist');
    assert(tentangHtml.includes('id="sambutan-pimpinan"'), 'Section #sambutan-pimpinan must exist');
    assert(tentangHtml.includes('id="muthawwif"'), 'Section #muthawwif must exist');
    assert(tentangHtml.includes('id="legalitas"'), 'Section #legalitas must exist');
});

console.log(`\n========================================`);
console.log(`TEST RESULT: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================\n`);

if (failCount > 0) process.exit(1);
