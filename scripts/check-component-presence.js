const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log('--- COMPONENT PRESENCE ACROSS HTML PAGES ---');
files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const hasNav = c.includes('id="mainNavbar"');
  const hasBottom = c.includes('id="mobileBottomBar"');
  const hasFooter = c.includes('<footer');
  console.log(`${f.padEnd(20)} | mainNav: ${hasNav} | bottomBar: ${hasBottom} | footer: ${hasFooter}`);
});

