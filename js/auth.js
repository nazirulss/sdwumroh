/**
 * ====================================================================
 * SDW UMROH — AUTHENTICATION & RBAC CONTROLLER
 * File: js/auth.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: docs/03_USER_ROLES_AND_PERMISSIONS.md & docs/15_PERMISSION_RLS_MATRIX.md
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_AUTH = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const ROLES = [
        'PILGRIM',          // Jamaah Terdaftar
        'SALES',            // Sales / Marketing Consultant
        'DOCUMENT_OFFICER', // Staf Verifikasi Dokumen & Visa
        'FINANCE',          // Staf Keuangan & Pembayaran
        'OPERATIONS',       // Staf Operasional & Perlengkapan
        'TOUR_LEADER',      // Tour Leader Kloter
        'MUTHAWWIF',        // Pembimbing Ibadah Tanah Suci
        'PARTNER',          // Agen / Mitra Pemasaran
        'ADMIN',            // Administrator Sistem
        'MANAGER',          // Operational Manager
        'OWNER'             // Pimpinan / Pemilik Eksekutif
    ];

    // Role View Permission Mapping for Pilgrim App (Decoupled from Admin Portal)
    const PERMISSIONS = {
        'PILGRIM': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile'],
        'SALES': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'DOCUMENT_OFFICER': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'FINANCE': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'OPERATIONS': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'TOUR_LEADER': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'MUTHAWWIF': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'PARTNER': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'ADMIN': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'MANAGER': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin'],
        'OWNER': ['tab-jamaah', 'tab-berita', 'tab-kalender', 'tab-profile', 'tab-admin']
    };

    function getCurrentRole() {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            return sessionStorage.getItem(APP_CONFIG.storage.keys.adminRole) ||
                   localStorage.getItem(APP_CONFIG.storage.keys.adminRole) ||
                   'PILGRIM';
        }
        return 'PILGRIM';
    }

    function setRole(newRole) {
        if (!ROLES.includes(newRole)) return;
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            sessionStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
            localStorage.setItem(APP_CONFIG.storage.keys.adminRole, newRole);
        }
        // Jika staf/admin dipilih saat berada di aplikasi jamaah (app.html), langsung alihkan ke Portal Admin
        if (newRole !== 'PILGRIM' && typeof window !== 'undefined' && window.location) {
            const currentPath = window.location.pathname || '';
            if (currentPath.includes('app.html') || currentPath.endsWith('/app')) {
                window.location.href = 'admin.html';
                return;
            }
        }
        applyPermissions(newRole);
    }

    function applyPermissions(role = getCurrentRole()) {
        const allowedTabs = PERMISSIONS[role] || ['tab-jamaah'];

        // Update Nav Menu Badges
        const roleBadge = document.getElementById('current-role-badge');
        if (roleBadge) {
            roleBadge.textContent = role.replace('_', ' ');
        }

        // Toggle visibility of navigation buttons & views
        const allNavItems = document.querySelectorAll('[data-perm-tab]');
        allNavItems.forEach(item => {
            const targetTab = item.getAttribute('data-perm-tab');
            if (allowedTabs.includes(targetTab)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // If active tab is not allowed, switch to the first allowed tab
        const activeTabEl = document.querySelector('.app-view-container:not(.hidden)');
        const currentActiveId = activeTabEl ? activeTabEl.id : '';
        if (!allowedTabs.includes(currentActiveId)) {
            switchAppTab(allowedTabs[0]);
        }
    }

    function switchAppTab(tabId) {
        const allViews = document.querySelectorAll('.app-view-container');
        allViews.forEach(v => v.classList.add('hidden'));

        const targetView = document.getElementById(tabId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        // Trigger renderer jika tab kalender atau berita dibuka
        if (tabId === 'tab-kalender' && typeof window.renderSdwCalendar === 'function') {
            window.renderSdwCalendar();
        }
        if (tabId === 'tab-berita' && typeof window.renderSdwNews === 'function') {
            window.renderSdwNews();
        }

        // Update desktop nav styles
        const allNavBtns = document.querySelectorAll('[data-perm-tab]');
        allNavBtns.forEach(btn => {
            if (btn.getAttribute('data-perm-tab') === tabId) {
                btn.classList.add('bg-sdw-pine', 'text-white', 'shadow');
                btn.classList.remove('text-sdw-charcoal', 'hover:bg-slate-100');
            } else {
                btn.classList.remove('bg-sdw-pine', 'text-white', 'shadow');
                btn.classList.add('text-sdw-charcoal', 'hover:bg-slate-100');
            }
        });

        // Update mobile bottom nav styles
        const allBottomBtns = document.querySelectorAll('[data-bottom-tab]');
        allBottomBtns.forEach(btn => {
            const iconWrap = btn.querySelector('div');
            const label = btn.querySelector('span');
            if (btn.getAttribute('data-bottom-tab') === tabId) {
                btn.classList.add('text-sdw-pine');
                btn.classList.remove('text-slate-500');
                if (iconWrap) {
                    iconWrap.classList.add('bg-purple-50', 'text-sdw-pine');
                    iconWrap.classList.remove('text-slate-500');
                }
                if (label) {
                    label.classList.add('font-extrabold', 'text-sdw-pine');
                    label.classList.remove('font-semibold');
                }
            } else {
                btn.classList.remove('text-sdw-pine');
                btn.classList.add('text-slate-500');
                if (iconWrap) {
                    iconWrap.classList.remove('bg-purple-50', 'text-sdw-pine');
                    iconWrap.classList.add('text-slate-500');
                }
                if (label) {
                    label.classList.remove('font-extrabold', 'text-sdw-pine');
                    label.classList.add('font-semibold');
                }
            }
        });
    }

    // ==================== PILGRIM ACCOUNTS & AUTHENTICATION ====================
    const PILGRIM_SESSION_KEY = 'sdw_pilgrim_session';
    const REGISTERED_USERS_KEY = 'sdw_registered_users';

    // Pre-seeded default demo accounts (matching DB_Customers & DB_Registrations)
    const DEFAULT_ACCOUNTS = [
        {
            id: 'CUS-000001',
            fullName: 'Ahmad Jamaah Teladan',
            phone: '081298765432',
            email: 'ahmad.jamaah@gmail.com',
            password: 'password123', // Also supports '123456'
            regId: 'REG-SDW-2701',
            packageTitle: 'Umroh Reguler Syawal Barakah (9 Hari)',
            flightInfo: 'Saudia Airlines (SV-819) • Direct CGK - JED',
            roomType: 'Quad (Sekamar Ber-4)',
            departureDate: '15 Syawal 1448H (24 Maret 2027)',
            status: 'CONFIRMED',
            isDemo: true
        },
        {
            id: 'CUS-000002',
            fullName: 'Ibu Siti Fatimah',
            phone: '081387654321',
            email: 'siti.fatimah@gmail.com',
            password: 'password123',
            regId: 'REG-SDW-2702',
            packageTitle: 'Umroh VIP Bintang 5 (9 Hari)',
            flightInfo: 'Garuda Indonesia (GA-980) • Direct CGK - MED',
            roomType: 'Double (Sekamar Ber-2)',
            departureDate: '28 Syaban 1448H (05 Februari 2027)',
            status: 'CONFIRMED',
            isDemo: true
        }
    ];

    function cleanPhone(phone) {
        if (!phone) return '';
        let p = String(phone).replace(/[^0-9]/g, '');
        if (p.startsWith('62')) p = '0' + p.substring(2);
        return p;
    }

    function getRegisteredUsers() {
        try {
            if (typeof localStorage === 'undefined') return [];
            const data = localStorage.getItem(REGISTERED_USERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveRegisteredUsers(users) {
        try {
            if (typeof localStorage === 'undefined') return;
            localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
        } catch (e) {}
    }

    function getAllPilgrimAccounts() {
        const customUsers = getRegisteredUsers();
        return [...DEFAULT_ACCOUNTS, ...customUsers];
    }

    function getPilgrimSession() {
        try {
            if (typeof localStorage === 'undefined') return null;
            const session = localStorage.getItem(PILGRIM_SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    }

    function setPilgrimSession(sessionData) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(PILGRIM_SESSION_KEY, JSON.stringify(sessionData));
            }
        } catch (e) {}
        syncPilgrimUI();
    }

    function clearPilgrimSession() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(PILGRIM_SESSION_KEY);
            }
        } catch (e) {}
        syncPilgrimUI();
    }

    function loginPilgrim(phone, password) {
        const cPhone = cleanPhone(phone);
        if (!cPhone) {
            return { success: false, message: 'Nomor WhatsApp wajib diisi.' };
        }
        if (!password || String(password).trim().length < 4) {
            return { success: false, message: 'Kata sandi minimal 4 karakter.' };
        }

        const accounts = getAllPilgrimAccounts();
        const found = accounts.find(acc => {
            const accPhone = cleanPhone(acc.phone);
            return accPhone === cPhone;
        });

        if (!found) {
            return {
                success: false,
                message: 'Nomor WhatsApp belum terdaftar. Silakan buat akun baru terlebih dahulu.'
            };
        }

        const passStr = String(password).trim();
        const validPassword = (found.password === passStr) || (found.isDemo && passStr === '123456');
        if (!validPassword) {
            return {
                success: false,
                message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.'
            };
        }

        const session = {
            id: found.id,
            fullName: found.fullName,
            phone: found.phone,
            email: found.email || '',
            regId: found.regId || ('REG-SDW-' + Math.floor(1000 + Math.random() * 9000)),
            packageTitle: found.packageTitle || 'Program Umroh 1448H',
            flightInfo: found.flightInfo || 'Maskapai Bintang 5',
            roomType: found.roomType || 'Quad (Ber-4)',
            departureDate: found.departureDate || 'Musim 1448H',
            status: found.status || 'CONFIRMED',
            loggedInAt: new Date().toISOString()
        };

        setPilgrimSession(session);
        return { success: true, user: session };
    }

    function registerPilgrim({ fullName, phone, email, password }) {
        if (!fullName || String(fullName).trim().length < 3) {
            return { success: false, message: 'Nama lengkap wajib diisi minimal 3 karakter sesuai KTP.' };
        }
        const cPhone = cleanPhone(phone);
        if (!cPhone || cPhone.length < 9) {
            return { success: false, message: 'Nomor WhatsApp aktif tidak valid (minimal 10 digit).' };
        }
        if (!password || String(password).trim().length < 6) {
            return { success: false, message: 'Kata sandi minimal 6 karakter demi keamanan akun Anda.' };
        }

        const accounts = getAllPilgrimAccounts();
        const existing = accounts.find(acc => cleanPhone(acc.phone) === cPhone);
        if (existing) {
            return {
                success: false,
                message: 'Nomor WhatsApp sudah terdaftar. Silakan langsung masuk ke akun Anda.'
            };
        }

        const newId = 'CUS-' + String(Math.floor(100000 + Math.random() * 900000));
        const newRegId = 'REG-SDW-' + String(Math.floor(2700 + Math.random() * 1000));
        const newUser = {
            id: newId,
            fullName: String(fullName).trim(),
            phone: cPhone,
            email: (email || '').trim().toLowerCase(),
            password: String(password).trim(),
            regId: newRegId,
            packageTitle: 'Pendaftaran Baru (Menunggu Pemilihan Paket)',
            flightInfo: 'Maskapai Bintang 5 (Menunggu Jadwal)',
            roomType: 'Quad (Standar)',
            departureDate: 'Musim 1448H',
            status: 'NEW_PILGRIM',
            createdAt: new Date().toISOString()
        };

        const customUsers = getRegisteredUsers();
        customUsers.push(newUser);
        saveRegisteredUsers(customUsers);

        // Auto login newly registered pilgrim
        const session = {
            id: newUser.id,
            fullName: newUser.fullName,
            phone: newUser.phone,
            email: newUser.email,
            regId: newUser.regId,
            packageTitle: newUser.packageTitle,
            flightInfo: newUser.flightInfo,
            roomType: newUser.roomType,
            departureDate: newUser.departureDate,
            status: newUser.status,
            loggedInAt: new Date().toISOString()
        };

        setPilgrimSession(session);

        // Sinkronisasi data pendaftaran akun ke Google Apps Script / Spreadsheet (Offline-First)
        syncPilgrimRegistrationToBackend(newUser);

        return { success: true, user: session };
    }

    /**
     * Mengirimkan mutasi pendaftaran akun jamaah ke backend Google Apps Script / Spreadsheet
     * Dilengkapi strategi fallback otomatis ke mutasi live (createLead & registerPilgrim)
     * serta local storage queue bila perangkat sedang offline.
     */
    function syncPilgrimRegistrationToBackend(newUser) {
        if (!newUser) return Promise.resolve(null);

        const api = (typeof window !== 'undefined' && window.SDW_API) ? window.SDW_API :
                    (typeof SDW_API !== 'undefined' ? SDW_API : (typeof global !== 'undefined' && global.SDW_API ? global.SDW_API : null));

        if (!api || typeof api.post !== 'function') {
            console.warn('[SDW_AUTH] SDW_API belum tersedia, akun disimpan lokal.');
            return Promise.resolve(null);
        }

        const payload = {
            id: newUser.id,
            customerId: newUser.id,
            fullName: newUser.fullName,
            name: newUser.fullName,
            phone: newUser.phone,
            email: newUser.email || '',
            nik: 'NIK-' + newUser.phone,
            source: 'PWA_SELF_REGISTER',
            notes: `Pendaftaran Akun Jamaah Baru via PWA (${newUser.phone})`
        };

        return api.post('registerAccount', payload)
            .then(res => {
                if (res && res.success) {
                    console.info('[SDW_AUTH] ✅ Akun jamaah berhasil tersinkron ke Spreadsheet (registerAccount):', res);
                    return res;
                }
                // Fallback ke mutasi createLead & registerPilgrim yang aktif di live Apps Script
                console.info('[SDW_AUTH] Mencatat ke CRM Leads Spreadsheet live (createLead)...');
                return api.post('createLead', {
                    name: newUser.fullName,
                    customerId: newUser.id,
                    source: 'PWA_SELF_REGISTER',
                    urgency: 'HIGH',
                    budget: 'Program Umroh 1448H',
                    notes: `No. WA: ${newUser.phone} | Email: ${newUser.email || '-'} | Pendaftaran Akun Jamaah Baru via PWA`
                }).then(leadRes => {
                    console.info('[SDW_AUTH] ✅ Data jamaah berhasil dicatat di DB_Leads Spreadsheet:', leadRes);
                    if (api.post) {
                        api.post('registerPilgrim', {
                            id: newUser.regId,
                            customer: newUser.fullName,
                            customerId: newUser.id,
                            phone: newUser.phone,
                            email: newUser.email,
                            nik: 'NIK-' + newUser.phone,
                            notes: 'Pendaftaran Akun Mandiri PWA'
                        }).catch(() => {});
                    }
                    return leadRes;
                });
            })
            .catch(err => {
                console.warn('[SDW_AUTH] Gagal sinkronisasi online langsung (offline fallback aktif):', err.message || err);
                try {
                    if (typeof localStorage !== 'undefined') {
                        const queueKey = 'sdw_pending_account_registrations';
                        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
                        queue.push({ payload, queuedAt: new Date().toISOString() });
                        localStorage.setItem(queueKey, JSON.stringify(queue));
                    }
                } catch (e) {}
                return null;
            });
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('online', function () {
            try {
                const queueKey = 'sdw_pending_account_registrations';
                const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
                if (queue.length > 0) {
                    console.info(`[SDW_AUTH] Terhubung kembali ke internet. Memproses ${queue.length} antrean pendaftaran ke Spreadsheet...`);
                    localStorage.removeItem(queueKey);
                    queue.forEach(item => {
                        syncPilgrimRegistrationToBackend(item.payload);
                    });
                }
            } catch (e) {}
        });
    }

    function logoutPilgrim() {
        clearPilgrimSession();
    }

    function syncPilgrimUI() {
        if (typeof document === 'undefined') return;
        const session = getPilgrimSession();

        const guestBanner = document.getElementById('profileGuestBanner');
        const authCard = document.getElementById('profileAuthenticatedCard');
        const logoutBtn = document.getElementById('profileLogoutBtn');
        const loginBtnHeader = document.getElementById('profileLoginBtnHeader');
        const badgeAktif = document.getElementById('jamaah-badge-status');

        const elName = document.getElementById('jamaah-name');
        const elRegId = document.getElementById('jamaah-reg-id');
        const elPackage = document.getElementById('jamaah-package-title');
        const elFlight = document.getElementById('jamaah-flight-info');
        const elRoom = document.getElementById('jamaah-room-type');
        const elDeparture = document.getElementById('jamaah-departure-date');

        const newPilgrimSection = document.getElementById('profileNewPilgrimSection');
        const pendingDpSection = document.getElementById('profilePendingDpSection');
        const confirmedSection = document.getElementById('profileConfirmedSection');
        const elNewPilgrimName = document.getElementById('new-pilgrim-name');

        const elPendingPkg = document.getElementById('pending-package-title');
        const elPendingRoom = document.getElementById('pending-room-type');
        const elPendingDate = document.getElementById('pending-departure-date');
        const elPendingTotal = document.getElementById('pending-total-price');
        const elPendingDp = document.getElementById('pending-dp-amount');
        const elPendingRegBadge = document.getElementById('pending-reg-badge');
        const btnPendingWa = document.getElementById('pendingDpWaBtn');

        if (session) {
            if (guestBanner) guestBanner.classList.add('hidden');
            if (authCard) authCard.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (loginBtnHeader) loginBtnHeader.classList.add('hidden');

            if (elName) elName.textContent = session.fullName;
            if (elRegId) elRegId.textContent = session.regId;
            if (elPackage) elPackage.textContent = session.packageTitle;
            if (elFlight) elFlight.textContent = session.flightInfo;
            if (elRoom) elRoom.textContent = session.roomType;
            if (elDeparture) elDeparture.textContent = session.departureDate;

            // Conditional view rendering based on Pilgrim Lifecycle State
            if (session.status === 'NEW_PILGRIM') {
                if (newPilgrimSection) newPilgrimSection.classList.remove('hidden');
                if (pendingDpSection) pendingDpSection.classList.add('hidden');
                if (confirmedSection) confirmedSection.classList.add('hidden');
                if (elNewPilgrimName) elNewPilgrimName.textContent = session.fullName;

                if (badgeAktif) {
                    badgeAktif.textContent = 'Terdaftar';
                    badgeAktif.className = 'px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300';
                }
            } else if (session.status === 'PENDING_DP') {
                if (newPilgrimSection) newPilgrimSection.classList.add('hidden');
                if (pendingDpSection) pendingDpSection.classList.remove('hidden');
                if (confirmedSection) confirmedSection.classList.add('hidden');

                if (elPendingPkg) elPendingPkg.textContent = session.packageTitle || 'Program Umroh 1448H';
                if (elPendingRoom) elPendingRoom.textContent = session.roomType || 'Quad';
                if (elPendingDate) elPendingDate.textContent = session.departureDate || 'Musim 1448H';
                if (elPendingTotal) elPendingTotal.textContent = session.totalPrice || 'Rp 33.500.000';
                if (elPendingDp) elPendingDp.textContent = session.dpAmount || 'Rp 5.000.000';
                if (elPendingRegBadge) elPendingRegBadge.textContent = session.regId || 'REG-SDW-XXXX';

                if (btnPendingWa) {
                    const waMsg = encodeURIComponent(`Assalamualaikum Finance SDW UMROH, saya atas nama ${session.fullName} (${session.regId}) ingin konfirmasi transfer DP booking paket ${session.packageTitle} sebesar ${session.dpAmount || 'Rp 5.000.000'}.`);
                    btnPendingWa.href = `https://wa.me/6281234567890?text=${waMsg}`;
                }

                if (badgeAktif) {
                    badgeAktif.textContent = 'Menunggu DP';
                    badgeAktif.className = 'px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse';
                }
            } else {
                // CONFIRMED / READY_TO_FLY / Demo Account
                if (newPilgrimSection) newPilgrimSection.classList.add('hidden');
                if (pendingDpSection) pendingDpSection.classList.add('hidden');
                if (confirmedSection) confirmedSection.classList.remove('hidden');

                if (badgeAktif) {
                    badgeAktif.textContent = 'Aktif (Lunas)';
                    badgeAktif.className = 'px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300';
                }
            }
        } else {
            // Guest mode
            if (guestBanner) guestBanner.classList.remove('hidden');
            if (authCard) authCard.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (loginBtnHeader) loginBtnHeader.classList.remove('hidden');

            if (newPilgrimSection) newPilgrimSection.classList.add('hidden');
            if (pendingDpSection) pendingDpSection.classList.add('hidden');
            if (confirmedSection) confirmedSection.classList.add('hidden');
            if (badgeAktif) {
                badgeAktif.textContent = 'Tamu';
                badgeAktif.className = 'px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300';
            }

            if (elName) elName.textContent = 'Tamu Jamaah (Belum Masuk)';
            if (elRegId) elRegId.textContent = 'REG-BELUM-MASUK';
            if (elPackage) elPackage.textContent = 'Pilih Paket Umroh di Beranda';
            if (elFlight) elFlight.textContent = 'Silakan Masuk Akun Anda';
            if (elRoom) elRoom.textContent = '-';
            if (elDeparture) elDeparture.textContent = '-';
        }
    }

    // ==================== GLOBAL WINDOW HELPERS FOR PWA UI ====================
    if (typeof window !== 'undefined') {
        window.switchAuthTab = function (tab) {
            const loginBtn = document.getElementById('authTabLoginBtn');
            const registerBtn = document.getElementById('authTabRegisterBtn');
            const loginForm = document.getElementById('authFormLogin');
            const registerForm = document.getElementById('authFormRegister');
            const alertBox = document.getElementById('authAlertBox');
            if (alertBox) alertBox.classList.add('hidden');

            if (tab === 'register') {
                if (registerBtn) {
                    registerBtn.className = 'py-2.5 px-4 rounded-xl text-xs font-black bg-sdw-pine text-white shadow-sm transition text-center cursor-pointer';
                }
                if (loginBtn) {
                    loginBtn.className = 'py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition text-center cursor-pointer';
                }
                if (registerForm) registerForm.classList.remove('hidden');
                if (loginForm) loginForm.classList.add('hidden');
            } else {
                if (loginBtn) {
                    loginBtn.className = 'py-2.5 px-4 rounded-xl text-xs font-black bg-sdw-pine text-white shadow-sm transition text-center cursor-pointer';
                }
                if (registerBtn) {
                    registerBtn.className = 'py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition text-center cursor-pointer';
                }
                if (loginForm) loginForm.classList.remove('hidden');
                if (registerForm) registerForm.classList.add('hidden');
            }
        };

        window.togglePasswordVisibility = function (inputId, btn) {
            const input = document.getElementById(inputId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            if (btn) {
                btn.innerHTML = isPassword 
                    ? '<i class="fa-regular fa-eye-slash text-sdw-pine"></i>' 
                    : '<i class="fa-regular fa-eye"></i>';
            }
        };

        window.showAuthAlert = function (type, message) {
            const box = document.getElementById('authAlertBox');
            if (!box) return;
            box.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-rose-50', 'text-rose-800', 'border-rose-200');
            if (type === 'success') {
                box.className = 'p-3.5 rounded-2xl text-xs font-bold border transition-all bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-2';
                box.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0"></i><span>${message}</span>`;
            } else {
                box.className = 'p-3.5 rounded-2xl text-xs font-bold border transition-all bg-rose-50 text-rose-800 border-rose-300 flex items-center gap-2';
                box.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-600 text-sm shrink-0"></i><span>${message}</span>`;
            }
        };

        window.handlePilgrimLogin = function (e) {
            if (e && e.preventDefault) e.preventDefault();
            const phone = document.getElementById('loginPhone') ? document.getElementById('loginPhone').value : '';
            const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';

            const res = loginPilgrim(phone, password);
            if (res.success) {
                window.showAuthAlert('success', `Alhamdulillah! Selamat datang kembali, ${res.user.fullName}.`);
                setTimeout(() => {
                    if (typeof window.backToAppHome === 'function') window.backToAppHome();
                    syncPilgrimUI();
                }, 600);
            } else {
                window.showAuthAlert('error', res.message);
            }
        };

        window.handlePilgrimRegister = function (e) {
            if (e && e.preventDefault) e.preventDefault();
            const fullName = document.getElementById('regFullName') ? document.getElementById('regFullName').value : '';
            const phone = document.getElementById('regPhone') ? document.getElementById('regPhone').value : '';
            const email = document.getElementById('regEmail') ? document.getElementById('regEmail').value : '';
            const password = document.getElementById('regPassword') ? document.getElementById('regPassword').value : '';

            const res = registerPilgrim({ fullName, phone, email, password });
            if (res.success) {
                window.showAuthAlert('success', `Akun berhasil dibuat! Selamat datang, ${res.user.fullName}.`);
                setTimeout(() => {
                    if (typeof window.backToAppHome === 'function') window.backToAppHome();
                    syncPilgrimUI();
                }, 600);
            } else {
                window.showAuthAlert('error', res.message);
            }
        };

        window.fillDemoAccountAndLogin = function () {
            const phoneInput = document.getElementById('loginPhone');
            const passInput = document.getElementById('loginPassword');
            if (phoneInput) phoneInput.value = '081298765432';
            if (passInput) passInput.value = '123456';
            const res = loginPilgrim('081298765432', '123456');
            if (res.success) {
                window.showAuthAlert('success', `Akun Demo aktif: ${res.user.fullName}`);
                setTimeout(() => {
                    if (typeof window.backToAppHome === 'function') window.backToAppHome();
                    syncPilgrimUI();
                }, 500);
            }
        };

        window.confirmLogoutPilgrim = function () {
            if (confirm('Apakah Anda yakin ingin keluar dari akun jamaah Anda?')) {
                logoutPilgrim();
                syncPilgrimUI();
                if (typeof window.showAuthAlert === 'function') {
                    window.showAuthAlert('success', 'Anda telah keluar dari akun.');
                }
            }
        };
    }

    return {
        roles: ROLES,
        getCurrentRole: getCurrentRole,
        setRole: setRole,
        applyPermissions: applyPermissions,
        switchAppTab: switchAppTab,
        // Pilgrim Auth API
        getPilgrimSession: getPilgrimSession,
        setPilgrimSession: setPilgrimSession,
        clearPilgrimSession: clearPilgrimSession,
        loginPilgrim: loginPilgrim,
        registerPilgrim: registerPilgrim,
        logoutPilgrim: logoutPilgrim,
        syncPilgrimUI: syncPilgrimUI,
        getAllPilgrimAccounts: getAllPilgrimAccounts,
        syncPilgrimRegistrationToBackend: syncPilgrimRegistrationToBackend
    };
});
