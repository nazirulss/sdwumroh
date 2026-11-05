const fs = require('fs');
const content = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

function getSlice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

console.log('escapeHtml to numberToWords (lines 80-110):');
console.log(lines[79], '...', lines[109]);

console.log('STORAGE_KEYS (lines 32-48):');
console.log(lines[31], '...', lines[47]);

console.log('ADMIN_PERMISSIONS (lines 112-123):');
console.log(lines[111], '...', lines[122]);
