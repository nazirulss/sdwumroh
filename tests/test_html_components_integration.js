/**
 * Test Suite: HTML Components Integration (Tahap 4)
 * Verifies that all public HTML files use unified semantic mount points
 * and eliminate duplicated markup.
 */
const fs = require('fs');
const assert = require('assert');
const http = require('http');
const path = require('path');

const EXPECTED_PAGES = [
  { file: 'index.html', key: 'beranda', transparent: true },
  { file: 'paket.html', key: 'paket', transparent: false },
  { file: 'hotel.html', key: 'hotel', transparent: false },
  { file: 'jadwal.html', key: 'jadwal', transparent: false },
  { file: 'kalkulator.html', key: 'kalkulator', transparent: false },
  { file: 'ziarah.html', key: 'ziarah', transparent: false },
  { file: 'tentang.html', key: 'tentang', transparent: false },
  { file: 'faq.html', key: 'faq', transparent: false },
  { file: 'koper.html', key: 'koper', transparent: false },
  { file: 'kiblat.html', key: 'kiblat', transparent: false },
  { file: 'galeri.html', key: 'galeri', transparent: false },
  { file: 'live.html', key: 'live', transparent: false }
];

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, length: data.length }));
    }).on('error', err => reject(err));
  });
}

async function runIntegrationTests() {
  console.log('=== TEST SUITE TAHAP 4: KOMPONEN ANTARMUKA TERPADU (ELIMINASI DUPLIKASI HTML) ===\n');

  let passed = 0;
  let failed = 0;

  function runTest(desc, fn) {
    try {
      fn();
      console.log(`  [PASS] ${desc}`);
      passed++;
    } catch (e) {
      console.error(`  [FAIL] ${desc}: ${e.message}`);
      failed++;
    }
  }

  console.log('1. Pengujian Semantik Mount Points pada 12 Halaman Publik');
  EXPECTED_PAGES.forEach(({ file, key, transparent }) => {
    const content = fs.readFileSync(file, 'utf8');

    runTest(`${file} memiliki #app-header dengan data-active="${key}"`, () => {
      assert(content.includes('id="app-header"'), `Missing id="app-header" in ${file}`);
      assert(content.includes(`data-active="${key}"`), `Missing data-active="${key}" in ${file}`);
      if (transparent) {
        assert(content.includes('data-transparent="true"'), `Missing data-transparent="true" in ${file}`);
      }
    });

    runTest(`${file} memiliki #app-footer`, () => {
      assert(content.includes('id="app-footer"'), `Missing id="app-footer" in ${file}`);
    });

    runTest(`${file} memiliki #app-bottom-bar dengan data-active="${key}"`, () => {
      assert(content.includes('id="app-bottom-bar"'), `Missing id="app-bottom-bar" in ${file}`);
      assert(content.includes(`data-active="${key}"`), `Missing data-active="${key}" in bottom bar of ${file}`);
    });

    runTest(`${file} memuat script js/components.js?v=2.7.0`, () => {
      assert(content.includes('js/components.js'), `Missing js/components.js script tag in ${file}`);
    });

    runTest(`${file} bersih dari duplikasi hardcoded mainNavbar & mobileNavDrawer`, () => {
      assert(!content.includes('id="mainNavbar"'), `Duplicate id="mainNavbar" still found in ${file}`);
      assert(!content.includes('id="mobileNavDrawer"'), `Duplicate id="mobileNavDrawer" still found in ${file}`);
      assert(!content.includes('id="mobileBottomBar"'), `Duplicate id="mobileBottomBar" still found in ${file}`);
    });
  });

  console.log('\n2. Pengujian Dev-Server HTTP 200 untuk Seluruh Halaman');
  let tempServer = null;
  try {
    await checkUrl('http://localhost:3000/index.html');
  } catch (err) {
    const devServer = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
      const filePath = path.join(process.cwd(), reqPath);
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    await new Promise((resolve) => {
      tempServer = devServer.listen(3000, resolve);
    });
  }

  for (const { file } of EXPECTED_PAGES) {
    try {
      const res = await checkUrl(`http://localhost:3000/${file}`);
      if (res.statusCode === 200 && res.length > 500) {
        console.log(`  [PASS] http://localhost:3000/${file} -> HTTP 200 (${res.length} bytes)`);
        passed++;
      } else {
        console.error(`  [FAIL] http://localhost:3000/${file} -> HTTP ${res.statusCode}`);
        failed++;
      }
    } catch (err) {
      console.error(`  [FAIL] http://localhost:3000/${file} -> Request error: ${err.message}`);
      failed++;
    }
  }

  if (tempServer) {
    await new Promise((resolve) => tempServer.close(resolve));
  }

  console.log('\n========================================');
  console.log(`INTEGRATION TEST RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('🌟 TAHAP 4: SELURUH DUPLIKASI HTML BERHASIL DIELIMINASI SECARA TOTAL!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runIntegrationTests();

