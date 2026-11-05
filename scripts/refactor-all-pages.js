const fs = require('fs');

const pages = [
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

let totalLinesRemoved = 0;

pages.forEach(({ file, key, transparent }) => {
  let content = fs.readFileSync(file, 'utf8');
  const originalLineCount = content.split(/\r?\n/).length;

  let lines = content.split(/\r?\n/);

  // 1. REFACTOR NAVBAR + MOBILE DRAWER (if not yet refactored)
  let navStartIdx = -1;
  let drawerStartIdx = -1;
  let drawerEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="mainNavbar"')) {
      navStartIdx = i;
      // Include preceding comment if any
      if (i > 0 && lines[i - 1].includes('<!--') && (lines[i - 1].includes('NAV') || lines[i - 1].includes('HEADER'))) {
        navStartIdx = i - 1;
      }
      break;
    }
  }

  if (navStartIdx !== -1) {
    for (let i = navStartIdx; i < lines.length; i++) {
      if (lines[i].includes('id="mobileNavDrawer"')) {
        drawerStartIdx = i;
        break;
      }
    }

    if (drawerStartIdx !== -1) {
      let openDivs = 0;
      for (let i = drawerStartIdx; i < lines.length; i++) {
        const l = lines[i];
        const opens = (l.match(/<div\b/g) || []).length;
        const closes = (l.match(/<\/div>/g) || []).length;
        openDivs += opens - closes;
        if (openDivs === 0) {
          drawerEndIdx = i;
          break;
        }
      }
    }

    if (navStartIdx !== -1 && drawerEndIdx !== -1) {
      const headerReplacement = [
        '    <!-- ==================== UNIVERSAL NAVIGATION HEADER ==================== -->',
        `    <header id="app-header" data-active="${key}"${transparent ? ' data-transparent="true"' : ''}></header>`
      ];
      lines.splice(navStartIdx, (drawerEndIdx - navStartIdx + 1), ...headerReplacement);
    }
  }

  // 2. REFACTOR FOOTER
  let footerStartIdx = -1;
  let footerEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<footer') && !lines[i].includes('id="app-footer"')) {
      footerStartIdx = i;
      // Include preceding comment if any
      if (i > 0 && lines[i - 1].includes('<!--') && lines[i - 1].includes('FOOTER')) {
        footerStartIdx = i - 1;
      }
      break;
    }
  }

  if (footerStartIdx !== -1) {
    for (let i = footerStartIdx; i < lines.length; i++) {
      if (lines[i].includes('</footer>')) {
        footerEndIdx = i;
        break;
      }
    }

    if (footerEndIdx !== -1) {
      const footerReplacement = [
        '    <!-- ==================== UNIVERSAL FOOTER ==================== -->',
        '    <footer id="app-footer"></footer>'
      ];
      lines.splice(footerStartIdx, (footerEndIdx - footerStartIdx + 1), ...footerReplacement);
    }
  }

  // 3. REFACTOR FLOATING WHATSAPP BUTTON (if standalone in HTML)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('hidden lg:flex fixed bottom-6 right-6') || lines[i].includes('Tanya Kami di WhatsApp')) {
      let aStart = i;
      if (i > 0 && lines[i - 1].includes('<!--') && lines[i - 1].includes('FLOATING WHATSAPP')) {
        aStart = i - 1;
      }
      let aEnd = i;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes('</a>')) {
          aEnd = j;
          break;
        }
      }
      const floatingReplacement = [
        '    <!-- ==================== FLOATING CONTACT ==================== -->',
        '    <div id="app-floating-contact"></div>'
      ];
      lines.splice(aStart, (aEnd - aStart + 1), ...floatingReplacement);
      break;
    }
  }

  // 4. REFACTOR BOTTOM BAR
  let bottomStartIdx = -1;
  let bottomEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="mobileBottomBar"')) {
      bottomStartIdx = i;
      // Include preceding comment if any
      if (i > 0 && lines[i - 1].includes('<!--') && (lines[i - 1].includes('BOTTOM') || lines[i - 1].includes('ASNAWIYYAH'))) {
        bottomStartIdx = i - 1;
      }
      break;
    }
  }

  if (bottomStartIdx !== -1) {
    for (let i = bottomStartIdx; i < lines.length; i++) {
      if (lines[i].includes('</nav>')) {
        bottomEndIdx = i;
        break;
      }
    }

    if (bottomEndIdx !== -1) {
      // If page didn't have a footer previously, insert footer before bottom bar
      const hasFooter = lines.some(l => l.includes('id="app-footer"'));
      const bottomReplacement = [];
      if (!hasFooter) {
        bottomReplacement.push('    <!-- ==================== UNIVERSAL FOOTER ==================== -->');
        bottomReplacement.push('    <footer id="app-footer"></footer>');
        bottomReplacement.push('');
      }
      bottomReplacement.push('    <!-- ==================== NATIVE MOBILE BOTTOM NAVIGATION BAR ==================== -->');
      bottomReplacement.push(`    <div id="app-bottom-bar" data-active="${key}"></div>`);

      lines.splice(bottomStartIdx, (bottomEndIdx - bottomStartIdx + 1), ...bottomReplacement);
    }
  }

  // 5. ENSURE components.js SCRIPT IS INCLUDED
  let newContent = lines.join('\n');
  if (!newContent.includes('js/components.js')) {
    newContent = newContent.replace('</body>', '    <script src="js/components.js?v=2.7.0"></script>\n</body>');
  }

  const finalLineCount = newContent.split(/\r?\n/).length;
  const linesSaved = originalLineCount - finalLineCount;
  totalLinesRemoved += linesSaved;

  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`[DONE] ${file.padEnd(16)}: ${originalLineCount} -> ${finalLineCount} lines (Saved ${linesSaved} lines)`);
});

console.log(`\n================================================================`);
console.log(`TOTAL CODE ELIMINATED: ${totalLinesRemoved} LINES OF REDUNDANT HTML!`);
console.log(`================================================================\n`);

