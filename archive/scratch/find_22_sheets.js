const fs = require('fs');
const path = require('path');

function search22(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.git') {
      search22(full);
    } else if (f.endsWith('.md') || f.endsWith('.js') || f.endsWith('.html') || f.endsWith('.gs')) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('22 Sheet') || txt.includes('22 sheet') || txt.includes('22 tabel') || txt.includes('22 Tabel')) {
        console.log('Found in:', full);
        const lines = txt.split('\n');
        lines.forEach((l, idx) => {
          if (l.includes('22 Sheet') || l.includes('22 sheet') || l.includes('22 tabel') || l.includes('22 Tabel')) {
            console.log(`  L${idx+1}: ${l.trim()}`);
          }
        });
      }
    }
  });
}

search22('.');

