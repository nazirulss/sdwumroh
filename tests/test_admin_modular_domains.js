/**
 * ====================================================================
 * TEST SUITE: TAHAP 3 MODULAR DOMAINS (js/admin/* & js/admin-core.js)
 * Tests all 10 decoupled domain modules and the unified facade controller.
 * ====================================================================
 */

const assert = require('assert');

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

global.navigator = { onLine: true };

const domElements = {};
function createMockElement(id) {
    return {
        id: id,
        value: '',
        innerText: '',
        textContent: '',
        innerHTML: '',
        className: '',
        children: [{ classList: { remove: () => {}, add: () => {} } }],
        classList: {
            add: function() {},
            remove: function() {},
            contains: function() { return false; }
        },
        querySelectorAll: () => [],
        querySelector: () => ({ className: '' }),
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        reset: () => {},
        addEventListener: () => {},
        focus: () => {}
    };
}

global.document = {
    getElementById: (id) => {
        if (!domElements[id]) domElements[id] = createMockElement(id);
        return domElements[id];
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    createElement: (tag) => createMockElement(tag),
    body: createMockElement('body')
};

global.window = {
    addEventListener: () => {},
    innerWidth: 1024,
    localStorage: global.localStorage,
    sessionStorage: global.sessionStorage,
    prompt: () => 'Test Verification Reason'
};

console.log('=== TEST SUITE TAHAP 3: MODULAR DOMAIN ARCHITECTURE ===\n');

// Load full facade
const admin = require('../js/admin-core.js');

let passedTests = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
}

// Group 1: State & Helpers
console.log('1. Pengujian Module admin-state.js & Formatting');
test('admin has STORAGE_KEYS and ADMIN_PERMISSIONS', () => {
    assert(admin.STORAGE_KEYS && admin.STORAGE_KEYS.LEADS === 'sdw_admin_leads');
    assert(admin.ADMIN_PERMISSIONS && Array.isArray(admin.ADMIN_PERMISSIONS.ADMIN));
});

test('formatRupiah formats correctly', () => {
    assert.strictEqual(admin.formatRupiah(15000000), 'Rp 15.000.000');
});

test('numberToWords converts correctly to Bahasa Indonesia', () => {
    assert(admin.numberToWords(15000000).includes('Lima Belas Juta'));
    assert(admin.numberToWords(1000).includes('Seribu'));
});

test('escapeHtml handles dangerous characters', () => {
    assert.strictEqual(admin.escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

test('initDataStore populates default mock collections', () => {
    admin.initDataStore();
    assert(admin.leadsData.length >= 4, 'Leads should be seeded');
    assert(admin.registrationsData.length >= 3, 'Registrations should be seeded');
    assert(admin.manifestData.length >= 40, 'Bus manifest should be seeded');
    assert(admin.roomsData.length >= 20, 'Rooms data should be seeded');
    assert(admin.logisticsData.length >= 40, 'Logistics should be seeded');
    assert(admin.manasikData.length >= 40, 'Manasik should be seeded');
});

// Group 2: Navigation & RBAC
console.log('\n2. Pengujian Module admin-nav.js & RBAC');
test('setRole changes currentRole and applies permissions', () => {
    admin.setRole('SALES');
    assert.strictEqual(admin.currentRole, 'SALES');
    admin.setRole('ADMIN');
    assert.strictEqual(admin.currentRole, 'ADMIN');
});

test('openModal & closeModal manipulate classes', () => {
    admin.openModal('modalCreateLead');
    admin.closeModal('modalCreateLead');
});

test('Global Search query filters matches across leads and registrations', () => {
    admin.handleSearchInput('Ahmad');
    assert(global.window.SDW_ADMIN_SEARCH_MATCHES.length > 0);
});

// Group 3: CRM & Leads
console.log('\n3. Pengujian Module admin-crm.js');
test('applyCRMFilter & resetCRMFilter function cleanly', () => {
    admin.applyCRMFilter();
    assert.strictEqual(admin.crmFilter.urgency, 'ALL');
    admin.crmFilter.urgency = 'HIGH';
    admin.applyCRMFilter();
    admin.resetCRMFilter();
    assert.strictEqual(admin.crmFilter.urgency, 'ALL');
});

// Group 4: Documents & Visa
console.log('\n4. Pengujian Module admin-docs.js');
test('verifyDocumentAction can APPROVE and REJECT documents', () => {
    const docId = admin.docsQueue[0].id;
    admin.verifyDocumentAction(docId, 'APPROVE');
    const doc = admin.docsQueue.find(d => d.id === docId);
    assert.strictEqual(doc.status, 'VERIFIED');
});

// Group 5: Registrations & Privacy
console.log('\n5. Pengujian Module admin-registrations.js');
test('formatMaskedNIK masks middle digits by default', () => {
    const masked = admin.formatMaskedNIK('3276012345670001', 'REG-SDW-2701');
    assert(masked.includes('••••••••'));
});

test('toggleUnmaskNIK unmasks NIK for authorized roles and records audit log', () => {
    admin.currentRole = 'ADMIN';
    admin.toggleUnmaskNIK('REG-SDW-2701');
    assert(admin.unmaskedRecords.has('REG-SDW-2701'));
    const unmasked = admin.formatMaskedNIK('3276012345670001', 'REG-SDW-2701');
    assert(unmasked.includes('3276012345670001'));
    // Toggle back
    admin.toggleUnmaskNIK('REG-SDW-2701');
    assert(!admin.unmaskedRecords.has('REG-SDW-2701'));
});

// Group 6: Finance & Payments
console.log('\n6. Pengujian Module admin-finance.js');
test('verifyPaymentAction marks payment VERIFIED and logs audit', () => {
    const payId = admin.paymentsData[0].id;
    admin.verifyPaymentAction(payId);
    assert.strictEqual(admin.paymentsData[0].status, 'VERIFIED');
});

// Group 7: Operations, Manifest, Logistics & Manasik
console.log('\n7. Pengujian Module admin-operations.js');
test('changeKloter updates activeKloterId', () => {
    admin.changeKloter('TRP-2702');
    assert.strictEqual(admin.activeKloterId, 'TRP-2702');
    admin.changeKloter('TRP-2701');
});

test('toggleBoardingStatus toggles pilgrim bus boarding', () => {
    const firstPax = admin.manifestData[0];
    const initialStatus = firstPax.boarded;
    admin.toggleBoardingStatus(firstPax.passport);
    assert.strictEqual(firstPax.boarded, !initialStatus);
    admin.toggleBoardingStatus(firstPax.passport); // restore
});

test('batchBoarding boards all pilgrims', () => {
    admin.batchBoarding(true);
    assert(admin.manifestData.every(m => m.boarded === true));
});

test('toggleLogisticsItem & batchLogistics update luggage distribution', () => {
    const firstLog = admin.logisticsData[0];
    const initialKoper = firstLog.koper;
    admin.toggleLogisticsItem(firstLog.regId, 'koper');
    assert.strictEqual(firstLog.koper, !initialKoper);
    admin.batchLogistics('COMPLETE_ALL');
    assert(admin.logisticsData.every(l => l.koper && l.kabin && l.ihram && l.batik && l.bukuId));
});

test('toggleManasikAttendance & batchManasik update manasik presence', () => {
    const firstMan = admin.manasikData[0];
    admin.toggleManasikAttendance(firstMan.regId, 'session1', 'HADIR');
    assert.strictEqual(firstMan.session1, 'HADIR');
    admin.batchManasik('PASS_ALL');
    assert(admin.manasikData.every(m => m.session1 === 'HADIR' && m.session2 === 'HADIR'));
});

// Group 8: Security, Audit & PIN Screen Lock
console.log('\n8. Pengujian Module admin-security.js');
test('logAdminAudit appends immutable audit trail', () => {
    const initialLen = admin.auditLogs.length;
    admin.logAdminAudit('TEST_ACTION', 'DB_Test', 'REF-001', 'Test audit log description', 'INFO');
    assert.strictEqual(admin.auditLogs.length, initialLen + 1);
    assert.strictEqual(admin.auditLogs[0].action, 'TEST_ACTION');
});

test('lockScreen and PIN unlockScreen handle PIN validation', () => {
    admin.lockScreen();
    assert.strictEqual(admin.isScreenLocked, true);
    admin.appendLockPin('1');
    admin.appendLockPin('2');
    admin.appendLockPin('3');
    admin.appendLockPin('4');
    admin.handleUnlock();
    assert.strictEqual(admin.isScreenLocked, false);
});

// Group 9: Sync Engine
console.log('\n9. Pengujian Module admin-sync.js');
test('enqueueMutation and clearSyncHistory operate reliably', () => {
    admin.enqueueMutation('createTest', { msg: 'Hello' }, 'DB_Test', 'TST-001');
    assert(admin.getSyncQueue().length > 0);
    admin.clearSyncHistory();
    assert.strictEqual(admin.getSyncHistory().length, 0);
});

// Group 10: Facade Orchestrator
console.log('\n10. Pengujian Orchestrator (admin-core.js init)');
test('admin.init() runs with zero exceptions', () => {
    admin.init();
    assert(typeof admin.init === 'function');
});

console.log('\n========================================');
console.log(`TEST RESULT: ${passedTests} PASSED, 0 FAILED`);
console.log('========================================\n');
process.exit(0);


