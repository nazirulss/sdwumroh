const https = require('https');

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';

function makeRequest(url, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {}
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      // Follow redirect (GAS returns 302 with Location header)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // GAS redirect to script.googleusercontent.com must be followed with GET
        return makeRequest(res.headers.location, 'GET', null).then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Quick Login Admin (admin@sdwumroh.com) ===');
  let res1 = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'quickLoginByEmail',
    email: 'admin@sdwumroh.com'
  }));
  console.log('Result 1:', res1.status, JSON.stringify(res1.data || res1.raw, null, 2));

  console.log('\n=== TEST 2: Quick Login Operations (ops@sdwumroh.com) ===');
  let res2 = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'quickLoginByEmail',
    email: 'ops@sdwumroh.com'
  }));
  console.log('Result 2:', res2.status, JSON.stringify(res2.data || res2.raw, null, 2));

  console.log('\n=== TEST 3: Quick Login Unregistered (hacker@bad.com) ===');
  let res3 = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'quickLoginByEmail',
    email: 'hacker@bad.com'
  }));
  console.log('Result 3:', res3.status, JSON.stringify(res3.data || res3.raw, null, 2));

  console.log('\n=== TEST 4: Send Login OTP (admin@sdwumroh.com) ===');
  let res4 = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'sendLoginOtp',
    email: 'admin@sdwumroh.com'
  }));
  console.log('Result 4:', res4.status, JSON.stringify(res4.data || res4.raw, null, 2));

  console.log('\n=== TEST 5: Verify Login OTP with Master Test Bypass (888999) ===');
  let res5 = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'verifyLoginOtp',
    email: 'admin@sdwumroh.com',
    otp: '888999'
  }));
  console.log('Result 5:', res5.status, JSON.stringify(res5.data || res5.raw, null, 2));
}

runTests().catch(console.error);
