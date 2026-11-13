/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: ARTIKEL EDUKASI & PANDUAN ZIARAH HARAMAIN
 * File: js/admin/admin-articles.js
 * Version: 1.0.0
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

    let currentSubtab = 'articles'; // 'articles' | 'ziarah'
    let articlesViewMode = 'table'; // 'table' | 'cards'
    let ziarahViewMode = 'table'; // 'table' | 'cards'

    let articlesFilter = {
        search: '',
        category: 'ALL',
        status: 'ALL'
    };

    let ziarahFilter = {
        search: '',
        city: 'ALL',
        status: 'ALL'
    };

    const DEFAULT_ARTICLES = [
        {
            id: 'ART-000001',
            title: 'Panduan Lengkap Manasik Umroh Sesuai Sunnah Rasulullah ﷺ',
            slug: 'panduan-manasik-umroh-sunnah',
            category: 'PANDUAN_MANASIK',
            author: 'Ust. DR. H. Muhammad Salman, Lc.',
            image_url: 'assets/hero-twilight.jpg',
            summary: 'Tata cara pelaksanaan rukun umroh mulai dari niat ihram di miqat, thawaf 7 putaran, sa\'i Safa-Marwah, hingga tahallul.',
            content: 'Umroh adalah ibadah yang mulia. Rukun umroh terdiri dari 4 hal: Ihram dari miqat, Thawaf mengitari Ka\'bah 7 putaran, Sa\'i antara bukit Safa dan Marwah, serta Tahallul dengan mencukur atau memotong rambut.',
            read_time_minutes: 7,
            is_featured: true,
            status: 'PUBLISHED',
            published_at: '2026-10-15'
        },
        {
            id: 'ART-000002',
            title: 'Jadwal Manasik Akbar & Simulasi Thawaf Sa\'i Musim 1448H',
            slug: 'jadwal-manasik-akbar-1448h',
            category: 'BERITA_RESMI',
            author: 'Tim Operasional SDW Umroh',
            image_url: 'assets/pkg-vip-khidmat.png',
            summary: 'Pelaksanaan manasik akbar ruang dan lapangan di Grand Ballroom Menara 165 Jakarta Selatan beserta pembagian koper bagasi.',
            content: 'Seluruh calon jamaah kloter keberangkatan musim 1448H diundang hadir pada kegiatan Manasik Akbar. Disediakan replika miniatur Ka\'bah untuk simulasi thawaf dan sa\'i serta pengenalan muthawwif pembimbing.',
            read_time_minutes: 4,
            is_featured: true,
            status: 'PUBLISHED',
            published_at: '2026-10-20'
        },
        {
            id: 'ART-000003',
            title: 'Tips Menjaga Kebugaran Fisik & Pola Minum Air Zamzam di Tanah Suci',
            slug: 'tips-kebugaran-jamaah-umroh',
            category: 'TIPS_KESEHATAN',
            author: 'dr. Hendra Wijaya, Sp.A',
            image_url: 'assets/hero-haram.png',
            summary: 'Panduan medis menjaga hidrasi tubuh, menghadapi perbedaan suhu ekstrem di Makkah & Madinah, serta tips bagi jamaah lansia.',
            content: 'Perbedaan cuaca antara tanah air dan Arab Saudi memerlukan adaptasi fisik yang baik. Jamaah dianjurkan minum air Zamzam minimal 2-3 liter per hari dan tidak menahan buang air kecil.',
            read_time_minutes: 5,
            is_featured: false,
            status: 'PUBLISHED',
            published_at: '2026-10-25'
        },
        {
            id: 'ART-000004',
            title: 'Tata Cara Pemesanan Tasreh Masuk Raudhah Nabawi via Aplikasi Nusuk',
            slug: 'panduan-tasreh-raudhah-nusuk',
            category: 'REGULASI_VISA',
            author: 'Ust. Ahmad Fauzi Ridwan, Lc.',
            image_url: 'assets/hero-twilight.jpg',
            summary: 'Panduan teknis pendaftaran izin masuk taman surga Raudhah bagi jamaah pria dan wanita sesuai regulasi Kementerian Haji Saudi.',
            content: 'Kementerian Haji dan Umrah Arab Saudi mewajibkan izin tasreh resmi melalui aplikasi Nusuk. Tim SDW Umroh membantu proses pendaftaran grup agar seluruh jamaah mendapatkan jadwal ziarah Raudhah yang nyaman.',
            read_time_minutes: 6,
            is_featured: false,
            status: 'PUBLISHED',
            published_at: '2026-11-01'
        },
        {
            id: 'ART-000005',
            title: 'Panduan Ketentuan Bagasi & Air Zamzam Penerbangan Saudia Airlines',
            slug: 'ketentuan-bagasi-saudia-airlines',
            category: 'BERITA_RESMI',
            author: 'Tim Handling Bandara SDW',
            image_url: 'assets/pkg-reguler-syawal.png',
            summary: 'Aturan berat koper bagasi maks 2x23 kg, tas kabin 7 kg, dan mekanisme resmi pembagian galon 5 liter air Zamzam di bandara.',
            content: 'Jamaah SDW Umroh yang terbang bersama Saudia Airlines dan Garuda Indonesia berhak atas fasilitas bagasi cuma-cuma 2 koper (masing-masing 23 kg) dan air Zamzam 5 liter resmi dari pengelola Haramain.',
            read_time_minutes: 4,
            is_featured: false,
            status: 'PUBLISHED',
            published_at: '2026-11-05'
        }
    ];

    const DEFAULT_ZIARAH = [
        {
            id: 'ZRH-000001',
            name: 'Jabal Rahmah & Padang Arafah',
            city: 'MAKKAH',
            location_tag: 'Tempat Wukuf Haji',
            distance_text: '± 21 Km Timur Masjidil Haram',
            historical_summary: 'Bukit batu bersejarah di tengah Padang Arafah tempat bertemunya Nabi Adam AS dan Hawa setelah berpisah ratusan tahun, serta lokasi khutbah wada Rasulullah ﷺ.',
            sunnah_tips: 'Disunnahkan berdoa menghadap kiblat (bukan menghadap tugu), tidak mencoret-coret bebatuan, dan memperbanyak istighfar.',
            image_url: 'assets/pkg-vip-khidmat.png',
            maps_url: 'https://maps.google.com/?q=Jabal+al-Rahmah+Makkah',
            order_index: 1,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000002',
            name: 'Gua Hira (Jabal Nur)',
            city: 'MAKKAH',
            location_tag: 'Tempat Turun Wahyu Pertama',
            distance_text: '± 6 Km Timur Laut Masjidil Haram',
            historical_summary: 'Tempat Rasulullah ﷺ bertahannuth hingga menerima wahyu pertama surat Al-Alaq 1-5 melalui malaikat Jibril AS.',
            sunnah_tips: 'Mengingat awal mula risalah Islam, merenungi perjuangan Sayyidah Khadijah radhiyallahu \'anha membawakan bekal ke puncak bukit.',
            image_url: 'assets/hero-haram.png',
            maps_url: 'https://maps.google.com/?q=Hira+Cave+Makkah',
            order_index: 2,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000003',
            name: 'Gua Tsur (Jabal Tsur)',
            city: 'MAKKAH',
            location_tag: 'Benteng Hijrah Rasulullah',
            distance_text: '± 5 Km Selatan Masjidil Haram',
            historical_summary: 'Gua di puncak Jabal Tsur tempat Rasulullah ﷺ dan Abu Bakar Ash-Shiddiq radhiyallahu \'anhu bersembunyi selama 3 malam saat hijrah ke Madinah (QS. At-Taubah: 40).',
            sunnah_tips: 'Mengambil pelajaran tawakkal sempurna kepada Allah dan kesetiaan sahabat sejati.',
            image_url: 'assets/hero-twilight.jpg',
            maps_url: 'https://maps.google.com/?q=Thawr+Cave+Makkah',
            order_index: 3,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000004',
            name: 'Mina & Tugu Jamarat',
            city: 'MAKKAH',
            location_tag: 'Lokasi Mabit & Lempar Jumrah',
            distance_text: '± 7 Km Timur Masjidil Haram',
            historical_summary: 'Lembah tenda tempat jamaah haji mabit dan melontar tiga jamarat (Ula, Wustha, Aqabah) meneladani keteguhan Nabi Ibrahim AS menolak godaan setan.',
            sunnah_tips: 'Mempelajari manasik haji tamattu\' dan tapak tilas peristiwa ketaatan Nabi Ibrahim & Ismail AS.',
            image_url: 'assets/pkg-ramadhan.webp',
            maps_url: 'https://maps.google.com/?q=Jamarat+Mina+Makkah',
            order_index: 4,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000005',
            name: 'Muzdalifah & Masy\'aril Haram',
            city: 'MAKKAH',
            location_tag: 'Tempat Mabit & Ambil Kerikil',
            distance_text: '± 10 Km Tenggara Masjidil Haram',
            historical_summary: 'Area terbuka antara Arafah dan Mina tempat jamaah haji bermalam sejenak (mabit) usai wukuf dan mengumpulkan batu kerikil.',
            sunnah_tips: 'Mengingat firman Allah dalam QS. Al-Baqarah: 198 untuk berdzikir di Masy\'aril Haram.',
            image_url: 'assets/pkg-reguler-syawal.png',
            maps_url: 'https://maps.google.com/?q=Muzdalifah+Makkah',
            order_index: 5,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000006',
            name: 'Masjid Quba & Kebun Kurma',
            city: 'MADINAH',
            location_tag: 'Masjid Pertama Sejarah Islam',
            distance_text: '± 3.5 Km Selatan Masjid Nabawi',
            historical_summary: 'Masjid pertama yang dibangun Rasulullah ﷺ setibanya di Madinah. Shalat 2 rakaat di sini bernilai pahala setara 1 kali ibadah umroh (HR. Tirmidzi & Ibnu Majah).',
            sunnah_tips: 'Disunnahkan bersuci (wudhu) dari hotel/rumah lalu mendirikan shalat sunnah minimal 2 rakaat di dalam masjid.',
            image_url: 'assets/pkg-plus-turki.webp',
            maps_url: 'https://maps.google.com/?q=Quba+Mosque+Medina',
            order_index: 6,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000007',
            name: 'Jabal Uhud & Makam Syuhada',
            city: 'MADINAH',
            location_tag: 'Bukit Cinta Surga',
            distance_text: '± 5 Km Utara Masjid Nabawi',
            historical_summary: 'Bukit yang mencintai kaum mukmin dan dicintai Nabi (HR. Bukhari). Saksi Perang Uhud, bukit pemanah (Jabal Rumat), dan makam 70 syuhada termasuk Sayyidina Hamzah AS.',
            sunnah_tips: 'Mendoakan para syuhada Uhud, menaiki bukit pemanah dengan tertib, dan tidak meminta berkah kepada batu/tanah kuburan.',
            image_url: 'assets/hero-twilight.jpg',
            maps_url: 'https://maps.google.com/?q=Mount+Uhud+Medina',
            order_index: 7,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000008',
            name: 'Masjid Al-Qiblatain (Dua Kiblat)',
            city: 'MADINAH',
            location_tag: 'Dua Arah Kiblat',
            distance_text: '± 4 Km Barat Laut Masjid Nabawi',
            historical_summary: 'Saksi sejarah perintah memalingkan arah kiblat dari Baitul Maqdis di Yerusalem ke Ka\'bah di Makkah saat shalat berjamaah sedang berlangsung (QS. Al-Baqarah: 144).',
            sunnah_tips: 'Mendirikan shalat sunnah tahiyyatul masjid dan tadabbur ayat-ayat ketaatan mutlak kepada perintah wahyu.',
            image_url: 'assets/hero-haram.png',
            maps_url: 'https://maps.google.com/?q=Masjid+al-Qiblatayn+Medina',
            order_index: 8,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000009',
            name: 'Kebun Kurma & Pasar Kurma Madinah',
            city: 'MADINAH',
            location_tag: 'Wisata Agrowisata Nabawi',
            distance_text: '± 6 Km Selatan Masjid Nabawi',
            historical_summary: 'Perkebunan kurma produktif dengan berbagai jenis kurma unggulan seperti Ajwa (Kurma Nabi), Sukari, Medjool, dan Amber.',
            sunnah_tips: 'Mencicipi kurma Ajwa yang memiliki keutamaan penangkal racun dan sihir sesuai sabda Rasulullah ﷺ.',
            image_url: 'assets/pkg-reguler-syawal.png',
            maps_url: 'https://maps.google.com/?q=Date+Market+Medina',
            order_index: 9,
            status: 'ACTIVE'
        },
        {
            id: 'ZRH-000010',
            name: 'Masjid Sab\'ah & Medan Perang Khandaq',
            city: 'MADINAH',
            location_tag: 'Saksi Perang Parit 5 Hijriyah',
            distance_text: '± 2.5 Km Barat Laut Masjid Nabawi',
            historical_summary: 'Kompleks tujuh masjid kecil di lereng Gunung Sila\' tempat pos pertahanan dan tenda para sahabat saat menggali parit pertahanan Kota Madinah.',
            sunnah_tips: 'Tadabbur sejarah ketabahan Rasulullah ﷺ dan para sahabat menghadapi kepungan 10.000 pasukan sekutu Quraisy.',
            image_url: 'assets/pkg-vip-khidmat.png',
            maps_url: 'https://maps.google.com/?q=The+Seven+Mosques+Medina',
            order_index: 10,
            status: 'ACTIVE'
        }
    ];

    function getArticlesData() {
        if (admin.articlesData && Array.isArray(admin.articlesData) && admin.articlesData.length > 0) {
            return admin.articlesData;
        }
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.ARTICLES : 'sdw_admin_articles');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.articlesData = parsed;
                        return admin.articlesData;
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_ARTICLES] Gagal membaca storage articles:', e);
        }
        admin.articlesData = JSON.parse(JSON.stringify(DEFAULT_ARTICLES));
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.ARTICLES, admin.articlesData);
        }
        return admin.articlesData;
    }

    function getZiarahData() {
        if (admin.ziarahData && Array.isArray(admin.ziarahData) && admin.ziarahData.length > 0) {
            return admin.ziarahData;
        }
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.ZIARAH : 'sdw_admin_ziarah');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.ziarahData = parsed;
                        return admin.ziarahData;
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_ARTICLES] Gagal membaca storage ziarah:', e);
        }
        admin.ziarahData = JSON.parse(JSON.stringify(DEFAULT_ZIARAH));
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.ZIARAH, admin.ziarahData);
        }
        return admin.ziarahData;
    }

    // Main Renderer
    function renderArticles() {
        if (typeof document === 'undefined') return;

        const btnArticles = document.getElementById('btnSubtabArticles');
        const btnZiarah = document.getElementById('btnSubtabZiarah');
        const secArticles = document.getElementById('secArticlesList');
        const secZiarah = document.getElementById('secZiarahList');

        if (btnArticles && btnZiarah) {
            if (currentSubtab === 'articles') {
                btnArticles.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-sm transition";
                btnZiarah.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sdw-pine hover:bg-slate-100 transition";
                if (secArticles) secArticles.classList.remove('hidden');
                if (secZiarah) secZiarah.classList.add('hidden');
            } else {
                btnZiarah.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-sm transition";
                btnArticles.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sdw-pine hover:bg-slate-100 transition";
                if (secArticles) secArticles.classList.add('hidden');
                if (secZiarah) secZiarah.classList.remove('hidden');
            }
        }

        if (currentSubtab === 'articles') {
            renderArticlesList();
        } else {
            renderZiarahList();
        }
    }

    function switchSubtab(subtab) {
        currentSubtab = subtab;
        if (admin.state) admin.state.articlesSubtab = subtab;
        renderArticles();
    }

    // Render Subtab 1: Artikel Edukasi & Berita
    function renderArticlesList() {
        if (typeof document === 'undefined') return;
        const allItems = getArticlesData();

        // 1. KPI Calculation
        const kpiTotal = document.getElementById('kpi-articles-total');
        const kpiPublished = document.getElementById('kpi-articles-published');
        const kpiManasik = document.getElementById('kpi-articles-manasik');
        const kpiFeatured = document.getElementById('kpi-articles-featured');

        const activeCount = allItems.filter(i => (i.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED').length;
        const manasikCount = allItems.filter(i => (i.category || '').toUpperCase() === 'PANDUAN_MANASIK').length;
        const featuredCount = allItems.filter(i => i.is_featured === true || String(i.is_featured).toUpperCase() === 'TRUE').length;

        if (kpiTotal) kpiTotal.innerText = allItems.length;
        if (kpiPublished) kpiPublished.innerText = activeCount;
        if (kpiManasik) kpiManasik.innerText = manasikCount;
        if (kpiFeatured) kpiFeatured.innerText = featuredCount;

        // 2. Filter logic
        const q = (articlesFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (articlesFilter.category !== 'ALL' && (item.category || '').toUpperCase() !== articlesFilter.category) {
                return false;
            }
            if (articlesFilter.status !== 'ALL' && (item.status || 'PUBLISHED').toUpperCase() !== articlesFilter.status) {
                return false;
            }
            if (q) {
                const matchText = [item.id, item.title, item.author, item.summary, item.category].join(' ').toLowerCase();
                if (!matchText.includes(q)) return false;
            }
            return true;
        });

        // 3. Render View Toggle Container
        const tableView = document.getElementById('articlesTableView');
        const cardsView = document.getElementById('articlesCardsView');
        const emptyState = document.getElementById('articlesEmptyState');
        const tableBody = document.getElementById('articlesTableBody');
        const cardsGrid = document.getElementById('articlesCardsGrid');

        const btnViewTable = document.getElementById('btnArticlesViewTable');
        const btnViewCards = document.getElementById('btnArticlesViewCards');

        if (btnViewTable && btnViewCards) {
            if (articlesViewMode === 'table') {
                btnViewTable.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-sdw-pine text-white shadow-sm";
                btnViewCards.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100";
                if (tableView) tableView.classList.remove('hidden');
                if (cardsView) cardsView.classList.add('hidden');
            } else {
                btnViewCards.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-sdw-pine text-white shadow-sm";
                btnViewTable.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100";
                if (tableView) tableView.classList.add('hidden');
                if (cardsView) cardsView.classList.remove('hidden');
            }
        }

        if (filtered.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table Body
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const isFeatured = item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE';
                const statusColor = (item.status === 'PUBLISHED') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600';
                const catBadgeClass = getCategoryBadgeClass(item.category);

                return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <img src="${admin.escapeHtml(item.image_url || 'assets/hero-twilight.jpg')}" 
                                 alt="${admin.escapeHtml(item.title)}" 
                                 class="w-14 h-11 object-cover rounded-lg border border-slate-200 shadow-xs"
                                 onerror="this.src='assets/hero-twilight.jpg'">
                            <div>
                                <span class="font-mono text-[11px] font-bold text-sdw-pine block">${admin.escapeHtml(item.id)}</span>
                                <div class="font-bold text-xs text-slate-900 max-w-sm truncate">${admin.escapeHtml(item.title)}</div>
                                <div class="text-[11px] text-slate-500 line-clamp-1 max-w-xs">${admin.escapeHtml(item.summary || '-')}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadgeClass}">
                            ${admin.escapeHtml(formatCategoryLabel(item.category))}
                        </span>
                        <div class="text-[10px] text-slate-400 mt-0.5 font-medium"><i class="fa-regular fa-clock mr-1"></i>${item.read_time_minutes || 5} Menit Baca</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <div class="text-xs font-semibold text-slate-800">${admin.escapeHtml(item.author || 'Tim SDW')}</div>
                        <div class="text-[10px] text-slate-500">${admin.escapeHtml(item.published_at || '-')}</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        ${isFeatured ? `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <i class="fa-solid fa-star text-[9px] text-amber-500"></i> Headline
                            </span>
                        ` : `
                            <span class="text-[11px] text-slate-400">Reguler</span>
                        `}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}">
                            ● ${admin.escapeHtml(item.status || 'PUBLISHED')}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-xs">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="SDW_ADMIN.openArticleModal('${item.id}')" 
                                    class="p-1.5 text-slate-600 hover:text-sdw-pine hover:bg-slate-100 rounded-lg transition" 
                                    title="Edit Artikel">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="SDW_ADMIN.deleteArticle('${item.id}')" 
                                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition" 
                                    title="Arsipkan">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards Grid
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const isFeatured = item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE';
                const statusColor = (item.status === 'PUBLISHED') ? 'bg-emerald-500' : 'bg-slate-400';
                const catBadgeClass = getCategoryBadgeClass(item.category);

                return `
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
                    <div class="relative h-44 bg-slate-100 overflow-hidden">
                        <img src="${admin.escapeHtml(item.image_url || 'assets/hero-twilight.jpg')}" 
                             alt="${admin.escapeHtml(item.title)}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                             onerror="this.src='assets/hero-twilight.jpg'">
                        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadgeClass} backdrop-blur-xs">
                                ${admin.escapeHtml(formatCategoryLabel(item.category))}
                            </span>
                            ${isFeatured ? `
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/90 text-slate-900 shadow-xs flex items-center gap-1">
                                    <i class="fa-solid fa-star text-[9px]"></i> Headline
                                </span>
                            ` : ''}
                        </div>
                        <div class="absolute top-2.5 right-2.5">
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                <span class="w-1.5 h-1.5 rounded-full ${statusColor}"></span>
                                ${admin.escapeHtml(item.status || 'PUBLISHED')}
                            </span>
                        </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <span class="font-mono text-sdw-pine font-bold">${admin.escapeHtml(item.id)}</span>
                                <span><i class="fa-regular fa-clock text-[10px] mr-1"></i>${item.read_time_minutes || 5} min</span>
                            </div>
                            <h4 class="font-bold text-slate-900 text-sm mb-1 line-clamp-2 leading-snug">${admin.escapeHtml(item.title)}</h4>
                            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">${admin.escapeHtml(item.summary || '-')}</p>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">
                                <i class="fa-regular fa-user text-[10px] mr-1 text-slate-400"></i>${admin.escapeHtml(item.author || 'Tim SDW')}
                            </span>
                            <div class="flex items-center gap-1">
                                <button onclick="SDW_ADMIN.openArticleModal('${item.id}')" 
                                        class="px-2.5 py-1 text-xs font-semibold text-sdw-pine hover:bg-emerald-50 rounded-lg transition">
                                    Edit
                                </button>
                                <button onclick="SDW_ADMIN.deleteArticle('${item.id}')" 
                                        class="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition">
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Render Subtab 2: Titik Ziarah Haramain
    function renderZiarahList() {
        if (typeof document === 'undefined') return;
        const allItems = getZiarahData();

        // 1. KPI Calculation
        const kpiTotal = document.getElementById('kpi-ziarah-total');
        const kpiMakkah = document.getElementById('kpi-ziarah-makkah');
        const kpiMadinah = document.getElementById('kpi-ziarah-madinah');
        const kpiMaps = document.getElementById('kpi-ziarah-maps');

        const makkahCount = allItems.filter(i => (i.city || '').toUpperCase() === 'MAKKAH').length;
        const madinahCount = allItems.filter(i => (i.city || '').toUpperCase() === 'MADINAH').length;
        const mapsCount = allItems.filter(i => Boolean(i.maps_url && i.maps_url.trim())).length;

        if (kpiTotal) kpiTotal.innerText = allItems.length;
        if (kpiMakkah) kpiMakkah.innerText = makkahCount;
        if (kpiMadinah) kpiMadinah.innerText = madinahCount;
        if (kpiMaps) kpiMaps.innerText = mapsCount;

        // 2. Filter logic
        const q = (ziarahFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (ziarahFilter.city !== 'ALL' && (item.city || '').toUpperCase() !== ziarahFilter.city) {
                return false;
            }
            if (ziarahFilter.status !== 'ALL' && (item.status || 'ACTIVE').toUpperCase() !== ziarahFilter.status) {
                return false;
            }
            if (q) {
                const matchText = [item.id, item.name, item.location_tag, item.historical_summary, item.sunnah_tips].join(' ').toLowerCase();
                if (!matchText.includes(q)) return false;
            }
            return true;
        });

        // 3. Render View Toggle Container
        const tableView = document.getElementById('ziarahTableView');
        const cardsView = document.getElementById('ziarahCardsView');
        const emptyState = document.getElementById('ziarahEmptyState');
        const tableBody = document.getElementById('ziarahTableBody');
        const cardsGrid = document.getElementById('ziarahCardsGrid');

        const btnViewTable = document.getElementById('btnZiarahViewTable');
        const btnViewCards = document.getElementById('btnZiarahViewCards');

        if (btnViewTable && btnViewCards) {
            if (ziarahViewMode === 'table') {
                btnViewTable.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-sdw-pine text-white shadow-sm";
                btnViewCards.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100";
                if (tableView) tableView.classList.remove('hidden');
                if (cardsView) cardsView.classList.add('hidden');
            } else {
                btnViewCards.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-sdw-pine text-white shadow-sm";
                btnViewTable.className = "px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100";
                if (tableView) tableView.classList.add('hidden');
                if (cardsView) cardsView.classList.remove('hidden');
            }
        }

        if (filtered.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table Body
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const statusColor = (item.status === 'ACTIVE') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600';
                const cityColor = (item.city === 'MAKKAH') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-teal-50 text-teal-800 border-teal-200';

                return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <img src="${admin.escapeHtml(item.image_url || 'assets/hero-twilight.jpg')}" 
                                 alt="${admin.escapeHtml(item.name)}" 
                                 class="w-14 h-11 object-cover rounded-lg border border-slate-200 shadow-xs"
                                 onerror="this.src='assets/hero-twilight.jpg'">
                            <div>
                                <span class="font-mono text-[11px] font-bold text-sdw-pine block">${admin.escapeHtml(item.id)} • Urutan ${item.order_index || 1}</span>
                                <div class="font-bold text-xs text-slate-900">${admin.escapeHtml(item.name)}</div>
                                <div class="text-[10px] text-amber-700 font-semibold">${admin.escapeHtml(item.location_tag || '-')}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cityColor}">
                            ${item.city === 'MAKKAH' ? '🕋 Makkah' : '🕌 Madinah'}
                        </span>
                        <div class="text-[10px] text-slate-500 mt-1 font-medium">${admin.escapeHtml(item.distance_text || '-')}</div>
                    </td>
                    <td class="px-3 py-3">
                        <div class="text-xs text-slate-700 line-clamp-2 max-w-sm leading-tight">${admin.escapeHtml(item.historical_summary || '-')}</div>
                        <div class="text-[10px] text-emerald-700 italic mt-0.5 line-clamp-1"><i class="fa-solid fa-circle-info mr-1"></i>${admin.escapeHtml(item.sunnah_tips || '-')}</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        ${item.maps_url ? `
                            <a href="${admin.escapeHtml(item.maps_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-sdw-pine border border-purple-200 hover:bg-sdw-pine hover:text-white transition">
                                <i class="fa-solid fa-diamond-turn-right text-emerald-600"></i> Maps
                            </a>
                        ` : `
                            <span class="text-[11px] text-slate-400">-</span>
                        `}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}">
                            ● ${admin.escapeHtml(item.status || 'ACTIVE')}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-xs">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="SDW_ADMIN.openZiarahModal('${item.id}')" 
                                    class="p-1.5 text-slate-600 hover:text-sdw-pine hover:bg-slate-100 rounded-lg transition" 
                                    title="Edit Tempat Ziarah">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="SDW_ADMIN.deleteZiarahPlace('${item.id}')" 
                                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition" 
                                    title="Arsipkan">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards Grid
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const statusColor = (item.status === 'ACTIVE') ? 'bg-emerald-500' : 'bg-slate-400';
                const cityColor = (item.city === 'MAKKAH') ? 'bg-emerald-600 text-white' : 'bg-teal-600 text-white';

                return `
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group">
                    <div class="relative h-44 bg-slate-900 overflow-hidden">
                        <img src="${admin.escapeHtml(item.image_url || 'assets/hero-twilight.jpg')}" 
                             alt="${admin.escapeHtml(item.name)}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                             onerror="this.src='assets/hero-twilight.jpg'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cityColor} shadow-xs">
                                ${item.city === 'MAKKAH' ? '🕋 Makkah' : '🕌 Madinah'}
                            </span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white">
                                Urutan #${item.order_index || 1}
                            </span>
                        </div>
                        <div class="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                            <span class="text-[10px] text-amber-300 font-semibold block">${admin.escapeHtml(item.location_tag || '-')}</span>
                            <span class="text-xs font-bold flex items-center gap-1"><i class="fa-solid fa-location-dot text-amber-400 text-[10px]"></i> ${admin.escapeHtml(item.distance_text || '-')}</span>
                        </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                            <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <span class="font-mono text-sdw-pine font-bold">${admin.escapeHtml(item.id)}</span>
                                <span class="inline-flex items-center gap-1 text-[10px] font-bold ${item.status === 'ACTIVE' ? 'text-emerald-700' : 'text-slate-400'}">
                                    ● ${admin.escapeHtml(item.status || 'ACTIVE')}
                                </span>
                            </div>
                            <h4 class="font-bold text-slate-900 text-sm mb-1">${admin.escapeHtml(item.name)}</h4>
                            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">${admin.escapeHtml(item.historical_summary || '-')}</p>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            ${item.maps_url ? `
                                <a href="${admin.escapeHtml(item.maps_url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-sdw-pine hover:text-white text-sdw-pine font-bold text-xs border border-purple-200 transition flex items-center gap-1">
                                    <i class="fa-solid fa-diamond-turn-right text-emerald-600"></i> Maps
                                </a>
                            ` : '<span></span>'}
                            <div class="flex items-center gap-1">
                                <button onclick="SDW_ADMIN.openZiarahModal('${item.id}')" 
                                        class="px-2.5 py-1 text-xs font-semibold text-sdw-pine hover:bg-emerald-50 rounded-lg transition">
                                    Edit
                                </button>
                                <button onclick="SDW_ADMIN.deleteZiarahPlace('${item.id}')" 
                                        class="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition">
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    function formatCategoryLabel(cat) {
        switch ((cat || '').toUpperCase()) {
            case 'PANDUAN_MANASIK': return 'Panduan Manasik';
            case 'BERITA_RESMI': return 'Berita Resmi';
            case 'TIPS_KESEHATAN': return 'Tips Kesehatan';
            case 'REGULASI_VISA': return 'Regulasi Visa';
            default: return cat || 'Edukasi';
        }
    }

    function getCategoryBadgeClass(cat) {
        switch ((cat || '').toUpperCase()) {
            case 'PANDUAN_MANASIK': return 'bg-purple-100 text-purple-900 border border-purple-200';
            case 'BERITA_RESMI': return 'bg-blue-100 text-blue-900 border border-blue-200';
            case 'TIPS_KESEHATAN': return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
            case 'REGULASI_VISA': return 'bg-amber-100 text-amber-900 border border-amber-200';
            default: return 'bg-slate-100 text-slate-800 border border-slate-200';
        }
    }

    // Modal Operations: Article
    function openArticleModal(id) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalArticleEditor');
        const form = document.getElementById('formArticleEditor');
        const titleEl = document.getElementById('modalArticleTitle');

        if (!modal || !form) return;

        form.reset();

        if (id) {
            const allItems = getArticlesData();
            const item = allItems.find(i => String(i.id).toUpperCase() === String(id).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = 'Edit Artikel (' + item.id + ')';
                document.getElementById('artInputId').value = item.id;
                document.getElementById('artInputTitle').value = item.title || '';
                document.getElementById('artInputCategory').value = item.category || 'PANDUAN_MANASIK';
                document.getElementById('artInputAuthor').value = item.author || '';
                document.getElementById('artInputImageUrl').value = item.image_url || '';
                document.getElementById('artInputSummary').value = item.summary || '';
                document.getElementById('artInputContent').value = item.content || '';
                document.getElementById('artInputReadTime').value = item.read_time_minutes || 5;
                document.getElementById('artInputStatus').value = item.status || 'PUBLISHED';
                document.getElementById('artInputPublishedAt').value = item.published_at || '';
                document.getElementById('artInputFeatured').checked = (item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE');
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Artikel / Panduan Baru';
            document.getElementById('artInputId').value = '';
            document.getElementById('artInputCategory').value = 'PANDUAN_MANASIK';
            document.getElementById('artInputAuthor').value = 'Tim SDW Umroh';
            document.getElementById('artInputImageUrl').value = 'assets/hero-twilight.jpg';
            document.getElementById('artInputReadTime').value = 5;
            document.getElementById('artInputStatus').value = 'PUBLISHED';
            document.getElementById('artInputPublishedAt').value = new Date().toISOString().slice(0, 10);
            document.getElementById('artInputFeatured').checked = false;
        }

        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function saveArticle(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const id = document.getElementById('artInputId').value.trim();
        const title = document.getElementById('artInputTitle').value.trim();
        const category = document.getElementById('artInputCategory').value.trim();
        const author = document.getElementById('artInputAuthor').value.trim() || 'Tim SDW Umroh';
        const image_url = document.getElementById('artInputImageUrl').value.trim() || 'assets/hero-twilight.jpg';
        const summary = document.getElementById('artInputSummary').value.trim();
        const content = document.getElementById('artInputContent').value.trim();
        const read_time_minutes = Number(document.getElementById('artInputReadTime').value) || 5;
        const status = document.getElementById('artInputStatus').value.trim();
        const published_at = document.getElementById('artInputPublishedAt').value.trim() || new Date().toISOString().slice(0, 10);
        const is_featured = document.getElementById('artInputFeatured').checked;

        if (!title || !summary) {
            if (typeof admin.showToast === 'function') admin.showToast('Judul dan ringkasan artikel wajib diisi');
            return;
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const allItems = getArticlesData();
        let targetId = id;

        if (targetId) {
            const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(targetId).toUpperCase());
            if (idx !== -1) {
                allItems[idx] = Object.assign({}, allItems[idx], {
                    title, slug, category, author, image_url, summary, content,
                    read_time_minutes, is_featured, status, published_at,
                    updated_at: new Date().toISOString()
                });
            }
        } else {
            let maxNum = 0;
            allItems.forEach(i => {
                const match = String(i.id || '').match(/ART-(\d+)/i);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            });
            targetId = 'ART-' + String(maxNum + 1).padStart(6, '0');
            allItems.unshift({
                id: targetId,
                title, slug, category, author, image_url, summary, content,
                read_time_minutes, is_featured, status, published_at,
                created_at: new Date().toISOString()
            });
        }

        admin.articlesData = allItems;
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.ARTICLES, admin.articlesData);
        }

        const mutationPayload = {
            id: targetId,
            title, slug, category, author, image_url, summary, content,
            read_time_minutes, is_featured, status, published_at
        };

        if (typeof admin.pushMutation === 'function') {
            admin.pushMutation('saveArticle', mutationPayload);
        }

        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalArticleEditor');
        } else {
            const modal = document.getElementById('modalArticleEditor');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast('Artikel ' + targetId + ' berhasil disimpan');
        }

        renderArticlesList();
    }

    function deleteArticle(id) {
        if (!confirm('Apakah Anda yakin ingin mengarsipkan artikel ini?')) return;
        const allItems = getArticlesData();
        const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(id).toUpperCase());
        if (idx !== -1) {
            allItems[idx].status = 'ARCHIVED';
            admin.articlesData = allItems;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.ARTICLES, admin.articlesData);
            }
            if (typeof admin.pushMutation === 'function') {
                admin.pushMutation('deleteArticle', { id });
            }
            if (typeof admin.showToast === 'function') {
                admin.showToast('Artikel ' + id + ' diarsipkan');
            }
            renderArticlesList();
        }
    }

    // Modal Operations: Ziarah Place
    function openZiarahModal(id) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalZiarahEditor');
        const form = document.getElementById('formZiarahEditor');
        const titleEl = document.getElementById('modalZiarahTitle');

        if (!modal || !form) return;

        form.reset();

        if (id) {
            const allItems = getZiarahData();
            const item = allItems.find(i => String(i.id).toUpperCase() === String(id).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = 'Edit Titik Ziarah (' + item.id + ')';
                document.getElementById('zrhInputId').value = item.id;
                document.getElementById('zrhInputName').value = item.name || '';
                document.getElementById('zrhInputCity').value = item.city || 'MAKKAH';
                document.getElementById('zrhInputLocationTag').value = item.location_tag || '';
                document.getElementById('zrhInputDistance').value = item.distance_text || '';
                document.getElementById('zrhInputHistorical').value = item.historical_summary || '';
                document.getElementById('zrhInputSunnahTips').value = item.sunnah_tips || '';
                document.getElementById('zrhInputImageUrl').value = item.image_url || '';
                document.getElementById('zrhInputMapsUrl').value = item.maps_url || '';
                document.getElementById('zrhInputOrderIndex').value = item.order_index || 1;
                document.getElementById('zrhInputStatus').value = item.status || 'ACTIVE';
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Titik Ziarah Baru';
            document.getElementById('zrhInputId').value = '';
            document.getElementById('zrhInputCity').value = 'MAKKAH';
            document.getElementById('zrhInputImageUrl').value = 'assets/hero-twilight.jpg';
            document.getElementById('zrhInputOrderIndex').value = getZiarahData().length + 1;
            document.getElementById('zrhInputStatus').value = 'ACTIVE';
        }

        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function saveZiarahPlace(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const id = document.getElementById('zrhInputId').value.trim();
        const name = document.getElementById('zrhInputName').value.trim();
        const city = document.getElementById('zrhInputCity').value.trim();
        const location_tag = document.getElementById('zrhInputLocationTag').value.trim();
        const distance_text = document.getElementById('zrhInputDistance').value.trim();
        const historical_summary = document.getElementById('zrhInputHistorical').value.trim();
        const sunnah_tips = document.getElementById('zrhInputSunnahTips').value.trim();
        const image_url = document.getElementById('zrhInputImageUrl').value.trim() || 'assets/hero-twilight.jpg';
        const maps_url = document.getElementById('zrhInputMapsUrl').value.trim();
        const order_index = Number(document.getElementById('zrhInputOrderIndex').value) || 1;
        const status = document.getElementById('zrhInputStatus').value.trim();

        if (!name || !historical_summary) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama tempat dan ulasan sejarah wajib diisi');
            return;
        }

        const allItems = getZiarahData();
        let targetId = id;

        if (targetId) {
            const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(targetId).toUpperCase());
            if (idx !== -1) {
                allItems[idx] = Object.assign({}, allItems[idx], {
                    name, city, location_tag, distance_text, historical_summary,
                    sunnah_tips, image_url, maps_url, order_index, status,
                    updated_at: new Date().toISOString()
                });
            }
        } else {
            let maxNum = 0;
            allItems.forEach(i => {
                const match = String(i.id || '').match(/ZRH-(\d+)/i);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            });
            targetId = 'ZRH-' + String(maxNum + 1).padStart(6, '0');
            allItems.push({
                id: targetId,
                name, city, location_tag, distance_text, historical_summary,
                sunnah_tips, image_url, maps_url, order_index, status,
                created_at: new Date().toISOString()
            });
        }

        allItems.sort((a, b) => (Number(a.order_index) || 99) - (Number(b.order_index) || 99));

        admin.ziarahData = allItems;
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.ZIARAH, admin.ziarahData);
        }

        const mutationPayload = {
            id: targetId,
            name, city, location_tag, distance_text, historical_summary,
            sunnah_tips, image_url, maps_url, order_index, status
        };

        if (typeof admin.pushMutation === 'function') {
            admin.pushMutation('saveZiarahPlace', mutationPayload);
        }

        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalZiarahEditor');
        } else {
            const modal = document.getElementById('modalZiarahEditor');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast('Titik ziarah ' + name + ' berhasil disimpan');
        }

        renderZiarahList();
    }

    function deleteZiarahPlace(id) {
        if (!confirm('Apakah Anda yakin ingin mengarsipkan tempat ziarah ini?')) return;
        const allItems = getZiarahData();
        const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(id).toUpperCase());
        if (idx !== -1) {
            allItems[idx].status = 'ARCHIVED';
            admin.ziarahData = allItems;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.ZIARAH, admin.ziarahData);
            }
            if (typeof admin.pushMutation === 'function') {
                admin.pushMutation('deleteZiarahPlace', { id });
            }
            if (typeof admin.showToast === 'function') {
                admin.showToast('Tempat ziarah ' + id + ' diarsipkan');
            }
            renderZiarahList();
        }
    }

    // View toggles
    function setArticlesViewMode(mode) {
        articlesViewMode = mode;
        if (admin.state) admin.state.articlesViewMode = mode;
        renderArticlesList();
    }

    function setZiarahViewMode(mode) {
        ziarahViewMode = mode;
        if (admin.state) admin.state.ziarahViewMode = mode;
        renderZiarahList();
    }

    // Filters
    function applyArticlesFilter(key, val) {
        articlesFilter[key] = val;
        if (admin.state) admin.state.articlesFilter = articlesFilter;
        renderArticlesList();
    }

    function applyZiarahFilter(key, val) {
        ziarahFilter[key] = val;
        if (admin.state) admin.state.ziarahFilter = ziarahFilter;
        renderZiarahList();
    }

    // Cloud Sync
    async function syncArticlesFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';
        try {
            if (typeof admin.showToast === 'function') admin.showToast('Menghubungi server Apps Script...');

            // 1. Fetch Articles
            const resA = await fetch(syncUrl + '?action=getArticles');
            const jsonA = await resA.json();
            if (jsonA && jsonA.success && Array.isArray(jsonA.data) && jsonA.data.length > 0) {
                admin.articlesData = jsonA.data;
                if (typeof admin.persistStorage === 'function') {
                    admin.persistStorage(admin.STORAGE_KEYS.ARTICLES, admin.articlesData);
                }
            }

            // 2. Fetch Ziarah Places
            const resZ = await fetch(syncUrl + '?action=getZiarahPlaces');
            const jsonZ = await resZ.json();
            if (jsonZ && jsonZ.success && Array.isArray(jsonZ.data) && jsonZ.data.length > 0) {
                admin.ziarahData = jsonZ.data;
                if (typeof admin.persistStorage === 'function') {
                    admin.persistStorage(admin.STORAGE_KEYS.ZIARAH, admin.ziarahData);
                }
            }

            if (typeof admin.showToast === 'function') {
                admin.showToast('Sinkronisasi artikel & titik ziarah berhasil!');
            }
            renderArticles();
        } catch (err) {
            console.error('[SDW_ARTICLES] Sync failed:', err);
            if (typeof admin.showToast === 'function') {
                admin.showToast('Gagal sinkron cloud, menggunakan data lokal cache.');
            }
        }
    }

    // Attach to admin namespace
    admin.renderArticles = renderArticles;
    admin.switchArticlesSubtab = switchSubtab;
    admin.renderArticlesList = renderArticlesList;
    admin.renderZiarahList = renderZiarahList;
    admin.openArticleModal = openArticleModal;
    admin.saveArticle = saveArticle;
    admin.deleteArticle = deleteArticle;
    admin.openZiarahModal = openZiarahModal;
    admin.saveZiarahPlace = saveZiarahPlace;
    admin.deleteZiarahPlace = deleteZiarahPlace;
    admin.setArticlesViewMode = setArticlesViewMode;
    admin.setZiarahViewMode = setZiarahViewMode;
    admin.applyArticlesFilter = applyArticlesFilter;
    admin.applyZiarahFilter = applyZiarahFilter;
    admin.syncArticlesFromCloud = syncArticlesFromCloud;
    admin.getArticlesData = getArticlesData;
    admin.getZiarahData = getZiarahData;
    admin.DEFAULT_ARTICLES = DEFAULT_ARTICLES;
    admin.DEFAULT_ZIARAH = DEFAULT_ZIARAH;

    return admin;
});

