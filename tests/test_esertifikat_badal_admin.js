/**
 * Automated Verification Suite for E-Sertifikat Badal Umroh Portal Admin
 * Tests HTML markup, state management, RBAC, nav routing, and controller functions.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING E-SERTIFIKAT BADAL ADMIN TEST SUITE ---');

// 1. Verify admin.html markup
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

assert.ok(
    adminHtml.includes('data-admin-tab="tab-badal-certificates"'),
    'admin.html must contain sidebar button with data-admin-tab="tab-badal-certificates"'
);
assert.ok(
    adminHtml.includes("SDW_ADMIN.switchTab('tab-badal-certificates')"),
    'admin.html sidebar button must invoke switchTab("tab-badal-certificates")'
);
assert.ok(
    adminHtml.includes('id="tab-badal-certificates"'),
    'admin.html must have container id="tab-badal-certificates"'
);
assert.ok(
    adminHtml.includes('id="table-badal-certificates-body"'),
    'admin.html must have tbody id="table-badal-certificates-body"'
);
assert.ok(
    adminHtml.includes('id="modalBadalCertificateEditor"'),
    'admin.html must have modal id="modalBadalCertificateEditor"'
);
assert.ok(
    adminHtml.includes('id="badal-preview-name"'),
    'admin.html must have live preview element id="badal-preview-name"'
);
assert.ok(
    adminHtml.includes('id="badal-font-size-slider"'),
    'admin.html must have font size slider id="badal-font-size-slider"'
);
assert.ok(
    adminHtml.includes('src="js/admin/admin-badal.js'),
    'admin.html must include script js/admin/admin-badal.js'
);
console.log('✔ admin.html markup checks passed');

// 2. Verify admin-state.js
const stateJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-state.js'), 'utf8');
assert.ok(
    stateJs.includes("BADAL: 'sdw_admin_badal_certificates'"),
    'admin-state.js must define BADAL storage key'
);
assert.ok(
    stateJs.includes("'tab-badal-certificates'"),
    'admin-state.js must include tab-badal-certificates in permissions'
);
console.log('✔ admin-state.js RBAC & storage keys passed');

// 3. Verify admin-nav.js
const navJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-nav.js'), 'utf8');
assert.ok(
    navJs.includes("tabId === 'tab-badal-certificates'"),
    'admin-nav.js must trigger renderBadalCertificates when switching to tab-badal-certificates'
);
console.log('✔ admin-nav.js tab switcher passed');

// 4. Verify sw.js cache bump
const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
assert.ok(
    swJs.includes('sdw-umroh-pwa-v48'),
    'sw.js must be bumped to v48'
);
assert.ok(
    swJs.includes("'/js/admin/admin-badal.js'"),
    'sw.js must precache /js/admin/admin-badal.js'
);
console.log('✔ sw.js cache version & precache list passed');

// 5. Test admin-badal.js logic in Node environment (with mock DOM)
global.window = {
    location: { origin: 'http://localhost:3000' },
    open: () => ({ document: { write: () => {}, close: () => {} } })
};
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

const adminBadal = require('../js/admin/admin-badal.js');
assert.ok(typeof adminBadal.renderBadalCertificates === 'function', 'renderBadalCertificates must be exported');
assert.ok(typeof adminBadal.openBadalModal === 'function', 'openBadalModal must be exported');
assert.ok(typeof adminBadal.closeBadalModal === 'function', 'closeBadalModal must be exported');
assert.ok(typeof adminBadal.updateBadalPreview === 'function', 'updateBadalPreview must be exported');
assert.ok(typeof adminBadal.saveBadalCertificate === 'function', 'saveBadalCertificate must be exported');
assert.ok(typeof adminBadal.printBadalCertificate === 'function', 'printBadalCertificate must be exported');
assert.ok(typeof adminBadal.downloadSingleBadal === 'function', 'downloadSingleBadal must be exported');
assert.ok(typeof adminBadal.downloadBulkBadal === 'function', 'downloadBulkBadal must be exported');
assert.ok(typeof adminBadal.generateBulkBadal === 'function', 'generateBulkBadal must be exported');
assert.ok(typeof adminBadal.shareBadalWA === 'function', 'shareBadalWA must be exported');
assert.ok(typeof adminBadal.deleteBadalCertificate === 'function', 'deleteBadalCertificate must be exported');

console.log('✔ admin-badal.js function exports passed');
console.log('--- ALL TEST SUITE CHECKS PASSED (100%) ---');
