const fs = require('fs');

const files = [
  'index.html', 'paket.html', 'hotel.html', 'jadwal.html',
  'kalkulator.html', 'ziarah.html', 'tentang.html', 'faq.html',
  'koper.html', 'kiblat.html', 'galeri.html', 'live.html', 'app.html'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`=== ${file} (${content.split('\n').length} lines) ===`);
  
  const hasMainNavbar = content.includes('id="mainNavbar"');
  const hasMobileDrawer = content.includes('id="mobileNavDrawer"');
  const hasBottomBar = content.includes('id="mobileBottomBar"');
  const hasFooter = content.includes('<footer');
  const hasComponentsJs = content.includes('js/components.js');
  const hasAppHeader = content.includes('id="app-header"');
  const hasAppFooter = content.includes('id="app-footer"');
  const hasAppBottom = content.includes('id="app-bottom-bar"');
  
  console.log(`  mainNavbar: ${hasMainNavbar} | mobileDrawer: ${hasMobileDrawer} | bottomBar: ${hasBottomBar} | footer: ${hasFooter}`);
  console.log(`  app-header: ${hasAppHeader} | app-bottom-bar: ${hasAppBottom} | app-footer: ${hasAppFooter} | components.js: ${hasComponentsJs}`);
});

