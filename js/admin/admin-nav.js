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

    // 0. User Profiles for Asnawiyyah Session Capsule
    const USER_ROLE_PROFILES = {
        'SUPER_ADMIN': { name: 'Super Admin', shortRole: '(Super Admin)', desc: 'Super Administrator', initial: 'SU', email: 'admin@sdwumroh.com', bg: 'bg-teal-700 text-white' },
        'ADMIN': { name: 'H. Ahmad Fauzi', shortRole: '(Admin)', desc: 'Administrator Backoffice', initial: 'AF', email: 'ops@sdwumroh.com', bg: 'bg-emerald-700 text-white' },
        'DIRECTOR': { name: 'H. M. Syarif', shortRole: '(Direktur)', desc: 'Direktur Utama', initial: 'MS', email: 'syarif@sdwumroh.com', bg: 'bg-orange-700 text-white' },
        'FINANCE': { name: 'Hj. Fatimah Zahra', shortRole: '(Finance)', desc: 'Keuangan & Kasir', initial: 'FZ', email: 'finance@sdwumroh.com', bg: 'bg-purple-700 text-white' },
        'OPERATIONS': { name: 'Agus Pratama', shortRole: '(Operasional)', desc: 'Staf Operasional', initial: 'AP', email: 'operasional@sdwumroh.com', bg: 'bg-sky-700 text-white' },
        'SALES': { name: 'Budi Santoso', shortRole: '(Sales)', desc: 'Sales Consultant', initial: 'BS', email: 'sales@sdwumroh.com', bg: 'bg-teal-700 text-white' },
        'MUTHAWWIF': { name: 'Ust. Dr. Abdullah', shortRole: '(Muthawwif)', desc: 'Muthawwif & TL', initial: 'AB', email: 'muthawwif@sdwumroh.com', bg: 'bg-indigo-700 text-white' },
        'PILGRIM': { name: 'Siti Aisyah', shortRole: '(Jamaah)', desc: 'Akun Jamaah Umroh', initial: 'SA', email: 'aisyah@gmail.com', bg: 'bg-slate-700 text-white' }
    };

    // Breadcrumb Mapping Asnawiyyah Style
    const TAB_BREADCRUMBS = {
        'tab-dashboard': 'Dashboard Utama',
        'tab-crm': 'Manajemen Prospek CRM',
        'tab-packages': 'Katalog Paket Umroh',
        'tab-departures': 'Jadwal Kloter Keberangkatan',
        'tab-hotels': 'Master Data Hotel Haramain',
        'tab-airlines': 'Maskapai & Bandara Transit',
        'tab-gallery': 'Galeri Dokumentasi & Testimoni',
        'tab-articles': 'Artikel, Berita & Titik Ziarah',
        'tab-faq': 'Master FAQ & Layanan Bantuan CS',
        'tab-users': 'Manajemen Pengguna Terpadu',
        'tab-roles': 'Manajemen Peran & Hak Akses',
        'tab-registrations': 'Manifest Pendaftaran Jamaah',
        'tab-finance': 'Keuangan, Kasir & Escrow',
        'tab-operations': 'Operasional & Logistik Kloter',
        'tab-certificates': 'E-Sertifikat Umroh',
        'tab-badal-certificates': 'E-Sertifikat Badal Umroh',
        'tab-audit': 'Audit Trail & Log Keamanan'
    };

    function updateBreadcrumb(tabId) {
        if (typeof document === 'undefined') return;
        const currentEl = document.getElementById('headerBreadcrumbCurrent');
        if (currentEl) {
            currentEl.innerText = TAB_BREADCRUMBS[tabId] || 'Portal Administrasi';
        }
    }

    function updateHeaderProfileUI(role) {
        if (typeof document === 'undefined') return;
        const r = (role || admin.currentRole || 'SUPER_ADMIN').toUpperCase();
        const profile = USER_ROLE_PROFILES[r] || USER_ROLE_PROFILES['ADMIN'];

        // Header Elements
        const headerAvatar = document.getElementById('headerUserAvatar');
        const headerName = document.getElementById('headerUserName');
        const headerRoleShort = document.getElementById('headerUserRoleShort');
        const headerRoleDesc = document.getElementById('headerUserRoleDesc');

        if (headerAvatar) {
            headerAvatar.innerText = profile.initial;
            headerAvatar.className = `w-9 h-9 rounded-xl ${profile.bg} font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`;
        }
        if (headerName) headerName.innerText = profile.name;
        if (headerRoleShort) headerRoleShort.innerText = profile.shortRole;
        if (headerRoleDesc) headerRoleDesc.innerText = profile.desc;

        // Dropdown Elements
        const dropAvatar = document.getElementById('dropdownUserAvatar');
        const dropName = document.getElementById('dropdownUserName');
        const dropEmail = document.getElementById('dropdownUserEmail');
        const dropRoleBadge = document.getElementById('dropdownRoleBadge');

        if (dropAvatar) {
            dropAvatar.innerText = profile.initial;
            dropAvatar.className = `w-10 h-10 rounded-xl ${profile.bg} font-black text-sm flex items-center justify-center shadow-2xs`;
        }
        if (dropName) dropName.innerText = profile.name;
        if (dropEmail) dropEmail.innerText = profile.email;
        if (dropRoleBadge) dropRoleBadge.innerText = r.replace('_', ' ');

        // Update all select with ID adminRoleSelector
        const roleSelectors = document.querySelectorAll('#adminRoleSelector');
        roleSelectors.forEach(sel => {
            if (sel.value !== r) sel.value = r;
        });
    }

    function toggleUserProfileDropdown(forceState) {
        if (typeof document === 'undefined') return;
        const menu = document.getElementById('userProfileDropdownMenu');
        if (!menu) return;

        if (typeof forceState === 'boolean') {
            if (forceState) {
                menu.classList.remove('hidden');
            } else {
                menu.classList.add('hidden');
            }
        } else {
            menu.classList.toggle('hidden');
        }
    }

    function logout() {
        if (typeof window !== 'undefined' && typeof confirm === 'function') {
            if (!confirm('Apakah Anda yakin ingin keluar dari Portal Administrasi SDW UMROH?')) {
                return;
            }
        }

        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('sdw_admin_session');
                sessionStorage.removeItem('sdw_admin_role');
                sessionStorage.removeItem('sdw_auth_token');
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('sdw_admin_session');
            }
        } catch (_) {}

        if (typeof admin.showToast === 'function') {
            admin.showToast('Anda telah berhasil keluar dari sistem.', 'info');
        }

        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.location.href = 'index.html';
            }
        }, 600);
    }

    // Close dropdown on outside click
    if (typeof document !== 'undefined') {
        document.addEventListener('click', function(e) {
            const container = document.getElementById('userProfileDropdownContainer');
            if (container && !container.contains(e.target)) {
                toggleUserProfileDropdown(false);
            }
        });
    }

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

        updateHeaderProfileUI(newRole);
        applyRolePermissions(newRole);
        admin.showToast(`Peran dialihkan ke: ${newRole.replace('_', ' ')}`);

        const allowed = admin.ADMIN_PERMISSIONS[newRole] || ['tab-dashboard'];
        if (!allowed.includes(admin.currentTab)) {
            switchTab('tab-dashboard');
        }
    }

    function applyRolePermissions(role) {
        if (typeof document === 'undefined') return;
        const navItems = document.querySelectorAll('[data-admin-tab]');

        navItems.forEach(el => {
            const target = el.getAttribute('data-admin-tab');
            let hasAccess = false;
            if (typeof admin.canAccessTab === 'function') {
                hasAccess = admin.canAccessTab(role, target);
            } else {
                const allowed = admin.ADMIN_PERMISSIONS[role] || ['tab-dashboard'];
                hasAccess = allowed.includes(target);
            }

            if (hasAccess) {
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
            updateBreadcrumb(tabId);
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
        if (tabId === 'tab-packages' && typeof admin.renderPackages === 'function') admin.renderPackages();
        if (tabId === 'tab-departures' && typeof admin.renderDepartures === 'function') admin.renderDepartures();
        if (tabId === 'tab-hotels' && typeof admin.renderHotels === 'function') admin.renderHotels();
        if (tabId === 'tab-airlines' && typeof admin.renderAirlines === 'function') admin.renderAirlines();
        if (tabId === 'tab-gallery' && typeof admin.renderGallery === 'function') admin.renderGallery();
        if (tabId === 'tab-articles' && typeof admin.renderArticles === 'function') admin.renderArticles();
        if (tabId === 'tab-faq' && typeof admin.renderFaq === 'function') admin.renderFaq();
        if (tabId === 'tab-docs' && typeof admin.renderDocuments === 'function') admin.renderDocuments();
        if (tabId === 'tab-registrations' && typeof admin.renderRegistrations === 'function') admin.renderRegistrations();
        if (tabId === 'tab-finance' && typeof admin.renderFinance === 'function') admin.renderFinance();
        if (tabId === 'tab-operations' && typeof admin.renderOperations === 'function') admin.renderOperations();
        if (tabId === 'tab-certificates' && typeof admin.renderCertificates === 'function') admin.renderCertificates();
        if (tabId === 'tab-badal-certificates' && typeof admin.renderBadalCertificates === 'function') admin.renderBadalCertificates();
        if (tabId === 'tab-users' && typeof admin.renderUsers === 'function') admin.renderUsers();
        if (tabId === 'tab-roles' && typeof admin.renderRoles === 'function') admin.renderRoles();
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

    // 4. Executive Dashboard (Asnawiyyah Vibrant Canvas & KPI)
    let dashboardPeriod = '7D';

    const ROLE_ACCESS_BADGES = {
        'SUPER_ADMIN': { text: '● Full Access', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'ADMIN': { text: '● Administrator', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'DIRECTOR': { text: '● Dewan Direksi', class: 'bg-amber-50 text-amber-800 border-amber-200' },
        'FINANCE': { text: '● Otoritas Keuangan', class: 'bg-purple-50 text-purple-700 border-purple-200' },
        'OPERATIONS': { text: '● Operasional Kloter', class: 'bg-sky-50 text-sky-700 border-sky-200' },
        'SALES': { text: '● Konsultan Sales', class: 'bg-teal-50 text-teal-700 border-teal-200' },
        'MUTHAWWIF': { text: '● Muthawwif & TL', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        'PILGRIM': { text: '● Portal Jamaah', class: 'bg-slate-100 text-slate-700 border-slate-200' }
    };

    function updateDashboardClock() {
        if (typeof document === 'undefined') return;
        const clockEl = document.getElementById('dashLiveDateTime');
        if (!clockEl) return;

        const now = new Date();
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        const dayName = days[now.getDay()];
        const dateNum = now.getDate();
        const monthName = months[now.getMonth()];
        const yearNum = now.getFullYear();
        const timeStr = now.toLocaleTimeString('id-ID', { hour12: false }).replace(/\./g, '.');

        clockEl.innerText = `WIB (UTC+7) • ${dayName}, ${dateNum} ${monthName} ${yearNum} • ${timeStr}`;
    }

    function setDashboardPeriod(period) {
        dashboardPeriod = period;
        admin.dashboardPeriod = period;

        if (typeof document !== 'undefined') {
            const buttons = document.querySelectorAll('[data-dash-period]');
            buttons.forEach(btn => {
                const p = btn.getAttribute('data-dash-period');
                if (p === period) {
                    btn.className = "px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-xs transition cursor-pointer";
                } else {
                    btn.className = "px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer border border-slate-200/70";
                }
            });
        }

        renderDashboard();
    }

    // Dataset Analitik Asnawiyyah Style untuk Visualisasi Dashboard
    const DASHBOARD_CHART_DATA = {
        '7D': {
            badge: '7 Hari',
            avgNote: 'Rata-rata 18 Pendaftaran/Hari',
            bars: [
                { label: '05-18', reg: 180, settled: 45, isActive: false },
                { label: '05-19', reg: 210, settled: 55, isActive: false },
                { label: '05-20', reg: 195, settled: 50, isActive: false },
                { label: '05-21', reg: 260, settled: 70, isActive: true },
                { label: '05-22', reg: 225, settled: 60, isActive: false },
                { label: '05-23', reg: 190, settled: 48, isActive: false },
                { label: '05-24', reg: 175, settled: 42, isActive: false }
            ],
            donut: { ready: 65.4, review: 23.1, pending: 11.5, overall: '98.5%' }
        },
        'TODAY': {
            badge: 'Hari Ini',
            avgNote: 'Rata-rata 6 Pendaftaran/Sesi',
            bars: [
                { label: '08:00', reg: 85, settled: 25, isActive: false },
                { label: '10:00', reg: 140, settled: 45, isActive: false },
                { label: '12:00', reg: 110, settled: 35, isActive: false },
                { label: '14:00', reg: 240, settled: 65, isActive: true },
                { label: '16:00', reg: 170, settled: 48, isActive: false },
                { label: '18:00', reg: 130, settled: 38, isActive: false },
                { label: '20:00', reg: 90, settled: 28, isActive: false }
            ],
            donut: { ready: 70.0, review: 20.0, pending: 10.0, overall: '99.0%' }
        },
        '30D': {
            badge: '30 Hari',
            avgNote: 'Rata-rata 72 Pendaftaran/Minggu',
            bars: [
                { label: 'Mgg 1', reg: 190, settled: 50, isActive: false },
                { label: 'Mgg 2', reg: 240, settled: 65, isActive: false },
                { label: 'Mgg 3', reg: 220, settled: 58, isActive: false },
                { label: 'Mgg 4', reg: 280, settled: 75, isActive: true },
                { label: 'Mgg 5', reg: 260, settled: 70, isActive: false },
                { label: 'Mgg 6', reg: 230, settled: 62, isActive: false },
                { label: 'Mgg 7', reg: 210, settled: 55, isActive: false }
            ],
            donut: { ready: 64.2, review: 24.3, pending: 11.5, overall: '98.2%' }
        },
        '90D': {
            badge: '90 Hari',
            avgNote: 'Rata-rata 260 Pendaftaran/Bulan',
            bars: [
                { label: 'Bln 1', reg: 210, settled: 55, isActive: false },
                { label: 'Bln 2', reg: 270, settled: 72, isActive: false },
                { label: 'Bln 3', reg: 250, settled: 68, isActive: true },
                { label: 'Bln 4', reg: 310, settled: 85, isActive: false },
                { label: 'Bln 5', reg: 280, settled: 75, isActive: false },
                { label: 'Bln 6', reg: 240, settled: 65, isActive: false },
                { label: 'Bln 7', reg: 220, settled: 60, isActive: false }
            ],
            donut: { ready: 62.0, review: 25.5, pending: 12.5, overall: '97.5%' }
        },
        'ALL': {
            badge: 'Semua Data',
            avgNote: 'Total Musim 1448H: 142 Jamaah Terdaftar',
            bars: [
                { label: '1445H', reg: 180, settled: 50, isActive: false },
                { label: '1446H', reg: 230, settled: 65, isActive: false },
                { label: '1447H', reg: 270, settled: 75, isActive: false },
                { label: '1448H', reg: 340, settled: 90, isActive: true },
                { label: 'Q1', reg: 280, settled: 76, isActive: false },
                { label: 'Q2', reg: 260, settled: 70, isActive: false },
                { label: 'Q3', reg: 290, settled: 80, isActive: false }
            ],
            donut: { ready: 65.4, review: 23.1, pending: 11.5, overall: '98.5%' }
        }
    };

    function renderDashboardActivityChart(period) {
        if (typeof document === 'undefined') return;
        const currentPeriod = period || dashboardPeriod || '7D';
        const data = DASHBOARD_CHART_DATA[currentPeriod] || DASHBOARD_CHART_DATA['7D'];

        const badgeEl = document.getElementById('dashChartPeriodBadge');
        if (badgeEl) badgeEl.innerText = data.badge;

        const avgNoteEl = document.getElementById('dashChartAvgNote');
        if (avgNoteEl) avgNoteEl.innerText = data.avgNote;

        const container = document.getElementById('dashActivityBarsContainer');
        if (!container) return;

        const maxScale = 400;
        const chartHeightPx = 145;

        container.innerHTML = data.bars.map((item) => {
            const rawHeight = Math.round((item.reg / maxScale) * chartHeightPx);
            const heightPx = Math.max(28, Math.min(chartHeightPx, rawHeight));

            return `
                <div class="flex flex-col items-center group relative cursor-pointer" title="${item.label}: ${item.reg} Registrasi, ${item.settled} Pelunasan">
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-14 bg-slate-900/95 text-white text-[10px] py-1.5 px-2.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl z-30 flex flex-col gap-0.5">
                        <div class="font-bold text-slate-300 border-b border-slate-700 pb-0.5">${item.label}</div>
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-400"></span> <strong>${item.reg}</strong> Registrasi</div>
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> <strong>${item.settled}</strong> Pelunasan</div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-2xs -mb-2 z-10 group-hover:scale-125 transition-transform"></div>
                        <div class="w-6 sm:w-7 bg-sky-400 group-hover:bg-sky-500 rounded-t-xl transition-all duration-300 shadow-2xs" style="height: ${heightPx}px;"></div>
                    </div>
                    <div class="mt-2 text-center">
                        ${item.isActive 
                            ? `<span class="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 font-extrabold text-[10.5px] border border-sky-200">${item.label}</span>`
                            : `<span class="text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-slate-700">${item.label}</span>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderDashboardDonutChart(period) {
        if (typeof document === 'undefined') return;
        const currentPeriod = period || dashboardPeriod || '7D';
        const data = DASHBOARD_CHART_DATA[currentPeriod] || DASHBOARD_CHART_DATA['7D'];
        const donut = data.donut;

        const centerPctEl = document.getElementById('dashDonutCenterPct');
        const pctReadyEl = document.getElementById('dashPctReady');
        const pctReviewEl = document.getElementById('dashPctReview');
        const pctPendingEl = document.getElementById('dashPctPending');

        if (centerPctEl) centerPctEl.innerText = donut.overall;
        if (pctReadyEl) pctReadyEl.innerText = `${donut.ready}%`;
        if (pctReviewEl) pctReviewEl.innerText = `${donut.review}%`;
        if (pctPendingEl) pctPendingEl.innerText = `${donut.pending}%`;

        const circumference = 389.56;
        const orangeArc = document.getElementById('dashDonutArcOrange');
        const cyanArc = document.getElementById('dashDonutArcCyan');

        if (orangeArc) {
            const orangeFraction = donut.review / 100;
            const orangeDash = circumference * orangeFraction;
            orangeArc.setAttribute('stroke-dasharray', `${orangeDash} ${circumference}`);
            orangeArc.setAttribute('stroke-dashoffset', '0');
        }

        if (cyanArc) {
            const cyanFraction = donut.ready / 100;
            const cyanDash = circumference * cyanFraction;
            const orangeFraction = donut.review / 100;
            const offset = -(circumference * orangeFraction);
            cyanArc.setAttribute('stroke-dasharray', `${cyanDash} ${circumference}`);
            cyanArc.setAttribute('stroke-dashoffset', `${offset}`);
        }
    }

    function refreshDashboardData() {
        const refreshBtn = document.getElementById('dashBtnRefresh');
        if (refreshBtn) {
            refreshBtn.classList.add('animate-spin');
            setTimeout(() => refreshBtn.classList.remove('animate-spin'), 600);
        }
        renderDashboard();
        if (typeof admin.showToast === 'function') {
            admin.showToast('Data analitik dashboard berhasil diperbarui.', 'info');
        }
    }

    function renderDashboard() {
        if (typeof document === 'undefined') return;

        // 1. Update Greeting & Status Otoritas
        const greetingNameEl = document.getElementById('dashGreetingName');
        const roleBadgeEl = document.getElementById('dashRoleBadge');

        const session = (typeof admin.getAdminSession === 'function' ? admin.getAdminSession() : null) || admin.currentUser;
        const currentRole = (session && session.role ? session.role : admin.currentRole || 'SUPER_ADMIN').toUpperCase();
        const badgeConfig = ROLE_ACCESS_BADGES[currentRole] || ROLE_ACCESS_BADGES['SUPER_ADMIN'];

        if (greetingNameEl) {
            const rawName = session && session.name ? session.name : 'Super Administrator';
            const shortName = rawName.split(' ')[0] || rawName;
            greetingNameEl.innerText = `Selamat Bertugas, ${shortName}`;
        }
        if (roleBadgeEl) {
            roleBadgeEl.innerText = badgeConfig.text;
            roleBadgeEl.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-black border ${badgeConfig.class}`;
        }

        // 2. Update Live Clock
        updateDashboardClock();

        // 3. Update 4 Kartu KPI Gradien
        const totalPilgrimsEl = document.getElementById('kpi-total-pilgrims');
        const seatOccupancyEl = document.getElementById('kpi-seat-occupancy');
        const activeMuthawwifEl = document.getElementById('kpi-active-muthawwif');
        const docsAccuracyEl = document.getElementById('kpi-docs-accuracy');

        // Backward compatibility elements jika ada modul lain yang mencari ID lama
        const activeLeadsEl = document.getElementById('kpi-active-leads');
        const pendingDocsEl = document.getElementById('kpi-pending-docs');
        const totalRevenueEl = document.getElementById('kpi-total-revenue');

        const regsCount = admin.registrationsData.length + 42;
        const pendingDocsCount = admin.docsQueue.filter(d => d.status === 'UNDER_REVIEW').length;

        if (totalPilgrimsEl) totalPilgrimsEl.innerText = regsCount;
        if (seatOccupancyEl) seatOccupancyEl.innerText = '88%';
        if (activeMuthawwifEl) activeMuthawwifEl.innerText = '18';
        if (docsAccuracyEl) docsAccuracyEl.innerText = '98.5%';

        if (activeLeadsEl) activeLeadsEl.innerText = admin.leadsData.length;
        if (pendingDocsEl) pendingDocsEl.innerText = `${pendingDocsCount} Dokumen`;
        if (totalRevenueEl) totalRevenueEl.innerText = "Rp 1.48 Miliar";

        // 4. Update Visualisasi Charts Asnawiyyah Style
        renderDashboardActivityChart(dashboardPeriod);
        renderDashboardDonutChart(dashboardPeriod);

        // 5. Update Recent Registrations Table
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

        updateDashboardClock();
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
    admin.USER_ROLE_PROFILES = USER_ROLE_PROFILES;
    admin.TAB_BREADCRUMBS = TAB_BREADCRUMBS;
    admin.updateBreadcrumb = updateBreadcrumb;
    admin.updateHeaderProfileUI = updateHeaderProfileUI;
    admin.toggleUserProfileDropdown = toggleUserProfileDropdown;
    admin.logout = logout;
    admin.updateDashboardClock = updateDashboardClock;
    admin.setDashboardPeriod = setDashboardPeriod;
    admin.refreshDashboardData = refreshDashboardData;
    admin.dashboardPeriod = dashboardPeriod;
    admin.renderDashboardActivityChart = renderDashboardActivityChart;
    admin.renderDashboardDonutChart = renderDashboardDonutChart;
    admin.DASHBOARD_CHART_DATA = DASHBOARD_CHART_DATA;

    return admin;
});

