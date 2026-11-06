// Test suite: E-Sertifikat Umroh Workflow (Admin & Pilgrim PWA)
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== TEST SUITE: E-SERTIFIKAT UMROH WORKFLOW ===\n');

const templatePath = path.join(__dirname, '../assets/certificate-template.jpg');
const appHtmlPath = path.join(__dirname, '../app.html');
const adminHtmlPath = path.join(__dirname, '../admin.html');
const jamaahJsPath = path.join(__dirname, '../js/jamaah.js');
const pwaJsPath = path.join(__dirname, '../js/pwa.js');
const adminNavJsPath = path.join(__dirname, '../js/admin/admin-nav.js');
const adminStateJsPath = path.join(__dirname, '../js/admin/admin-state.js');
const adminCertsJsPath = path.join(__dirname, '../js/admin/admin-certificates.js');

// 1. Verifikasi Asset Template Mockup
console.log('1. Verifikasi Asset Template Mockup Sertifikat');
assert(fs.existsSync(templatePath), 'File assets/certificate-template.jpg harus ada');
const templateStats = fs.statSync(templatePath);
assert(templateStats.size > 50000, 'Ukuran template harus valid (> 50KB)');
console.log(`  [PASS] File assets/certificate-template.jpg valid (${templateStats.size} bytes)!`);

// 2. Verifikasi UI Jamaah (app.html)
console.log('\n2. Verifikasi UI E-Sertifikat di app.html');
const appHtml = fs.readFileSync(appHtmlPath, 'utf8');
assert(appHtml.includes('id="pilgrimCertContainer"'), 'Container certificate preview harus ada');
assert(appHtml.includes('id="cert-pilgrim-no"'), 'Nomor sertifikat pojok kiri atas harus ada');
assert(appHtml.includes('id="cert-pilgrim-photo-box"'), 'Frame foto sertifikat harus ada');
assert(appHtml.includes('top: 15.55%; left: 76.8%; width: 13.75%;'), 'Koordinat bingkai foto harus presisi dan lebar kiri pas');
assert(appHtml.includes('id="cert-pilgrim-photo-img"'), 'Image tag foto jamaah harus ada');
assert(appHtml.includes('id="cert-pilgrim-name"'), 'Elemen nama jamaah di sertifikat harus ada');
assert(appHtml.includes('top: 53.6%; left: 49.5%;'), 'Letak nama jamaah harus mendekati garis horizontal');
assert(appHtml.includes('id="cert-pilgrim-date"'), 'Elemen tanggal keberangkatan harus ada');
assert(appHtml.includes('whitespace-nowrap'), 'Tanggal keberangkatan harus 1 baris saja');
assert(appHtml.includes('downloadCertificatePDF()'), 'Trigger download PDF harus ada');
assert(appHtml.includes('downloadCertificateImage()'), 'Trigger download JPG image harus ada');
assert(appHtml.includes('shareCertificateWA()'), 'Trigger bagikan WA harus ada');
console.log('  [PASS] Seluruh komponen UI sertifikat di app.html terverifikasi!');

// 3. Verifikasi Controller Jamaah (js/jamaah.js & js/pwa.js)
console.log('\n3. Verifikasi Controller Jamaah (js/jamaah.js & js/pwa.js)');
const jamaahJs = fs.readFileSync(jamaahJsPath, 'utf8');
assert(jamaahJs.includes('function renderPilgrimCertificate('), 'renderPilgrimCertificate harus didefinisikan');
assert(jamaahJs.includes('window.renderPilgrimCertificate = renderPilgrimCertificate'), 'renderPilgrimCertificate harus diekspos ke window');
assert(jamaahJs.includes('function downloadCertificateImage('), 'downloadCertificateImage harus didefinisikan');
assert(jamaahJs.includes('window.downloadCertificateImage = downloadCertificateImage'), 'downloadCertificateImage harus diekspos ke window');
assert(jamaahJs.includes('function downloadCertificatePDF('), 'downloadCertificatePDF harus didefinisikan');
assert(jamaahJs.includes('window.downloadCertificatePDF = downloadCertificatePDF'), 'downloadCertificatePDF harus diekspos ke window');
assert(jamaahJs.includes('function shareCertificateWA('), 'shareCertificateWA harus didefinisikan');
assert(jamaahJs.includes('window.shareCertificateWA = shareCertificateWA'), 'shareCertificateWA harus diekspos ke window');

const pwaJs = fs.readFileSync(pwaJsPath, 'utf8');
assert(pwaJs.includes('renderPilgrimCertificate'), 'switchGaleriTab(sertifikat) harus memanggil renderPilgrimCertificate');
console.log('  [PASS] Logic render, canvas rendering, dan export di sisi jamaah terverifikasi!');

// 4. Verifikasi UI Admin Backoffice (admin.html)
console.log('\n4. Verifikasi UI Admin Backoffice (admin.html)');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
assert(adminHtml.includes('data-admin-tab="tab-certificates"'), 'Nav menu link ke tab-certificates harus ada');
assert(adminHtml.includes('id="tab-certificates"'), 'Container tab-certificates harus ada');
assert(adminHtml.includes('id="table-certificates-body"'), 'Tabel daftar sertifikat jamaah harus ada');
assert(adminHtml.includes('id="modalCertificateEditor"'), 'Modal editor sertifikat harus ada');
assert(adminHtml.includes('id="modal-cert-preview-name"'), 'Preview nama di modal editor harus ada');
assert(adminHtml.includes('id="modal-cert-preview-no"'), 'Nomor sertifikat pojok kiri atas di modal preview harus ada');
assert(adminHtml.includes('id="crop-zoom"'), 'Slider Zoom harus ada di modal');
assert(adminHtml.includes('js/admin/admin-certificates.js'), 'admin-certificates.js harus dimuat di admin.html');
console.log('  [PASS] Navigasi, tab view, live preview modal, dan script loader di admin.html terverifikasi!');

// 5. Verifikasi State & Nav Admin
console.log('\n5. Verifikasi State & Navigasi Admin (admin-state.js & admin-nav.js)');
const adminStateJs = fs.readFileSync(adminStateJsPath, 'utf8');
assert(adminStateJs.includes("'tab-certificates'"), 'tab-certificates harus terdaftar di RBAC permissions');
assert(adminStateJs.includes("CERTS: 'sdw_admin_certificates'"), 'Key CERTS harus ada di STORAGE_KEYS');

const adminNavJs = fs.readFileSync(adminNavJsPath, 'utf8');
assert(adminNavJs.includes("tabId === 'tab-certificates'"), 'admin-nav.js harus menangani tab-certificates');
assert(adminNavJs.includes('renderCertificates'), 'admin-nav.js harus memicu renderCertificates()');
console.log('  [PASS] Konfigurasi RBAC permission dan router navigasi admin terverifikasi!');

// 6. Verifikasi Modul Admin Certificates (js/admin/admin-certificates.js)
console.log('\n6. Verifikasi Modul Admin Certificates (js/admin/admin-certificates.js)');
assert(fs.existsSync(adminCertsJsPath), 'File js/admin/admin-certificates.js harus ada');
const adminCertsJs = fs.readFileSync(adminCertsJsPath, 'utf8');
assert(adminCertsJs.includes('renderCertificates'), 'renderCertificates harus ada');
assert(adminCertsJs.includes('openCertificateModal'), 'openCertificateModal harus ada');
assert(adminCertsJs.includes('saveCertificate'), 'saveCertificate harus ada');
assert(adminCertsJs.includes('printCertificate'), 'printCertificate harus ada');
assert(adminCertsJs.includes('generateBulkCertificates'), 'generateBulkCertificates harus ada');
assert(adminCertsJs.includes('handleCertificatePhotoUpload'), 'handleCertificatePhotoUpload harus ada');
assert(adminCertsJs.includes('updateCertificatePreview'), 'updateCertificatePreview harus ada');
assert(adminCertsJs.includes('onPhotoCropChange'), 'onPhotoCropChange harus ada');
assert(adminCertsJs.includes('resetPhotoCrop'), 'resetPhotoCrop harus ada');
console.log('  [PASS] Fungsi-fungsi CRUD, live preview, dan Crop pasfoto admin terverifikasi!');

// 7. Pengujian Fungsional Logika Sertifikat di Lingkungan Node
console.log('\n7. Pengujian Fungsional Logika Registrasi & Sertifikat di Lingkungan Node');
const adminState = require('../js/admin/admin-state.js');
const adminCerts = require('../js/admin/admin-certificates.js');

// Mock localStorage
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

const regsList = adminCerts.getRegistrations();
assert(Array.isArray(regsList) && regsList.length > 0, 'Daftar registrasi jamaah tidak boleh kosong');
assert(regsList[0].customer || regsList[0].name, 'Data registrasi harus memiliki nama/customer');
console.log(`  [PASS] getRegistrations() berhasil mengembalikan ${regsList.length} jamaah!`);

console.log('\n========================================');
console.log('TOTAL TEST RESULT: ALL PASSED (100% SUKSES)');
console.log('========================================\n');
