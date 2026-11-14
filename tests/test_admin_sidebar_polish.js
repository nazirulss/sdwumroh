/**
 * ====================================================================
 * UNIT TEST: Admin Sidebar Polish & Desktop Mini Collapsible Mode
 * File: tests/test_admin_sidebar_polish.js
 * ====================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
const adminHtmlPath = path.join(rootDir, 'admin.html');
const adminNavJsPath = path.join(rootDir, 'js/admin/admin-nav.js');
const swJsPath = path.join(rootDir, 'sw.js');

const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const adminNavJs = fs.readFileSync(adminNavJsPath, 'utf8');
const swJs = fs.readFileSync(swJsPath, 'utf8');

console.log('🧪 Memulai Pengujian Sidebar Polish (Asnawiyyah Mini Mode & Badge Cleanup)...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
    }
}

// 1. Verifikasi Tombol Toggle Mini Sidebar Desktop
runTest('1. admin.html memiliki tombol floating sidebarCollapseBtn dengan icon dan onclick toggleSidebarCollapse', () => {
    assert(adminHtml.includes('id="sidebarCollapseBtn"'), 'Elemen sidebarCollapseBtn tidak ditemukan');
    assert(adminHtml.includes('SDW_ADMIN.toggleSidebarCollapse()'), 'Handler SDW_ADMIN.toggleSidebarCollapse() tidak ditemukan');
    assert(adminHtml.includes('id="sidebarCollapseIcon"'), 'Elemen sidebarCollapseIcon tidak ditemukan');
});

// 2. Verifikasi Aturan CSS Collapsed Desktop Mini Sidebar
runTest('2. admin.html memiliki aturan CSS lengkap untuk #adminSidebar.collapsed (~4.75rem, hide-on-collapse, nav-item-btn)', () => {
    assert(adminHtml.includes('#adminSidebar.collapsed'), 'CSS #adminSidebar.collapsed tidak ditemukan');
    assert(adminHtml.includes('4.75rem'), 'Lebar mini sidebar 4.75rem tidak ditemukan di CSS');
    assert(adminHtml.includes('.sidebar-hide-on-collapse'), 'Selector .sidebar-hide-on-collapse tidak ditemukan');
    assert(adminHtml.includes('.nav-item-btn'), 'Selector .nav-item-btn tidak ditemukan');
});

// 3. Verifikasi Pembersihan Badge Statis & Preservasi Actionable Badges
runTest('3. admin.html membersihkan badge statis di sidebar (Media, Edukasi, Resmi, Matrix) dan mempertahankan badge aksi (4, 3, 1)', () => {
    const sidebarHtml = adminHtml.substring(adminHtml.indexOf('<aside id="adminSidebar"'), adminHtml.indexOf('</aside>'));

    // Statis yang dihapus dari tampilan teks menu di sidebar:
    assert(!sidebarHtml.includes('>Media</span>'), 'Badge statis Media masih muncul di sidebar');
    assert(!sidebarHtml.includes('>Edukasi</span>'), 'Badge statis Edukasi masih muncul di sidebar');
    assert(!sidebarHtml.includes('>Resmi</span>'), 'Badge statis Resmi masih muncul di sidebar');
    assert(!sidebarHtml.includes('>Matrix</span>'), 'Badge statis Matrix masih muncul di sidebar');
    assert(!sidebarHtml.includes('>Flight Hub</span>'), 'Badge statis Flight Hub masih muncul di sidebar');

    // Badge numerik aksi tetap ada:
    assert(sidebarHtml.includes('>4</span>'), 'Badge angka 4 pada Leads tidak ditemukan');
    assert(sidebarHtml.includes('>3</span>'), 'Badge angka 3 pada Verifikasi Paspor tidak ditemukan');
    assert(sidebarHtml.includes('>1</span>'), 'Badge angka 1 pada Invoice tidak ditemukan');

    // ID kompatibilitas DOM tetap ada:
    assert(sidebarHtml.includes('id="badgeDepartureCount"'), 'ID badgeDepartureCount hilang');
    assert(sidebarHtml.includes('id="badgeHotelCount"'), 'ID badgeHotelCount hilang');
    assert(sidebarHtml.includes('id="badgePackageCount"'), 'ID badgePackageCount hilang');
});

// 4. Verifikasi Footer Minimalis Asnawiyyah Style
runTest('4. admin.html memiliki footer tautan minimalis sdwumroh.com dengan sidebar-hide-on-collapse', () => {
    assert(adminHtml.includes('sdwumroh.com'), 'Teks footer sdwumroh.com tidak ditemukan');
    assert(adminHtml.includes('fa-arrow-up-right-from-square'), 'Icon external link di footer tidak ditemukan');
    assert(adminHtml.includes('sidebar-hide-on-collapse'), 'Class sidebar-hide-on-collapse di footer tidak ditemukan');
});

// 5. Verifikasi Ekspor Fungsi toggleSidebarCollapse di admin-nav.js
runTest('5. admin-nav.js mengekspor fungsi toggleSidebarCollapse dan initSidebarCollapseState', () => {
    assert(adminNavJs.includes('function toggleSidebarCollapse'), 'Definisi toggleSidebarCollapse tidak ditemukan');
    assert(adminNavJs.includes('function initSidebarCollapseState'), 'Definisi initSidebarCollapseState tidak ditemukan');
    assert(adminNavJs.includes('admin.toggleSidebarCollapse = toggleSidebarCollapse'), 'Export admin.toggleSidebarCollapse tidak ditemukan');
});

// 6. Verifikasi Logika Toggle & DOM Mocking
runTest('6. toggleSidebarCollapse mengubah class collapsed, membalik chevron icon, dan menyimpan ke localStorage', () => {
    // Setup Mock DOM
    const sidebarClasses = new Set();
    const mockSidebar = {
        classList: {
            add: (c) => sidebarClasses.add(c),
            remove: (c) => sidebarClasses.delete(c),
            contains: (c) => sidebarClasses.has(c)
        }
    };

    let iconClass = 'fa-solid fa-chevron-left text-[9px]';
    const mockIcon = {
        get className() { return iconClass; },
        set className(val) { iconClass = val; }
    };

    const mockBtn = {
        attrs: {},
        setAttribute: (k, v) => { mockBtn.attrs[k] = v; }
    };

    const mockStorage = {};
    const globalStorage = {
        setItem: (k, v) => { mockStorage[k] = v; },
        getItem: (k) => mockStorage[k] || null
    };

    // Load admin-nav in simulated context
    const SDW_ADMIN = {};
    const factory = new Function('module', 'require', 'self', 'localStorage', 'document', 'window', `
        ${adminNavJs}
        return (typeof module !== 'undefined' && module.exports) ? module.exports : self.SDW_ADMIN;
    `);

    const mockDoc = {
        getElementById: (id) => {
            if (id === 'adminSidebar') return mockSidebar;
            if (id === 'sidebarCollapseIcon') return mockIcon;
            if (id === 'sidebarCollapseBtn') return mockBtn;
            return null;
        },
        querySelectorAll: () => [],
        addEventListener: () => {}
    };

    const loadedAdmin = factory({}, () => ({}), { SDW_ADMIN }, globalStorage, mockDoc, { innerWidth: 1024 });

    // Test collapse action:
    loadedAdmin.toggleSidebarCollapse(true);
    assert(mockSidebar.classList.contains('collapsed'), 'Sidebar harus memiliki class collapsed');
    assert(mockIcon.className.includes('fa-chevron-right'), 'Icon harus berubah menjadi fa-chevron-right');
    assert.strictEqual(mockStorage['sdw_admin_sidebar_collapsed'], 'true', 'State harus tersimpan true di localStorage');

    // Test expand action:
    loadedAdmin.toggleSidebarCollapse(false);
    assert(!mockSidebar.classList.contains('collapsed'), 'Sidebar tidak boleh memiliki class collapsed');
    assert(mockIcon.className.includes('fa-chevron-left'), 'Icon harus berubah menjadi fa-chevron-left');
    assert.strictEqual(mockStorage['sdw_admin_sidebar_collapsed'], 'false', 'State harus tersimpan false di localStorage');
});

console.log(`\n======================================================`);
console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`======================================================\n`);

if (passedTests !== totalTests) {
    process.exit(1);
}
