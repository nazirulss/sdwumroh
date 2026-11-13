/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: JADWAL KLOTER KEBERANGKATAN
 * File: js/admin/admin-departures.js
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
        packageId: 'ALL',
        airline: 'ALL',
        status: 'ALL'
    };

    const DEFAULT_DEPARTURES = [
        {
            id: 'DEP-000001',
            package_id: 'PKG-000001',
            package_name: 'Umroh Reguler Syawal Barakah',
            package_type: 'REGULER',
            duration_days: 9,
            departure_date: '2027-01-15',
            return_date: '2027-01-23',
            airline: 'Saudia Airlines (SV-819)',
            origin_airport: 'CGK (Soekarno-Hatta)',
            capacity_total: 45,
            capacity_booked: 38,
            seats_left: 7,
            status: 'OPEN',
            notes: 'Kloter Utama Syawal Barakah 1448H',
            hotel_makkah: 'Retaj Al Rayyan / Setaraf (350m)',
            hotel_madinah: 'Concorde Dar Al Khair (200m)'
        },
        {
            id: 'DEP-000002',
            package_id: 'PKG-000002',
            package_name: 'Umroh VIP Khidmat Akhir Tahun',
            package_type: 'VIP',
            duration_days: 12,
            departure_date: '2026-12-20',
            return_date: '2026-12-31',
            airline: 'Garuda Indonesia (GA-980)',
            origin_airport: 'CGK (Soekarno-Hatta)',
            capacity_total: 40,
            capacity_booked: 32,
            seats_left: 8,
            status: 'OPEN',
            notes: 'Kloter VIP Khidmat Akhir Tahun',
            hotel_makkah: 'Swissotel Makkah Clock Tower (0m)',
            hotel_madinah: 'Dar Al Taqwa Madinah (50m)'
        },
        {
            id: 'DEP-000003',
            package_id: 'PKG-000003',
            package_name: 'Umroh Plus Turki Musim Semi',
            package_type: 'PLUS_TURKEY',
            duration_days: 13,
            departure_date: '2027-04-10',
            return_date: '2027-04-22',
            airline: 'Turkish Airlines (TK-57)',
            origin_airport: 'CGK (Soekarno-Hatta)',
            capacity_total: 45,
            capacity_booked: 27,
            seats_left: 18,
            status: 'OPEN',
            notes: 'Kloter Plus Turki Musim Semi - Bosphorus & Haramain',
            hotel_makkah: 'Anjum Hotel Makkah (150m)',
            hotel_madinah: 'Rove Al Madinah (100m)'
        },
        {
            id: 'DEP-000004',
            package_id: 'PKG-000004',
            package_name: 'Umroh Awal Ramadhan 1448H',
            package_type: 'RAMADHAN',
            duration_days: 10,
            departure_date: '2027-02-12',
            return_date: '2027-02-21',
            airline: 'Saudia Airlines (SV-819)',
            origin_airport: 'CGK (Soekarno-Hatta)',
            capacity_total: 45,
            capacity_booked: 41,
            seats_left: 4,
            status: 'LIMITED',
            notes: 'Kloter Spesial Tarawih Haramain',
            hotel_makkah: 'Pullman Zamzam Makkah (0m)',
            hotel_madinah: 'Grand Plaza Madinah (150m)'
        },
        {
            id: 'DEP-000005',
            package_id: 'PKG-000005',
            package_name: 'Umroh Syariah Bintang Tiga Hemat',
            package_type: 'HEMAT',
            duration_days: 9,
            departure_date: '2027-03-05',
            return_date: '2027-03-13',
            airline: 'Lion Air Umrah Direct (JT-106)',
            origin_airport: 'SUB (Juanda Surabaya)',
            capacity_total: 45,
            capacity_booked: 9,
            seats_left: 36,
            status: 'OPEN',
            notes: 'Kloter Hemat Surabaya Langsung Madinah',
            hotel_makkah: 'Olayan Ajyad (600m Shuttle)',
            hotel_madinah: 'Durrat Al Eiman (200m)'
        }
    ];

    /**
     * Mengambil daftar paket umroh dari memory / localStorage / fallback
     */
    function getPackageLookup() {
        const pkgMap = {};
        let pkgList = [];
        if (Array.isArray(admin.packagesData) && admin.packagesData.length > 0) {
            pkgList = admin.packagesData;
        } else if (typeof localStorage !== 'undefined') {
            try {
                const raw = localStorage.getItem('sdw_admin_packages');
                if (raw) pkgList = JSON.parse(raw);
            } catch (e) {
                // ignore
            }
        }
        if (Array.isArray(pkgList)) {
            pkgList.forEach(p => {
                if (p && p.id) {
                    pkgMap[String(p.id).toUpperCase()] = p;
                }
            });
        }
        return pkgMap;
    }

    /**
     * Mengambil data departures dari storage / memory
     */
    function getDeparturesList() {
        if (Array.isArray(admin.departuresData) && admin.departuresData.length > 0) {
            return admin.departuresData;
        }

        if (typeof localStorage !== 'undefined') {
            try {
                const stored = localStorage.getItem(admin.STORAGE_KEYS ? admin.STORAGE_KEYS.DEPARTURES : 'sdw_admin_departures');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        admin.departuresData = parsed;
                        return parsed;
                    }
                }
            } catch (err) {
                console.warn('[Admin Departures] Gagal memuat data dari localStorage:', err);
            }
        }

        admin.departuresData = JSON.parse(JSON.stringify(DEFAULT_DEPARTURES));
        saveDeparturesToStorage(admin.departuresData);
        return admin.departuresData;
    }

    /**
     * Menyimpan data departures ke localStorage
     */
    function saveDeparturesToStorage(data) {
        if (typeof localStorage === 'undefined') return;
        try {
            const key = (admin.STORAGE_KEYS && admin.STORAGE_KEYS.DEPARTURES) ? admin.STORAGE_KEYS.DEPARTURES : 'sdw_admin_departures';
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error('[Admin Departures] Gagal menyimpan ke localStorage:', err);
        }
    }

    /**
     * Format tanggal Indonesia
     */
    function formatDateIndo(dateStr) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Warna badge status kloter
     */
    function getDepartureStatusBadge(status) {
        const st = String(status || 'OPEN').toUpperCase();
        switch (st) {
            case 'OPEN':
                return {
                    label: 'Seat Open',
                    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                };
            case 'LIMITED':
                return {
                    label: 'Sisa Sedikit',
                    classes: 'bg-amber-50 text-amber-700 border-amber-200'
                };
            case 'FULL':
                return {
                    label: 'Seat Penuh',
                    classes: 'bg-rose-50 text-rose-700 border-rose-200'
                };
            case 'CLOSED':
                return {
                    label: 'Kloter Ditutup',
                    classes: 'bg-slate-100 text-slate-700 border-slate-300'
                };
            case 'ARCHIVED':
                return {
                    label: 'Diarsipkan',
                    classes: 'bg-slate-50 text-slate-400 border-slate-200'
                };
            default:
                return {
                    label: st,
                    classes: 'bg-purple-50 text-purple-700 border-purple-200'
                };
        }
    }

    /**
     * Render daftar kloter keberangkatan (Table & Cards)
     */
    function renderDepartures() {
        if (typeof document === 'undefined') return;

        const allDepartures = getDeparturesList();
        const pkgLookup = getPackageLookup();

        // 1. Sinkronkan paket detail ke masing-masing kloter jika belum terisi
        allDepartures.forEach(d => {
            const pkg = pkgLookup[String(d.package_id || '').toUpperCase()];
            if (pkg) {
                if (!d.package_name || d.package_name === 'Paket Umroh') d.package_name = pkg.name;
                if (!d.hotel_makkah || d.hotel_makkah === '-') d.hotel_makkah = pkg.hotel_makkah || '-';
                if (!d.hotel_madinah || d.hotel_madinah === '-') d.hotel_madinah = pkg.hotel_madinah || '-';
                if (!d.package_type) d.package_type = pkg.package_type;
                if (!d.duration_days) d.duration_days = pkg.duration_days;
            }
            const capTotal = Number(d.capacity_total) || 45;
            const capBooked = Number(d.capacity_booked) || 0;
            d.capacity_total = capTotal;
            d.capacity_booked = capBooked;
            d.seats_left = Math.max(0, capTotal - capBooked);
        });

        // 2. Hitung Ringkasan KPI
        const totalKloter = allDepartures.length;
        const kloterOpen = allDepartures.filter(d => ['OPEN', 'LIMITED'].includes(String(d.status || '').toUpperCase())).length;
        const totalBooked = allDepartures.reduce((acc, curr) => acc + (Number(curr.capacity_booked) || 0), 0);
        const totalAvailableSeats = allDepartures.reduce((acc, curr) => acc + (Number(curr.seats_left) || 0), 0);

        const elTotalKloter = document.getElementById('statTotalKloter');
        const elKloterOpen = document.getElementById('statKloterOpen');
        const elTotalBooked = document.getElementById('statTotalBooked');
        const elTotalAvailableSeats = document.getElementById('statTotalAvailableSeats');
        const badgeDepartureCount = document.getElementById('badgeDepartureCount');

        if (elTotalKloter) elTotalKloter.innerText = totalKloter;
        if (elKloterOpen) elKloterOpen.innerText = kloterOpen;
        if (elTotalBooked) elTotalBooked.innerText = totalBooked;
        if (elTotalAvailableSeats) elTotalAvailableSeats.innerText = totalAvailableSeats;
        if (badgeDepartureCount) badgeDepartureCount.innerText = `${kloterOpen} Open`;

        // 3. Filter data
        let filtered = allDepartures.filter(item => {
            if (currentFilter.packageId !== 'ALL' && String(item.package_id).toUpperCase() !== currentFilter.packageId.toUpperCase()) {
                return false;
            }
            if (currentFilter.airline !== 'ALL' && !String(item.airline || '').toUpperCase().includes(currentFilter.airline.toUpperCase())) {
                return false;
            }
            if (currentFilter.status !== 'ALL' && String(item.status || '').toUpperCase() !== currentFilter.status.toUpperCase()) {
                return false;
            }
            if (currentFilter.search) {
                const q = currentFilter.search.toLowerCase();
                const text = `${item.id} ${item.package_name || ''} ${item.airline || ''} ${item.origin_airport || ''} ${item.notes || ''}`.toLowerCase();
                if (!text.includes(q)) return false;
            }
            return true;
        });

        // 4. Update Dropdown Options (Paket & Maskapai)
        populateFilterDropdowns(allDepartures);

        // 5. Render ke Table Body
        const tbody = document.getElementById('table-departures-body');
        const emptyState = document.getElementById('departureEmptyState');
        const tableView = document.getElementById('departureTableView');
        const cardsView = document.getElementById('departureCardsView');

        if (filtered.length === 0) {
            if (tbody) tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        if (tbody) {
            tbody.innerHTML = filtered.map(d => {
                const badge = getDepartureStatusBadge(d.status);
                const percent = Math.min(100, Math.round(((d.capacity_booked || 0) / (d.capacity_total || 45)) * 100));
                const progressColor = percent >= 90 ? 'bg-rose-500' : (percent >= 70 ? 'bg-amber-500' : 'bg-sdw-pine');

                return `
                    <tr class="hover:bg-purple-50/40 transition border-b border-slate-100 last:border-b-0 text-xs">
                        <!-- Col 1: ID & Tanggal Terbang -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="font-black text-slate-800 text-[12.5px]">${admin.escapeHtml(d.id)}</div>
                            <div class="mt-1 flex items-center gap-1.5 text-sdw-pine font-bold text-[11px]">
                                <i class="fa-regular fa-calendar-check text-amber-500 text-[10.5px]"></i>
                                <span>${formatDateIndo(d.departure_date)}</span>
                            </div>
                            <div class="text-[10px] text-slate-400 font-medium">
                                s.d. ${formatDateIndo(d.return_date)}
                            </div>
                        </td>

                        <!-- Col 2: Program Paket -->
                        <td class="py-3 px-3.5 align-top max-w-[220px]">
                            <div class="font-bold text-slate-900 text-[12px] leading-snug line-clamp-2">
                                ${admin.escapeHtml(d.package_name || d.package_id)}
                            </div>
                            <div class="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
                                <span class="px-1.5 py-0.5 rounded font-black bg-purple-100 text-purple-900">${admin.escapeHtml(d.package_id)}</span>
                                <span class="px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600">${d.duration_days ? d.duration_days + ' Hari' : ''}</span>
                            </div>
                            ${d.notes ? `<div class="mt-1 text-[10px] text-slate-500 italic line-clamp-1">${admin.escapeHtml(d.notes)}</div>` : ''}
                        </td>

                        <!-- Col 3: Penerbangan & Rute -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="flex items-center gap-1.5 font-bold text-slate-800 text-[11.5px]">
                                <i class="fa-solid fa-plane-departure text-sky-600 text-[10.5px]"></i>
                                <span>${admin.escapeHtml(d.airline || '-')}</span>
                            </div>
                            <div class="mt-1 text-[10.5px] text-slate-500 font-semibold flex items-center gap-1">
                                <span class="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-black text-[9.5px]">Asal</span>
                                <span>${admin.escapeHtml(d.origin_airport || 'CGK')}</span>
                            </div>
                            <div class="mt-1 text-[10px] text-slate-400 line-clamp-1">
                                🕋 ${admin.escapeHtml(d.hotel_makkah || '-')}
                            </div>
                        </td>

                        <!-- Col 4: Kapasitas & Seat -->
                        <td class="py-3 px-3.5 align-top">
                            <div class="flex items-center justify-between gap-2 mb-1">
                                <span class="font-black text-slate-800 text-[12px]">
                                    ${d.capacity_booked} / ${d.capacity_total} <span class="text-[10px] text-slate-400 font-normal">Seat</span>
                                </span>
                                <span class="font-extrabold ${d.seats_left > 0 ? 'text-emerald-700' : 'text-rose-600'} text-[11px]">
                                    Sisa: ${d.seats_left}
                                </span>
                            </div>
                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div class="${progressColor} h-2 rounded-full transition-all duration-300" style="width: ${percent}%;"></div>
                            </div>
                            <div class="mt-0.5 text-[9.5px] text-slate-400 text-right font-bold">${percent}% terisi</div>
                        </td>

                        <!-- Col 5: Status Kloter -->
                        <td class="py-3 px-3.5 align-top">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${badge.classes}">
                                <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${d.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : (d.status === 'LIMITED' ? 'bg-amber-500' : 'bg-slate-400')}"></span>
                                ${badge.label}
                            </span>
                        </td>

                        <!-- Col 6: Aksi -->
                        <td class="py-3 px-3.5 align-top text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-1.5">
                                <button type="button" onclick="SDW_ADMIN.openDepartureModal('${d.id}')" title="Edit Kloter" class="w-7 h-7 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button type="button" onclick="SDW_ADMIN.previewDepartureWeb()" title="Lihat di Web Jadwal" class="w-7 h-7 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                                </button>
                                <button type="button" onclick="SDW_ADMIN.deleteDeparture('${d.id}')" title="Hapus Kloter" class="w-7 h-7 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition cursor-pointer">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 6. Render Card Grid jika view mode adalah cards
        const cardsGrid = document.getElementById('departure-cards-grid');
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(d => {
                const badge = getDepartureStatusBadge(d.status);
                const percent = Math.min(100, Math.round(((d.capacity_booked || 0) / (d.capacity_total || 45)) * 100));

                return `
                    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <span class="px-2 py-0.5 rounded font-black text-[10px] bg-purple-100 text-purple-900">${admin.escapeHtml(d.id)}</span>
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge.classes}">${badge.label}</span>
                            </div>
                            <h3 class="font-black text-slate-900 text-sm leading-tight mb-1">${admin.escapeHtml(d.package_name || d.package_id)}</h3>
                            <div class="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mb-3">
                                <i class="fa-solid fa-plane-departure text-sky-600"></i>
                                <span>${admin.escapeHtml(d.airline || '-')}</span>
                                <span class="text-slate-300">•</span>
                                <span>${admin.escapeHtml(d.origin_airport || 'CGK')}</span>
                            </div>

                            <div class="bg-slate-50 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-600 mb-3 border border-slate-100">
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-400 font-medium text-[11px]">Berangkat:</span>
                                    <span class="font-bold text-slate-800">${formatDateIndo(d.departure_date)}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-400 font-medium text-[11px]">Kepulangan:</span>
                                    <span class="font-bold text-slate-800">${formatDateIndo(d.return_date)}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-slate-400 font-medium text-[11px]">Sisa Kuota:</span>
                                    <span class="font-extrabold ${d.seats_left > 0 ? 'text-emerald-700' : 'text-rose-600'}">${d.seats_left} dari ${d.capacity_total} seat</span>
                                </div>
                            </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[11px] font-bold text-slate-400">${percent}% terisi</span>
                            <div class="flex items-center gap-1.5">
                                <button type="button" onclick="SDW_ADMIN.openDepartureModal('${d.id}')" class="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100 transition cursor-pointer">
                                    Edit
                                </button>
                                <button type="button" onclick="SDW_ADMIN.deleteDeparture('${d.id}')" class="p-1 text-xs text-rose-500 hover:text-rose-700 transition cursor-pointer">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * Mengisi dropdown filter paket & maskapai secara dinamis
     */
    function populateFilterDropdowns(allDepartures) {
        const pkgSelect = document.getElementById('filterDeparturePackage');
        const airlineSelect = document.getElementById('filterDepartureAirline');
        const modalPkgSelect = document.getElementById('depModalPackageId');

        const pkgLookup = getPackageLookup();

        if (pkgSelect && pkgSelect.options.length <= 1) {
            const added = new Set();
            allDepartures.forEach(d => {
                if (d.package_id && !added.has(d.package_id)) {
                    added.add(d.package_id);
                    const opt = document.createElement('option');
                    opt.value = d.package_id;
                    opt.textContent = `${d.package_id} - ${d.package_name || d.package_id}`;
                    pkgSelect.appendChild(opt);
                }
            });
        }

        if (modalPkgSelect && modalPkgSelect.options.length <= 1) {
            const added = new Set();
            // Masukkan paket dari pkgLookup jika ada
            Object.keys(pkgLookup).forEach(pkgId => {
                if (!added.has(pkgId)) {
                    added.add(pkgId);
                    const opt = document.createElement('option');
                    opt.value = pkgId;
                    opt.textContent = `${pkgId} - ${pkgLookup[pkgId].name || pkgId}`;
                    modalPkgSelect.appendChild(opt);
                }
            });
            // Masukkan dari departures jika ada yang belum
            allDepartures.forEach(d => {
                if (d.package_id && !added.has(d.package_id)) {
                    added.add(d.package_id);
                    const opt = document.createElement('option');
                    opt.value = d.package_id;
                    opt.textContent = `${d.package_id} - ${d.package_name || d.package_id}`;
                    modalPkgSelect.appendChild(opt);
                }
            });
        }

        if (airlineSelect && airlineSelect.options.length <= 1) {
            const airlines = new Set();
            allDepartures.forEach(d => {
                if (d.airline) {
                    const clean = d.airline.split('(')[0].trim();
                    if (clean) airlines.add(clean);
                }
            });
            airlines.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a;
                opt.textContent = a;
                airlineSelect.appendChild(opt);
            });
        }
    }

    /**
     * Switch view table vs cards
     */
    function switchDepartureView(mode) {
        viewMode = mode;
        const tableView = document.getElementById('departureTableView');
        const cardsView = document.getElementById('departureCardsView');
        const btnTable = document.getElementById('btnViewTableDepartures');
        const btnCards = document.getElementById('btnViewCardsDepartures');

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
    function switchDepartureFilter(key, value) {
        currentFilter[key] = value;
        if (admin.departuresFilter) {
            admin.departuresFilter[key] = value;
        }
        renderDepartures();
    }

    /**
     * Buka Modal Editor Kloter (Mode Tambah atau Edit)
     */
    function openDepartureModal(depId) {
        if (typeof document === 'undefined') return;

        const modal = document.getElementById('modalDepartureEditor');
        const titleEl = document.getElementById('depModalTitle');
        const form = document.getElementById('formDepartureEditor');

        if (!modal) return;

        const all = getDeparturesList();
        populateFilterDropdowns(all);

        if (depId) {
            const item = all.find(d => String(d.id).toUpperCase() === String(depId).toUpperCase());
            if (item) {
                if (titleEl) titleEl.innerText = `Edit Kloter: ${item.id} (${item.airline || 'Penerbangan'})`;
                document.getElementById('depModalId').value = item.id;
                document.getElementById('depModalPackageId').value = item.package_id || '';
                document.getElementById('depModalDepartureDate').value = item.departure_date ? item.departure_date.substring(0, 10) : '';
                document.getElementById('depModalReturnDate').value = item.return_date ? item.return_date.substring(0, 10) : '';
                document.getElementById('depModalAirline').value = item.airline || '';
                document.getElementById('depModalOriginAirport').value = item.origin_airport || 'CGK';
                document.getElementById('depModalCapacityTotal').value = item.capacity_total || 45;
                document.getElementById('depModalCapacityBooked').value = item.capacity_booked || 0;
                document.getElementById('depModalStatus').value = item.status || 'OPEN';
                document.getElementById('depModalNotes').value = item.notes || '';
            }
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Kloter Keberangkatan Baru';
            if (form) form.reset();
            document.getElementById('depModalId').value = '';
            document.getElementById('depModalOriginAirport').value = 'CGK (Soekarno-Hatta)';
            document.getElementById('depModalCapacityTotal').value = 45;
            document.getElementById('depModalCapacityBooked').value = 0;
            document.getElementById('depModalStatus').value = 'OPEN';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    /**
     * Tutup Modal Editor Kloter
     */
    function closeDepartureModal() {
        if (typeof document === 'undefined') return;
        const modal = document.getElementById('modalDepartureEditor');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /**
     * Simpan Form Kloter Keberangkatan
     */
    async function saveDepartureForm(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const id = document.getElementById('depModalId').value.trim();
        const package_id = document.getElementById('depModalPackageId').value.trim();
        const departure_date = document.getElementById('depModalDepartureDate').value.trim();
        const return_date = document.getElementById('depModalReturnDate').value.trim();
        const airline = document.getElementById('depModalAirline').value.trim();
        const origin_airport = document.getElementById('depModalOriginAirport').value.trim();
        const capacity_total = parseInt(document.getElementById('depModalCapacityTotal').value, 10) || 45;
        const capacity_booked = parseInt(document.getElementById('depModalCapacityBooked').value, 10) || 0;
        const status = document.getElementById('depModalStatus').value.trim() || 'OPEN';
        const notes = document.getElementById('depModalNotes').value.trim();

        if (!package_id) {
            if (typeof admin.showToast === 'function') admin.showToast('Silakan pilih Program Paket Umroh!', 'error');
            return;
        }
        if (!departure_date) {
            if (typeof admin.showToast === 'function') admin.showToast('Tanggal keberangkatan wajib diisi!', 'error');
            return;
        }
        if (!airline) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama Maskapai & No Penerbangan wajib diisi!', 'error');
            return;
        }
        if (capacity_total <= 0) {
            if (typeof admin.showToast === 'function') admin.showToast('Total kapasitas seat harus lebih dari 0!', 'error');
            return;
        }

        const all = getDeparturesList();
        let targetId = id;

        if (!targetId) {
            // Buat ID baru DEP-XXXXXX
            let maxNum = 0;
            all.forEach(d => {
                const match = String(d.id || '').match(/DEP-(\d+)/i);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) maxNum = num;
                }
            });
            targetId = 'DEP-' + String(maxNum + 1).padStart(6, '0');
        }

        const pkgLookup = getPackageLookup();
        const pkg = pkgLookup[package_id.toUpperCase()] || {};

        const departureObj = {
            id: targetId,
            package_id: package_id,
            package_name: pkg.name || notes || package_id,
            package_type: pkg.package_type || 'REGULER',
            duration_days: pkg.duration_days || 9,
            departure_date: departure_date,
            return_date: return_date || departure_date,
            airline: airline,
            origin_airport: origin_airport,
            capacity_total: capacity_total,
            capacity_booked: capacity_booked,
            seats_left: Math.max(0, capacity_total - capacity_booked),
            status: status,
            notes: notes,
            hotel_makkah: pkg.hotel_makkah || '-',
            hotel_madinah: pkg.hotel_madinah || '-'
        };

        const existingIdx = all.findIndex(d => String(d.id).toUpperCase() === targetId.toUpperCase());
        if (existingIdx >= 0) {
            all[existingIdx] = Object.assign({}, all[existingIdx], departureObj);
        } else {
            all.unshift(departureObj);
        }

        saveDeparturesToStorage(all);
        admin.departuresData = all;

        closeDepartureModal();
        renderDepartures();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Jadwal kloter ${targetId} berhasil disimpan ke sistem!`, 'success');
        }

        // Enqueue sync ke Google Apps Script backend
        if (typeof admin.enqueueSync === 'function') {
            admin.enqueueSync('DB_Departures', targetId, existingIdx >= 0 ? 'UPDATE' : 'CREATE', departureObj);
        }
    }

    /**
     * Hapus Kloter Keberangkatan
     */
    function deleteDeparture(depId) {
        if (!depId) return;
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus jadwal kloter ${depId}?`);
        if (!confirmDelete) return;

        let all = getDeparturesList();
        all = all.filter(d => String(d.id).toUpperCase() !== String(depId).toUpperCase());

        saveDeparturesToStorage(all);
        admin.departuresData = all;
        renderDepartures();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Kloter ${depId} berhasil dihapus dari jadwal`, 'info');
        }

        if (typeof admin.enqueueSync === 'function') {
            admin.enqueueSync('DB_Departures', depId, 'DELETE', { id: depId });
        }
    }

    /**
     * Sinkronisasi data kloter dari Google Apps Script Cloud
     */
    async function syncDeparturesFromCloud() {
        if (typeof admin.showToast === 'function') {
            admin.showToast('Menghubungkan ke Cloud Spreadsheet untuk memperbarui jadwal kloter...', 'info');
        }

        const endpoint = (typeof admin.getApiUrl === 'function') ? admin.getApiUrl() :
            (typeof window !== 'undefined' && window.SDW_CONFIG && window.SDW_CONFIG.APPS_SCRIPT_URL) ? window.SDW_CONFIG.APPS_SCRIPT_URL :
            'https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec';

        try {
            const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}action=getDepartures&_t=${Date.now()}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
                admin.departuresData = json.data;
                saveDeparturesToStorage(json.data);
                renderDepartures();
                if (typeof admin.showToast === 'function') {
                    admin.showToast(`Sinkronisasi berhasil! ${json.data.length} jadwal kloter termutakhir telah dimuat.`, 'success');
                }
            } else {
                renderDepartures();
                if (typeof admin.showToast === 'function') {
                    admin.showToast('Data kloter lokal sudah yang paling mutakhir.', 'info');
                }
            }
        } catch (err) {
            console.warn('[Admin Departures] Sync cloud gagal, menggunakan cache lokal:', err);
            renderDepartures();
            if (typeof admin.showToast === 'function') {
                admin.showToast('Gagal terhubung ke cloud. Menampilkan data kloter cache offline.', 'warning');
            }
        }
    }

    /**
     * Buka pratinjau halaman publik jadwal kloter
     */
    function previewDepartureWeb() {
        if (typeof window !== 'undefined') {
            window.open('jadwal.html', '_blank');
        }
    }

    // Export methods to SDW_ADMIN
    admin.renderDepartures = renderDepartures;
    admin.switchDepartureView = switchDepartureView;
    admin.switchDepartureFilter = switchDepartureFilter;
    admin.openDepartureModal = openDepartureModal;
    admin.closeDepartureModal = closeDepartureModal;
    admin.saveDepartureForm = saveDepartureForm;
    admin.deleteDeparture = deleteDeparture;
    admin.syncDeparturesFromCloud = syncDeparturesFromCloud;
    admin.previewDepartureWeb = previewDepartureWeb;
    admin.getDeparturesList = getDeparturesList;

    return admin;
});

