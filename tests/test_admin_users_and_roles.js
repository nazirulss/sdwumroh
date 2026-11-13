/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - MANAJEMEN PENGGUNA & MANAJEMEN PERAN RBAC
 * File: tests/test_admin_users_and_roles.js
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Manajemen Pengguna & Manajemen Peran RBAC...\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(`  ✅ PASS: ${name}`);
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
        }
    }

    const root = path.resolve(__dirname, '..');

    // 1. Verifikasi Keberadaan File Esensial
    test('File-file esensial modul Pengguna & RBAC harus tersedia', () => {
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-users.js')), 'admin-users.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-roles.js')), 'admin-roles.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-state.js')), 'admin-state.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-nav.js')), 'admin-nav.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Setup.gs')), 'Setup.gs tidak ditemukan');
    });

    // 2. Verifikasi UI Admin Sidebar, Tab Containers & Modals
    test('admin.html harus memuat menu sidebar, tab containers, dan modals', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('data-admin-tab="tab-users"'), 'Sidebar button tab-users tidak ditemukan');
        assert.ok(adminHtml.includes('data-admin-tab="tab-roles"'), 'Sidebar button tab-roles tidak ditemukan');
        assert.ok(adminHtml.includes('id="tab-users"'), 'Tab container #tab-users tidak ditemukan');
        assert.ok(adminHtml.includes('id="tab-roles"'), 'Tab container #tab-roles tidak ditemukan');
        assert.ok(adminHtml.includes('id="usersTableBody"'), 'Tabel #usersTableBody tidak ditemukan');
        assert.ok(adminHtml.includes('id="rbacTableHead"'), 'Tabel #rbacTableHead tidak ditemukan');
        assert.ok(adminHtml.includes('id="rbacTableBody"'), 'Tabel #rbacTableBody tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalUserEditor"'), 'Modal #modalUserEditor tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalRbacGuide"'), 'Modal #modalRbacGuide tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-users.js?v=1.0.0"'), 'Script tag admin-users.js tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-roles.js?v=1.0.0"'), 'Script tag admin-roles.js tidak ditemukan');
    });

    // 3. Verifikasi Logika Controller admin-users.js
    test('admin-users.js harus mengekspor fungsi-fungsi manajemen pengguna lengkap', () => {
        const scriptCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-users.js'), 'utf8');
        assert.ok(scriptCode.includes('renderUsers'), 'renderUsers tidak ditemukan');
        assert.ok(scriptCode.includes('renderUsersTable'), 'renderUsersTable tidak ditemukan');
        assert.ok(scriptCode.includes('switchUserRoleTab'), 'switchUserRoleTab tidak ditemukan');
        assert.ok(scriptCode.includes('applyUsersFilter'), 'applyUsersFilter tidak ditemukan');
        assert.ok(scriptCode.includes('openUserModal'), 'openUserModal tidak ditemukan');
        assert.ok(scriptCode.includes('closeUserModal'), 'closeUserModal tidak ditemukan');
        assert.ok(scriptCode.includes('saveUser'), 'saveUser tidak ditemukan');
        assert.ok(scriptCode.includes('toggleUserStatus'), 'toggleUserStatus tidak ditemukan');
        assert.ok(scriptCode.includes('deleteUser'), 'deleteUser tidak ditemukan');
        assert.ok(scriptCode.includes('syncUsersFromCloud'), 'syncUsersFromCloud tidak ditemukan');
    });

    // 4. Verifikasi Logika Controller admin-roles.js (RBAC Table Matrix)
    test('admin-roles.js harus mengekspor matriks RBAC dan fungsi wewenang', () => {
        const scriptCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-roles.js'), 'utf8');
        assert.ok(scriptCode.includes('SYSTEM_MODULES'), 'SYSTEM_MODULES tidak ditemukan');
        assert.ok(scriptCode.includes('SYSTEM_ROLES'), 'SYSTEM_ROLES tidak ditemukan');
        assert.ok(scriptCode.includes('ACCESS_LEVELS'), 'ACCESS_LEVELS tidak ditemukan');
        assert.ok(scriptCode.includes('renderRoles'), 'renderRoles tidak ditemukan');
        assert.ok(scriptCode.includes('renderRbacTable'), 'renderRbacTable tidak ditemukan');
        assert.ok(scriptCode.includes('changePermissionCell'), 'changePermissionCell tidak ditemukan');
        assert.ok(scriptCode.includes('batchSetRolePermission'), 'batchSetRolePermission tidak ditemukan');
        assert.ok(scriptCode.includes('openRbacGuideModal'), 'openRbacGuideModal tidak ditemukan');
        assert.ok(scriptCode.includes('closeRbacGuideModal'), 'closeRbacGuideModal tidak ditemukan');
        assert.ok(scriptCode.includes('canAccessTab'), 'canAccessTab tidak ditemukan');
        assert.ok(scriptCode.includes('getTabAccessLevel'), 'getTabAccessLevel tidak ditemukan');
        assert.ok(scriptCode.includes('syncRolesFromCloud'), 'syncRolesFromCloud tidak ditemukan');
    });

    // 5. Verifikasi State Manager & Router
    test('admin-state.js dan admin-nav.js harus mengintegrasikan USERS dan ROLES', () => {
        const stateCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-state.js'), 'utf8');
        assert.ok(stateCode.includes("USERS: 'sdw_admin_users'"), 'Storage key USERS tidak ada di state');
        assert.ok(stateCode.includes("ROLES: 'sdw_admin_roles'"), 'Storage key ROLES tidak ada di state');
        assert.ok(stateCode.includes("RBAC_MATRIX: 'sdw_admin_rbac_matrix'"), 'Storage key RBAC_MATRIX tidak ada di state');
        assert.ok(stateCode.includes("'tab-users'"), 'Permission tab-users tidak terdaftar di RBAC');
        assert.ok(stateCode.includes("'tab-roles'"), 'Permission tab-roles tidak terdaftar di RBAC');

        const navCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-nav.js'), 'utf8');
        assert.ok(navCode.includes("tabId === 'tab-users'"), 'Routing tab-users tidak ditemukan di admin-nav.js');
        assert.ok(navCode.includes("tabId === 'tab-roles'"), 'Routing tab-roles tidak ditemukan di admin-nav.js');
        assert.ok(navCode.includes('admin.renderUsers()'), 'Pemanggilan admin.renderUsers() tidak ditemukan');
        assert.ok(navCode.includes('admin.renderRoles()'), 'Pemanggilan admin.renderRoles() tidak ditemukan');
        assert.ok(navCode.includes('admin.canAccessTab'), 'Dynamic RBAC check admin.canAccessTab tidak ditemukan di applyRolePermissions');
    });

    // 6. Verifikasi Backend Google Apps Script
    test('Setup.gs dan Code.gs harus memiliki skema DB_Users dan DB_Role_Permissions serta handlers', () => {
        const setupCode = fs.readFileSync(path.join(root, 'backend', 'Setup.gs'), 'utf8');
        assert.ok(setupCode.includes('DB_Users'), 'DB_Users tidak ada di Setup.gs');
        assert.ok(setupCode.includes('DB_Role_Permissions'), 'DB_Role_Permissions tidak ada di Setup.gs');
        assert.ok(setupCode.includes('setupUsersAndRbacSheets'), 'setupUsersAndRbacSheets tidak ditemukan di Setup.gs');

        const codeCode = fs.readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
        assert.ok(codeCode.includes('getUsers'), 'Handler getUsers tidak ada di Code.gs');
        assert.ok(codeCode.includes('getRolePermissions'), 'Handler getRolePermissions tidak ada di Code.gs');
        assert.ok(codeCode.includes('saveUser'), 'Handler saveUser tidak ada di Code.gs');
        assert.ok(codeCode.includes('deleteUser'), 'Handler deleteUser tidak ada di Code.gs');
        assert.ok(codeCode.includes('toggleUserStatus'), 'Handler toggleUserStatus tidak ada di Code.gs');
        assert.ok(codeCode.includes('saveRoleMatrixPermission'), 'Handler saveRoleMatrixPermission tidak ada di Code.gs');
        assert.ok(codeCode.includes('batchUpdateRolePermissions'), 'Handler batchUpdateRolePermissions tidak ada di Code.gs');
    });

    // 7. Verifikasi Service Worker Caching
    test('sw.js harus mem-precache admin-users.js & admin-roles.js dan cache version minimal v67', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(swCode.includes('/js/admin/admin-users.js'), 'admin-users.js tidak ada di PRECACHE_URLS');
        assert.ok(swCode.includes('/js/admin/admin-roles.js'), 'admin-roles.js tidak ada di PRECACHE_URLS');
        assert.ok(/sdw-umroh-pwa-v(6[7-9]|[7-9]\d)/.test(swCode), 'Cache version di sw.js harus minimal v67');
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round(passedTests / totalTests * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();
