const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const idx = content.indexOf('id="tab-audit"');
console.log(content.substring(idx, idx + 1400));

