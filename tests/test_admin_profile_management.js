/**
 * ====================================================================
 * TEST SUITE: MANAJEMEN PROFIL LEMBAGA PADA PORTAL ADMIN
 * File: tests/test_admin_profile_management.js
 * Verifies:
 *   1. Storage Keys & Default Datasets (admin-state.js)
 *   2. RBAC Permissions Mapping for tab-profile
 *   3. Navigation, Breadcrumb & switchTab Hook (admin-nav.js)
 *   4. HTML Markup, Sidebar Button & 4 Subtab Containers (admin.html)
 *   5. Controller Logic, Subtab Switching & CRUD Operations (admin-profile.js)
 *   6. Data Persistence & Service Worker Precache (sw.js v84+)
 * ====================================================================
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. Mock Browser Environment
const localStorageData = {};
global.localStorage = {
    getItem: (key) => localStorageData[key] || null,
    setItem: (key, val) => { localStorageData[key] = String(val); },
    removeItem: (key) => { delete localStorageData[key]; },
    clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

global.window = {
    innerWidth: 1200,
    location: { href: 'admin.html' }
};

global.confirm = () => true;

const domElements = {};
function createMockElement(id) {
    return {
        id: id,
        value: '',
        innerText: '',
        textContent: '',
        innerHTML: '',
        className: '',
        checked: false,
        classList: {
            classes: new Set(),
            add: function(c) { this.classes.add(c); },
            remove: function(c) { this.classes.delete(c); },
            toggle: function(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); },
            contains: function(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        reset: function() { this.value = ''; },
        addEventListener: () => {}
    };
}

global.document = {
    getElementById: (id) => {
        if (!domElements[id]) domElements[id] = createMockElement(id);
        return domElements[id];
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
};

console.log('🧪 Memulai Pengujian Modul Manajemen Profil Lembaga Portal Admin...\n');

let passCount = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
        process.exit(1);
    }
}

// -----------------------------------------------------------------------------
// 1. UJI STORAGE KEYS & RBAC PERMISSIONS (admin-state.js)
// -----------------------------------------------------------------------------
const adminState = require(path.join(root, 'js/admin/admin-state.js'));

test('1. STORAGE_KEYS memuat kunci profile institution, director, guides, legality', () => {
    assert(adminState.STORAGE_KEYS.PROFILE_INSTITUTION === 'sdw_admin_profile_institution');
    assert(adminState.STORAGE_KEYS.PROFILE_DIRECTOR === 'sdw_admin_profile_director');
    assert(adminState.STORAGE_KEYS.PROFILE_GUIDES === 'sdw_admin_profile_guides');
    assert(adminState.STORAGE_KEYS.PROFILE_LEGALITY === 'sdw_admin_profile_legality');
});

test('2. RBAC Permissions memetakan tab-profile untuk SUPER_ADMIN, ADMIN, MANAGER, OWNER', () => {
    assert(adminState.ADMIN_PERMISSIONS['SUPER_ADMIN'].includes('tab-profile'));
    assert(adminState.ADMIN_PERMISSIONS['ADMIN'].includes('tab-profile'));
    assert(adminState.ADMIN_PERMISSIONS['MANAGER'].includes('tab-profile'));
    assert(adminState.ADMIN_PERMISSIONS['OWNER'].includes('tab-profile'));
});

test('3. Default dataset generator profil menghasilkan data terstruktur dan lengkap', () => {
    const inst = adminState.getDefaultProfileInstitutionData();
    assert(inst.kpi.ppiu_no.includes('U.123/2026'));
    assert(inst.kpi.akreditasi_grade.includes('Peringkat A'));
    assert(Array.isArray(inst.misi) && inst.misi.length >= 4);
    assert(Array.isArray(inst.sejarah_timeline) && inst.sejarah_timeline.length === 4);
    assert(Array.isArray(inst.direksi) && inst.direksi.length === 4);

    const dir = adminState.getDefaultProfileDirectorData();
    assert(dir.name === 'H. Muhammad Syarif');
    assert(dir.role.includes('Direktur Utama'));
    assert(dir.quote.length > 50);
    assert(Array.isArray(dir.pillars) && dir.pillars.length === 4);
    assert(dir.show_on_home === true);

    const guides = adminState.getDefaultProfileGuidesData();
    assert(guides.lead_advisor.name.includes('Ahmad Fauzan'));
    assert(guides.ratio_pilgrim === 35);
    assert(Array.isArray(guides.guides) && guides.guides.length >= 5);

    const leg = adminState.getDefaultProfileLegalityData();
    assert(Array.isArray(leg.documents) && leg.documents.some(d => d.title.includes('PPIU')));
    assert(Array.isArray(leg.partners) && leg.partners.some(p => p.name === 'Saudia Airlines'));
});

// -----------------------------------------------------------------------------
// 2. UJI MARKUP SIDEBAR & STRUKTUR TAB (admin.html)
// -----------------------------------------------------------------------------
const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');

test('4. admin.html memiliki button sidebar Profil Lembaga dengan data-admin-tab="tab-profile"', () => {
    assert(adminHtml.includes('data-admin-tab="tab-profile"'));
    assert(adminHtml.includes("SDW_ADMIN.switchTab('tab-profile')"));
    assert(adminHtml.includes('Profil Lembaga'));
});

test('5. admin.html memiliki container tab-profile dengan 4 subtab dan modal form', () => {
    assert(adminHtml.includes('id="tab-profile"'));
    assert(adminHtml.includes('id="btnSubtabProfileInst"'));
    assert(adminHtml.includes('id="btnSubtabProfileDirector"'));
    assert(adminHtml.includes('id="btnSubtabProfileGuides"'));
    assert(adminHtml.includes('id="btnSubtabProfileLegality"'));

    assert(adminHtml.includes('id="secProfileInstitution"'));
    assert(adminHtml.includes('id="secProfileDirector"'));
    assert(adminHtml.includes('id="secProfileGuides"'));
    assert(adminHtml.includes('id="secProfileLegality"'));

    assert(adminHtml.includes('id="modalGuideForm"'));
    assert(adminHtml.includes('id="modalDocumentForm"'));
    assert(adminHtml.includes('id="modalPartnerForm"'));
    assert(adminHtml.includes('js/admin/admin-profile.js'));
});

// -----------------------------------------------------------------------------
// 3. UJI BREADCRUMB & SWITCHTAB (admin-nav.js)
// -----------------------------------------------------------------------------
const adminNavJs = fs.readFileSync(path.join(root, 'js/admin/admin-nav.js'), 'utf8');

test('6. admin-nav.js memetakan TAB_BREADCRUMBS dan memicu renderProfileManagement pada switchTab', () => {
    assert(adminNavJs.includes("'tab-profile': 'Profil Lembaga & Identitas Institusi'"));
    assert(adminNavJs.includes("if (tabId === 'tab-profile' && typeof admin.renderProfileManagement === 'function') admin.renderProfileManagement();"));
});

// -----------------------------------------------------------------------------
// 4. UJI CONTROLLER MODUL & CRUD LOGIC (admin-profile.js)
// -----------------------------------------------------------------------------
const profileController = require(path.join(root, 'js/admin/admin-profile.js'));

test('7. SDW_ADMIN_PROFILE menyediakan API controller lengkap', () => {
    assert(typeof profileController.renderProfileManagement === 'function');
    assert(typeof profileController.switchSubtab === 'function');
    assert(typeof profileController.saveAll === 'function');
    assert(typeof profileController.addMisiItem === 'function');
    assert(typeof profileController.submitGuideForm === 'function');
    assert(typeof profileController.submitDocumentForm === 'function');
    assert(typeof profileController.submitPartnerForm === 'function');
});

test('8. Controller dapat beralih subtab tanpa melempar exception', () => {
    profileController.switchSubtab('institution');
    assert(adminState.profileSubtab === 'institution');

    profileController.switchSubtab('director');
    assert(adminState.profileSubtab === 'director');

    profileController.switchSubtab('guides');
    assert(adminState.profileSubtab === 'guides');

    profileController.switchSubtab('legality');
    assert(adminState.profileSubtab === 'legality');
});

test('9. Operasi CRUD Personil Pembimbing (Guides) berfungsi dengan benar', () => {
    adminState.profileGuidesData = adminState.getDefaultProfileGuidesData();
    const initialCount = adminState.profileGuidesData.guides.length;

    // Simulate Add Guide
    document.getElementById('guideFormId').value = '';
    document.getElementById('guideFormName').value = 'Ust. Muhammad Zaki, Lc.';
    document.getElementById('guideFormRole').value = 'Muthawwif Khusus Ramadhan';
    document.getElementById('guideFormUniversity').value = 'Al-Azhar Kairo';
    document.getElementById('guideFormExperience').value = '5 Tahun';
    document.getElementById('guideFormStatus').value = 'AKTIF';

    profileController.submitGuideForm();
    assert(adminState.profileGuidesData.guides.length === initialCount + 1);
    const added = adminState.profileGuidesData.guides[adminState.profileGuidesData.guides.length - 1];
    assert(added.name === 'Ust. Muhammad Zaki, Lc.');

    // Simulate Delete Guide
    profileController.deleteGuide(added.id);
    assert(adminState.profileGuidesData.guides.length === initialCount);
});

test('10. saveAll() menyimpan seluruh 4 data store ke localStorage', () => {
    // Populate form elements
    document.getElementById('profInstKpiPpiuNo').value = 'U.123/2026-REV';
    document.getElementById('profDirHeadline').value = 'Headline Baru Sambutan';
    document.getElementById('profLeadName').value = 'Ust. H. Ahmad Fauzan, Lc., M.Ag.';
    document.getElementById('profGuidesRatio').value = '35';

    profileController.saveAll();

    const savedInst = JSON.parse(localStorage.getItem(adminState.STORAGE_KEYS.PROFILE_INSTITUTION));
    assert(savedInst !== null);
    assert(savedInst.kpi.ppiu_no === 'U.123/2026-REV');

    const savedDir = JSON.parse(localStorage.getItem(adminState.STORAGE_KEYS.PROFILE_DIRECTOR));
    assert(savedDir !== null);
    assert(savedDir.headline === 'Headline Baru Sambutan');

    const savedGuides = JSON.parse(localStorage.getItem(adminState.STORAGE_KEYS.PROFILE_GUIDES));
    assert(savedGuides !== null);
    assert(savedGuides.ratio_pilgrim === 35);

    const savedLeg = JSON.parse(localStorage.getItem(adminState.STORAGE_KEYS.PROFILE_LEGALITY));
    assert(savedLeg !== null);
    assert(Array.isArray(savedLeg.documents));
});

test('11. admin.html memiliki input file upload untuk foto Direktur, Pembimbing & Asatidz', () => {
    assert(adminHtml.includes('id="profDirPhotoFileInput"'));
    assert(adminHtml.includes('id="profLeadPhotoFileInput"'));
    assert(adminHtml.includes('id="guideFormPhotoFileInput"'));
    assert(adminHtml.includes('handleDirectorPhotoUpload'));
    assert(adminHtml.includes('handleLeadPhotoUpload'));
    assert(adminHtml.includes('handleGuidePhotoUpload'));
});

test('12. Controller menyediakan method upload foto untuk Direktur, Pembimbing, Asatidz, dan Direksi', () => {
    assert(typeof profileController.handleDirectorPhotoUpload === 'function');
    assert(typeof profileController.handleLeadPhotoUpload === 'function');
    assert(typeof profileController.handleGuidePhotoUpload === 'function');
    assert(typeof profileController.handleDireksiPhotoUpload === 'function');

    // Simulate Director Photo Upload
    const mockFile = { name: 'foto_direktur_test.jpg', size: 102400, type: 'image/jpeg' };
    const mockInput = { files: [mockFile], value: 'C:\\fake\\path' };
    profileController.handleDirectorPhotoUpload(mockInput);
    assert(document.getElementById('profDirPhotoPreview').src.length > 0);
    assert(adminState.profileDirectorData.photo.length > 0);

    // Simulate Guide Photo Upload
    const mockGuideInput = { files: [mockFile], value: 'C:\\fake\\path' };
    profileController.handleGuidePhotoUpload(mockGuideInput);
    assert(document.getElementById('guideFormPhotoPreview').src.length > 0);
    assert(document.getElementById('guideFormPhoto').value.length > 0);
});

// -----------------------------------------------------------------------------
// 5. UJI SERVICE WORKER PRECACHE & VERSIONING (sw.js)
// -----------------------------------------------------------------------------
const swJs = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

test('13. sw.js mem-precache admin-profile.js dan cache version naik ke minimal v84', () => {
    const vMatch = swJs.match(/sdw-umroh-pwa-v(\d+)/);
    const v = vMatch ? parseInt(vMatch[1], 10) : 0;
    assert(v >= 84, `Versi cache harus minimal v84, terdeteksi: v${v}`);
    assert(swJs.includes("'/js/admin/admin-profile.js'"));
});

console.log(`\n======================================================`);
console.log(`Pengujian Selesai: ${passCount} / 13 Berhasil (100%)`);
console.log(`======================================================\n`);
