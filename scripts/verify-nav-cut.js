const fs = require('fs');

const publicFiles = [
  'index.html', 'hotel.html', 'jadwal.html',
  'kalkulator.html', 'ziarah.html', 'tentang.html', 'faq.html',
  'koper.html', 'kiblat.html', 'galeri.html', 'live.html'
];

publicFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const navRegex = /<nav id="mainNavbar"[\s\S]*?<div id="mobileNavDrawer"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const match = content.match(navRegex);
  if (match) {
    const afterIndex = match.index + match[0].length;
    const nextChars = content.substring(afterIndex, afterIndex + 120).trim();
    console.log(`=== ${file} ===\nNext: ${nextChars.split('\n')[0]}\n`);
  }
});

