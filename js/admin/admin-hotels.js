/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: MASTER DATA HOTEL HARAMAIN (MAKKAH & MADINAH)
 * File: js/admin/admin-hotels.js
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
        city: 'ALL',
        star: 'ALL',
        zone: 'ALL',
        status: 'ALL'
    };

    const DEFAULT_HOTELS = [
        {
            id: 'HTL-000001',
            name: 'Swissotel Al Maqam Makkah',
            city: 'MAKKAH',
            star_rating: 5,
            distance_meters: 0,
            distance_text: '0 Meter (Pelataran Masjidil Haram)',
            location_zone: 'RING_1',
            gate_info: 'Gate 1 (King Abdulaziz)',
            image_url: 'assets/pkg-vip-khidmat.png',
            description: 'Hotel mewah bintang 5 di dalam kompleks Abraj Al Bait Clock Tower dengan akses lift langsung menuju pelataran Masjidil Haram.',
            maps_url: 'https://maps.google.com/?q=Swissotel+Al+Maqam+Makkah',
            facilities: 'Restoran Nusantara, Akses Kursi Roda, Free WiFi, Ruang Shalat View Ka\'bah, Layanan Medis',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000002',
            name: 'Mövenpick Hotel Hajar Tower Makkah',
            city: 'MAKKAH',
            star_rating: 5,
            distance_meters: 0,
            distance_text: '0 Meter (Pelataran Masjidil Haram)',
            location_zone: 'RING_1',
            gate_info: 'Gate 1 (King Abdulaziz)',
            image_url: 'assets/hero-haram.png',
            description: 'Bagian dari kompleks Abraj Al Bait Clock Tower menghadap pelataran King Abdulaziz Gate. Fasilitas buffet masakan Indonesia dan lift berkecepatan tinggi.',
            maps_url: 'https://maps.google.com/?q=Movenpick+Hajar+Tower+Makkah',
            facilities: 'Buffet Menu Indonesia, Akses Lift Cepat, Free WiFi, Concierge 24 Jam, Penukaran Uang',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000003',
            name: 'Pullman Zamzam Makkah',
            city: 'MAKKAH',
            star_rating: 5,
            distance_meters: 0,
            distance_text: '0 Meter (Pelataran Masjidil Haram)',
            location_zone: 'RING_1',
            gate_info: 'Gate 1 (King Abdulaziz)',
            image_url: 'assets/hero-twilight.jpg',
            description: 'Hotel ikonik berjarak 0 meter dari pelataran. Sangat diminati jamaah keluarga dan lansia karena akses terdekat ke tempat sa\'i dan thawaf.',
            maps_url: 'https://maps.google.com/?q=Pullman+Zamzam+Makkah',
            facilities: 'Audio Shalat Ka\'bah di Kamar, Restoran Al Yasmine, Akses Kursi Roda, Resepsionis Bahasa Indonesia',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000004',
            name: 'Retaj Al Rayyan Makkah',
            city: 'MAKKAH',
            star_rating: 4,
            distance_meters: 350,
            distance_text: '350 Meter (Jalan Kaki Santai)',
            location_zone: 'WALKING_DISTANCE',
            gate_info: 'Gate 1-5 (Ajyad)',
            image_url: 'assets/pkg-reguler-syawal.png',
            description: 'Hotel bintang 4 favorit paket reguler di kawasan Ajyad. Hanya 4-5 menit jalan kaki santai di jalan datar tanpa tanjakan menuju pelataran.',
            maps_url: 'https://maps.google.com/?q=Retaj+Al+Rayyan+Makkah',
            facilities: 'Katering Cita Rasa Nusantara, Kamar Bersih Luas, Toko Oleh-oleh di Lobi, Free WiFi',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000005',
            name: 'Olayan Ajyad Hotel Makkah',
            city: 'MAKKAH',
            star_rating: 3,
            distance_meters: 600,
            distance_text: '600 Meter (Shuttle Bus Gratis 24 Jam)',
            location_zone: 'SHUTTLE',
            gate_info: 'Terminal Ajyad',
            image_url: 'assets/pkg-hemat.webp',
            description: 'Pilihan utama paket hemat dan syariah. Dilengkapi armada shuttle bus ber-AC non-stop 24 jam langsung ke terminal bawah pelataran Haram.',
            maps_url: 'https://maps.google.com/?q=Olayan+Ajyad+Hotel+Makkah',
            facilities: 'Shuttle Bus 24 Jam Non-stop, Kamar Quad Hemat, Menu Katering Indonesia, Pembimbing Ibadah Standby',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000006',
            name: 'Dar Al Taqwa Hotel Madinah',
            city: 'MADINAH',
            star_rating: 5,
            distance_meters: 50,
            distance_text: '50 Meter (Pelataran Masjid Nabawi)',
            location_zone: 'RING_1',
            gate_info: 'Gate 21-22 (King Fahd / Raudhah)',
            image_url: 'assets/pkg-vip-khidmat.png',
            description: 'Hotel bintang 5 tepat di depan pelataran utama Masjid Nabawi. Pintu masuk khusus jamaah wanita ke Raudhah hanya beberapa langkah dari lobi hotel.',
            maps_url: 'https://maps.google.com/?q=Dar+Al+Taqwa+Hotel+Madinah',
            facilities: 'Akses Terdekat Pintu Raudhah Wanita, Restoran Fine Dining, Butler Service, View Kubah Hijau',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000007',
            name: 'Frontel Al Harithia Madinah',
            city: 'MADINAH',
            star_rating: 5,
            distance_meters: 100,
            distance_text: '100 Meter (Markaziyah Utara)',
            location_zone: 'RING_1',
            gate_info: 'Gate 20-22 (King Fahd)',
            image_url: 'assets/hero-haram.png',
            description: 'Hotel bintang 5 di sektor Markaziyah Utara. Terkenal dengan hidangan sarapan dan makan malam menu Nusantara yang lengkap dan kamar yang luas.',
            maps_url: 'https://maps.google.com/?q=Frontel+Al+Harithia+Hotel+Madinah',
            facilities: 'Chef Menu Masakan Indonesia, Pusat Kebugaran, Free WiFi High-Speed, Fasilitas Ramah Lansia',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000008',
            name: 'Concorde Dar Al Khair Madinah',
            city: 'MADINAH',
            star_rating: 4,
            distance_meters: 200,
            distance_text: '200 Meter (Markaziyah Barat)',
            location_zone: 'WALKING_DISTANCE',
            gate_info: 'Gate 8 (Bab As-Salam)',
            image_url: 'assets/pkg-reguler-syawal.png',
            description: 'Hotel bintang 4 sangat strategis di area Markaziyah Barat. Sekitar 2-3 menit jalan kaki ke pelataran Bab As-Salam, dekat dengan pusat pertokoan kurma.',
            maps_url: 'https://maps.google.com/?q=Concorde+Dar+Al+Khair+Madinah',
            facilities: 'Dekat Pusat Belanja Kurma & Souvenir, Masakan Nusantara 3x Sehari, Ruang Koper Luas, Free WiFi',
            status: 'ACTIVE'
        },
        {
            id: 'HTL-000009',
            name: 'Rove Al Madinah Hotel',
            city: 'MADINAH',
            star_rating: 4,
            distance_meters: 150,
            distance_text: '150 Meter (Markaziyah Utara)',
            location_zone: 'WALKING_DISTANCE',
            gate_info: 'Gate 17-18 (Abu Bakar As-Siddiq)',
            image_url: 'assets/pkg-plus-turki.webp',
            description: 'Hotel bintang 4 modern dengan desain kontemporer di Markaziyah Utara. Suasana lobi megah dan nyaman untuk tempat berkumpul rombongan kloter.',
            maps_url: 'https://maps.google.com/?q=Rove+Al+Madinah+Hotel',
            facilities: 'Lobi Megah & Coffee Shop, Restoran Internasional & Nusantara, Smart TV Kamar, Akses Ramah Kursi Roda',
            status: 'ACTIVE'
        }
    ];

    /**
     * Mengambil daftar hotel dari memory / localStorage / fallback
     */
    function getHotelsList() {
        if (Array.isArray(admin.hotelsData) && admin.hotelsData.length > 0) {
            return admin.hotelsData;
        }

        if (typeof localStorage !== 'undefined') {
            try {
                const stored = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.HOTELS : 'sdw_admin_hotels');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.hotelsData = parsed;
                        return parsed;
                    }
                }
            } catch (err) {
                console.warn('[Admin Hotels] Gagal memuat data dari localStorage:', err);
            }
        }

        admin.hotelsData = JSON.parse(JSON.stringify(DEFAULT_HOTELS));
        saveHotelsToStorage(admin.hotelsData);
        return admin.hotelsData;
    }

    /**
     * Menyimpan data hotels ke localStorage
     */
    function saveHotelsToStorage(data) {
        if (typeof localStorage === 'undefined') return;
        try {
            const key = (admin.STORAGE_KEYS && admin.STORAGE_KEYS.HOTELS) ? admin.STORAGE_KEYS.HOTELS : 'sdw_admin_hotels';
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error('[Admin Hotels] Gagal menyimpan ke localStorage:', err);
        }
    }

    /**
     * Render bintang hotel
     */
    function renderStarRating(stars) {
        const num = Math.max(1, Math.min(5, parseInt(stars, 10) || 5));
        let html = '';
        for (let i = 0; i < num; i++) {
            html += '<i class="fa-solid fa-star text-amber-400 text-[10.5px]"></i>';
        }
        return html;
    }

    /**
     * Helper Badge Kota
     */
    function getCityBadge(city) {
        const c = String(city || 'MAKKAH').toUpperCase();
        if (c === 'MADINAH') {
            return {
                label: 'Madinah',
                icon: 'fa-mosque',
                classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
            };
        }
        return {
            label: 'Makkah',
            icon: 'fa-kaaba',
            classes: 'bg-amber-50 text-amber-900 border-amber-200'
        };
    }

    /**
     * Helper Badge Zona Lokasi
     */
    function getZoneBadge(zone) {
        const z = String(zone || 'RING_1').toUpperCase();
        switch (z) {
            case 'RING_1':
                return { label: 'Ring 1 Pelataran', classes: 'bg-purple-100 text-purple-900 border-purple-200' };
            case 'WALKING_DISTANCE':
                return { label: 'Jalan Kaki', classes: 'bg-sky-50 text-sky-800 border-sky-200' };
            case 'SHUTTLE':
                return { label: 'Shuttle Bus 24 Jam', classes: 'bg-teal-50 text-teal-800 border-teal-200' };
            default:
                return { label: z, classes: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    }

    /**
     * Render antarmuka Master Data Hotel (Table & Cards)
     */
    function renderHotels() {
        if (typeof document === 'undefined') return;

        const allHotels = getHotelsList();

        // 1. Hitung Ringkasan KPI
        const totalHotels = allHotels.length;
        const hotelsMakkah = allHotels.filter(h => String(h.city).toUpperCase() === 'MAKKAH').length;
        const hotelsMadinah = allHotels.filter(h => String(h.city).toUpperCase() === 'MADINAH').length;
        const hotelsStar5 = allHotels.filter(h => Number(h.star_rating) === 5).length;

        const elTotal = document.getElementById('statTotalHotels');
        const elMakkah = document.getElementById('statHotelsMakkah');
        const elMadinah = document.getElementById('statHotelsMadinah');
        const elStar5 = document.getElementById('statHotelsStar5');
        const badgeHotelCount = document.getElementById('badgeHotelCount');

        if (elTotal) elTotal.innerText = totalHotels;
        if (elMakkah) elMakkah.innerText = hotelsMakkah;
        if (elMadinah) elMadinah.innerText = hotelsMadinah;
        if (elStar5) elStar5.innerText = hotelsStar5;
        if (badgeHotelCount) badgeHotelCount.innerText = `${totalHotels} Hotel`;

        // 2. Filter data
        let filtered = allHotels.filter(item => {
            if (currentFilter.city !== 'ALL' && String(item.city).toUpperCase() !== currentFilter.city.toUpperCase()) {
                return false;
            }
            if (currentFilter.star !== 'ALL' && Number(item.star_rating) !== Number(currentFilter.star)) {
                return false;
            }
            if (currentFilter.zone !== 'ALL' && String(item.location_zone).toUpperCase() !== currentFilter.zone.toUpperCase()) {
                return false;
            }
            if (currentFilter.status !== 'ALL' && String(item.status || 'ACTIVE').toUpperCase() !== currentFilter.status.toUpperCase()) {
                return false;
            }
            if (currentFilter.search) {
                const q = currentFilter.search.toLowerCase();
                const text = `${item.id} ${item.name} ${item.city} ${item.gate_info || ''} ${item.description || ''} ${item.facilities || ''}`.toLowerCase();
                if (!text.includes(q)) return false;
            }
            return true;
        });

        // 3. Render ke Table Body
        const tbody = document.getElementById('table-hotels-body');
        const emptyState = document.getElementById('hotelEmptyState');

        if (filtered.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        if (tbody) {
            tbody.innerHTML = filtered.map(h => {
                const cityBadge = getCityBadge(h.city);
                const zoneBadge = getZoneBadge(h.location_zone);
                const starsHtml = renderStarRating(h.star_rating);
                const imgSrc = h.image_url || 'assets/hero-haram.png';
                const isActive = String(h.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

                return `
                    <tr class="hover:bg-purple-50/40 transition border-b border-slate-100 last:border-b-0 text-xs">
                        <!-- Col 1: Hotel & Foto -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="flex items-start gap-2.5">
                                <img src="${imgSrc}" alt="${admin.escapeHtml(h.name)}" class="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs" onerror="this.src='assets/hero-haram.png'">
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5 mb-0.5">
                                        <span class="font-black text-slate-800 text-[12.5px] leading-snug">${admin.escapeHtml(h.name)}</span>
                                    </div>
                                    <div class="flex items-center gap-1.5 text-[10px]">
                                        <span class="px-1.5 py-0.2 rounded font-black bg-purple-100 text-purple-900">${admin.escapeHtml(h.id)}</span>
                                        <div class="flex items-center gap-0.5">${starsHtml}</div>
                                    </div>
                                </div>
                            </div>
                        </td>

                        <!-- Col 2: Kota & Zona -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="flex flex-col gap-1 items-start">
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${cityBadge.classes}">
                                    <i class="fa-solid ${cityBadge.icon}"></i>
                                    <span>${cityBadge.label}</span>
                                </span>
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${zoneBadge.classes}">
                                    ${zoneBadge.label}
                                </span>
                            </div>
                        </td>

                        <!-- Col 3: Jarak & Gerbang -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="font-extrabold text-sdw-pine text-[11.5px] flex items-center gap-1">
                                <i class="fa-solid fa-person-walking text-amber-500"></i>
                                <span>${admin.escapeHtml(h.distance_text || (h.distance_meters + ' Meter'))}</span>
                            </div>
                            <div class="mt-1 text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
                                <i class="fa-solid fa-door-open text-purple-600 text-[10px]"></i>
                                <span>${admin.escapeHtml(h.gate_info || '-')}</span>
                            </div>
                        </td>

                        <!-- Col 4: Fasilitas Unggulan -->
                        <td class="py-3 px-3.5 align-top max-w-[200px]">
                            <div class="text-[10.5px] text-slate-600 line-clamp-2 leading-relaxed">
                                ${admin.escapeHtml(h.facilities || h.description || '-')}
                            </div>
                        </td>

                        <!-- Col 5: Status -->
                        <td class="py-3 px-3.5 align-top">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}">
                                <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}"></span>
                                ${isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </td>

                        <!-- Col 6: Aksi -->
                        <td class="py-3 px-3.5 align-top text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-1.5">
                                <button type="button" onclick="SDW_ADMIN.openHotelModal('${h.id}')" title="Edit Hotel" class="w-7 h-7 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                                ${h.maps_url ? `
                                <a href="${admin.escapeHtml(h.maps_url)}" target="_blank" rel="noopener noreferrer" title="Buka Google Maps" class="w-7 h-7 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-diamond-turn-right text-xs"></i>
                                </a>` : ''}
                                <button type="button" onclick="SDW_ADMIN.deleteHotel('${h.id}')" title="Hapus / Arsipkan Hotel" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 4. Render Card Grid jika view mode adalah cards
        const cardsGrid = document.getElementById('hotel-cards-grid');
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(h => {
                const cityBadge = getCityBadge(h.city);
                const zoneBadge = getZoneBadge(h.location_zone);
                const starsHtml = renderStarRating(h.star_rating);
                const imgSrc = h.image_url || 'assets/hero-haram.png';

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between">
                        <div class="relative h-36 bg-slate-900 overflow-hidden">
                            <img src="${imgSrc}" alt="${admin.escapeHtml(h.name)}" class="w-full h-full object-cover" onerror="this.src='assets/hero-haram.png'">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-black border ${cityBadge.classes} bg-white/90">
                                    <i class="fa-solid ${cityBadge.icon}"></i> ${cityBadge.label}
                                </span>
                                <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${zoneBadge.classes} bg-white/90">
                                    ${zoneBadge.label}
                                </span>
                            </div>
                            <div class="absolute bottom-2 left-2.5 right-2.5 text-white">
                                <div class="text-[10px] text-amber-300 font-extrabold flex items-center gap-1">
                                    <div class="flex items-center gap-0.5">${starsHtml}</div>
                                    <span class="text-white/80">• ${admin.escapeHtml(h.id)}</span>
                                </div>
                                <h3 class="font-black text-sm leading-tight text-white line-clamp-1">${admin.escapeHtml(h.name)}</h3>
                            </div>
                        </div>

                        <div class="p-3.5 space-y-2 text-xs flex-1 flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between text-[11px] text-sdw-pine font-bold mb-1">
                                    <span class="flex items-center gap-1">
                                        <i class="fa-solid fa-person-walking text-amber-500"></i>
                                        <span>${admin.escapeHtml(h.distance_text || (h.distance_meters + ' m'))}</span>
                                    </span>
                                    <span class="text-slate-400 font-semibold text-[10.5px]">
                                        ${admin.escapeHtml(h.gate_info || '')}
                                    </span>
                                </div>
                                <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    ${admin.escapeHtml(h.description || h.facilities || '')}
                                </p>
                            </div>

                            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${String(h.status).toUpperCase() === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
                                    ${String(h.status).toUpperCase() === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                                </span>
                                <div class="flex items-center gap-1.5">
                                    ${h.maps_url ? `
                                    <a href="${admin.escapeHtml(h.maps_url)}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition cursor-pointer text-xs">
                                        <i class="fa-solid fa-diamond-turn-right"></i>
                                    </a>` : ''}
                                    <button type="button" onclick="SDW_ADMIN.openHotelModal('${h.id}')" class="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100 transition cursor-pointer">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 5. Update dropdown hotel di modal package editor jika elemen ada di DOM
        populateHotelDropdownsInPackageEditor();
    }

    /**
     * Switch view table vs cards
     */
    function switchHotelView(mode) {
        viewMode = mode;
        const tableView = document.getElementById('hotelTableView');
        const cardsView = document.getElementById('hotelCardsView');
        const btnTable = document.getElementById('btnViewTableHotels');
        const btnCards = document.getElementById('btnViewCardsHotels');

        if (mode === 'cards') {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
            if (btnTable) btnTable.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer";
            if (btnCards) btnCards.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer";
        } else {
            if (cardsView) cardsView.classList.add('hidden');
            if (tableView) tableView.classList.remove('hidden');
            if (btnCards) btnCards.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer";
            if (btnTable) btnTable.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer";
        }
    }

    /**
     * Switch Filter
     */
    function switchHotelFilter(key, value) {
        currentFilter[key] = value;
        if (admin.hotelsFilter) {
            admin.hotelsFilter[key] = value;
        }
        renderHotels();
    }

    /**
     * Buka Modal Editor Hotel (Tambah atau Edit)
     */
    function openHotelModal(hotelId) {
        if (typeof document === 'undefined') return;

        const modal = document.getElementById('modalHotelEditor');
        const titleEl = document.getElementById('hotelModalTitle');
        const form = document.getElementById('formHotelEditor');

        if (!modal) return;

        const all = getHotelsList();

        if (hotelId) {
            const item = all.find(h => String(h.id).toUpperCase() === String(hotelId).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = `Edit Hotel: ${item.name} (${item.city})`;
                document.getElementById('htlModalId').value = item.id;
                document.getElementById('htlModalName').value = item.name || '';
                document.getElementById('htlModalCity').value = item.city || 'MAKKAH';
                document.getElementById('htlModalStar').value = item.star_rating || 5;
                document.getElementById('htlModalDistanceMeters').value = item.distance_meters !== undefined ? item.distance_meters : 0;
                document.getElementById('htlModalDistanceText').value = item.distance_text || '';
                document.getElementById('htlModalZone').value = item.location_zone || 'RING_1';
                document.getElementById('htlModalGate').value = item.gate_info || '';
                document.getElementById('htlModalImage').value = item.image_url || 'assets/hero-haram.png';
                document.getElementById('htlModalMaps').value = item.maps_url || '';
                document.getElementById('htlModalFacilities').value = item.facilities || '';
                document.getElementById('htlModalDescription').value = item.description || '';
                document.getElementById('htlModalStatus').value = item.status || 'ACTIVE';
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Master Hotel Baru';
            if (form) form.reset();
            document.getElementById('htlModalId').value = '';
            document.getElementById('htlModalCity').value = 'MAKKAH';
            document.getElementById('htlModalStar').value = 5;
            document.getElementById('htlModalDistanceMeters').value = 0;
            document.getElementById('htlModalDistanceText').value = '0 Meter (Pelataran Masjidil Haram)';
            document.getElementById('htlModalZone').value = 'RING_1';
            document.getElementById('htlModalGate').value = 'Gate 1 (King Abdulaziz)';
            document.getElementById('htlModalImage').value = 'assets/hero-haram.png';
            document.getElementById('htlModalStatus').value = 'ACTIVE';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    /**
     * Tutup Modal Editor Hotel
     */
    function closeHotelModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalHotelEditor');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /**
     * Simpan Form Master Hotel
     */
    async function saveHotelForm(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const id = document.getElementById('htlModalId').value.trim();
        const name = document.getElementById('htlModalName').value.trim();
        const city = document.getElementById('htlModalCity').value.trim().toUpperCase();
        const star_rating = parseInt(document.getElementById('htlModalStar').value, 10) || 5;
        const distance_meters = parseInt(document.getElementById('htlModalDistanceMeters').value, 10) || 0;
        const distance_text = document.getElementById('htlModalDistanceText').value.trim() || `${distance_meters} Meter`;
        const location_zone = document.getElementById('htlModalZone').value.trim();
        const gate_info = document.getElementById('htlModalGate').value.trim();
        const image_url = document.getElementById('htlModalImage').value.trim() || 'assets/hero-haram.png';
        const maps_url = document.getElementById('htlModalMaps').value.trim();
        const facilities = document.getElementById('htlModalFacilities').value.trim();
        const description = document.getElementById('htlModalDescription').value.trim();
        const status = document.getElementById('htlModalStatus').value.trim() || 'ACTIVE';

        if (!name) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama hotel wajib diisi!', 'error');
            return;
        }

        const all = getHotelsList();
        let targetId = id;

        if (!targetId) {
            // Buat ID baru HTL-XXXXXX
            let maxNum = 0;
            all.forEach(h => {
                const match = String(h.id || '').match(/HTL-(\d+)/i);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            });
            targetId = 'HTL-' + String(maxNum + 1).padStart(6, '0');
        }

        const hotelObj = {
            id: targetId,
            name: name,
            city: city,
            star_rating: star_rating,
            distance_meters: distance_meters,
            distance_text: distance_text,
            location_zone: location_zone,
            gate_info: gate_info,
            image_url: image_url,
            description: description,
            maps_url: maps_url,
            facilities: facilities,
            status: status
        };

        const existingIdx = all.findIndex(h => String(h.id).toUpperCase() === targetId.toUpperCase());
        if (existingIdx >= 0) {
            all[existingIdx] = Object.assign({}, all[existingIdx], hotelObj);
        } else {
            all.unshift(hotelObj);
        }

        saveHotelsToStorage(all);
        admin.hotelsData = all;

        closeHotelModal();
        renderHotels();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Data hotel ${name} berhasil disimpan!`, 'success');
        }

        // Enqueue sync ke Cloud Google Apps Script
        if (typeof admin.enqueueSync === 'function') {
            admin.enqueueSync('DB_Hotels', targetId, existingIdx >= 0 ? 'UPDATE' : 'CREATE', hotelObj);
        }
    }

    /**
     * Hapus / Arsipkan Master Hotel
     */
    function deleteHotel(hotelId) {
        if (!hotelId) return;
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus / mengarsipkan data hotel ${hotelId}?`);
        if (!confirmDelete) return;

        let all = getHotelsList();
        all = all.filter(h => String(h.id).toUpperCase() !== String(hotelId).toUpperCase());

        saveHotelsToStorage(all);
        admin.hotelsData = all;
        renderHotels();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Hotel ${hotelId} berhasil diarsipkan`, 'info');
        }

        if (typeof admin.enqueueSync === 'function') {
            admin.enqueueSync('DB_Hotels', hotelId, 'DELETE', { id: hotelId });
        }
    }

    /**
     * Sinkronisasi Master Data Hotel dari Cloud Apps Script
     */
    async function syncHotelsFromCloud() {
        if (typeof admin.showToast === 'function') {
            admin.showToast('Menghubungkan ke Cloud Spreadsheet untuk memperbarui master data hotel...', 'info');
        }

        const endpoint = (typeof admin.getApiUrl === 'function') ? admin.getApiUrl() :
            (typeof window !== 'undefined' && window.SDW_CONFIG && window.SDW_CONFIG.APPS_SCRIPT_URL) ? window.SDW_CONFIG.APPS_SCRIPT_URL :
            'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';

        try {
            const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}action=getHotels&_t=${Date.now()}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
                admin.hotelsData = json.data;
                saveHotelsToStorage(json.data);
                renderHotels();
                if (typeof admin.showToast === 'function') {
                    admin.showToast(`Sinkronisasi berhasil! ${json.data.length} master hotel termutakhir telah dimuat.`, 'success');
                }
            } else {
                renderHotels();
                if (typeof admin.showToast === 'function') {
                    admin.showToast('Data master hotel lokal sudah yang paling mutakhir.', 'info');
                }
            }
        } catch (err) {
            console.warn('[Admin Hotels] Sync cloud gagal, menggunakan cache lokal:', err);
            renderHotels();
            if (typeof admin.showToast === 'function') {
                admin.showToast('Gagal terhubung ke cloud. Menampilkan data hotel cache offline.', 'warning');
            }
        }
    }

    /**
     * Buka pratinjau halaman publik direktori hotel
     */
    function previewHotelWeb() {
        if (typeof window !== 'undefined') {
            window.open('hotel.html', '_blank');
        }
    }

    /**
     * Integrasi Relasional: Mengisi dropdown Hotel Makkah & Madinah di modal package editor
     */
    function populateHotelDropdownsInPackageEditor() {
        if (typeof document === 'undefined') return;

        const all = getHotelsList();
        const makkahHotels = all.filter(h => String(h.city).toUpperCase() === 'MAKKAH' && String(h.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
        const madinahHotels = all.filter(h => String(h.city).toUpperCase() === 'MADINAH' && String(h.status || 'ACTIVE').toUpperCase() === 'ACTIVE');

        const selectMakkah = document.getElementById('pkgHotelMakkahSelect');
        const selectMadinah = document.getElementById('pkgHotelMadinahSelect');

        if (selectMakkah) {
            const currentVal = selectMakkah.value;
            selectMakkah.innerHTML = '<option value="">-- Pilih dari Master Hotel Makkah --</option>';
            makkahHotels.forEach(h => {
                const opt = document.createElement('option');
                opt.value = `${h.name} (${h.distance_meters}m)`;
                opt.textContent = `${h.name} - ⭐${h.star_rating} (${h.distance_text || (h.distance_meters + 'm')})`;
                selectMakkah.appendChild(opt);
            });
            if (currentVal) selectMakkah.value = currentVal;
        }

        if (selectMadinah) {
            const currentVal = selectMadinah.value;
            selectMadinah.innerHTML = '<option value="">-- Pilih dari Master Hotel Madinah --</option>';
            madinahHotels.forEach(h => {
                const opt = document.createElement('option');
                opt.value = `${h.name} (${h.distance_meters}m)`;
                opt.textContent = `${h.name} - ⭐${h.star_rating} (${h.distance_text || (h.distance_meters + 'm')})`;
                selectMadinah.appendChild(opt);
            });
            if (currentVal) selectMadinah.value = currentVal;
        }
    }

    // Export methods to SDW_ADMIN
    admin.renderHotels = renderHotels;
    admin.switchHotelView = switchHotelView;
    admin.switchHotelFilter = switchHotelFilter;
    admin.openHotelModal = openHotelModal;
    admin.closeHotelModal = closeHotelModal;
    admin.saveHotelForm = saveHotelForm;
    admin.deleteHotel = deleteHotel;
    admin.syncHotelsFromCloud = syncHotelsFromCloud;
    admin.previewHotelWeb = previewHotelWeb;
    admin.getHotelsList = getHotelsList;
    admin.populateHotelDropdownsInPackageEditor = populateHotelDropdownsInPackageEditor;

    return admin;
});
