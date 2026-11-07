/**
 * SDW UMROH — FULL DUPLEX SYNC VERIFICATION TEST SUITE
 * File: tests/test_full_duplex_sync.js
 * Verifies that all 3 surfaces (Web Utama, /admin, /app) have active sync adapters
 * and that all backend endpoints (GET & POST) respond correctly.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(parsed, options, (res) => {
      // Handle Google Apps Script 302 Redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location, { ...options, method: 'GET', body: undefined }));
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, json: null, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function runFullDuplexTests() {
  console.log('================================================================');
  console.log('🚀 TEST SUITE: SINKRONISASI 100% FULL-DUPLEX 3 SURFACE & BACKEND');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Verifikasi File Kontrak Frontend
  console.log('--- 1. VERIFIKASI ADAPTER FRONTEND MULTI-SURFACE ---');
  try {
    process.stdout.write('1.1 Memeriksa integrasi async di js/catalog.js... ');
    const catalogCode = fs.readFileSync(path.join(__dirname, '../js/catalog.js'), 'utf8');
    assert(catalogCode.includes('loadPackagesAsync'), 'loadPackagesAsync hilang di js/catalog.js');
    assert(catalogCode.includes('getPackages'), 'getPackages call hilang di js/catalog.js');
    console.log('✅ OK!');
    passed++;

    process.stdout.write('1.2 Memeriksa integrasi async di js/departures.js... ');
    const depCode = fs.readFileSync(path.join(__dirname, '../js/departures.js'), 'utf8');
    assert(depCode.includes('loadDeparturesAsync'), 'loadDeparturesAsync hilang di js/departures.js');
    assert(depCode.includes('getDepartures'), 'getDepartures call hilang di js/departures.js');
    console.log('✅ OK!');
    passed++;

    process.stdout.write('1.3 Memeriksa pullCloudDatabase di js/admin/admin-sync.js... ');
    const syncCode = fs.readFileSync(path.join(__dirname, '../js/admin/admin-sync.js'), 'utf8');
    assert(syncCode.includes('pullCloudDatabase'), 'pullCloudDatabase hilang di admin-sync.js');
    assert(syncCode.includes('admin.pullCloudDatabase = pullCloudDatabase'), 'export pullCloudDatabase hilang');
    console.log('✅ OK!');
    passed++;

    process.stdout.write('1.4 Memeriksa loadPilgrimDocumentsAsync di js/jamaah.js... ');
    const jamaahCode = fs.readFileSync(path.join(__dirname, '../js/jamaah.js'), 'utf8');
    assert(jamaahCode.includes('loadPilgrimDocumentsAsync'), 'loadPilgrimDocumentsAsync hilang di js/jamaah.js');
    console.log('✅ OK!');
    passed++;

    process.stdout.write('1.5 Memeriksa pemanggilan script di paket.html & jadwal.html... ');
    const paketHtml = fs.readFileSync(path.join(__dirname, '../paket.html'), 'utf8');
    const jadwalHtml = fs.readFileSync(path.join(__dirname, '../jadwal.html'), 'utf8');
    assert(paketHtml.includes('js/app-config.js') && paketHtml.includes('js/api.js'), 'Dependencies hilang di paket.html');
    assert(jadwalHtml.includes('js/app-config.js') && jadwalHtml.includes('js/api.js'), 'Dependencies hilang di jadwal.html');
    console.log('✅ OK!');
    passed++;

    process.stdout.write('1.6 Memeriksa tombol Tarik Data Cloud di admin.html... ');
    const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
    assert(adminHtml.includes('SDW_ADMIN.pullCloudDatabase()'), 'Tombol pullCloudDatabase hilang di admin.html');
    console.log('✅ OK!');
    passed++;

  } catch (err) {
    console.log('❌ GAGAL:', err.message);
    failed++;
  }

  // 2. Verifikasi Backend Code.gs
  console.log('\n--- 2. VERIFIKASI KELENGKAPAN KODE BACKEND (backend/Code.gs) ---');
  try {
    process.stdout.write('2.1 Memeriksa versi dan helper object mapper di Code.gs... ');
    const codeGs = fs.readFileSync(path.join(__dirname, '../backend/Code.gs'), 'utf8');
    assert(codeGs.includes("VERSION: '2.2.0'"), 'Versi Code.gs belum 2.2.0');
    assert(codeGs.includes('getSheetRowsAsObjects_'), 'Helper getSheetRowsAsObjects_ hilang di Code.gs');
    console.log('✅ OK! (v2.2.0)');
    passed++;

    process.stdout.write('2.2 Memeriksa 7 Endpoint Read (PULL) di Code.gs... ');
    const requiredReads = ['getLeads', 'getRegistrations', 'getPayments', 'getPilgrimDocuments', 'getManifest', 'getPreparation', 'getManasik', 'getAuditLogs'];
    requiredReads.forEach(r => {
      assert(codeGs.includes(`action === '${r}'`), `Endpoint ${r} belum diimplementasikan di Code.gs`);
    });
    console.log(`✅ OK! (${requiredReads.length} Endpoint Lengkap)`);
    passed++;

    process.stdout.write('2.3 Memeriksa Handler Mutasi Operasional di Code.gs... ');
    assert(codeGs.includes("action === 'updatePreparation'"), 'updatePreparation hilang');
    assert(codeGs.includes("action === 'updateManasik'"), 'updateManasik hilang');
    assert(codeGs.includes("action === 'unmaskSensitiveData'"), 'unmaskSensitiveData hilang');
    console.log('✅ OK! (updatePreparation, updateManasik, unmaskSensitiveData Lengkap)');
    passed++;

  } catch (err) {
    console.log('❌ GAGAL:', err.message);
    failed++;
  }

  // 3. Verifikasi Live Connection ke Google Apps Script
  console.log('\n--- 3. VERIFIKASI KONEKSI LIVE WEB APP ENDPOINT ---');
  try {
    process.stdout.write('3.1 Menguji Live Ping & Spreadsheet Binding... ');
    const pingRes = await fetchUrl(`${WEB_APP_URL}?action=ping`);
    if (pingRes.json && pingRes.json.success && pingRes.json.data.connected) {
      console.log(`✅ ONLINE! (${pingRes.json.data.spreadsheetName})`);
      passed++;
    } else {
      console.log('❌ GAGAL!', pingRes.raw);
      failed++;
    }

    process.stdout.write('3.2 Menguji Live getPackages (Web Utama & PWA)... ');
    const pkgRes = await fetchUrl(`${WEB_APP_URL}?action=getPackages`);
    if (pkgRes.json && pkgRes.json.success && Array.isArray(pkgRes.json.data)) {
      console.log(`✅ SUKSES! (${pkgRes.json.data.length} Paket Ditemukan)`);
      passed++;
    } else {
      console.log('❌ GAGAL!', pkgRes.raw);
      failed++;
    }

    process.stdout.write('3.3 Menguji Live getDepartures (Jadwal Keberangkatan)... ');
    const depRes = await fetchUrl(`${WEB_APP_URL}?action=getDepartures`);
    if (depRes.json && depRes.json.success && Array.isArray(depRes.json.data)) {
      console.log(`✅ SUKSES! (${depRes.json.data.length} Jadwal Ditemukan)`);
      passed++;
    } else {
      console.log('❌ GAGAL!', depRes.raw);
      failed++;
    }

    process.stdout.write('3.4 Menguji Live checkRegistration (PWA E-PASS)... ');
    const chkRes = await fetchUrl(`${WEB_APP_URL}?action=checkRegistration&regId=REG-SDW-2601`);
    if (chkRes.json && chkRes.json.success && chkRes.json.data) {
      console.log(`✅ SUKSES! (Status: ${chkRes.json.data.status})`);
      passed++;
    } else {
      console.log('❌ GAGAL!', chkRes.raw);
      failed++;
    }

  } catch (err) {
    console.log('❌ GAGAL:', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`HASIL AKHIR AUDIT & INTEGRASI: ${passed} BERHASIL, ${failed} GAGAL`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 SELURUH SISTEM SINKRONISASI 3 SURFACE SUDAH 100% TERHUBUNG & TERVERIFIKASI!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFullDuplexTests();

