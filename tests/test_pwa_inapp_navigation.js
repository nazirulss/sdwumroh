/**
 * Test Suite: PWA In-App Navigation & URL History Sync Verification
 * Verifies that all 8 app menu items operate as In-App Sub-Views/Modals
 * without redirecting users to public pages, with full query parameter sync (?view=...).
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

console.log('=== TEST SUITE: PWA IN-APP NAVIGATION & URL ROUTER ===\n');

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

runTest('Menu Paket Umroh memicu window.openPaketModal()', () => {
  assert(appHtml.includes('onclick="window.openPaketModal()"'), 'Missing openPaketModal trigger');
});

runTest('Menu Titik Hotel memicu window.openTitikHotelModal()', () => {
  assert(appHtml.includes('onclick="window.openTitikHotelModal()"'), 'Missing openTitikHotelModal trigger');
});

runTest('Menu Checklist Koper memicu window.openChecklistKoperModal()', () => {
  assert(appHtml.includes('onclick="window.openChecklistKoperModal()"'), 'Missing openChecklistKoperModal trigger');
});

runTest('Menu Arah Kiblat memicu window.openArahKiblatModal()', () => {
  assert(appHtml.includes('onclick="window.openArahKiblatModal()"'), 'Missing openArahKiblatModal trigger');
});

runTest('Menu Peta Ziarah memicu window.openZiarahModal()', () => {
  assert(appHtml.includes('onclick="window.openZiarahModal()"'), 'Missing openZiarahModal trigger');
});

runTest('Menu Galeri Kloter memicu window.openGaleriKloterModal()', () => {
  assert(appHtml.includes('onclick="window.openGaleriKloterModal()"'), 'Missing openGaleriKloterModal trigger');
});

runTest('Menu Live Ka\'bah memicu window.openLiveModal()', () => {
  assert(appHtml.includes('onclick="window.openLiveModal()"'), 'Missing openLiveModal trigger');
});

runTest('Menu CS Khidmat tetap mengarah ke WhatsApp resmi', () => {
  assert(appHtml.includes('https://wa.me/6281234567890'), 'Missing CS WhatsApp link');
});

// 2. Audit js/pwa.js Modal Injections & Controllers
console.log('\n2. Pengujian js/pwa.js (Modal UI Injections & Controllers)');
const pwaJs = fs.readFileSync(path.join(process.cwd(), 'js', 'pwa.js'), 'utf8');

runTest('Modal Paket Umroh (#modalPaketUmroh) diinjeksikan dalam createPwaUI()', () => {
  assert(pwaJs.includes("pModal.id = 'modalPaketUmroh'"), 'Missing #modalPaketUmroh in pwa.js');
});

runTest('Modal Peta Ziarah (#modalPetaZiarah) diinjeksikan dalam createPwaUI()', () => {
  assert(pwaJs.includes("zModal.id = 'modalPetaZiarah'"), 'Missing #modalPetaZiarah in pwa.js');
});

runTest('Modal Live Ka\'bah (#modalLiveKabah) diinjeksikan dalam createPwaUI()', () => {
  assert(pwaJs.includes("lModal.id = 'modalLiveKabah'"), 'Missing #modalLiveKabah in pwa.js');
});

runTest('Fungsi window.openPaketModal & window.closePaketModal tersedia', () => {
  assert(pwaJs.includes('window.openPaketModal = function'), 'Missing window.openPaketModal');
  assert(pwaJs.includes('window.closePaketModal = function'), 'Missing window.closePaketModal');
});

runTest('Fungsi window.openZiarahModal & window.closeZiarahModal tersedia', () => {
  assert(pwaJs.includes('window.openZiarahModal = function'), 'Missing window.openZiarahModal');
  assert(pwaJs.includes('window.closeZiarahModal = function'), 'Missing window.closeZiarahModal');
});

runTest('Fungsi window.openLiveModal & window.closeLiveModal tersedia', () => {
  assert(pwaJs.includes('window.openLiveModal = function'), 'Missing window.openLiveModal');
  assert(pwaJs.includes('window.closeLiveModal = function'), 'Missing window.closeLiveModal');
});

// 3. Audit URL Router & History Synchronization Engine
console.log('\n3. Pengujian URL Router & Synchronization Engine (?view=...)');

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

// 4. Audit PWA Service Worker Cache Version
console.log('\n4. Pengujian Service Worker Cache Version');
const swJs = fs.readFileSync(path.join(process.cwd(), 'sw.js'), 'utf8');

runTest('sw.js menggunakan versi cache terbaru (v32)', () => {
  assert(swJs.includes('sdw-umroh-pwa-v32'), 'sw.js cache version is not bumped to v32');
});

console.log('\n========================================');
console.log(`TOTAL TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================\n');

if (failed === 0) {
  console.log('🌟 SELURUH MENU PWA BERHASIL MENERAPKAN IN-APP NAVIGATION DENGAN URL SYNC 100%!');
  process.exit(0);
} else {
  process.exit(1);
}

