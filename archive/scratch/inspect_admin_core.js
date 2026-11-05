const fs = require('fs');

const content = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('// =') || trimmed.startsWith('/* =') || trimmed.includes('MODULE') || trimmed.includes('FASE') || trimmed.includes('SECTION')) {
    if (trimmed.length > 5 && trimmed.length < 90) {
      console.log(`Line ${i + 1}: ${trimmed}`);
    }
  }
});
