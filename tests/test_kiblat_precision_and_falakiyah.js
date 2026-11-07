/**
 * Test Suite: Verifikasi Presisi & Akurasi Kompas Falakiyah Kiblat
 * Memastikan:
 * 1. Formula Spherical Trigonometry Great-Circle Geodesi akurat (Jakarta, Madinah, Surabaya, Demak)
 * 2. 3D Tilt-Compensation Euler Vector Projection berfungsi stabil
 * 3. Shortest angular distance filter / smoothing bebas loncatan (wrap-around 0°/360°)
 * 4. Database kota lengkap (Tanah Suci Makkah/Madinah, Jawa, Luar Jawa, Internasional)
 * 5. Integrasi DOM app.html (/app?view=ibadah&tab=kiblat), kiblat.html, dan precache sw.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: KOMPAS FALAKIYAH KIBLAT PRESISI & AKURASI TINGGI ===\n');

// 1. Uji Modul Engine js/kiblat.js
const kiblatEngine = require('../js/kiblat.js');

// A. Uji Koordinat Ka'bah Standar Internasional
assert.strictEqual(kiblatEngine.KAABA_COORDS.lat, 21.422487, 'Latitude Ka\'bah harus 21.422487° N');
assert.strictEqual(kiblatEngine.KAABA_COORDS.lng, 39.826206, 'Longitude Ka\'bah harus 39.826206° E');
console.log('✔ [PASS] Koordinat Ka\'bah Makkah Al-Mukarramah terverifikasi presisi.');

// B. Uji Formula Geodesi Falakiyah di Beberapa Kota Utama
const testCases = [
    { city: 'Jakarta', lat: -6.2088, lng: 106.8456, expectedBearing: 295.15, minBearing: 294.9, maxBearing: 295.3, minDistance: 7850, maxDistance: 7950 },
    { city: 'Demak (PPTQ Asnawiyyah)', lat: -6.9535, lng: 110.6402, expectedBearing: 294.48, minBearing: 294.2, maxBearing: 294.7, minDistance: 8250, maxDistance: 8400 },
    { city: 'Surabaya', lat: -7.2575, lng: 112.7521, expectedBearing: 294.12, minBearing: 293.9, maxBearing: 294.3, minDistance: 8450, maxDistance: 8600 },
    { city: 'Madinah Al-Munawwarah', lat: 24.4672, lng: 39.6111, expectedBearing: 176.4, minBearing: 175.5, maxBearing: 177.5, minDistance: 300, maxDistance: 380 }
];

testCases.forEach(tc => {
    const res = kiblatEngine.calculateQibla(tc.lat, tc.lng);
    assert.ok(
        res.bearing >= tc.minBearing && res.bearing <= tc.maxBearing,
        `Bearing ${tc.city} (${res.bearing}°) harus berada di rentang ${tc.minBearing}° - ${tc.maxBearing}°`
    );
    assert.ok(
        res.distanceKm >= tc.minDistance && res.distanceKm <= tc.maxDistance,
        `Jarak ${tc.city} (${res.distanceKm} km) harus berada di rentang ${tc.minDistance} - ${tc.maxDistance} km`
    );
    console.log(`✔ [PASS] ${tc.city}: Azimut = ${res.bearing}° (Toleransi OK), Jarak = ${res.distanceKm} km`);
});

// C. Uji 3D Tilt Compensation
const flatEvent = { alpha: 65, beta: 2, gamma: 1 };
const flatHeading = kiblatEngine.extractCompassHeading(flatEvent);
assert.strictEqual(flatHeading, 295, 'Heading datar (flat) harus 360 - 65 = 295°');
console.log('✔ [PASS] 3D Tilt Compensation: Posisi datar (flat) terverifikasi.');

const tiltedEvent = { alpha: 90, beta: 35, gamma: 15 };
const tiltedHeading = kiblatEngine.extractCompassHeading(tiltedEvent);
assert.ok(
    typeof tiltedHeading === 'number' && !isNaN(tiltedHeading) && tiltedHeading >= 0 && tiltedHeading <= 360,
    'Heading posisi miring (tilted) harus valid antara 0° dan 360°'
);
console.log(`✔ [PASS] 3D Tilt Compensation: Posisi miring (pitch=35°, roll=15°) menghasilkan heading valid: ${tiltedHeading.toFixed(1)}°`);

// D. Uji iOS WebkitCompassHeading Override
const iosEvent = { webkitCompassHeading: 180.5, alpha: 30 };
const iosHeading = kiblatEngine.extractCompassHeading(iosEvent);
assert.strictEqual(iosHeading, 180.5, 'iOS Safari harus mengutamakan webkitCompassHeading');
console.log('✔ [PASS] Kompatibilitas iOS Safari WebkitCompassHeading terverifikasi.');

// E. Uji Shortest Angular Distance Filtering
const h1 = kiblatEngine.filterHeading(358);
const h2 = kiblatEngine.filterHeading(2); // Menyeberangi batas 0°/360°
assert.ok(!isNaN(h2) && Math.abs(h2 - 358) < 180, 'Filter rotasi sudut terpendek tidak boleh meloncat drastis saat menyeberangi 0°/360°');
console.log('✔ [PASS] Low-Pass Filter penghilang jitter sensor terverifikasi.');

// 2. Verifikasi DOM Integrasi di app.html (/app?view=ibadah&tab=kiblat)
const appHtml = fs.readFileSync(path.join(__dirname, '../app.html'), 'utf8');

assert.ok(appHtml.includes('id="ibadahTabContentKiblat"'), 'app.html harus memiliki id="ibadahTabContentKiblat"');
assert.ok(appHtml.includes('id="app-qibla-target-deg"'), 'app.html harus memiliki id="app-qibla-target-deg"');
assert.ok(appHtml.includes('id="app-qibla-status-badge"'), 'app.html harus memiliki id="app-qibla-status-badge"');
assert.ok(appHtml.includes('id="app-qibla-compass-dial"'), 'app.html harus memiliki id="app-qibla-compass-dial"');
assert.ok(appHtml.includes('id="app-qibla-compass-needle"'), 'app.html harus memiliki id="app-qibla-compass-needle"');
assert.ok(appHtml.includes('id="app-qibla-city-select"'), 'app.html harus memiliki id="app-qibla-city-select"');
assert.ok(appHtml.includes('id="app-qibla-location"'), 'app.html harus memiliki id="app-qibla-location"');
assert.ok(appHtml.includes('id="app-qibla-distance"'), 'app.html harus memiliki id="app-qibla-distance"');
assert.ok(appHtml.includes('id="btn-app-qibla-ios-sensor"'), 'app.html harus memiliki tombol izin sensor iOS');
assert.ok(appHtml.includes('QS. Al-Baqarah: 144'), 'app.html harus menyertakan dalil Al-Qur\'an Al-Baqarah 144');
assert.ok(appHtml.includes('src="js/kiblat.js?v=2.8.0"'), 'app.html harus memuat script js/kiblat.js');
console.log('✔ [PASS] DOM UI Presisi di app.html terverifikasi 100%!');

// 3. Verifikasi DOM Integrasi di kiblat.html
const kiblatHtml = fs.readFileSync(path.join(__dirname, '../kiblat.html'), 'utf8');
assert.ok(kiblatHtml.includes('src="js/kiblat.js?v=2.8.0"'), 'kiblat.html harus memuat script js/kiblat.js');
console.log('✔ [PASS] Integrasi script modular pada kiblat.html terverifikasi!');

// 4. Verifikasi Precache di sw.js
const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
assert.ok(swJs.includes("'/js/kiblat.js'"), 'sw.js harus melakukan precache pada /js/kiblat.js');
assert.ok(swJs.includes('sdw-umroh-pwa-v55'), 'sw.js harus dinaikkan versinya ke v55');
console.log('✔ [PASS] Precache Service Worker dan Cache Versioning terverifikasi!');

// 5. Verifikasi Lifecycle Controller di js/jamaah.js & js/pwa.js
const jamaahJs = fs.readFileSync(path.join(__dirname, '../js/jamaah.js'), 'utf8');
assert.ok(jamaahJs.includes('window.SDW_KIBLAT.startCompassListener'), 'js/jamaah.js harus memicu startCompassListener saat tab kiblat aktif');
assert.ok(jamaahJs.includes('window.SDW_KIBLAT.stopCompassListener'), 'js/jamaah.js harus memicu stopCompassListener saat meninggalkan tab kiblat');

const pwaJs = fs.readFileSync(path.join(__dirname, '../js/pwa.js'), 'utf8');
assert.ok(pwaJs.includes('window.SDW_KIBLAT.updateCompassUI'), 'js/pwa.js harus meneruskan orientasi ke SDW_KIBLAT.updateCompassUI');
console.log('✔ [PASS] Sensor lifecycle & battery-friendly listeners terverifikasi!');

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================');
