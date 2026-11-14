const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: PWA PROFIL AS FULL-SCREEN SPA SUBVIEW (NO POPUP) ===\n');

const appHtmlPath = path.join(__dirname, '..', 'app.html');
const appHtml = fs.readFileSync(appHtmlPath, 'utf8');

const pwaJsPath = path.join(__dirname, '..', 'js', 'pwa.js');
const pwaJs = fs.readFileSync(pwaJsPath, 'utf8');

const authJsPath = path.join(__dirname, '..', 'js', 'auth.js');
const authJs = fs.readFileSync(authJsPath, 'utf8');

// 1. Bottom Navbar Label & ARIA Tests
console.log('1. Pengujian Bottom Navbar PWA (Tab 5: Akun)');
runTest('Bottom Navbar Tab 5 memiliki label teks "Akun"', () => {
  assert(
    appHtml.includes('<span class="text-[9.5px] font-semibold mt-1">Akun</span>'),
    'Label tab 5 di bottom navbar belum "Akun"'
  );
});

runTest('Bottom Navbar Tab 5 memiliki aria-label "Akun Jamaah & Kartu Digital"', () => {
  assert(
    appHtml.includes('aria-label="Akun Jamaah &amp; Kartu Digital"'),
    'aria-label tab 5 belum diperbarui ke Akun'
  );
});

runTest('Sidebar Desktop memiliki label "Akun & Kartu Jamaah"', () => {
  assert(
    appHtml.includes('<span>Akun &amp; Kartu Jamaah</span>'),
    'Sidebar desktop belum diselaraskan menjadi Akun'
  );
});

runTest('Header tab akun menampilkan "Akun & Kartu Jamaah"', () => {
  assert(
    appHtml.includes('Akun &amp; Kartu Jamaah</h2>'),
    'Header tab akun belum menampilkan judul yang tepat'
  );
});

// 2. 8 Grid Menu Utama Beranda PWA
console.log('\n2. Pengujian 8 Grid Menu Utama Beranda PWA');
runTest('Menu ke-8 pada 8 grid utama memicu window.openAppSubView("profil")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('profil')\""),
    'Menu ke-8 tidak memicu openAppSubView("profil")'
  );
});

runTest('Menu Profil menggunakan ikon representatif landmark/institusi', () => {
  assert(
    appHtml.includes('fa-landmark'),
    'Ikon menu Profil institusi belum terpasang'
  );
});

// 3. Full-Screen Subview Profil (No Popup Modal)
console.log('\n3. Pengujian Full-Screen Subview Profil (Bebas Popup)');
runTest('Popup modal #modalAppProfileSheet telah dihapus (Zero Popup)', () => {
  assert(
    !appHtml.includes('id="modalAppProfileSheet"'),
    'Modal popup #modalAppProfileSheet masih ada di app.html'
  );
});

runTest('Container native #subview-profil terpasang di app.html', () => {
  assert(
    appHtml.includes('id="subview-profil"'),
    'Container #subview-profil belum ada di app.html'
  );
});

runTest('#subview-profil memiliki Sticky Top Bar dengan tombol back ke Beranda', () => {
  assert(
    appHtml.includes('onclick="window.backToAppHome()"') &&
    appHtml.includes('Profil Lembaga &amp; Syiar'),
    'Sticky top bar dengan tombol back belum terpasang di subview-profil'
  );
});

// 4. 4 Submenu Khusus Mobile PWA
console.log('\n4. Pengujian 4 Submenu Tampilan Khusus Mobile PWA');
runTest('Tersedia 4 Segmented Submenu Tabs (Visi, Sambutan, Pembimbing, Mitra)', () => {
  assert(appHtml.includes('id="btn-profile-subtab-visi"'), 'Subtab visi belum ada');
  assert(appHtml.includes('id="btn-profile-subtab-sambutan"'), 'Subtab sambutan belum ada');
  assert(appHtml.includes('id="btn-profile-subtab-pembimbing"'), 'Subtab pembimbing belum ada');
  assert(appHtml.includes('id="btn-profile-subtab-mitra"'), 'Subtab mitra belum ada');
});

runTest('Submenu 1 (Visi Misi) memuat KPI Kredensial, Visi, 5 Misi & Panca Khidmat', () => {
  assert(appHtml.includes('Panca Khidmat (5 Nilai Luhur)'), 'Panca khidmat belum ada');
  assert(appHtml.includes('No. Izin PPIU'), 'KPI PPIU belum ada');
  assert(appHtml.includes('Tonggak Sejarah Lembaga'), 'Lini masa tonggak sejarah belum ada');
});

runTest('Submenu 2 (Sambutan) memuat foto pimpinan, gold quote, dan naskah sambutan mobile', () => {
  assert(appHtml.includes('app-profile-director-img'), 'Image direktur belum ada');
  assert(appHtml.includes('Melayani Setiap Langkah Jamaah Sebagai Tamu Allah yang Mulia'), 'Naskah sambutan belum ada');
  assert(appHtml.includes('H. Muhammad Syarif'), 'Nama pimpinan belum ada');
});

runTest('Submenu 3 (Pembimbing) memuat filter kategori dan kontainer asatidz', () => {
  assert(appHtml.includes('appProfileGuidesContainer'), 'Container asatidz belum ada');
  assert(appHtml.includes('Ust. H. Ahmad Fauzan, Lc., M.Ag.'), 'Pembimbing utama belum ada');
  assert(appHtml.includes('Rasio 1 : 35'), 'Rasio 1:35 belum ada');
});

runTest('Submenu 4 (Legalitas & Mitra) memuat direktori Jaringan Mitra Syiar & Cabang', () => {
  assert(appHtml.includes('appProfileMitraContainer'), 'Container mitra belum ada');
  assert(appHtml.includes('Jaringan Mitra Syiar &amp; Cabang Daerah'), 'Header mitra syiar belum ada');
  assert(appHtml.includes('appProfileMitraCountBadge'), 'Badge jumlah mitra belum ada');
});

runTest('Hotline CS Khidmat 24 Jam via WhatsApp tersedia di bagian bawah subview', () => {
  assert(appHtml.includes('https://wa.me/6281234567890'), 'Tautan WhatsApp CS Khidmat belum ada');
});

// 5. Controller di js/pwa.js
console.log('\n5. Pengujian Controller di js/pwa.js');
runTest('js/pwa.js mendaftarkan "profil" di IN_APP_SUBVIEW_NAMES', () => {
  assert(pwaJs.includes("'profil'"), '"profil" belum ada di IN_APP_SUBVIEW_NAMES');
});

runTest('js/pwa.js menyediakan fungsi switchAppProfileSubtab, renderAppProfileGuides, renderAppProfileMitra', () => {
  assert(pwaJs.includes('window.switchAppProfileSubtab'), 'switchAppProfileSubtab belum terdefinisi');
  assert(pwaJs.includes('window.renderAppProfileGuides'), 'renderAppProfileGuides belum terdefinisi');
  assert(pwaJs.includes('window.renderAppProfileMitra'), 'renderAppProfileMitra belum terdefinisi');
});

runTest('Router APP_VIEW_MAP memetakan "profil" dan "profil-lembaga" ke openAppSubView', () => {
  assert(pwaJs.includes("'profil': (opts) => window.openAppSubView('profil', opts)"), 'Mapping profil belum benar');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
}
