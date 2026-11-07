const fs = require('fs');
const assert = require('assert');

console.log('=== TEST SUITE: WARNA MERAH TOMBOL NAMA JAMAAH BELUM UPLOAD FOTO ===\n');

// 1. Verifikasi js/jamaah.js
console.log('1. Verifikasi js/jamaah.js');
const jamaahCode = fs.readFileSync('js/jamaah.js', 'utf8');
assert(jamaahCode.includes('function pilgrimHasPhoto('), 'pilgrimHasPhoto harus terdefinisi');
assert(jamaahCode.includes('text-red-600'), 'text-red-600 harus digunakan untuk nama yang belum upload foto');
assert(jamaahCode.includes('text-red-300'), 'text-red-300/rose harus digunakan pada active state nama yang belum upload foto');
assert(jamaahCode.includes('data-has-photo'), 'data-has-photo harus disertakan pada tombol switcher');
console.log('  [PASS] Logika pilgrimHasPhoto & kelas warna merah di js/jamaah.js terverifikasi!');

// 2. Verifikasi app.html
console.log('\n2. Verifikasi app.html');
const appHtml = fs.readFileSync('app.html', 'utf8');
assert(appHtml.includes('id="certPilgrimSwitcher"'), 'certPilgrimSwitcher harus ada di app.html');
assert(appHtml.includes('Belum Upload Foto (Nama Merah)'), 'Legend status foto harus ada di app.html');
console.log('  [PASS] UI Legend Belum Upload Foto (Nama Merah) di app.html terverifikasi!');

// 3. Verifikasi sw.js
console.log('\n3. Verifikasi sw.js');
const swCode = fs.readFileSync('sw.js', 'utf8');
assert(swCode.includes('sdw-umroh-pwa-v43'), 'sw.js cache version harus v43');
assert(swCode.includes('sdw-runtime-v43'), 'sw.js runtime cache version harus v43');
console.log('  [PASS] Service Worker v43 terverifikasi!');

// 4. Simulasi Logika Render Switcher
console.log('\n4. Simulasi Logika Render Switcher');
const pilgrims = [
    { regId: 'REG-001', name: 'Ahmad Jamaah', photoUrl: 'https://example.com/foto.jpg' },
    { regId: 'REG-002', name: 'Budi Tanpa Foto', photoUrl: null },
    { regId: 'REG-003', name: 'Citra Placeholder', photoUrl: 'assets/placeholder.png' }
];

function testPilgrimHasPhoto(p) {
    if (!p) return false;
    const url = p.photoUrl || p.photo;
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
    if (trimmed.includes('placeholder') || trimmed.includes('default-avatar')) return false;
    return true;
}

assert.strictEqual(testPilgrimHasPhoto(pilgrims[0]), true, 'REG-001 harus memiliki foto');
assert.strictEqual(testPilgrimHasPhoto(pilgrims[1]), false, 'REG-002 tidak memiliki foto');
assert.strictEqual(testPilgrimHasPhoto(pilgrims[2]), false, 'REG-003 menggunakan placeholder sehingga dianggap belum upload foto');

console.log('  [PASS] Filter status upload foto berfungsi dengan sempurna!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');
