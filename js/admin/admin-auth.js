/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE AUTHENTICATION & LOGIN CONTROLLER
 * File: js/admin/admin-auth.js
 * Version: 2.5.1
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: Autentikasi Real Asnawiyyah (Email OTP & Login Cepat)
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

    let activeOtpEmail = '';
    let otpTimerInterval = null;

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

    function setAdminSession(user, remember = true) {
        if (!user) return;
        const session = {
            id: user.id || 'USR-000001',
            name: user.name || 'Administrator',
            email: user.email || 'admin@sdwumroh.com',
            phone: user.phone || '',
            role: (user.role || 'ADMIN').toUpperCase(),
            status: user.status || 'ACTIVE',
            connected_entity: user.connected_entity || 'Semua Sistem',
            token: user.token || ('SDW_ADM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8)),
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
                localStorage.setItem(SESSION_KEYS.TOKEN, session.token);
                localStorage.setItem('sdw_last_user', JSON.stringify({
                    name: session.name,
                    email: session.email,
                    role: session.role
                }));
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

        // Update session capsule text
        const badgeText = document.getElementById('headerRoleBadgeText');
        if (badgeText) {
            badgeText.textContent = session.name + ' (' + session.role + ')';
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

    // 2. Tab Switcher Controller: OTP vs Quick
    function switchLoginTab(tab) {
        const btnOtp = document.getElementById('tabBtnLoginOtp');
        const btnQuick = document.getElementById('tabBtnLoginQuick');
        const contentOtp = document.getElementById('loginTabContentOtp');
        const contentQuick = document.getElementById('loginTabContentQuick');
        const errEl = document.getElementById('adminLoginError');

        if (errEl) errEl.classList.add('hidden');

        if (tab === 'quick') {
            if (btnQuick) {
                btnQuick.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
                btnQuick.classList.remove('text-slate-500');
            }
            if (btnOtp) {
                btnOtp.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
                btnOtp.classList.add('text-slate-500');
            }
            if (contentQuick) contentQuick.classList.remove('hidden');
            if (contentOtp) contentOtp.classList.add('hidden');
        } else {
            if (btnOtp) {
                btnOtp.classList.add('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
                btnOtp.classList.remove('text-slate-500');
            }
            if (btnQuick) {
                btnQuick.classList.remove('bg-white', 'text-blue-600', 'shadow-xs', 'font-bold');
                btnQuick.classList.add('text-slate-500');
            }
            if (contentOtp) contentOtp.classList.remove('hidden');
            if (contentQuick) contentQuick.classList.add('hidden');
        }
    }

    // 3. OTP Flow: Step 1 Send OTP
    async function handleSendOtp() {
        const emailInput = document.getElementById('loginOtpEmailInput');
        const btn = document.getElementById('btnSendLoginOtp');
        const errEl = document.getElementById('adminLoginError');
        const errMsg = document.getElementById('adminLoginErrorMessage');

        const email = emailInput ? String(emailInput.value || '').trim().toLowerCase() : '';
        if (errEl) errEl.classList.add('hidden');

        if (!email) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Silakan masukkan alamat email resmi Anda.';
                errEl.classList.remove('hidden');
            }
            if (emailInput) emailInput.focus();
            return;
        }

        const originalBtnHtml = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Mengirim Kode OTP...';
        }

        try {
            let res = null;
            if (typeof SDW_API !== 'undefined' && SDW_API.post) {
                res = await SDW_API.post('sendLoginOtp', { email: email });
            } else {
                res = { success: true, message: 'Kode OTP telah dikirimkan ke email ' + email, debugOtpHint: '888999' };
            }

            const payloadData = (res && res.data) ? res.data : res;

            if (payloadData && (payloadData.success || payloadData.email)) {
                activeOtpEmail = email;
                const step1 = document.getElementById('otpStep1Container');
                const step2 = document.getElementById('otpStep2Container');
                const emailTargetText = document.getElementById('otpSentToEmailText');
                const otpInput = document.getElementById('loginOtpCodeInput');
                const otpAlertBox = document.getElementById('otpDeliveryAlertBox');

                if (emailTargetText) emailTargetText.textContent = email;
                if (step1) step1.classList.add('hidden');
                if (step2) step2.classList.remove('hidden');

                // Jika pengiriman email Google belum diotorisasi di akun pemilik script
                if (payloadData.emailSent === false && payloadData.debugOtpHint) {
                    if (otpAlertBox) {
                        otpAlertBox.innerHTML = '<div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">'
                            + '<div class="font-bold flex items-center gap-1.5 text-amber-800">'
                            + '<i class="fa-solid fa-triangle-exclamation text-amber-600"></i>'
                            + '<span>Izin Email Apps Script Belum Diotorisasi</span>'
                            + '</div>'
                            + '<p class="text-[11px] text-amber-900/90 leading-relaxed">'
                            + 'Akun Google pemilik script belum mereview izin kirim email (OAuth). Kode OTP Anda diisi otomatis: '
                            + '<strong class="font-mono text-sm text-blue-800 bg-white px-2 py-0.5 rounded-lg border border-amber-300 select-all font-bold">' + payloadData.debugOtpHint + '</strong>'
                            + '</p>'
                            + '</div>';
                        otpAlertBox.classList.remove('hidden');
                    }
                    if (otpInput) {
                        otpInput.value = payloadData.debugOtpHint;
                    }
                } else if (otpAlertBox) {
                    otpAlertBox.classList.add('hidden');
                }

                if (otpInput && !otpInput.value) {
                    otpInput.value = '';
                    setTimeout(() => otpInput.focus(), 150);
                }

                // Mulai Countdown Timer 5 Menit
                startOtpCountdown(300);

                if (typeof admin.showToast === 'function') {
                    if (payloadData.emailSent === false) {
                        admin.showToast('Kode OTP darurat disiapkan (Otorisasi email Google diperlukan)', 'warning');
                    } else {
                        admin.showToast('Kode OTP telah dikirim ke ' + email, 'success');
                    }
                }
            } else {
                const message = (payloadData && (payloadData.message || payloadData.error)) || 'Gagal mengirimkan kode OTP ke email tersebut.';
                if (errEl && errMsg) {
                    errMsg.textContent = message;
                    errEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Terjadi kesalahan sistem: ' + err.message;
                errEl.classList.remove('hidden');
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }
        }
    }

    function startOtpCountdown(seconds) {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        const countdownEl = document.getElementById('otpCountdownText');
        const resendBtn = document.getElementById('btnResendOtp');

        if (resendBtn) resendBtn.disabled = true;

        let remaining = seconds;
        function renderTimer() {
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            const str = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
            if (countdownEl) {
                countdownEl.innerHTML = 'Berlaku: <strong class="text-amber-600 font-mono">' + str + '</strong>';
            }
            if (remaining <= 0) {
                clearInterval(otpTimerInterval);
                if (countdownEl) countdownEl.innerHTML = '<span class="text-rose-600 font-bold">Kadaluarsa</span>';
                if (resendBtn) resendBtn.disabled = false;
            }
            remaining--;
        }
        renderTimer();
        otpTimerInterval = setInterval(renderTimer, 1000);
    }

    function resetOtpStep() {
        if (otpTimerInterval) clearInterval(otpTimerInterval);
        const step1 = document.getElementById('otpStep1Container');
        const step2 = document.getElementById('otpStep2Container');
        const errEl = document.getElementById('adminLoginError');

        if (errEl) errEl.classList.add('hidden');
        if (step2) step2.classList.add('hidden');
        if (step1) step1.classList.remove('hidden');

        const emailInput = document.getElementById('loginOtpEmailInput');
        if (emailInput) setTimeout(() => emailInput.focus(), 100);
    }

    // 4. OTP Flow: Step 2 Verify OTP
    async function handleVerifyOtp() {
        const otpInput = document.getElementById('loginOtpCodeInput');
        const btn = document.getElementById('btnVerifyLoginOtp');
        const errEl = document.getElementById('adminLoginError');
        const errMsg = document.getElementById('adminLoginErrorMessage');

        const otp = otpInput ? String(otpInput.value || '').trim().replace(/[^0-9]/g, '') : '';
        if (errEl) errEl.classList.add('hidden');

        if (!otp || otp.length < 6) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Masukkan 6 digit angka kode OTP secara lengkap.';
                errEl.classList.remove('hidden');
            }
            if (otpInput) otpInput.focus();
            return;
        }

        const originalBtnHtml = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memverifikasi OTP...';
        }

        try {
            let res = null;
            if (typeof SDW_API !== 'undefined' && SDW_API.post) {
                res = await SDW_API.post('verifyLoginOtp', { email: activeOtpEmail, otp: otp });
            } else {
                res = { success: true, data: { user: { id: 'USR-000001', name: 'Admin', role: 'ADMIN', email: activeOtpEmail } } };
            }

            const payloadData = (res && res.data) ? res.data : res;

            if (payloadData && (payloadData.success !== false) && payloadData.user) {
                const user = payloadData.user;
                if (payloadData.permissions && admin.ROLE_PERMISSIONS) {
                    admin.ROLE_PERMISSIONS[user.role] = payloadData.permissions;
                }
                const session = setAdminSession(user, true);

                closeLoginModal();
                if (typeof admin.showToast === 'function') {
                    admin.showToast('Login berhasil! Selamat datang, ' + session.name, 'success');
                }
                if (typeof admin.switchTab === 'function') {
                    admin.switchTab('tab-dashboard');
                }
            } else {
                const message = (payloadData && (payloadData.message || payloadData.error)) || 'Kode OTP salah atau kadaluarsa.';
                if (errEl && errMsg) {
                    errMsg.textContent = message;
                    errEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Terjadi kesalahan sistem: ' + err.message;
                errEl.classList.remove('hidden');
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }
        }
    }

    // 5. Method 2: Quick Login by Email (1-Klik Akun Tanpa OTP)
    function updateContinueAsCard() {
        if (typeof document === 'undefined') return;
        const avatarEl = document.getElementById('quickLoginAvatar');
        const nameEl = document.getElementById('quickLoginName');
        const emailEl = document.getElementById('quickLoginEmailDisplay');
        const btnContinue = document.getElementById('btnContinueAsUser');

        let user = null;
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem('sdw_last_user');
                if (raw) user = JSON.parse(raw);
            }
        } catch (_) {}

        if (!user || !user.email) {
            user = {
                name: 'H. Ahmad Fauzi (Admin)',
                email: 'admin@sdwumroh.com',
                role: 'ADMIN'
            };
        }

        const initial = (user.name || 'Admin').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'AF';
        if (avatarEl) avatarEl.textContent = initial;
        if (nameEl) nameEl.textContent = user.name;
        if (emailEl) emailEl.textContent = user.email;
        if (btnContinue) {
            btnContinue.setAttribute('data-email', user.email);
        }
    }

    function handleContinueAsClick() {
        const btnContinue = document.getElementById('btnContinueAsUser');
        const email = btnContinue ? (btnContinue.getAttribute('data-email') || 'admin@sdwumroh.com') : 'admin@sdwumroh.com';
        handleQuickLogin(email);
    }

    function toggleOtherAccounts() {
        const container = document.getElementById('containerOtherAccounts');
        if (container) {
            container.classList.toggle('hidden');
        }
    }

    async function handleQuickLogin(explicitEmail) {
        const errEl = document.getElementById('adminLoginError');
        const errMsg = document.getElementById('adminLoginErrorMessage');
        const btnContinue = document.getElementById('btnContinueAsUser');

        let email = '';
        if (typeof explicitEmail === 'string' && explicitEmail.trim()) {
            email = explicitEmail.trim().toLowerCase();
        } else {
            const input = document.getElementById('quickLoginCustomEmailInput');
            if (input && input.value) {
                email = String(input.value).trim().toLowerCase();
            } else if (btnContinue) {
                email = btnContinue.getAttribute('data-email') || 'admin@sdwumroh.com';
            }
        }

        if (errEl) errEl.classList.add('hidden');

        if (!email) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Silakan pilih atau ketikkan email staf terdaftar di DB_Users.';
                errEl.classList.remove('hidden');
            }
            return;
        }

        const originalBtnHtml = btnContinue ? btnContinue.innerHTML : '';
        if (btnContinue) {
            btnContinue.disabled = true;
            btnContinue.classList.add('opacity-75', 'cursor-wait');
        }

        try {
            let res = null;
            if (typeof SDW_API !== 'undefined' && SDW_API.post) {
                res = await SDW_API.post('quickLoginByEmail', { email: email });
            } else {
                res = { success: true, data: { user: { id: 'USR-000001', name: 'Admin', role: 'ADMIN', email: email } } };
            }

            const payloadData = (res && res.data) ? res.data : res;

            if (payloadData && (payloadData.success !== false) && payloadData.user) {
                const user = payloadData.user;
                if (payloadData.permissions && admin.ROLE_PERMISSIONS) {
                    admin.ROLE_PERMISSIONS[user.role] = payloadData.permissions;
                }
                const session = setAdminSession(user, true);

                closeLoginModal();
                if (typeof admin.showToast === 'function') {
                    admin.showToast('Login instan berhasil! Selamat bertugas, ' + session.name, 'success');
                }
                if (typeof admin.switchTab === 'function') {
                    admin.switchTab('tab-dashboard');
                }
            } else {
                const message = (payloadData && (payloadData.message || payloadData.error)) || 'Email tersebut tidak terdaftar di sistem DB_Users.';
                if (errEl && errMsg) {
                    errMsg.textContent = message;
                    errEl.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (errEl && errMsg) {
                errMsg.textContent = 'Terjadi kesalahan sistem: ' + err.message;
                errEl.classList.remove('hidden');
            }
        } finally {
            if (btnContinue) {
                btnContinue.disabled = false;
                btnContinue.classList.remove('opacity-75', 'cursor-wait');
            }
        }
    }

    // 6. Modal Controls
    function openLoginModal(options = {}) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalAdminLogin');
        if (!modal) return;

        resetOtpStep();
        updateContinueAsCard();
        switchLoginTab('quick'); // Default tab: 1-Klik Akun persis RMI NU Demak

        const errEl = document.getElementById('adminLoginError');
        if (errEl) errEl.classList.add('hidden');

        modal.classList.add('active', 'opacity-100', 'pointer-events-auto');
        modal.classList.remove('opacity-0', 'pointer-events-none');

        const card = modal.querySelector('div');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
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

    function handleCloseLoginModal() {
        const session = getAdminSession();
        if (session && session.role) {
            closeLoginModal();
        } else {
            // Pengguna belum login, arahkan kembali ke web publik
            if (typeof window !== 'undefined') {
                window.location.href = 'index.html';
            }
        }
    }

    function checkAdminAuth(options = { autoPrompt: true }) {
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
            const badgeText = document.getElementById('headerRoleBadgeText');
            if (badgeText) {
                badgeText.textContent = session.name + ' (' + session.role + ')';
            }
            return true;
        }

        // Jika belum ada sesi dan autoPrompt true, tampilkan popup login otomatis
        if (options && options.autoPrompt !== false) {
            setTimeout(() => {
                openLoginModal();
            }, 100);
        }
        return false;
    }

    function switchAccount() {
        openLoginModal();
    }

    function openProfileModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalUserProfile');
        if (!modal) return;

        const session = getAdminSession() || admin.currentUser;
        const role = (session && session.role ? session.role : admin.currentRole || 'ADMIN').toUpperCase();

        const avatarEl = document.getElementById('profileModalAvatar');
        const nameEl = document.getElementById('profileModalName');
        const roleEl = document.getElementById('profileModalRoleBadge');
        const emailEl = document.getElementById('profileModalEmail');
        const phoneEl = document.getElementById('profileModalPhone');
        const idEl = document.getElementById('profileModalUserId');
        const entityEl = document.getElementById('profileModalConnectedEntity');

        if (avatarEl) avatarEl.textContent = (session && session.name ? session.name.substring(0, 2).toUpperCase() : 'AD');
        if (nameEl) nameEl.textContent = session ? session.name : 'Administrator';
        if (roleEl) roleEl.textContent = role;
        if (emailEl) emailEl.textContent = session ? session.email : 'admin@sdwumroh.com';
        if (phoneEl) phoneEl.textContent = (session && session.phone) ? session.phone : '-';
        if (idEl) idEl.textContent = session ? session.id : 'USR-000001';
        if (entityEl) entityEl.textContent = (session && session.connected_entity) ? session.connected_entity : 'Semua Sistem';

        modal.classList.add('active', 'opacity-100', 'pointer-events-auto');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function closeProfileModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalUserProfile');
        if (!modal) return;
        modal.classList.remove('active', 'opacity-100', 'pointer-events-auto');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }

    // Attach to admin namespace
    admin.SESSION_KEYS = SESSION_KEYS;
    admin.getAdminSession = getAdminSession;
    admin.setAdminSession = setAdminSession;
    admin.clearAdminSession = clearAdminSession;
    admin.openLoginModal = openLoginModal;
    admin.closeLoginModal = closeLoginModal;
    admin.handleCloseLoginModal = handleCloseLoginModal;
    admin.checkAdminAuth = checkAdminAuth;
    admin.switchAccount = switchAccount;
    admin.openProfileModal = openProfileModal;
    admin.closeProfileModal = closeProfileModal;
    admin.updateContinueAsCard = updateContinueAsCard;
    admin.handleContinueAsClick = handleContinueAsClick;
    admin.toggleOtherAccounts = toggleOtherAccounts;

    return {
        SESSION_KEYS,
        getAdminSession,
        setAdminSession,
        clearAdminSession,
        openLoginModal,
        closeLoginModal,
        handleCloseLoginModal,
        checkAdminAuth,
        switchAccount,
        openProfileModal,
        closeProfileModal,
        switchLoginTab,
        handleSendOtp,
        handleVerifyOtp,
        resetOtpStep,
        handleQuickLogin,
        updateContinueAsCard,
        handleContinueAsClick,
        toggleOtherAccounts
    };
});
