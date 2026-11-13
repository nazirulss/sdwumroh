/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE RBAC ROLES & PERMISSIONS MATRIX CONTROLLER
 * File: js/admin/admin-roles.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: Matriks Hak Akses per Modul Sistem (RBAC Table)
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_ROLES = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    // 1. DAFTAR MODUL TERPROTEKSI SISTEM SDW UMROH (18 Modul)
    const SYSTEM_MODULES = [
        { id: 'tab-dashboard', name: 'Dashboard & Analitik', category: 'Dasbor', icon: 'fa-chart-pie', desc: 'Statistik eksekutif, KPI omset, dan ringkasan operasional' },
        { id: 'tab-crm', name: 'Leads & Konsultasi CRM', category: 'Pemasaran', icon: 'fa-headset', desc: 'Pipeline prospek calon jamaah dan pencatatan follow-up' },
        { id: 'tab-packages', name: 'Katalog Pilihan Paket', category: 'Pemasaran', icon: 'fa-cubes', desc: 'Master paket reguler, VIP Khidmat, dan umroh plus' },
        { id: 'tab-departures', name: 'Jadwal Kloter Keberangkatan', category: 'Pemasaran', icon: 'fa-calendar-days', desc: 'Alokasi seat penerbangan dan tanggal terbang kloter' },
        { id: 'tab-hotels', name: 'Master Hotel Haramain', category: 'Pemasaran', icon: 'fa-hotel', desc: 'Direktori hotel bintang 4/5 Makkah dan Madinah' },
        { id: 'tab-airlines', name: 'Master Maskapai & Bandara', category: 'Pemasaran', icon: 'fa-plane-departure', desc: 'Armada pesawat direct/transit dan bandara embarkasi' },
        { id: 'tab-gallery', name: 'Galeri & Testimoni', category: 'Pemasaran', icon: 'fa-photo-film', desc: 'Dokumentasi media kegiatan umroh dan ulasan jamaah' },
        { id: 'tab-articles', name: 'Artikel & Panduan Ziarah', category: 'Edukasi', icon: 'fa-book-quran', desc: 'Warta manasik, fiqih ibadah, dan titik ziarah bersejarah' },
        { id: 'tab-faq', name: 'Master FAQ & Bantuan CS', category: 'Helpdesk', icon: 'fa-circle-question', desc: 'Tanya jawab dan nomor hotline resmi WhatsApp' },
        { id: 'tab-docs', name: 'Verifikasi Paspor & Visa', category: 'Berkas', icon: 'fa-passport', desc: 'Pemeriksaan berkas imigrasi dan rekam Saudi Visa Bio' },
        { id: 'tab-registrations', name: 'Registrasi & Data Jamaah', category: 'Berkas', icon: 'fa-id-card', desc: 'Database manifesto jamaah dan invoice pendaftaran' },
        { id: 'tab-finance', name: 'Kasir & Rekening Escrow', category: 'Keuangan', icon: 'fa-file-invoice-dollar', desc: 'Pencatatan mutasi DP, pelunasan, dan rekening bank' },
        { id: 'tab-operations', name: 'Operasional Tanah Suci', category: 'Operasional', icon: 'fa-bus', desc: 'Manifest bus AC, alokasi rooming list, dan muthawwif' },
        { id: 'tab-certificates', name: 'E-Sertifikat Umroh', category: 'Sertifikat', icon: 'fa-certificate', desc: 'Penerbitan dan download sertifikat resmi umroh' },
        { id: 'tab-badal-certificates', name: 'E-Sertifikat Badal Umroh', category: 'Sertifikat', icon: 'fa-award', desc: 'Pengesahan dan penerbitan piagam badal umroh' },
        { id: 'tab-users', name: 'Manajemen Pengguna Terpadu', category: 'Sistem', icon: 'fa-users-gear', desc: 'Pengelolaan akun staf backoffice dan akun jamaah' },
        { id: 'tab-roles', name: 'Manajemen Peran & RBAC', category: 'Sistem', icon: 'fa-shield-halved', desc: 'Konfigurasi matriks hak akses 5 tingkat otoritas' },
        { id: 'tab-audit', name: 'Log Audit Keamanan', category: 'Sistem', icon: 'fa-shield-virus', desc: 'Jejak audit forensik aktivitas mutasi data staf' }
    ];

    // 2. DAFTAR PERAN SISTEM (8 Roles)
    const SYSTEM_ROLES = [
        { key: 'SUPER_ADMIN', name: 'Super Admin', icon: 'fa-crown', color: 'amber', isLocked: true },
        { key: 'ADMIN', name: 'Admin', icon: 'fa-shield-halved', color: 'emerald', isLocked: false },
        { key: 'DIRECTOR', name: 'Pimpinan', icon: 'fa-user-tie', color: 'orange', isLocked: false },
        { key: 'FINANCE', name: 'Keuangan', icon: 'fa-wallet', color: 'purple', isLocked: false },
        { key: 'OPERATIONS', name: 'Operasional', icon: 'fa-truck-fast', color: 'sky', isLocked: false },
        { key: 'SALES', name: 'Sales / CRM', icon: 'fa-phone-volume', color: 'teal', isLocked: false },
        { key: 'MUTHAWWIF', name: 'Muthawwif', icon: 'fa-kaaba', color: 'indigo', isLocked: false },
        { key: 'PILGRIM', name: 'Jamaah', icon: 'fa-user', color: 'slate', isLocked: false }
    ];

    // 3. TINGKAT OTORITAS (5 Levels)
    const ACCESS_LEVELS = {
        'FULL': { key: 'FULL', label: 'Penuh (CRUD)', pill: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold', dot: 'bg-emerald-500', icon: 'fa-check' },
        'VIEW': { key: 'VIEW', label: 'Lihat Saja', pill: 'bg-sky-50 text-sky-700 border-sky-300 font-bold', dot: 'bg-sky-500', icon: 'fa-eye' },
        'INPUT': { key: 'INPUT', label: 'Entri & Input', pill: 'bg-amber-50 text-amber-700 border-amber-300 font-bold', dot: 'bg-amber-500', icon: 'fa-pen-to-square' },
        'OWN': { key: 'OWN', label: 'Milik Sendiri', pill: 'bg-teal-50 text-teal-700 border-teal-300 font-bold', dot: 'bg-teal-500', icon: 'fa-user-check' },
        'NONE': { key: 'NONE', label: 'Tutup', pill: 'bg-slate-100 text-slate-400 border-slate-200 font-semibold', dot: 'bg-slate-300', icon: 'fa-ban' }
    };

    // Default Fallback Matrix Generator
    function generateDefaultMatrix() {
        const matrix = {};
        SYSTEM_ROLES.forEach(r => {
            matrix[r.key] = {};
            SYSTEM_MODULES.forEach(m => {
                if (r.key === 'SUPER_ADMIN') {
                    matrix[r.key][m.id] = 'FULL';
                } else if (r.key === 'ADMIN') {
                    matrix[r.key][m.id] = (m.id === 'tab-roles') ? 'VIEW' : 'FULL';
                } else if (r.key === 'DIRECTOR') {
                    matrix[r.key][m.id] = 'VIEW';
                } else if (r.key === 'FINANCE') {
                    if (m.id === 'tab-finance') matrix[r.key][m.id] = 'FULL';
                    else if (['tab-dashboard', 'tab-registrations', 'tab-packages', 'tab-departures'].includes(m.id)) matrix[r.key][m.id] = 'VIEW';
                    else matrix[r.key][m.id] = 'NONE';
                } else if (r.key === 'OPERATIONS') {
                    if (['tab-operations', 'tab-departures', 'tab-hotels', 'tab-airlines', 'tab-certificates', 'tab-badal-certificates'].includes(m.id)) matrix[r.key][m.id] = 'FULL';
                    else if (['tab-dashboard', 'tab-packages', 'tab-registrations'].includes(m.id)) matrix[r.key][m.id] = 'VIEW';
                    else matrix[r.key][m.id] = 'NONE';
                } else if (r.key === 'SALES') {
                    if (m.id === 'tab-crm') matrix[r.key][m.id] = 'OWN';
                    else if (m.id === 'tab-registrations') matrix[r.key][m.id] = 'INPUT';
                    else if (['tab-dashboard', 'tab-packages', 'tab-departures', 'tab-hotels', 'tab-airlines', 'tab-gallery', 'tab-faq'].includes(m.id)) matrix[r.key][m.id] = 'VIEW';
                    else matrix[r.key][m.id] = 'NONE';
                } else if (r.key === 'MUTHAWWIF') {
                    if (m.id === 'tab-operations') matrix[r.key][m.id] = 'OWN';
                    else if (['tab-dashboard', 'tab-articles', 'tab-faq', 'tab-certificates'].includes(m.id)) matrix[r.key][m.id] = 'VIEW';
                    else matrix[r.key][m.id] = 'NONE';
                } else {
                    matrix[r.key][m.id] = 'NONE';
                }
            });
        });
        return matrix;
    }

    // Local Storage Access
    function getStoredRbacMatrix() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.RBAC_MATRIX : 'sdw_admin_rbac_matrix');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') return parsed;
                }
            }
        } catch (e) {
            console.warn('[SDW_ROLES] Failed to read RBAC matrix from localStorage:', e);
        }
        return generateDefaultMatrix();
    }

    function saveStoredRbacMatrix(matrix) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.RBAC_MATRIX : 'sdw_admin_rbac_matrix', JSON.stringify(matrix));
            }
            if (admin.state) {
                admin.state.rbacMatrix = matrix;
            }
        } catch (e) {
            console.error('[SDW_ROLES] Failed to save RBAC matrix to localStorage:', e);
        }
    }

    // ==========================================
    // RENDER ROLES & RBAC MATRIX DASHBOARD
    // ==========================================
    function renderRoles() {
        const tabEl = document.getElementById('tab-roles');
        if (!tabEl) return;

        const matrix = getStoredRbacMatrix();
        const users = (admin.getStoredUsers ? admin.getStoredUsers() : (admin.state && admin.state.usersData ? admin.state.usersData : []));

        // 1. KPI Stats
        const kpiRoles = document.getElementById('kpiTotalRoles');
        const kpiUsers = document.getElementById('kpiTotalRoleUsers');
        const kpiModules = document.getElementById('kpiTotalModules');
        const kpiCurrent = document.getElementById('kpiCurrentRoleName');

        if (kpiRoles) kpiRoles.innerText = `${SYSTEM_ROLES.length} Role ↑`;
        if (kpiUsers) kpiUsers.innerText = `${users.length || 7} Pengguna`;
        if (kpiModules) kpiModules.innerText = `${SYSTEM_MODULES.length} Modul`;
        if (kpiCurrent) {
            const current = (admin.currentRole || 'SUPER_ADMIN').replace('_', ' ');
            kpiCurrent.innerText = current;
        }

        // 2. Render RBAC Table
        renderRbacTable(matrix);
    }

    function renderRbacTable(matrix) {
        const thead = document.getElementById('rbacTableHead');
        const tbody = document.getElementById('rbacTableBody');
        if (!thead || !tbody) return;

        // Render Table Header with "Aksi Cepat ▾" for each role column
        let headHtml = `
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-700">
                <th class="py-3 px-4 w-72 min-w-[260px] text-left">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-layer-group text-sdw-pine"></i>
                        <span>Modul &amp; Fitur Aplikasi</span>
                    </div>
                </th>
        `;

        SYSTEM_ROLES.forEach(r => {
            if (r.isLocked) {
                headHtml += `
                    <th class="py-3 px-3 text-center min-w-[140px] bg-amber-50/40 border-l border-slate-200/60">
                        <div class="flex flex-col items-center gap-1">
                            <span class="inline-flex items-center gap-1 text-amber-800 font-extrabold text-[11px]">
                                <i class="fa-solid ${r.icon} text-amber-500"></i>
                                <span>${r.name}</span>
                            </span>
                            <span class="text-[9.5px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">Terkunci</span>
                        </div>
                    </th>
                `;
            } else {
                headHtml += `
                    <th class="py-3 px-3 text-center min-w-[140px] border-l border-slate-200/60">
                        <div class="flex flex-col items-center gap-1">
                            <span class="inline-flex items-center gap-1 text-slate-800 font-extrabold text-[11px]">
                                <i class="fa-solid ${r.icon} text-slate-500"></i>
                                <span>${r.name}</span>
                            </span>
                            <div class="relative inline-block text-left group">
                                <button type="button" class="text-[9.5px] font-bold text-slate-500 hover:text-sdw-pine bg-white hover:bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 transition cursor-pointer flex items-center gap-1">
                                    <span>Aksi Cepat</span>
                                    <i class="fa-solid fa-chevron-down text-[8px]"></i>
                                </button>
                                <div class="absolute right-0 mt-1 w-36 rounded-xl bg-white shadow-xl border border-slate-200 py-1 hidden group-hover:block z-30 animate-scale-up text-left font-normal text-[10.5px]">
                                    <a href="javascript:void(0)" onclick="SDW_ADMIN.batchSetRolePermission('${r.key}', 'FULL')" class="block px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-bold">🟢 Set Semua Penuh</a>
                                    <a href="javascript:void(0)" onclick="SDW_ADMIN.batchSetRolePermission('${r.key}', 'VIEW')" class="block px-3 py-1.5 hover:bg-sky-50 text-sky-800 font-bold">🔵 Set Semua Lihat Saja</a>
                                    <a href="javascript:void(0)" onclick="SDW_ADMIN.batchSetRolePermission('${r.key}', 'INPUT')" class="block px-3 py-1.5 hover:bg-amber-50 text-amber-800 font-bold">🟠 Set Semua Entri</a>
                                    <a href="javascript:void(0)" onclick="SDW_ADMIN.batchSetRolePermission('${r.key}', 'NONE')" class="block px-3 py-1.5 hover:bg-rose-50 text-rose-800 font-bold border-t border-slate-100">🔴 Set Semua Tutup</a>
                                </div>
                            </div>
                        </div>
                    </th>
                `;
            }
        });

        headHtml += `</tr>`;
        thead.innerHTML = headHtml;

        // Render Table Body
        let bodyHtml = '';
        SYSTEM_MODULES.forEach(mod => {
            bodyHtml += `
            <tr class="hover:bg-slate-50/70 transition border-b border-slate-100">
                <!-- Modul Info -->
                <td class="py-3 px-4">
                    <div class="flex items-start gap-2.5">
                        <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 text-xs mt-0.5">
                            <i class="fa-solid ${mod.icon}"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="font-extrabold text-xs text-slate-900">${mod.name}</span>
                                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">${mod.category}</span>
                            </div>
                            <p class="text-[10.5px] text-slate-500 leading-tight mt-0.5">${mod.desc}</p>
                        </div>
                    </div>
                </td>
            `;

            // Role Cell Dropdowns
            SYSTEM_ROLES.forEach(r => {
                const currentLevel = (matrix[r.key] && matrix[r.key][mod.id]) ? matrix[r.key][mod.id] : (r.key === 'SUPER_ADMIN' ? 'FULL' : 'NONE');
                const lvlMeta = ACCESS_LEVELS[currentLevel] || ACCESS_LEVELS.NONE;

                if (r.isLocked) {
                    bodyHtml += `
                    <td class="py-2.5 px-3 text-center bg-amber-50/20 border-l border-slate-200/60">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100/80 text-amber-900 border border-amber-300">
                            <i class="fa-solid fa-crown text-amber-500 text-[9px]"></i>
                            <span>Penuh</span>
                        </span>
                    </td>
                    `;
                } else {
                    bodyHtml += `
                    <td class="py-2.5 px-3 text-center border-l border-slate-200/60">
                        <div class="relative inline-block w-full max-w-[130px]">
                            <select onchange="SDW_ADMIN.changePermissionCell('${r.key}', '${mod.id}', this.value)" class="w-full text-center px-2 py-1 rounded-xl text-[10px] border focus:outline-hidden cursor-pointer transition shadow-2xs ${lvlMeta.pill}">
                                <option value="FULL" ${currentLevel === 'FULL' ? 'selected' : ''}>🟢 Penuh (CRUD)</option>
                                <option value="VIEW" ${currentLevel === 'VIEW' ? 'selected' : ''}>🔵 Lihat Saja</option>
                                <option value="INPUT" ${currentLevel === 'INPUT' ? 'selected' : ''}>🟠 Entri &amp; Input</option>
                                <option value="OWN" ${currentLevel === 'OWN' ? 'selected' : ''}>🔘 Milik Sendiri</option>
                                <option value="NONE" ${currentLevel === 'NONE' ? 'selected' : ''}>🔴 Tutup</option>
                            </select>
                        </div>
                    </td>
                    `;
                }
            });

            bodyHtml += `</tr>`;
        });

        tbody.innerHTML = bodyHtml;
    }

    // ==========================================
    // MUTATION HANDLERS
    // ==========================================
    async function changePermissionCell(roleKey, moduleKey, newLevel) {
        const matrix = getStoredRbacMatrix();
        if (!matrix[roleKey]) matrix[roleKey] = {};
        matrix[roleKey][moduleKey] = newLevel;

        saveStoredRbacMatrix(matrix);
        renderRoles();

        const roleObj = SYSTEM_ROLES.find(r => r.key === roleKey);
        const modObj = SYSTEM_MODULES.find(m => m.id === moduleKey);
        const lvlMeta = ACCESS_LEVELS[newLevel];

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Izin "${roleObj ? roleObj.name : roleKey}" untuk modul "${modObj ? modObj.name : moduleKey}" diset ke ${lvlMeta ? lvlMeta.label : newLevel}.`, 'info');
        }

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveRoleMatrixPermission', {
                    role_key: roleKey,
                    role_name: roleObj ? roleObj.name : roleKey,
                    module_key: moduleKey,
                    access_level: newLevel
                }, 'DB_Role_Permissions');
            }
        } catch (err) {
            console.warn('[SDW_ROLES] Cloud mutation saveRoleMatrixPermission skipped:', err);
        }
    }

    async function batchSetRolePermission(roleKey, newLevel) {
        const matrix = getStoredRbacMatrix();
        if (!matrix[roleKey]) matrix[roleKey] = {};

        SYSTEM_MODULES.forEach(m => {
            matrix[roleKey][m.id] = newLevel;
        });

        saveStoredRbacMatrix(matrix);
        renderRoles();

        const roleObj = SYSTEM_ROLES.find(r => r.key === roleKey);
        const lvlMeta = ACCESS_LEVELS[newLevel];

        if (typeof admin.showToast === 'function') {
            admin.showToast(`⚡ Seluruh modul untuk peran "${roleObj ? roleObj.name : roleKey}" berhasil diset ke ${lvlMeta ? lvlMeta.label : newLevel}!`, 'success');
        }

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('batchUpdateRolePermissions', {
                    role_key: roleKey,
                    access_level: newLevel
                }, 'DB_Role_Permissions');
            }
        } catch (err) {
            console.warn('[SDW_ROLES] Cloud mutation batchUpdateRolePermissions skipped:', err);
        }
    }

    // Modal Panduan RBAC
    function openRbacGuideModal() {
        const modal = document.getElementById('modalRbacGuide');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    function closeRbacGuideModal() {
        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalRbacGuide');
        } else {
            const modal = document.getElementById('modalRbacGuide');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }
    }

    // Cloud Sync
    async function syncRolesFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycbzeArcK6rTUnuvISbtIehgDsO1CacpL6fEOmqyCpuJjS747btjIgAhMnHNZUC3yz8n3/exec';

        if (typeof admin.showToast === 'function') admin.showToast('🔄 Memulai sinkronisasi Matriks RBAC...', 'info');

        try {
            const res = await fetch(syncUrl + '?action=getRolePermissions');
            if (res.ok) {
                const data = await res.json();
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const newMatrix = generateDefaultMatrix();
                    data.data.forEach(item => {
                        if (item.role_key && item.module_key && item.access_level) {
                            if (!newMatrix[item.role_key]) newMatrix[item.role_key] = {};
                            newMatrix[item.role_key][item.module_key] = item.access_level;
                        }
                    });
                    saveStoredRbacMatrix(newMatrix);
                    renderRoles();
                    if (typeof admin.showToast === 'function') admin.showToast('✅ Sinkronisasi Matriks RBAC berhasil!', 'success');
                    return;
                }
            }
            throw new Error('Respons tidak valid atau kosong');
        } catch (err) {
            console.error('[SDW_ROLES] Sync failed:', err);
            if (typeof admin.showToast === 'function') admin.showToast('Gagal terhubung ke cloud spreadsheet. Matriks lokal dipertahankan.', 'warning');
        }
    }

    // Helper: Dynamic Permission Resolver
    function canAccessTab(role, tabId) {
        const r = (role || 'PILGRIM').toUpperCase();
        if (r === 'SUPER_ADMIN') return true;

        const matrix = getStoredRbacMatrix();
        if (matrix[r] && matrix[r][tabId]) {
            return matrix[r][tabId] !== 'NONE';
        }
        return false;
    }

    function getTabAccessLevel(role, tabId) {
        const r = (role || 'PILGRIM').toUpperCase();
        if (r === 'SUPER_ADMIN') return 'FULL';

        const matrix = getStoredRbacMatrix();
        if (matrix[r] && matrix[r][tabId]) {
            return matrix[r][tabId];
        }
        return 'NONE';
    }

    // Exports
    admin.SYSTEM_MODULES = SYSTEM_MODULES;
    admin.SYSTEM_ROLES = SYSTEM_ROLES;
    admin.ACCESS_LEVELS = ACCESS_LEVELS;
    admin.renderRoles = renderRoles;
    admin.renderRbacTable = renderRbacTable;
    admin.changePermissionCell = changePermissionCell;
    admin.batchSetRolePermission = batchSetRolePermission;
    admin.openRbacGuideModal = openRbacGuideModal;
    admin.closeRbacGuideModal = closeRbacGuideModal;
    admin.syncRolesFromCloud = syncRolesFromCloud;
    admin.canAccessTab = canAccessTab;
    admin.getTabAccessLevel = getTabAccessLevel;

    return {
        SYSTEM_MODULES,
        SYSTEM_ROLES,
        ACCESS_LEVELS,
        getStoredRbacMatrix,
        saveStoredRbacMatrix,
        renderRoles,
        changePermissionCell,
        batchSetRolePermission,
        canAccessTab,
        getTabAccessLevel,
        syncRolesFromCloud
    };
});

