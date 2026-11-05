const fs = require('fs');

const adminCore = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = adminCore.split('\n');

function getRange(start, end) {
    return lines.slice(start - 1, end).join('\n');
}

// Slice 1: renderAuditLogs, applyAuditFilter, resetAuditFilter (2313 - 2408)
let auditRenderCode = getRange(2313, 2408);

// Slice 2: logAdminAudit (2606 - 2632)
let logAdminAuditCode = getRange(2606, 2632);

// Slice 3: Security, Auto-lock, PIN Pad, Export incidents (3136 - 3258)
let lockPinCode = getRange(3136, 3258);

let combinedCode = [
    logAdminAuditCode,
    auditRenderCode,
    lockPinCode
].join('\n\n');

const replacements = [
    ['auditLogs', 'admin.auditLogs'],
    ['auditFilter', 'admin.auditFilter'],
    ['isScreenLocked', 'admin.isScreenLocked'],
    ['inactivityTimer', 'admin.inactivityTimer'],
    ['INACTIVITY_TIMEOUT_MS', 'admin.INACTIVITY_TIMEOUT_MS'],
    ['MASTER_PIN', 'admin.MASTER_PIN'],
    ['currentRole', 'admin.currentRole'],
    ['STORAGE_KEYS', 'admin.STORAGE_KEYS'],
    ['persistStorage', 'admin.persistStorage'],
    ['enqueueMutation', 'admin.enqueueMutation'],
    ['showToast', 'admin.showToast'],
    ['escapeHtml', 'admin.escapeHtml'],
    ['downloadCSV', 'admin.downloadCSV']
];

replacements.forEach(([from, to]) => {
    const regex = new RegExp(`(?<!admin\\.)\\b${from}\\b`, 'g');
    combinedCode = combinedCode.replace(regex, to);
});

const fullModule = `/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: AUDIT LOGS & PIN SCREEN LOCK
 * File: js/admin/admin-security.js
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

${combinedCode}

    // Attach all exported functions to admin
    admin.logAdminAudit = logAdminAudit;
    admin.renderAuditLogs = renderAuditLogs;
    admin.applyAuditFilter = applyAuditFilter;
    admin.resetAuditFilter = resetAuditFilter;
    admin.initInactivityTracker = initInactivityTracker;
    admin.lockScreen = lockScreen;
    admin.unlockScreen = unlockScreen;
    admin.appendLockPin = appendLockPin;
    admin.clearLockPin = clearLockPin;
    admin.handleUnlock = handleUnlock;
    admin.exportSecurityIncidents = exportSecurityIncidents;

    return admin;
});
`;

fs.writeFileSync('js/admin/admin-security.js', fullModule, 'utf8');
console.log('Security module written. Lines:', fullModule.split('\n').length);
