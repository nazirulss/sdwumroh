/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: AUDIT LOGS & PIN SCREEN LOCK
 * File: js/admin/admin-security.js
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

    function logAdminAudit(action, entity, ref, desc, severity) {
        if (!severity) {
            if (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(action)) {
                severity = 'CRITICAL';
            } else if (['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(action)) {
                severity = 'WARNING';
            } else {
                severity = 'INFO';
            }
        }
        const newLog = {
            id: `AUD-00${admin.auditLogs.length + 196}`,
            time: 'Baru saja',
            actor: `${admin.currentRole.replace('_', ' ')} (SDW Staf)`,
            action: action,
            severity: severity,
            entity: entity,
            ref: ref,
            desc: desc
        };
        admin.auditLogs.unshift(newLog);
        admin.persistStorage(admin.STORAGE_KEYS.AUDIT, admin.auditLogs);
    }

    // ====================================================================
    // FASE 5: LOGISTIK & PERLENGKAPAN KOPER JAMAAH
    // ====================================================================

    function renderAuditLogs() {
        const tbody = document.getElementById('audit-logs-table-tbody');
        if (!tbody) return;

        const filtered = admin.auditLogs.filter(a => {
            const query = (admin.auditFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (a.actor && a.actor.toLowerCase().includes(query)) ||
                (a.ref && a.ref.toLowerCase().includes(query)) ||
                (a.desc && a.desc.toLowerCase().includes(query)) ||
                (a.entity && a.entity.toLowerCase().includes(query));
            const matchAction = (!admin.auditFilter.action || admin.auditFilter.action === 'ALL') || (a.action === admin.auditFilter.action);
            const sev = a.severity || (
                ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
            );
            const matchSeverity = (!admin.auditFilter.severity || admin.auditFilter.severity === 'ALL') || (sev === admin.auditFilter.severity);
            return matchSearch && matchAction && matchSeverity;
        });

        const badgeEl = document.getElementById('audit-count-badge');
        if (badgeEl) {
            badgeEl.innerText = `Menampilkan ${filtered.length} dari ${admin.auditLogs.length} log`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-shield-halved text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada log audit yang sesuai filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(a => {
            const sev = a.severity || (
                ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
            );
            let sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">INFO</span>';
            if (sev === 'CRITICAL') {
                sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>';
            } else if (sev === 'WARNING') {
                sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">WARNING</span>';
            }

            return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(a.id)}</td>
                <td class="py-3 px-4 text-slate-500 whitespace-nowrap">${admin.escapeHtml(a.time)}</td>
                <td class="py-3 px-4 font-bold text-slate-800">${admin.escapeHtml(a.actor)}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                        ${sevBadge}
                        <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">${admin.escapeHtml(a.action)}</span>
                    </div>
                </td>
                <td class="py-3 px-4 font-mono text-purple-900 font-semibold">${admin.escapeHtml(a.entity)}</td>
                <td class="py-3 px-4 font-mono text-slate-600">${admin.escapeHtml(a.ref)}</td>
                <td class="py-3 px-4 text-slate-700 max-w-xs truncate" title="${admin.escapeHtml(a.desc)}">${admin.escapeHtml(a.desc)}</td>
            </tr>
            `;
        }).join('');
    }

    function applyAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');
        const severitySelect = document.getElementById('audit-filter-severity');

        admin.auditFilter.search = searchInput ? searchInput.value : '';
        admin.auditFilter.action = actionSelect ? actionSelect.value : 'ALL';
        admin.auditFilter.severity = severitySelect ? severitySelect.value : 'ALL';

        renderAuditLogs();
    }

    function resetAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');
        const severitySelect = document.getElementById('audit-filter-severity');

        if (searchInput) searchInput.value = '';
        if (actionSelect) actionSelect.value = 'ALL';
        if (severitySelect) severitySelect.value = 'ALL';

        admin.auditFilter = { search: '', action: 'ALL', severity: 'ALL' };
        renderAuditLogs();
    }

    // ====================================================================
    // FASE 2: BUSINESS INTELLIGENCE CSV EXPORT ENGINE
    // ====================================================================

    function initInactivityTracker() {
        const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
        const resetTimer = () => {
            if (admin.isScreenLocked) return;
            if (admin.inactivityTimer) clearTimeout(admin.inactivityTimer);
            // 15 menit timeout
            admin.inactivityTimer = setTimeout(() => {
                lockScreen(true);
            }, 15 * 60 * 1000);
        };

        events.forEach(evt => {
            window.addEventListener(evt, resetTimer, { passive: true });
        });
        resetTimer();
    }

    function lockScreen(isAuto = false) {
        admin.isScreenLocked = true;
        const modal = document.getElementById('modalScreenLock');
        const roleBadge = document.getElementById('lockScreenRoleBadge');
        const pinInput = document.getElementById('lockScreenPin');
        const errEl = document.getElementById('lockScreenError');

        if (roleBadge) {
            roleBadge.innerText = `${admin.currentRole.replace('_', ' ')} (Akses Aktif)`;
        }
        if (pinInput) {
            pinInput.value = '';
        }
        if (errEl) {
            errEl.classList.add('hidden');
        }

        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100', 'pointer-events-auto');
            const inner = modal.querySelector('div');
            if (inner && inner.classList) {
                inner.classList.remove('scale-95');
                inner.classList.add('scale-100');
            }
            if (pinInput) {
                setTimeout(() => pinInput.focus(), 100);
            }
        }

        if (isAuto) {
            logAdminAudit('AUTO_LOCK_INACTIVITY', 'SYSTEM_SECURITY', 'AUTO_TIMEOUT', 'Layar portal terkunci otomatis setelah 15 menit tidak ada aktivitas staf demi kepatuhan keamanan data.', 'INFO');
        } else {
            logAdminAudit('MANUAL_SCREEN_LOCK', 'SYSTEM_SECURITY', 'MANUAL_LOCK', 'Staf mengunci layar portal admin secara manual.', 'INFO');
            admin.showToast('🔒 Layar portal berhasil dikunci.');
        }
        renderAuditLogs();
    }

    function unlockScreen() {
        const pinInput = document.getElementById('lockScreenPin');
        const errEl = document.getElementById('lockScreenError');
        const modal = document.getElementById('modalScreenLock');

        const enteredPin = pinInput ? pinInput.value.trim() : '';

        if (enteredPin === admin.MASTER_PIN) {
            admin.isScreenLocked = false;
            if (modal) {
                modal.classList.remove('opacity-100', 'pointer-events-auto');
                modal.classList.add('opacity-0', 'pointer-events-none');
                const inner = modal.querySelector('div');
                if (inner && inner.classList) {
                    inner.classList.remove('scale-100');
                    inner.classList.add('scale-95');
                }
            }
            if (pinInput) pinInput.value = '';
            if (errEl) errEl.classList.add('hidden');

            logAdminAudit('SCREEN_UNLOCKED', 'SYSTEM_SECURITY', 'PIN_VERIFIED', 'Sesi portal berhasil dibuka kembali dengan otentikasi PIN keamanan yang sah.', 'INFO');
            admin.showToast('🔓 Sesi portal aktif kembali.');
            renderAuditLogs();
            initInactivityTracker();
        } else {
            if (errEl) errEl.classList.remove('hidden');
            if (pinInput) {
                pinInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-200');
                setTimeout(() => {
                    pinInput.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200');
                }, 1500);
                pinInput.focus();
            }
            logAdminAudit('FAILED_UNLOCK_ATTEMPT', 'SYSTEM_SECURITY', 'WRONG_PIN', 'Percobaan membuka kunci layar gagal dengan PIN yang tidak sesuai.', 'WARNING');
            renderAuditLogs();
        }
    }

    function appendLockPin(digit) {
        const pinInput = document.getElementById('lockScreenPin');
        if (pinInput && pinInput.value.length < 6) {
            pinInput.value += digit;
        }
    }

    function clearLockPin() {
        const pinInput = document.getElementById('lockScreenPin');
        if (pinInput) {
            pinInput.value = '';
        }
        const errEl = document.getElementById('lockScreenError');
        if (errEl) errEl.classList.add('hidden');
    }

    function handleUnlock(e) {
        if (e && e.preventDefault) e.preventDefault();
        unlockScreen();
    }

    function exportSecurityIncidents() {
        if (typeof admin.exportToCSV === 'function') admin.exportToCSV('SECURITY');
    }

    // ====================================================================
    // DRAWER & QUICK SEARCH
    // ====================================================================

    // Attach all exported functions to admin
    admin.logAdminAudit = logAdminAudit;
    admin.renderAuditLogs = renderAuditLogs;
    admin.applyAuditFilter = applyAuditFilter;
    admin.resetAuditFilter = resetAuditFilter;
    admin.initInactivityTracker = initInactivityTracker;
    admin.lockScreen = lockScreen;
    admin.unlockScreen = unlockScreen;
    admin.appendLockPin = appendLockPin;
    admin.clearLockPin = clearLockPin;
    admin.handleUnlock = handleUnlock;
    admin.exportSecurityIncidents = exportSecurityIncidents;

    return admin;
});
