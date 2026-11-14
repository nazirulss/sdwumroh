/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE AUTHENTICATION & LOGIN CONTROLLER
 * File: js/admin/admin-auth.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: Autentikasi Staf & Administrator Terpadu DB_Users
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_AUTH = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || (typeof window !== 'undefined' ? window.SDW_ADMIN : {}) || {};

    const SESSION_KEYS = {
        SESSION: 'sdw_admin_session',
        ROLE: 'sdw_admin_role',
        TOKEN: 'sdw_admin_token'
    };

    // 1. Session Storage Helpers
    function getAdminSession() {
        try {
            if (typeof sessionStorage !== 'undefined') {
                const s = sessionStorage.getItem(SESSION_KEYS.SESSION);
                if (s) return JSON.parse(s);
            }
            if (typeof localStorage !== 'undefined') {
                const l = localStorage.getItem(SESSION_KEYS.SESSION);
                if (l) return JSON.parse(l);
            }
        } catch (e) {
            console.warn('[SDW_AUTH] Gagal membaca session:', e);
        }
        return null;
    }

    function setAdminSession(user, remember = false) {
        if (!user) return;
        const session = {
            id: user.id || 'USR-000001',
            name: user.name || 'Administrator',
            email: user.email || 'admin@sdwumroh.com',
            phone: user.phone || '',
            role: (user.role || 'ADMIN').toUpperCase(),
            status: user.status || 'ACTIVE',
            connected_entity: user.connected_entity || 'Semua Sistem',
            token: 'SDW_ADM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
            loggedInAt: new Date().toISOString()
        };

        try {
            const raw = JSON.stringify(session);
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(SESSION_KEYS.SESSION, raw);
                sessionStorage.setItem(SESSION_KEYS.ROLE, session.role);
                sessionStorage.setItem(SESSION_KEYS.TOKEN, session.token);
            }
            if (remember && typeof localStorage !== 'undefined') {
                localStorage.setItem(SESSION_KEYS.SESSION, raw);
                localStorage.setItem(SESSION_KEYS.ROLE, session.role);
            }
        } catch (e) {
            console.warn('[SDW_AUTH] Gagal menyimpan session:', e);
        }

        admin.currentRole = session.role;
        admin.currentUser = session;

        if (typeof admin.updateHeaderProfileUI === 'function') {
            admin.updateHeaderProfileUI(session.role);
        }
        if (typeof admin.applyRolePermissions === 'function') {
            admin.applyRolePermissions(session.role);
        }

        return session;
    }

    function clearAdminSession() {
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem(SESSION_KEYS.SESSION);
                sessionStorage.removeItem(SESSION_KEYS.ROLE);
                sessionStorage.removeItem(SESSION_KEYS.TOKEN);
            }
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(SESSION_KEYS.SESSION);
                localStorage.removeItem(SESSION_KEYS.ROLE);
                localStorage.removeItem(SESSION_KEYS.TOKEN);
            }
        } catch (_) {}
        admin.currentUser = null;
    }

    // 2. Local Users Resolver
    function getAvailableUsers() {
        if (typeof admin.getStoredUsers === 'function') {
            return admin.getStoredUsers();
        }
        if (typeof localStorage !== 'undefined') {
            try {
                const raw = localStorage.getItem('sdw_admin_users');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (_) {}
        }
        return [
            { id: 'USR-000001', name: 'Super Administrator', email: 'admin@sdwumroh.com', phone: '6281234567890', role: 'SUPER_ADMIN', status: 'ACTIVE' },
            { id: 'USR-000002', name: 'H. Ahmad Fauzi (Admin Operasional)', email: 'ops@sdwumroh.com', phone: '6281122334455', role: 'ADMIN', status: 'ACTIVE' },
            { id: 'USR-000003', name: 'H. Muhammad Syarif (Direktur Utama)', email: 'syarif@sdwumroh.com', phone: '6281299887766', role: 'DIRECTOR', status: 'ACTIVE' },
            { id: 'USR-000004', name: 'Hj. Fatimah Zahra (Finance & Kasir)', email: 'finance@sdwumroh.com', phone: '6281355667788', role: 'FINANCE', status: 'ACTIVE' },
            { id: 'USR-000005', name: 'Ustadz Dr. Abdullah (Muthawwif Senior)', email: 'muthawwif@sdwumroh.com', phone: '6281788990011', role: 'MUTHAWWIF', status: 'ACTIVE' },
            { id: 'USR-000006', name: 'Budi Santoso (Senior Sales Consultant)', email: 'sales@sdwumroh.com', phone: '6281566778899', role: 'SALES', status: 'ACTIVE' },
            { id: 'USR-000007', name: 'Siti Aisyah (Akun Jamaah Umroh)', email: 'aisyah@gmail.com', phone: '6281233445566', role: 'PILGRIM', status: 'ACTIVE' }
        ];
    }

    // 3. Authenticate against DB_Users
    async function loginAdminAsync(identifier, password, remember = false) {
        identifier = String(identifier || '').trim().toLowerCase();
        password = String(password || '').trim();

        if (!identifier) {
            return { success: false, message: 'Email / ID Pengguna / No. WhatsApp wajib diisi.' };
        }
        if (!password) {
            return { success: false, message: 'Kata sandi keamanan wajib diisi.' };
        }

        const users = getAvailableUsers();
        const cleanIdentDigits = identifier.replace(/[^0-9]/g, '');

        let found = users.find(u => {
            const email = String(u.email || '').toLowerCase().trim();
            const id = String(u.id || '').toLowerCase().trim();
            const phone = String(u.phone || '').replace(/[^0-9]/g, '');
            return email === identifier || id === identifier || (cleanIdentDigits && cleanIdentDigits.length >= 6 && phone.endsWith(cleanIdentDigits));
        });

        // Jika tidak ditemukan di lokal, coba panggil Google Apps Script API jika online
        if (!found && typeof fetch !== 'undefined' && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.appsScriptUrl) {
            try {
                const res = await fetch(`${APP_CONFIG.appsScriptUrl}?action=adminLogin&identifier=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`);
                const json = await res.json();
                if (json && json.success && json.data && json.data.user) {
                    const session = setAdminSession(json.data.user, remember);
                    if (typeof admin.logAdminAudit === 'function') {
                        admin.logAdminAudit('USER_LOGIN', 'AUTH_PORTAL', json.data.user.id, `Pengguna ${json.data.user.name} berhasil login via Cloud DB_Users.`, 'INFO');
                    }
                    return { success: true, user: session };
                } else if (json && json.message) {
                    return { success: false, message: json.message };
                }
            } catch (err) {
                console.warn('[SDW_AUTH] Cloud API login fallback gagal:', err);
            }
        }

        if (!found) {
            return {
                success: false,
                message: 'Akun dengan email / No. HP tersebut tidak ditemukan di master DB_Users.'
            };
        }

        // Cek status keaktifan akun
        if (String(found.status).toUpperCase() === 'INACTIVE') {
            return {
                success: false,
                message: 'Akun Anda dinonaktifkan oleh administrator. Hubungi Super Administrator untuk memulihkan akses.'
            };
        }

        // Validasi kata sandi (dukung password akun terdaftar atau default pass 'admin123' / 'sdw123' / '123456' / '1234')
        const validPassword = found.password ?
            (found.password === password) :
            (password === 'admin123' || password === 'sdw123' || password === '123456' || password === '1234');

        if (!validPassword) {
            return {
                success: false,
                message: 'Kata sandi keamanan yang Anda masukkan salah. Gunakan default: admin123'
            };
        }

        // Login Berhasil
        const session = setAdminSession(found, remember);

        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit('USER_LOGIN', 'AUTH_PORTAL', found.id, `Pengguna ${found.name} (${found.role}) berhasil masuk ke portal administrasi.`, 'INFO');
        }

        return { success: true, user: session };
    }

    // 4. Modal UI Controls
    function openLoginModal(options = {}) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalAdminLogin');
        if (!modal) return;

        const idInput = document.getElementById('adminLoginIdentifier');
        const passInput = document.getElementById('adminLoginPassword');
        const errEl = document.getElementById('adminLoginError');

        if (idInput && !options.keepValues) idInput.value = '';
        if (passInput && !options.keepValues) passInput.value = '';
        if (errEl) errEl.classList.add('hidden');

        if (options.prefillRole) {
            quickFillLogin(options.prefillRole);
        }

        modal.classList.add('active', 'opacity-100', 'pointer-events-auto');
        modal.classList.remove('opacity-0', 'pointer-events-none');

        const card = modal.querySelector('div');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }

        if (idInput) {
            setTimeout(() => idInput.focus(), 150);
        }
    }

    function closeLoginModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalAdminLogin');
        if (!modal) return;

        modal.classList.remove('active', 'opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');

        const card = modal.querySelector('div');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
    }

    function toggleLoginPasswordVisibility() {
        if (typeof document === 'undefined') return;
        const passInput = document.getElementById('adminLoginPassword');
        const eyeIcon = document.getElementById('adminLoginEyeIcon');
        if (!passInput) return;

        if (passInput.type === 'password') {
            passInput.type = 'text';
            if (eyeIcon) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            }
        } else {
            passInput.type = 'password';
            if (eyeIcon) {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        }
    }

    function quickFillLogin(roleKey) {
        if (typeof document === 'undefined') return;
        const users = getAvailableUsers();
        const role = String(roleKey || 'SUPER_ADMIN').toUpperCase();
        const user = users.find(u => String(u.role).toUpperCase() === role) || users[0];

        const idInput = document.getElementById('adminLoginIdentifier');
        const passInput = document.getElementById('adminLoginPassword');
        const errEl = document.getElementById('adminLoginError');

        if (idInput && user) {
            idInput.value = user.email || user.phone || user.id;
            idInput.classList.add('bg-emerald-50', 'ring-2', 'ring-emerald-200');
            setTimeout(() => idInput.classList.remove('bg-emerald-50', 'ring-2', 'ring-emerald-200'), 800);
        }
        if (passInput) {
            passInput.value = 'admin123';
            passInput.classList.add('bg-emerald-50', 'ring-2', 'ring-emerald-200');
            setTimeout(() => passInput.classList.remove('bg-emerald-50', 'ring-2', 'ring-emerald-200'), 800);
        }
        if (errEl) errEl.classList.add('hidden');

        const submitBtn = document.getElementById('btnAdminLoginSubmit');
        if (submitBtn) submitBtn.focus();
    }

    async function handleAdminLogin(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const idInput = document.getElementById('adminLoginIdentifier');
        const passInput = document.getElementById('adminLoginPassword');
        const rememberChk = document.getElementById('adminLoginRemember');
        const errEl = document.getElementById('adminLoginError');
        const submitBtn = document.getElementById('btnAdminLoginSubmit');

        const identifier = idInput ? idInput.value : '';
        const password = passInput ? passInput.value : '';
        const remember = rememberChk ? rememberChk.checked : false;

        if (errEl) errEl.classList.add('hidden');

        let originalBtnHtml = '';
        if (submitBtn) {
            originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memverifikasi Kredensial...';
        }

        try {
            const res = await loginAdminAsync(identifier, password, remember);
            if (res.success) {
                closeLoginModal();
                if (typeof admin.showToast === 'function') {
                    admin.showToast(`Selamat datang kembali, ${res.user.name}! Sesi aktif sebagai ${res.user.role.replace('_', ' ')}.`, 'success');
                }
                if (typeof admin.switchTab === 'function') {
                    admin.switchTab('tab-dashboard');
                }
            } else {
                if (errEl) {
                    errEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-rose-500"></i> ${admin.escapeHtml ? admin.escapeHtml(res.message) : res.message}`;
                    errEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (errEl) {
                errEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-rose-500"></i> Terjadi kesalahan sistem: ${err.message}`;
                errEl.classList.remove('hidden');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    }

    function checkAdminAuth(options = { autoPrompt: false }) {
        const session = getAdminSession();
        if (session && session.role) {
            admin.currentRole = session.role;
            admin.currentUser = session;
            if (typeof admin.updateHeaderProfileUI === 'function') {
                admin.updateHeaderProfileUI(session.role);
            }
            if (typeof admin.applyRolePermissions === 'function') {
                admin.applyRolePermissions(session.role);
            }
            return true;
        }

        if (options.autoPrompt) {
            openLoginModal();
        }
        return false;
    }

    function switchAccount() {
        openLoginModal({ prefillRole: null, keepValues: false });
    }

    // Attach to admin namespace
    admin.SESSION_KEYS = SESSION_KEYS;
    admin.getAdminSession = getAdminSession;
    admin.setAdminSession = setAdminSession;
    admin.clearAdminSession = clearAdminSession;
    admin.loginAdminAsync = loginAdminAsync;
    admin.openLoginModal = openLoginModal;
    admin.closeLoginModal = closeLoginModal;
    admin.toggleLoginPasswordVisibility = toggleLoginPasswordVisibility;
    admin.quickFillLogin = quickFillLogin;
    admin.handleAdminLogin = handleAdminLogin;
    admin.checkAdminAuth = checkAdminAuth;
    admin.switchAccount = switchAccount;

    return {
        SESSION_KEYS,
        getAdminSession,
        setAdminSession,
        clearAdminSession,
        loginAdminAsync,
        openLoginModal,
        closeLoginModal,
        toggleLoginPasswordVisibility,
        quickFillLogin,
        handleAdminLogin,
        checkAdminAuth,
        switchAccount
    };
});
