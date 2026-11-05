const fs = require('fs');

['index.html', 'paket.html', 'hotel.html', 'jadwal.html', 'faq.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const scripts = c.match(/<script[\s\S]*?<\/script>/gi) || [];
  console.log(`=== ${f} (${scripts.length} scripts) ===`);
  scripts.forEach(s => {
    const srcMatch = s.match(/src=["']([^"']+)["']/i);
    if (srcMatch) console.log('  src: ' + srcMatch[1]);
  });
});

