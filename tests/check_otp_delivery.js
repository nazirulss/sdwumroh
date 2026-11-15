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
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
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

async function check() {
  console.log('--- 1. Testing sendLoginOtp for adminkhodim@gmail.com ---');
  const res = await makeRequest(SCRIPT_URL, 'POST', JSON.stringify({
    action: 'sendLoginOtp',
    email: 'adminkhodim@gmail.com'
  }));
  console.log('Result for adminkhodim@gmail.com:\n', JSON.stringify(res, null, 2));

  console.log('\n--- 2. Checking DB_Users content ---');
  const resUsers = await makeRequest(SCRIPT_URL + '?action=getUsersList');
  console.log('Users list status:', resUsers.status);
  if (resUsers.data && resUsers.data.data) {
    console.log('Users count:', resUsers.data.data.length);
    console.log('Emails in DB_Users:');
    resUsers.data.data.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.role} | ${u.status}`));
  } else {
    console.log('Raw:', resUsers);
  }
}

check().catch(console.error);
