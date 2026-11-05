/**
 * Test Live POST syncBatch to deployed Google Apps Script Web App
 */

const https = require('https');

const postData = JSON.stringify({
  action: 'syncBatch',
  tenantId: 'sdw_umroh',
  actor: 'Antigravity Test Agent',
  mutations: [
    {
      id: 'MUT-LIVE-' + Date.now(),
      action: 'createLead',
      entity: 'DB_Leads',
      payload: {
        id: 'LED-0099',
        customerId: 'CUS-LIVE-TEST',
        name: 'H. Bambang Hermanto',
        source: 'LIVE_API_VERIFICATION',
        owner: 'Staf Operasional',
        status: 'NEW',
        urgency: 'HIGH',
        budget: 'Rp 45jt',
        notes: 'Uji integrasi live dua arah Google Sheets API v2.1.0'
      }
    }
  ]
});

const url = new URL('https://script.google.com/macros/s/AKfycbyjLYnPyTR8l7eB6zRdxpFwtMZ0wd2iBI97pBS7cVWIm0Cs3BJB9mTvJ4G4R_GFFDvU/exec');

function postWithRedirect(targetUrl, payload, method = 'POST') {
  const req = https.request(targetUrl, {
    method: method,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    console.log('Status code:', res.statusCode);
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Following 302 redirect...');
      // Google Apps Script redirects POST to GET on script.googleusercontent.com
      https.get(res.headers.location, (redirectRes) => {
        let body = '';
        redirectRes.on('data', d => body += d);
        redirectRes.on('end', () => {
          try {
            console.log('Live Batch Result:', JSON.stringify(JSON.parse(body), null, 2));
          } catch(e) {
            console.log('Raw body:', body);
          }
        });
      });
      return;
    }

    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      try {
        console.log('Result:', JSON.stringify(JSON.parse(data), null, 2));
      } catch (e) {
        console.log('Raw:', data);
      }
    });
  });

  req.on('error', err => console.error('Error:', err));
  req.write(payload);
  req.end();
}

console.log('Sending live POST to Google Apps Script Web App...');
postWithRedirect(url, postData);

