const fs = require('fs');

const publicFiles = [
  { file: 'index.html', key: 'beranda', transparent: true },
  { file: 'paket.html', key: 'paket', transparent: false },
  { file: 'hotel.html', key: 'hotel', transparent: false },
  { file: 'jadwal.html', key: 'jadwal', transparent: false },
  { file: 'kalkulator.html', key: 'kalkulator', transparent: false },
  { file: 'ziarah.html', key: 'ziarah', transparent: false },
  { file: 'tentang.html', key: 'tentang', transparent: false },
  { file: 'faq.html', key: 'faq', transparent: false },
  { file: 'koper.html', key: 'koper', transparent: false },
  { file: 'kiblat.html', key: 'kiblat', transparent: false },
  { file: 'galeri.html', key: 'galeri', transparent: false },
  { file: 'live.html', key: 'live', transparent: false }
];

publicFiles.forEach(({ file, key, transparent }) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check Nav + Drawer pattern
  // Matches from <nav id="mainNavbar" or <!-- ===... NAV ... === --> to end of mobileNavDrawer
  const navMatch = content.match(/<nav id="mainNavbar"[\s\S]*?<div id="mobileNavDrawer"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  
  // Check Footer pattern
  const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);
  
  // Check Bottom bar pattern
  const bottomMatch = content.match(/<nav id="mobileBottomBar"[\s\S]*?<\/nav>/);
  
  console.log(`${file.padEnd(16)}: navMatch=${Boolean(navMatch)}, footerMatch=${Boolean(footerMatch)}, bottomMatch=${Boolean(bottomMatch)}`);
});

