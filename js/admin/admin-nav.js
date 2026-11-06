/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: NAVIGATION, RBAC, DASHBOARD & MODALS
 * File: js/admin/admin-nav.js
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

    // 1. Role Switcher & RBAC
    function setRole(newRole) {
        if (!admin.ADMIN_PERMISSIONS[newRole]) return;
        admin.currentRole = newRole;

        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
            if (typeof localStorage !== 'undefined') localStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
        }

        if (typeof document !== 'undefined') {
            const badge = document.getElementById('adminRoleBadge');
            if (badge) {
                badge.innerText = newRole.replace('_', ' ');
            }
        }

        applyRolePermissions(newRole);
        admin.showToast(`Peran dialihkan ke: ${newRole.replace('_', ' ')}`);

        const allowed = admin.ADMIN_PERMISSIONS[newRole] || ['tab-dashboard'];
        if (!allowed.includes(admin.currentTab)) {
            switchTab('tab-dashboard');
        }
    }

    function applyRolePermissions(role) {
        if (typeof document === 'undefined') return;
        const allowed = admin.ADMIN_PERMISSIONS[role] || ['tab-dashboard'];
        const navItems = document.querySelectorAll('[data-admin-tab]');

        navItems.forEach(el => {
            const target = el.getAttribute('data-admin-tab');
            if (allowed.includes(target)) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        const badge = document.getElementById('adminRoleBadge');
        if (badge) {
            badge.innerText = role.replace('_', ' ');
        }
    }

    // 2. Tab Switching
    function switchTab(tabId) {
        admin.currentTab = tabId;

        if (typeof document !== 'undefined') {
            const allContainers = document.querySelectorAll('.admin-tab-container');
            allContainers.forEach(c => c.classList.add('hidden'));

            const targetContainer = document.getElementById(tabId);
            if (targetContainer) {
                targetContainer.classList.remove('hidden');
            }

            const allNavBtns = document.querySelectorAll('[data-admin-tab]');
            allNavBtns.forEach(btn => {
                const btnTarget = btn.getAttribute('data-admin-tab');
                if (btnTarget === tabId) {
                    btn.className = "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-sm transition";
                    const icon = btn.querySelector('.nav-icon');
                    if (icon) icon.className = "nav-icon text-amber-300 w-5 text-center text-sm";
                } else {
                    btn.className = "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-sdw-pine hover:bg-slate-100 transition";
                    const icon = btn.querySelector('.nav-icon');
                    if (icon) icon.className = "nav-icon text-slate-400 group-hover:text-sdw-gold w-5 text-center text-sm";
                }
            });
        }

        // Trigger renderer spesifik per tab
        if (tabId === 'tab-dashboard' && typeof renderDashboard === 'function') renderDashboard();
        if (tabId === 'tab-crm' && typeof admin.renderCRM === 'function') admin.renderCRM();
        if (tabId === 'tab-docs' && typeof admin.renderDocuments === 'function') admin.renderDocuments();
        if (tabId === 'tab-registrations' && typeof admin.renderRegistrations === 'function') admin.renderRegistrations();
        if (tabId === 'tab-finance' && typeof admin.renderFinance === 'function') admin.renderFinance();
        if (tabId === 'tab-operations' && typeof admin.renderOperations === 'function') admin.renderOperations();
        if (tabId === 'tab-audit' && typeof admin.renderAuditLogs === 'function') admin.renderAuditLogs();

        // Di layar mobile, tutup sidebar otomatis
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            toggleMobileSidebar(false);
        }
    }

    function toggleMobileSidebar(open) {
        if (typeof document === 'undefined') return;
        const sidebar = document.getElementById('adminSidebar');
        const backdrop = document.getElementById('adminSidebarBackdrop');
        if (!sidebar) return;

        if (open) {
            sidebar.classList.add('mobile-open');
            if (backdrop) backdrop.classList.add('active');
            if (document.body) document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('mobile-open');
            if (backdrop) backdrop.classList.remove('active');
            if (document.body) document.body.style.overflow = '';
        }
    }

    // 3. Modals
    function openModal(modalId) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (modalId === 'modalCreatePayment' && typeof admin.populatePaymentRegOptions === 'function') {
            admin.populatePaymentRegOptions();
        }

        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function closeModal(modalId) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }

    // 4. Executive Dashboard
    function renderDashboard() {
        if (typeof document === 'undefined') return;
        const totalPilgrimsEl = document.getElementById('kpi-total-pilgrims');
        const activeLeadsEl = document.getElementById('kpi-active-leads');
        const pendingDocsEl = document.getElementById('kpi-pending-docs');
        const totalRevenueEl = document.getElementById('kpi-total-revenue');

        const pendingDocsCount = admin.docsQueue.filter(d => d.status === 'UNDER_REVIEW').length;

        if (totalPilgrimsEl) totalPilgrimsEl.innerText = admin.registrationsData.length + 42;
        if (activeLeadsEl) activeLeadsEl.innerText = admin.leadsData.length;
        if (pendingDocsEl) pendingDocsEl.innerText = `${pendingDocsCount} Dokumen`;
        if (totalRevenueEl) totalRevenueEl.innerText = "Rp 1.48 Miliar";

        const recentTbody = document.getElementById('dashboard-recent-regs-tbody');
        if (recentTbody) {
            recentTbody.innerHTML = admin.registrationsData.slice(0, 5).map(r => `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(r.id)}</td>
                    <td class="py-3 px-4 font-bold text-slate-800">${admin.escapeHtml(r.customer)}</td>
                    <td class="py-3 px-4 text-slate-600">${admin.escapeHtml(r.package)}</td>
                    <td class="py-3 px-4 text-slate-500">${admin.escapeHtml(r.departure)}</td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${admin.getStatusBadgeClass(r.status)}">${admin.escapeHtml(r.status)}</span>
                    </td>
                    <td class="py-3 px-4 font-bold text-sdw-pine">${admin.escapeHtml(r.payment)}</td>
                    <td class="py-3 px-4 text-right">
                        <button type="button" onclick="SDW_ADMIN.openDrawer('REG', '${r.id}')" class="px-2.5 py-1 rounded-lg border border-slate-200 text-sdw-pine hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer">
                            Periksa
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 5. Drawer Controller
    function openDrawer(type, id) {
        if (typeof document === 'undefined') return;
        const drawer = document.getElementById('adminSideDrawer');
        const panel = document.getElementById('adminDrawerPanel');
        const content = document.getElementById('adminDrawerContent');

        if (!drawer || !content) return;

        if (type === 'LEAD') {
            const l = admin.leadsData.find(item => item.id === id) || { id, name: 'Prospek', phone: '-', package: '-', budget: '-' };
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <span class="text-[10px] font-black text-purple-900 uppercase">Detil Prospek CRM</span>
                        <h3 class="font-extrabold text-base text-sdw-pine mt-0.5">${admin.escapeHtml(l.name)}</h3>
                        <p class="text-xs text-slate-500 font-mono">${admin.escapeHtml(l.phone)}</p>
                    </div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">ID Lead:</span>
                            <span class="font-mono font-bold text-sdw-pine">${admin.escapeHtml(l.id)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Program Paket:</span>
                            <span class="font-bold text-slate-800">${admin.escapeHtml(l.package)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Urgensi Keberangkatan:</span>
                            <span class="font-bold text-rose-600">${admin.escapeHtml(l.urgency)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Estimasi Anggaran:</span>
                            <span class="font-bold text-emerald-700">${admin.escapeHtml(l.budget)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">PIC Sales:</span>
                            <span class="font-bold text-slate-700">${admin.escapeHtml(l.owner)}</span>
                        </div>
                    </div>
                    <div class="pt-4 space-y-2">
                        <button type="button" onclick="SDW_ADMIN.openConvertLeadModal('${admin.escapeHtml(l.id)}')" class="w-full py-2.5 rounded-xl bg-sdw-pine hover:bg-purple-900 text-white font-bold text-xs transition shadow-sm cursor-pointer">
                            + Konversi ke Pendaftaran Jamaah
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'REG') {
            const r = admin.registrationsData.find(item => item.id === id) || { id, customer: 'Jamaah', package: '-' };
            const isPendingDp = r.status === 'PENDING_DP' || r.status === 'PENDING';
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="p-4 ${isPendingDp ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'} rounded-2xl border">
                        <span class="text-[10px] font-black ${isPendingDp ? 'text-amber-900' : 'text-emerald-900'} uppercase">
                            ${isPendingDp ? 'Booking Baru — Menunggu Verifikasi DP' : 'Berkas Registrasi Terdaftar'}
                        </span>
                        <h3 class="font-extrabold text-base text-sdw-pine mt-0.5">${admin.escapeHtml(r.customer)}</h3>
                        <p class="text-xs text-slate-500 font-mono">${admin.escapeHtml(r.id)}</p>
                    </div>

                    ${isPendingDp ? `
                        <div class="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 text-xs text-amber-950 space-y-2">
                            <div class="font-black flex items-center justify-between text-amber-900">
                                <span class="flex items-center gap-1.5"><i class="fa-solid fa-clock"></i> Tagihan DP Booking:</span>
                                <span class="text-sm font-black text-emerald-800">Rp 5.000.000</span>
                            </div>
                            ${r.proofImage ? `
                                <div class="p-2 bg-white rounded-xl border border-amber-200 text-center space-y-1">
                                    <span class="text-[10px] text-emerald-700 font-bold block">✓ Bukti Transfer Diunggah Jamaah:</span>
                                    <img src="${r.proofImage}" alt="Bukti Transfer" class="max-h-36 mx-auto rounded-lg border border-slate-200 object-contain cursor-pointer hover:opacity-90 transition" onclick="window.open(this.src, '_blank')" title="Klik untuk membuka ukuran penuh">
                                </div>
                            ` : `
                                <p class="text-[11px] text-amber-800 leading-relaxed">
                                    Jamaah belum melampirkan struk di PWA. Anda dapat memeriksa mutasi rekening BSI lalu melampirkan foto struk via modal validasi.
                                </p>
                            `}
                            <button type="button" onclick="SDW_ADMIN.confirmRegistrationDP('${admin.escapeHtml(r.id)}')" class="w-full mt-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                                <i class="fa-solid fa-file-circle-check"></i> Validasi DP &amp; Periksa Struk
                            </button>
                        </div>
                    ` : `
                        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                            <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
                            <div>
                                <div class="font-bold text-emerald-800">SDW E-PASS Aktif &amp; Terverifikasi</div>
                                <div class="text-[10.5px] text-emerald-700">DP tervalidasi, jamaah siap melengkapi paspor.</div>
                            </div>
                        </div>
                    `}

                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Program Paket:</span>
                            <span class="font-bold text-slate-800">${admin.escapeHtml(r.package)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Jadwal Keberangkatan:</span>
                            <span class="font-bold text-slate-800">${admin.escapeHtml(r.departure)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Status Registrasi:</span>
                            <span class="font-bold ${r.status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-600'}">${admin.escapeHtml(r.status)}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Kelengkapan Dokumen:</span>
                            <span class="font-bold text-slate-700">${admin.escapeHtml(r.docs || '0/4')} Lengkap</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Status Pembayaran:</span>
                            <span class="font-bold text-sdw-pine">${admin.escapeHtml(r.payment)}</span>
                        </div>
                    </div>
                    <div class="pt-2 flex items-center gap-2">
                        <button type="button" onclick="SDW_ADMIN.openTripManifestModal('TRP-2701')" class="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer">
                            Manifest Kloter
                        </button>
                        <button type="button" onclick="SDW_ADMIN.closeDrawer(); SDW_ADMIN.switchTab('tab-finance');" class="flex-1 py-2 rounded-xl bg-sdw-pine text-white font-bold text-xs hover:bg-purple-900 transition cursor-pointer">
                            Buka Keuangan
                        </button>
                    </div>
                </div>
            `;
        }

        drawer.classList.add('active');
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        if (panel) panel.classList.remove('translate-x-full');
    }

    function closeDrawer() {
        if (typeof document === 'undefined') return;
        const drawer = document.getElementById('adminSideDrawer');
        const panel = document.getElementById('adminDrawerPanel');
        if (drawer && panel) {
            drawer.classList.remove('active');
            drawer.classList.add('opacity-0', 'pointer-events-none');
            panel.classList.add('translate-x-full');
        }
    }

    // 6. Global Search
    function openGlobalSearch() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('adminSearchModal');
        const input = document.getElementById('globalSearchInput');
        if (modal) {
            modal.classList.add('active');
            modal.classList.remove('opacity-0', 'pointer-events-none');
            if (modal.children && modal.children[0]) modal.children[0].classList.remove('scale-95');
            if (input) {
                input.value = '';
                input.focus();
                handleSearchInput('');
            }
        }
    }

    function closeGlobalSearch() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('adminSearchModal');
        if (modal) {
            modal.classList.remove('active');
            modal.classList.add('opacity-0', 'pointer-events-none');
            if (modal.children && modal.children[0]) modal.children[0].classList.add('scale-95');
        }
    }

    function handleSearchInput(query) {
        if (typeof document === 'undefined') return;
        const resultsEl = document.getElementById('globalSearchResults');
        if (!resultsEl) return;

        query = (query || '').toLowerCase().trim();
        let matches = [];

        admin.leadsData.forEach(l => {
            if (!query || l.name.toLowerCase().includes(query) || l.id.toLowerCase().includes(query) || (l.phone && l.phone.includes(query))) {
                matches.push({ type: 'LEAD', title: l.name, sub: `${l.id} • ${l.package}`, badge: 'PROSPEK CRM', action: () => { closeGlobalSearch(); switchTab('tab-crm'); openDrawer('LEAD', l.id); } });
            }
        });

        admin.registrationsData.forEach(r => {
            if (!query || r.customer.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)) {
                matches.push({ type: 'REG', title: r.customer, sub: `${r.id} • ${r.package}`, badge: 'JAMAAH TERDAFTAR', action: () => { closeGlobalSearch(); switchTab('tab-registrations'); openDrawer('REG', r.id); } });
            }
        });

        if (matches.length === 0) {
            resultsEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Tidak ada entitas data yang cocok dengan "${admin.escapeHtml(query)}"</div>`;
            return;
        }

        resultsEl.innerHTML = matches.slice(0, 6).map((m, idx) => `
            <div onclick="window.SDW_ADMIN_SEARCH_SELECT(${idx})" class="p-3 rounded-xl hover:bg-purple-50 flex items-center justify-between cursor-pointer transition border border-transparent hover:border-purple-200">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 text-sdw-pine flex items-center justify-center text-xs font-bold">
                        <i class="fa-solid ${m.type === 'LEAD' ? 'fa-users' : 'fa-id-card'}"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-slate-800">${admin.escapeHtml(m.title)}</div>
                        <div class="text-[10.5px] text-slate-400">${admin.escapeHtml(m.sub)}</div>
                    </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[9.5px] font-black bg-slate-100 text-slate-600">${admin.escapeHtml(m.badge)}</span>
            </div>
        `).join('');

        if (typeof window !== 'undefined') {
            window.SDW_ADMIN_SEARCH_MATCHES = matches;
        }
    }

    if (typeof window !== 'undefined') {
        window.SDW_ADMIN_SEARCH_SELECT = function(idx) {
            if (window.SDW_ADMIN_SEARCH_MATCHES && window.SDW_ADMIN_SEARCH_MATCHES[idx]) {
                window.SDW_ADMIN_SEARCH_MATCHES[idx].action();
            }
        };
    }

    // 7. Clocks
    function updateClocks() {
        if (typeof document === 'undefined') return;
        const now = new Date();
        const makkahTimeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const jakartaTimeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

        const mEl = document.getElementById('adminMakkahClock');
        const jEl = document.getElementById('adminJakartaClock');
        if (mEl) mEl.innerText = makkahTimeStr.replace(/\./g, ':');
        if (jEl) jEl.innerText = jakartaTimeStr.replace(/\./g, ':');
    }

    // Attach to admin
    admin.setRole = setRole;
    admin.applyRolePermissions = applyRolePermissions;
    admin.switchTab = switchTab;
    admin.toggleMobileSidebar = toggleMobileSidebar;
    admin.openModal = openModal;
    admin.closeModal = closeModal;
    admin.openDrawer = openDrawer;
    admin.closeDrawer = closeDrawer;
    admin.openGlobalSearch = openGlobalSearch;
    admin.closeGlobalSearch = closeGlobalSearch;
    admin.handleSearchInput = handleSearchInput;
    admin.updateClocks = updateClocks;
    admin.renderDashboard = renderDashboard;

    return admin;
});

