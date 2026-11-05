/**
 * Test Live Sync Verification
 * Verifies live connection to Google Apps Script Web App and Google Sheets SDW_UMROH_Database
 */
const https = require('https');
const http = require('http');

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyjLYnPyTR8l7eB6zRdxpFwtMZ0wd2iBI97pBS7cVWIm0Cs3BJB9mTvJ4G4R_GFFDvU/exec';

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

async function runLiveVerification() {
  console.log('================================================================');
  console.log('🚀 MEMULAI UJI KONEKSI SINKRONISASI LIVE GOOGLE APPS SCRIPT');
  console.log(`Endpoint: ${WEB_APP_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Ping & System Info
  try {
    process.stdout.write('1. Menguji Ping & Metadata Endpoint... ');
    const res = await fetchUrl(`${WEB_APP_URL}?action=ping`);
    if (res.json && res.json.success && res.json.data.connected) {
      console.log('✅ SUKSES!');
      console.log('   - Versi API       :', res.json.metadata.version);
      console.log('   - Nama Database   :', res.json.data.spreadsheetName);
      console.log('   - Spreadsheet ID  :', res.json.data.spreadsheetId);
      console.log('   - Status          :', res.json.data.status);
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  // TEST 2: Health Check 22 Sheet Master
  try {
    process.stdout.write('\n2. Menguji Health Check Ke-22 Sheet Master... ');
    const res = await fetchUrl(`${WEB_APP_URL}?action=healthCheck`);
    if (res.json && res.json.success) {
      const total = res.json.data.totalSheets;
      console.log(`✅ SUKSES! (${total} Sheets Terdeteksi)`);
      console.log('   - Status Audit    :', res.json.data.status);
      console.log('   - Daftar Sheet    :', res.json.data.sheets.slice(0, 8).join(', ') + ` ... (+${total - 8} sheet lainnya)`);
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  // TEST 3: Get Packages Seed Data
  try {
    process.stdout.write('\n3. Menguji Query Live DB_Packages... ');
    const res = await fetchUrl(`${WEB_APP_URL}?action=getPackages`);
    if (res.json && res.json.success && Array.isArray(res.json.data) && res.json.data.length > 0) {
      console.log(`✅ SUKSES! (${res.json.data.length} Paket Ditemukan)`);
      res.json.data.forEach((p, idx) => {
        console.log(`   [${idx + 1}] ${p.name || p.id} (${p.package_type || p.status || '-'})`);
      });
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  // TEST 4: Get Departures Seed Data
  try {
    process.stdout.write('\n4. Menguji Query Live DB_Departures... ');
    const res = await fetchUrl(`${WEB_APP_URL}?action=getDepartures`);
    if (res.json && res.json.success && Array.isArray(res.json.data) && res.json.data.length > 0) {
      console.log(`✅ SUKSES! (${res.json.data.length} Jadwal Keberangkatan Ditemukan)`);
      res.json.data.forEach((d, idx) => {
        console.log(`   [${idx + 1}] ID: ${d.id} | Maskapai: ${d.airline} | Tanggal: ${String(d.departure_date).substring(0, 10)} | Sisa Kuota: ${d.capacity_booked}/${d.capacity_total}`);
      });
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  // TEST 5: Check Specific Registration
  try {
    process.stdout.write('\n5. Menguji Query Detail Pendaftaran (REG-SDW-2701)... ');
    const res = await fetchUrl(`${WEB_APP_URL}?action=checkRegistration&regId=REG-SDW-2701`);
    if (res.json && res.json.success && res.json.data) {
      console.log('✅ SUKSES!');
      console.log('   - No Registrasi   :', res.json.data.id);
      console.log('   - Customer ID     :', res.json.data.customer_id);
      console.log('   - Tipe Kamar      :', res.json.data.room_type);
      console.log('   - Harga Disepakati:', 'Rp ' + Number(res.json.data.final_price_snapshot || 0).toLocaleString('id-ID'));
      console.log('   - Status          :', res.json.data.status);
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  // TEST 6: Test Mutation via POST (Create Lead CRM)
  try {
    process.stdout.write('\n6. Menguji Mutasi Data Live 2-Arah (POST createLead)... ');
    const leadPayload = JSON.stringify({
      action: 'createLead',
      lead: {
        customerId: 'CUS-TEST-' + Math.floor(Math.random() * 9000 + 1000),
        name: 'Bpk. Hendra Gunawan (Verifikasi Live AI)',
        source: 'LIVE_VERIFICATION_TEST',
        urgency: 'HIGH',
        budget: 'Rp 45jt',
        notes: 'Lead otomatis hasil verifikasi sinkronisasi 2-arah pada ' + new Date().toLocaleString('id-ID')
      },
      actor: 'AI_VERIFIER'
    });

    const res = await fetchUrl(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: leadPayload
    });

    if (res.json && res.json.success) {
      console.log('✅ SUKSES!');
      console.log('   - ID Prospek Baru :', res.json.data ? res.json.data.id : 'OK');
      console.log('   - Entity Tersimpan:', res.json.data ? res.json.data.entity : 'DB_Leads');
      console.log('   - Status Input    :', res.json.data ? res.json.data.status : 'OK');
      passed++;
    } else {
      console.log('❌ GAGAL!', res.json || res.raw);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR:', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`HASIL AKHIR VERIFIKASI: ${passed}/6 PENGUJIAN BERHASIL (${failed} GAGAL)`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🌟 KONEKSI LIVE DATABASE GOOGLE SHEETS & APPS SCRIPT 100% SEMPURNA!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLiveVerification();
