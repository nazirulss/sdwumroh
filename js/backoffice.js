/**
 * ====================================================================
 * SDW UMROH — SURFACE 4: BACKOFFICE OPERATIONAL CONTROLLER
 * File: js/backoffice.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_BACKOFFICE = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function initBackoffice() {
        renderLeads();
        renderRegistrations();
        renderAuditLogs();
    }

    function renderLeads() {
        const leads = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? MOCK_DATA.leads : [];
        const tbody = document.getElementById('crm-leads-tbody');
        if (!tbody) return;

        tbody.innerHTML = leads.map(l => {
            let urgencyColor = 'bg-slate-100 text-slate-700';
            if (l.urgency === 'HIGH') urgencyColor = 'bg-rose-100 text-rose-800';
            if (l.urgency === 'MEDIUM') urgencyColor = 'bg-amber-100 text-amber-800';

            return `
                <tr class="hover:bg-slate-50 border-b border-sdw-border/70 text-xs">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${l.id}</td>
                    <td class="py-3 px-4 font-bold text-sdw-charcoal">
                        ${l.name}
                        <div class="text-[11px] text-sdw-muted font-normal">${l.phone}</div>
                    </td>
                    <td class="py-3 px-4 font-medium text-sdw-charcoal">${l.package}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${urgencyColor}">${l.urgency}</span>
                    </td>
                    <td class="py-3 px-4 font-semibold text-sdw-pine">${l.budget}</td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sdw-sand border border-sdw-border text-sdw-pine">${l.status}</span>
                    </td>
                    <td class="py-3 px-4 text-sdw-muted">${l.owner}</td>
                    <td class="py-3 px-4 text-right">
                        <button type="button" onclick="alert('Follow up ${l.name}')" class="px-2.5 py-1 rounded-lg bg-sdw-pine text-white text-[11px] font-bold hover:bg-sdw-pineLight transition cursor-pointer">
                            Follow Up
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderRegistrations() {
        const regs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? MOCK_DATA.registrations : [];
        const tbody = document.getElementById('bo-registrations-tbody');
        if (!tbody) return;

        tbody.innerHTML = regs.map(r => {
            return `
                <tr class="hover:bg-slate-50 border-b border-sdw-border/70 text-xs">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${r.id}</td>
                    <td class="py-3 px-4 font-bold text-sdw-charcoal">${r.customer}</td>
                    <td class="py-3 px-4 font-medium">${r.package}</td>
                    <td class="py-3 px-4 text-sdw-muted">${r.departure}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">${r.status}</span>
                    </td>
                    <td class="py-3 px-4 font-bold text-sdw-pine">${r.docs}</td>
                    <td class="py-3 px-4 font-medium">${r.payment}</td>
                    <td class="py-3 px-4 text-right">
                        <button type="button" onclick="alert('Buka berkas ${r.customer}')" class="px-2.5 py-1 rounded-lg border border-sdw-border text-sdw-pine text-[11px] font-bold hover:bg-sdw-sand transition cursor-pointer">
                            Review
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderAuditLogs() {
        const tbody = document.getElementById('bo-audit-tbody');
        if (!tbody) return;

        const dummyLogs = [
            { id: 'AUD-00192', time: '10 menit lalu', actor: 'Ahmad Jamaah (Pilgrim)', action: 'UPLOAD_DOCUMENT', entity: 'DB_Pilgrim_Documents', idRef: 'DOC-000003', desc: 'Unggah pasfoto latar putih' },
            { id: 'AUD-00191', time: '1 jam lalu', actor: 'Finance Admin', action: 'VERIFY_PAYMENT', entity: 'DB_Payments', idRef: 'PAY-SDW-001', desc: 'Verifikasi mutasi DP Rp 15.000.000 via BSI' },
            { id: 'AUD-00190', time: '3 jam lalu', actor: 'Document Officer', action: 'VERIFY_PASSPORT', entity: 'DB_Pilgrim_Documents', idRef: 'DOC-000001', desc: 'Validasi masa berlaku paspor RI' },
            { id: 'AUD-00189', time: '5 jam lalu', actor: 'Sales Consultant', action: 'SUBMIT_LEAD', entity: 'DB_Leads', idRef: 'LED-000004', desc: 'Pencatatan prospek baru dari website' }
        ];

        tbody.innerHTML = dummyLogs.map(log => `
            <tr class="hover:bg-slate-50 border-b border-sdw-border/70 text-xs">
                <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${log.id}</td>
                <td class="py-3 px-4 text-sdw-muted">${log.time}</td>
                <td class="py-3 px-4 font-bold text-sdw-charcoal">${log.actor}</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800">${log.action}</span></td>
                <td class="py-3 px-4 text-sdw-muted font-mono">${log.entity} / ${log.idRef}</td>
                <td class="py-3 px-4 text-sdw-charcoal">${log.desc}</td>
            </tr>
        `).join('');
    }

    return {
        init: initBackoffice
    };
});
