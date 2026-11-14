/**
 * Test Suite: Dashboard Visualisasi Charts (Asnawiyyah Style)
 * Memverifikasi Bar Chart Aktivitas Registrasi/Keberangkatan (2/3) dan Donut Chart Rasio Dokumen/Seat (1/3)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

(function runDashboardChartsTests() {
    console.log('🧪 Memulai Pengujian Dashboard Visualisasi Charts (Asnawiyyah Style)...\n');

    const adminHtml = fs.readFileSync(path.resolve(__dirname, '..', 'admin.html'), 'utf8');
    const adminNavJs = fs.readFileSync(path.resolve(__dirname, '..', 'js/admin/admin-nav.js'), 'utf8');
    const swJs = fs.readFileSync(path.resolve(__dirname, '..', 'sw.js'), 'utf8');

    let passedTests = 0;
    let totalTests = 0;

    function test(desc, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  ✅ PASS: ${desc}`);
            passedTests++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${desc}`);
            console.error(`     Error: ${err.message}`);
        }
    }

    // 1. Verifikasi Markup Grid & Kartu Kiri (Bar Chart Aktivitas) di admin.html
    test('admin.html harus memuat kartu Aktivitas Registrasi & Keberangkatan dengan elemen lengkap', () => {
        assert.ok(adminHtml.includes('id="dashActivityBarsContainer"'), 'Elemen #dashActivityBarsContainer tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashChartPeriodBadge"'), 'Elemen #dashChartPeriodBadge tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashChartAvgNote"'), 'Elemen #dashChartAvgNote tidak ditemukan');
        assert.ok(adminHtml.includes('Aktivitas Kehadiran &amp; Registrasi Harian') || adminHtml.includes('Aktivitas Registrasi'), 'Judul aktivitas tidak ditemukan');
        assert.ok(adminHtml.includes('Volume pendaftaran jamaah &amp; pelunasan seat terverifikasi'), 'Deskripsi aktivitas tidak ditemukan');
    });

    // 2. Verifikasi Markup Kartu Kanan (Donut Chart Rasio Kesiapan) di admin.html
    test('admin.html harus memuat kartu Donut Chart Rasio Kesiapan dengan SVG dan label lengkap', () => {
        assert.ok(adminHtml.includes('id="dashDonutCenterPct"'), 'Elemen #dashDonutCenterPct tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashDonutCenterLabel"'), 'Elemen #dashDonutCenterLabel tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashDonutArcOrange"'), 'Elemen #dashDonutArcOrange tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashDonutArcCyan"'), 'Elemen #dashDonutArcCyan tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashPctReady"'), 'Elemen #dashPctReady tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashPctReview"'), 'Elemen #dashPctReview tidak ditemukan');
        assert.ok(adminHtml.includes('id="dashPctPending"'), 'Elemen #dashPctPending tidak ditemukan');
    });

    // 3. Verifikasi Ekspor Fungsi Controller di admin-nav.js
    test('admin-nav.js harus mendefinisikan dan mengekspor fungsi-fungsi chart Asnawiyyah', () => {
        assert.ok(adminNavJs.includes('function renderDashboardActivityChart'), 'Fungsi renderDashboardActivityChart tidak ditemukan');
        assert.ok(adminNavJs.includes('function renderDashboardDonutChart'), 'Fungsi renderDashboardDonutChart tidak ditemukan');
        assert.ok(adminNavJs.includes('admin.renderDashboardActivityChart = renderDashboardActivityChart'), 'Ekspor renderDashboardActivityChart tidak ditemukan');
        assert.ok(adminNavJs.includes('admin.renderDashboardDonutChart = renderDashboardDonutChart'), 'Ekspor renderDashboardDonutChart tidak ditemukan');
        assert.ok(adminNavJs.includes('admin.DASHBOARD_CHART_DATA = DASHBOARD_CHART_DATA'), 'Ekspor DASHBOARD_CHART_DATA tidak ditemukan');
    });

    // 4. Verifikasi Pemanggilan Renderer Chart di dalam renderDashboard
    test('renderDashboard harus memanggil renderDashboardActivityChart dan renderDashboardDonutChart', () => {
        assert.ok(adminNavJs.includes('renderDashboardActivityChart(dashboardPeriod);'), 'renderDashboardActivityChart tidak dipanggil di renderDashboard');
        assert.ok(adminNavJs.includes('renderDashboardDonutChart(dashboardPeriod);'), 'renderDashboardDonutChart tidak dipanggil di renderDashboard');
    });

    // 5. Verifikasi Dataset Multi-Periode (7D, TODAY, 30D, 90D, ALL)
    test('admin-nav.js harus memiliki dataset analitik lengkap untuk semua opsi periode', () => {
        assert.ok(adminNavJs.includes("'7D':"), 'Dataset 7D tidak ditemukan');
        assert.ok(adminNavJs.includes("'TODAY':"), 'Dataset TODAY tidak ditemukan');
        assert.ok(adminNavJs.includes("'30D':"), 'Dataset 30D tidak ditemukan');
        assert.ok(adminNavJs.includes("'90D':"), 'Dataset 90D tidak ditemukan');
        assert.ok(adminNavJs.includes("'ALL':"), 'Dataset ALL tidak ditemukan');
    });

    // 6. Verifikasi Eksekusi DOM Simulasi
    test('Renderer chart harus memperbarui DOM dengan benar pada simulasi browser', () => {
        const domElements = {
            dashChartPeriodBadge: { innerText: '' },
            dashChartAvgNote: { innerText: '' },
            dashActivityBarsContainer: { innerHTML: '' },
            dashDonutCenterPct: { innerText: '' },
            dashPctReady: { innerText: '' },
            dashPctReview: { innerText: '' },
            dashPctPending: { innerText: '' },
            dashDonutArcOrange: {
                attrs: {},
                setAttribute: function(k, v) { this.attrs[k] = v; }
            },
            dashDonutArcCyan: {
                attrs: {},
                setAttribute: function(k, v) { this.attrs[k] = v; }
            }
        };

        global.document = {
            getElementById: (id) => domElements[id] || null,
            querySelectorAll: () => [],
            addEventListener: () => {}
        };

        const navModule = require('../js/admin/admin-nav.js');
        assert.ok(typeof navModule.renderDashboardActivityChart === 'function', 'renderDashboardActivityChart bukan fungsi');
        assert.ok(typeof navModule.renderDashboardDonutChart === 'function', 'renderDashboardDonutChart bukan fungsi');

        // Test render 7D
        navModule.renderDashboardActivityChart('7D');
        assert.strictEqual(domElements.dashChartPeriodBadge.innerText, '7 Hari');
        assert.ok(domElements.dashChartAvgNote.innerText.includes('18 Pendaftaran/Hari'));
        assert.ok(domElements.dashActivityBarsContainer.innerHTML.includes('05-21'));
        assert.ok(domElements.dashActivityBarsContainer.innerHTML.includes('bg-sky-400'));
        assert.ok(domElements.dashActivityBarsContainer.innerHTML.includes('bg-amber-400'));

        // Test render Donut 7D
        navModule.renderDashboardDonutChart('7D');
        assert.strictEqual(domElements.dashDonutCenterPct.innerText, '98.5%');
        assert.strictEqual(domElements.dashPctReady.innerText, '65.4%');
        assert.strictEqual(domElements.dashPctReview.innerText, '23.1%');
        assert.strictEqual(domElements.dashPctPending.innerText, '11.5%');

        // Test switch period to TODAY
        navModule.renderDashboardActivityChart('TODAY');
        assert.strictEqual(domElements.dashChartPeriodBadge.innerText, 'Hari Ini');
        assert.ok(domElements.dashActivityBarsContainer.innerHTML.includes('14:00'));

        delete global.document;
    });

    // 7. Verifikasi Service Worker Cache Bump v71+
    test('sw.js harus menggunakan versi cache v71 atau lebih baru', () => {
        const cacheMatch = swJs.match(/sdw-umroh-pwa-v(\d+)/);
        assert.ok(cacheMatch, 'Format nama cache tidak ditemukan di sw.js');
        const vNum = parseInt(cacheMatch[1], 10);
        assert.ok(vNum >= 71, `Versi cache harus minimal v71, terdeteksi: v${vNum}`);
    });

    console.log(`\n======================================================`);
    console.log(`Pengujian Selesai: ${passedTests} / ${totalTests} Berhasil (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log(`======================================================\n`);

    if (passedTests !== totalTests) {
        process.exit(1);
    }
})();
