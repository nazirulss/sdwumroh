const fs = require('fs');

const content = fs.readFileSync('app.html', 'utf8');
const lines = content.split(/\r?\n/);

console.log('=== AUDIT APP.HTML TABS & NAVIGATION ===\n');

// 1. Sidebar items
console.log('--- Sidebar / Desktop Navigation ---');
lines.forEach((l, idx) => {
  if (l.includes('data-perm-tab') || l.includes('switchAppTab')) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});

// 2. Tab Views (Main content containers)
console.log('\n--- Tab View Containers (id="tab-...") ---');
lines.forEach((l, idx) => {
  if (l.includes('id="tab-') || (l.includes('id="view-'))) {
    console.log(`Line ${idx + 1}: ${l.trim()}`);
  }
});

// 3. Mobile Bottom Navigation
console.log('\n--- Mobile Bottom Navigation (#mobile-bottom-nav) ---');
let inBottomNav = false;
lines.forEach((l, idx) => {
  if (l.includes('id="mobile-bottom-nav"')) inBottomNav = true;
  if (inBottomNav) {
    if (l.includes('<a ') || l.includes('<button ') || l.includes('onclick=') || l.includes('href=')) {
      console.log(`Line ${idx + 1}: ${l.trim()}`);
    }
    if (l.includes('</nav>')) inBottomNav = false;
  }
});

// 4. Modals in app.html
console.log('\n--- Modals in app.html ---');
lines.forEach((l, idx) => {
  if (l.includes('-modal') || l.includes('Modal')) {
    if (l.includes('id="')) {
      console.log(`Line ${idx + 1}: ${l.trim()}`);
    }
  }
});

