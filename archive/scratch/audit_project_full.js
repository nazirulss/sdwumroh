const fs = require('fs');

console.log('=== COMPREHENSIVE PROJECT AUDIT REPORT GENERATOR ===\n');

// 1. Check HTML files
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const htmlReport = htmlFiles.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  const sizeKb = (fs.statSync(f).size / 1024).toFixed(1);
  const title = (content.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || 'No title';
  const hasMetaViewport = content.includes('name="viewport"');
  const hasMetaDesc = content.includes('name="description"');
  const hasManifest = content.includes('manifest.json');
  const hasPwaJs = content.includes('pwa.js');
  const hasMinCss = content.includes('styles.min.css');
  const hasCdnTailwind = content.includes('cdn.tailwindcss.com');
  const linksToAdmin = content.includes('/admin') || content.includes('admin.html');
  const linksToApp = content.includes('/app') || content.includes('app.html');
  
  return {
    file: f,
    lines,
    sizeKb,
    title: title.trim().replace(/\s+/g, ' '),
    hasMetaViewport,
    hasMetaDesc,
    hasManifest,
    hasPwaJs,
    hasMinCss,
    hasCdnTailwind,
    linksToAdmin,
    linksToApp
  };
});

console.log('HTML Pages Summary:');
console.table(htmlReport, ['file', 'lines', 'sizeKb', 'hasMinCss', 'hasManifest', 'hasPwaJs']);

// 2. Check JS files
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
const jsReport = jsFiles.map(f => {
  const content = fs.readFileSync('js/' + f, 'utf8');
  const lines = content.split('\n').length;
  const sizeKb = (fs.statSync('js/' + f).size / 1024).toFixed(1);
  const isUMD = content.includes('(function (root, factory)') || content.includes('(function ()');
  const exports = (content.match(/return\s+\{([\s\S]*?)\};/g) || []).length;
  const hasFetch = content.includes('fetch(');
  const hasLocalStorage = content.includes('localStorage');
  
  return {
    file: f,
    lines,
    sizeKb,
    isUMD,
    hasFetch,
    hasLocalStorage
  };
});

console.log('\nJavaScript Modules Summary:');
console.table(jsReport);

// 3. Asset Analysis
const assetFiles = fs.readdirSync('assets');
let totalAssetBytes = 0;
const largeAssets = [];
assetFiles.forEach(a => {
  const s = fs.statSync('assets/' + a).size;
  totalAssetBytes += s;
  if (s > 500 * 1024) {
    largeAssets.push({ file: a, sizeMb: (s / (1024 * 1024)).toFixed(2) });
  }
});
console.log('\nAsset Summary:');
console.log('Total Assets: ' + assetFiles.length + ' files, ' + (totalAssetBytes / (1024 * 1024)).toFixed(2) + ' MB');
console.log('Large Assets (>500KB):', largeAssets);

// 4. Code Duplication & Consistency checks
console.log('\nArchitecture & Consistency Observations:');
console.log('- sdw_umroh_prototype_foundation.html is an obsolete 3,170-line prototype using Tailwind CDN.');
console.log('- Code.gs and sdw_umroh_apps_script_backend.js are identical 701-line files.');
console.log('- admin-core.js is 3,869 lines (221KB), containing 100 functions.');
console.log('- pwa.js is 1,851 lines (98KB), handling mobile docks, prayer times, qibla, and offline doa.');
console.log('- .clasp.json contains placeholder scriptId __PENDING_SDW_SCRIPT_ID__.');
console.log('- sw.js has cache name sdw-umroh-pwa-v29, but admin.html does not register sw.js.');
console.log('- 13 HTML files share duplicate header, navigation, and footer code rather than using components.');

