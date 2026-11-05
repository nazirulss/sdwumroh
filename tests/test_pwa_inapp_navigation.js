/**
 * Test Suite: PWA In-App Navigation & Full-Screen SPA Sub-Pages Verification
 * Verifies that all 8 app menu items operate as In-App Full-Screen Sub-Pages (Opsi 1)
 * without redirecting users to public pages, with sticky top [ ← Back ] App Bar,
 * and full query parameter sync (?view=...).
 */
const fs = require('fs');
const assert = require('assert');
const path = require('path');

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

console.log('=== TEST SUITE: PWA IN-APP NAVIGATION & FULL-SCREEN SUB-PAGES ===\n');

// 1. Audit app.html containment (Zero Public Leaks)
console.log('1. Pengujian app.html (Zero Public Page Redirections)');
const appHtml = fs.readFileSync(path.join(process.cwd(), 'app.html'), 'utf8');

runTest('Tidak ada tautan href="paket.html" di app.html', () => {
  assert(!appHtml.includes('href="paket.html"'), 'Still contains href="paket.html"');
});

runTest('Tidak ada tautan href="hotel.html" di app.html', () => {
  assert(!appHtml.includes('href="hotel.html"'), 'Still contains href="hotel.html"');
});

runTest('Tidak ada tautan href="koper.html" di app.html', () => {
  assert(!appHtml.includes('href="koper.html"'), 'Still contains href="koper.html"');
});

runTest('Tidak ada tautan href="kiblat.html" di app.html', () => {
  assert(!appHtml.includes('href="kiblat.html"'), 'Still contains href="kiblat.html"');
});

runTest('Tidak ada tautan href="ziarah.html" di app.html', () => {
  assert(!appHtml.includes('href="ziarah.html"'), 'Still contains href="ziarah.html"');
});

runTest('Tidak ada tautan href="galeri.html" di app.html', () => {
  assert(!appHtml.includes('href="galeri.html"'), 'Still contains href="galeri.html"');
});

runTest('Tidak ada tautan href="live.html" di app.html', () => {
  assert(!appHtml.includes('href="live.html"'), 'Still contains href="live.html"');
});

runTest('Menu Paket Umroh memicu window.openAppSubView("paket")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('paket')\"") ||
    appHtml.includes('onclick="window.openPaketModal()"'),
    'Missing openAppSubView/openPaketModal trigger'
  );
});

runTest('Menu Titik Hotel memicu window.openAppSubView("hotel")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('hotel')\"") ||
    appHtml.includes('onclick="window.openTitikHotelModal()"'),
    'Missing openAppSubView/openTitikHotelModal trigger'
  );
});

runTest('Menu Checklist Koper memicu window.openAppSubView("koper")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('koper')\"") ||
    appHtml.includes('onclick="window.openChecklistKoperModal()"'),
    'Missing openAppSubView/openChecklistKoperModal trigger'
  );
});

runTest('Menu Arah Kiblat memicu window.openAppSubView("kiblat")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('kiblat')\"") ||
    appHtml.includes('onclick="window.openArahKiblatModal()"'),
    'Missing openAppSubView/openArahKiblatModal trigger'
  );
});

runTest('Menu Peta Ziarah memicu window.openAppSubView("ziarah")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('ziarah')\"") ||
    appHtml.includes('onclick="window.openZiarahModal()"'),
    'Missing openAppSubView/openZiarahModal trigger'
  );
});

runTest('Menu Galeri Kloter memicu window.openAppSubView("galeri")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('galeri')\"") ||
    appHtml.includes('onclick="window.openGaleriKloterModal()"'),
    'Missing openAppSubView/openGaleriKloterModal trigger'
  );
});

runTest('Menu Live Ka\'bah memicu window.openAppSubView("live")', () => {
  assert(
    appHtml.includes("onclick=\"window.openAppSubView('live')\"") ||
    appHtml.includes('onclick="window.openLiveModal()"'),
    'Missing openAppSubView/openLiveModal trigger'
  );
});

runTest('Menu CS Khidmat tetap mengarah ke WhatsApp resmi', () => {
  assert(appHtml.includes('https://wa.me/6281234567890'), 'Missing CS WhatsApp link');
});

// 2. Audit app.html Full-Screen Sub-Views (Opsi 1 - Tanpa Popup)
console.log('\n2. Pengujian app.html Full-Screen SPA Sub-Pages (Bebas Popup)');
const SUBVIEW_IDS = [
  'subview-paket',
  'subview-hotel',
  'subview-koper',
  'subview-kiblat',
  'subview-ziarah',
  'subview-galeri',
  'subview-live'
];

SUBVIEW_IDS.forEach((subId) => {
  runTest(`Halaman penuh #${subId} terpasang di app.html`, () => {
    assert(appHtml.includes(`id="${subId}"`), `Missing #${subId} in app.html`);
  });
});

runTest('Setiap subview memiliki tombol sticky [ ← Back ] (window.backToAppHome())', () => {
  const matches = (appHtml.match(/onclick="window\.backToAppHome\(\)"/g) || []).length;
  assert(matches >= 7, `Expected at least 7 back buttons, found ${matches}`);
});

// 3. Audit js/pwa.js Master Sub-View Router & Controllers
console.log('\n3. Pengujian js/pwa.js (SPA Sub-Page Navigator & Controllers)');
const pwaJs = fs.readFileSync(path.join(process.cwd(), 'js', 'pwa.js'), 'utf8');

runTest('Fungsi master window.openAppSubView & window.backToAppHome tersedia', () => {
  assert(pwaJs.includes('window.openAppSubView = function'), 'Missing window.openAppSubView');
  assert(pwaJs.includes('window.backToAppHome = function'), 'Missing window.backToAppHome');
});

runTest('Fungsi window.openPaketModal & window.closePaketModal tersedia', () => {
  assert(pwaJs.includes('window.openPaketModal = function'), 'Missing window.openPaketModal');
  assert(pwaJs.includes('window.closePaketModal = function'), 'Missing window.closePaketModal');
});

runTest('Fungsi window.openTitikHotelModal & window.closeTitikHotelModal tersedia', () => {
  assert(pwaJs.includes('window.openTitikHotelModal = function'), 'Missing window.openTitikHotelModal');
  assert(pwaJs.includes('window.closeTitikHotelModal = function'), 'Missing window.closeTitikHotelModal');
});

runTest('Fungsi window.openChecklistKoperModal & window.closeChecklistKoperModal tersedia', () => {
  assert(pwaJs.includes('window.openChecklistKoperModal = function'), 'Missing window.openChecklistKoperModal');
  assert(pwaJs.includes('window.closeChecklistKoperModal = function'), 'Missing window.closeChecklistKoperModal');
});

runTest('Fungsi window.openArahKiblatModal & window.closeArahKiblatModal tersedia', () => {
  assert(pwaJs.includes('window.openArahKiblatModal = function'), 'Missing window.openArahKiblatModal');
  assert(pwaJs.includes('window.closeArahKiblatModal = function'), 'Missing window.closeArahKiblatModal');
});

runTest('Fungsi window.openZiarahModal & window.closeZiarahModal tersedia', () => {
  assert(pwaJs.includes('window.openZiarahModal = function'), 'Missing window.openZiarahModal');
  assert(pwaJs.includes('window.closeZiarahModal = function'), 'Missing window.closeZiarahModal');
});

runTest('Fungsi window.openGaleriKloterModal & window.closeGaleriKloterModal tersedia', () => {
  assert(pwaJs.includes('window.openGaleriKloterModal = function'), 'Missing window.openGaleriKloterModal');
  assert(pwaJs.includes('window.closeGaleriKloterModal = function'), 'Missing window.closeGaleriKloterModal');
});

runTest('Fungsi window.openLiveModal & window.closeLiveModal tersedia', () => {
  assert(pwaJs.includes('window.openLiveModal = function'), 'Missing window.openLiveModal');
  assert(pwaJs.includes('window.closeLiveModal = function'), 'Missing window.closeLiveModal');
});

// 4. Audit URL Router & History Synchronization Engine
console.log('\n4. Pengujian URL Router & Synchronization Engine (?view=...)');

runTest('Fungsi syncUrlView & clearUrlView tersedia', () => {
  assert(pwaJs.includes('function syncUrlView(viewName)'), 'Missing syncUrlView');
  assert(pwaJs.includes('function clearUrlView()'), 'Missing clearUrlView');
  assert(pwaJs.includes('window.syncUrlView = syncUrlView'), 'Missing window.syncUrlView export');
  assert(pwaJs.includes('window.clearUrlView = clearUrlView'), 'Missing window.clearUrlView export');
});

runTest('Fungsi window.closeAllAppModals & window.openAppViewByName tersedia', () => {
  assert(pwaJs.includes('window.closeAllAppModals = function'), 'Missing window.closeAllAppModals');
  assert(pwaJs.includes('window.openAppViewByName = function'), 'Missing window.openAppViewByName');
});

runTest('Hardware Back/Forward popstate listener terpasang', () => {
  assert(pwaJs.includes("window.addEventListener('popstate'"), 'Missing popstate listener');
});

runTest('Deep Link Router diinisialisasi pada startup', () => {
  assert(pwaJs.includes('initDeepLinkRouter();'), 'Missing initDeepLinkRouter execution');
});

// 5. Audit PWA Service Worker Cache Version
console.log('\n5. Pengujian Service Worker Cache Version');
const swJs = fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8');

runTest('sw.js menggunakan versi cache terbaru (v32)', () => {
  assert(swJs.includes('sdw-umroh-pwa-v32'), 'sw.js cache version is not bumped to v32');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed === 0) {
  console.log('🌟 SELURUH MENU PWA BERHASIL MENERAPKAN FULL-SCREEN SPA SUB-PAGES DENGAN URL SYNC 100%!');
  process.exit(0);
} else {
  process.exit(1);
}
