const fs = require('fs');

const publicFiles = [
  'index.html', 'hotel.html', 'jadwal.html',
  'kalkulator.html', 'ziarah.html', 'tentang.html', 'faq.html',
  'koper.html', 'kiblat.html', 'galeri.html', 'live.html'
];

publicFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  
  let drawerLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="mobileNavDrawer"')) {
      drawerLine = i;
      break;
    }
  }

  // Count open and close divs from drawerLine
  let openDivs = 0;
  let endDrawerLine = -1;
  for (let i = drawerLine; i < lines.length; i++) {
    const l = lines[i];
    const opens = (l.match(/<div\b/g) || []).length;
    const closes = (l.match(/<\/div>/g) || []).length;
    openDivs += opens - closes;
    if (openDivs === 0) {
      endDrawerLine = i;
      break;
    }
  }

  let nextContent = '';
  for (let j = endDrawerLine + 1; j < endDrawerLine + 6; j++) {
    if (lines[j] && lines[j].trim()) {
      nextContent = lines[j].trim();
      break;
    }
  }

  console.log(`${file.padEnd(16)}: drawer starts at ${drawerLine+1}, ends at ${endDrawerLine+1}`);
  console.log(`   Next non-empty: ${nextContent}`);
});
