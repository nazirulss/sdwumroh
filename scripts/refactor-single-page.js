const fs = require('fs');

function refactorPaket() {
  let content = fs.readFileSync('paket.html', 'utf8');

  // 1. Replace Navigation + Mobile Drawer
  const navDrawerPattern = /<!-- ==================== UNIVERSAL NAVIGATION HEADER[\s\S]*?<!-- ==================== PAGE HERO BANNER/;
  if (!navDrawerPattern.test(content)) {
    console.error('navDrawerPattern not matched in paket.html');
    return false;
  }
  content = content.replace(navDrawerPattern, `<!-- ==================== UNIVERSAL NAVIGATION HEADER ==================== -->\n    <header id="app-header" data-active="paket"></header>\n\n    <!-- ==================== PAGE HERO BANNER`);

  // 2. Replace Footer
  const footerPattern = /<!-- ==================== UNIVERSAL FOOTER[\s\S]*?<\/footer>/;
  if (!footerPattern.test(content)) {
    console.error('footerPattern not matched in paket.html');
    return false;
  }
  content = content.replace(footerPattern, `<!-- ==================== UNIVERSAL FOOTER ==================== -->\n    <footer id="app-footer"></footer>`);

  // 3. Replace Bottom Bar
  const bottomBarPattern = /<!-- ==================== NATIVE MOBILE BOTTOM NAVIGATION BAR[\s\S]*?<\/nav>/;
  if (!bottomBarPattern.test(content)) {
    console.error('bottomBarPattern not matched in paket.html');
    return false;
  }
  content = content.replace(bottomBarPattern, `<!-- ==================== NATIVE MOBILE BOTTOM NAVIGATION BAR ==================== -->\n    <div id="app-bottom-bar" data-active="paket"></div>`);

  // 4. Add components.js script before </body>
  if (!content.includes('js/components.js')) {
    content = content.replace('</body>', '    <script src="js/components.js?v=2.7.0"></script>\n</body>');
  }

  fs.writeFileSync('paket.html', content, 'utf8');
  console.log('paket.html successfully refactored!');
  return true;
}

refactorPaket();

