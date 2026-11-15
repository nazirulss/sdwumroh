/**
 * tests/test_live_backend_modular_and_auth.js
 * Verifies that the deployed modular backend @51 responds correctly to ping, auth, and data queries.
 */
const https = require('https');

const DEPLOYMENT_ID = 'AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs';
const BASE_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return resolve(fetchJson(res.headers.location, options));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, error: e.message, status: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING LIVE MODULAR BACKEND (@51) ===');

  // 1. Ping
  console.log('\n1. Testing Ping...');
  const pingRes = await fetchJson(`${BASE_URL}?action=ping`);
  console.log('Ping Result:', JSON.stringify(pingRes, null, 2));

  // 2. Upgrade Users & RBAC Schema
  console.log('\n2. Triggering upgradeUsersSchema to ensure DB_Users has password_hash & salt...');
  const upgradeRes = await fetchJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { action: 'upgradeUsersSchema', actor: 'TEST_SUITE' }
  });
  console.log('Upgrade Users Schema Result:', JSON.stringify(upgradeRes, null, 2));

  // 3. Get Users
  console.log('\n3. Fetching DB_Users...');
  const usersRes = await fetchJson(`${BASE_URL}?action=getUsers`);
  console.log(`Fetched ${usersRes.data ? usersRes.data.length : 0} users.`);
  if (usersRes.data && usersRes.data.length > 0) {
    console.log('Sample user (passwords stripped):', usersRes.data[0]);
  }

  // 4. Test Staff Login with Admin
  console.log('\n4. Testing Staff Login (admin@sdwumroh.com)...');
  const staffLoginRes = await fetchJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'loginStaff',
      identifier: 'admin@sdwumroh.com',
      password: 'admin123',
      actor: 'TEST_SUITE'
    }
  });
  console.log('Staff Login Result:', JSON.stringify(staffLoginRes, null, 2));

  // 5. Test Pilgrim Login (with existing phone or NIK)
  console.log('\n5. Testing Pilgrim Login...');
  const pilgrimLoginRes = await fetchJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'loginPilgrim',
      phone: '89653887640',
      actor: 'TEST_SUITE'
    }
  });
  console.log('Pilgrim Login Result:', JSON.stringify(pilgrimLoginRes, null, 2));

  // 6. Test Pilgrim Attempting Staff Login (Must be blocked)
  console.log('\n6. Testing Pilgrim attempting to login as Staff in Portal Admin (Should be redirected/blocked)...');
  const blockedPilgrimRes = await fetchJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      action: 'loginStaff',
      identifier: 'nazirulmuhammad1992@gr',
      password: 'admin123',
      actor: 'TEST_SUITE'
    }
  });
  console.log('Blocked Pilgrim Result:', JSON.stringify(blockedPilgrimRes, null, 2));

  console.log('\n=== LIVE TEST SUITE COMPLETED ===');
}

runTests().catch(err => console.error('Fatal test error:', err));
