const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const idx = content.indexOf('audit-filter-action');
console.log(content.substring(idx - 100, idx + 800));

