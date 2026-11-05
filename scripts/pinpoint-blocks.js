const fs = require('fs');

const publicFiles = [
  'index.html', 'paket.html', 'hotel.html', 'jadwal.html',
  'kalkulator.html', 'ziarah.html', 'tentang.html', 'faq.html',
  'koper.html', 'kiblat.html', 'galeri.html', 'live.html'
];

publicFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let navStart = -1, navEnd = -1;
  let drawerStart = -1, drawerEnd = -1;
  let bottomStart = -1, bottomEnd = -1;
  let footerStart = -1, footerEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('<nav id="mainNavbar"') && navStart === -1) {
      navStart = i;
    }
    if (navStart !== -1 && navEnd === -1 && l.includes('</nav>')) {
      navEnd = i;
    }
    if (l.includes('<div id="mobileNavDrawer"') && drawerStart === -1) {
      drawerStart = i;
    }
    if (drawerStart !== -1 && drawerEnd === -1) {
      // Find matching closing div for mobileNavDrawer
      // Or check next comment / section
      if (lines[i].includes('<!-- ==================== PAGE HERO') || 
          lines[i].includes('<!-- PAGE HERO') ||
          lines[i].includes('<!-- HERO') ||
          lines[i].includes('<header class="pt-') ||
          lines[i].includes('<section class="pt-') ||
          lines[i].includes('<main') ||
          lines[i].includes('<!-- MAIN CONTENT') ||
          lines[i].includes('<!-- ==================== MAIN CONTENT')) {
        drawerEnd = i - 1;
      }
    }
    if (l.includes('<nav id="mobileBottomBar"') && bottomStart === -1) {
      bottomStart = i;
    }
    if (bottomStart !== -1 && bottomEnd === -1 && l.includes('</nav>')) {
      bottomEnd = i;
    }
    if ((l.includes('<footer id="globalFooter"') || (l.includes('<footer') && !l.includes('class="'))) && footerStart === -1) {
      footerStart = i;
    } else if (l.includes('<footer') && footerStart === -1) {
      footerStart = i;
    }
    if (footerStart !== -1 && footerEnd === -1 && l.includes('</footer>')) {
      footerEnd = i;
    }
  }

  console.log(`${file.padEnd(16)}: nav=${navStart+1}..${navEnd+1}, drawer=${drawerStart+1}..${drawerEnd+1}, footer=${footerStart+1}..${footerEnd+1}, bottom=${bottomStart+1}..${bottomEnd+1}`);
});

