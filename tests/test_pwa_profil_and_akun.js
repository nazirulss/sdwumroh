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

console.log('=== TEST SUITE: PWA BOTTOM NAV "AKUN" & 8-GRID HOME MENU "PROFIL" ===\n');

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
runTest('Menu ke-8 pada 8 grid utama adalah "Profil"', () => {
  const menuGridRegex = /<!--\s*8\.\s*Profil Lembaga[\s\S]*?<button[\s\S]*?openAppProfileModal\(\)[\s\S]*?<span[^>]*>Profil<\/span>/;
  assert(menuGridRegex.test(appHtml), 'Menu ke-8 bukan Profil atau tidak memicu openAppProfileModal');
});

runTest('Menu Profil menggunakan ikon representatif landmark/institusi', () => {
  assert(
    appHtml.includes('fa-landmark'),
    'Ikon menu Profil institusi belum terpasang'
  );
});

// 3. Modal Profil Lembaga (4 Pilar Web Publik)
console.log('\n3. Pengujian Modal Profil Lembaga (#modalAppProfileSheet)');
runTest('Modal #modalAppProfileSheet terpasang di app.html', () => {
  assert(
    appHtml.includes('id="modalAppProfileSheet"'),
    'Modal #modalAppProfileSheet tidak ditemukan di app.html'
  );
});

runTest('Modal memiliki 4 pilar profil yang menghubungkan ke halaman web publik', () => {
  assert(appHtml.includes('href="tentang.html"'), 'Tautan tentang.html (Visi Misi) belum ada');
  assert(appHtml.includes('href="sambutan.html"'), 'Tautan sambutan.html (Sambutan Direktur) belum ada');
  assert(appHtml.includes('href="muthawwif.html"'), 'Tautan muthawwif.html (Dewan Pembimbing) belum ada');
  assert(appHtml.includes('href="legalitas.html"'), 'Tautan legalitas.html (Legalitas & Jaringan Mitra) belum ada');
});

runTest('Modal memiliki tombol hotline CS Khidmat 24 Jam via WhatsApp', () => {
  assert(
    appHtml.includes('https://wa.me/6281234567890'),
    'Tautan WhatsApp resmi CS Khidmat hilang'
  );
  assert(
    appHtml.includes('Bantuan &amp; Konsultasi (CS Khidmat)'),
    'Banner CS Khidmat di dalam modal profil belum ada'
  );
});

// 4. Controller & Routing di js/pwa.js & js/auth.js
console.log('\n4. Pengujian Controller & Router');
runTest('js/pwa.js menyediakan fungsi openAppProfileModal & closeAppProfileModal', () => {
  assert(pwaJs.includes('window.openAppProfileModal'), 'window.openAppProfileModal belum terdefinisi');
  assert(pwaJs.includes('window.closeAppProfileModal'), 'window.closeAppProfileModal belum terdefinisi');
});

runTest('modalAppProfileSheet terdaftar di ALL_APP_MODAL_IDS', () => {
  assert(pwaJs.includes("'modalAppProfileSheet'"), 'modalAppProfileSheet belum ada di ALL_APP_MODAL_IDS');
});

runTest('Router APP_VIEW_MAP mengenali profil-lembaga dan akun', () => {
  assert(pwaJs.includes("'profil-lembaga':"), 'Router profil-lembaga belum terdaftar');
  assert(pwaJs.includes("'akun':"), 'Router akun belum terdaftar');
});

runTest('js/auth.js memetakan tab-profile ke view "akun"', () => {
  assert(authJs.includes("'tab-profile': 'akun'"), 'tabViewMap di auth.js belum memetakan ke akun');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
}
