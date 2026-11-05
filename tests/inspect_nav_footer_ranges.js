const fs = require('fs');

const files = ['index.html', 'paket.html', 'hotel.html', 'jadwal.html', 'kalkulator.html', 'ziarah.html', 'tentang.html', 'faq.html', 'koper.html', 'kiblat.html', 'galeri.html', 'live.html', 'app.html'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  
  let navStart = -1, navEnd = -1;
  let bottomStart = -1, bottomEnd = -1;
  let footerStart = -1, footerEnd = -1;
  
  lines.forEach((l, i) => {
    if (l.includes('<nav id="mainNavbar"') || (navStart === -1 && l.includes('<nav') && !l.includes('mobileBottomBar'))) {
      if (navStart === -1) navStart = i + 1;
    }
    if (navStart !== -1 && navEnd === -1 && l.includes('</nav>')) {
      navEnd = i + 1;
    }
    if (l.includes('id="mobileBottomBar"') || (l.includes('fixed bottom-0') && l.includes('<nav'))) {
      if (bottomStart === -1) bottomStart = i + 1;
    }
    if (bottomStart !== -1 && bottomEnd === -1 && l.includes('</nav>')) {
      bottomEnd = i + 1;
    }
    if (l.includes('<footer')) {
      if (footerStart === -1) footerStart = i + 1;
    }
    if (footerStart !== -1 && footerEnd === -1 && l.includes('</footer>')) {
      footerEnd = i + 1;
    }
  });

  console.log(`${f.padEnd(16)} | Nav: ${navStart}-${navEnd} | Bottom: ${bottomStart}-${bottomEnd} | Footer: ${footerStart}-${footerEnd}`);
});

