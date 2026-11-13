/**
 * ====================================================================
 * TEST SUITE: ADMIN MODULE - ARTIKEL, BERITA & PANDUAN ZIARAH
 * File: tests/test_admin_articles_ziarah.js
 * ====================================================================
 */

(function () {
    'use strict';

    const fs = require('fs');
    const path = require('path');
    const assert = require('assert');

    console.log('🧪 Memulai Pengujian Modul Artikel, Berita & Titik Ziarah Haramain...\n');

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
    test('File-file esensial modul artikel & ziarah harus tersedia', () => {
        assert.ok(fs.existsSync(path.join(root, 'js', 'admin', 'admin-articles.js')), 'admin-articles.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'admin.html')), 'admin.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'ziarah.html')), 'ziarah.html tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'js', 'berita-kalender.js')), 'berita-kalender.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'sw.js tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Code.gs')), 'Code.gs tidak ditemukan');
        assert.ok(fs.existsSync(path.join(root, 'backend', 'Setup.gs')), 'Setup.gs tidak ditemukan');
    });

    // 2. Verifikasi UI Admin Sidebar & Tab Container
    test('admin.html harus memuat menu sidebar dan tab container tab-articles', () => {
        const adminHtml = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
        assert.ok(adminHtml.includes('data-admin-tab="tab-articles"'), 'Sidebar item tab-articles tidak ditemukan');
        assert.ok(adminHtml.includes('id="tab-articles"'), 'Tab container #tab-articles tidak ditemukan');
        assert.ok(adminHtml.includes('id="secArticlesList"'), 'Subtab warta #secArticlesList tidak ditemukan');
        assert.ok(adminHtml.includes('id="secZiarahList"'), 'Subtab ziarah #secZiarahList tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalArticleEditor"'), 'Modal #modalArticleEditor tidak ditemukan');
        assert.ok(adminHtml.includes('id="modalZiarahEditor"'), 'Modal #modalZiarahEditor tidak ditemukan');
        assert.ok(adminHtml.includes('src="js/admin/admin-articles.js?v=1.0.0"'), 'Script tag admin-articles.js tidak ditemukan');
    });

    // 3. Verifikasi Logika Controller admin-articles.js
    test('admin-articles.js harus memuat controller lengkap dengan CRUD dan Cloud Sync', () => {
        const scriptCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-articles.js'), 'utf8');
        assert.ok(scriptCode.includes('renderArticles'), 'renderArticles tidak ditemukan');
        assert.ok(scriptCode.includes('applyArticlesFilter'), 'applyArticlesFilter tidak ditemukan');
        assert.ok(scriptCode.includes('renderZiarahList'), 'renderZiarahList tidak ditemukan');
        assert.ok(scriptCode.includes('applyZiarahFilter'), 'applyZiarahFilter tidak ditemukan');
        assert.ok(scriptCode.includes('saveArticle'), 'saveArticle tidak ditemukan');
        assert.ok(scriptCode.includes('saveZiarahPlace'), 'saveZiarahPlace tidak ditemukan');
        assert.ok(scriptCode.includes('deleteArticle'), 'deleteArticle tidak ditemukan');
        assert.ok(scriptCode.includes('deleteZiarahPlace'), 'deleteZiarahPlace tidak ditemukan');
        assert.ok(scriptCode.includes('syncArticlesFromCloud'), 'syncArticlesFromCloud tidak ditemukan');
    });

    // 4. Verifikasi State & Router
    test('admin-state.js dan admin-nav.js harus mengintegrasikan tab-articles', () => {
        const stateCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-state.js'), 'utf8');
        const navCode = fs.readFileSync(path.join(root, 'js', 'admin', 'admin-nav.js'), 'utf8');

        assert.ok(stateCode.includes("ARTICLES: 'sdw_admin_articles'"), 'State key ARTICLES tidak terdaftar');
        assert.ok(stateCode.includes("ZIARAH: 'sdw_admin_ziarah'"), 'State key ZIARAH tidak terdaftar');
        assert.ok(stateCode.includes("'tab-articles'"), 'tab-articles tidak terdaftar dalam role permissions');
        assert.ok(navCode.includes("admin.renderArticles()"), 'admin-nav.js tidak mendispatch renderArticles()');
    });

    // 5. Verifikasi Backend Apps Script Endpoints
    test('backend/Code.gs dan backend/Setup.gs harus mendukung skema DB_Articles & DB_Ziarah_Places', () => {
        const codeGs = fs.readFileSync(path.join(root, 'backend', 'Code.gs'), 'utf8');
        const setupGs = fs.readFileSync(path.join(root, 'backend', 'Setup.gs'), 'utf8');

        assert.ok(codeGs.includes('getArticles'), 'Endpoint getArticles tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('getZiarahPlaces'), 'Endpoint getZiarahPlaces tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('saveArticle'), 'Mutation saveArticle tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('saveZiarahPlace'), 'Mutation saveZiarahPlace tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('deleteArticle'), 'Mutation deleteArticle tidak ditemukan di Code.gs');
        assert.ok(codeGs.includes('deleteZiarahPlace'), 'Mutation deleteZiarahPlace tidak ditemukan di Code.gs');

        assert.ok(setupGs.includes('DB_Articles'), 'DB_Articles tidak terdaftar di Setup.gs');
        assert.ok(setupGs.includes('DB_Ziarah_Places'), 'DB_Ziarah_Places tidak terdaftar di Setup.gs');
        assert.ok(setupGs.includes('setupArticlesAndZiarahSheets'), 'setupArticlesAndZiarahSheets tidak ditemukan di Setup.gs');
    });

    // 6. Verifikasi Integrasi Public Web ziarah.html
    test('ziarah.html harus memuat renderer dinamis initDynamicZiarah', () => {
        const ziarahHtml = fs.readFileSync(path.join(root, 'ziarah.html'), 'utf8');
        assert.ok(ziarahHtml.includes('renderDynamicZiarah'), 'renderDynamicZiarah tidak ditemukan di ziarah.html');
        assert.ok(ziarahHtml.includes('initDynamicZiarah'), 'initDynamicZiarah tidak ditemukan di ziarah.html');
        assert.ok(ziarahHtml.includes('sdw_admin_ziarah'), 'sdw_admin_ziarah cache lookup tidak ditemukan di ziarah.html');
    });

    // 7. Verifikasi Integrasi Mobile PWA js/berita-kalender.js
    test('js/berita-kalender.js harus membaca warta dari sdw_admin_articles dan sync cloud', () => {
        const newsCode = fs.readFileSync(path.join(root, 'js', 'berita-kalender.js'), 'utf8');
        assert.ok(newsCode.includes('getActiveNewsArticles'), 'getActiveNewsArticles tidak ditemukan di berita-kalender.js');
        assert.ok(newsCode.includes('syncArticlesFromCloud'), 'syncArticlesFromCloud tidak ditemukan di berita-kalender.js');
        assert.ok(newsCode.includes('sdw_admin_articles'), 'sdw_admin_articles tidak dipanggil di berita-kalender.js');
    });

    // 8. Verifikasi Service Worker Caching
    test('sw.js harus menyertakan admin-articles.js dan versi cache terbaru v64+', () => {
        const swCode = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
        assert.ok(/sdw-umroh-pwa-v(6[4-9]|[7-9]\d)/.test(swCode), 'Cache version v64+ tidak ditemukan di sw.js');
        assert.ok(swCode.includes('/js/admin/admin-articles.js'), 'admin-articles.js tidak di-precache di sw.js');
    });

    console.log(`\n📊 Ringkasan Pengujian: ${passedTests}/${totalTests} Pengujian Berhasil.`);
    if (passedTests === totalTests) {
        console.log('🎉 SELURUH PENGUJIAN MODUL ARTIKEL & ZIARAH BERHASIL 100%!\n');
        process.exit(0);
    } else {
        console.error('⚠️ Terdapat pengujian yang gagal, mohon periksa log di atas.\n');
        process.exit(1);
    }
})();
