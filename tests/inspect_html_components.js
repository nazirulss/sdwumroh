const fs = require('fs');

const files = [
  'index.html', 'paket.html', 'hotel.html', 'koper.html', 'kiblat.html',
  'galeri.html', 'live.html', 'jadwal.html', 'kalkulator.html', 'ziarah.html',
  'tentang.html', 'faq.html', 'app.html'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const hasNav = content.includes('id="mainNavbar"') || content.includes('<nav');
    const hasBottom = content.includes('id="mobileBottomBar"') || content.includes('fixed bottom-0');
    const hasFooter = content.includes('id="globalFooter"') || content.includes('<footer');
    const hasCompScript = content.includes('js/components.js');
    console.log(f.padEnd(16), 'Nav:', hasNav, 'Bottom:', hasBottom, 'Footer:', hasFooter, 'Script:', hasCompScript, 'Lines:', content.split('\n').length);
  }
});

