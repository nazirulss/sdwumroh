const fs = require('fs');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const report = {};
htmlFiles.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    const links = [];
    const scripts = [];
    const linkRegex = /<link[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    const scriptRegex = /<script[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let m;
    while ((m = linkRegex.exec(text)) !== null) links.push(m[1]);
    while ((m = scriptRegex.exec(text)) !== null) scripts.push(m[1]);
    report[f] = { links, scripts };
});
console.log(JSON.stringify(report, null, 2));
