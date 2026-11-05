const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('sdw-tab-nav') && l.includes('class=')) {
    console.log(`L${idx+1}: ${l}`);
    for (let i = idx; i < idx + 20 && i < lines.length; i++) {
      console.log(lines[i]);
    }
  }
});

