/**
 * Automated Verification Suite for Admin Katalog Pilihan Paket Umroh & Haji Khusus
 * Tests HTML markup, state management, RBAC, nav routing, SW cache, and controller functions.
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('--- STARTING ADMIN PACKAGES CATALOG TEST SUITE ---');

    // 1. Verify admin.html markup
    const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

assert.ok(
    adminHtml.includes('data-admin-tab="tab-packages"'),
    'admin.html must contain sidebar button with data-admin-tab="tab-packages"'
);
assert.ok(
    adminHtml.includes("SDW_ADMIN.switchTab('tab-packages')"),
    'admin.html sidebar button must invoke switchTab("tab-packages")'
);
assert.ok(
    adminHtml.includes('id="tab-packages"'),
    'admin.html must have container id="tab-packages"'
);
assert.ok(
    adminHtml.includes('id="table-packages-body"'),
    'admin.html must have tbody id="table-packages-body"'
);
assert.ok(
    adminHtml.includes('id="package-cards-grid"'),
    'admin.html must have grid container id="package-cards-grid"'
);
assert.ok(
    adminHtml.includes('id="modalPackageEditor"'),
    'admin.html must have modal id="modalPackageEditor"'
);
assert.ok(
    adminHtml.includes('id="formPackageEditor"'),
    'admin.html must have form id="formPackageEditor"'
);
assert.ok(
    adminHtml.includes('id="pkgName"'),
    'admin.html must have input id="pkgName"'
);
assert.ok(
    adminHtml.includes('id="pkgType"'),
    'admin.html must have select id="pkgType"'
);
assert.ok(
    adminHtml.includes('id="pkgImageFileInput"'),
    'admin.html must have file input id="pkgImageFileInput"'
);
assert.ok(
    adminHtml.includes('id="pkgImagePreview"'),
    'admin.html must have image preview element id="pkgImagePreview"'
);
assert.ok(
    adminHtml.includes('SDW_ADMIN.handlePackageImageUpload'),
    'admin.html must invoke SDW_ADMIN.handlePackageImageUpload'
);
assert.ok(
    adminHtml.includes('SDW_ADMIN.selectPresetPackageImage'),
    'admin.html must invoke SDW_ADMIN.selectPresetPackageImage'
);
assert.ok(
    adminHtml.includes('id="pkgQuadPrice"'),
    'admin.html must have input id="pkgQuadPrice"'
);
assert.ok(
    adminHtml.includes('Foto Banner'),
    'admin.html table header must contain "Foto Banner" column'
);
assert.ok(
    adminHtml.includes('src="js/admin/admin-packages.js'),
    'admin.html must include script js/admin/admin-packages.js'
);
console.log('✔ admin.html markup checks passed');

// 2. Verify admin-state.js
const stateJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-state.js'), 'utf8');
assert.ok(
    stateJs.includes("PACKAGES: 'sdw_admin_packages'"),
    'admin-state.js must define STORAGE_KEYS.PACKAGES'
);
assert.ok(
    stateJs.includes("'tab-packages'"),
    'admin-state.js must have tab-packages in ADMIN_PERMISSIONS'
);
assert.ok(
    stateJs.includes("packagesFilter:"),
    'admin-state.js must have packagesFilter in state'
);
assert.ok(
    stateJs.includes("packagesData:"),
    'admin-state.js must have packagesData in state'
);
console.log('✔ admin-state.js checks passed');

// 3. Verify admin-nav.js
const navJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-nav.js'), 'utf8');
assert.ok(
    navJs.includes("tabId === 'tab-packages'") && navJs.includes("admin.renderPackages"),
    'admin-nav.js switchTab must invoke admin.renderPackages for tab-packages'
);
console.log('✔ admin-nav.js routing checks passed');

// 4. Verify sw.js precache & cache version
const swJs = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
assert.ok(
    swJs.includes('sdw-umroh-pwa-v59'),
    'sw.js must be bumped to v59'
);
assert.ok(
    swJs.includes("'/js/admin/admin-packages.js'"),
    'sw.js must precache /js/admin/admin-packages.js'
);
console.log('✔ sw.js precache & version checks passed');

// 5. Verify backend Setup.gs and Code.gs schema & endpoints
const setupGs = fs.readFileSync(path.join(__dirname, '../backend/Setup.gs'), 'utf8');
assert.ok(
    setupGs.includes('hotel_makkah') && setupGs.includes('hotel_madinah') && setupGs.includes('airline') && setupGs.includes('seats_left'),
    'backend/Setup.gs must contain expanded DB_Packages columns'
);
assert.ok(
    setupGs.includes('function setupPackagesCatalogSheet()'),
    'backend/Setup.gs must contain setupPackagesCatalogSheet migration helper'
);

const codeGs = fs.readFileSync(path.join(__dirname, '../backend/Code.gs'), 'utf8');
assert.ok(
    codeGs.includes("action === 'savePackage'") && codeGs.includes("action === 'setPackageStatus'") && codeGs.includes("action === 'deletePackage'"),
    'backend/Code.gs must handle savePackage, setPackageStatus, and deletePackage'
);
assert.ok(
    codeGs.includes("function autoUpgradePackagesSheet_"),
    'backend/Code.gs must contain autoUpgradePackagesSheet_ helper'
);
console.log('✔ backend/Setup.gs & backend/Code.gs checks passed');

// 6. Verify admin-packages.js functionality
const adminPackagesJs = fs.readFileSync(path.join(__dirname, '../js/admin/admin-packages.js'), 'utf8');
assert.ok(
    adminPackagesJs.includes('bannerSrc') && adminPackagesJs.includes('hero-haram.png'),
    'admin-packages.js must render thumbnail with fallback banner image'
);

const adminPackages = require('../js/admin/admin-packages.js');
assert.strictEqual(typeof adminPackages.renderPackages, 'function', 'renderPackages must be exported');
assert.strictEqual(typeof adminPackages.openPackageModal, 'function', 'openPackageModal must be exported');
assert.strictEqual(typeof adminPackages.closePackageModal, 'function', 'closePackageModal must be exported');
assert.strictEqual(typeof adminPackages.savePackageForm, 'function', 'savePackageForm must be exported');
assert.strictEqual(typeof adminPackages.togglePackageStatus, 'function', 'togglePackageStatus must be exported');
assert.strictEqual(typeof adminPackages.deletePackage, 'function', 'deletePackage must be exported');
assert.strictEqual(typeof adminPackages.previewPackageWeb, 'function', 'previewPackageWeb must be exported');
assert.strictEqual(typeof adminPackages.syncPackagesFromCloud, 'function', 'syncPackagesFromCloud must be exported');
assert.strictEqual(typeof adminPackages.switchPackageViewMode, 'function', 'switchPackageViewMode must be exported');
assert.strictEqual(typeof adminPackages.handlePackageImageUpload, 'function', 'handlePackageImageUpload must be exported');
assert.strictEqual(typeof adminPackages.onPackageImageUrlInput, 'function', 'onPackageImageUrlInput must be exported');
assert.strictEqual(typeof adminPackages.selectPresetPackageImage, 'function', 'selectPresetPackageImage must be exported');
console.log('✔ admin-packages.js controller exports passed');

console.log('\n======================================================');
console.log('🎉 ALL ADMIN PACKAGES CATALOG TESTS PASSED SUCCESSFULLY!');
console.log('======================================================\n');
})();


