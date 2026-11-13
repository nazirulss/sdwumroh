/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: KATALOG PILIHAN PAKET UMROH & HAJI KHUSUS
 * File: js/admin/admin-packages.js
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

    let viewMode = 'table'; // 'table' | 'cards'
    let currentFilter = {
        search: '',
        category: 'ALL',
        status: 'ALL'
    };

    const DEFAULT_PACKAGE_METADATA = {
        'PKG-000001': {
            name: 'Umroh Reguler Syawal Barakah',
            slug: 'umroh-reguler-syawal',
            package_type: 'REGULER',
            duration_days: 9,
            status: 'PUBLISHED',
            description: 'Perjalanan ibadah penuh kekhusyukan dengan bimbingan asatidz berpengalaman, hotel bintang 4 dekat pelataran masjid.',
            hotel_makkah: 'Retaj Al Rayyan / Setaraf (350m)',
            hotel_madinah: 'Concorde Dar Al Khair (200m)',
            airline: 'Saudia Airlines (Direct SV)',
            seats_left: 7,
            badge: 'Best Seller',
            image_url: 'assets/pkg-reguler-syawal.png',
            rating: '4.9/5 (182 ulasan)',
            starting_price: 29500000,
            quad_price: 29500000,
            triple_price: 31500000,
            double_price: 34500000,
            discount_label: 'Hemat Rp 3 Jt'
        },
        'PKG-000002': {
            name: 'Umroh VIP Khidmat Akhir Tahun',
            slug: 'umroh-vip-akhir-tahun',
            package_type: 'VIP',
            duration_days: 12,
            status: 'PUBLISHED',
            description: 'Akomodasi bintang 5 di pelataran Ka\'bah (Clock Tower), kereta cepat Haramain High Speed Rail Makkah–Madinah.',
            hotel_makkah: 'Swissotel Makkah Clock Tower (0m)',
            hotel_madinah: 'Dar Al Taqwa Madinah (50m)',
            airline: 'Garuda Indonesia (GA980)',
            seats_left: 8,
            badge: 'Hampir Penuh',
            image_url: 'assets/pkg-vip-khidmat.png',
            rating: '5.0/5 (94 ulasan)',
            starting_price: 43500000,
            quad_price: 43500000,
            triple_price: 46500000,
            double_price: 49500000,
            discount_label: 'Hemat Rp 2,5 Jt'
        },
        'PKG-000003': {
            name: 'Umroh Plus Turki Musim Semi',
            slug: 'umroh-plus-turki-spring',
            package_type: 'PLUS_TOUR',
            duration_days: 13,
            status: 'PUBLISHED',
            description: 'Ziarah jejak peradaban Utsmaniyah di Istanbul, Selat Bosphorus, dilanjutkan manasik intensif dan ibadah di dua Tanah Suci.',
            hotel_makkah: 'Anjum Hotel Makkah',
            hotel_madinah: 'Rove Al Madinah',
            airline: 'Turkish Airlines (TK-57)',
            seats_left: 18,
            badge: 'Favorit Keluarga',
            image_url: 'assets/pkg-plus-turki.png',
            rating: '4.8/5 (65 ulasan)',
            starting_price: 38900000,
            quad_price: 38900000,
            triple_price: 41900000,
            double_price: 45900000,
            discount_label: 'Hemat Rp 3 Jt'
        },
        'PKG-000004': {
            name: 'Umroh Awal Ramadhan 1448H',
            slug: 'umroh-ramadhan-awal',
            package_type: 'RAMADHAN',
            duration_days: 10,
            status: 'PUBLISHED',
            description: 'Meraih keutamaan pahala haji bersama Rasulullah dengan tarawih di Masjidil Haram pada fase awal bulan suci.',
            hotel_makkah: 'Pullman Zamzam Makkah',
            hotel_madinah: 'Grand Plaza Madinah',
            airline: 'Saudia Airlines',
            seats_left: 4,
            badge: 'Spesial Ramadhan',
            image_url: 'assets/pkg-ramadhan.png',
            rating: '4.9/5 (120 ulasan)',
            starting_price: 36500000,
            quad_price: 36500000,
            triple_price: 39500000,
            double_price: 43500000,
            discount_label: 'Hemat Rp 3 Jt'
        },
        'PKG-000005': {
            name: 'Umroh Syariah Bintang Tiga Hemat',
            slug: 'umroh-hemat-syariah',
            package_type: 'HEMAT',
            duration_days: 9,
            status: 'PUBLISHED',
            description: 'Program umroh ekonomis mengutamakan kenyamanan esensial, bus full AC dan bimbingan ibadah terstruktur.',
            hotel_makkah: 'Olayan Ajyad (600m Shuttle)',
            hotel_madinah: 'Durrat Al Eiman',
            airline: 'Lion Air Umrah Direct',
            seats_left: 36,
            badge: 'Paling Hemat',
            image_url: 'assets/pkg-hemat.png',
            rating: '4.7/5 (210 ulasan)',
            starting_price: 26800000,
            quad_price: 26800000,
            triple_price: 28800000,
            double_price: 31800000,
            discount_label: 'Hemat Rp 1,7 Jt'
        }
    };

    function normalizePackage(pkg) {
        if (!pkg || typeof pkg !== 'object') return pkg;
        const id = String(pkg.id || '');
        const def = DEFAULT_PACKAGE_METADATA[id] || {};

        let pkgType = String(pkg.package_type || def.package_type || 'REGULER').toUpperCase().trim();
        if (pkgType === 'REGULAR') pkgType = 'REGULER';
        if (pkgType === 'PLUS_TURKEY' || pkgType === 'PLUS_WISATA') pkgType = 'PLUS_TOUR';

        const quadPrice = Number(pkg.quad_price || pkg.starting_price || def.quad_price || def.starting_price || 29500000);
        const triplePrice = Number(pkg.triple_price || def.triple_price || (quadPrice + 2000000));
        const doublePrice = Number(pkg.double_price || def.double_price || (quadPrice + 5000000));

        let seats = pkg.seats_left !== undefined && pkg.seats_left !== '' ? Number(pkg.seats_left) : (def.seats_left || 15);

        return {
            ...pkg,
            name: pkg.name || def.name || 'Paket Umroh',
            slug: pkg.slug || def.slug || (String(pkg.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')),
            package_type: pkgType,
            duration_days: Number(pkg.duration_days) || def.duration_days || 9,
            status: pkg.status || def.status || 'PUBLISHED',
            description: pkg.description || def.description || '',
            hotel_makkah: pkg.hotel_makkah || def.hotel_makkah || 'Hotel Bintang Makkah',
            hotel_madinah: pkg.hotel_madinah || def.hotel_madinah || 'Hotel Bintang Madinah',
            airline: pkg.airline || def.airline || 'Saudia Airlines',
            seats_left: seats,
            badge: pkg.badge || def.badge || 'Program Pilihan',
            image_url: pkg.image_url || pkg.image || def.image_url || 'assets/hero-haram.png',
            image: pkg.image_url || pkg.image || def.image_url || 'assets/hero-haram.png',
            rating: pkg.rating || def.rating || '4.9/5 (100+ ulasan)',
            starting_price: quadPrice,
            quad_price: quadPrice,
            triple_price: triplePrice,
            double_price: doublePrice,
            discount_label: pkg.discount_label || def.discount_label || ''
        };
    }

    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(Number(amount) || 0);
    }

    function initPackagesData() {
        if (!admin.packagesData || admin.packagesData.length === 0) {
            if (typeof MOCK_DATA !== 'undefined' && Array.isArray(MOCK_DATA.packages)) {
                admin.packagesData = MOCK_DATA.packages.map(normalizePackage);
            } else {
                admin.packagesData = Object.keys(DEFAULT_PACKAGE_METADATA).map(function(id) {
                    return JSON.parse(JSON.stringify(DEFAULT_PACKAGE_METADATA[id]));
                });
            }
        } else {
            admin.packagesData = admin.packagesData.map(normalizePackage);
        }
    }

    // 1. RENDER UTAMA
    function renderPackages() {
        initPackagesData();
        if (typeof document === 'undefined') return;

        // Auto background sync pada pemanggilan pertama jika online
        if (!admin._packagesAutoSynced && typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            admin._packagesAutoSynced = true;
            setTimeout(function() {
                syncPackagesFromCloud(false);
            }, 100);
        }

        const tableBody = document.getElementById('table-packages-body');
        const cardsGrid = document.getElementById('package-cards-grid');
        const emptyState = document.getElementById('packageEmptyState');
        const badgeCount = document.getElementById('badgePackageCount');

        const packages = admin.packagesData || [];

        // Update KPI Strip
        const total = packages.length;
        const published = packages.filter(p => p.status === 'PUBLISHED').length;
        const draft = packages.filter(p => p.status === 'DRAFT' || p.status === 'IN_REVIEW').length;
        const totalSeats = packages.reduce((acc, p) => acc + (Number(p.seats_left) || 0), 0);

        const elTotal = document.getElementById('kpiTotalPackages');
        const elPub = document.getElementById('kpiPublishedPackages');
        const elDraft = document.getElementById('kpiDraftPackages');
        const elSeats = document.getElementById('kpiTotalSeats');

        if (elTotal) elTotal.innerText = total;
        if (elPub) elPub.innerText = published;
        if (elDraft) elDraft.innerText = draft;
        if (elSeats) elSeats.innerText = totalSeats;
        if (badgeCount) badgeCount.innerText = published > 0 ? `${published} Live` : 'Live';

        // Filter data
        const filtered = packages.filter(p => {
            const q = currentFilter.search.toLowerCase();
            const matchSearch = !q ||
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.hotel_makkah && p.hotel_makkah.toLowerCase().includes(q)) ||
                (p.hotel_madinah && p.hotel_madinah.toLowerCase().includes(q)) ||
                (p.airline && p.airline.toLowerCase().includes(q)) ||
                (p.id && p.id.toLowerCase().includes(q));

            const matchCat = currentFilter.category === 'ALL' || p.package_type === currentFilter.category;
            const matchStatus = currentFilter.status === 'ALL' || p.status === currentFilter.status;

            return matchSearch && matchCat && matchStatus;
        });

        if (filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table Datagrid
        if (tableBody) {
            tableBody.innerHTML = filtered.map(pkg => {
                const isPublished = pkg.status === 'PUBLISHED';
                const statusBadge = isPublished
                    ? `<span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                         <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tayang
                       </span>`
                    : `<span class="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                         <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Draft
                       </span>`;

                const typeBadgeClass = {
                    'REGULER': 'bg-blue-50 text-blue-700 border-blue-200',
                    'VIP': 'bg-purple-50 text-purple-700 border-purple-200',
                    'RAMADHAN': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'PLUS_TOUR': 'bg-amber-50 text-amber-700 border-amber-200',
                    'HEMAT': 'bg-rose-50 text-rose-700 border-rose-200'
                }[pkg.package_type] || 'bg-slate-50 text-slate-700 border-slate-200';

                const bannerSrc = pkg.image_url || pkg.image || 'assets/hero-haram.png';

                return `
                    <tr class="hover:bg-slate-50/80 transition border-b border-slate-100 text-xs">
                        <td class="px-3.5 py-2.5">
                            <div class="flex items-center gap-3">
                                <div class="relative w-14 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs shrink-0 group cursor-pointer" onclick="SDW_ADMIN.openPackageModal('${pkg.id}')" title="Klik untuk edit paket / ganti banner">
                                    <img src="${bannerSrc}" 
                                         alt="${pkg.name}" 
                                         onerror="this.onerror=null;this.src='assets/hero-haram.png';" 
                                         class="w-full h-full object-cover group-hover:scale-110 transition duration-300">
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <i class="fa-solid fa-pen text-white text-[9px]"></i>
                                    </div>
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span class="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">${pkg.id}</span>
                                        <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border ${typeBadgeClass}">
                                            ${pkg.package_type}
                                        </span>
                                    </div>
                                    <div class="font-extrabold text-slate-900 leading-snug truncate max-w-[210px] text-xs hover:text-sdw-pine cursor-pointer" onclick="SDW_ADMIN.openPackageModal('${pkg.id}')" title="${pkg.name}">
                                        ${pkg.name}
                                    </div>
                                    <div class="text-[10.5px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span><i class="fa-regular fa-clock text-amber-500 mr-1"></i>${pkg.duration_days} Hari</span>
                                        <span>•</span>
                                        <span class="text-sdw-pine font-semibold truncate max-w-[120px]">${pkg.badge || 'Program Pilihan'}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-2.5 text-slate-700">
                            <div class="truncate max-w-[180px]" title="Makkah: ${pkg.hotel_makkah || '-'}">
                                <i class="fa-solid fa-hotel text-sdw-gold mr-1 text-[10px]"></i>
                                <span class="font-medium text-slate-800">${pkg.hotel_makkah || '-'}</span>
                            </div>
                            <div class="truncate max-w-[180px] text-slate-500 text-[11px] mt-0.5" title="Madinah: ${pkg.hotel_madinah || '-'}">
                                <i class="fa-solid fa-hotel text-purple-400 mr-1 text-[10px]"></i>
                                <span>${pkg.hotel_madinah || '-'}</span>
                            </div>
                        </td>
                        <td class="px-3 py-2.5 text-slate-700">
                            <div class="flex items-center gap-1.5 font-semibold">
                                <i class="fa-solid fa-plane text-sky-500 text-[11px] shrink-0"></i>
                                <span class="truncate max-w-[130px]" title="${pkg.airline || 'Saudia Airlines'}">${pkg.airline || 'Saudia Airlines'}</span>
                            </div>
                        </td>
                        <td class="px-3 py-2.5 font-mono font-bold text-sdw-pine">
                            <div class="whitespace-nowrap">${formatRupiah(pkg.quad_price || pkg.starting_price)}</div>
                            ${pkg.discount_label ? `<span class="text-[10px] text-emerald-600 font-semibold block leading-tight whitespace-nowrap">${pkg.discount_label}</span>` : ''}
                        </td>
                        <td class="px-2 py-2.5 text-center">
                            <span class="font-extrabold ${(Number(pkg.seats_left) || 0) > 5 ? 'text-emerald-700' : 'text-rose-700'}">
                                ${pkg.seats_left !== undefined ? pkg.seats_left : 15}
                            </span>
                        </td>
                        <td class="px-2 py-2.5 text-center">
                            <button type="button" onclick="SDW_ADMIN.togglePackageStatus('${pkg.id}')" title="Klik untuk beralih status tayang" class="cursor-pointer transition active:scale-95">
                                ${statusBadge}
                            </button>
                        </td>
                        <td class="px-3 py-2.5 text-right whitespace-nowrap">
                            <div class="inline-flex items-center gap-1">
                                <button type="button" onclick="SDW_ADMIN.openPackageModal('${pkg.id}')" class="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 text-sdw-pine flex items-center justify-center transition cursor-pointer" title="Edit Paket">
                                    <i class="fa-solid fa-pen-to-square text-[11px]"></i>
                                </button>
                                <button type="button" onclick="SDW_ADMIN.previewPackageWeb('${pkg.id}')" class="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition cursor-pointer" title="Pratinjau di Website">
                                    <i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
                                </button>
                                <button type="button" onclick="SDW_ADMIN.deletePackage('${pkg.id}')" class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer" title="Hapus / Arsipkan">
                                    <i class="fa-solid fa-trash-can text-[11px]"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render Visual Cards Grid
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(pkg => `
                <div class="bg-white rounded-3xl overflow-hidden border border-purple-100 shadow-md hover:shadow-xl transition flex flex-col group relative">
                    <div class="relative h-44 overflow-hidden bg-slate-900">
                        <img src="${pkg.image_url || pkg.image || 'assets/hero-haram.png'}" alt="${pkg.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sdw-pine/90 backdrop-blur-md text-amber-300 text-[10px] font-extrabold border border-amber-400/30">
                            ${pkg.badge || 'Program Pilihan'}
                        </span>
                        <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9.5px] font-black ${pkg.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}">
                            ${pkg.status}
                        </span>
                        <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white">
                            <span class="font-bold flex items-center gap-1.5"><i class="fa-regular fa-clock text-amber-400"></i> ${pkg.duration_days} Hari</span>
                            <span class="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold"><i class="fa-solid fa-plane text-emerald-400"></i> ${pkg.airline || 'Direct Flight'}</span>
                        </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                            <div class="flex items-center justify-between text-[11px] mb-1">
                                <span class="text-purple-900 font-bold uppercase text-[10px] tracking-wider">${pkg.package_type}</span>
                                <span class="font-bold ${(Number(pkg.seats_left) || 0) > 5 ? 'text-emerald-700' : 'text-rose-700'}">
                                    <i class="fa-solid fa-chair mr-1"></i>Sisa ${pkg.seats_left !== undefined ? pkg.seats_left : 15} Seat
                                </span>
                            </div>
                            <h4 class="font-black text-sm text-slate-900 group-hover:text-sdw-pine transition leading-snug line-clamp-1">${pkg.name}</h4>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${pkg.description || 'Program perjalanan ibadah umroh berkesan dengan fasilitas terbaik.'}</p>
                            
                            <div class="mt-3 pt-2.5 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                                <div class="truncate"><i class="fa-solid fa-hotel text-amber-500 mr-1.5"></i>Makkah: <strong>${pkg.hotel_makkah || '-'}</strong></div>
                                <div class="truncate"><i class="fa-solid fa-hotel text-purple-400 mr-1.5"></i>Madinah: <strong>${pkg.hotel_madinah || '-'}</strong></div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <span class="text-[10px] text-slate-400 block">Mulai dari (Quad):</span>
                                <span class="text-sm font-black text-sdw-pine font-mono">${formatRupiah(pkg.quad_price || pkg.starting_price)}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="SDW_ADMIN.openPackageModal('${pkg.id}')" class="px-3 py-1.5 rounded-xl bg-sdw-pine text-white text-xs font-bold hover:bg-purple-900 transition cursor-pointer">
                                    Edit
                                </button>
                                <button type="button" onclick="SDW_ADMIN.previewPackageWeb('${pkg.id}')" class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer" title="Preview Web">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // 2. SWITCH VIEW MODE
    function switchPackageViewMode(mode) {
        viewMode = mode;
        if (typeof document === 'undefined') return;

        const tableView = document.getElementById('packageTableView');
        const cardsView = document.getElementById('packageCardsView');
        const btnTable = document.getElementById('btnPackageViewTable');
        const btnCards = document.getElementById('btnPackageViewCards');

        if (mode === 'cards') {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-sdw-pine text-white shadow-xs transition cursor-pointer flex items-center gap-1.5';
            }
        } else {
            if (tableView) tableView.classList.remove('hidden');
            if (cardsView) cardsView.classList.add('hidden');
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-xl text-xs font-black bg-sdw-pine text-white shadow-xs transition cursor-pointer flex items-center gap-1.5';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5';
            }
        }
    }

    // 3. SEARCH & FILTERS
    function onPackageSearch(query) {
        currentFilter.search = query || '';
        renderPackages();
    }

    function onPackageCategoryChange(cat) {
        currentFilter.category = cat || 'ALL';
        renderPackages();
    }

    function onPackageStatusChange(st) {
        currentFilter.status = st || 'ALL';
        renderPackages();
    }

    // 4. MODAL CRUD
    function openPackageModal(packageId) {
        initPackagesData();
        if (typeof document === 'undefined') return;

        const modal = document.getElementById('modalPackageEditor');
        const form = document.getElementById('formPackageEditor');
        const modalTitle = document.getElementById('modalPackageEditorTitle');
        if (!modal) return;

        if (packageId) {
            const pkg = (admin.packagesData || []).find(p => p.id === packageId);
            if (pkg) {
                if (modalTitle) modalTitle.innerText = `Edit Paket: ${pkg.name}`;
                setInputValue('pkgId', pkg.id);
                setInputValue('pkgName', pkg.name || '');
                setInputValue('pkgSlug', pkg.slug || '');
                setInputValue('pkgType', pkg.package_type || 'REGULER');
                setInputValue('pkgDuration', pkg.duration_days || 9);
                setInputValue('pkgStatus', pkg.status || 'PUBLISHED');
                setInputValue('pkgBadge', pkg.badge || 'Program Pilihan');
                setInputValue('pkgSeats', pkg.seats_left !== undefined ? pkg.seats_left : 15);
                setInputValue('pkgRating', pkg.rating || '4.9/5 (100+ ulasan)');
                setInputValue('pkgDiscount', pkg.discount_label || '');

                setInputValue('pkgHotelMakkah', pkg.hotel_makkah || '');
                setInputValue('pkgHotelMadinah', pkg.hotel_madinah || '');
                setInputValue('pkgAirline', pkg.airline || 'Saudia Airlines');

                setInputValue('pkgQuadPrice', pkg.quad_price || pkg.starting_price || 29500000);
                setInputValue('pkgTriplePrice', pkg.triple_price || 31500000);
                setInputValue('pkgDoublePrice', pkg.double_price || 34500000);

                setInputValue('pkgImageUrl', pkg.image_url || pkg.image || 'assets/hero-haram.png');
                setInputValue('pkgDescription', pkg.description || '');

                const previewImg = document.getElementById('pkgImagePreview');
                if (previewImg) previewImg.src = pkg.image_url || pkg.image || 'assets/hero-haram.png';
                const statusEl = document.getElementById('pkgImageUploadStatus');
                if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-check text-xs text-emerald-600"></i> Banner aktif';
            }
        } else {
            if (modalTitle) modalTitle.innerText = 'Tambah Paket Umroh Baru';
            if (form) form.reset();
            setInputValue('pkgId', '');
            setInputValue('pkgDuration', 9);
            setInputValue('pkgStatus', 'PUBLISHED');
            setInputValue('pkgSeats', 20);
            setInputValue('pkgType', 'REGULER');
            setInputValue('pkgRating', '5.0/5 (Ulasan Baru)');
            setInputValue('pkgQuadPrice', 32500000);
            setInputValue('pkgTriplePrice', 34500000);
            setInputValue('pkgDoublePrice', 37500000);
            setInputValue('pkgImageUrl', 'assets/hero-haram.png');

            const previewImg = document.getElementById('pkgImagePreview');
            if (previewImg) previewImg.src = 'assets/hero-haram.png';
            const statusEl = document.getElementById('pkgImageUploadStatus');
            if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-check text-xs text-emerald-600"></i> Banner default (Pilih / Upload)';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function setInputValue(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    // Upload Handler Gambar Banner Paket
    function handlePackageImageUpload(input) {
        if (!input || !input.files || !input.files[0]) return;
        const file = input.files[0];

        if (!file.type.match('image.*')) {
            if (admin.showToast) admin.showToast('File yang dipilih harus berupa gambar!');
            return;
        }

        const statusEl = document.getElementById('pkgImageUploadStatus');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-amber-500 mr-1"></i> Memproses gambar...';
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const rawDataUrl = e.target.result;
            const img = new Image();
            img.onload = function() {
                const maxWidth = 1200;
                let targetWidth = img.width;
                let targetHeight = img.height;

                if (targetWidth > maxWidth) {
                    targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
                    targetWidth = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

                setInputValue('pkgImageUrl', optimizedDataUrl);
                const previewImg = document.getElementById('pkgImagePreview');
                if (previewImg) previewImg.src = optimizedDataUrl;

                if (statusEl) {
                    statusEl.innerHTML = `<i class="fa-solid fa-circle-check text-xs text-emerald-600"></i> ${escapeHtml(file.name)} (${Math.round(file.size / 1024)} KB)`;
                }

                if (admin.showToast) admin.showToast('✅ Gambar banner berhasil dimuat!');
            };
            img.onerror = function() {
                setInputValue('pkgImageUrl', rawDataUrl);
                const previewImg = document.getElementById('pkgImagePreview');
                if (previewImg) previewImg.src = rawDataUrl;
                if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-check text-xs text-emerald-600"></i> Gambar dimuat';
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
        input.value = '';
    }

    function onPackageImageUrlInput(url) {
        const previewImg = document.getElementById('pkgImagePreview');
        if (previewImg) {
            previewImg.src = url || 'assets/hero-haram.png';
        }
    }

    const BANNER_PRESETS = [
        { label: 'Umroh Reguler Syawal', url: 'assets/pkg-reguler-syawal.png' },
        { label: 'VIP Khidmat Clock Tower', url: 'assets/pkg-vip-khidmat.png' },
        { label: 'Umroh Plus Turki', url: 'assets/pkg-plus-turki.png' },
        { label: 'Ramadhan & Lailatul Qadr', url: 'assets/pkg-ramadhan.webp' },
        { label: 'Paling Hemat', url: 'assets/pkg-hemat.webp' },
        { label: 'Masjidil Haram Hero', url: 'assets/hero-haram.png' },
        { label: 'Twilight Haramain', url: 'assets/hero-twilight.jpg' }
    ];
    let presetIdx = 0;

    function selectPresetPackageImage() {
        const preset = BANNER_PRESETS[presetIdx % BANNER_PRESETS.length];
        presetIdx++;

        setInputValue('pkgImageUrl', preset.url);
        const previewImg = document.getElementById('pkgImagePreview');
        if (previewImg) previewImg.src = preset.url;

        const statusEl = document.getElementById('pkgImageUploadStatus');
        if (statusEl) {
            statusEl.innerHTML = `<i class="fa-solid fa-circle-check text-xs text-emerald-600"></i> Preset: ${preset.label}`;
        }

        if (admin.showToast) admin.showToast(`Preset dipilih: ${preset.label}`);
    }

    function closePackageModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalPackageEditor');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // 5. SIMPAN FORM PAKET (CREATE / UPDATE)
    async function savePackageForm(e) {
        if (e && e.preventDefault) e.preventDefault();
        initPackagesData();

        const id = document.getElementById('pkgId')?.value || '';
        const name = document.getElementById('pkgName')?.value?.trim();
        if (!name) {
            if (admin.showToast) admin.showToast('Nama paket wajib diisi!');
            return;
        }

        const slug = document.getElementById('pkgSlug')?.value?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const packageType = document.getElementById('pkgType')?.value || 'REGULER';
        const durationDays = Number(document.getElementById('pkgDuration')?.value) || 9;
        const status = document.getElementById('pkgStatus')?.value || 'PUBLISHED';
        const badge = document.getElementById('pkgBadge')?.value?.trim() || 'Program Pilihan';
        const seatsLeft = Number(document.getElementById('pkgSeats')?.value) || 15;
        const rating = document.getElementById('pkgRating')?.value?.trim() || '4.9/5';
        const discountLabel = document.getElementById('pkgDiscount')?.value?.trim() || '';

        const hotelMakkah = document.getElementById('pkgHotelMakkah')?.value?.trim() || 'Hotel Bintang Makkah';
        const hotelMadinah = document.getElementById('pkgHotelMadinah')?.value?.trim() || 'Hotel Bintang Madinah';
        const airline = document.getElementById('pkgAirline')?.value?.trim() || 'Saudia Airlines';

        const quadPrice = Number(document.getElementById('pkgQuadPrice')?.value) || 29500000;
        const triplePrice = Number(document.getElementById('pkgTriplePrice')?.value) || (quadPrice + 2000000);
        const doublePrice = Number(document.getElementById('pkgDoublePrice')?.value) || (quadPrice + 5000000);

        const imageUrl = document.getElementById('pkgImageUrl')?.value?.trim() || 'assets/hero-haram.png';
        const description = document.getElementById('pkgDescription')?.value?.trim() || '';

        const payload = {
            id: id || undefined,
            name: name,
            slug: slug,
            package_type: packageType,
            duration_days: durationDays,
            status: status,
            badge: badge,
            seats_left: seatsLeft,
            rating: rating,
            discount_label: discountLabel,
            hotel_makkah: hotelMakkah,
            hotel_madinah: hotelMadinah,
            airline: airline,
            starting_price: quadPrice,
            quad_price: quadPrice,
            triple_price: triplePrice,
            double_price: doublePrice,
            image_url: imageUrl,
            image: imageUrl,
            description: description
        };

        // Update In-Memory Data
        let targetId = id;
        if (id) {
            const idx = admin.packagesData.findIndex(p => p.id === id);
            if (idx !== -1) {
                admin.packagesData[idx] = { ...admin.packagesData[idx], ...payload, updated_at: new Date().toISOString() };
            }
        } else {
            targetId = `PKG-${String(admin.packagesData.length + 1).padStart(6, '0')}`;
            payload.id = targetId;
            payload.created_at = new Date().toISOString();
            payload.updated_at = new Date().toISOString();
            admin.packagesData.unshift(payload);
        }

        // Sinkronkan ke MOCK_DATA.packages agar publik langsung terbarui
        if (typeof MOCK_DATA !== 'undefined' && Array.isArray(MOCK_DATA.packages)) {
            const mIdx = MOCK_DATA.packages.findIndex(p => p.id === targetId);
            if (mIdx !== -1) {
                MOCK_DATA.packages[mIdx] = { ...MOCK_DATA.packages[mIdx], ...payload };
            } else {
                MOCK_DATA.packages.unshift(payload);
            }
        }

        closePackageModal();
        renderPackages();
        if (admin.showToast) admin.showToast(`Paket "${name}" berhasil disimpan!`);

        // Async Push ke Google Apps Script Spreadsheet
        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            try {
                await SDW_API.post({
                    action: 'savePackage',
                    ...payload
                });
            } catch (err) {
                console.warn('[SDW_PACKAGES] Gagal push ke cloud, data tersimpan di sesi lokal:', err);
            }
        }
    }

    // 6. TOGGLE STATUS (PUBLISHED <-> DRAFT)
    async function togglePackageStatus(packageId) {
        initPackagesData();
        const pkg = (admin.packagesData || []).find(p => p.id === packageId);
        if (!pkg) return;

        const newStatus = pkg.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        pkg.status = newStatus;
        pkg.updated_at = new Date().toISOString();

        if (typeof MOCK_DATA !== 'undefined' && Array.isArray(MOCK_DATA.packages)) {
            const mPkg = MOCK_DATA.packages.find(p => p.id === packageId);
            if (mPkg) mPkg.status = newStatus;
        }

        renderPackages();
        if (admin.showToast) {
            admin.showToast(`Status paket ${pkg.name} diubah ke: ${newStatus}`);
        }

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            try {
                await SDW_API.post({
                    action: 'setPackageStatus',
                    id: packageId,
                    status: newStatus
                });
            } catch (err) {
                console.warn('[SDW_PACKAGES] Gagal toggle status cloud:', err);
            }
        }
    }

    // 7. HAPUS / ARSIPKAN PAKET
    async function deletePackage(packageId) {
        initPackagesData();
        const pkg = (admin.packagesData || []).find(p => p.id === packageId);
        if (!pkg) return;

        const confirmed = typeof window !== 'undefined' ? window.confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"?`) : true;
        if (!confirmed) return;

        admin.packagesData = admin.packagesData.filter(p => p.id !== packageId);
        if (typeof MOCK_DATA !== 'undefined' && Array.isArray(MOCK_DATA.packages)) {
            MOCK_DATA.packages = MOCK_DATA.packages.filter(p => p.id !== packageId);
        }

        renderPackages();
        if (admin.showToast) admin.showToast(`Paket "${pkg.name}" berhasil dihapus.`);

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            try {
                await SDW_API.post({
                    action: 'deletePackage',
                    id: packageId
                });
            } catch (err) {
                console.warn('[SDW_PACKAGES] Gagal hapus cloud:', err);
            }
        }
    }

    // 8. PRATINJAU DI WEBSITE
    function previewPackageWeb(packageId) {
        if (typeof window === 'undefined') return;
        const url = `paket.html?pkg=${encodeURIComponent(packageId)}`;
        window.open(url, '_blank');
    }

    // 9. SINKRONISASI CLOUD DARI GOOGLE SPREADSHEET
    async function syncPackagesFromCloud(btnEl) {
        const isSilent = btnEl === false;
        const btn = isSilent ? null : (btnEl || document.getElementById('btnSyncPackagesCloud'));
        let origHtml = '';
        if (btn) {
            origHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin mr-1.5"></i> Menyinkronkan...';
            btn.disabled = true;
        }

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            try {
                // Panggil upgradePackagesSchema di backend agar 5 paket standar dan kolom lengkap tersinkronisasi
                try {
                    await SDW_API.get('upgradePackagesSchema');
                } catch (ignoreErr) {}

                const res = await SDW_API.get('getPackages');
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const normalized = res.data.map(normalizePackage);
                    admin.packagesData = normalized;
                    if (typeof MOCK_DATA !== 'undefined') {
                        MOCK_DATA.packages = normalized;
                    }
                    renderPackages();
                    if (!isSilent && admin.showToast) admin.showToast('✅ Katalog paket & hotel/maskapai berhasil disinkronkan!');
                } else {
                    if (!isSilent && admin.showToast) admin.showToast('Data Spreadsheet kosong atau belum berubah.');
                }
            } catch (err) {
                console.error('[SDW_PACKAGES] Gagal sinkronisasi cloud:', err);
                if (!isSilent && admin.showToast) admin.showToast('⚠️ Gagal terhubung ke Spreadsheet.');
            }
        } else {
            if (!isSilent && admin.showToast) admin.showToast('Mode offline aktif.');
        }

        if (btn) {
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }
    }

    // Ekspor API ke objek SDW_ADMIN
    admin.renderPackages = renderPackages;
    admin.switchPackageViewMode = switchPackageViewMode;
    admin.onPackageSearch = onPackageSearch;
    admin.onPackageCategoryChange = onPackageCategoryChange;
    admin.onPackageStatusChange = onPackageStatusChange;
    admin.openPackageModal = openPackageModal;
    admin.closePackageModal = closePackageModal;
    admin.savePackageForm = savePackageForm;
    admin.togglePackageStatus = togglePackageStatus;
    admin.deletePackage = deletePackage;
    admin.previewPackageWeb = previewPackageWeb;
    admin.syncPackagesFromCloud = syncPackagesFromCloud;
    admin.handlePackageImageUpload = handlePackageImageUpload;
    admin.onPackageImageUrlInput = onPackageImageUrlInput;
    admin.selectPresetPackageImage = selectPresetPackageImage;

    return {
        renderPackages,
        switchPackageViewMode,
        onPackageSearch,
        onPackageCategoryChange,
        onPackageStatusChange,
        openPackageModal,
        closePackageModal,
        savePackageForm,
        togglePackageStatus,
        deletePackage,
        previewPackageWeb,
        syncPackagesFromCloud,
        handlePackageImageUpload,
        onPackageImageUrlInput,
        selectPresetPackageImage
    };
});

