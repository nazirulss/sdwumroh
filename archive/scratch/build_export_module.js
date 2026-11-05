const fs = require('fs');

const adminCore = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = adminCore.split('\n');

function getRange(start, end) {
    return lines.slice(start - 1, end).join('\n');
}

let exportCode = getRange(2409, 2568);

const replacements = [
    ['leadsData', 'admin.leadsData'],
    ['registrationsData', 'admin.registrationsData'],
    ['paymentsData', 'admin.paymentsData'],
    ['tripsData', 'admin.tripsData'],
    ['auditLogs', 'admin.auditLogs'],
    ['manifestData', 'admin.manifestData'],
    ['roomsData', 'admin.roomsData'],
    ['logisticsData', 'admin.logisticsData'],
    ['manasikData', 'admin.manasikData'],
    ['logAdminAudit', 'admin.logAdminAudit'],
    ['showToast', 'admin.showToast']
];

replacements.forEach(([from, to]) => {
    const regex = new RegExp(`(?<!admin\\.)\\b${from}\\b`, 'g');
    exportCode = exportCode.replace(regex, to);
});

const fullModule = `/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: BUSINESS INTELLIGENCE CSV EXPORT ENGINE
 * File: js/admin/admin-export.js
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

${exportCode}

    // Attach all exported functions to admin
    admin.exportToCSV = exportToCSV;
    admin.downloadCSV = downloadCSV;

    return admin;
});
`;

fs.writeFileSync('js/admin/admin-export.js', fullModule, 'utf8');
console.log('Export module written. Lines:', fullModule.split('\n').length);
