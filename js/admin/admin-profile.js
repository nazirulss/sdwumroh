/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE PROFILE MANAGEMENT CONTROLLER
 * File: js/admin/admin-profile.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Manages:
 *   1. Visi, Misi & KPI Kredensial (tentang.html)
 *   2. Sambutan Direktur Utama & Widget Beranda (sambutan.html & index.html)
 *   3. Dewan Pembimbing, Asatidz & Tim Medis (muthawwif.html)
 *   4. Dokumen Legalitas Resmi & Mitra Kerjasama MOU (legalitas.html)
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_PROFILE = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    let currentEditingGuideId = null;
    let currentEditingDocId = null;
    let currentEditingPartnerId = null;

    /**
     * Main Renderer triggered when tab-profile is active
     */
    function renderProfileManagement() {
        if (typeof document === 'undefined') return;

        // Ensure data is initialized
        if (!admin.profileInstitutionData && typeof admin.getDefaultProfileInstitutionData === 'function') {
            admin.profileInstitutionData = admin.getDefaultProfileInstitutionData();
        }
        if (!admin.profileDirectorData && typeof admin.getDefaultProfileDirectorData === 'function') {
            admin.profileDirectorData = admin.getDefaultProfileDirectorData();
        }
        if (!admin.profileGuidesData && typeof admin.getDefaultProfileGuidesData === 'function') {
            admin.profileGuidesData = admin.getDefaultProfileGuidesData();
        }
        if (!admin.profileLegalityData && typeof admin.getDefaultProfileLegalityData === 'function') {
            admin.profileLegalityData = admin.getDefaultProfileLegalityData();
        }

        const subtab = admin.profileSubtab || 'institution';
        switchSubtab(subtab);
    }

    /**
     * Switches between 4 sub-tabs: institution, director, guides, legality
     */
    function switchSubtab(subtabKey) {
        admin.profileSubtab = subtabKey;
        if (typeof document === 'undefined') return;

        const subtabs = [
            { key: 'institution', btnId: 'btnSubtabProfileInst', secId: 'secProfileInstitution' },
            { key: 'director', btnId: 'btnSubtabProfileDirector', secId: 'secProfileDirector' },
            { key: 'guides', btnId: 'btnSubtabProfileGuides', secId: 'secProfileGuides' },
            { key: 'legality', btnId: 'btnSubtabProfileLegality', secId: 'secProfileLegality' }
        ];

        subtabs.forEach(item => {
            const btn = document.getElementById(item.btnId);
            const sec = document.getElementById(item.secId);

            if (item.key === subtabKey) {
                if (btn) btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer';
                if (sec) sec.classList.remove('hidden');
            } else {
                if (btn) btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
                if (sec) sec.classList.add('hidden');
            }
        });

        if (subtabKey === 'institution') renderInstitution();
        if (subtabKey === 'director') renderDirector();
        if (subtabKey === 'guides') renderGuides();
        if (subtabKey === 'legality') renderLegality();
    }

    // =========================================================================
    // 1. SUBTAB: INSTITUTION (VISI, MISI, KPI & SEJARAH)
    // =========================================================================
    function renderInstitution() {
        const data = admin.profileInstitutionData;
        if (!data) return;

        // KPI Inputs
        const kpi = data.kpi || {};
        const ppiuNo = document.getElementById('profInstKpiPpiuNo');
        const ppiuYear = document.getElementById('profInstKpiPpiuYear');
        const akredGrade = document.getElementById('profInstKpiAkredGrade');
        const akredOrg = document.getElementById('profInstKpiAkredOrg');
        const legalName = document.getElementById('profInstKpiLegalName');
        const legalSk = document.getElementById('profInstKpiLegalSk');
        const afiliasiName = document.getElementById('profInstKpiAfiliasiName');
        const afiliasiDetail = document.getElementById('profInstKpiAfiliasiDetail');

        if (ppiuNo) ppiuNo.value = kpi.ppiu_no || '';
        if (ppiuYear) ppiuYear.value = kpi.ppiu_year || '';
        if (akredGrade) akredGrade.value = kpi.akreditasi_grade || '';
        if (akredOrg) akredOrg.value = kpi.akreditasi_org || '';
        if (legalName) legalName.value = kpi.legal_name || '';
        if (legalSk) legalSk.value = kpi.legal_sk || '';
        if (afiliasiName) afiliasiName.value = kpi.afiliasi_name || '';
        if (afiliasiDetail) afiliasiDetail.value = kpi.afiliasi_detail || '';

        // Visi
        const visiEl = document.getElementById('profInstVisi');
        if (visiEl) visiEl.value = data.visi || '';

        // Misi List
        renderMisiList();

        // Sejarah Timeline
        renderTimelineList();

        // Dewan Direksi
        renderDireksiList();
    }

    function renderMisiList() {
        const container = document.getElementById('profInstMisiList');
        if (!container) return;

        const data = admin.profileInstitutionData;
        const misi = (data && Array.isArray(data.misi)) ? data.misi : [];

        if (misi.length === 0) {
            container.innerHTML = '<div class="text-xs text-slate-400 italic py-2">Belum ada butir misi. Klik tombol "+ Tambah Misi".</div>';
            return;
        }

        container.innerHTML = misi.map((item, idx) => `
            <div class="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                <input type="text" value="${admin.escapeHtml(item)}" onchange="SDW_ADMIN_PROFILE.updateMisiItem(${idx}, this.value)" class="flex-1 px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-sdw-pine">
                <button type="button" onclick="SDW_ADMIN_PROFILE.deleteMisiItem(${idx})" class="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs shrink-0 cursor-pointer" title="Hapus Misi">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    function addMisiItem() {
        if (!admin.profileInstitutionData) return;
        if (!Array.isArray(admin.profileInstitutionData.misi)) admin.profileInstitutionData.misi = [];
        admin.profileInstitutionData.misi.push('Tulis butir misi operasional baru di sini...');
        renderMisiList();
    }

    function updateMisiItem(idx, val) {
        if (!admin.profileInstitutionData || !Array.isArray(admin.profileInstitutionData.misi)) return;
        admin.profileInstitutionData.misi[idx] = val;
    }

    function deleteMisiItem(idx) {
        if (!admin.profileInstitutionData || !Array.isArray(admin.profileInstitutionData.misi)) return;
        admin.profileInstitutionData.misi.splice(idx, 1);
        renderMisiList();
    }

    function renderTimelineList() {
        const container = document.getElementById('profInstTimelineList');
        if (!container) return;

        const data = admin.profileInstitutionData;
        const timeline = (data && Array.isArray(data.sejarah_timeline)) ? data.sejarah_timeline : [];

        container.innerHTML = timeline.map((phase, idx) => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 uppercase">Fase ${idx + 1}</span>
                    <input type="text" value="${admin.escapeHtml(phase.phase)}" onchange="SDW_ADMIN_PROFILE.updateTimelineItem(${idx}, 'phase', this.value)" class="text-[10px] font-bold text-slate-500 bg-transparent text-right border-b border-transparent focus:border-slate-300">
                </div>
                <input type="text" value="${admin.escapeHtml(phase.title)}" onchange="SDW_ADMIN_PROFILE.updateTimelineItem(${idx}, 'title', this.value)" class="w-full font-bold text-xs text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <textarea rows="3" onchange="SDW_ADMIN_PROFILE.updateTimelineItem(${idx}, 'desc', this.value)" class="w-full text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">${admin.escapeHtml(phase.desc)}</textarea>
            </div>
        `).join('');
    }

    function updateTimelineItem(idx, field, val) {
        if (!admin.profileInstitutionData || !Array.isArray(admin.profileInstitutionData.sejarah_timeline)) return;
        if (admin.profileInstitutionData.sejarah_timeline[idx]) {
            admin.profileInstitutionData.sejarah_timeline[idx][field] = val;
        }
    }

    function renderDireksiList() {
        const container = document.getElementById('profInstDireksiList');
        if (!container) return;

        const data = admin.profileInstitutionData;
        const direksi = (data && Array.isArray(data.direksi)) ? data.direksi : [];

        container.innerHTML = direksi.map((dir, idx) => `
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="w-12 h-12 rounded-xl overflow-hidden border border-purple-200 bg-slate-200 mx-auto">
                    <img src="${admin.escapeHtml(dir.photo || 'assets/direktur-utama.jpg')}" alt="${admin.escapeHtml(dir.name)}" class="w-full h-full object-cover">
                </div>
                <input type="text" value="${admin.escapeHtml(dir.role)}" onchange="SDW_ADMIN_PROFILE.updateDireksiItem(${idx}, 'role', this.value)" class="w-full text-center text-[10px] font-black uppercase text-sdw-pine bg-purple-50 py-0.5 rounded border border-purple-100">
                <input type="text" value="${admin.escapeHtml(dir.name)}" onchange="SDW_ADMIN_PROFILE.updateDireksiItem(${idx}, 'name', this.value)" class="w-full text-center text-xs font-bold text-slate-800 bg-white px-1.5 py-1 rounded border border-slate-200">
                <input type="text" value="${admin.escapeHtml(dir.title)}" onchange="SDW_ADMIN_PROFILE.updateDireksiItem(${idx}, 'title', this.value)" class="w-full text-center text-[10px] text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">
            </div>
        `).join('');
    }

    function updateDireksiItem(idx, field, val) {
        if (!admin.profileInstitutionData || !Array.isArray(admin.profileInstitutionData.direksi)) return;
        if (admin.profileInstitutionData.direksi[idx]) {
            admin.profileInstitutionData.direksi[idx][field] = val;
        }
    }

    // =========================================================================
    // 2. SUBTAB: DIRECTOR (SAMBUTAN & KOMITMEN PIMPINAN)
    // =========================================================================
    function renderDirector() {
        const data = admin.profileDirectorData;
        if (!data) return;

        // Identity
        const photoPreview = document.getElementById('profDirPhotoPreview');
        const photoUrl = document.getElementById('profDirPhotoUrl');
        const nameEl = document.getElementById('profDirName');
        const roleEl = document.getElementById('profDirRole');
        const badgeEl = document.getElementById('profDirBadge');
        const showOnHome = document.getElementById('profDirShowOnHome');

        if (photoPreview) photoPreview.src = data.photo || 'assets/direktur-utama.jpg';
        if (photoUrl) photoUrl.value = data.photo || 'assets/direktur-utama.jpg';
        if (nameEl) nameEl.value = data.name || '';
        if (roleEl) roleEl.value = data.role || '';
        if (badgeEl) badgeEl.value = data.license_badge || '';
        if (showOnHome) showOnHome.checked = data.show_on_home !== false;

        // Speeches
        const headlineEl = document.getElementById('profDirHeadline');
        const subheadlineEl = document.getElementById('profDirSubheadline');
        const quoteEl = document.getElementById('profDirQuote');

        if (headlineEl) headlineEl.value = data.headline || '';
        if (subheadlineEl) subheadlineEl.value = data.subheadline || '';
        if (quoteEl) quoteEl.value = data.quote || '';

        // Paragraphs
        renderParagraphsList();

        // 4 Pillars
        renderPillarsList();
    }

    function renderParagraphsList() {
        const container = document.getElementById('profDirParagraphsList');
        if (!container) return;

        const data = admin.profileDirectorData;
        const paragraphs = (data && Array.isArray(data.message_paragraphs)) ? data.message_paragraphs : [];

        container.innerHTML = paragraphs.map((p, idx) => `
            <div class="flex items-start gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span class="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">P${idx + 1}</span>
                <textarea rows="2" onchange="SDW_ADMIN_PROFILE.updateParagraphItem(${idx}, this.value)" class="flex-1 p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed">${admin.escapeHtml(p)}</textarea>
                <button type="button" onclick="SDW_ADMIN_PROFILE.deleteParagraphItem(${idx})" class="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs shrink-0 cursor-pointer" title="Hapus Paragraf">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    function addMessageParagraph() {
        if (!admin.profileDirectorData) return;
        if (!Array.isArray(admin.profileDirectorData.message_paragraphs)) admin.profileDirectorData.message_paragraphs = [];
        admin.profileDirectorData.message_paragraphs.push('Tulis paragraf sambutan baru di sini...');
        renderParagraphsList();
    }

    function updateParagraphItem(idx, val) {
        if (!admin.profileDirectorData || !Array.isArray(admin.profileDirectorData.message_paragraphs)) return;
        admin.profileDirectorData.message_paragraphs[idx] = val;
    }

    function deleteParagraphItem(idx) {
        if (!admin.profileDirectorData || !Array.isArray(admin.profileDirectorData.message_paragraphs)) return;
        admin.profileDirectorData.message_paragraphs.splice(idx, 1);
        renderParagraphsList();
    }

    function renderPillarsList() {
        const container = document.getElementById('profDirPillarsList');
        if (!container) return;

        const data = admin.profileDirectorData;
        const pillars = (data && Array.isArray(data.pillars)) ? data.pillars : [];

        container.innerHTML = pillars.map((p, idx) => `
            <div class="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <div class="flex items-center gap-2">
                    <i class="fa-solid ${admin.escapeHtml(p.icon || 'fa-star')} text-amber-600 text-sm"></i>
                    <input type="text" value="${admin.escapeHtml(p.title)}" onchange="SDW_ADMIN_PROFILE.updatePillarItem(${idx}, 'title', this.value)" class="flex-1 font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                </div>
                <input type="text" value="${admin.escapeHtml(p.desc)}" onchange="SDW_ADMIN_PROFILE.updatePillarItem(${idx}, 'desc', this.value)" class="w-full text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-purple-200">
            </div>
        `).join('');
    }

    function updatePillarItem(idx, field, val) {
        if (!admin.profileDirectorData || !Array.isArray(admin.profileDirectorData.pillars)) return;
        if (admin.profileDirectorData.pillars[idx]) {
            admin.profileDirectorData.pillars[idx][field] = val;
        }
    }

    // =========================================================================
    // 3. SUBTAB: GUIDES & MUTHAWWIF
    // =========================================================================
    function renderGuides() {
        const data = admin.profileGuidesData;
        if (!data) return;

        // Lead Advisor
        const lead = data.lead_advisor || {};
        const nameEl = document.getElementById('profLeadName');
        const roleEl = document.getElementById('profLeadRole');
        const credEl = document.getElementById('profLeadCredentials');
        const bioEl = document.getElementById('profLeadBio');
        const ratioEl = document.getElementById('profGuidesRatio');

        if (nameEl) nameEl.value = lead.name || '';
        if (roleEl) roleEl.value = lead.role || '';
        if (credEl) credEl.value = lead.credentials || '';
        if (bioEl) bioEl.value = lead.bio || '';
        if (ratioEl) ratioEl.value = data.ratio_pilgrim || 35;

        // Table
        renderGuidesTable();
    }

    function renderGuidesTable() {
        const tbody = document.getElementById('profGuidesTableBody');
        if (!tbody) return;

        const data = admin.profileGuidesData;
        const guides = (data && Array.isArray(data.guides)) ? data.guides : [];

        if (guides.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">Belum ada personil pembimbing terdaftar.</td></tr>';
            return;
        }

        tbody.innerHTML = guides.map(g => {
            const statusClass = g.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700';
            return `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-full overflow-hidden bg-purple-100 flex items-center justify-center text-sdw-pine font-black text-xs shrink-0">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <span class="font-extrabold text-slate-900 block">${admin.escapeHtml(g.name)}</span>
                                <span class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(g.id)}</span>
                            </div>
                        </div>
                    </td>
                    <td class="p-3 font-semibold text-slate-800">${admin.escapeHtml(g.role)}</td>
                    <td class="p-3 text-slate-600">${admin.escapeHtml(g.university)}</td>
                    <td class="p-3 font-medium text-slate-600">${admin.escapeHtml(g.experience)}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${admin.escapeHtml(g.status)}</span>
                    </td>
                    <td class="p-3 text-right whitespace-nowrap">
                        <button type="button" onclick="SDW_ADMIN_PROFILE.openGuideModal('${g.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-purple-50 transition cursor-pointer mr-1" title="Edit Personil">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" onclick="SDW_ADMIN_PROFILE.deleteGuide('${g.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus Personil">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function openGuideModal(guideId) {
        currentEditingGuideId = guideId || null;
        const modal = document.getElementById('modalGuideForm');
        const title = document.getElementById('modalGuideTitle');
        const form = document.getElementById('formGuide');
        if (!modal || !form) return;

        form.reset();
        document.getElementById('guideFormId').value = guideId || '';

        if (guideId && admin.profileGuidesData && Array.isArray(admin.profileGuidesData.guides)) {
            const g = admin.profileGuidesData.guides.find(item => item.id === guideId);
            if (g) {
                if (title) title.innerText = 'Edit Personil Pembimbing';
                document.getElementById('guideFormName').value = g.name || '';
                document.getElementById('guideFormRole').value = g.role || '';
                document.getElementById('guideFormUniversity').value = g.university || '';
                document.getElementById('guideFormExperience').value = g.experience || '';
                document.getElementById('guideFormStatus').value = g.status || 'AKTIF';
            }
        } else {
            if (title) title.innerText = 'Tambah Personil Pembimbing';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function submitGuideForm(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const id = document.getElementById('guideFormId').value;
        const name = document.getElementById('guideFormName').value.trim();
        const role = document.getElementById('guideFormRole').value.trim();
        const university = document.getElementById('guideFormUniversity').value.trim();
        const experience = document.getElementById('guideFormExperience').value.trim();
        const status = document.getElementById('guideFormStatus').value;

        if (!admin.profileGuidesData) admin.profileGuidesData = { guides: [] };
        if (!Array.isArray(admin.profileGuidesData.guides)) admin.profileGuidesData.guides = [];

        if (id) {
            const existing = admin.profileGuidesData.guides.find(g => g.id === id);
            if (existing) {
                existing.name = name;
                existing.role = role;
                existing.university = university;
                existing.experience = experience;
                existing.status = status;
            }
        } else {
            const newId = `GD-${(admin.profileGuidesData.guides.length + 1).toString().padStart(3, '0')}`;
            admin.profileGuidesData.guides.push({
                id: newId,
                name,
                role,
                university,
                experience,
                status,
                photo: 'assets/direktur-utama.jpg'
            });
        }

        const modal = document.getElementById('modalGuideForm');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        renderGuidesTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data personil pembimbing berhasil diperbarui.');
        }
    }

    function deleteGuide(guideId) {
        if (!confirm('Apakah Anda yakin ingin menghapus data personil ini?')) return;
        if (!admin.profileGuidesData || !Array.isArray(admin.profileGuidesData.guides)) return;
        admin.profileGuidesData.guides = admin.profileGuidesData.guides.filter(g => g.id !== guideId);
        renderGuidesTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data personil berhasil dihapus.');
        }
    }

    // =========================================================================
    // 4. SUBTAB: LEGALITY & PARTNERS (MOU)
    // =========================================================================
    function renderLegality() {
        renderLegalityDocsTable();
        renderPartnersTable();
    }

    function renderLegalityDocsTable() {
        const tbody = document.getElementById('profLegalityDocsTableBody');
        if (!tbody) return;

        const data = admin.profileLegalityData;
        const docs = (data && Array.isArray(data.documents)) ? data.documents : [];

        if (docs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-xs text-slate-400">Belum ada dokumen legalitas terdaftar.</td></tr>';
            return;
        }

        tbody.innerHTML = docs.map(d => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3">
                    <span class="font-extrabold text-slate-900 block">${admin.escapeHtml(d.title)}</span>
                    <span class="text-[10px] text-slate-500">${admin.escapeHtml(d.type || '')}</span>
                </td>
                <td class="p-3 font-mono font-bold text-xs text-sdw-pine">${admin.escapeHtml(d.number)}</td>
                <td class="p-3 text-slate-600">${admin.escapeHtml(d.issuer)}</td>
                <td class="p-3 font-medium text-slate-600">${admin.escapeHtml(d.validity)}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${admin.escapeHtml(d.status)}</span>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                    <button type="button" onclick="SDW_ADMIN_PROFILE.openDocumentModal('${d.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-purple-50 transition cursor-pointer mr-1" title="Edit Dokumen">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button type="button" onclick="SDW_ADMIN_PROFILE.deleteDocument('${d.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus Dokumen">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function openDocumentModal(docId) {
        currentEditingDocId = docId || null;
        const modal = document.getElementById('modalDocumentForm');
        const title = document.getElementById('modalDocumentTitle');
        const form = document.getElementById('formDocument');
        if (!modal || !form) return;

        form.reset();
        document.getElementById('docFormId').value = docId || '';

        if (docId && admin.profileLegalityData && Array.isArray(admin.profileLegalityData.documents)) {
            const d = admin.profileLegalityData.documents.find(item => item.id === docId);
            if (d) {
                if (title) title.innerText = 'Edit Dokumen Legalitas';
                document.getElementById('docFormTitle').value = d.title || '';
                document.getElementById('docFormNumber').value = d.number || '';
                document.getElementById('docFormIssuer').value = d.issuer || '';
                document.getElementById('docFormValidity').value = d.validity || '';
                document.getElementById('docFormStatus').value = d.status || 'AKTIF';
            }
        } else {
            if (title) title.innerText = 'Tambah Dokumen Legalitas';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function submitDocumentForm(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const id = document.getElementById('docFormId').value;
        const title = document.getElementById('docFormTitle').value.trim();
        const number = document.getElementById('docFormNumber').value.trim();
        const issuer = document.getElementById('docFormIssuer').value.trim();
        const validity = document.getElementById('docFormValidity').value.trim();
        const status = document.getElementById('docFormStatus').value;

        if (!admin.profileLegalityData) admin.profileLegalityData = { documents: [], partners: [] };
        if (!Array.isArray(admin.profileLegalityData.documents)) admin.profileLegalityData.documents = [];

        if (id) {
            const existing = admin.profileLegalityData.documents.find(d => d.id === id);
            if (existing) {
                existing.title = title;
                existing.number = number;
                existing.issuer = issuer;
                existing.validity = validity;
                existing.status = status;
            }
        } else {
            const newId = `LEG-${(admin.profileLegalityData.documents.length + 1).toString().padStart(3, '0')}`;
            admin.profileLegalityData.documents.push({
                id: newId,
                title,
                number,
                issuer,
                validity,
                status,
                type: 'Dokumen Perizinan Resmi'
            });
        }

        const modal = document.getElementById('modalDocumentForm');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        renderLegalityDocsTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data dokumen izin berhasil disimpan.');
        }
    }

    function deleteDocument(docId) {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
        if (!admin.profileLegalityData || !Array.isArray(admin.profileLegalityData.documents)) return;
        admin.profileLegalityData.documents = admin.profileLegalityData.documents.filter(d => d.id !== docId);
        renderLegalityDocsTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Dokumen izin berhasil dihapus.');
        }
    }

    function renderPartnersTable() {
        const tbody = document.getElementById('profPartnersTableBody');
        if (!tbody) return;

        const data = admin.profileLegalityData;
        const partners = (data && Array.isArray(data.partners)) ? data.partners : [];

        if (partners.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-xs text-slate-400">Belum ada mitra kerjasama terdaftar.</td></tr>';
            return;
        }

        tbody.innerHTML = partners.map(p => `
            <tr class="hover:bg-slate-50 transition">
                <td class="p-3">
                    <span class="font-extrabold text-slate-900 block">${admin.escapeHtml(p.name)}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(p.id)}</span>
                </td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-sdw-pine">${admin.escapeHtml(p.category)}</span>
                </td>
                <td class="p-3 text-slate-600 font-medium">${admin.escapeHtml(p.role)}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">${admin.escapeHtml(p.status)}</span>
                </td>
                <td class="p-3 text-right whitespace-nowrap">
                    <button type="button" onclick="SDW_ADMIN_PROFILE.openPartnerModal('${p.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-purple-50 transition cursor-pointer mr-1" title="Edit Mitra">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button type="button" onclick="SDW_ADMIN_PROFILE.deletePartner('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus Mitra">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function openPartnerModal(partnerId) {
        currentEditingPartnerId = partnerId || null;
        const modal = document.getElementById('modalPartnerForm');
        const title = document.getElementById('modalPartnerTitle');
        const form = document.getElementById('formPartner');
        if (!modal || !form) return;

        form.reset();
        document.getElementById('partnerFormId').value = partnerId || '';

        if (partnerId && admin.profileLegalityData && Array.isArray(admin.profileLegalityData.partners)) {
            const p = admin.profileLegalityData.partners.find(item => item.id === partnerId);
            if (p) {
                if (title) title.innerText = 'Edit Mitra Kerjasama (MOU)';
                document.getElementById('partnerFormName').value = p.name || '';
                document.getElementById('partnerFormCategory').value = p.category || 'MASKAPAI';
                document.getElementById('partnerFormRole').value = p.role || '';
                document.getElementById('partnerFormStatus').value = p.status || 'MOU AKTIF 1448H';
            }
        } else {
            if (title) title.innerText = 'Tambah Mitra Kerjasama (MOU)';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function submitPartnerForm(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const id = document.getElementById('partnerFormId').value;
        const name = document.getElementById('partnerFormName').value.trim();
        const category = document.getElementById('partnerFormCategory').value;
        const role = document.getElementById('partnerFormRole').value.trim();
        const status = document.getElementById('partnerFormStatus').value.trim();

        if (!admin.profileLegalityData) admin.profileLegalityData = { documents: [], partners: [] };
        if (!Array.isArray(admin.profileLegalityData.partners)) admin.profileLegalityData.partners = [];

        if (id) {
            const existing = admin.profileLegalityData.partners.find(p => p.id === id);
            if (existing) {
                existing.name = name;
                existing.category = category;
                existing.role = role;
                existing.status = status;
            }
        } else {
            const newId = `PTR-${(admin.profileLegalityData.partners.length + 1).toString().padStart(3, '0')}`;
            admin.profileLegalityData.partners.push({
                id: newId,
                name,
                category,
                role,
                status,
                logo: 'fa-handshake'
            });
        }

        const modal = document.getElementById('modalPartnerForm');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        renderPartnersTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data mitra kerjasama MOU berhasil disimpan.');
        }
    }

    function deletePartner(partnerId) {
        if (!confirm('Apakah Anda yakin ingin menghapus data mitra ini?')) return;
        if (!admin.profileLegalityData || !Array.isArray(admin.profileLegalityData.partners)) return;
        admin.profileLegalityData.partners = admin.profileLegalityData.partners.filter(p => p.id !== partnerId);
        renderPartnersTable();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data mitra kerjasama berhasil dihapus.');
        }
    }

    // =========================================================================
    // 5. MASTER PERSISTENCE & DISPATCH SINKRONISASI
    // =========================================================================
    function saveAll() {
        if (typeof document === 'undefined') return;

        // Ensure datasets exist before gathering
        if (!admin.profileInstitutionData && typeof admin.getDefaultProfileInstitutionData === 'function') {
            admin.profileInstitutionData = admin.getDefaultProfileInstitutionData();
        }
        if (!admin.profileDirectorData && typeof admin.getDefaultProfileDirectorData === 'function') {
            admin.profileDirectorData = admin.getDefaultProfileDirectorData();
        }
        if (!admin.profileGuidesData && typeof admin.getDefaultProfileGuidesData === 'function') {
            admin.profileGuidesData = admin.getDefaultProfileGuidesData();
        }
        if (!admin.profileLegalityData && typeof admin.getDefaultProfileLegalityData === 'function') {
            admin.profileLegalityData = admin.getDefaultProfileLegalityData();
        }

        // 1. Gather Subtab 1: Institution
        if (admin.profileInstitutionData) {
            const kpi = admin.profileInstitutionData.kpi || {};
            const ppiuNo = document.getElementById('profInstKpiPpiuNo');
            const ppiuYear = document.getElementById('profInstKpiPpiuYear');
            const akredGrade = document.getElementById('profInstKpiAkredGrade');
            const akredOrg = document.getElementById('profInstKpiAkredOrg');
            const legalName = document.getElementById('profInstKpiLegalName');
            const legalSk = document.getElementById('profInstKpiLegalSk');
            const afiliasiName = document.getElementById('profInstKpiAfiliasiName');
            const afiliasiDetail = document.getElementById('profInstKpiAfiliasiDetail');
            const visiEl = document.getElementById('profInstVisi');

            if (ppiuNo) kpi.ppiu_no = ppiuNo.value;
            if (ppiuYear) kpi.ppiu_year = ppiuYear.value;
            if (akredGrade) kpi.akreditasi_grade = akredGrade.value;
            if (akredOrg) kpi.akreditasi_org = akredOrg.value;
            if (legalName) kpi.legal_name = legalName.value;
            if (legalSk) kpi.legal_sk = legalSk.value;
            if (afiliasiName) kpi.afiliasi_name = afiliasiName.value;
            if (afiliasiDetail) kpi.afiliasi_detail = afiliasiDetail.value;
            if (visiEl) admin.profileInstitutionData.visi = visiEl.value;

            admin.profileInstitutionData.kpi = kpi;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.PROFILE_INSTITUTION, admin.profileInstitutionData);
            }
        }

        // 2. Gather Subtab 2: Director
        if (admin.profileDirectorData) {
            const photoUrl = document.getElementById('profDirPhotoUrl');
            const nameEl = document.getElementById('profDirName');
            const roleEl = document.getElementById('profDirRole');
            const badgeEl = document.getElementById('profDirBadge');
            const showOnHome = document.getElementById('profDirShowOnHome');
            const headlineEl = document.getElementById('profDirHeadline');
            const subheadlineEl = document.getElementById('profDirSubheadline');
            const quoteEl = document.getElementById('profDirQuote');

            if (photoUrl) admin.profileDirectorData.photo = photoUrl.value;
            if (nameEl) admin.profileDirectorData.name = nameEl.value;
            if (roleEl) admin.profileDirectorData.role = roleEl.value;
            if (badgeEl) admin.profileDirectorData.license_badge = badgeEl.value;
            if (showOnHome) admin.profileDirectorData.show_on_home = showOnHome.checked;
            if (headlineEl) admin.profileDirectorData.headline = headlineEl.value;
            if (subheadlineEl) admin.profileDirectorData.subheadline = subheadlineEl.value;
            if (quoteEl) admin.profileDirectorData.quote = quoteEl.value;

            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.PROFILE_DIRECTOR, admin.profileDirectorData);
            }
        }

        // 3. Gather Subtab 3: Guides
        if (admin.profileGuidesData) {
            const lead = admin.profileGuidesData.lead_advisor || {};
            const nameEl = document.getElementById('profLeadName');
            const roleEl = document.getElementById('profLeadRole');
            const credEl = document.getElementById('profLeadCredentials');
            const bioEl = document.getElementById('profLeadBio');
            const ratioEl = document.getElementById('profGuidesRatio');

            if (nameEl) lead.name = nameEl.value;
            if (roleEl) lead.role = roleEl.value;
            if (credEl) lead.credentials = credEl.value;
            if (bioEl) lead.bio = bioEl.value;
            if (ratioEl) admin.profileGuidesData.ratio_pilgrim = parseInt(ratioEl.value, 10) || 35;

            admin.profileGuidesData.lead_advisor = lead;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.PROFILE_GUIDES, admin.profileGuidesData);
            }
        }

        // 4. Gather Subtab 4: Legality
        if (admin.profileLegalityData && typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.PROFILE_LEGALITY, admin.profileLegalityData);
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast('Seluruh perubahan profil lembaga berhasil disimpan & disinkronkan.');
        }
    }

    // Attach to admin namespace
    admin.renderProfileManagement = renderProfileManagement;
    admin.SDW_ADMIN_PROFILE = {
        renderProfileManagement,
        switchSubtab,
        renderInstitution,
        renderDirector,
        renderGuides,
        renderLegality,
        addMisiItem,
        updateMisiItem,
        deleteMisiItem,
        updateTimelineItem,
        updateDireksiItem,
        addMessageParagraph,
        updateParagraphItem,
        deleteParagraphItem,
        updatePillarItem,
        openGuideModal,
        submitGuideForm,
        deleteGuide,
        openDocumentModal,
        submitDocumentForm,
        deleteDocument,
        openPartnerModal,
        submitPartnerForm,
        deletePartner,
        saveAll
    };

    return admin.SDW_ADMIN_PROFILE;
});
