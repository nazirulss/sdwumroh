/**
 * ====================================================================
 * SDW UMROH — ADMIN PORTAL & BACKOFFICE CONTROLLER
 * File: js/admin-core.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: docs/03_USER_ROLES_AND_PERMISSIONS.md & docs/07_INFORMATION_ARCHITECTURE.md
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_ADMIN = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // State Internal Admin
    let currentTab = 'tab-dashboard';
    let currentRole = 'ADMIN';
    let activeFilter = 'ALL';
    let auditLogs = [];

    // RBAC Permissions Mapping untuk Menu Admin
    const ADMIN_PERMISSIONS = {
        'ADMIN': ['tab-dashboard', 'tab-crm', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-audit'],
        'MANAGER': ['tab-dashboard', 'tab-crm', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-audit'],
        'OWNER': ['tab-dashboard', 'tab-crm', 'tab-docs', 'tab-registrations', 'tab-finance', 'tab-operations', 'tab-audit'],
        'SALES': ['tab-dashboard', 'tab-crm', 'tab-registrations'],
        'DOCUMENT_OFFICER': ['tab-dashboard', 'tab-docs', 'tab-registrations'],
        'FINANCE': ['tab-dashboard', 'tab-registrations', 'tab-finance', 'tab-audit'],
        'OPERATIONS': ['tab-dashboard', 'tab-registrations', 'tab-operations', 'tab-docs'],
        'TOUR_LEADER': ['tab-dashboard', 'tab-operations']
    };

    // Inisialisasi Log Audit Dummy Awal
    function initAuditStore() {
        if (auditLogs.length === 0) {
            auditLogs = [
                { id: 'AUD-00195', time: '5 menit lalu', actor: 'Finance Admin', action: 'VERIFY_PAYMENT', entity: 'DB_Payments', ref: 'PAY-SDW-001', desc: 'Validasi transfer DP Rp 15.000.000 via BSI an Ahmad Jamaah' },
                { id: 'AUD-00194', time: '28 menit lalu', actor: 'Document Officer', action: 'VERIFY_DOCUMENT', entity: 'DB_Pilgrim_Documents', ref: 'DOC-000001', desc: 'Verifikasi Paspor RI an Ahmad Jamaah Teladan (Masa berlaku s/d 2032)' },
                { id: 'AUD-00193', time: '1 jam lalu', actor: 'Sales Consultant', action: 'UPDATE_LEAD', entity: 'DB_Leads', ref: 'LED-001', desc: 'Kirim penawaran paket VIP Akhir Tahun via WhatsApp ke Bpk. H. Rahmat' },
                { id: 'AUD-00192', time: '2 jam lalu', actor: 'System Auto', action: 'AUDIT_SNAPSHOT', entity: 'DB_Registrations', ref: 'REG-SDW-2701', desc: 'Penguncian harga paket Rp 33.500.000 (diskon snapshot Rp 1.000.000)' },
                { id: 'AUD-00191', time: '5 jam lalu', actor: 'Operations', action: 'ASSIGN_BUS', entity: 'DB_Trip_Members', ref: 'TRP-2701', desc: 'Alokasi Bus 01 & Kamar 402 Swissotel Makkah untuk Kloter Syawal' }
            ];
        }
    }

    function init() {
        initAuditStore();

        // 1. Ambil Role Tersimpan
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            const savedRole = sessionStorage.getItem(APP_CONFIG.storage.keys.adminRole) ||
                              localStorage.getItem(APP_CONFIG.storage.keys.adminRole);
            if (savedRole && ADMIN_PERMISSIONS[savedRole]) {
                currentRole = savedRole;
            }
        }

        // 2. Set Nilai Selector Role
        const roleSelect = document.getElementById('adminRoleSelector');
        if (roleSelect) {
            roleSelect.value = currentRole;
        }

        // 3. Terapkan RBAC pada Sidebar
        applyRolePermissions(currentRole);

        // 4. Pasang Keyboard Shortcut (Ctrl + K) untuk Global Search
        window.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openGlobalSearch();
            }
            if (e.key === 'Escape') {
                closeGlobalSearch();
                closeDrawer();
            }
        });

        // 5. Dual Clock Ticker (Makkah AST & Jakarta WIB)
        updateClocks();
        setInterval(updateClocks, 1000);

        // 6. Render Tampilan Awal
        switchTab('tab-dashboard');
    }

    // Role Switcher & RBAC
    function setRole(newRole) {
        if (!ADMIN_PERMISSIONS[newRole]) return;
        currentRole = newRole;

        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            sessionStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
            localStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
        }

        // Update Badge
        const badge = document.getElementById('adminRoleBadge');
        if (badge) {
            badge.innerText = newRole.replace('_', ' ');
        }

        applyRolePermissions(newRole);
        showToast(`Peran dialihkan ke: ${newRole.replace('_', ' ')}`);

        // Jika tab aktif tidak diizinkan untuk peran ini, pindah ke dashboard
        const allowed = ADMIN_PERMISSIONS[newRole] || ['tab-dashboard'];
        if (!allowed.includes(currentTab)) {
            switchTab('tab-dashboard');
        }
    }

    function applyRolePermissions(role) {
        const allowed = ADMIN_PERMISSIONS[role] || ['tab-dashboard'];
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

    // Tab Switching
    function switchTab(tabId) {
        currentTab = tabId;

        // Sembunyikan semua tab container
        const allContainers = document.querySelectorAll('.admin-tab-container');
        allContainers.forEach(c => c.classList.add('hidden'));

        // Tampilkan tab target
        const targetContainer = document.getElementById(tabId);
        if (targetContainer) {
            targetContainer.classList.remove('hidden');
        }

        // Update active class pada navigasi sidebar
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

        // Trigger renderer spesifik per tab
        if (tabId === 'tab-dashboard') renderDashboard();
        if (tabId === 'tab-crm') renderCRM();
        if (tabId === 'tab-docs') renderDocuments();
        if (tabId === 'tab-registrations') renderRegistrations();
        if (tabId === 'tab-finance') renderFinance();
        if (tabId === 'tab-operations') renderOperations();
        if (tabId === 'tab-audit') renderAuditLogs();
    }

    // 1. RENDER DASHBOARD EKSEKUTIF
    function renderDashboard() {
        const leads = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? MOCK_DATA.leads : [];
        const regs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? MOCK_DATA.registrations : [];

        // Update Counter Cards
        const totalPilgrimsEl = document.getElementById('kpi-total-pilgrims');
        const activeLeadsEl = document.getElementById('kpi-active-leads');
        const pendingDocsEl = document.getElementById('kpi-pending-docs');
        const totalRevenueEl = document.getElementById('kpi-total-revenue');

        if (totalPilgrimsEl) totalPilgrimsEl.innerText = regs.length + 42; // Akumulasi
        if (activeLeadsEl) activeLeadsEl.innerText = leads.length;
        if (pendingDocsEl) pendingDocsEl.innerText = "3 Dokumen";
        if (totalRevenueEl) totalRevenueEl.innerText = "Rp 1.48 Miliar";

        // Render Tabel Aktivitas Terkini
        const recentTbody = document.getElementById('dashboard-recent-regs-tbody');
        if (recentTbody) {
            recentTbody.innerHTML = regs.map(r => `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${r.id}</td>
                    <td class="py-3 px-4 font-bold text-slate-800">${r.customer}</td>
                    <td class="py-3 px-4 text-slate-600">${r.package}</td>
                    <td class="py-3 px-4 text-slate-500">${r.departure}</td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadgeClass(r.status)}">${r.status}</span>
                    </td>
                    <td class="py-3 px-4 font-bold text-sdw-pine">${r.payment}</td>
                    <td class="py-3 px-4 text-right">
                        <button type="button" onclick="SDW_ADMIN.openDrawer('REG', '${r.id}')" class="px-2.5 py-1 rounded-lg border border-slate-200 text-sdw-pine hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer">
                            Periksa
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 2. RENDER CRM & LEADS PIPELINE
    function renderCRM() {
        const leads = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? MOCK_DATA.leads : [];
        const tbody = document.getElementById('crm-leads-table-tbody');
        if (!tbody) return;

        const filtered = (activeFilter === 'ALL') ? leads : leads.filter(l => l.status === activeFilter || l.urgency === activeFilter);

        tbody.innerHTML = filtered.map(l => {
            let urgencyBadge = 'bg-slate-100 text-slate-700';
            if (l.urgency === 'HIGH') urgencyBadge = 'bg-rose-100 text-rose-800 border border-rose-200';
            if (l.urgency === 'MEDIUM') urgencyBadge = 'bg-amber-100 text-amber-800 border border-amber-200';

            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                    <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${l.id}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-800">
                        ${l.name}
                        <div class="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 mt-0.5">
                            <i class="fa-solid fa-phone text-[9px]"></i>
                            <span>${l.phone}</span>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-700">${l.package}</td>
                    <td class="py-3.5 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${urgencyBadge}">${l.urgency}</span>
                    </td>
                    <td class="py-3.5 px-4 font-black text-sdw-pine">${l.budget}</td>
                    <td class="py-3.5 px-4">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-900 border border-purple-200">${l.status}</span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-medium">${l.owner}</td>
                    <td class="py-3.5 px-4 text-right space-x-1.5">
                        <a href="https://wa.me/${l.phone.replace(/[^0-9]/g, '')}?text=Assalamualaikum%20${encodeURIComponent(l.name)},%20kami%20dari%20SDW%20UMROH..." target="_blank" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition">
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

    // 3. RENDER VERIFIKASI BERKAS & VISA
    function renderDocuments() {
        const tbody = document.getElementById('docs-verification-tbody');
        if (!tbody) return;

        const docsQueue = [
            { id: 'DOC-000003', pilgrim: 'Ahmad Jamaah Teladan', regId: 'REG-SDW-2701', type: 'Pasfoto 4x6 Latar Putih', file: 'pasfoto_ahmad_white.jpg', uploaded: 'Hari ini • 09:20 WIB', status: 'UNDER_REVIEW' },
            { id: 'DOC-000005', pilgrim: 'Ibu Fatimah Zahra', regId: 'REG-SDW-2702', type: 'Buku Kuning Vaksin Meningitis', file: 'sertifikat_vaksin_fatimah.pdf', uploaded: 'Kemarin • 14:15 WIB', status: 'UNDER_REVIEW' },
            { id: 'DOC-000006', pilgrim: 'Bpk. Gunawan Wibisono', regId: 'REG-SDW-2703', type: 'Scan Paspor RI (48 Halaman)', file: 'paspor_gunawan_full.pdf', uploaded: '2 hari lalu', status: 'UNDER_REVIEW' }
        ];

        tbody.innerHTML = docsQueue.map(d => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${d.id}</td>
                <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800">${d.pilgrim}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${d.regId}</div>
                </td>
                <td class="py-3.5 px-4 font-semibold text-slate-700">
                    <i class="fa-solid fa-file-shield text-sdw-gold mr-1.5"></i>
                    ${d.type}
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-500">${d.file}</td>
                <td class="py-3.5 px-4 text-slate-500">${d.uploaded}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">UNDER REVIEW</span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-1.5">
                    <button type="button" onclick="SDW_ADMIN.verifyDocumentAction('${d.id}', 'APPROVE')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer">
                        <i class="fa-solid fa-check mr-1"></i> Sahkan
                    </button>
                    <button type="button" onclick="SDW_ADMIN.verifyDocumentAction('${d.id}', 'REJECT')" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-xmark mr-1"></i> Tolak
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 4. RENDER REGISTRASI & BOOKING
    function renderRegistrations() {
        const regs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? MOCK_DATA.registrations : [];
        const tbody = document.getElementById('registrations-table-tbody');
        if (!tbody) return;

        tbody.innerHTML = regs.map(r => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${r.id}</td>
                <td class="py-3.5 px-4 font-bold text-slate-800">${r.customer}</td>
                <td class="py-3.5 px-4 text-slate-700 font-medium">${r.package}</td>
                <td class="py-3.5 px-4 text-slate-600">${r.departure}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${getStatusBadgeClass(r.status)}">${r.status}</span>
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-700">
                    <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px]">${r.docs} Lengkap</span>
                </td>
                <td class="py-3.5 px-4 font-black text-sdw-pine">${r.payment}</td>
                <td class="py-3.5 px-4 text-right">
                    <button type="button" onclick="SDW_ADMIN.openDrawer('REG', '${r.id}')" class="px-3 py-1 rounded-lg bg-sdw-pine hover:bg-purple-900 text-white font-bold text-[11px] transition cursor-pointer shadow-xs">
                        Review Pendaftaran
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 5. RENDER KEUANGAN & PEMBAYARAN
    function renderFinance() {
        const tbody = document.getElementById('finance-payments-tbody');
        if (!tbody) return;

        const paymentsQueue = [
            { id: 'PAY-SDW-002', regId: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', amount: 'Rp 10.000.000', method: 'Transfer Bank Syariah (BSI)', ref: 'BSI-TX889021', status: 'PENDING_VERIFY' },
            { id: 'PAY-SDW-001', regId: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', amount: 'Rp 15.000.000', method: 'Transfer BSI Virtual Account', ref: 'BSI-TX990142', status: 'VERIFIED' }
        ];

        tbody.innerHTML = paymentsQueue.map(p => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${p.id}</td>
                <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800">${p.customer}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${p.regId}</div>
                </td>
                <td class="py-3.5 px-4 font-black text-emerald-700 text-sm">${p.amount}</td>
                <td class="py-3.5 px-4 text-slate-600">${p.method}</td>
                <td class="py-3.5 px-4 font-mono text-slate-500">${p.ref}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}">
                        ${p.status}
                    </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                    ${p.status === 'PENDING_VERIFY' ? `
                        <button type="button" onclick="SDW_ADMIN.verifyPaymentAction('${p.id}')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer">
                            Validasi Mutasi
                        </button>
                    ` : `
                        <button type="button" onclick="alert('Cetak Kuitansi Resmi PDF untuk ${p.id}')" class="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer">
                            <i class="fa-solid fa-print mr-1"></i> Cetak Kuitansi
                        </button>
                    `}
                </td>
            </tr>
        `).join('');
    }

    // 6. RENDER OPERASIONAL KLOTER & MANIFEST
    function renderOperations() {
        const tripSummaryEl = document.getElementById('operations-kloter-container');
        if (!tripSummaryEl) return;

        tripSummaryEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-black text-amber-700 uppercase tracking-wider">Kloter Utama 01</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">DEPARTING H-73</span>
                    </div>
                    <h3 class="font-black text-base text-sdw-pine">15 Jan 2027 • 45 Pax</h3>
                    <div class="text-xs text-slate-600 space-y-1">
                        <div>✈️ Maskapai: <strong>Saudia Direct SV-819 (CGK-JED)</strong></div>
                        <div>🏨 Makkah: <strong>Retaj Al Rayyan (350m)</strong></div>
                        <div>🏨 Madinah: <strong>Concorde Dar Al Khair (200m)</strong></div>
                        <div>👳 Muthawwif: <strong>Ust. DR. H. Salman, Lc.</strong></div>
                    </div>
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs text-slate-500 font-bold">Bus 01 &amp; Bus 02</span>
                        <button type="button" onclick="alert('Buka Manifest Bus & Rooming List')" class="px-2.5 py-1 rounded-lg bg-sdw-pine text-white text-[11px] font-bold hover:bg-purple-900 transition cursor-pointer">
                            Lihat Manifest
                        </button>
                    </div>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-black text-purple-700 uppercase tracking-wider">Kloter VIP Khidmat</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">KUOTA PENUH</span>
                    </div>
                    <h3 class="font-black text-base text-sdw-pine">28 Feb 2027 • 35 Pax</h3>
                    <div class="text-xs text-slate-600 space-y-1">
                        <div>✈️ Maskapai: <strong>Garuda Indonesia (GA-980)</strong></div>
                        <div>🏨 Makkah: <strong>Swissotel Clock Tower (0m)</strong></div>
                        <div>🏨 Madinah: <strong>Dar Al Taqwa Madinah (50m)</strong></div>
                        <div>🚄 Transport: <strong>Kereta Cepat Haramain (HSR)</strong></div>
                    </div>
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs text-slate-500 font-bold">VIP Executive Bus</span>
                        <button type="button" onclick="alert('Buka Manifest Kamar VIP')" class="px-2.5 py-1 rounded-lg bg-sdw-pine text-white text-[11px] font-bold hover:bg-purple-900 transition cursor-pointer">
                            Rooming List
                        </button>
                    </div>
                </div>

                <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-black text-blue-700 uppercase tracking-wider">Kloter Plus Turki</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">TERSEDIA 18 SEAT</span>
                    </div>
                    <h3 class="font-black text-base text-sdw-pine">18 Apr 2027 • 40 Pax</h3>
                    <div class="text-xs text-slate-600 space-y-1">
                        <div>✈️ Maskapai: <strong>Turkish Airlines (TK-57)</strong></div>
                        <div>🏨 Istanbul: <strong>Pullman Istanbul Hotel</strong></div>
                        <div>🏨 Makkah: <strong>Anjum Hotel Makkah</strong></div>
                        <div>🧭 Tour Leader: <strong>Ust. H. Fauzi, S.Ag.</strong></div>
                    </div>
                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-xs text-slate-500 font-bold">Turki + Haramain Bus</span>
                        <button type="button" onclick="alert('Buka Jadwal Itinerary')" class="px-2.5 py-1 rounded-lg bg-sdw-pine text-white text-[11px] font-bold hover:bg-purple-900 transition cursor-pointer">
                            Itinerary Detail
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 7. RENDER JEJAK AUDIT SISTEM
    function renderAuditLogs() {
        const tbody = document.getElementById('audit-logs-table-tbody');
        if (!tbody) return;

        tbody.innerHTML = auditLogs.map(a => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${a.id}</td>
                <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${a.time}</td>
                <td class="py-3 px-4 font-bold text-slate-800">${a.actor}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">${a.action}</span>
                </td>
                <td class="py-3 px-4 font-mono text-purple-900 font-semibold">${a.entity}</td>
                <td class="py-3 px-4 font-mono text-slate-600">${a.ref}</td>
                <td class="py-3 px-4 text-slate-700 max-w-xs truncate" title="${a.desc}">${a.desc}</td>
            </tr>
        `).join('');
    }

    // AKSI OPERASIONAL: VERIFIKASI DOKUMEN
    function verifyDocumentAction(docId, decision) {
        if (decision === 'APPROVE') {
            logAdminAudit('APPROVE_DOCUMENT', 'DB_Pilgrim_Documents', docId, `Dokumen ${docId} disetujui dan disahkan oleh Document Officer.`);
            showToast(`✅ Berkas ${docId} berhasil disahkan!`);
        } else {
            const reason = prompt('Masukkan alasan penolakan berkas:', 'Foto buram / Masa berlaku paspor kurang dari 7 bulan.');
            if (!reason) return;
            logAdminAudit('REJECT_DOCUMENT', 'DB_Pilgrim_Documents', docId, `Dokumen ${docId} ditolak. Alasan: ${reason}`);
            showToast(`⚠️ Berkas ${docId} ditolak. Notifikasi perbaikan dikirim ke jamaah.`);
        }
        renderDocuments();
    }

    // AKSI OPERASIONAL: VALIDASI PEMBAYARAN
    function verifyPaymentAction(payId) {
        logAdminAudit('VERIFY_PAYMENT', 'DB_Payments', payId, `Mutasi rekening untuk pembayaran ${payId} tervalidasi sah.`);
        showToast(`✅ Pembayaran ${payId} berhasil divalidasi! Kuitansi resmi diterbitkan.`);
        renderFinance();
    }

    // CATAT KE AUDIT TRAIL
    function logAdminAudit(action, entity, ref, desc) {
        const newLog = {
            id: `AUD-00${auditLogs.length + 196}`,
            time: 'Baru saja',
            actor: `${currentRole.replace('_', ' ')} (SDW Staf)`,
            action: action,
            entity: entity,
            ref: ref,
            desc: desc
        };
        auditLogs.unshift(newLog);
    }

    // SLIDE-OVER DRAWER INSPEKSI
    function openDrawer(type, id) {
        const drawer = document.getElementById('adminSideDrawer');
        const backdrop = document.getElementById('adminDrawerBackdrop');
        const panel = document.getElementById('adminDrawerPanel');
        const content = document.getElementById('adminDrawerContent');

        if (!drawer || !content) return;

        if (type === 'LEAD') {
            const leads = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? MOCK_DATA.leads : [];
            const l = leads.find(item => item.id === id) || { id, name: 'Prospek', phone: '-', package: '-', budget: '-' };
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <span class="text-[10px] font-black text-purple-900 uppercase">Detil Prospek CRM</span>
                        <h3 class="font-extrabold text-base text-sdw-pine mt-0.5">${l.name}</h3>
                        <p class="text-xs text-slate-500 font-mono">${l.phone}</p>
                    </div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">ID Lead:</span>
                            <span class="font-mono font-bold text-sdw-pine">${l.id}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Program Paket:</span>
                            <span class="font-bold text-slate-800">${l.package}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Urgensi Keberangkatan:</span>
                            <span class="font-bold text-rose-600">${l.urgency}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Estimasi Anggaran:</span>
                            <span class="font-bold text-emerald-700">${l.budget}</span>
                        </div>
                    </div>
                    <div class="pt-4 space-y-2">
                        <button type="button" onclick="alert('Formulir konversi ${l.name} menjadi jamaah terdaftar')" class="w-full py-2.5 rounded-xl bg-sdw-pine hover:bg-purple-900 text-white font-bold text-xs transition shadow-sm cursor-pointer">
                            + Konversi ke Pendaftaran
                        </button>
                    </div>
                </div>
            `;
        } else if (type === 'REG') {
            const regs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? MOCK_DATA.registrations : [];
            const r = regs.find(item => item.id === id) || { id, customer: 'Jamaah', package: '-' };
            content.innerHTML = `
                <div class="space-y-4">
                    <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span class="text-[10px] font-black text-emerald-900 uppercase">Berkas Registrasi Terdaftar</span>
                        <h3 class="font-extrabold text-base text-sdw-pine mt-0.5">${r.customer}</h3>
                        <p class="text-xs text-slate-500 font-mono">${r.id}</p>
                    </div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Program Paket:</span>
                            <span class="font-bold text-slate-800">${r.package}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Jadwal Keberangkatan:</span>
                            <span class="font-bold text-slate-800">${r.departure}</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Kelengkapan Dokumen:</span>
                            <span class="font-bold text-emerald-700">${r.docs} Lengkap</span>
                        </div>
                        <div class="flex justify-between py-1.5 border-b border-slate-100">
                            <span class="text-slate-500">Status Pembayaran:</span>
                            <span class="font-bold text-sdw-pine">${r.payment}</span>
                        </div>
                    </div>
                    <div class="pt-4 flex items-center gap-2">
                        <button type="button" onclick="alert('Cetak Lembar Manifest')" class="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer">
                            Cetak Data
                        </button>
                        <button type="button" onclick="alert('Buka detail keuangan')" class="flex-1 py-2 rounded-xl bg-sdw-pine text-white font-bold text-xs hover:bg-purple-900 transition cursor-pointer">
                            Buka Invoice
                        </button>
                    </div>
                </div>
            `;
        }

        drawer.classList.remove('opacity-0', 'pointer-events-none');
        panel.classList.remove('translate-x-full');
    }

    function closeDrawer() {
        const drawer = document.getElementById('adminSideDrawer');
        const panel = document.getElementById('adminDrawerPanel');
        if (drawer && panel) {
            drawer.classList.add('opacity-0', 'pointer-events-none');
            panel.classList.add('translate-x-full');
        }
    }

    // GLOBAL QUICK SEARCH MODAL (Ctrl + K)
    function openGlobalSearch() {
        const modal = document.getElementById('adminSearchModal');
        const input = document.getElementById('globalSearchInput');
        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.children[0].classList.remove('scale-95');
            if (input) {
                input.value = '';
                input.focus();
                handleSearchInput('');
            }
        }
    }

    function closeGlobalSearch() {
        const modal = document.getElementById('adminSearchModal');
        if (modal) {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.children[0].classList.add('scale-95');
        }
    }

    function handleSearchInput(query) {
        const resultsEl = document.getElementById('globalSearchResults');
        if (!resultsEl) return;

        query = (query || '').toLowerCase().trim();
        const leads = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.leads) ? MOCK_DATA.leads : [];
        const regs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.registrations) ? MOCK_DATA.registrations : [];

        let matches = [];

        leads.forEach(l => {
            if (!query || l.name.toLowerCase().includes(query) || l.id.toLowerCase().includes(query) || l.phone.includes(query)) {
                matches.push({ type: 'LEAD', title: l.name, sub: `${l.id} • ${l.package}`, badge: 'PROSPEK CRM', action: () => { closeGlobalSearch(); switchTab('tab-crm'); openDrawer('LEAD', l.id); } });
            }
        });

        regs.forEach(r => {
            if (!query || r.customer.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)) {
                matches.push({ type: 'REG', title: r.customer, sub: `${r.id} • ${r.package}`, badge: 'JAMAAH TERDAFTAR', action: () => { closeGlobalSearch(); switchTab('tab-registrations'); openDrawer('REG', r.id); } });
            }
        });

        if (matches.length === 0) {
            resultsEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Tidak ada entitas data yang cocok dengan "${query}"</div>`;
            return;
        }

        resultsEl.innerHTML = matches.slice(0, 6).map((m, idx) => `
            <div onclick="window.SDW_ADMIN_SEARCH_SELECT(${idx})" class="p-3 rounded-xl hover:bg-purple-50 flex items-center justify-between cursor-pointer transition border border-transparent hover:border-purple-200">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 text-sdw-pine flex items-center justify-center text-xs font-bold">
                        <i class="fa-solid ${m.type === 'LEAD' ? 'fa-users' : 'fa-id-card'}"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-slate-800">${m.title}</div>
                        <div class="text-[10.5px] text-slate-400">${m.sub}</div>
                    </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[9.5px] font-black bg-slate-100 text-slate-600">${m.badge}</span>
            </div>
        `).join('');

        window.SDW_ADMIN_SEARCH_MATCHES = matches;
    }

    window.SDW_ADMIN_SEARCH_SELECT = function(idx) {
        if (window.SDW_ADMIN_SEARCH_MATCHES && window.SDW_ADMIN_SEARCH_MATCHES[idx]) {
            window.SDW_ADMIN_SEARCH_MATCHES[idx].action();
        }
    };

    // DUAL CLOCKS (MAKKAH AST vs JAKARTA WIB)
    function updateClocks() {
        const now = new Date();
        const makkahTimeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const jakartaTimeStr = now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

        const mEl = document.getElementById('adminMakkahClock');
        const jEl = document.getElementById('adminJakartaClock');
        if (mEl) mEl.innerText = makkahTimeStr.replace(/\./g, ':');
        if (jEl) jEl.innerText = jakartaTimeStr.replace(/\./g, ':');
    }

    // HELPER: STATUS PILL COLOR
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'CONFIRMED':
            case 'APPROVED':
            case 'VERIFIED':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'UNDER_REVIEW':
            case 'PENDING':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'CANCELLED':
            case 'REJECTED':
                return 'bg-rose-100 text-rose-800 border border-rose-200';
            default:
                return 'bg-purple-100 text-purple-800 border border-purple-200';
        }
    }

    // HELPER: TOAST NOTIFICATION
    function showToast(msg) {
        const toast = document.getElementById('adminToast');
        if (!toast) return;
        toast.innerText = msg;
        toast.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        }, 3200);
    }

    return {
        init: init,
        setRole: setRole,
        switchTab: switchTab,
        openDrawer: openDrawer,
        closeDrawer: closeDrawer,
        openGlobalSearch: openGlobalSearch,
        closeGlobalSearch: closeGlobalSearch,
        handleSearchInput: handleSearchInput,
        verifyDocumentAction: verifyDocumentAction,
        verifyPaymentAction: verifyPaymentAction,
        showToast: showToast
    };
});

