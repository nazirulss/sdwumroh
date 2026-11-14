/**
 * Comprehensive Audit Script for Latest SDW UMROH Updates
 * Audits Header, Multi-Page Profile, Routes, PWA Cache, Integrity, and Visual Consistency.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('  AUDIT MENYELURUH PEMBARUAN TERAKHIR SDW UMROH');
console.log('===============================================================\n');

let pass = 0;
let fail = 0;

function audit(section, testName, fn) {
    try {
        fn();
        console.log(`  [OK] ${testName}`);
        pass++;
    } catch (err) {
        console.error(`  [X] ${testName} FAILED: ${err.message}`);
        fail++;
    }
}

const root = process.cwd();
const componentsJs = fs.readFileSync(path.join(root, 'js/components.js'), 'utf8');
const swJs = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tentangHtml = fs.readFileSync(path.join(root, 'tentang.html'), 'utf8');
const sambutanHtml = fs.readFileSync(path.join(root, 'sambutan.html'), 'utf8');
const muthawwifHtml = fs.readFileSync(path.join(root, 'muthawwif.html'), 'utf8');
const legalitasHtml = fs.readFileSync(path.join(root, 'legalitas.html'), 'utf8');

// -----------------------------------------------------------------------------
// 1. AUDIT HEADER & NAVIGASI UNIVERSAL
// -----------------------------------------------------------------------------
console.log('1. Audit Universal Navbar & Navigasi (Desktop & Mobile)');

audit('Nav', 'Urutan menu desktop: Beranda -> Profil -> Paket -> Layanan -> Panduan', () => {
    const berandaPos = componentsJs.indexOf('<span>Beranda</span>');
    const profilPos = componentsJs.indexOf('<span>Profil</span>');
    const paketPos = componentsJs.indexOf('<span>Paket</span>');
    const layananPos = componentsJs.indexOf('<span>Layanan</span>');
    const panduanPos = componentsJs.indexOf('<span>Panduan</span>');

    assert(berandaPos !== -1 && profilPos !== -1 && paketPos !== -1 && layananPos !== -1 && panduanPos !== -1);
    assert(berandaPos < profilPos, 'Beranda harus sebelum Profil');
    assert(profilPos < paketPos, 'Profil harus di antara Beranda dan Paket');
    assert(paketPos < layananPos, 'Paket harus sebelum Layanan');
    assert(layananPos < panduanPos, 'Layanan harus sebelum Panduan');
});

audit('Nav', 'Nama menu desktop ringkas 1 baris: "Paket" & "Panduan"', () => {
    assert(componentsJs.includes('<span>Paket</span>'));
    assert(componentsJs.includes('<span>Panduan</span>'));
    assert(!componentsJs.includes('<span>Pilihan Paket</span>'));
    assert(!componentsJs.includes('<span>Panduan &amp; Ziarah</span>'));
});

audit('Nav', 'Dropdown Profil bersih dari item aplikasi PWA & portal admin', () => {
    const regex = /<div class="nav-dropdown-group py-3">[\s\S]*?<span>Profil<\/span>[\s\S]*?<div class="nav-dropdown-menu">([\s\S]*?)<\/div>/;
    const match = componentsJs.match(regex);
    assert(match, 'Dropdown profil harus ditemukan');
    const html = match[1];
    assert(!html.includes('Aplikasi Jamaah (PWA)'));
    assert(!html.includes('Portal Staf Backoffice'));
    assert(!html.includes('/app'));
    assert(!html.includes('/admin'));
});

audit('Nav', 'Dropdown Profil memuat 4 URL halaman mandiri resmi', () => {
    assert(componentsJs.includes('href="/tentang"'));
    assert(componentsJs.includes('href="/sambutan"'));
    assert(componentsJs.includes('href="/muthawwif"'));
    assert(componentsJs.includes('href="/legalitas"'));
});

audit('Nav', 'Mobile drawer memuat link Profil tepat setelah Beranda', () => {
    const berandaPos = componentsJs.indexOf('<i class="fa-solid fa-kaaba text-sdw-pine w-4 text-center"></i> Beranda');
    const profilDrawerPos = componentsJs.indexOf('Profil Lembaga</span>');
    const paketDrawerPos = componentsJs.indexOf('<i class="fa-solid fa-cubes text-sdw-pine w-4 text-center"></i> Paket Umroh');
    assert(berandaPos !== -1 && profilDrawerPos !== -1 && paketDrawerPos !== -1);
    assert(berandaPos < profilDrawerPos, 'Beranda drawer harus sebelum Profil drawer');
    assert(profilDrawerPos < paketDrawerPos, 'Profil drawer harus sebelum Paket drawer');
});

audit('Nav', 'getActivePageKey mengenali 4 halaman profil dan mengaktifkan isProfil', () => {
    assert(componentsJs.includes("if (path.includes('/tentang') || path.includes('/profil')) return 'tentang';"));
    assert(componentsJs.includes("if (path.includes('/sambutan')) return 'sambutan';"));
    assert(componentsJs.includes("if (path.includes('/muthawwif') || path.includes('/guru')) return 'muthawwif';"));
    assert(componentsJs.includes("if (path.includes('/legalitas') || path.includes('/mou')) return 'legalitas';"));
    assert(componentsJs.includes("const isProfil = ['tentang', 'profil', 'sambutan', 'muthawwif', 'legalitas'].includes(key);"));
});

// -----------------------------------------------------------------------------
// 2. AUDIT 4 HALAMAN PROFIL MANDIRI (INTEGRITAS STRUKTUR & DESAIN)
// -----------------------------------------------------------------------------
console.log('\n2. Audit 4 Halaman Profil Mandiri (Multi-Page Architecture)');

audit('Profil', 'tentang.html memiliki komponen resmi, 4 kartu KPI kredensial, dan sejarah', () => {
    assert(tentangHtml.includes('id="app-header" data-active="tentang"'));
    assert(tentangHtml.includes('id="app-footer"'));
    assert(tentangHtml.includes('id="app-bottom-bar"'));
    assert(tentangHtml.includes('IZIN PPIU KEMENAG'));
    assert(tentangHtml.includes('No. U.123/2026'));
    assert(tentangHtml.includes('AKREDITASI MUTU'));
    assert(tentangHtml.includes('Peringkat A (Unggul)'));
    assert(tentangHtml.includes('BADAN HUKUM'));
    assert(tentangHtml.includes('PT Sahabat Dhuha Wisata'));
    assert(tentangHtml.includes('AFILIASI RESMI'));
    assert(tentangHtml.includes('AMPHURI &amp; IATA'));
    assert(tentangHtml.includes('Sejarah &amp; Perjalanan Lembaga'));
    assert(tentangHtml.includes('Dewan Direksi &amp; Manajemen PT Sahabat Dhuha Wisata'));
});

audit('Sambutan', 'sambutan.html memiliki foto resmi, naskah khidmat, dan stempel lisensi', () => {
    assert(sambutanHtml.includes('id="app-header" data-active="sambutan"'));
    assert(sambutanHtml.includes('id="app-footer"'));
    assert(sambutanHtml.includes('src="assets/direktur-utama.jpg"'));
    assert(sambutanHtml.includes('H. Muhammad Syarif'));
    assert(sambutanHtml.includes('Melayani Tamu Allah adalah Amanah Tertinggi Kami'));
    assert(sambutanHtml.includes('VERIFIED PPIU NO. U.123/2026'));
    assert(sambutanHtml.includes('4 Pilar Utama Pengasuhan &amp; Pendampingan Ibadah'));
});

audit('Muthawwif', 'muthawwif.html memiliki profil ketua pembimbing, katalog asatidz, dan rasio 1:35', () => {
    assert(muthawwifHtml.includes('id="app-header" data-active="muthawwif"'));
    assert(muthawwifHtml.includes('id="app-footer"'));
    assert(muthawwifHtml.includes('Ust. H. Ahmad Fauzan, Lc., M.Ag.'));
    assert(muthawwifHtml.includes('Ust. Muhammad Ridwan, Lc.'));
    assert(muthawwifHtml.includes('dr. Hj. Siti Fatimah, Sp.PD'));
    assert(muthawwifHtml.includes('1 : 35'));
});

audit('Legalitas', 'legalitas.html memiliki SK PPIU Kemenag, Akreditasi A, dan MOU Kemitraan', () => {
    assert(legalitasHtml.includes('id="app-header" data-active="legalitas"'));
    assert(legalitasHtml.includes('id="app-footer"'));
    assert(legalitasHtml.includes('U.123 Tahun 2026'));
    assert(legalitasHtml.includes('Akreditasi Mutu "A"'));
    assert(legalitasHtml.includes('Kementerian Agama RI'));
    assert(legalitasHtml.includes('Saudia &amp; Garuda Indonesia'));
    assert(legalitasHtml.includes('Bank Syariah Indonesia (BSI)'));
    assert(legalitasHtml.includes('AMPHURI'));
});

// -----------------------------------------------------------------------------
// 3. AUDIT KONSISTENSI BERANDA & PWA PRECACHE
// -----------------------------------------------------------------------------
console.log('\n3. Audit Integrasi Beranda (index.html) & PWA Precache (sw.js)');

audit('Beranda', 'index.html memiliki seksi komitmen pimpinan dengan tautan langsung ke /sambutan', () => {
    assert(indexHtml.includes('assets/direktur-utama.jpg'));
    assert(indexHtml.includes('H. Muhammad Syarif'));
    assert(indexHtml.includes('href="/sambutan"'));
    assert(indexHtml.includes('Baca Sambutan Lengkap'));
});

audit('PWA', 'sw.js memiliki versi v82+ dan mem-precache seluruh 4 halaman profil', () => {
    const versionMatch = swJs.match(/sdw-umroh-pwa-v(\d+)/);
    const v = versionMatch ? parseInt(versionMatch[1], 10) : 0;
    assert(v >= 82, `Versi cache harus minimal v82, terdeteksi: v${v}`);
    assert(swJs.includes("'/tentang.html'"));
    assert(swJs.includes("'/sambutan.html'"));
    assert(swJs.includes("'/muthawwif.html'"));
    assert(swJs.includes("'/legalitas.html'"));
    assert(swJs.includes("'/assets/direktur-utama.jpg'"));
});

audit('Disk', 'Semua file halaman dan aset fisik tersedia di disk dan tidak kosong', () => {
    const targetFiles = [
        'tentang.html',
        'sambutan.html',
        'muthawwif.html',
        'legalitas.html',
        'index.html',
        'js/components.js',
        'sw.js',
        'assets/direktur-utama.jpg'
    ];
    targetFiles.forEach(f => {
        const fullPath = path.join(root, f);
        assert(fs.existsSync(fullPath), `File ${f} tidak ditemukan di disk`);
        const stats = fs.statSync(fullPath);
        assert(stats.size > 0, `File ${f} kosong (0 byte)`);
    });
});

// -----------------------------------------------------------------------------
// 4. AUDIT VALIDITAS SEMANTIK HTML & BALANCE TAG
// -----------------------------------------------------------------------------
console.log('\n4. Audit Validitas Semantik HTML & Balance Tag');

['tentang.html', 'sambutan.html', 'muthawwif.html', 'legalitas.html'].forEach(f => {
    audit('HTML', `Validitas tag container & script pada ${f}`, () => {
        const content = fs.readFileSync(path.join(root, f), 'utf8');
        const openDivs = (content.match(/<div[\s>]/g) || []).length;
        const closeDivs = (content.match(/<\/div>/g) || []).length;
        const openSections = (content.match(/<section[\s>]/g) || []).length;
        const closeSections = (content.match(/<\/section>/g) || []).length;

        assert.strictEqual(openDivs, closeDivs, `Jumlah tag <div> (${openDivs}) tidak seimbang dengan </div> (${closeDivs}) pada ${f}`);
        assert.strictEqual(openSections, closeSections, `Jumlah tag <section> (${openSections}) tidak seimbang dengan </section> (${closeSections}) pada ${f}`);
        assert(content.includes('id="app-header"'), `Tag app-header hilang di ${f}`);
        assert(content.includes('id="app-footer"'), `Tag app-footer hilang di ${f}`);
        assert(content.includes('id="app-bottom-bar"'), `Tag app-bottom-bar hilang di ${f}`);
        assert(content.includes('js/components.js'), `Script js/components.js hilang di ${f}`);
        assert(content.includes('js/pwa.js'), `Script js/pwa.js hilang di ${f}`);
    });
});

console.log('\n===============================================================');
console.log(`  HASIL AUDIT: ${pass} BERHASIL (PASSED), ${fail} GAGAL (FAILED)`);
console.log('===============================================================\n');

if (fail > 0) process.exit(1);
