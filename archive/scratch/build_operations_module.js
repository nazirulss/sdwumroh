const fs = require('fs');

const adminCore = fs.readFileSync('js/admin-core.js', 'utf8');
const lines = adminCore.split('\n');

function getRange(start, end) {
    return lines.slice(start - 1, end).join('\n');
}

let handleCreateTripCode = getRange(694, 738);
let openTripManifestModalCode = getRange(785, 870);
let opsHubCode = getRange(1509, 2311);
let logisticsManasikCode = getRange(2633, 3096);

let combinedCode = [
    handleCreateTripCode,
    openTripManifestModalCode,
    opsHubCode,
    logisticsManasikCode
].join('\n\n');

// Replace identifiers cleanly with admin.xxx
const replacements = [
    ['tripsData', 'admin.tripsData'],
    ['manifestData', 'admin.manifestData'],
    ['roomsData', 'admin.roomsData'],
    ['logisticsData', 'admin.logisticsData'],
    ['manasikData', 'admin.manasikData'],
    ['operationsSubtab', 'admin.operationsSubtab'],
    ['activeKloterId', 'admin.activeKloterId'],
    ['manifestFilter', 'admin.manifestFilter'],
    ['roomingFilter', 'admin.roomingFilter'],
    ['logisticsFilter', 'admin.logisticsFilter'],
    ['manasikFilter', 'admin.manasikFilter'],
    ['STORAGE_KEYS', 'admin.STORAGE_KEYS'],
    ['persistStorage', 'admin.persistStorage'],
    ['enqueueMutation', 'admin.enqueueMutation'],
    ['logAdminAudit', 'admin.logAdminAudit'],
    ['showToast', 'admin.showToast'],
    ['openModal', 'admin.openModal'],
    ['closeModal', 'admin.closeModal'],
    ['escapeHtml', 'admin.escapeHtml'],
    ['formatRupiah', 'admin.formatRupiah']
];

replacements.forEach(([from, to]) => {
    // Avoid double prefixing e.g. admin.admin.xxx
    const regex = new RegExp(`(?<!admin\\.)\\b${from}\\b`, 'g');
    combinedCode = combinedCode.replace(regex, to);
});

const fullModule = `/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: OPERATIONS & TANAH SUCI LOGISTICS
 * File: js/admin/admin-operations.js
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
    admin.handleCreateTrip = handleCreateTrip;
    admin.openTripManifestModal = openTripManifestModal;
    admin.switchOperationsSubtab = switchOperationsSubtab;
    admin.changeKloter = changeKloter;
    admin.renderOperations = renderOperations;
    admin.renderBusManifest = renderBusManifest;
    admin.toggleBoardingStatus = toggleBoardingStatus;
    admin.batchBoarding = batchBoarding;
    admin.openAssignBusModal = openAssignBusModal;
    admin.handleAssignBus = handleAssignBus;
    admin.applyManifestFilter = applyManifestFilter;
    admin.resetManifestFilter = resetManifestFilter;
    admin.renderRoomingList = renderRoomingList;
    admin.switchRoomingCity = switchRoomingCity;
    admin.applyRoomingFilter = applyRoomingFilter;
    admin.resetRoomingFilter = resetRoomingFilter;
    admin.openAssignRoomModal = openAssignRoomModal;
    admin.handleAssignRoom = handleAssignRoom;
    admin.renderAirportHandling = renderAirportHandling;
    admin.renderTripsList = renderTripsList;
    admin.renderLogistics = renderLogistics;
    admin.toggleLogisticsItem = toggleLogisticsItem;
    admin.toggleLogisticsComplete = toggleLogisticsComplete;
    admin.batchLogistics = batchLogistics;
    admin.applyLogisticsFilter = applyLogisticsFilter;
    admin.resetLogisticsFilter = resetLogisticsFilter;
    admin.renderManasik = renderManasik;
    admin.toggleManasikAttendance = toggleManasikAttendance;
    admin.toggleManasikPassBoth = toggleManasikPassBoth;
    admin.batchManasik = batchManasik;
    admin.applyManasikFilter = applyManasikFilter;
    admin.resetManasikFilter = resetManasikFilter;

    return admin;
});
`;

fs.writeFileSync('js/admin/admin-operations.js', fullModule, 'utf8');
console.log('Operations module written. Lines:', fullModule.split('\n').length);
