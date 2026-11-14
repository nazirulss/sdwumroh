/**
 * Automated Test Suite: Manajemen Kontak, Alamat & 4 Media Sosial
 * Memverifikasi integritas skema database, backend Google Apps Script,
 * frontend admin portal, sync engine, dan rendering dinamis footer publik.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- MENJALANKAN TEST SUITE KONTAK & MEDIA SOSIAL ---');

// 1. Verifikasi Markdown Schema Otoritatif
console.log('\n[TEST 1] Verifikasi sdw_umroh_spreadsheet_schema.md...');
const schemaMd = fs.readFileSync(path.resolve(__dirname, '../sdw_umroh_spreadsheet_schema.md'), 'utf8');
assert(schemaMd.includes('DB_Contact_Social'), 'Schema markdown harus memuat tabel DB_Contact_Social');
assert(schemaMd.includes('CNT-000001'), 'Schema markdown harus memuat konvensi ID CNT-000001');
assert(schemaMd.includes('company_name'), 'Schema markdown harus memuat kolom company_name');
assert(schemaMd.includes('address_line'), 'Schema markdown harus memuat kolom address_line');
assert(schemaMd.includes('whatsapp_number'), 'Schema markdown harus memuat kolom whatsapp_number');
assert(schemaMd.includes('instagram_url'), 'Schema markdown harus memuat kolom instagram_url');
assert(schemaMd.includes('facebook_url'), 'Schema markdown harus memuat kolom facebook_url');
assert(schemaMd.includes('youtube_url'), 'Schema markdown harus memuat kolom youtube_url');
assert(schemaMd.includes('tiktok_url'), 'Schema markdown harus memuat kolom tiktok_url');
console.log('  ✓ sdw_umroh_spreadsheet_schema.md memuat DB_Contact_Social secara lengkap');

// 2. Verifikasi backend/Setup.gs
console.log('\n[TEST 2] Verifikasi backend/Setup.gs...');
const setupGs = fs.readFileSync(path.resolve(__dirname, '../backend/Setup.gs'), 'utf8');
assert(setupGs.includes('"DB_Contact_Social":'), 'Setup.gs AUTHORITATIVE_SCHEMAS_ harus memuat DB_Contact_Social');
assert(setupGs.includes('function setupContactSocialSheet()'), 'Setup.gs harus mendeklarasikan setupContactSocialSheet()');
assert(setupGs.includes('setupContactSocialSheet();'), 'Setup.gs harus memanggil setupContactSocialSheet() pada initialize');
assert(setupGs.includes('layanan@sdwumroh.co.id'), 'Setup.gs harus memuat data seed resmi');
console.log('  ✓ backend/Setup.gs terstruktur dan siap inisialisasi');

// 3. Verifikasi backend/Code.gs
console.log('\n[TEST 3] Verifikasi backend/Code.gs...');
const codeGs = fs.readFileSync(path.resolve(__dirname, '../backend/Code.gs'), 'utf8');
assert(codeGs.includes("action === 'getContactSocial'"), 'Code.gs doGet harus menangani getContactSocial');
assert(codeGs.includes("action === 'upgradeContactSocialSchema'"), 'Code.gs doGet harus menangani upgradeContactSocialSchema');
assert(codeGs.includes("action === 'saveContactSocial'"), 'Code.gs processSingleMutation_ harus menangani saveContactSocial');
assert(codeGs.includes('function getContactSocialData_('), 'Code.gs harus mendefinisikan getContactSocialData_');
assert(codeGs.includes('function saveContactSocialData_('), 'Code.gs harus mendefinisikan saveContactSocialData_');
console.log('  ✓ backend/Code.gs menangani API endpoints dan mutasi DB_Contact_Social');

// 4. Verifikasi js/api.js Mock Adapters
console.log('\n[TEST 4] Verifikasi js/api.js mock adapters...');
const apiJs = fs.readFileSync(path.resolve(__dirname, '../js/api.js'), 'utf8');
assert(apiJs.includes("action === 'getContactSocial'"), 'api.js handleMockGet harus menangani getContactSocial');
assert(apiJs.includes("action === 'saveContactSocial'"), 'api.js handleMockPost harus menangani saveContactSocial');
console.log('  ✓ js/api.js mock handlers aktif untuk offline & local testing');

// 5. Verifikasi js/admin/admin-state.js
console.log('\n[TEST 5] Verifikasi js/admin/admin-state.js...');
const stateJs = fs.readFileSync(path.resolve(__dirname, '../js/admin/admin-state.js'), 'utf8');
assert(stateJs.includes("CONTACT_SOCIAL: 'sdw_admin_contact_social'"), 'admin-state.js harus mendefinisikan STORAGE_KEYS.CONTACT_SOCIAL');
assert(stateJs.includes("'tab-contact-social'"), 'admin-state.js harus memetakan izin tab-contact-social');
assert(stateJs.includes('function getDefaultContactSocialData()'), 'admin-state.js harus menyediakan generator default');
assert(stateJs.includes('contactSocialData'), 'admin-state.js harus mengekspos properti contactSocialData');
console.log('  ✓ js/admin/admin-state.js state store & RBAC terkonfigurasi');

// 6. Verifikasi js/admin/admin-nav.js
console.log('\n[TEST 6] Verifikasi js/admin/admin-nav.js...');
const navJs = fs.readFileSync(path.resolve(__dirname, '../js/admin/admin-nav.js'), 'utf8');
assert(navJs.includes("'tab-contact-social':"), 'admin-nav.js harus memetakan breadcrumb tab-contact-social');
assert(navJs.includes("tabId === 'tab-contact-social'"), 'admin-nav.js switchTab harus memicu renderContactSocial');
console.log('  ✓ js/admin/admin-nav.js navigasi dan switcher terhubung');

// 7. Verifikasi js/admin/admin-sync.js
console.log('\n[TEST 7] Verifikasi js/admin/admin-sync.js...');
const syncJs = fs.readFileSync(path.resolve(__dirname, '../js/admin/admin-sync.js'), 'utf8');
assert(syncJs.includes("SDW_API.get('getContactSocial')"), 'admin-sync.js pullCloudDatabase harus menarik getContactSocial');
assert(syncJs.includes('admin.contactSocialData = contactRes.value.data'), 'admin-sync.js harus menghidrasi contactSocialData');
console.log('  ✓ js/admin/admin-sync.js sinkronisasi cloud terhubung');

// 8. Verifikasi js/admin/admin-contact-social.js Controller
console.log('\n[TEST 8] Verifikasi js/admin/admin-contact-social.js...');
const contactJsPath = path.resolve(__dirname, '../js/admin/admin-contact-social.js');
assert(fs.existsSync(contactJsPath), 'admin-contact-social.js harus ada');
const contactJs = fs.readFileSync(contactJsPath, 'utf8');
assert(contactJs.includes('function renderContactSocial('), 'Harus memiliki fungsi renderContactSocial');
assert(contactJs.includes('function saveContactSocial('), 'Harus memiliki fungsi saveContactSocial');
assert(contactJs.includes('function updateLivePreview('), 'Harus memiliki fungsi updateLivePreview');
assert(contactJs.includes('function testWhatsappLink('), 'Harus memiliki fungsi testWhatsappLink');
assert(contactJs.includes('admin.enqueueMutation'), 'Harus menggunakan dual-persistence enqueueMutation');
console.log('  ✓ js/admin/admin-contact-social.js controller lengkap & reaktif');

// 9. Verifikasi admin.html UI Markup & Script Tag
console.log('\n[TEST 9] Verifikasi admin.html UI...');
const adminHtml = fs.readFileSync(path.resolve(__dirname, '../admin.html'), 'utf8');
assert(adminHtml.includes('data-admin-tab="tab-contact-social"'), 'admin.html harus memuat button sidebar tab-contact-social');
assert(adminHtml.includes('id="tab-contact-social"'), 'admin.html harus memuat container id="tab-contact-social"');
assert(adminHtml.includes('id="cntAddressLine"'), 'admin.html harus memuat input cntAddressLine');
assert(adminHtml.includes('id="cntWhatsappNumber"'), 'admin.html harus memuat input cntWhatsappNumber');
assert(adminHtml.includes('id="cntInstagramUrl"'), 'admin.html harus memuat input cntInstagramUrl');
assert(adminHtml.includes('id="cntFacebookUrl"'), 'admin.html harus memuat input cntFacebookUrl');
assert(adminHtml.includes('id="cntYoutubeUrl"'), 'admin.html harus memuat input cntYoutubeUrl');
assert(adminHtml.includes('id="cntTiktokUrl"'), 'admin.html harus memuat input cntTiktokUrl');
assert(adminHtml.includes('src="js/admin/admin-contact-social.js'), 'admin.html harus mengimpor admin-contact-social.js');
console.log('  ✓ admin.html UI markup dan skrip terpasang');

// 10. Verifikasi js/components.js Dynamic Footer & WhatsApp Link
console.log('\n[TEST 10] Verifikasi js/components.js dynamic rendering...');
const compJs = fs.readFileSync(path.resolve(__dirname, '../js/components.js'), 'utf8');
assert(compJs.includes('sdw_admin_contact_social'), 'components.js harus membaca sdw_admin_contact_social');
assert(compJs.includes('footerAddress'), 'components.js getFooterHTML harus memuat elemen dinamis footerAddress');
assert(compJs.includes('footerIg'), 'components.js getFooterHTML harus memuat tautan dinamis footerIg');
assert(compJs.includes('footerFb'), 'components.js getFooterHTML harus memuat tautan dinamis footerFb');
assert(compJs.includes('footerYt'), 'components.js getFooterHTML harus memuat tautan dinamis footerYt');
assert(compJs.includes('footerTt'), 'components.js getFooterHTML harus memuat tautan dinamis footerTt');
console.log('  ✓ js/components.js terhubung dinamis ke database kontak & medsos');

// 11. Verifikasi Service Worker sw.js
console.log('\n[TEST 11] Verifikasi sw.js...');
const swJs = fs.readFileSync(path.resolve(__dirname, '../sw.js'), 'utf8');
assert(swJs.includes('/js/admin/admin-contact-social.js'), 'sw.js harus mem-precache admin-contact-social.js');
assert(swJs.includes('v90'), 'sw.js harus menggunakan cache version v90');
console.log('  ✓ sw.js precache & versioning valid');

console.log('\n============================================================');
console.log('SEMUA PENGUJIAN KONTAK, ALAMAT & MEDIA SOSIAL BERHASIL! (11/11)');
console.log('============================================================\n');
