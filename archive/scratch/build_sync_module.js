const fs = require('fs');

const adminCore = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = adminCore.split('\n');

function getRange(start, end) {
    return lines.slice(start - 1, end).join('\n');
}

let syncCode = getRange(3448, 3760);

const replacements = [
    ['syncQueue', 'admin.syncQueue'],
    ['syncHistory', 'admin.syncHistory'],
    ['isSyncing', 'admin.isSyncing'],
    ['lastSyncTimestamp', 'admin.lastSyncTimestamp'],
    ['currentRole', 'admin.currentRole'],
    ['STORAGE_KEYS', 'admin.STORAGE_KEYS'],
    ['persistStorage', 'admin.persistStorage'],
    ['showToast', 'admin.showToast'],
    ['escapeHtml', 'admin.escapeHtml'],
    ['openModal', 'admin.openModal']
];

replacements.forEach(([from, to]) => {
    const regex = new RegExp(`(?<!admin\\.)\\b${from}\\b`, 'g');
    syncCode = syncCode.replace(regex, to);
});

const fullModule = `/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: OFFLINE-FIRST TWO-WAY SYNC ENGINE
 * File: js/admin/admin-sync.js
 * Version: 2.7.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state.js'));
    } else {
        root.SDW_ADMIN = root.SDW_ADMIN || {};
        factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (admin) {
    'use strict';

    admin = admin || {};

${syncCode}

    // Attach all exported functions to admin
    admin.initSyncEngine = initSyncEngine;
    admin.enqueueMutation = enqueueMutation;
    admin.flushSyncQueue = flushSyncQueue;
    admin.updateSyncUI = updateSyncUI;
    admin.renderSyncStatusModal = renderSyncStatusModal;
    admin.openSyncStatusModal = openSyncStatusModal;
    admin.triggerManualSync = triggerManualSync;
    admin.clearSyncHistory = clearSyncHistory;
    admin.getSyncQueue = () => admin.syncQueue;
    admin.getSyncHistory = () => admin.syncHistory;

    return admin;
});
`;

fs.writeFileSync('js/admin/admin-sync.js', fullModule, 'utf8');
console.log('Sync module written. Lines:', fullModule.split('\n').length);
