/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: STATE & DATA STORE
 * File: js/admin/admin-state.js
 * Version: 2.7.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_ADMIN = root.SDW_ADMIN || {};
        factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (admin) {
    'use strict';

    admin = admin || {};

    // 1. LocalStorage Keys
    const STORAGE_KEYS = {
        LEADS: 'sdw_admin_leads',
        REGS: 'sdw_admin_registrations',
        PAYMENTS: 'sdw_admin_payments',
        TRIPS: 'sdw_admin_trips',
        DOCS: 'sdw_admin_docs',
        AUDIT: 'sdw_admin_audit_logs',
        MANIFEST: 'sdw_admin_manifest',
        ROOMS: 'sdw_admin_rooms',
        SYNC_QUEUE: 'sdw_offline_queue',
        SYNC_HISTORY: 'sdw_sync_history',
        LAST_SYNC: 'sdw_last_sync_timestamp',
        LOGISTICS: 'sdw_admin_logistics',
        MANASIK: 'sdw_admin_manasik',
        CERTS: 'sdw_admin_certificates',
        BADAL: 'sdw_admin_badal_certificates',
        PACKAGES: 'sdw_admin_packages'
    };

    // 2. RBAC Permissions Mapping untuk Menu Admin
    const ADMIN_PERMISSIONS = {
        'ADMIN': ['tab-dashboard', 'tab-crm', 'tab-packages', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-certificates', 'tab-badal-certificates', 'tab-audit'],
        'MANAGER': ['tab-dashboard', 'tab-crm', 'tab-packages', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-certificates', 'tab-badal-certificates', 'tab-audit'],
        'OWNER': ['tab-dashboard', 'tab-crm', 'tab-packages', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-certificates', 'tab-badal-certificates', 'tab-audit'],
        'SALES': ['tab-dashboard', 'tab-crm', 'tab-packages', 'tab-registrations'],
        'DOCUMENT_OFFICER': ['tab-dashboard', 'tab-docs', 'tab-registrations'],
        'FINANCE': ['tab-dashboard', 'tab-registrations', 'tab-finance', 'tab-audit'],
        'OPERATIONS': ['tab-dashboard', 'tab-packages', 'tab-registrations', 'tab-operations', 'tab-certificates', 'tab-badal-certificates', 'tab-docs'],
        'TOUR_LEADER': ['tab-dashboard', 'tab-operations', 'tab-certificates', 'tab-badal-certificates']
    };

    // 3. Central Reactive State Container
    const state = {
        currentTab: 'tab-dashboard',
        currentRole: 'ADMIN',
        activeFilter: 'ALL',
        crmFilter: { search: '', urgency: 'ALL', status: 'ALL' },
        packagesFilter: { search: '', category: 'ALL', status: 'ALL' },
        docsFilter: { search: '', type: 'ALL', status: 'ALL' },
        regsFilter: { search: '', package: 'ALL', status: 'ALL' },
        financeFilter: { search: '', status: 'ALL', method: 'ALL' },
        auditFilter: { search: '', action: 'ALL', severity: 'ALL' },
        manifestFilter: { bus: 'ALL', status: 'ALL', search: '' },
        roomingFilter: { city: 'MAKKAH', type: 'ALL', gender: 'ALL', search: '' },
        logisticsFilter: { search: '', status: 'ALL' },
        manasikFilter: { search: '', status: 'ALL' },
        activeKloterId: 'TRP-2701',
        operationsSubtab: 'manifest',
        // In-memory collections
        leadsData: [],
        packagesData: [],
        registrationsData: [],
        paymentsData: [],
        tripsData: [],
        docsQueue: [],
        auditLogs: [],
        manifestData: [],
        roomsData: [],
        logisticsData: [],
        manasikData: [],
        // Sync engine state
        syncQueue: [],
        syncHistory: [],
        isSyncing: false,
        lastSyncTimestamp: null,
        // Security state
        unmaskedRecords: new Set(),
        isScreenLocked: false,
        inactivityTimer: null,
        INACTIVITY_TIMEOUT_MS: 15 * 60 * 1000,
        MASTER_PIN: '1234'
    };

    // 4. Utility Helpers
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatRupiah(num) {
        return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
    }

    function numberToWords(num) {
        const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        num = Math.floor(Math.abs(num));
        if (num < 12) return angka[num];
        if (num < 20) return numberToWords(num - 10) + " Belas";
        if (num < 100) return (numberToWords(Math.floor(num / 10)) + " Puluh " + numberToWords(num % 10)).replace(/\s+/g, ' ');
        if (num < 200) return ("Seratus " + numberToWords(num - 100)).replace(/\s+/g, ' ');
        if (num < 1000) return (numberToWords(Math.floor(num / 100)) + " Ratus " + numberToWords(num % 100)).replace(/\s+/g, ' ');
        if (num < 2000) return ("Seribu " + numberToWords(num - 1000)).replace(/\s+/g, ' ');
        if (num < 1000000) return (numberToWords(Math.floor(num / 1000)) + " Ribu " + numberToWords(num % 1000)).replace(/\s+/g, ' ');
        if (num < 1000000000) return (numberToWords(Math.floor(num / 1000000)) + " Juta " + numberToWords(num % 1000000)).replace(/\s+/g, ' ');
        if (num < 1000000000000) return (numberToWords(Math.floor(num / 1000000000)) + " Miliar " + numberToWords(num % 1000000000)).replace(/\s+/g, ' ');
        return num.toString();
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'CONFIRMED':
            case 'APPROVED':
            case 'VERIFIED':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'UNDER_REVIEW':
            case 'PENDING':
            case 'PENDING_DP':
            case 'PENDING_VERIFY':
                return 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse';
            case 'CANCELLED':
            case 'REJECTED':
                return 'bg-rose-100 text-rose-800 border border-rose-200';
            default:
                return 'bg-purple-100 text-purple-800 border border-purple-200';
        }
    }

    function showToast(msg) {
        if (typeof document === 'undefined') return;
        const toast = document.getElementById('adminToast');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        }, 3200);
    }

    function persistStorage(key, data) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal menyimpan data ke key ' + key + ':', e);
        }
    }

    // 5. Default Data Generators (Fase 3 & Fase 5)
    function getDefaultManifestData() {
        const bus01List = [
            { name: 'Ahmad Jamaah Teladan', gender: 'L', passport: 'A12345678', phone: '+62 812-3456-7890', rM: '1201', rD: '501', rType: 'Quad', boarded: true },
            { name: 'Bpk. Bambang Sutrisno', gender: 'L', passport: 'A12345679', phone: '+62 812-3456-7891', rM: '1201', rD: '501', rType: 'Quad', boarded: true },
            { name: 'Bpk. Choirul Anwar', gender: 'L', passport: 'A12345680', phone: '+62 812-3456-7892', rM: '1201', rD: '501', rType: 'Quad', boarded: false },
            { name: 'Bpk. Dedi Supardi', gender: 'L', passport: 'A12345681', phone: '+62 812-3456-7893', rM: '1201', rD: '501', rType: 'Quad', boarded: true },
            { name: 'Bpk. Hendra Wijaya', gender: 'L', passport: 'A12345682', phone: '+62 812-3456-7894', rM: '1202', rD: '502', rType: 'Quad', boarded: true },
            { name: 'Bpk. Fajar Ramadhan', gender: 'L', passport: 'A12345683', phone: '+62 812-3456-7895', rM: '1202', rD: '502', rType: 'Quad', boarded: true },
            { name: 'Bpk. Gunawan Pratama', gender: 'L', passport: 'A12345684', phone: '+62 812-3456-7896', rM: '1202', rD: '502', rType: 'Quad', boarded: true },
            { name: 'Bpk. Harun Ar-Rasyid', gender: 'L', passport: 'A12345685', phone: '+62 812-3456-7897', rM: '1202', rD: '502', rType: 'Quad', boarded: true },
            { name: 'Bpk. Irfan Hakim', gender: 'L', passport: 'A12345686', phone: '+62 812-3456-7898', rM: '1203', rD: '503', rType: 'Quad', boarded: true },
            { name: 'Bpk. Joko Subiantoro', gender: 'L', passport: 'A12345687', phone: '+62 812-3456-7899', rM: '1203', rD: '503', rType: 'Quad', boarded: true },
            { name: 'Bpk. Kusuma Wardhana', gender: 'L', passport: 'A12345688', phone: '+62 812-3456-7800', rM: '1203', rD: '503', rType: 'Quad', boarded: true },
            { name: 'Bpk. Lukman Hakim', gender: 'L', passport: 'A12345689', phone: '+62 812-3456-7801', rM: '1203', rD: '503', rType: 'Quad', boarded: true },
            { name: 'Ibu Hj. Fatimah Zahra', gender: 'P', passport: 'B87654321', phone: '+62 811-9876-5432', rM: '1204', rD: '504', rType: 'Quad', boarded: true },
            { name: 'Ibu Maryam Hasanah', gender: 'P', passport: 'B87654322', phone: '+62 811-9876-5433', rM: '1204', rD: '504', rType: 'Quad', boarded: true },
            { name: 'Ibu Nur Halimah', gender: 'P', passport: 'B87654323', phone: '+62 811-9876-5434', rM: '1204', rD: '504', rType: 'Quad', boarded: true },
            { name: 'Ibu Rahmawati Dewi', gender: 'P', passport: 'B87654324', phone: '+62 811-9876-5435', rM: '1204', rD: '504', rType: 'Quad', boarded: true },
            { name: 'Ibu Siti Khadijah', gender: 'P', passport: 'B87654325', phone: '+62 811-9876-5436', rM: '1205', rD: '505', rType: 'Quad', boarded: true },
            { name: 'Ibu Umi Kalsum', gender: 'P', passport: 'B87654326', phone: '+62 811-9876-5437', rM: '1205', rD: '505', rType: 'Quad', boarded: true },
            { name: 'Ibu Wahyuni', gender: 'P', passport: 'B87654327', phone: '+62 811-9876-5438', rM: '1205', rD: '505', rType: 'Quad', boarded: true },
            { name: 'Ibu Yuliana Safitri', gender: 'P', passport: 'B87654328', phone: '+62 811-9876-5439', rM: '1205', rD: '505', rType: 'Quad', boarded: true },
            { name: 'Ibu Zainab Aliyah', gender: 'P', passport: 'B87654329', phone: '+62 811-9876-5440', rM: '1206', rD: '506', rType: 'Quad', boarded: true },
            { name: 'Ibu Asma Nadia', gender: 'P', passport: 'B87654330', phone: '+62 811-9876-5441', rM: '1206', rD: '506', rType: 'Quad', boarded: true },
            { name: 'Ibu Balqis Maharani', gender: 'P', passport: 'B87654331', phone: '+62 811-9876-5442', rM: '1206', rD: '506', rType: 'Quad', boarded: true },
            { name: 'Ibu Citra Lestari', gender: 'P', passport: 'B87654332', phone: '+62 811-9876-5443', rM: '1206', rD: '506', rType: 'Quad', boarded: true },
            { name: 'Bpk. H. Surya Paloh M.', gender: 'L', passport: 'A12345690', phone: '+62 812-3456-7802', rM: '1501', rD: '601', rType: 'Double', boarded: true }
        ];

        const bus02List = [
            { name: 'Ibu Hj. Rosmala', gender: 'P', passport: 'B87654333', phone: '+62 811-9876-5444', rM: '1501', rD: '601', rType: 'Double', boarded: true },
            { name: 'Bpk. Ir. Gunawan Wibisono', gender: 'L', passport: 'A12345691', phone: '+62 812-3456-7803', rM: '1502', rD: '602', rType: 'Double', boarded: true },
            { name: 'Ibu Ir. Endang Sri M.', gender: 'P', passport: 'B87654334', phone: '+62 811-9876-5445', rM: '1502', rD: '602', rType: 'Double', boarded: true },
            { name: 'Bpk. H. Agus Salim', gender: 'L', passport: 'A12345692', phone: '+62 812-3456-7804', rM: '1503', rD: '603', rType: 'Double', boarded: true },
            { name: 'Ibu Hj. Nurjanah', gender: 'P', passport: 'B87654335', phone: '+62 811-9876-5446', rM: '1503', rD: '603', rType: 'Double', boarded: true },
            { name: 'Bpk. Drs. H. Mulyadi', gender: 'L', passport: 'A12345693', phone: '+62 812-3456-7805', rM: '1504', rD: '604', rType: 'Double', boarded: true },
            { name: 'Ibu Hj. Aminah', gender: 'P', passport: 'B87654336', phone: '+62 811-9876-5447', rM: '1504', rD: '604', rType: 'Double', boarded: true },
            { name: 'Bpk. H. Taufik Hidayat', gender: 'L', passport: 'A12345694', phone: '+62 812-3456-7806', rM: '1505', rD: '605', rType: 'Double', boarded: true },
            { name: 'Ibu Hj. Ami Kurnia', gender: 'P', passport: 'B87654337', phone: '+62 811-9876-5448', rM: '1505', rD: '605', rType: 'Double', boarded: true },
            { name: 'Bpk. H. Zulkifli Lubis', gender: 'L', passport: 'A12345695', phone: '+62 812-3456-7807', rM: '1506', rD: '606', rType: 'Double', boarded: true },
            { name: 'Ibu Hj. Nurlela Siregar', gender: 'P', passport: 'B87654338', phone: '+62 811-9876-5449', rM: '1506', rD: '606', rType: 'Double', boarded: true },
            { name: 'Bpk. Hendra Gunawan', gender: 'L', passport: 'A12345696', phone: '+62 812-3456-7808', rM: '1401', rD: '701', rType: 'Triple', boarded: true },
            { name: 'Ibu Rina Karlina', gender: 'P', passport: 'B87654339', phone: '+62 811-9876-5450', rM: '1401', rD: '701', rType: 'Triple', boarded: true },
            { name: 'Ananda Rizky Gunawan', gender: 'L', passport: 'A12345697', phone: '+62 812-3456-7809', rM: '1401', rD: '701', rType: 'Triple', boarded: true },
            { name: 'Bpk. H. Rahmat Hidayat', gender: 'L', passport: 'A12345698', phone: '+62 812-3456-7810', rM: '1402', rD: '702', rType: 'Triple', boarded: true },
            { name: 'Ibu Hj. Sulastri', gender: 'P', passport: 'B87654340', phone: '+62 811-9876-5451', rM: '1402', rD: '702', rType: 'Triple', boarded: false },
            { name: 'Ananda Nabila Hidayat', gender: 'P', passport: 'B87654341', phone: '+62 811-9876-5452', rM: '1402', rD: '702', rType: 'Triple', boarded: true },
            { name: 'Bpk. dr. Arif Rahman', gender: 'L', passport: 'A12345699', phone: '+62 812-3456-7811', rM: '1403', rD: '703', rType: 'Triple', boarded: true },
            { name: 'Ibu dr. Siti Sarah', gender: 'P', passport: 'B87654342', phone: '+62 811-9876-5453', rM: '1403', rD: '703', rType: 'Triple', boarded: true },
            { name: 'Ananda Farhan Rahman', gender: 'L', passport: 'A12345700', phone: '+62 812-3456-7812', rM: '1403', rD: '703', rType: 'Triple', boarded: true }
        ];

        const manifest = [];
        let seq = 1;

        bus01List.forEach(m => {
            const regId = `REG-SDW-${2700 + seq}`;
            manifest.push({
                id: regId,
                regId: regId,
                name: m.name,
                gender: m.gender,
                passport: m.passport,
                phone: m.phone,
                busId: 'Bus 01',
                seatNumber: seq <= 9 ? `0${seq}A` : `${seq}A`,
                roomMakkah: m.rM,
                roomMadinah: m.rD,
                roomType: m.rType,
                boarded: m.boarded,
                kloterId: 'TRP-2701'
            });
            seq++;
        });

        let seqBus2 = 1;
        bus02List.forEach(m => {
            const regId = `REG-SDW-${2700 + seq}`;
            manifest.push({
                id: regId,
                regId: regId,
                name: m.name,
                gender: m.gender,
                passport: m.passport,
                phone: m.phone,
                busId: 'Bus 02',
                seatNumber: seqBus2 <= 9 ? `0${seqBus2}B` : `${seqBus2}B`,
                roomMakkah: m.rM,
                roomMadinah: m.rD,
                roomType: m.rType,
                boarded: m.boarded,
                kloterId: 'TRP-2701'
            });
            seq++;
            seqBus2++;
        });

        return manifest;
    }

    function getDefaultRoomsData() {
        return [
            { id: 'RM-M-1201', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1201', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Ahmad Jamaah Teladan', 'Bpk. Bambang Sutrisno', 'Bpk. Choirul Anwar', 'Bpk. Dedi Supardi'] },
            { id: 'RM-M-1202', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1202', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Bpk. Hendra Wijaya', 'Bpk. Fajar Ramadhan', 'Bpk. Gunawan Pratama', 'Bpk. Harun Ar-Rasyid'] },
            { id: 'RM-M-1203', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1203', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Bpk. Irfan Hakim', 'Bpk. Joko Subiantoro', 'Bpk. Kusuma Wardhana', 'Bpk. Lukman Hakim'] },
            { id: 'RM-M-1204', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1204', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Hj. Fatimah Zahra', 'Ibu Maryam Hasanah', 'Ibu Nur Halimah', 'Ibu Rahmawati Dewi'] },
            { id: 'RM-M-1205', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1205', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Siti Khadijah', 'Ibu Umi Kalsum', 'Ibu Wahyuni', 'Ibu Yuliana Safitri'] },
            { id: 'RM-M-1206', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1206', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Zainab Aliyah', 'Ibu Asma Nadia', 'Ibu Balqis Maharani', 'Ibu Citra Lestari'] },
            { id: 'RM-M-1501', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1501', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Surya Paloh M.', 'Ibu Hj. Rosmala'] },
            { id: 'RM-M-1502', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1502', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. Ir. Gunawan Wibisono', 'Ibu Ir. Endang Sri M.'] },
            { id: 'RM-M-1503', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1503', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Agus Salim', 'Ibu Hj. Nurjanah'] },
            { id: 'RM-M-1504', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1504', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. Drs. H. Mulyadi', 'Ibu Hj. Aminah'] },
            { id: 'RM-M-1505', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1505', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Taufik Hidayat', 'Ibu Hj. Ami Kurnia'] },
            { id: 'RM-M-1506', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1506', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Zulkifli Lubis', 'Ibu Hj. Nurlela Siregar'] },
            { id: 'RM-M-1401', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1401', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. Hendra Gunawan', 'Ibu Rina Karlina', 'Ananda Rizky Gunawan'] },
            { id: 'RM-M-1402', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1402', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. H. Rahmat Hidayat', 'Ibu Hj. Sulastri', 'Ananda Nabila Hidayat'] },
            { id: 'RM-M-1403', hotel: 'Swissotel Makkah', city: 'MAKKAH', roomNo: '1403', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. dr. Arif Rahman', 'Ibu dr. Siti Sarah', 'Ananda Farhan Rahman'] },
            // Madinah Rooms
            { id: 'RM-D-501', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '501', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Ahmad Jamaah Teladan', 'Bpk. Bambang Sutrisno', 'Bpk. Choirul Anwar', 'Bpk. Dedi Supardi'] },
            { id: 'RM-D-502', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '502', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Bpk. Hendra Wijaya', 'Bpk. Fajar Ramadhan', 'Bpk. Gunawan Pratama', 'Bpk. Harun Ar-Rasyid'] },
            { id: 'RM-D-503', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '503', type: 'Quad', gender: 'L', capacity: 4, occupants: ['Bpk. Irfan Hakim', 'Bpk. Joko Subiantoro', 'Bpk. Kusuma Wardhana', 'Bpk. Lukman Hakim'] },
            { id: 'RM-D-504', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '504', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Hj. Fatimah Zahra', 'Ibu Maryam Hasanah', 'Ibu Nur Halimah', 'Ibu Rahmawati Dewi'] },
            { id: 'RM-D-505', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '505', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Siti Khadijah', 'Ibu Umi Kalsum', 'Ibu Wahyuni', 'Ibu Yuliana Safitri'] },
            { id: 'RM-D-506', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '506', type: 'Quad', gender: 'P', capacity: 4, occupants: ['Ibu Zainab Aliyah', 'Ibu Asma Nadia', 'Ibu Balqis Maharani', 'Ibu Citra Lestari'] },
            { id: 'RM-D-601', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '601', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Surya Paloh M.', 'Ibu Hj. Rosmala'] },
            { id: 'RM-D-602', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '602', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. Ir. Gunawan Wibisono', 'Ibu Ir. Endang Sri M.'] },
            { id: 'RM-D-603', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '603', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Agus Salim', 'Ibu Hj. Nurjanah'] },
            { id: 'RM-D-604', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '604', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. Drs. H. Mulyadi', 'Ibu Hj. Aminah'] },
            { id: 'RM-D-605', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '605', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Taufik Hidayat', 'Ibu Hj. Ami Kurnia'] },
            { id: 'RM-D-606', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '606', type: 'Double', gender: 'MIX', capacity: 2, occupants: ['Bpk. H. Zulkifli Lubis', 'Ibu Hj. Nurlela Siregar'] },
            { id: 'RM-D-701', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '701', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. Hendra Gunawan', 'Ibu Rina Karlina', 'Ananda Rizky Gunawan'] },
            { id: 'RM-D-702', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '702', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. H. Rahmat Hidayat', 'Ibu Hj. Sulastri', 'Ananda Nabila Hidayat'] },
            { id: 'RM-D-703', hotel: 'Dar Al Taqwa Madinah', city: 'MADINAH', roomNo: '703', type: 'Triple', gender: 'MIX', capacity: 3, occupants: ['Bpk. dr. Arif Rahman', 'Ibu dr. Siti Sarah', 'Ananda Farhan Rahman'] }
        ];
    }

    function getDefaultLogisticsData() {
        const manifest = (state.manifestData && state.manifestData.length) ? state.manifestData : getDefaultManifestData();
        return manifest.map((m, idx) => {
            const isDistributed = idx % 5 !== 1;
            return {
                id: `LOG-${(idx + 1).toString().padStart(4, '0')}`,
                regId: m.regId,
                name: m.name,
                phone: m.phone,
                koper: isDistributed,
                kabin: isDistributed,
                ihram: isDistributed,
                batik: isDistributed,
                bukuId: isDistributed,
                koperBagasi: isDistributed,
                tasKabin: isDistributed,
                kainIhram: isDistributed,
                batikSDW: isDistributed,
                bukuDoa: isDistributed,
                status: isDistributed ? 'LENGKAP' : 'SEBAGIAN',
                notes: idx % 5 === 1 ? 'Menunggu pengiriman koper ukuran 28 inch dari vendor' : 'Lengkap',
                updatedAt: '04 Nov 2026, 14:00 WIB'
            };
        });
    }

    function getDefaultManasikData() {
        const manifest = (state.manifestData && state.manifestData.length) ? state.manifestData : getDefaultManifestData();
        return manifest.map((m, idx) => {
            let s1 = 'HADIR';
            let s2 = 'HADIR';
            if (idx % 7 === 1) s1 = 'IZIN';
            if (idx % 7 === 2) s2 = 'TIDAK_HADIR';
            if (idx % 7 === 3) { s1 = 'HADIR'; s2 = 'IZIN'; }
            return {
                id: `MAN-${(idx + 1).toString().padStart(4, '0')}`,
                regId: m.regId,
                name: m.name,
                phone: m.phone,
                session1: s1,
                session2: s2,
                sesi1Teori: s1,
                sesi2Praktek: s2,
                readiness: (s1 === 'HADIR' && s2 === 'HADIR') ? 'SIAP' : 'BELUM',
                muthawwif: idx % 2 === 0 ? 'Ust. DR. H. Salman, Lc.' : 'Ust. Ahmad Fauzi Ridwan, Lc.',
                notes: (s1 === 'IZIN' || s2 === 'IZIN') ? 'Ujian susulan manasik via Zoom online' : 'Siap berangkat',
                updatedAt: '04 Nov 2026, 17:00 WIB'
            };
        });
    }

    // 6. Data Store Initializer
    function initDataStore() {
        if (typeof localStorage === 'undefined') return;

        // 1. Audit Logs
        try {
            const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
            if (savedAudit) {
                const parsed = JSON.parse(savedAudit);
                if (Array.isArray(parsed) && parsed.length > 0) state.auditLogs = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat audit log:', e);
        }
        if (!state.auditLogs.length) {
            state.auditLogs = [
                { id: 'AUD-00195', time: '5 menit lalu', actor: 'Finance Admin', action: 'VERIFY_PAYMENT', entity: 'DB_Payments', ref: 'PAY-SDW-001', desc: 'Validasi transfer DP Rp 15.000.000 via BSI an Ahmad Jamaah' },
                { id: 'AUD-00194', time: '28 menit lalu', actor: 'Document Officer', action: 'VERIFY_DOCUMENT', entity: 'DB_Pilgrim_Documents', ref: 'DOC-000001', desc: 'Verifikasi Paspor RI an Ahmad Jamaah Teladan (Masa berlaku s/d 2032)' },
                { id: 'AUD-00193', time: '1 jam lalu', actor: 'Sales Consultant', action: 'UPDATE_LEAD', entity: 'DB_Leads', ref: 'LED-001', desc: 'Kirim penawaran paket VIP Akhir Tahun via WhatsApp ke Bpk. H. Rahmat' },
                { id: 'AUD-00192', time: '2 jam lalu', actor: 'System Auto', action: 'AUDIT_SNAPSHOT', entity: 'DB_Registrations', ref: 'REG-SDW-2701', desc: 'Penguncian harga paket Rp 33.500.000 (diskon snapshot Rp 1.000.000)' },
                { id: 'AUD-00191', time: '5 jam lalu', actor: 'Operations', action: 'ASSIGN_BUS', entity: 'DB_Trip_Members', ref: 'TRP-2701', desc: 'Alokasi Bus 01 & Kamar 402 Swissotel Makkah untuk Kloter Syawal' }
            ];
            persistStorage(STORAGE_KEYS.AUDIT, state.auditLogs);
        }

        // 2. Leads CRM
        try {
            const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
            if (savedLeads) {
                const parsed = JSON.parse(savedLeads);
                if (Array.isArray(parsed) && parsed.length > 0) state.leadsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat leads:', e);
        }
        if (!state.leadsData.length) {
            state.leadsData = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? JSON.parse(JSON.stringify(MOCK_DATA.leads)) : [
                { id: 'LED-001', name: 'Bpk. H. Rahmat Hidayat', phone: '0812-8888-0101', package: 'Umroh VIP Akhir Tahun', urgency: 'HIGH', budget: 'Rp 45jt', status: 'PROPOSAL', owner: 'Sales A' },
                { id: 'LED-002', name: 'Ibu Hj. Siti Nurhaliza', phone: '0813-7777-0102', package: 'Umroh Reguler Syawal', urgency: 'MEDIUM', budget: 'Rp 30jt', status: 'CONSULTATION', owner: 'Sales B' },
                { id: 'LED-003', name: 'Keluarga Bpk. Hendra (3 Pax)', phone: '0856-9999-0103', package: 'Umroh Plus Turki', urgency: 'HIGH', budget: 'Rp 120jt', status: 'QUALIFIED', owner: 'Sales A' },
                { id: 'LED-004', name: 'Bpk. Ridwan Kamil', phone: '0818-5555-0104', package: 'Umroh Awal Ramadhan', urgency: 'LOW', budget: 'Rp 35jt', status: 'NEW', owner: 'Belum Ditugaskan' }
            ];
            persistStorage(STORAGE_KEYS.LEADS, state.leadsData);
        }

        // 3. Registrations
        try {
            const savedRegs = localStorage.getItem(STORAGE_KEYS.REGS);
            if (savedRegs) {
                const parsed = JSON.parse(savedRegs);
                if (Array.isArray(parsed) && parsed.length > 0) state.registrationsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat registrations:', e);
        }
        if (!state.registrationsData.length) {
            state.registrationsData = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? JSON.parse(JSON.stringify(MOCK_DATA.registrations)) : [
                { id: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'CONFIRMED', docs: '3/4', payment: 'Rp 15jt / 33.5jt' },
                { id: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'UNDER_REVIEW', docs: '2/4', payment: 'Rp 10jt / 29.5jt' },
                { id: 'REG-SDW-2703', customer: 'Bpk. Gunawan Wibisono', package: 'Umroh VIP 12H', departure: '28 Feb 2027', status: 'APPROVED', docs: '4/4', payment: 'LUNAS (Rp 43.5jt)' }
            ];
            persistStorage(STORAGE_KEYS.REGS, state.registrationsData);
        }

        // 4. Payments
        try {
            const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
            if (savedPayments) {
                const parsed = JSON.parse(savedPayments);
                if (Array.isArray(parsed) && parsed.length > 0) state.paymentsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat payments:', e);
        }
        if (!state.paymentsData.length) {
            state.paymentsData = [
                { id: 'PAY-SDW-002', regId: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', amount: 'Rp 10.000.000', method: 'Transfer Bank Syariah (BSI)', ref: 'BSI-TX889021', status: 'PENDING_VERIFY' },
                { id: 'PAY-SDW-001', regId: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', amount: 'Rp 15.000.000', method: 'Transfer BSI Virtual Account', ref: 'BSI-TX990142', status: 'VERIFIED' }
            ];
            persistStorage(STORAGE_KEYS.PAYMENTS, state.paymentsData);
        }

        // 4b. Sync otomatis pendaftaran mandiri dari PWA jika ada sesi lokal
        try {
            const sessRaw = localStorage.getItem('sdw_pilgrim_session');
            if (sessRaw) {
                const sess = JSON.parse(sessRaw);
                if (sess && sess.regId && sess.status && sess.status !== 'NEW_PILGRIM') {
                    const existingRegIndex = state.registrationsData.findIndex(r => r.id === sess.regId);
                    const regEntry = {
                        id: sess.regId,
                        customer: sess.fullName || 'Jamaah Mandiri PWA',
                        nik: sess.nik || '-',
                        phone: sess.phone || '',
                        package: sess.packageTitle || 'Umroh Reguler Syawal Barakah',
                        departure: sess.departureDate || 'Musim 1448H',
                        status: sess.status || 'PENDING_DP',
                        docs: '0/4',
                        payment: sess.status === 'CONFIRMED' ? 'DP Lunas (Rp 5jt)' : 'Menunggu DP (Rp 5jt)',
                        priceSnapshot: sess.totalPrice ? parseInt(String(sess.totalPrice).replace(/[^0-9]/g, '')) : 29500000,
                        dpAmount: sess.dpAmount ? parseInt(String(sess.dpAmount).replace(/[^0-9]/g, '')) : 5000000
                    };

                    if (existingRegIndex >= 0) {
                        state.registrationsData[existingRegIndex] = { ...state.registrationsData[existingRegIndex], ...regEntry };
                    } else {
                        state.registrationsData.unshift(regEntry);
                    }
                    persistStorage(STORAGE_KEYS.REGS, state.registrationsData);

                    // Sync ke payments jika PENDING_DP atau CONFIRMED
                    const existingPayIndex = state.paymentsData.findIndex(p => p.regId === sess.regId);
                    if (existingPayIndex < 0) {
                        const newPayId = `PAY-SDW-00${state.paymentsData.length + 1}`;
                        state.paymentsData.unshift({
                            id: newPayId,
                            regId: sess.regId,
                            customer: sess.fullName,
                            amount: sess.dpAmount || 'Rp 5.000.000',
                            method: 'Transfer Bank Syariah (BSI)',
                            ref: 'BSI-BOOKING-PWA',
                            term: 'DP Booking',
                            status: sess.status === 'CONFIRMED' ? 'VERIFIED' : 'PENDING_VERIFY'
                        });
                        persistStorage(STORAGE_KEYS.PAYMENTS, state.paymentsData);
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Local pilgrim session sync notice:', e);
        }

        // 5. Trips & Kloter
        try {
            const savedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
            if (savedTrips) {
                const parsed = JSON.parse(savedTrips);
                if (Array.isArray(parsed) && parsed.length > 0) state.tripsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat trips:', e);
        }
        if (!state.tripsData.length) {
            state.tripsData = [
                {
                    id: 'TRP-2701',
                    title: 'Kloter Utama 01',
                    date: '15 Jan 2027 • 45 Pax',
                    tag: 'DEPARTING H-73',
                    tagClass: 'bg-emerald-100 text-emerald-800',
                    airline: 'Saudia Direct SV-819 (CGK-JED)',
                    hotelMakkah: 'Retaj Al Rayyan (350m)',
                    hotelMadinah: 'Concorde Dar Al Khair (200m)',
                    muthawwif: 'Ust. DR. H. Salman, Lc.',
                    tourLeader: 'Ust. H. Fauzi, S.Ag.',
                    busSummary: 'Bus 01 & Bus 02'
                },
                {
                    id: 'TRP-2702',
                    title: 'Kloter VIP Khidmat',
                    date: '28 Feb 2027 • 35 Pax',
                    tag: 'KUOTA PENUH',
                    tagClass: 'bg-purple-100 text-purple-800',
                    airline: 'Garuda Indonesia (GA-980)',
                    hotelMakkah: 'Swissotel Clock Tower (0m)',
                    hotelMadinah: 'Dar Al Taqwa Madinah (50m)',
                    muthawwif: 'Ust. Ahmad Fauzi Ridwan, Lc.',
                    tourLeader: 'Ust. DR. H. Salman, Lc.',
                    busSummary: 'VIP Executive Bus'
                },
                {
                    id: 'TRP-2703',
                    title: 'Kloter Plus Turki',
                    date: '18 Apr 2027 • 40 Pax',
                    tag: 'TERSEDIA 18 SEAT',
                    tagClass: 'bg-blue-100 text-blue-800',
                    airline: 'Turkish Airlines (TK-57)',
                    hotelMakkah: 'Anjum Hotel Makkah',
                    hotelMadinah: 'Rove Al Madinah',
                    muthawwif: 'Ust. H. Fauzi, S.Ag.',
                    tourLeader: 'Ust. Ahmad Fauzi Ridwan, Lc.',
                    busSummary: 'Turki + Haramain Bus'
                }
            ];
            persistStorage(STORAGE_KEYS.TRIPS, state.tripsData);
        }

        // 6. Documents Queue
        try {
            const savedDocs = localStorage.getItem(STORAGE_KEYS.DOCS);
            if (savedDocs) {
                const parsed = JSON.parse(savedDocs);
                if (Array.isArray(parsed) && parsed.length > 0) state.docsQueue = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat berkas dokumen:', e);
        }
        if (!state.docsQueue.length) {
            state.docsQueue = [
                { id: 'DOC-000003', pilgrim: 'Ahmad Jamaah Teladan', regId: 'REG-SDW-2701', type: 'Pasfoto 4x6 Latar Putih', file: 'pasfoto_ahmad_white.jpg', uploaded: 'Hari ini • 09:20 WIB', status: 'UNDER_REVIEW' },
                { id: 'DOC-000005', pilgrim: 'Ibu Fatimah Zahra', regId: 'REG-SDW-2702', type: 'Buku Kuning Vaksin Meningitis', file: 'sertifikat_vaksin_fatimah.pdf', uploaded: 'Kemarin • 14:15 WIB', status: 'UNDER_REVIEW' },
                { id: 'DOC-000006', pilgrim: 'Bpk. Gunawan Wibisono', regId: 'REG-SDW-2703', type: 'Scan Paspor RI (48 Halaman)', file: 'paspor_gunawan_full.pdf', uploaded: '2 hari lalu', status: 'UNDER_REVIEW' }
            ];
            persistStorage(STORAGE_KEYS.DOCS, state.docsQueue);
        }

        // 7. Manifest Store
        try {
            const savedManifest = localStorage.getItem(STORAGE_KEYS.MANIFEST);
            if (savedManifest) {
                const parsed = JSON.parse(savedManifest);
                if (Array.isArray(parsed) && parsed.length > 0) state.manifestData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat manifest bus:', e);
        }
        if (!state.manifestData.length) {
            state.manifestData = getDefaultManifestData();
            persistStorage(STORAGE_KEYS.MANIFEST, state.manifestData);
        }

        // 8. Rooms Store
        try {
            const savedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
            if (savedRooms) {
                const parsed = JSON.parse(savedRooms);
                if (Array.isArray(parsed) && parsed.length > 0) state.roomsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat rooming list hotel:', e);
        }
        if (!state.roomsData.length) {
            state.roomsData = getDefaultRoomsData();
            persistStorage(STORAGE_KEYS.ROOMS, state.roomsData);
        }

        // 9. Logistics Store
        try {
            const savedLogistics = localStorage.getItem(STORAGE_KEYS.LOGISTICS);
            if (savedLogistics) {
                const parsed = JSON.parse(savedLogistics);
                if (Array.isArray(parsed) && parsed.length > 0) state.logisticsData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat logistik koper:', e);
        }
        if (!state.logisticsData.length) {
            state.logisticsData = getDefaultLogisticsData();
            persistStorage(STORAGE_KEYS.LOGISTICS, state.logisticsData);
        }

        // 10. Manasik Store
        try {
            const savedManasik = localStorage.getItem(STORAGE_KEYS.MANASIK);
            if (savedManasik) {
                const parsed = JSON.parse(savedManasik);
                if (Array.isArray(parsed) && parsed.length > 0) state.manasikData = parsed;
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal memuat data manasik:', e);
        }
        if (!state.manasikData.length) {
            state.manasikData = getDefaultManasikData();
            persistStorage(STORAGE_KEYS.MANASIK, state.manasikData);
        }
    }

    // Attach to admin object
    admin.STORAGE_KEYS = STORAGE_KEYS;
    admin.ADMIN_PERMISSIONS = ADMIN_PERMISSIONS;
    admin.state = state;
    admin.escapeHtml = escapeHtml;
    admin.formatRupiah = formatRupiah;
    admin.numberToWords = numberToWords;
    admin.getStatusBadgeClass = getStatusBadgeClass;
    admin.showToast = showToast;
    admin.persistStorage = persistStorage;
    admin.getDefaultManifestData = getDefaultManifestData;
    admin.getDefaultRoomsData = getDefaultRoomsData;
    admin.getDefaultLogisticsData = getDefaultLogisticsData;
    admin.getDefaultManasikData = getDefaultManasikData;
    admin.initDataStore = initDataStore;

    // Direct state delegations for transparent backward compatibility
    const stateKeys = [
        'leadsData', 'packagesData', 'registrationsData', 'paymentsData', 'tripsData', 'docsQueue',
        'auditLogs', 'manifestData', 'roomsData', 'logisticsData', 'manasikData',
        'syncQueue', 'syncHistory', 'isSyncing', 'currentTab', 'currentRole',
        'activeKloterId', 'operationsSubtab', 'crmFilter', 'packagesFilter', 'docsFilter',
        'regsFilter', 'financeFilter', 'auditFilter', 'manifestFilter',
        'roomingFilter', 'logisticsFilter', 'manasikFilter', 'unmaskedRecords',
        'isScreenLocked', 'inactivityTimer', 'INACTIVITY_TIMEOUT_MS', 'MASTER_PIN'
    ];

    stateKeys.forEach(key => {
        Object.defineProperty(admin, key, {
            get() { return state[key]; },
            set(val) { state[key] = val; },
            configurable: true,
            enumerable: true
        });
    });

    return admin;
});
