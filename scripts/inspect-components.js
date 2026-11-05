const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

console.log('--- FINDING HEADER ---');
const headerIdx = indexHtml.indexOf('<header');
const headerEnd = indexHtml.indexOf('</header>');
if (headerIdx !== -1 && headerEnd !== -1) {
  console.log('Header length:', headerEnd + 9 - headerIdx);
  console.log(indexHtml.slice(headerIdx, headerIdx + 400));
}

console.log('\n--- FINDING NAV & FLOATING DOCK ---');
const navMatches = indexHtml.match(/<nav[\s\S]*?<\/nav>/gi) || [];
console.log('Found <nav> blocks:', navMatches.length);
navMatches.forEach((n, i) => {
  console.log(`Nav ${i+1} [length ${n.length}]: ${n.slice(0, 150).replace(/\s+/g, ' ')}...`);
});

console.log('\n--- FINDING FOOTER ---');
const footerIdx = indexHtml.indexOf('<footer');
const footerEnd = indexHtml.indexOf('</footer>');
if (footerIdx !== -1 && footerEnd !== -1) {
  console.log('Footer length:', footerEnd + 9 - footerIdx);
  console.log(indexHtml.slice(footerIdx, footerIdx + 400));
}

console.log('\n--- HOW IS PWA BOTTOM DOCK GENERATED? ---');
const pwaJs = fs.readFileSync('js/pwa.js', 'utf8');
const dockInPwa = pwaJs.includes('dock') || pwaJs.includes('bottom');
console.log('Does js/pwa.js render a dock dynamically?', dockInPwa);
if (dockInPwa) {
  const dockLines = pwaJs.split('\n').filter(l => l.includes('dock') || l.includes('Bottom Navigation') || l.includes('floating'));
  console.log('Sample dock lines in pwa.js:', dockLines.slice(0, 5));
}

