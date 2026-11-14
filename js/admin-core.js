/**
 * ====================================================================
 * SDW UMROH — ADMIN PORTAL & BACKOFFICE CONTROLLER (FACADE ORCHESTRATOR)
 * File: js/admin-core.js
 * Version: 2.7.0 (Fase 1-6 Decoupled Modular Architecture)
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: docs/03_USER_ROLES_AND_PERMISSIONS.md & docs/07_INFORMATION_ARCHITECTURE.md
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        // Node environment: load all sub-modules
        const admin = require('./admin/admin-state.js');
        require('./admin/admin-nav.js');
        require('./admin/admin-crm.js');
        require('./admin/admin-packages.js');
        require('./admin/admin-departures.js');
        require('./admin/admin-hotels.js');
        require('./admin/admin-airlines.js');
        require('./admin/admin-gallery.js');
        require('./admin/admin-articles.js');
        require('./admin/admin-faq.js');
        require('./admin/admin-users.js');
        require('./admin/admin-roles.js');
        require('./admin/admin-auth.js');
        require('./admin/admin-docs.js');
        require('./admin/admin-registrations.js');
        require('./admin/admin-finance.js');
        require('./admin/admin-operations.js');
        require('./admin/admin-certificates.js');
        require('./admin/admin-badal.js');
        require('./admin/admin-security.js');
        require('./admin/admin-sync.js');
        require('./admin/admin-export.js');
        module.exports = factory(admin);
    } else {
        root.SDW_ADMIN = root.SDW_ADMIN || {};
        factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (admin) {
    'use strict';

    admin = admin || {};

    /**
     * Inisialisasi Utama Seluruh Ekosistem Admin Portal
     */
    function init() {
        // 1. Inisialisasi Data Persistence Store
        if (typeof admin.initDataStore === 'function') {
            admin.initDataStore();
        }

        // 2. Ambil Sesi & Role Tersimpan (Autentikasi Terpadu DB_Users)
        if (typeof admin.checkAdminAuth === 'function') {
            admin.checkAdminAuth();
        } else if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.storage) {
            let savedRole = null;
            if (typeof sessionStorage !== 'undefined') savedRole = sessionStorage.getItem(APP_CONFIG.storage.keys.adminRole);
            if (!savedRole && typeof localStorage !== 'undefined') savedRole = localStorage.getItem(APP_CONFIG.storage.keys.adminRole);
            if (savedRole && admin.ADMIN_PERMISSIONS && admin.ADMIN_PERMISSIONS[savedRole]) {
                admin.currentRole = savedRole;
            }
        }

        // 3. Set Nilai Selector Role
        if (typeof document !== 'undefined') {
            const roleSelect = document.getElementById('adminRoleSelector');
            if (roleSelect) {
                roleSelect.value = admin.currentRole;
            }
        }

        // 4. Terapkan RBAC pada Sidebar & Header Profile UI
        if (typeof admin.updateHeaderProfileUI === 'function') {
            admin.updateHeaderProfileUI(admin.currentRole);
        }
        if (typeof admin.applyRolePermissions === 'function') {
            admin.applyRolePermissions(admin.currentRole);
        }

        // 5. Global Keyboard Shortcuts: Ctrl+K (Search), ESC (Close Modals/Drawers)
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', function (e) {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                    e.preventDefault();
                    if (typeof admin.openGlobalSearch === 'function') admin.openGlobalSearch();
                }
                if (e.key === 'Escape') {
                    if (typeof admin.closeGlobalSearch === 'function') admin.closeGlobalSearch();
                    if (typeof admin.closeDrawer === 'function') admin.closeDrawer();
                    if (typeof document !== 'undefined') {
                        document.querySelectorAll('.admin-modal').forEach(m => {
                            m.classList.remove('active');
                            m.classList.add('opacity-0', 'pointer-events-none');
                        });
                    }
                }
            });
        }

        // 6. Dual Clock Ticker (Makkah AST & Jakarta WIB)
        if (typeof admin.updateClocks === 'function') {
            admin.updateClocks();
            if (typeof setInterval !== 'undefined') setInterval(admin.updateClocks, 1000);
        }

        // 7. Render Tampilan Awal (Dashboard)
        if (typeof admin.switchTab === 'function') {
            admin.switchTab('tab-dashboard');
        }

        // 8. Inisialisasi Offline-First Mutation Sync Engine (Fase 4)
        if (typeof admin.initSyncEngine === 'function') {
            admin.initSyncEngine();
        }

        // 9. Inisialisasi Inactivity Screen Lock (Fase 6)
        if (typeof admin.initInactivityTracker === 'function') {
            admin.initInactivityTracker();
        }
    }

    // Attach init to admin
    admin.init = init;

    return admin;
});
