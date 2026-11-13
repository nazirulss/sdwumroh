/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE USER MANAGEMENT CONTROLLER
 * File: js/admin/admin-users.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: Manajemen Pengguna Terpadu
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_USERS = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    // 1. DEFAULT SEED USERS (7 Akun Terdata Resmi)
    const DEFAULT_USERS = [
        {
            id: 'USR-000001',
            name: 'Super Administrator',
            email: 'admin@sdwumroh.com',
            phone: '6281234567890',
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            connected_entity: 'Semua Sistem & Otoritas Penuh',
            last_active: 'Aktif Sekarang',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000002',
            name: 'H. Ahmad Fauzi (Admin Operasional)',
            email: 'ops@sdwumroh.com',
            phone: '6281122334455',
            role: 'ADMIN',
            status: 'ACTIVE',
            connected_entity: 'Kloter Reguler & VIP Khidmat',
            last_active: '1 jam lalu',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000003',
            name: 'H. Muhammad Syarif (Direktur Utama)',
            email: 'syarif@sdwumroh.com',
            phone: '6281299887766',
            role: 'DIRECTOR',
            status: 'ACTIVE',
            connected_entity: 'Dewan Direksi & Pimpinan',
            last_active: '2 jam lalu',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000004',
            name: 'Hj. Fatimah Zahra (Finance & Kasir)',
            email: 'finance@sdwumroh.com',
            phone: '6281355667788',
            role: 'FINANCE',
            status: 'ACTIVE',
            connected_entity: 'Escrow BSI & Muamalat',
            last_active: '5 jam lalu',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000005',
            name: 'Ustadz Dr. Abdullah (Muthawwif Senior)',
            email: 'muthawwif@sdwumroh.com',
            phone: '6281788990011',
            role: 'MUTHAWWIF',
            status: 'ACTIVE',
            connected_entity: 'Kloter Syawal VIP (#KLT-01)',
            last_active: '1 hari lalu',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000006',
            name: 'Budi Santoso (Senior Sales Consultant)',
            email: 'sales@sdwumroh.com',
            phone: '6281566778899',
            role: 'SALES',
            status: 'ACTIVE',
            connected_entity: 'Area Jabodetabek & Jawa Barat',
            last_active: '3 hari lalu',
            created_at: new Date().toISOString()
        },
        {
            id: 'USR-000007',
            name: 'Siti Aisyah (Akun Jamaah Umroh)',
            email: 'aisyah@gmail.com',
            phone: '6281233445566',
            role: 'PILGRIM',
            status: 'ACTIVE',
            connected_entity: 'SDW-2025-01 (Booking #BK-8821)',
            last_active: '14 hari lalu',
            created_at: new Date().toISOString()
        }
    ];

    // Helper: LocalStorage Access
    function getStoredUsers() {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.USERS : 'sdw_admin_users');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            }
        } catch (e) {
            console.warn('[SDW_USERS] Failed to read localStorage, falling back to default:', e);
        }
        return DEFAULT_USERS;
    }

    function saveStoredUsers(users) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.USERS : 'sdw_admin_users', JSON.stringify(users));
            }
            if (admin.state) {
                admin.state.usersData = users;
            }
        } catch (e) {
            console.error('[SDW_USERS] Failed to save to localStorage:', e);
        }
    }

    // Role Metadata Helper (Icon, Label, Color)
    function getRoleMeta(role) {
        const r = (role || 'PILGRIM').toUpperCase();
        switch (r) {
            case 'SUPER_ADMIN':
                return { label: 'Super Admin', bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'fa-crown' };
            case 'ADMIN':
                return { label: 'Administrator', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'fa-shield-halved' };
            case 'DIRECTOR':
                return { label: 'Pimpinan / Direksi', bg: 'bg-orange-100 text-orange-900 border-orange-300', icon: 'fa-user-tie' };
            case 'FINANCE':
                return { label: 'Keuangan & Kasir', bg: 'bg-purple-100 text-purple-900 border-purple-300', icon: 'fa-wallet' };
            case 'OPERATIONS':
                return { label: 'Staf Operasional', bg: 'bg-sky-100 text-sky-900 border-sky-300', icon: 'fa-truck-fast' };
            case 'SALES':
                return { label: 'Sales Consultant', bg: 'bg-teal-100 text-teal-900 border-teal-300', icon: 'fa-phone-volume' };
            case 'MUTHAWWIF':
                return { label: 'Muthawwif & TL', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: 'fa-kaaba' };
            case 'PILGRIM':
            default:
                return { label: 'Akun Jamaah', bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: 'fa-user' };
        }
    }

    function getAvatarColor(name) {
        const colors = [
            'bg-emerald-600 text-white',
            'bg-purple-600 text-white',
            'bg-amber-600 text-white',
            'bg-blue-600 text-white',
            'bg-teal-600 text-white',
            'bg-rose-600 text-white',
            'bg-indigo-600 text-white'
        ];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    function getInitials(name) {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }

    // ==========================================
    // RENDER USERS DASHBOARD
    // ==========================================
    function renderUsers() {
        const tabEl = document.getElementById('tab-users');
        if (!tabEl) return;

        const allUsers = getStoredUsers();

        // 1. Update KPI Strip (4 Cards)
        const totalUsers = allUsers.length;
        const pilgrimUsers = allUsers.filter(u => u.role === 'PILGRIM').length;
        const leadershipUsers = allUsers.filter(u => u.role === 'DIRECTOR' || u.role === 'SUPER_ADMIN').length;
        const staffUsers = allUsers.filter(u => ['ADMIN', 'FINANCE', 'OPERATIONS', 'SALES', 'MUTHAWWIF'].includes(u.role)).length;

        const kpiTotal = document.getElementById('kpiTotalUsers');
        const kpiPilgrim = document.getElementById('kpiPilgrimUsers');
        const kpiLeadership = document.getElementById('kpiLeadershipUsers');
        const kpiStaff = document.getElementById('kpiStaffUsers');
        const badgeCount = document.getElementById('badgeUsersCount');

        if (kpiTotal) kpiTotal.innerText = `${totalUsers} Akun`;
        if (kpiPilgrim) kpiPilgrim.innerText = `${pilgrimUsers} Jamaah`;
        if (kpiLeadership) kpiLeadership.innerText = `${leadershipUsers} Pimpinan`;
        if (kpiStaff) kpiStaff.innerText = `${staffUsers} Staf`;
        if (badgeCount) badgeCount.innerText = `${totalUsers}`;

        // 2. Update Filter Tabs Counts
        const countAll = totalUsers;
        const countOnline = allUsers.filter(u => (u.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
        const countPilgrimTab = pilgrimUsers;
        const countMuthawwifTab = allUsers.filter(u => u.role === 'MUTHAWWIF').length;
        const countStaffTab = allUsers.filter(u => ['ADMIN', 'FINANCE', 'OPERATIONS'].includes(u.role)).length;
        const countSalesTab = allUsers.filter(u => u.role === 'SALES').length;

        const elCntAll = document.getElementById('cntUsersAll');
        const elCntOnline = document.getElementById('cntUsersOnline');
        const elCntPilgrim = document.getElementById('cntUsersPilgrim');
        const elCntMuthawwif = document.getElementById('cntUsersMuthawwif');
        const elCntStaff = document.getElementById('cntUsersStaff');
        const elCntSales = document.getElementById('cntUsersSales');

        if (elCntAll) elCntAll.innerText = countAll;
        if (elCntOnline) elCntOnline.innerText = countOnline;
        if (elCntPilgrim) elCntPilgrim.innerText = countPilgrimTab;
        if (elCntMuthawwif) elCntMuthawwif.innerText = countMuthawwifTab;
        if (elCntStaff) elCntStaff.innerText = countStaffTab;
        if (elCntSales) elCntSales.innerText = countSalesTab;

        // 3. Render Users Table
        renderUsersTable();
    }

    // Filter Logic
    function getFilteredUsers() {
        const users = getStoredUsers();
        const filter = (admin.state && admin.state.usersFilter) ? admin.state.usersFilter : { role: 'ALL', search: '', status: 'ALL' };

        return users.filter(user => {
            // Role Filter Tab
            if (filter.role && filter.role !== 'ALL') {
                if (filter.role === 'ONLINE') {
                    if ((user.status || 'ACTIVE').toUpperCase() !== 'ACTIVE') return false;
                } else if (filter.role === 'STAFF') {
                    if (!['ADMIN', 'FINANCE', 'OPERATIONS', 'SUPER_ADMIN'].includes(user.role)) return false;
                } else if (user.role !== filter.role) {
                    return false;
                }
            }

            // Status Filter Dropdown
            if (filter.status && filter.status !== 'ALL') {
                if ((user.status || 'ACTIVE').toUpperCase() !== filter.status) return false;
            }

            // Keyword Search
            if (filter.search) {
                const q = filter.search.toLowerCase().trim();
                const matchName = (user.name || '').toLowerCase().includes(q);
                const matchEmail = (user.email || '').toLowerCase().includes(q);
                const matchPhone = (user.phone || '').includes(q);
                const matchRole = (user.role || '').toLowerCase().includes(q);
                const matchEntity = (user.connected_entity || '').toLowerCase().includes(q);
                if (!matchName && !matchEmail && !matchPhone && !matchRole && !matchEntity) return false;
            }

            return true;
        });
    }

    function renderUsersTable() {
        const tableBody = document.getElementById('usersTableBody');
        const emptyState = document.getElementById('usersEmptyState');
        const tableView = document.getElementById('usersTableView');
        if (!tableBody) return;

        const items = getFilteredUsers();

        if (items.length === 0) {
            tableBody.innerHTML = '';
            if (tableView) tableView.classList.add('hidden');
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (tableView) tableView.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');

        tableBody.innerHTML = items.map(user => {
            const roleMeta = getRoleMeta(user.role);
            const avatarColor = getAvatarColor(user.name);
            const initials = getInitials(user.name);
            const isActive = (user.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
            const cleanPhone = String(user.phone || '').replace(/[^0-9]/g, '');

            const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Assalamualaikum%20${encodeURIComponent(user.name)}` : '#';

            return `
            <tr class="hover:bg-slate-50/80 transition duration-150">
                <!-- 1. PENGGUNA (Avatar, Nama, Email & Terakhir Aktif) -->
                <td class="py-3 px-3.5">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            ${initials}
                        </div>
                        <div class="min-w-0">
                            <div class="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                                <span>${admin.escapeHtml ? admin.escapeHtml(user.name) : user.name}</span>
                                ${user.role === 'SUPER_ADMIN' ? '<i class="fa-solid fa-crown text-amber-500 text-[10px]" title="Super Administrator"></i>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                                <span>${admin.escapeHtml ? admin.escapeHtml(user.email) : user.email}</span>
                                <span class="text-slate-300">•</span>
                                <span class="text-[10px] text-slate-400"><i class="fa-regular fa-clock mr-1 text-[9px]"></i>${admin.escapeHtml ? admin.escapeHtml(user.last_active || 'Baru saja') : user.last_active}</span>
                            </div>
                        </div>
                    </div>
                </td>

                <!-- 2. WHATSAPP / HP -->
                <td class="py-3 px-3.5">
                    ${cleanPhone ? `
                    <div class="flex items-center gap-1.5">
                        <span class="font-mono text-xs font-semibold text-slate-700">${cleanPhone}</span>
                        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center text-[10px] transition" title="Chat WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </a>
                    </div>
                    ` : '<span class="text-slate-400 text-xs italic">-</span>'}
                </td>

                <!-- 3. PERAN -->
                <td class="py-3 px-3.5">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${roleMeta.bg}">
                        <i class="fa-solid ${roleMeta.icon}"></i>
                        <span>${roleMeta.label}</span>
                    </span>
                </td>

                <!-- 4. DATA TERHUBUNG / RELASI -->
                <td class="py-3 px-3.5">
                    <div class="flex items-center gap-1.5">
                        <span class="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200/60 font-semibold text-[10.5px] max-w-[200px] truncate" title="${admin.escapeHtml ? admin.escapeHtml(user.connected_entity || '-') : user.connected_entity}">
                            <i class="fa-solid fa-link text-purple-600 mr-1 text-[9px]"></i>${admin.escapeHtml ? admin.escapeHtml(user.connected_entity || '-') : user.connected_entity}
                        </span>
                    </div>
                </td>

                <!-- 5. STATUS -->
                <td class="py-3 px-3.5 text-center">
                    ${isActive ? `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Aktif</span>
                    </span>
                    ` : `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>Kunci / Nonaktif</span>
                    </span>
                    `}
                </td>

                <!-- 6. AKSI -->
                <td class="py-3 px-3.5 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button type="button" onclick="SDW_ADMIN.openUserModal('${user.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-slate-100 transition cursor-pointer" title="Edit Akun Pengguna">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button type="button" onclick="SDW_ADMIN.toggleUserStatus('${user.id}')" class="p-1.5 rounded-lg ${isActive ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'} transition cursor-pointer" title="${isActive ? 'Kunci / Nonaktifkan Akun' : 'Aktifkan Kembali Akun'}">
                            <i class="fa-solid ${isActive ? 'fa-user-lock' : 'fa-user-check'} text-xs"></i>
                        </button>
                        <button type="button" onclick="SDW_ADMIN.deleteUser('${user.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus Akun Pengguna">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }

    // Role Tab Switcher
    function switchUserRoleTab(roleFilter) {
        if (!admin.state) admin.state = {};
        if (!admin.state.usersFilter) admin.state.usersFilter = { role: 'ALL', search: '', status: 'ALL' };

        admin.state.usersFilter.role = roleFilter;

        // Update button states
        const tabs = ['tabUsersAll', 'tabUsersOnline', 'tabUsersPilgrim', 'tabUsersMuthawwif', 'tabUsersStaff', 'tabUsersSales'];
        tabs.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200';
            }
        });

        let activeBtnId = 'tabUsersAll';
        if (roleFilter === 'ONLINE') activeBtnId = 'tabUsersOnline';
        else if (roleFilter === 'PILGRIM') activeBtnId = 'tabUsersPilgrim';
        else if (roleFilter === 'MUTHAWWIF') activeBtnId = 'tabUsersMuthawwif';
        else if (roleFilter === 'STAFF') activeBtnId = 'tabUsersStaff';
        else if (roleFilter === 'SALES') activeBtnId = 'tabUsersSales';

        const activeBtn = document.getElementById(activeBtnId);
        if (activeBtn) {
            activeBtn.className = 'px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer bg-sdw-pine text-white shadow-xs';
        }

        renderUsersTable();
    }

    function applyUsersFilter() {
        if (!admin.state) admin.state = {};
        if (!admin.state.usersFilter) admin.state.usersFilter = { role: 'ALL', search: '', status: 'ALL' };

        const searchInput = document.getElementById('usersSearchInput');
        const statusSelect = document.getElementById('usersStatusFilter');

        if (searchInput) admin.state.usersFilter.search = searchInput.value;
        if (statusSelect) admin.state.usersFilter.status = statusSelect.value;

        renderUsersTable();
    }

    // ==========================================
    // MODAL CRUD HANDLERS
    // ==========================================
    function openUserModal(userId) {
        const modal = document.getElementById('modalUserEditor');
        const titleEl = document.getElementById('modalUserTitle');
        if (!modal) return;

        const allUsers = getStoredUsers();
        const user = allUsers.find(u => u.id === userId);

        if (user) {
            if (titleEl) titleEl.innerText = 'Edit Akun Pengguna';
            document.getElementById('userModalId').value = user.id;
            document.getElementById('userModalName').value = user.name || '';
            document.getElementById('userModalEmail').value = user.email || '';
            document.getElementById('userModalPhone').value = user.phone || '';
            document.getElementById('userModalRole').value = user.role || 'PILGRIM';
            document.getElementById('userModalStatus').value = user.status || 'ACTIVE';
            document.getElementById('userModalConnectedEntity').value = user.connected_entity || '';
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Pengguna Baru';
            document.getElementById('userModalId').value = '';
            document.getElementById('userModalName').value = '';
            document.getElementById('userModalEmail').value = '';
            document.getElementById('userModalPhone').value = '628';
            document.getElementById('userModalRole').value = 'PILGRIM';
            document.getElementById('userModalStatus').value = 'ACTIVE';
            document.getElementById('userModalConnectedEntity').value = '';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeUserModal() {
        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalUserEditor');
        } else {
            const modal = document.getElementById('modalUserEditor');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }
    }

    async function saveUser(e) {
        if (e && e.preventDefault) e.preventDefault();

        const id = document.getElementById('userModalId').value.trim();
        const name = document.getElementById('userModalName').value.trim();
        const email = document.getElementById('userModalEmail').value.trim().toLowerCase();
        const phone = document.getElementById('userModalPhone').value.trim().replace(/[^0-9]/g, '');
        const role = document.getElementById('userModalRole').value;
        const status = document.getElementById('userModalStatus').value;
        const connected_entity = document.getElementById('userModalConnectedEntity').value.trim() || '-';

        if (!name || !email) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama dan Email wajib diisi!', 'warning');
            return;
        }

        let allUsers = getStoredUsers();
        let targetId = id;
        const isEdit = Boolean(id);

        if (isEdit) {
            allUsers = allUsers.map(u => {
                if (u.id === id) {
                    return {
                        ...u,
                        name,
                        email,
                        phone,
                        role,
                        status,
                        connected_entity,
                        last_active: 'Baru saja',
                        updated_at: new Date().toISOString()
                    };
                }
                return u;
            });
        } else {
            targetId = `USR-${String(allUsers.length + 1).padStart(6, '0')}`;
            const newUser = {
                id: targetId,
                name,
                email,
                phone,
                role,
                status,
                connected_entity,
                last_active: 'Aktif Sekarang',
                created_at: new Date().toISOString()
            };
            allUsers.unshift(newUser);
        }

        saveStoredUsers(allUsers);
        closeUserModal();
        renderUsers();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`✅ Akun pengguna "${name}" berhasil disimpan!`, 'success');
        }

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveUser', {
                    id: targetId,
                    name,
                    email,
                    phone,
                    role,
                    status,
                    connected_entity,
                    last_active: 'Baru saja'
                }, 'DB_Users');
            }
        } catch (err) {
            console.warn('[SDW_USERS] Cloud mutation saveUser skipped:', err);
        }
    }

    async function toggleUserStatus(userId) {
        let allUsers = getStoredUsers();
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const newStatus = (user.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const labelStatus = newStatus === 'ACTIVE' ? 'diaktifkan' : 'dinonaktifkan / dikunci';

        allUsers = allUsers.map(u => {
            if (u.id === userId) {
                return { ...u, status: newStatus, updated_at: new Date().toISOString() };
            }
            return u;
        });

        saveStoredUsers(allUsers);
        renderUsers();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Akun "${user.name}" berhasil ${labelStatus}.`, 'info');
        }

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('toggleUserStatus', { id: userId, status: newStatus }, 'DB_Users');
            }
        } catch (err) {
            console.warn('[SDW_USERS] Cloud mutation toggleUserStatus skipped:', err);
        }
    }

    async function deleteUser(userId) {
        let allUsers = getStoredUsers();
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        if (user.role === 'SUPER_ADMIN') {
            if (typeof admin.showToast === 'function') admin.showToast('Akun Super Admin sistem tidak dapat dihapus!', 'warning');
            return;
        }

        if (!confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.name}"?`)) {
            return;
        }

        allUsers = allUsers.filter(u => u.id !== userId);
        saveStoredUsers(allUsers);
        renderUsers();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Akun "${user.name}" telah dihapus.`, 'success');
        }

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('deleteUser', { id: userId }, 'DB_Users');
            }
        } catch (err) {
            console.warn('[SDW_USERS] Cloud mutation deleteUser skipped:', err);
        }
    }

    // ==========================================
    // CLOUD SYNC & REHYDRATION
    // ==========================================
    async function syncUsersFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycbzeArcK6rTUnuvISbtIehgDsO1CacpL6fEOmqyCpuJjS747btjIgAhMnHNZUC3yz8n3/exec';

        if (typeof admin.showToast === 'function') admin.showToast('🔄 Memulai sinkronisasi Master Pengguna...', 'info');

        try {
            const res = await fetch(syncUrl + '?action=getUsers');
            if (res.ok) {
                const data = await res.json();
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    saveStoredUsers(data.data);
                    renderUsers();
                    if (typeof admin.showToast === 'function') admin.showToast('✅ Sinkronisasi Master Pengguna berhasil!', 'success');
                    return;
                }
            }
            throw new Error('Respons tidak valid atau kosong');
        } catch (err) {
            console.error('[SDW_USERS] Sync failed:', err);
            if (typeof admin.showToast === 'function') admin.showToast('Gagal terhubung ke cloud spreadsheet. Data lokal dipertahankan.', 'warning');
        }
    }

    // Exports
    admin.renderUsers = renderUsers;
    admin.renderUsersTable = renderUsersTable;
    admin.switchUserRoleTab = switchUserRoleTab;
    admin.applyUsersFilter = applyUsersFilter;
    admin.openUserModal = openUserModal;
    admin.closeUserModal = closeUserModal;
    admin.saveUser = saveUser;
    admin.toggleUserStatus = toggleUserStatus;
    admin.deleteUser = deleteUser;
    admin.syncUsersFromCloud = syncUsersFromCloud;

    return {
        getStoredUsers,
        saveStoredUsers,
        renderUsers,
        switchUserRoleTab,
        openUserModal,
        syncUsersFromCloud
    };
});

