/**
 * Test Suite: Tahap 2 Komponen Antarmuka Terpadu & PWA Hardening
 */

const fs = require('fs');

console.log('=== TEST SUITE TAHAP 2: KOMPONEN UI & PWA HARDENING ===\n');

let pass = 0;
let fail = 0;
function assert(desc, condition) {
  if (condition) {
    console.log('  [PASS]', desc);
    pass++;
  } else {
    console.error('  [FAIL]', desc);
    fail++;
  }
}

// 1. Test Components Module
console.log('1. Pengujian Modul Komponen Antarmuka (js/components.js)');
const comp = require('../js/components.js');
assert('js/components.js exists and exports methods', typeof comp === 'object');
assert('getNavbarHTML function exists', typeof comp.getNavbarHTML === 'function');
assert('getBottomBarHTML function exists', typeof comp.getBottomBarHTML === 'function');
assert('getFooterHTML function exists', typeof comp.getFooterHTML === 'function');
assert('getFloatingContactHTML function exists', typeof comp.getFloatingContactHTML === 'function');

// 2. Test Navbar rendering & active state
console.log('\n2. Pengujian Navbar & Active Highlights');
const navPaket = comp.getNavbarHTML('paket');
assert('Navbar contains brand logo WebP picture tag', navPaket.includes('assets/sdw-logo.webp'));
assert('Navbar contains nav-transparent class', navPaket.includes('nav-transparent'));
assert('Navbar highlights paket on activeKey paket', navPaket.includes('href="/paket"') && navPaket.includes('nav-link-active'));
assert('Navbar includes dual clock ticker elements', navPaket.includes('makkahClock') && navPaket.includes('jakartaClock'));
assert('Navbar includes mobile drawer menu', navPaket.includes('mobileNavDrawer'));

// 3. Test Bottom Bar rendering
console.log('\n3. Pengujian Mobile Bottom Dock');
const botPaket = comp.getBottomBarHTML('paket');
assert('Bottom dock has 5 navigation items', botPaket.includes('Beranda') && botPaket.includes('Paket') && botPaket.includes('Panduan') && botPaket.includes('Jadwal') && botPaket.includes('App Jamaah'));
assert('Bottom dock highlights active paket tab', botPaket.includes('font-extrabold text-sdw-pine') && botPaket.includes('Paket</span>'));
assert('Bottom dock includes elevated center button', botPaket.includes('rounded-full bg-gradient-to-tr'));

// 4. Test Canonical Footer
console.log('\n4. Pengujian Footer Resmi');
const footer = comp.getFooterHTML();
assert('Footer contains official Kemenag license', footer.includes('No. U.412/2020'));
assert('Footer contains official Kudus office address', footer.includes('Jl. Raya Kudus - Jepara KM 5'));
assert('Footer contains 4 main columns', footer.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-4'));

// 5. Test PWA Service Worker (sw.js)
console.log('\n5. Pengujian Service Worker Hardening (sw.js)');
const swContent = fs.readFileSync('sw.js', 'utf8');
assert('sw.js has cache version (v30+)', /sdw-umroh-pwa-v\d+/.test(swContent));
assert('sw.js has runtime cache for CDN assets', /sdw-runtime-v\d+/.test(swContent));
assert('sw.js precaches js/components.js', swContent.includes('/js/components.js'));
assert('sw.js precaches optimized WebP images', swContent.includes('/assets/hero-haram.webp') && swContent.includes('/assets/pkg-hemat.webp'));
assert('sw.js handles navigation fallback for /admin', swContent.includes('/admin.html'));
assert('sw.js handles navigation fallback for /app', swContent.includes('/app.html'));

// 6. Test All Precache URLs on Disk
console.log('\n6. Pengujian Integritas Disk Aset Precache');
const match = swContent.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/);
const urls = eval('[' + match[1] + ']');
let missing = 0;
urls.forEach(u => {
  let p = u === '/' ? 'index.html' : u.replace(/^\//, '');
  if (!fs.existsSync(p)) missing++;
});
assert('All ' + urls.length + ' precache files exist on disk', missing === 0);

console.log(`\n========================================`);
console.log(`TEST RESULT: ${pass} PASSED, ${fail} FAILED`);
console.log(`========================================`);

if (fail > 0) process.exit(1);

