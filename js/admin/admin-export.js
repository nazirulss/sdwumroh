/**
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

    function exportToCSV(type) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
        let filename = `SDW_Export_${type}_${dateStr}_${timeStr}.csv`;
        let rows = [];

        if (type === 'LEADS') {
            filename = `SDW_Leads_CRM_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Lead', 'Nama Calon Jamaah', 'No WhatsApp', 'Program Paket', 'Urgensi', 'Estimasi Anggaran', 'Status Pipeline', 'PIC Sales', 'Catatan']);
            admin.leadsData.forEach(l => {
                rows.push([l.id, l.name, l.phone, l.package, l.urgency, l.budget, l.status, l.owner, l.notes || '-']);
            });
        } else if (type === 'DOCS') {
            filename = `SDW_Status_Berkas_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Dokumen', 'Nama Jamaah', 'ID Registrasi', 'Jenis Dokumen', 'Nama File', 'Waktu Unggah', 'Status Review']);
            docsQueue.forEach(d => {
                rows.push([d.id, d.pilgrim, d.regId, d.type, d.file, d.uploaded, d.status]);
            });
        } else if (type === 'REGS') {
            filename = `SDW_Registrasi_Jamaah_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Registrasi', 'Nama Jamaah', 'NIK', 'No WhatsApp', 'Program Paket', 'Keberangkatan', 'Status', 'Kelengkapan Berkas', 'Pembayaran']);
            admin.registrationsData.forEach(r => {
                rows.push([r.id, r.customer, r.nik || '-', r.phone || '-', r.package, r.departure, r.status, r.docs, r.payment]);
            });
        } else if (type === 'PAYMENTS') {
            filename = `SDW_Rekap_Keuangan_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Transaksi', 'ID Registrasi', 'Nama Jamaah', 'Jumlah Setoran', 'Metode Pembayaran', 'No Referensi Bank', 'Status']);
            admin.paymentsData.forEach(p => {
                rows.push([p.id, p.regId, p.customer, p.amount, p.method, p.ref, p.status]);
            });
        } else if (type === 'MANIFEST') {
            filename = `SDW_Manifest_Bus_Kloter_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Manifest', 'ID Registrasi', 'Nama Jamaah', 'Gender', 'No Paspor', 'Armada Bus', 'No Kursi', 'Label Koper', 'Status Boarding', 'Kamar Makkah', 'Kamar Madinah', 'No WhatsApp']);
            admin.manifestData.forEach(m => {
                rows.push([
                    m.id,
                    m.regId,
                    m.name,
                    m.gender === 'L' ? 'Laki-laki (Ikhwan)' : 'Perempuan (Akhwat)',
                    m.passport,
                    m.busName,
                    m.seat,
                    m.luggageTag,
                    m.boarded ? 'SUDAH NAIK (BOARDED)' : 'BELUM NAIK (PENDING)',
                    m.roomMakkah,
                    m.roomMadinah,
                    m.phone
                ]);
            });
        } else if (type === 'ROOMING') {
            filename = `SDW_Rooming_List_Hotel_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Kamar', 'Kota', 'Nama Hotel', 'Nomor Kamar', 'Tipe Kamar', 'Kategori Muhrim', 'Kapasitas', 'Terisi', 'Penghuni 1', 'Penghuni 2', 'Penghuni 3', 'Penghuni 4']);
            admin.roomsData.forEach(r => {
                rows.push([
                    r.id,
                    r.city,
                    r.hotel,
                    r.roomNumber,
                    r.type,
                    r.gender,
                    r.capacity,
                    r.occupants.length,
                    r.occupants[0] || '',
                    r.occupants[1] || '',
                    r.occupants[2] || '',
                    r.occupants[3] || ''
                ]);
            });
        } else if (type === 'LOGISTICS') {
            filename = `SDW_Kesiapan_Logistik_Koper_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Logistik', 'ID Registrasi', 'Nama Jamaah', 'Gender', 'No WhatsApp', 'Koper 24 Bagasi', 'Tas Kabin', 'Kain Ihram/Mukena', 'Batik SDW', 'Buku Doa & ID Card', 'Status Distribusi', 'Tanggal Penyerahan', 'Catatan']);
            admin.logisticsData.forEach(l => {
                rows.push([
                    l.id,
                    l.regId,
                    l.name,
                    l.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    l.phone || '-',
                    l.koperBagasi ? 'SUDAH' : 'BELUM',
                    l.tasKabin ? 'SUDAH' : 'BELUM',
                    l.kainIhram ? 'SUDAH' : 'BELUM',
                    l.batikSDW ? 'SUDAH' : 'BELUM',
                    l.bukuDoa ? 'SUDAH' : 'BELUM',
                    l.status,
                    l.pickupDate || '-',
                    l.notes || '-'
                ]);
            });
        } else if (type === 'MANASIK') {
            filename = `SDW_Presensi_Bimbingan_Manasik_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Manasik', 'ID Registrasi', 'Nama Jamaah', 'Gender', 'No WhatsApp', 'Sesi 1 Teori Fiqih', 'Sesi 2 Praktek Lapangan', 'Status Kesiapan', 'Catatan Bimbingan']);
            admin.manasikData.forEach(m => {
                rows.push([
                    m.id,
                    m.regId,
                    m.name,
                    m.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    m.phone || '-',
                    m.sesi1Teori,
                    m.sesi2Praktek,
                    m.readiness === 'SIAP' ? 'SIAP BERANGKAT' : (m.readiness === 'REMEDIAL' ? 'BUTUH PENGAYAAN / REMEDIAL' : 'BELUM EVALUASI'),
                    m.notes || '-'
                ]);
            });
        } else if (type === 'SECURITY') {
            filename = `SDW_Insiden_Keamanan_Forensik_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Audit', 'Waktu', 'Aktor Staf', 'Tingkat Keparahan', 'Aksi Mutasi', 'Tabel Entitas', 'ID Referensi', 'Uraian Mutasi']);
            const securityLogs = admin.auditLogs.filter(a => {
                const sev = a.severity || (
                    ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                    ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
                );
                return sev === 'CRITICAL' || sev === 'WARNING';
            });
            securityLogs.forEach(a => {
                const sev = a.severity || (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT'].includes(a.action) ? 'CRITICAL' : 'WARNING');
                rows.push([a.id, a.time, a.actor, sev, a.action, a.entity, a.ref, a.desc]);
            });
        } else if (type === 'AUDIT') {
            filename = `SDW_Jejak_Audit_Log_${dateStr}_${timeStr}.csv`;
            rows.push(['ID Audit', 'Waktu', 'Aktor Staf', 'Tingkat Keparahan', 'Aksi Mutasi', 'Tabel Entitas', 'ID Referensi', 'Uraian Mutasi']);
            admin.auditLogs.forEach(a => {
                const sev = a.severity || (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT'].includes(a.action) ? 'CRITICAL' : 'INFO');
                rows.push([a.id, a.time, a.actor, sev, a.action, a.entity, a.ref, a.desc]);
            });
        }

        downloadCSV(filename, rows);
        admin.logAdminAudit('EXPORT_CSV', 'REPORT', type, `Unduh laporan spreadsheet CSV: ${filename} (${rows.length - 1} baris data).`);
        admin.showToast(`📥 Laporan ${filename} berhasil diunduh!`);
        renderAuditLogs();
    }

    function downloadCSV(filename, rows) {
        const csvContent = "\uFEFF" + rows.map(r => r.map(cell => {
            let str = (cell === null || cell === undefined) ? '' : String(cell);
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                str = '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        }).join(",")).join("\r\n");

        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }

    // ====================================================================
    // AUDIT & OPERATIONAL ACTIONS
    // ====================================================================

    // Attach all exported functions to admin
    admin.exportToCSV = exportToCSV;
    admin.downloadCSV = downloadCSV;

    return admin;
});
