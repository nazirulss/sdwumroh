const fs = require('fs');
const code = fs.readFileSync('backend/Code.gs', 'utf8');
const lines = code.split('\n');
const actions = [];
lines.forEach((l, i) => {
  const m = l.match(/action\s*===?\s*['"]([^'"]+)['"]/g);
  if (m) {
    m.forEach(str => {
      const act = str.replace(/action\s*===?\s*['"]/, '').replace(/['"]$/, '');
      actions.push({ line: i + 1, action: act });
    });
  }
});
console.log('Total actions:', actions.length);
actions.forEach(a => console.log(`${a.line}: ${a.action}`));
