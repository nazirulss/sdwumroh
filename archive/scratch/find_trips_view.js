const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const idx = content.indexOf('id="subtab-trips-view"');
console.log(content.substring(idx, idx + 1000));

