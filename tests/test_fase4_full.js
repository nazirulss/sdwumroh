/**
 * Test Harness for Fase 4: Integrasi Dua Arah Backend & Offline-First Sync Engine
 */

const fs = require('fs');
const path = require('path');

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

global.navigator = {
    onLine: true
};

const domElements = {};
function createMockElement(id) {
    return {
        id: id,
        value: '',
        innerText: '',
        textContent: '',
        innerHTML: '',
        className: '',
        classList: {
            add: function() {},
            remove: function() {},
            contains: function() { return false; }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        reset: () => {},
        addEventListener: () => {}
    };
}

global.document = {
    getElementById: (id) => {
        if (!domElements[id]) domElements[id] = createMockElement(id);
        return domElements[id];
    },
    querySelectorAll: (selector) => [],
    querySelector: (selector) => null,
    addEventListener: () => {},
    createElement: (tag) => createMockElement(tag),
    body: createMockElement('body')
};

global.window = {
    addEventListener: () => {},
    innerWidth: 1024,
    localStorage: global.localStorage,
    sessionStorage: global.sessionStorage
};

// Load dependencies
require('../js/data-mock.js');
require('../js/app-config.js');
const apiModule = require('../js/api.js');
global.SDW_API = apiModule;
const adminModule = require('../js/admin-core.js');

console.log('=== TEST SUITE FASE 4: BACKEND & OFFLINE-FIRST SYNC ENGINE ===');

// Test 1: Inisialisasi Sync Engine
adminModule.init();
console.log('Test 1: Admin init() passed');

// Test 2: Enqueue Single Mutation
adminModule.enqueueMutation('createLead', { id: 'LED-TEST-001', name: 'Test Lead' }, 'DB_Leads', 'LED-TEST-001');
let queue = adminModule.getSyncQueue();
if (queue.length === 1 && queue[0].action === 'createLead') {
    console.log('Test 2: Enqueue Mutation passed (Queue size: 1)');
} else {
    console.error('Test 2 FAILED: Expected queue size 1, got', queue.length);
    process.exit(1);
}

// Test 3: Multiple Mutations Enqueue (All 9 actions)
const actionsToTest = [
    { action: 'registerPilgrim', payload: { id: 'REG-TEST-001', customer: 'Jamaah B' }, entity: 'DB_Registrations' },
    { action: 'createPayment', payload: { id: 'PAY-TEST-001', amount: 'Rp 15.000.000' }, entity: 'DB_Payments' },
    { action: 'verifyPayment', payload: { paymentId: 'PAY-TEST-001', status: 'VERIFIED' }, entity: 'DB_Payments' },
    { action: 'verifyDocument', payload: { docId: 'DOC-TEST-001', status: 'VERIFIED' }, entity: 'DB_Pilgrim_Documents' },
    { action: 'createTrip', payload: { id: 'TRP-TEST-001', title: 'Kloter Test' }, entity: 'DB_Trips' },
    { action: 'updateManifest', payload: { manifestId: 'MNF-001', boarded: true }, entity: 'DB_Trip_Members' },
    { action: 'updateRooming', payload: { roomId: 'ROOM-001', occupant: 'Ahmad' }, entity: 'DB_Trip_Members' }
];

actionsToTest.forEach(item => {
    adminModule.enqueueMutation(item.action, item.payload, item.entity, item.payload.id || item.payload.paymentId || item.payload.docId || item.payload.manifestId || item.payload.roomId);
});

queue = adminModule.getSyncQueue();
console.log('Test 3: Batch Enqueue passed (Total queue items:', queue.length, ')');
if (queue.length !== 8) {
    console.error('Test 3 FAILED: Expected 8 items in queue');
    process.exit(1);
}

// Test 4: Offline Resilience Test
global.navigator.onLine = false;
adminModule.updateSyncUI();
let headerText = domElements['adminSyncText'] ? domElements['adminSyncText'].textContent : '';
console.log('Test 4: Offline UI status banner:', headerText);
if (!headerText.includes('Offline')) {
    console.error('Test 4 FAILED: Expected header to indicate Offline status');
    process.exit(1);
}

// Test 5: Flush Sync Queue Simulation via SDW_API
global.navigator.onLine = true;
adminModule.flushSyncQueue().then(() => {
    setTimeout(() => {
        const remainingQueue = adminModule.getSyncQueue();
        const history = adminModule.getSyncHistory();
        console.log('Test 5: After flushSyncQueue -> Remaining Queue:', remainingQueue.length, '| Sync History:', history.length);
        
        if (remainingQueue.length === 0 && history.length >= 8) {
            console.log('Test 5: Batch sync flush and audit log retention passed 100%!');
        } else {
            console.error('Test 5 FAILED: Queue not flushed cleanly');
            process.exit(1);
        }

        // Test 6: Verify HTML Components
        const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');
        const requiredElements = [
            'adminSyncButton',
            'adminSyncIndicator',
            'adminSyncText',
            'dashSyncBadge',
            'dashSyncIndicator',
            'dashSyncText',
            'modalSyncStatus',
            'syncNetworkStatus',
            'syncPendingCount',
            'syncLastTime',
            'syncQueueContainer',
            'btnTriggerManualSync'
        ];

        let missing = [];
        requiredElements.forEach(id => {
            if (!adminHtml.includes(`id="${id}"`)) {
                missing.push(id);
            }
        });

        if (missing.length === 0) {
            console.log('Test 6: All required Fase 4 HTML elements confirmed in admin.html!');
        } else {
            console.error('Test 6 FAILED: Missing HTML elements:', missing);
            process.exit(1);
        }

        console.log('\n======================================================');
        console.log('ALL FASE 4 INTEGRATION TESTS PASSED (100% SUCCESS)');
        console.log('======================================================');
        process.exit(0);
    }, 600);
}).catch(err => {
    console.error('Test 5 Error:', err);
    process.exit(1);
});

