/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: DOCUMENT & VISA VERIFICATION
 * File: js/admin/admin-docs.js
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

    // 1. RENDER VERIFIKASI BERKAS & VISA (FASE 2 FILTER)
    function renderDocuments() {
        if (typeof document === 'undefined') return;
        const tbody = document.getElementById('docs-verification-tbody');
        if (!tbody) return;

        const filtered = admin.docsQueue.filter(d => {
            const query = (admin.docsFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (d.pilgrim && d.pilgrim.toLowerCase().includes(query)) ||
                (d.regId && d.regId.toLowerCase().includes(query)) ||
                (d.id && d.id.toLowerCase().includes(query)) ||
                (d.file && d.file.toLowerCase().includes(query));
            const matchType = (!admin.docsFilter.type || admin.docsFilter.type === 'ALL') || (d.type && d.type.toLowerCase().includes(admin.docsFilter.type.toLowerCase()));
            const matchStatus = (!admin.docsFilter.status || admin.docsFilter.status === 'ALL') || (d.status === admin.docsFilter.status);
            return matchSearch && matchType && matchStatus;
        });

        const badgeEl = document.getElementById('docs-count-badge');
        if (badgeEl) {
            badgeEl.innerText = `Menampilkan ${filtered.length} dari ${admin.docsQueue.length} berkas`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-file-circle-xmark text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada berkas yang sesuai filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(d => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(d.id)}</td>
                <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800">${admin.escapeHtml(d.pilgrim)}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(d.regId)}</div>
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-700">
                    <i class="fa-solid fa-file-shield text-sdw-gold mr-1.5"></i>
                    ${admin.escapeHtml(d.type)}
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-500">${admin.escapeHtml(d.file)}</td>
                <td class="py-3.5 px-4 text-slate-500">${admin.escapeHtml(d.uploaded)}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${admin.getStatusBadgeClass(d.status)}">${admin.escapeHtml(d.status)}</span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-1.5">
                    ${d.status === 'UNDER_REVIEW' ? `
                        <button type="button" onclick="SDW_ADMIN.verifyDocumentAction('${d.id}', 'APPROVE')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer">
                            <i class="fa-solid fa-check mr-1"></i> Sahkan
                        </button>
                        <button type="button" onclick="SDW_ADMIN.verifyDocumentAction('${d.id}', 'REJECT')" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer">
                            <i class="fa-solid fa-xmark mr-1"></i> Tolak
                        </button>
                    ` : `
                        <span class="text-xs text-slate-400 font-bold">Selesai Diverifikasi</span>
                    `}
                </td>
            </tr>
        `).join('');
    }

    function applyDocsFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('docs-filter-search');
        const typeSelect = document.getElementById('docs-filter-type');
        const statusSelect = document.getElementById('docs-filter-status');

        admin.docsFilter.search = (searchInput && searchInput.value) ? searchInput.value : '';
        admin.docsFilter.type = (typeSelect && typeSelect.value) ? typeSelect.value : 'ALL';
        admin.docsFilter.status = (statusSelect && statusSelect.value) ? statusSelect.value : 'ALL';

        renderDocuments();
    }

    function resetDocsFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('docs-filter-search');
        const typeSelect = document.getElementById('docs-filter-type');
        const statusSelect = document.getElementById('docs-filter-status');

        if (searchInput) searchInput.value = '';
        if (typeSelect) typeSelect.value = 'ALL';
        if (statusSelect) statusSelect.value = 'ALL';

        admin.docsFilter = { search: '', type: 'ALL', status: 'ALL' };
        renderDocuments();
    }

    // 2. VERIFIKASI DOKUMEN ACTION
    function verifyDocumentAction(docId, decision) {
        const doc = admin.docsQueue.find(d => d.id === docId);
        if (!doc) return;

        if (decision === 'APPROVE') {
            doc.status = 'VERIFIED';
            admin.persistStorage(admin.STORAGE_KEYS.DOCS, admin.docsQueue);
            if (typeof admin.enqueueMutation === 'function') {
                admin.enqueueMutation('verifyDocument', { docId: docId, status: 'VERIFIED' }, 'DB_Pilgrim_Documents', docId);
            }
            if (typeof admin.logAdminAudit === 'function') {
                admin.logAdminAudit('APPROVE_DOCUMENT', 'DB_Pilgrim_Documents', docId, `Dokumen ${docId} (${doc.type}) disetujui dan disahkan oleh Document Officer.`);
            }
            admin.showToast(`✅ Berkas ${docId} berhasil disahkan!`);
        } else {
            let reason = 'Foto buram / Masa berlaku paspor kurang dari 7 bulan.';
            if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
                const res = window.prompt('Masukkan alasan penolakan berkas:', reason);
                if (!res) return;
                reason = res;
            }
            doc.status = 'REJECTED';
            admin.persistStorage(admin.STORAGE_KEYS.DOCS, admin.docsQueue);
            if (typeof admin.enqueueMutation === 'function') {
                admin.enqueueMutation('verifyDocument', { docId: docId, status: 'REJECTED', reason: reason }, 'DB_Pilgrim_Documents', docId);
            }
            if (typeof admin.logAdminAudit === 'function') {
                admin.logAdminAudit('REJECT_DOCUMENT', 'DB_Pilgrim_Documents', docId, `Dokumen ${docId} ditolak. Alasan: ${reason}`);
            }
            admin.showToast(`⚠️ Berkas ${docId} ditolak. Notifikasi perbaikan dikirim ke jamaah.`);
        }
        renderDocuments();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();
    }

    // Attach to admin
    admin.renderDocuments = renderDocuments;
    admin.applyDocsFilter = applyDocsFilter;
    admin.resetDocsFilter = resetDocsFilter;
    admin.verifyDocumentAction = verifyDocumentAction;

    return admin;
});
