/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: CRM & LEADS PIPELINE
 * File: js/admin/admin-crm.js
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

    // 1. MUTASI: TAMBAH PROSPEK BARU (CRM)
    function handleCreateLead(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const nameInput = document.getElementById('lead_name');
        const phoneInput = document.getElementById('lead_phone');
        const packageInput = document.getElementById('lead_package');
        const budgetInput = document.getElementById('lead_budget');
        const urgencyInput = document.getElementById('lead_urgency');
        const statusInput = document.getElementById('lead_status');
        const ownerInput = document.getElementById('lead_owner');
        const notesInput = document.getElementById('lead_notes');

        if (!nameInput || !phoneInput) return;

        const newId = `LED-00${admin.leadsData.length + 1}`;
        const newLead = {
            id: newId,
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            package: packageInput ? packageInput.value : 'Umroh Reguler Syawal',
            urgency: urgencyInput ? urgencyInput.value : 'MEDIUM',
            budget: budgetInput && budgetInput.value.trim() ? budgetInput.value.trim() : 'Rp 35jt',
            status: statusInput ? statusInput.value : 'NEW',
            owner: ownerInput ? ownerInput.value : 'Belum Ditugaskan',
            notes: notesInput ? notesInput.value.trim() : ''
        };

        admin.leadsData.unshift(newLead);
        admin.persistStorage(admin.STORAGE_KEYS.LEADS, admin.leadsData);

        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('createLead', newLead, 'DB_Leads', newLead.id);
        }
        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit('CREATE_LEAD', 'DB_Leads', newLead.id, `Pendaftaran prospek baru CRM: ${newLead.name} (${newLead.package}) - Urgensi: ${newLead.urgency}`);
        }
        admin.showToast(`✅ Prospek baru ${newLead.name} (${newLead.id}) berhasil disimpan!`);

        const form = document.getElementById('formCreateLead');
        if (form) form.reset();

        admin.closeModal('modalCreateLead');
        renderCRM();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();
    }

    // 2. RENDER CRM & LEADS PIPELINE (FASE 2 FILTER)
    function renderCRM() {
        if (typeof document === 'undefined') return;
        const tbody = document.getElementById('crm-leads-table-tbody');
        if (!tbody) return;

        const filtered = admin.leadsData.filter(l => {
            const query = (admin.crmFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (l.name && l.name.toLowerCase().includes(query)) ||
                (l.phone && l.phone.includes(query)) ||
                (l.id && l.id.toLowerCase().includes(query)) ||
                (l.package && l.package.toLowerCase().includes(query));
            const matchUrgency = (!admin.crmFilter.urgency || admin.crmFilter.urgency === 'ALL') || (l.urgency === admin.crmFilter.urgency);
            const matchStatus = (!admin.crmFilter.status || admin.crmFilter.status === 'ALL') || (l.status === admin.crmFilter.status);
            return matchSearch && matchUrgency && matchStatus;
        });

        const badgeEl = document.getElementById('crm-count-badge');
        if (badgeEl) {
            badgeEl.innerText = `Menampilkan ${filtered.length} dari ${admin.leadsData.length} prospek`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-filter-circle-xmark text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada prospek yang sesuai kriteria filter saat ini.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(l => {
            let urgencyBadge = 'bg-slate-100 text-slate-700';
            if (l.urgency === 'HIGH') urgencyBadge = 'bg-rose-100 text-rose-800 border border-rose-200';
            if (l.urgency === 'MEDIUM') urgencyBadge = 'bg-amber-100 text-amber-800 border border-amber-200';

            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                    <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(l.id)}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-800">
                        ${admin.escapeHtml(l.name)}
                        <div class="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                            <i class="fa-solid fa-phone text-[9px]"></i>
                            <span>${admin.escapeHtml(l.phone)}</span>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-700">${admin.escapeHtml(l.package)}</td>
                    <td class="py-3.5 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${urgencyBadge}">${admin.escapeHtml(l.urgency)}</span>
                    </td>
                    <td class="py-3.5 px-4 font-black text-sdw-pine">${admin.escapeHtml(l.budget)}</td>
                    <td class="py-3.5 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-900 border border-purple-200">${admin.escapeHtml(l.status)}</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-medium">${admin.escapeHtml(l.owner)}</td>
                    <td class="py-3.5 px-4 text-right space-x-1.5">
                        <a href="https://wa.me/${String(l.phone).replace(/[^0-9]/g, '')}?text=Assalamualaikum%20${encodeURIComponent(l.name)},%20kami%20dari%20SDW%20UMROH..." target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition">
                            <i class="fa-brands fa-whatsapp text-xs"></i>
                            <span>Chat</span>
                        </a>
                        <button type="button" onclick="SDW_ADMIN.openDrawer('LEAD', '${l.id}')" class="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer">
                            Detail
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function applyCRMFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('crm-filter-search');
        const urgencySelect = document.getElementById('crm-filter-urgency');
        const statusSelect = document.getElementById('crm-filter-status');

        admin.crmFilter.search = (searchInput && searchInput.value) ? searchInput.value : '';
        admin.crmFilter.urgency = (urgencySelect && urgencySelect.value) ? urgencySelect.value : 'ALL';
        admin.crmFilter.status = (statusSelect && statusSelect.value) ? statusSelect.value : 'ALL';

        renderCRM();
    }

    function resetCRMFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('crm-filter-search');
        const urgencySelect = document.getElementById('crm-filter-urgency');
        const statusSelect = document.getElementById('crm-filter-status');

        if (searchInput) searchInput.value = '';
        if (urgencySelect) urgencySelect.value = 'ALL';
        if (statusSelect) statusSelect.value = 'ALL';

        admin.crmFilter = { search: '', urgency: 'ALL', status: 'ALL' };
        renderCRM();
    }

    function openConvertLeadModal(leadId) {
        const lead = admin.leadsData.find(l => l.id === leadId);
        if (!lead) return;

        admin.closeDrawer();

        if (typeof document !== 'undefined') {
            const customerInput = document.getElementById('reg_customer');
            const phoneInput = document.getElementById('reg_phone');
            if (customerInput) customerInput.value = lead.name;
            if (phoneInput) phoneInput.value = lead.phone;
        }

        admin.openModal('modalCreateRegistration');
    }

    // Attach to admin
    admin.handleCreateLead = handleCreateLead;
    admin.renderCRM = renderCRM;
    admin.applyCRMFilter = applyCRMFilter;
    admin.resetCRMFilter = resetCRMFilter;
    admin.openConvertLeadModal = openConvertLeadModal;

    return admin;
});
