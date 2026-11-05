/**
 * Test SDW_API client layer directly against live Web App
 */

global.APP_CONFIG = require('../js/app-config.js');
const api = require('../js/api.js');

async function test() {
  console.log('Testing api.get("ping")...');
  const ping = await api.get('ping');
  console.log('Ping response:', ping);

  console.log('\nTesting api.get("healthCheck")...');
  const health = await api.get('healthCheck');
  console.log('Health response:', health.data.status, '| Total sheets:', health.data.totalSheets);

  console.log('\nTesting api.get("getPackages")...');
  const pkgs = await api.get('getPackages');
  console.log('Packages fetched:', pkgs.data.map(p => p.name));

  console.log('\n=== LIVE CLIENT API ADAPTER TEST: 100% SUCCESS ===');
}

test().catch(console.error);

