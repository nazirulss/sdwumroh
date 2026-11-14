const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const item of list) {
        if (item === '.git' || item === 'node_modules' || item === 'brain') continue;
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results = results.concat(walk(full));
        } else if (stat.isFile()) {
            const ext = path.extname(full).toLowerCase();
            if (['.html', '.js', '.gs', '.json'].includes(ext)) {
                results.push(full);
            }
        }
    }
    return results;
}

const allFiles = walk('.');
console.log(`Scanning ${allFiles.length} files...`);

// 1. Check for free image hosts
const suspiciousDomains = [
    'ibb.co',
    'imgbb',
    'postimg',
    'imgur.com',
    'cloudinary.com',
    'unsplash.com',
    'placeholder.com',
    'placehold.co',
    'via.placeholder',
    'picsum.photos',
    'freepik.com',
    'pixabay.com'
];

let suspiciousMatches = [];
let googleDriveMatches = [];
let cdnLibraries = [];

allFiles.forEach(file => {
    if (file.includes('audit_external_assets.js')) return;
    const text = fs.readFileSync(file, 'utf8');
    suspiciousDomains.forEach(dom => {
        if (text.toLowerCase().includes(dom)) {
            suspiciousMatches.push({ file, domain: dom });
        }
    });

    if (text.includes('drive.google.com') || text.includes('googleusercontent.com')) {
        googleDriveMatches.push(file);
    }

    // Match all http/https CDNs
    const lines = text.split('\n');
    lines.forEach((l, idx) => {
        if (l.includes('https://cdnjs.cloudflare.com') || l.includes('https://cdn.') || l.includes('https://unpkg.com') || l.includes('https://fonts.googleapis.com')) {
            cdnLibraries.push({ file, line: idx + 1, text: l.trim() });
        }
    });
});

console.log('\n=== 1. SUSPICIOUS FREE IMAGE HOSTS ===');
if (suspiciousMatches.length === 0) {
    console.log('✓ CLEAN: Tidak ditemukan domain host gambar gratis pihak ketiga (ibb.co, imgbb, imgur, dll)');
} else {
    console.log('FOUND:', suspiciousMatches);
}

console.log('\n=== 2. GOOGLE DRIVE ASSETS USAGE ===');
console.log(`Ditemukan referensi Google Drive pada ${googleDriveMatches.length} file:`);
googleDriveMatches.forEach(f => console.log(' - ' + f));

console.log('\n=== 3. CDN LIBRARIES (SCRIPTS / STYLES) ===');
console.log(`Ditemukan ${cdnLibraries.length} pemanggilan CDN:`);
const uniqueCDNs = [...new Set(cdnLibraries.map(c => c.text))];
uniqueCDNs.forEach(c => console.log(' - ' + c));
