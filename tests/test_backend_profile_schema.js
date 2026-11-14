/**
 * Automated Verification Test: Backend & Database Schema for Profile Management
 * Validates Google Sheets schema definitions, Apps Script backend endpoints,
 * frontend mock API handlers, sync engine, and admin controller mutation wiring.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING BACKEND & DATABASE SCHEMA VERIFICATION SUITE ---');

// 1. Verify sdw_umroh_spreadsheet_schema.md
console.log('\n[TEST 1] Verifying sdw_umroh_spreadsheet_schema.md...');
const schemaMdPath = path.resolve(__dirname, '../sdw_umroh_spreadsheet_schema.md');
assert(fs.existsSync(schemaMdPath), 'Schema documentation markdown file must exist');
const schemaMd = fs.readFileSync(schemaMdPath, 'utf8');

const requiredSheets = [
    'DB_Profile_Institution',
    'DB_Profile_Director',
    'DB_Profile_Guides',
    'DB_Profile_Legality',
    'DB_Profile_Mitra_Syiar'
];

requiredSheets.forEach(sheet => {
    assert(schemaMd.includes(sheet), `Schema documentation must define ${sheet}`);
    console.log(`  ✓ Sheet ${sheet} documented in schema markdown`);
});

assert(schemaMd.includes('PRF-INST-'), 'Must specify PRF-INST ID convention');
assert(schemaMd.includes('PRF-DIR-'), 'Must specify PRF-DIR ID convention');
assert(schemaMd.includes('GD-'), 'Must specify GD ID convention');
assert(schemaMd.includes('LEG-'), 'Must specify LEG ID convention');
assert(schemaMd.includes('MTR-'), 'Must specify MTR ID convention');
console.log('  ✓ ID conventions and column specifications verified in markdown');

// 2. Verify backend/Setup.gs
console.log('\n[TEST 2] Verifying backend/Setup.gs...');
const setupGsPath = path.resolve(__dirname, '../backend/Setup.gs');
assert(fs.existsSync(setupGsPath), 'Setup.gs must exist');
const setupGs = fs.readFileSync(setupGsPath, 'utf8');

requiredSheets.forEach(sheet => {
    assert(setupGs.includes(`'${sheet}'`) || setupGs.includes(`"${sheet}"`), `Setup.gs AUTHORITATIVE_SCHEMAS_ must include ${sheet}`);
    console.log(`  ✓ ${sheet} present in AUTHORITATIVE_SCHEMAS_`);
});

assert(setupGs.includes('function setupProfileSheets('), 'Setup.gs must declare setupProfileSheets');
assert(setupGs.includes('setupProfileSheets()'), 'Setup.gs initializeSdwUmrohInfrastructure must invoke setupProfileSheets');
assert(setupGs.includes('U.123/2026'), 'Setup.gs must contain initial PPIU credential seed');
assert(setupGs.includes('H. Muhammad Syarif'), 'Setup.gs must contain director seed data');
assert(setupGs.includes('Ust. H. Ahmad Fauzan, Lc., M.Ag.'), 'Setup.gs must contain lead advisor seed data');
assert(setupGs.includes('Korda Khusus Jabodetabek'), 'Setup.gs must contain Mitra Syiar seed data');
console.log('  ✓ Setup.gs schemas, helper function, and seed data verified');

// 3. Verify backend/Code.gs
console.log('\n[TEST 3] Verifying backend/Code.gs...');
const codeGsPath = path.resolve(__dirname, '../backend/Code.gs');
assert(fs.existsSync(codeGsPath), 'Code.gs must exist');
const codeGs = fs.readFileSync(codeGsPath, 'utf8');

const doGetActions = [
    'getProfileInstitution',
    'getProfileDirector',
    'getProfileGuides',
    'getProfileLegality',
    'getProfileMitraSyiar',
    'getAllProfileData',
    'upgradeProfileSchema'
];

doGetActions.forEach(action => {
    assert(codeGs.includes(`action === '${action}'`) || codeGs.includes(`case '${action}':`), `Code.gs doGet must handle ${action}`);
    console.log(`  ✓ doGet handles '${action}'`);
});

const mutations = [
    'saveProfileInstitution',
    'saveProfileDirector',
    'saveProfileGuide',
    'deleteProfileGuide',
    'saveProfileLegalityDoc',
    'deleteProfileLegalityDoc',
    'saveProfileMitraSyiar',
    'deleteProfileMitraSyiar',
    'saveAllProfileData',
    'uploadProfilePhoto'
];

mutations.forEach(mut => {
    assert(codeGs.includes(`action === '${mut}'`) || codeGs.includes(`case '${mut}':`), `Code.gs processSingleMutation_ must handle ${mut}`);
    console.log(`  ✓ processSingleMutation_ handles '${mut}'`);
});

const backendHelpers = [
    'getProfileInstitutionData_',
    'getProfileDirectorData_',
    'getProfileGuidesData_',
    'getProfileLegalityData_',
    'getProfileMitraSyiarData_',
    'getAllProfileData_',
    'saveProfileInstitution_',
    'saveProfileDirector_',
    'saveProfileGuide_',
    'deleteProfileGuide_',
    'saveProfileLegalityDoc_',
    'deleteProfileLegalityDoc_',
    'saveProfileMitraSyiar_',
    'deleteProfileMitraSyiar_',
    'saveAllProfileData_',
    'uploadProfilePhoto_'
];

backendHelpers.forEach(fn => {
    assert(codeGs.includes(`function ${fn}`), `Code.gs must define helper ${fn}`);
    console.log(`  ✓ backend helper '${fn}' defined`);
});

// 4. Verify js/api.js mock handlers
console.log('\n[TEST 4] Verifying js/api.js mock handlers...');
const apiJsPath = path.resolve(__dirname, '../js/api.js');
assert(fs.existsSync(apiJsPath), 'api.js must exist');
const apiJs = fs.readFileSync(apiJsPath, 'utf8');

assert(apiJs.includes("action === 'getAllProfileData'"), 'api.js handleMockGet must handle getAllProfileData');
assert(apiJs.includes("action === 'saveAllProfileData'"), 'api.js handleMockPost must handle saveAllProfileData');
assert(apiJs.includes("action === 'saveProfileMitraSyiar'"), 'api.js handleMockPost must handle saveProfileMitraSyiar');
assert(apiJs.includes("action === 'deleteProfileMitraSyiar'"), 'api.js handleMockPost must handle deleteProfileMitraSyiar');
assert(apiJs.includes("action === 'uploadProfilePhoto'"), 'api.js handleMockPost must handle uploadProfilePhoto');
console.log('  ✓ js/api.js mock handlers for GET, POST, and file uploads verified');

// 5. Verify js/admin/admin-sync.js cloud hydration
console.log('\n[TEST 5] Verifying js/admin/admin-sync.js cloud hydration...');
const syncJsPath = path.resolve(__dirname, '../js/admin/admin-sync.js');
assert(fs.existsSync(syncJsPath), 'admin-sync.js must exist');
const syncJs = fs.readFileSync(syncJsPath, 'utf8');

assert(syncJs.includes("SDW_API.get('getAllProfileData')"), 'admin-sync.js must pull getAllProfileData in pullCloudDatabase');
assert(syncJs.includes("admin.profileInstitutionData = pData.institution"), 'admin-sync.js must hydrate profileInstitutionData');
assert(syncJs.includes("admin.profileDirectorData = pData.director"), 'admin-sync.js must hydrate profileDirectorData');
assert(syncJs.includes("admin.profileGuidesData = pData.guides"), 'admin-sync.js must hydrate profileGuidesData');
assert(syncJs.includes("admin.profileLegalityData = pData.legality"), 'admin-sync.js must hydrate profileLegalityData');
console.log('  ✓ js/admin/admin-sync.js dual-persistence and cloud pulling verified');

// 6. Verify js/admin/admin-profile.js mutation enqueuing
console.log('\n[TEST 6] Verifying js/admin/admin-profile.js mutation enqueuing...');
const profileJsPath = path.resolve(__dirname, '../js/admin/admin-profile.js');
assert(fs.existsSync(profileJsPath), 'admin-profile.js must exist');
const profileJs = fs.readFileSync(profileJsPath, 'utf8');

assert(profileJs.includes("admin.enqueueMutation('saveAllProfileData'"), 'admin-profile.js saveAll must enqueue saveAllProfileData');
assert(profileJs.includes("SDW_API.post('saveAllProfileData'"), 'admin-profile.js saveAll must trigger background SDW_API.post');
assert(profileJs.includes("admin.enqueueMutation('saveProfileGuide'"), 'admin-profile.js submitGuideForm must enqueue saveProfileGuide');
assert(profileJs.includes("admin.enqueueMutation('deleteProfileGuide'"), 'admin-profile.js deleteGuide must enqueue deleteProfileGuide');
assert(profileJs.includes("admin.enqueueMutation('saveProfileLegalityDoc'"), 'admin-profile.js must enqueue saveProfileLegalityDoc');
assert(profileJs.includes("admin.enqueueMutation('deleteProfileLegalityDoc'"), 'admin-profile.js must enqueue deleteProfileLegalityDoc');
assert(profileJs.includes("admin.enqueueMutation('saveProfileMitraSyiar'"), 'admin-profile.js must enqueue saveProfileMitraSyiar');
assert(profileJs.includes("admin.enqueueMutation('deleteProfileMitraSyiar'"), 'admin-profile.js must enqueue deleteProfileMitraSyiar');
console.log('  ✓ js/admin/admin-profile.js dual-persistence and mutation queue integration verified');

console.log('\n============================================================');
console.log('ALL BACKEND & DATABASE SCHEMA VERIFICATION TESTS PASSED! (6/6)');
console.log('============================================================\n');
