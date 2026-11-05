const fs = require('fs');
const content = fs.readFileSync('backend/Code.gs', 'utf8');
const lines = content.split('\n');
const sheets = new Set();
lines.forEach(l => {
  const idx = l.indexOf('getSheetByName(');
  if (idx !== -1) {
    const sub = l.substring(idx + 15);
    const quote = sub[0];
    if (quote === "'" || quote === '"') {
      const end = sub.indexOf(quote, 1);
      if (end !== -1) sheets.add(sub.substring(1, end));
    }
  }
});
console.log('Sheets accessed in backend/Code.gs:', [...sheets]);

// Search for any SHEET constants or table definitions
const idxConf = content.indexOf('const SHEETS');
if (idxConf !== -1) {
  console.log(content.substring(idxConf, idxConf + 800));
}

// Search for setup or init functions
const setupMatches = content.match(/function (setup[A-Za-z0-9_]*|init[A-Za-z0-9_]*)/g);
console.log('Setup/init functions:', setupMatches);

