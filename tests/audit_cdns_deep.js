const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const results = {};

files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const scripts = [];
    const styles = [];
    const preconnects = [];

    const scriptRegex = /<script[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let m;
    while ((m = scriptRegex.exec(content)) !== null) {
        scripts.push(m[1]);
    }

    const linkRegex = /<link[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    while ((m = linkRegex.exec(content)) !== null) {
        if (m[0].includes('rel="preconnect"') || m[0].includes("rel='preconnect'")) {
            preconnects.push(m[1]);
        } else if (m[0].includes('rel="canonical"') || m[0].includes("rel='canonical'")) {
            // canonical link, ignore
        } else {
            styles.push(m[1]);
        }
    }

    results[f] = { scripts, styles, preconnects };
});

console.log(JSON.stringify(results, null, 2));
