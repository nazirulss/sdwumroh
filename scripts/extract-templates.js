const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract mainNavbar
const navStart = indexHtml.indexOf('<nav id="mainNavbar"');
const navEnd = indexHtml.indexOf('</nav>', navStart) + 6;
const navHtml = indexHtml.slice(navStart, navEnd);

// Extract mobileBottomBar
const botStart = indexHtml.indexOf('<nav id="mobileBottomBar"');
const botEnd = indexHtml.indexOf('</nav>', botStart) + 6;
const botHtml = indexHtml.slice(botStart, botEnd);

// Extract footer
const footStart = indexHtml.indexOf('<footer');
const footEnd = indexHtml.indexOf('</footer>', footStart) + 9;
const footHtml = indexHtml.slice(footStart, footEnd);

console.log('mainNavbar length:', navHtml.length);
console.log('mobileBottomBar length:', botHtml.length);
console.log('footer length:', footHtml.length);

fs.writeFileSync('scripts/nav-template.html', navHtml, 'utf8');
fs.writeFileSync('scripts/bottom-template.html', botHtml, 'utf8');
fs.writeFileSync('scripts/footer-template.html', footHtml, 'utf8');

console.log('Templates saved to scripts/ for inspection.');

