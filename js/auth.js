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

    // Role View Permission Mapping
    const PERMISSIONS = {
        'PILGRIM': ['tab-jamaah', 'tab-profile'],
        'SALES': ['tab-crm', 'tab-jamaah', 'tab-profile'],
        'DOCUMENT_OFFICER': ['tab-documents', 'tab-jamaah', 'tab-profile'],
        'FINANCE': ['tab-finance', 'tab-jamaah', 'tab-audit', 'tab-profile'],
        'OPERATIONS': ['tab-trips', 'tab-documents', 'tab-jamaah', 'tab-profile'],
        'TOUR_LEADER': ['tab-trips', 'tab-jamaah', 'tab-profile'],
        'MUTHAWWIF': ['tab-trips', 'tab-jamaah', 'tab-profile'],
        'PARTNER': ['tab-crm', 'tab-profile'],
        'ADMIN': ['tab-jamaah', 'tab-crm', 'tab-documents', 'tab-finance', 'tab-trips', 'tab-audit', 'tab-profile'],
        'MANAGER': ['tab-jamaah', 'tab-crm', 'tab-documents', 'tab-finance', 'tab-trips', 'tab-audit', 'tab-profile'],
        'OWNER': ['tab-jamaah', 'tab-crm', 'tab-documents', 'tab-finance', 'tab-trips', 'tab-audit', 'tab-profile']
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

    return {
        roles: ROLES,
        getCurrentRole: getCurrentRole,
        setRole: setRole,
        applyPermissions: applyPermissions,
        switchAppTab: switchAppTab
    };
});
