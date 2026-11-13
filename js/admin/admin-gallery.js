/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: GALERI DOKUMENTASI & TESTIMONI JAMAAH
 * File: js/admin/admin-gallery.js
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

    let currentSubtab = 'photos'; // 'photos' | 'testimonials'
    let galleryViewMode = 'table'; // 'table' | 'cards'
    let testimonialsViewMode = 'table'; // 'table' | 'cards'

    let galleryFilter = {
        search: '',
        category: 'ALL',
        status: 'ALL'
    };

    let testimonialsFilter = {
        search: '',
        rating: 'ALL',
        status: 'ALL'
    };

    const DEFAULT_GALLERY = [
        {
            id: 'GAL-000001',
            title: 'Thawaf Wada Kloter Syawal di Depan Ka\'bah',
            category: 'MAKKAH',
            media_type: 'IMAGE',
            media_url: 'assets/hero-haram.png',
            thumbnail_url: 'assets/hero-haram.png',
            caption: 'Momen haru penuh kekhusyukan jamaah mengitari Ka\'bah menjelang kepulangan ke tanah air.',
            kloter_tag: 'Kloter Syawal Bintang 5',
            activity_date: '28 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'GAL-000002',
            title: 'Kekhidmatan Ziarah & Doa di Raudhah Syarifah',
            category: 'MADINAH',
            media_type: 'IMAGE',
            media_url: 'assets/hero-twilight.jpg',
            thumbnail_url: 'assets/hero-twilight.jpg',
            caption: 'Rombongan jamaah didampingi pembimbing ibadah saat sholat sunnah di taman surga Raudhah Nabawi.',
            kloter_tag: 'Kloter Syawal Bintang 5',
            activity_date: '26 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'GAL-000003',
            title: 'Sa\'i Safa-Marwah & Suasana Tahallul',
            category: 'MAKKAH',
            media_type: 'IMAGE',
            media_url: 'assets/pkg-vip-khidmat.png',
            thumbnail_url: 'assets/pkg-vip-khidmat.png',
            caption: 'Kebahagiaan jamaah usai menyelesaikan 7 putaran Sa\'i dan memotong rambut.',
            kloter_tag: 'Kloter VIP Khidmat',
            activity_date: '22 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'GAL-000004',
            title: 'Napak Tilas Jabal Uhud & Syuhada Uhud',
            category: 'ZIARAH',
            media_type: 'IMAGE',
            media_url: 'assets/pkg-ramadhan.webp',
            thumbnail_url: 'assets/pkg-ramadhan.webp',
            caption: 'Tausiyah sirah nabawiyah di kaki bukit pemanah Jabal Rumah.',
            kloter_tag: 'Kloter Ramadhan I\'tikaf',
            activity_date: '18 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: false
        },
        {
            id: 'GAL-000005',
            title: 'Pelepasan Jamaah di Bandara Soekarno-Hatta',
            category: 'BANDARA',
            media_type: 'IMAGE',
            media_url: 'assets/pkg-reguler-syawal.png',
            thumbnail_url: 'assets/pkg-reguler-syawal.png',
            caption: 'Doa bersama dan pembagian paspor sebelum penerbangan Saudia Airlines.',
            kloter_tag: 'Kloter Reguler Awal Musim',
            activity_date: '14 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: false
        },
        {
            id: 'GAL-000006',
            title: 'Sholat Sunnah di Masjid Quba & Kebun Kurma',
            category: 'ZIARAH',
            media_type: 'IMAGE',
            media_url: 'assets/pkg-plus-turki.webp',
            thumbnail_url: 'assets/pkg-plus-turki.webp',
            caption: 'Mengejar pahala setara ibadah umroh di masjid pertama dalam sejarah Islam.',
            kloter_tag: 'Kloter Syawal Bintang 5',
            activity_date: '27 Oktober 2026',
            status: 'PUBLISHED',
            is_featured: true
        }
    ];

    const DEFAULT_TESTIMONIALS = [
        {
            id: 'TSM-000001',
            customer_name: 'H. Bambang Soeprapto & Hj. Nuraini',
            customer_city: 'Surabaya',
            customer_photo: 'assets/pkg-vip-khidmat.png',
            package_name: 'Umroh VIP Khidmat Bintang 5',
            rating: 5,
            review_text: 'Alhamdulillah perjalanan ibadah bersama SDW Umroh sangat berkesan. Hotel Clock Tower persis di depan pelataran Ka\'bah, lift langsung ke masjid sehingga orang tua kami tidak kelelahan. Bimbingan Muthawwif sangat sabar dan sesuai sunnah.',
            video_url: '',
            departure_year: 'Musim 1447H',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'TSM-000002',
            customer_name: 'dr. Hendra Wijaya, Sp.A',
            customer_city: 'Jakarta Selatan',
            customer_photo: 'assets/hero-haram.png',
            package_name: 'Umroh Reguler Syawal Barakah',
            rating: 5,
            review_text: 'Pelayanan dari awal pendaftaran hingga kepulangan sangat transparan dan amanah. Katering makanannya benar-benar masakan Nusantara yang lezat. Sangat direkomendasikan untuk keluarga!',
            video_url: '',
            departure_year: 'Musim 1447H',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'TSM-000003',
            customer_name: 'Ibu Siti Rahmah & Putri',
            customer_city: 'Bandung',
            customer_photo: 'assets/pkg-reguler-syawal.png',
            package_name: 'Umroh Awal Ramadhan 1448H',
            rating: 5,
            review_text: 'Suasana tarawih di Masjidil Haram dan ziarah Raudhah dibimbing dengan sangat baik. Jadwal terorganisir rapi tanpa tergesa-gesa. Terima kasih SDW Umroh atas pelayanan sepenuh hati.',
            video_url: '',
            departure_year: 'Musim 1447H',
            status: 'PUBLISHED',
            is_featured: true
        },
        {
            id: 'TSM-000004',
            customer_name: 'Ust. Syarifuddin Malik',
            customer_city: 'Medan',
            customer_photo: 'assets/hero-twilight.jpg',
            package_name: 'Umroh Plus Turki Musim Semi',
            rating: 5,
            review_text: 'Penerbangan direct tanpa kendala dan hotel di Istanbul maupun Madinah sangat dekat. Tim TL sigap membantu saat bagasi jamaah mendarat. Bintang 5 untuk profesionalitas SDW Umroh.',
            video_url: '',
            departure_year: 'Musim 1446H',
            status: 'PUBLISHED',
            is_featured: false
        }
    ];

    function getGalleryData() {
        if (admin.galleryData && Array.isArray(admin.galleryData) && admin.galleryData.length > 0) {
            return admin.galleryData;
        }
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.GALLERY : 'sdw_admin_gallery');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.galleryData = parsed;
                        return admin.galleryData;
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_GALLERY] Gagal membaca storage gallery:', e);
        }
        admin.galleryData = JSON.parse(JSON.stringify(DEFAULT_GALLERY));
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.GALLERY, admin.galleryData);
        }
        return admin.galleryData;
    }

    function getTestimonialsData() {
        if (admin.testimonialsData && Array.isArray(admin.testimonialsData) && admin.testimonialsData.length > 0) {
            return admin.testimonialsData;
        }
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.TESTIMONIALS : 'sdw_admin_testimonials');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.testimonialsData = parsed;
                        return admin.testimonialsData;
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_GALLERY] Gagal membaca storage testimonials:', e);
        }
        admin.testimonialsData = JSON.parse(JSON.stringify(DEFAULT_TESTIMONIALS));
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.TESTIMONIALS, admin.testimonialsData);
        }
        return admin.testimonialsData;
    }

    // Main Renderer
    function renderGallery() {
        if (typeof document === 'undefined') return;

        // Subtab switcher styling
        const btnPhotos = document.getElementById('btnSubtabGalleryPhotos');
        const btnTestimonials = document.getElementById('btnSubtabGalleryTestimonials');
        const secPhotos = document.getElementById('secGalleryPhotos');
        const secTestimonials = document.getElementById('secGalleryTestimonials');

        if (btnPhotos && btnTestimonials) {
            if (currentSubtab === 'photos') {
                btnPhotos.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-sm transition";
                btnTestimonials.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sdw-pine hover:bg-slate-100 transition";
                if (secPhotos) secPhotos.classList.remove('hidden');
                if (secTestimonials) secTestimonials.classList.add('hidden');
            } else {
                btnTestimonials.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-sm transition";
                btnPhotos.className = "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sdw-pine hover:bg-slate-100 transition";
                if (secPhotos) secPhotos.classList.add('hidden');
                if (secTestimonials) secTestimonials.classList.remove('hidden');
            }
        }

        if (currentSubtab === 'photos') {
            renderGalleryPhotos();
        } else {
            renderTestimonials();
        }
    }

    function switchSubtab(subtab) {
        currentSubtab = subtab;
        if (admin.state) admin.state.gallerySubtab = subtab;
        renderGallery();
    }

    // Render Subtab 1: Galeri Foto & Video
    function renderGalleryPhotos() {
        if (typeof document === 'undefined') return;
        const allItems = getGalleryData();

        // 1. KPI Calculation
        const kpiTotal = document.getElementById('kpi-gallery-total');
        const kpiPublished = document.getElementById('kpi-gallery-published');
        const kpiHaramain = document.getElementById('kpi-gallery-haramain');
        const kpiFeatured = document.getElementById('kpi-gallery-featured');

        const activeCount = allItems.filter(i => (i.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED').length;
        const haramainCount = allItems.filter(i => ['MAKKAH', 'MADINAH'].includes((i.category || '').toUpperCase())).length;
        const featuredCount = allItems.filter(i => i.is_featured === true || String(i.is_featured).toUpperCase() === 'TRUE').length;

        if (kpiTotal) kpiTotal.innerText = allItems.length;
        if (kpiPublished) kpiPublished.innerText = activeCount;
        if (kpiHaramain) kpiHaramain.innerText = haramainCount;
        if (kpiFeatured) kpiFeatured.innerText = featuredCount;

        // 2. Filter logic
        const q = (galleryFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (galleryFilter.category !== 'ALL' && (item.category || '').toUpperCase() !== galleryFilter.category) {
                return false;
            }
            if (galleryFilter.status !== 'ALL' && (item.status || 'PUBLISHED').toUpperCase() !== galleryFilter.status) {
                return false;
            }
            if (q) {
                const matchText = [item.id, item.title, item.caption, item.kloter_tag, item.category].join(' ').toLowerCase();
                if (!matchText.includes(q)) return false;
            }
            return true;
        });

        // 3. Render View Toggle Container
        const tableView = document.getElementById('galleryTableView');
        const cardsView = document.getElementById('galleryCardsView');
        const emptyState = document.getElementById('galleryEmptyState');
        const tableBody = document.getElementById('galleryTableBody');
        const cardsGrid = document.getElementById('galleryCardsGrid');

        const btnViewTable = document.getElementById('btnGalleryViewTable');
        const btnViewCards = document.getElementById('btnGalleryViewCards');

        if (btnViewTable && btnViewCards) {
            if (galleryViewMode === 'table') {
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
                            <img src="${admin.escapeHtml(item.thumbnail_url || item.media_url || 'assets/hero-haram.png')}" 
                                 alt="${admin.escapeHtml(item.title)}" 
                                 class="w-14 h-11 object-cover rounded-lg border border-slate-200 shadow-xs"
                                 onerror="this.src='assets/hero-haram.png'">
                            <div>
                                <span class="font-mono text-[11px] font-bold text-sdw-pine block">${admin.escapeHtml(item.id)}</span>
                                <div class="font-bold text-xs text-slate-900">${admin.escapeHtml(item.title)}</div>
                                <div class="text-[11px] text-slate-500 line-clamp-1">${admin.escapeHtml(item.caption || '-')}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadgeClass}">
                            ${admin.escapeHtml(item.category || 'MAKKAH')}
                        </span>
                        <div class="text-[10px] text-slate-400 mt-0.5 font-medium">${admin.escapeHtml(item.media_type || 'IMAGE')}</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <div class="text-xs font-semibold text-slate-800">${admin.escapeHtml(item.kloter_tag || 'Umum')}</div>
                        <div class="text-[10px] text-slate-500">${admin.escapeHtml(item.activity_date || '-')}</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        ${isFeatured ? `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <i class="fa-solid fa-star text-[9px] text-amber-500"></i> Unggulan
                            </span>
                        ` : `
                            <span class="text-[11px] text-slate-400">Biasa</span>
                        `}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}">
                            ● ${admin.escapeHtml(item.status || 'PUBLISHED')}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-xs">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="SDW_ADMIN.openGalleryModal('${item.id}')" 
                                    class="p-1.5 text-slate-600 hover:text-sdw-pine hover:bg-slate-100 rounded-lg transition" 
                                    title="Edit Foto/Video">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="SDW_ADMIN.deleteGalleryItem('${item.id}')" 
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
                        <img src="${admin.escapeHtml(item.media_url || 'assets/hero-haram.png')}" 
                             alt="${admin.escapeHtml(item.title)}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                             onerror="this.src='assets/hero-haram.png'">
                        <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${catBadgeClass} backdrop-blur-xs">
                                ${admin.escapeHtml(item.category || 'MAKKAH')}
                            </span>
                            ${isFeatured ? `
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/90 text-slate-900 shadow-xs flex items-center gap-1">
                                    <i class="fa-solid fa-star text-[9px]"></i> Unggulan
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
                                <span><i class="fa-regular fa-calendar text-[10px] mr-1"></i>${admin.escapeHtml(item.activity_date || '-')}</span>
                            </div>
                            <h4 class="font-bold text-slate-900 text-sm mb-1 line-clamp-1">${admin.escapeHtml(item.title)}</h4>
                            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">${admin.escapeHtml(item.caption || '-')}</p>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">
                                <i class="fa-solid fa-tags text-[10px] mr-1 text-slate-400"></i>${admin.escapeHtml(item.kloter_tag || 'Umum')}
                            </span>
                            <div class="flex items-center gap-1">
                                <button onclick="SDW_ADMIN.openGalleryModal('${item.id}')" 
                                        class="px-2.5 py-1 text-xs font-semibold text-sdw-pine hover:bg-emerald-50 rounded-lg transition">
                                    Edit
                                </button>
                                <button onclick="SDW_ADMIN.deleteGalleryItem('${item.id}')" 
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

    // Render Subtab 2: Ulasan & Testimoni Jamaah
    function renderTestimonials() {
        if (typeof document === 'undefined') return;
        const allItems = getTestimonialsData();

        // 1. KPI Calculation
        const kpiTotal = document.getElementById('kpi-testi-total');
        const kpiPublished = document.getElementById('kpi-testi-published');
        const kpiAvgRating = document.getElementById('kpi-testi-avgrating');
        const kpiFiveStar = document.getElementById('kpi-testi-fivestar');

        const activeCount = allItems.filter(i => (i.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED').length;
        const fiveStarCount = allItems.filter(i => Number(i.rating) === 5).length;
        const totalRatingSum = allItems.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
        const avgRating = allItems.length > 0 ? (totalRatingSum / allItems.length).toFixed(1) : '5.0';

        if (kpiTotal) kpiTotal.innerText = allItems.length;
        if (kpiPublished) kpiPublished.innerText = activeCount;
        if (kpiAvgRating) kpiAvgRating.innerText = avgRating + ' / 5.0';
        if (kpiFiveStar) kpiFiveStar.innerText = fiveStarCount;

        // 2. Filter logic
        const q = (testimonialsFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (testimonialsFilter.rating !== 'ALL' && String(item.rating) !== String(testimonialsFilter.rating)) {
                return false;
            }
            if (testimonialsFilter.status !== 'ALL' && (item.status || 'PUBLISHED').toUpperCase() !== testimonialsFilter.status) {
                return false;
            }
            if (q) {
                const matchText = [item.id, item.customer_name, item.customer_city, item.package_name, item.review_text, item.departure_year].join(' ').toLowerCase();
                if (!matchText.includes(q)) return false;
            }
            return true;
        });

        // 3. Render View Toggle Container
        const tableView = document.getElementById('testimonialsTableView');
        const cardsView = document.getElementById('testimonialsCardsView');
        const emptyState = document.getElementById('testimonialsEmptyState');
        const tableBody = document.getElementById('testimonialsTableBody');
        const cardsGrid = document.getElementById('testimonialsCardsGrid');

        const btnViewTable = document.getElementById('btnTestiViewTable');
        const btnViewCards = document.getElementById('btnTestiViewCards');

        if (btnViewTable && btnViewCards) {
            if (testimonialsViewMode === 'table') {
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
                const starsHtml = renderStarIcons(item.rating || 5);

                return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <img src="${admin.escapeHtml(item.customer_photo || 'assets/pkg-vip-khidmat.png')}" 
                                 alt="${admin.escapeHtml(item.customer_name)}" 
                                 class="w-10 h-10 object-cover rounded-full border border-slate-200 shadow-xs"
                                 onerror="this.src='assets/hero-haram.png'">
                            <div>
                                <span class="font-mono text-[11px] font-bold text-sdw-pine block">${admin.escapeHtml(item.id)}</span>
                                <div class="font-bold text-xs text-slate-900">${admin.escapeHtml(item.customer_name)}</div>
                                <div class="text-[11px] text-slate-500">${admin.escapeHtml(item.customer_city || 'Indonesia')}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <div class="text-xs font-semibold text-slate-800">${admin.escapeHtml(item.package_name || 'Paket Umroh')}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${admin.escapeHtml(item.departure_year || 'Musim 1447H')}</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <div class="flex items-center gap-1 mb-1">
                            ${starsHtml}
                        </div>
                        <div class="text-[11px] text-slate-600 line-clamp-2 max-w-xs leading-tight">"${admin.escapeHtml(item.review_text)}"</div>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        ${isFeatured ? `
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <i class="fa-solid fa-star text-[9px] text-amber-500"></i> Unggulan
                            </span>
                        ` : `
                            <span class="text-[11px] text-slate-400">Standar</span>
                        `}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-center">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}">
                            ● ${admin.escapeHtml(item.status || 'PUBLISHED')}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right text-xs">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="SDW_ADMIN.openTestimonialModal('${item.id}')" 
                                    class="p-1.5 text-slate-600 hover:text-sdw-pine hover:bg-slate-100 rounded-lg transition" 
                                    title="Edit Testimoni">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button onclick="SDW_ADMIN.deleteTestimonial('${item.id}')" 
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
                const starsHtml = renderStarIcons(item.rating || 5);

                return `
                <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between relative">
                    <div>
                        <div class="flex items-start justify-between gap-3 mb-3">
                            <div class="flex items-center gap-3">
                                <img src="${admin.escapeHtml(item.customer_photo || 'assets/pkg-vip-khidmat.png')}" 
                                     alt="${admin.escapeHtml(item.customer_name)}" 
                                     class="w-12 h-12 rounded-full object-cover border-2 border-sdw-gold/40 shadow-xs"
                                     onerror="this.src='assets/hero-haram.png'">
                                <div>
                                    <h4 class="font-bold text-slate-900 text-sm leading-tight">${admin.escapeHtml(item.customer_name)}</h4>
                                    <div class="text-[11px] text-slate-500">${admin.escapeHtml(item.customer_city || 'Indonesia')} • <span class="font-mono text-sdw-pine">${admin.escapeHtml(item.id)}</span></div>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${isFeatured ? `
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        <i class="fa-solid fa-star text-[9px] text-amber-500"></i>
                                    </span>
                                ` : ''}
                                <span class="w-2.5 h-2.5 rounded-full ${statusColor}" title="${admin.escapeHtml(item.status || 'PUBLISHED')}"></span>
                            </div>
                        </div>

                        <div class="flex items-center gap-1 mb-2">
                            ${starsHtml}
                            <span class="text-xs font-bold text-slate-700 ml-1">${item.rating || 5}.0</span>
                        </div>

                        <p class="text-xs text-slate-600 italic leading-relaxed line-clamp-4 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            "${admin.escapeHtml(item.review_text)}"
                        </p>
                    </div>

                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                            <span class="font-bold text-slate-800 text-[11px] block truncate max-w-[170px]">${admin.escapeHtml(item.package_name || 'Paket Umroh')}</span>
                            <span class="text-[10px] text-slate-400">${admin.escapeHtml(item.departure_year || 'Musim 1447H')}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button onclick="SDW_ADMIN.openTestimonialModal('${item.id}')" 
                                    class="px-2.5 py-1 text-xs font-semibold text-sdw-pine hover:bg-emerald-50 rounded-lg transition">
                                Edit
                            </button>
                            <button onclick="SDW_ADMIN.deleteTestimonial('${item.id}')" 
                                    class="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-lg transition">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    function renderStarIcons(rating) {
        const r = Math.min(5, Math.max(1, Number(rating) || 5));
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= r) {
                stars += '<i class="fa-solid fa-star text-amber-400 text-xs"></i>';
            } else {
                stars += '<i class="fa-regular fa-star text-slate-300 text-xs"></i>';
            }
        }
        return stars;
    }

    function getCategoryBadgeClass(category) {
        switch ((category || '').toUpperCase()) {
            case 'MAKKAH':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'MADINAH':
                return 'bg-teal-100 text-teal-800 border border-teal-200';
            case 'ZIARAH':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            case 'BANDARA':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            default:
                return 'bg-purple-100 text-purple-800 border border-purple-200';
        }
    }

    // Modal Operations: Gallery
    function openGalleryModal(id) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalGalleryEditor');
        const form = document.getElementById('formGalleryEditor');
        const titleEl = document.getElementById('modalGalleryTitle');

        if (!modal || !form) return;

        form.reset();

        if (id) {
            const allItems = getGalleryData();
            const item = allItems.find(i => String(i.id).toUpperCase() === String(id).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = 'Edit Dokumentasi Foto / Video (' + item.id + ')';
                document.getElementById('galleryInputId').value = item.id;
                document.getElementById('galleryInputTitle').value = item.title || '';
                document.getElementById('galleryInputCategory').value = item.category || 'MAKKAH';
                document.getElementById('galleryInputMediaType').value = item.media_type || 'IMAGE';
                document.getElementById('galleryInputMediaUrl').value = item.media_url || '';
                document.getElementById('galleryInputThumbnailUrl').value = item.thumbnail_url || '';
                document.getElementById('galleryInputCaption').value = item.caption || '';
                document.getElementById('galleryInputKloterTag').value = item.kloter_tag || '';
                document.getElementById('galleryInputActivityDate').value = item.activity_date || '';
                document.getElementById('galleryInputStatus').value = item.status || 'PUBLISHED';
                document.getElementById('galleryInputFeatured').checked = (item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE');
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Dokumentasi Baru';
            document.getElementById('galleryInputId').value = '';
            document.getElementById('galleryInputCategory').value = 'MAKKAH';
            document.getElementById('galleryInputMediaType').value = 'IMAGE';
            document.getElementById('galleryInputMediaUrl').value = 'assets/hero-haram.png';
            document.getElementById('galleryInputThumbnailUrl').value = 'assets/hero-haram.png';
            document.getElementById('galleryInputStatus').value = 'PUBLISHED';
            document.getElementById('galleryInputFeatured').checked = false;
        }

        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function saveGalleryItem(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const id = document.getElementById('galleryInputId').value.trim();
        const title = document.getElementById('galleryInputTitle').value.trim();
        const category = document.getElementById('galleryInputCategory').value.trim();
        const media_type = document.getElementById('galleryInputMediaType').value.trim();
        const media_url = document.getElementById('galleryInputMediaUrl').value.trim() || 'assets/hero-haram.png';
        const thumbnail_url = document.getElementById('galleryInputThumbnailUrl').value.trim() || media_url;
        const caption = document.getElementById('galleryInputCaption').value.trim();
        const kloter_tag = document.getElementById('galleryInputKloterTag').value.trim();
        const activity_date = document.getElementById('galleryInputActivityDate').value.trim();
        const status = document.getElementById('galleryInputStatus').value.trim();
        const is_featured = document.getElementById('galleryInputFeatured').checked;

        if (!title) {
            if (typeof admin.showToast === 'function') admin.showToast('Judul dokumentasi wajib diisi');
            return;
        }

        const allItems = getGalleryData();
        let targetId = id;

        if (targetId) {
            const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(targetId).toUpperCase());
            if (idx !== -1) {
                allItems[idx] = Object.assign({}, allItems[idx], {
                    title, category, media_type, media_url, thumbnail_url,
                    caption, kloter_tag, activity_date, status, is_featured,
                    updated_at: new Date().toISOString()
                });
            }
        } else {
            let maxNum = 0;
            allItems.forEach(i => {
                const match = String(i.id || '').match(/GAL-(\d+)/i);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            });
            targetId = 'GAL-' + String(maxNum + 1).padStart(6, '0');
            allItems.unshift({
                id: targetId,
                title, category, media_type, media_url, thumbnail_url,
                caption, kloter_tag, activity_date, status, is_featured,
                created_at: new Date().toISOString()
            });
        }

        admin.galleryData = allItems;
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.GALLERY, admin.galleryData);
        }

        // Send mutation to Apps Script via background / sync queue
        const mutationPayload = {
            id: targetId,
            title, category, media_type, media_url, thumbnail_url,
            caption, kloter_tag, activity_date, status, is_featured
        };

        if (typeof admin.pushMutation === 'function') {
            admin.pushMutation('saveGalleryItem', mutationPayload);
        }

        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalGalleryEditor');
        } else {
            const modal = document.getElementById('modalGalleryEditor');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast('Dokumentasi ' + targetId + ' berhasil disimpan');
        }

        renderGalleryPhotos();
    }

    function deleteGalleryItem(id) {
        if (!confirm('Apakah Anda yakin ingin mengarsipkan dokumentasi ini?')) return;
        const allItems = getGalleryData();
        const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(id).toUpperCase());
        if (idx !== -1) {
            allItems[idx].status = 'ARCHIVED';
            admin.galleryData = allItems;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.GALLERY, admin.galleryData);
            }
            if (typeof admin.pushMutation === 'function') {
                admin.pushMutation('deleteGalleryItem', { id });
            }
            if (typeof admin.showToast === 'function') {
                admin.showToast('Dokumentasi ' + id + ' diarsipkan');
            }
            renderGalleryPhotos();
        }
    }

    // Modal Operations: Testimonial
    function openTestimonialModal(id) {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalTestimonialEditor');
        const form = document.getElementById('formTestimonialEditor');
        const titleEl = document.getElementById('modalTestimonialTitle');

        if (!modal || !form) return;

        form.reset();

        if (id) {
            const allItems = getTestimonialsData();
            const item = allItems.find(i => String(i.id).toUpperCase() === String(id).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = 'Edit Ulasan / Testimoni (' + item.id + ')';
                document.getElementById('testiInputId').value = item.id;
                document.getElementById('testiInputName').value = item.customer_name || '';
                document.getElementById('testiInputCity').value = item.customer_city || '';
                document.getElementById('testiInputPhoto').value = item.customer_photo || '';
                document.getElementById('testiInputPackage').value = item.package_name || '';
                document.getElementById('testiInputRating').value = item.rating || 5;
                document.getElementById('testiInputReview').value = item.review_text || '';
                document.getElementById('testiInputVideo').value = item.video_url || '';
                document.getElementById('testiInputYear').value = item.departure_year || 'Musim 1447H';
                document.getElementById('testiInputStatus').value = item.status || 'PUBLISHED';
                document.getElementById('testiInputFeatured').checked = (item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE');
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Testimoni Baru';
            document.getElementById('testiInputId').value = '';
            document.getElementById('testiInputPhoto').value = 'assets/pkg-vip-khidmat.png';
            document.getElementById('testiInputRating').value = 5;
            document.getElementById('testiInputYear').value = 'Musim 1447H';
            document.getElementById('testiInputStatus').value = 'PUBLISHED';
            document.getElementById('testiInputFeatured').checked = true;
        }

        modal.classList.add('active');
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }

    function saveTestimonial(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const id = document.getElementById('testiInputId').value.trim();
        const customer_name = document.getElementById('testiInputName').value.trim();
        const customer_city = document.getElementById('testiInputCity').value.trim();
        const customer_photo = document.getElementById('testiInputPhoto').value.trim() || 'assets/pkg-vip-khidmat.png';
        const package_name = document.getElementById('testiInputPackage').value.trim();
        const rating = Number(document.getElementById('testiInputRating').value) || 5;
        const review_text = document.getElementById('testiInputReview').value.trim();
        const video_url = document.getElementById('testiInputVideo').value.trim();
        const departure_year = document.getElementById('testiInputYear').value.trim() || 'Musim 1447H';
        const status = document.getElementById('testiInputStatus').value.trim();
        const is_featured = document.getElementById('testiInputFeatured').checked;

        if (!customer_name || !review_text) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama jamaah dan teks ulasan wajib diisi');
            return;
        }

        const allItems = getTestimonialsData();
        let targetId = id;

        if (targetId) {
            const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(targetId).toUpperCase());
            if (idx !== -1) {
                allItems[idx] = Object.assign({}, allItems[idx], {
                    customer_name, customer_city, customer_photo, package_name,
                    rating, review_text, video_url, departure_year, status, is_featured,
                    updated_at: new Date().toISOString()
                });
            }
        } else {
            let maxNum = 0;
            allItems.forEach(i => {
                const match = String(i.id || '').match(/TSM-(\d+)/i);
                if (match) {
                    const n = parseInt(match[1], 10);
                    if (n > maxNum) maxNum = n;
                }
            });
            targetId = 'TSM-' + String(maxNum + 1).padStart(6, '0');
            allItems.unshift({
                id: targetId,
                customer_name, customer_city, customer_photo, package_name,
                rating, review_text, video_url, departure_year, status, is_featured,
                created_at: new Date().toISOString()
            });
        }

        admin.testimonialsData = allItems;
        if (typeof admin.persistStorage === 'function') {
            admin.persistStorage(admin.STORAGE_KEYS.TESTIMONIALS, admin.testimonialsData);
        }

        const mutationPayload = {
            id: targetId,
            customer_name, customer_city, customer_photo, package_name,
            rating, review_text, video_url, departure_year, status, is_featured
        };

        if (typeof admin.pushMutation === 'function') {
            admin.pushMutation('saveTestimonial', mutationPayload);
        }

        if (typeof admin.closeModal === 'function') {
            admin.closeModal('modalTestimonialEditor');
        } else {
            const modal = document.getElementById('modalTestimonialEditor');
            if (modal) {
                modal.classList.remove('active');
                modal.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast('Testimoni dari ' + customer_name + ' berhasil disimpan');
        }

        renderTestimonials();
    }

    function deleteTestimonial(id) {
        if (!confirm('Apakah Anda yakin ingin mengarsipkan testimoni ini?')) return;
        const allItems = getTestimonialsData();
        const idx = allItems.findIndex(i => String(i.id).toUpperCase() === String(id).toUpperCase());
        if (idx !== -1) {
            allItems[idx].status = 'ARCHIVED';
            admin.testimonialsData = allItems;
            if (typeof admin.persistStorage === 'function') {
                admin.persistStorage(admin.STORAGE_KEYS.TESTIMONIALS, admin.testimonialsData);
            }
            if (typeof admin.pushMutation === 'function') {
                admin.pushMutation('deleteTestimonial', { id });
            }
            if (typeof admin.showToast === 'function') {
                admin.showToast('Testimoni ' + id + ' diarsipkan');
            }
            renderTestimonials();
        }
    }

    // View toggles
    function setGalleryViewMode(mode) {
        galleryViewMode = mode;
        if (admin.state) admin.state.galleryViewMode = mode;
        renderGalleryPhotos();
    }

    function setTestimonialsViewMode(mode) {
        testimonialsViewMode = mode;
        if (admin.state) admin.state.testimonialsViewMode = mode;
        renderTestimonials();
    }

    // Filters
    function applyGalleryFilter(key, val) {
        galleryFilter[key] = val;
        if (admin.state) admin.state.galleryFilter = galleryFilter;
        renderGalleryPhotos();
    }

    function applyTestimonialsFilter(key, val) {
        testimonialsFilter[key] = val;
        if (admin.state) admin.state.testimonialsFilter = testimonialsFilter;
        renderTestimonials();
    }

    // Cloud Sync
    async function syncGalleryFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';
        try {
            if (typeof admin.showToast === 'function') admin.showToast('Menghubungi server Apps Script...');
            
            // 1. Fetch Gallery
            const resG = await fetch(syncUrl + '?action=getGallery');
            const jsonG = await resG.json();
            if (jsonG && jsonG.success && Array.isArray(jsonG.data) && jsonG.data.length > 0) {
                admin.galleryData = jsonG.data;
                if (typeof admin.persistStorage === 'function') {
                    admin.persistStorage(admin.STORAGE_KEYS.GALLERY, admin.galleryData);
                }
            }

            // 2. Fetch Testimonials
            const resT = await fetch(syncUrl + '?action=getTestimonials');
            const jsonT = await resT.json();
            if (jsonT && jsonT.success && Array.isArray(jsonT.data) && jsonT.data.length > 0) {
                admin.testimonialsData = jsonT.data;
                if (typeof admin.persistStorage === 'function') {
                    admin.persistStorage(admin.STORAGE_KEYS.TESTIMONIALS, admin.testimonialsData);
                }
            }

            if (typeof admin.showToast === 'function') {
                admin.showToast('Sinkronisasi galeri & testimoni berhasil!');
            }
            renderGallery();
        } catch (err) {
            console.error('[SDW_GALLERY] Sync failed:', err);
            if (typeof admin.showToast === 'function') {
                admin.showToast('Gagal sinkron cloud, menggunakan data lokal cache.');
            }
        }
    }

    // Attach to admin namespace
    admin.renderGallery = renderGallery;
    admin.switchGallerySubtab = switchSubtab;
    admin.renderGalleryPhotos = renderGalleryPhotos;
    admin.renderTestimonials = renderTestimonials;
    admin.openGalleryModal = openGalleryModal;
    admin.saveGalleryItem = saveGalleryItem;
    admin.deleteGalleryItem = deleteGalleryItem;
    admin.openTestimonialModal = openTestimonialModal;
    admin.saveTestimonial = saveTestimonial;
    admin.deleteTestimonial = deleteTestimonial;
    admin.setGalleryViewMode = setGalleryViewMode;
    admin.setTestimonialsViewMode = setTestimonialsViewMode;
    admin.applyGalleryFilter = applyGalleryFilter;
    admin.applyTestimonialsFilter = applyTestimonialsFilter;
    admin.syncGalleryFromCloud = syncGalleryFromCloud;
    admin.getGalleryData = getGalleryData;
    admin.getTestimonialsData = getTestimonialsData;
    admin.DEFAULT_GALLERY = DEFAULT_GALLERY;
    admin.DEFAULT_TESTIMONIALS = DEFAULT_TESTIMONIALS;

    return admin;
});

