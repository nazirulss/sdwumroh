/**
 * Proper redirect handling for Google Apps Script Web App POST
 */
const https = require('https');

const DEPLOYMENT_ID = 'AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs';
const BASE_URL = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;

function postToGas(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(BASE_URL, options, (res) => {
      if (res.statusCode === 302 && res.headers.location) {
        // When GAS redirects 302, follow with GET to the location URL
        https.get(res.headers.location, (redirectRes) => {
          let body = '';
          redirectRes.on('data', chunk => body += chunk);
          redirectRes.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              resolve({ raw: body, error: e.message });
            }
          });
        }).on('error', reject);
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body, error: e.message, status: res.statusCode });
          }
        });
      }
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testAuth() {
  console.log('Testing Staff Login via POST...');
  const res = await postToGas({
    action: 'loginStaff',
    identifier: 'admin@sdwumroh.com',
    password: 'admin123',
    actor: 'TEST_SUITE'
  });
  console.log('Login Result:', JSON.stringify(res, null, 2));

  console.log('\nTesting Pilgrim Login via POST...');
  const pRes = await postToGas({
    action: 'loginPilgrim',
    phone: '89653887640',
    actor: 'TEST_SUITE'
  });
  console.log('Pilgrim Result:', JSON.stringify(pRes, null, 2));
}

testAuth();
