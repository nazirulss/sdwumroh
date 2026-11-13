/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE AIRLINES & AIRPORTS MASTER CONTROLLER
 * File: js/admin/admin-airlines.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_AIRLINES = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    // 1. DEFAULT SEED AIRLINES (6 Maskapai Umroh Populer)
    const DEFAULT_AIRLINES = [
        {
            id: 'AIR-000001',
            code: 'SV',
            name: 'Saudia Airlines',
            flight_type: 'DIRECT',
            transit_hub: 'None / Direct Flight',
            baggage_allowance: '2x 23kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi, Bisnis',
            logo_url: 'assets/hero-haram.png',
            sort_order: 1,
            is_active: true,
            notes: 'Maskapai resmi flag carrier Kerajaan Arab Saudi, direct CGK/SUB ke JED/MED'
        },
        {
            id: 'AIR-000002',
            code: 'GA',
            name: 'Garuda Indonesia',
            flight_type: 'DIRECT',
            transit_hub: 'None / Direct Flight',
            baggage_allowance: '30kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi, Bisnis',
            logo_url: 'assets/hero-twilight.jpg',
            sort_order: 2,
            is_active: true,
            notes: 'Maskapai nasional Indonesia bintang 5, penerbangan langsung tanpa transit ke Jeddah & Madinah'
        },
        {
            id: 'AIR-000003',
            code: 'TK',
            name: 'Turkish Airlines',
            flight_type: 'TRANSIT',
            transit_hub: 'Istanbul Airport (IST)',
            baggage_allowance: '30kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi, Bisnis',
            logo_url: 'assets/pkg-plus-turki.webp',
            sort_order: 3,
            is_active: true,
            notes: 'Maskapai terbaik Eropa, rute program Umroh Plus Turki dengan transit city tour Istanbul'
        },
        {
            id: 'AIR-000004',
            code: 'QR',
            name: 'Qatar Airways',
            flight_type: 'TRANSIT',
            transit_hub: 'Hamad Int Airport Doha (DOH)',
            baggage_allowance: '25kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi, Bisnis',
            logo_url: 'assets/hero-madinah.png',
            sort_order: 4,
            is_active: true,
            notes: 'Layanan bintang 5 dunia dengan armada modern A350/B787 via Doha'
        },
        {
            id: 'AIR-000005',
            code: 'JT',
            name: 'Lion Air Umrah',
            flight_type: 'DIRECT',
            transit_hub: 'None / Direct Flight',
            baggage_allowance: '25kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi',
            logo_url: 'assets/pkg-hemat.webp',
            sort_order: 5,
            is_active: true,
            notes: 'Penerbangan charter langsung armada berbadan lebar Airbus A330-900NEO harga terjangkau'
        },
        {
            id: 'AIR-000006',
            code: 'WY',
            name: 'Oman Air',
            flight_type: 'TRANSIT',
            transit_hub: 'Muscat Int Airport (MCT)',
            baggage_allowance: '30kg + 5L Air Zamzam',
            cabin_classes: 'Ekonomi, Bisnis',
            logo_url: 'assets/pkg-reguler-syawal.webp',
            sort_order: 6,
            is_active: true,
            notes: 'Opsi transit Timur Tengah dengan harga bersahabat dan layanan ramah'
        }
    ];

    // 2. DEFAULT SEED AIRPORTS (8 Bandara Utama)
    const DEFAULT_AIRPORTS = [
        {
            id: 'APT-000001',
            code: 'CGK',
            name: 'Bandara Internasional Soekarno-Hatta',
            city: 'Jakarta / Tangerang',
            country: 'Indonesia',
            role: 'ORIGIN',
            terminal_info: 'Terminal 3 Ultimate (Penerbangan Umroh & Internasional)',
            sort_order: 1,
            is_active: true
        },
        {
            id: 'APT-000002',
            code: 'SUB',
            name: 'Bandara Internasional Juanda',
            city: 'Surabaya / Sidoarjo',
            country: 'Indonesia',
            role: 'ORIGIN',
            terminal_info: 'Terminal 2 Internasional',
            sort_order: 2,
            is_active: true
        },
        {
            id: 'APT-000003',
            code: 'KNO',
            name: 'Bandara Internasional Kualanamu',
            city: 'Medan / Deli Serdang',
            country: 'Indonesia',
            role: 'ORIGIN',
            terminal_info: 'Terminal Keberangkatan Internasional',
            sort_order: 3,
            is_active: true
        },
        {
            id: 'APT-000004',
            code: 'SOC',
            name: 'Bandara Internasional Adi Soemarmo',
            city: 'Solo / Boyolali',
            country: 'Indonesia',
            role: 'ORIGIN',
            terminal_info: 'Terminal Haji & Umroh Jawa Tengah',
            sort_order: 4,
            is_active: true
        },
        {
            id: 'APT-000005',
            code: 'JED',
            name: 'Bandara Internasional King Abdulaziz',
            city: 'Jeddah',
            country: 'Arab Saudi',
            role: 'DESTINATION',
            terminal_info: 'Terminal 1 Modern & Terminal Haji Barat',
            sort_order: 1,
            is_active: true
        },
        {
            id: 'APT-000006',
            code: 'MED',
            name: 'Bandara Internasional Prince Mohammad bin Abdulaziz',
            city: 'Madinah',
            country: 'Arab Saudi',
            role: 'DESTINATION',
            terminal_info: 'Main International Passenger Terminal',
            sort_order: 2,
            is_active: true
        },
        {
            id: 'APT-000007',
            code: 'IST',
            name: 'Istanbul International Airport',
            city: 'Istanbul',
            country: 'Turki',
            role: 'TRANSIT',
            terminal_info: 'International Transit Concourse A/B',
            sort_order: 1,
            is_active: true
        },
        {
            id: 'APT-000008',
            code: 'DOH',
            name: 'Hamad International Airport',
            city: 'Doha',
            country: 'Qatar',
            role: 'TRANSIT',
            terminal_info: 'Central Transit Terminal & Orchard Hub',
            sort_order: 2,
            is_active: true
        }
    ];

    // Local filters and state
    let activeAirlinesSubtab = 'airlines'; // 'airlines' | 'airports'
    let airlinesViewMode = 'table';
    let airportsViewMode = 'table';

    let airlinesFilter = {
        search: '',
        flightType: 'ALL',
        status: 'ALL'
    };

    let airportsFilter = {
        search: '',
        role: 'ALL',
        country: 'ALL',
        status: 'ALL'
    };

    // Helper: Local Storage Data Management
    function getStoredAirlines() {
        try {
            const raw = localStorage.getItem('sdw_admin_airlines');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('[SDW_AIRLINES] Gagal membaca storage airlines:', e);
        }
        return DEFAULT_AIRLINES.slice();
    }

    function saveStoredAirlines(data) {
        try {
            localStorage.setItem('sdw_admin_airlines', JSON.stringify(data));
            if (admin.state) admin.state.airlinesData = data;
        } catch (e) {
            console.error('[SDW_AIRLINES] Gagal menyimpan storage airlines:', e);
        }
    }

    function getStoredAirports() {
        try {
            const raw = localStorage.getItem('sdw_admin_airports');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('[SDW_AIRLINES] Gagal membaca storage airports:', e);
        }
        return DEFAULT_AIRPORTS.slice();
    }

    function saveStoredAirports(data) {
        try {
            localStorage.setItem('sdw_admin_airports', JSON.stringify(data));
            if (admin.state) admin.state.airportsData = data;
        } catch (e) {
            console.error('[SDW_AIRLINES] Gagal menyimpan storage airports:', e);
        }
    }

    // ==========================================
    // RENDER CONTROLLER UTAMA (tab-airlines)
    // ==========================================
    function renderAirlines() {
        const tabEl = document.getElementById('tab-airlines');
        if (!tabEl) return;

        // Sync Subtab Buttons Visual State
        const btnSubtabAirlines = document.getElementById('btnSubtabAirlines');
        const btnSubtabAirports = document.getElementById('btnSubtabAirports');
        const secAirlinesList = document.getElementById('secAirlinesList');
        const secAirportsList = document.getElementById('secAirportsList');
        const btnAddNewAirline = document.getElementById('btnAddNewAirline');
        const btnAddNewAirport = document.getElementById('btnAddNewAirport');

        if (activeAirlinesSubtab === 'airlines') {
            if (btnSubtabAirlines) {
                btnSubtabAirlines.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer';
            }
            if (btnSubtabAirports) {
                btnSubtabAirports.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
            }
            if (secAirlinesList) secAirlinesList.classList.remove('hidden');
            if (secAirportsList) secAirportsList.classList.add('hidden');
            if (btnAddNewAirline) btnAddNewAirline.classList.remove('hidden');
            if (btnAddNewAirport) btnAddNewAirport.classList.add('hidden');

            renderAirlinesList();
        } else {
            if (btnSubtabAirlines) {
                btnSubtabAirlines.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
            }
            if (btnSubtabAirports) {
                btnSubtabAirports.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer';
            }
            if (secAirlinesList) secAirlinesList.classList.add('hidden');
            if (secAirportsList) secAirportsList.classList.remove('hidden');
            if (btnAddNewAirline) btnAddNewAirline.classList.add('hidden');
            if (btnAddNewAirport) btnAddNewAirport.classList.remove('hidden');

            renderAirportsList();
        }
    }

    function switchAirlinesSubtab(subtab) {
        activeAirlinesSubtab = subtab;
        if (admin.state) admin.state.airlinesSubtab = subtab;
        renderAirlines();
    }

    // ==========================================
    // SUBTAB 1: DAFTAR MASKAPAI PENERBANGAN
    // ==========================================
    function renderAirlinesList() {
        const allItems = getStoredAirlines();

        // 1. Update KPI Strip
        const total = allItems.length;
        const directCount = allItems.filter(i => (i.flight_type || 'DIRECT').toUpperCase() === 'DIRECT').length;
        const transitCount = allItems.filter(i => (i.flight_type || '').toUpperCase() === 'TRANSIT').length;
        const activeCount = allItems.filter(i => i.is_active !== false && String(i.is_active).toUpperCase() !== 'FALSE').length;

        const kpiTotal = document.getElementById('kpiTotalAirlines');
        const kpiDirect = document.getElementById('kpiDirectAirlines');
        const kpiTransit = document.getElementById('kpiTransitAirlines');
        const kpiActive = document.getElementById('kpiActiveAirlines');
        const badgeCount = document.getElementById('badgeAirlineCount');

        if (kpiTotal) kpiTotal.innerText = total;
        if (kpiDirect) kpiDirect.innerText = directCount;
        if (kpiTransit) kpiTransit.innerText = transitCount;
        if (kpiActive) kpiActive.innerText = activeCount;
        if (badgeCount) badgeCount.innerText = `${activeCount} Aktif`;

        // 2. Filter logic
        const q = (airlinesFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (airlinesFilter.flightType !== 'ALL' && (item.flight_type || 'DIRECT').toUpperCase() !== airlinesFilter.flightType) {
                return false;
            }
            const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
            if (airlinesFilter.status === 'ACTIVE' && !isActive) return false;
            if (airlinesFilter.status === 'INACTIVE' && isActive) return false;

            if (q) {
                const combined = `${item.code || ''} ${item.name || ''} ${item.transit_hub || ''} ${item.baggage_allowance || ''}`.toLowerCase();
                if (!combined.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => (Number(a.sort_order) || 99) - (Number(b.sort_order) || 99));

        const tableBody = document.getElementById('airlinesTableBody');
        const cardsGrid = document.getElementById('airlinesCardsGrid');
        const tableView = document.getElementById('airlinesTableView');
        const cardsView = document.getElementById('airlinesCardsView');
        const emptyState = document.getElementById('airlineEmptyState');

        if (airlinesViewMode === 'table') {
            if (tableView) tableView.classList.remove('hidden');
            if (cardsView) cardsView.classList.add('hidden');
        } else {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
        }

        if (filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table View
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const isDirect = (item.flight_type || 'DIRECT').toUpperCase() === 'DIRECT';
                const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
                const flightBadge = isDirect
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"><i class="fa-solid fa-plane-circle-check"></i> Direct Flight</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1"><i class="fa-solid fa-arrows-split-up-and-left"></i> Transit Flight</span>`;

                const statusBadge = isActive
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Aktif</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Non-Aktif</span>`;

                const logoSrc = item.logo_url || 'assets/hero-haram.png';

                return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">
                        <span class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">${item.code || 'SV'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                            <img src="${logoSrc}" alt="${item.name}" class="w-10 h-7 object-cover rounded-md border border-slate-200 shrink-0" onerror="this.src='assets/hero-haram.png'">
                            <div>
                                <div class="font-extrabold text-slate-900 text-xs">${item.name}</div>
                                <div class="text-[10px] text-slate-400 font-medium">Urutan Prioritas: #${item.sort_order || 1}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">${flightBadge}</td>
                    <td class="py-3 px-4">
                        <div class="font-medium text-slate-700 text-xs">${item.transit_hub || 'Langsung (Tanpa Transit)'}</div>
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-bold text-slate-800 text-[11px]"><i class="fa-solid fa-suitcase-rolling text-amber-500 mr-1"></i>${item.baggage_allowance || '2x 23kg + 5L Zamzam'}</div>
                        <div class="text-[10px] text-slate-500 font-medium">${item.cabin_classes || 'Ekonomi, Bisnis'}</div>
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openAirlineModal('${item.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-slate-100 transition cursor-pointer" title="Edit Maskapai">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteAirline('${item.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus / Nonaktifkan">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards View
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const isDirect = (item.flight_type || 'DIRECT').toUpperCase() === 'DIRECT';
                const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
                const logoSrc = item.logo_url || 'assets/hero-haram.png';

                return `
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-mono font-bold text-xs">${item.code || 'SV'}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}">
                                ${isActive ? 'Aktif' : 'Non-Aktif'}
                            </span>
                        </div>
                        <div class="flex items-center gap-3 mb-3">
                            <img src="${logoSrc}" alt="${item.name}" class="w-14 h-9 object-cover rounded-lg border border-slate-200 shrink-0" onerror="this.src='assets/hero-haram.png'">
                            <div>
                                <h4 class="font-extrabold text-slate-900 text-sm">${item.name}</h4>
                                <span class="text-[10px] font-bold ${isDirect ? 'text-emerald-700' : 'text-sky-700'}">
                                    <i class="fa-solid ${isDirect ? 'fa-plane-circle-check' : 'fa-arrows-split-up-and-left'} mr-1"></i>
                                    ${isDirect ? 'Direct Flight' : 'Transit Flight'}
                                </span>
                            </div>
                        </div>
                        <div class="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                            <div><span class="font-semibold text-slate-500">Hub / Rute:</span> ${item.transit_hub || 'Direct'}</div>
                            <div><span class="font-semibold text-slate-500">Bagasi:</span> ${item.baggage_allowance || '-'}</div>
                            <div><span class="font-semibold text-slate-500">Kabin:</span> ${item.cabin_classes || 'Ekonomi'}</div>
                        </div>
                        ${item.notes ? `<p class="text-[11px] text-slate-500 italic mb-2 line-clamp-2">${item.notes}</p>` : ''}
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span class="text-slate-400 text-[10px]">Prioritas #${item.sort_order || 1}</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="SDW_ADMIN.openAirlineModal('${item.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold text-sdw-pine bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteAirline('${item.id}')" class="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // ==========================================
    // SUBTAB 2: DAFTAR BANDARA & TRANSIT HUB
    // ==========================================
    function renderAirportsList() {
        const allItems = getStoredAirports();

        // 1. Update KPI Strip
        const total = allItems.length;
        const originCount = allItems.filter(i => (i.role || 'ORIGIN').toUpperCase() === 'ORIGIN').length;
        const destCount = allItems.filter(i => (i.role || '').toUpperCase() === 'DESTINATION').length;
        const transitCount = allItems.filter(i => (i.role || '').toUpperCase() === 'TRANSIT').length;

        const kpiTotal = document.getElementById('kpiTotalAirports');
        const kpiOrigin = document.getElementById('kpiOriginAirports');
        const kpiDest = document.getElementById('kpiDestinationAirports');
        const kpiTransit = document.getElementById('kpiTransitAirports');

        if (kpiTotal) kpiTotal.innerText = total;
        if (kpiOrigin) kpiOrigin.innerText = originCount;
        if (kpiDest) kpiDest.innerText = destCount;
        if (kpiTransit) kpiTransit.innerText = transitCount;

        // 2. Filter logic
        const q = (airportsFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (airportsFilter.role !== 'ALL' && (item.role || 'ORIGIN').toUpperCase() !== airportsFilter.role) {
                return false;
            }
            if (airportsFilter.country !== 'ALL' && (item.country || '').toLowerCase() !== airportsFilter.country.toLowerCase()) {
                return false;
            }
            const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
            if (airportsFilter.status === 'ACTIVE' && !isActive) return false;
            if (airportsFilter.status === 'INACTIVE' && isActive) return false;

            if (q) {
                const combined = `${item.code || ''} ${item.name || ''} ${item.city || ''} ${item.country || ''} ${item.terminal_info || ''}`.toLowerCase();
                if (!combined.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => (Number(a.sort_order) || 99) - (Number(b.sort_order) || 99));

        const tableBody = document.getElementById('airportsTableBody');
        const cardsGrid = document.getElementById('airportsCardsGrid');
        const tableView = document.getElementById('airportsTableView');
        const cardsView = document.getElementById('airportsCardsView');
        const emptyState = document.getElementById('airportEmptyState');

        if (airportsViewMode === 'table') {
            if (tableView) tableView.classList.remove('hidden');
            if (cardsView) cardsView.classList.add('hidden');
        } else {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
        }

        if (filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table View
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const role = (item.role || 'ORIGIN').toUpperCase();
                let roleBadge = '';
                if (role === 'ORIGIN') {
                    roleBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1"><i class="fa-solid fa-plane-departure"></i> Embarkasi RI</span>`;
                } else if (role === 'DESTINATION') {
                    roleBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1"><i class="fa-solid fa-kaaba"></i> Bandara Haramain</span>`;
                } else {
                    roleBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1"><i class="fa-solid fa-route"></i> Hub Transit</span>`;
                }

                const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
                const statusBadge = isActive
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200">Aktif</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Non-Aktif</span>`;

                return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-3 px-4 font-mono font-black text-sdw-pine">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">${item.code || 'CGK'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-extrabold text-slate-900 text-xs">${item.name}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Urutan Prioritas: #${item.sort_order || 1}</div>
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-bold text-slate-800 text-xs">${item.city || '-'}</div>
                        <div class="text-[10px] text-slate-500 font-medium">${item.country || 'Indonesia'}</div>
                    </td>
                    <td class="py-3 px-4">${roleBadge}</td>
                    <td class="py-3 px-4">
                        <div class="text-xs text-slate-600 max-w-xs truncate" title="${item.terminal_info || ''}">${item.terminal_info || 'Terminal Reguler'}</div>
                    </td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openAirportModal('${item.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-slate-100 transition cursor-pointer" title="Edit Bandara">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteAirport('${item.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus / Nonaktifkan">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards View
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const role = (item.role || 'ORIGIN').toUpperCase();
                const isActive = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');

                return `
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 font-mono font-black text-xs">${item.code || 'CGK'}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}">
                                ${isActive ? 'Aktif' : 'Non-Aktif'}
                            </span>
                        </div>
                        <h4 class="font-extrabold text-slate-900 text-sm mb-1">${item.name}</h4>
                        <div class="text-xs text-slate-500 font-medium mb-3">
                            <i class="fa-solid fa-location-dot text-amber-500 mr-1"></i>${item.city}, ${item.country}
                        </div>
                        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3 space-y-1">
                            <div><span class="font-semibold text-slate-500">Peran:</span> ${role}</div>
                            <div class="truncate"><span class="font-semibold text-slate-500">Terminal:</span> ${item.terminal_info || 'Reguler'}</div>
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span class="text-slate-400 text-[10px]">Prioritas #${item.sort_order || 1}</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="SDW_ADMIN.openAirportModal('${item.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold text-sdw-pine bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteAirport('${item.id}')" class="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // View Mode Toggles
    function setAirlinesViewMode(mode) {
        airlinesViewMode = mode;
        const btnTable = document.getElementById('btnAirlineViewTable');
        const btnCards = document.getElementById('btnAirlineViewCards');
        if (mode === 'table') {
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            }
        } else {
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            }
        }
        renderAirlinesList();
    }

    function setAirportsViewMode(mode) {
        airportsViewMode = mode;
        const btnTable = document.getElementById('btnAirportViewTable');
        const btnCards = document.getElementById('btnAirportViewCards');
        if (mode === 'table') {
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            }
        } else {
            if (btnTable) {
                btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            }
            if (btnCards) {
                btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            }
        }
        renderAirportsList();
    }

    // Filter Handlers
    function applyAirlineFilter(key, val) {
        airlinesFilter[key] = val;
        renderAirlinesList();
    }

    function applyAirportFilter(key, val) {
        airportsFilter[key] = val;
        renderAirportsList();
    }

    // ==========================================
    // MODAL DIALOGS & CRUD ACTIONS: MASKAPAI
    // ==========================================
    function openAirlineModal(id) {
        const modal = document.getElementById('modalAirlineEditor');
        if (!modal) return;

        const allItems = getStoredAirlines();
        const item = id ? allItems.find(i => i.id === id) : null;
        const titleEl = document.getElementById('modalAirlineTitle');

        if (item) {
            if (titleEl) titleEl.innerText = `Edit Maskapai: ${item.name} (${item.code})`;
            document.getElementById('airlineModalId').value = item.id;
            document.getElementById('airlineModalCode').value = item.code || '';
            document.getElementById('airlineModalName').value = item.name || '';
            document.getElementById('airlineModalFlightType').value = item.flight_type || 'DIRECT';
            document.getElementById('airlineModalTransitHub').value = item.transit_hub || '';
            document.getElementById('airlineModalBaggage').value = item.baggage_allowance || '';
            document.getElementById('airlineModalCabinClasses').value = item.cabin_classes || 'Ekonomi, Bisnis';
            document.getElementById('airlineModalLogoUrl').value = item.logo_url || '';
            document.getElementById('airlineModalSortOrder').value = item.sort_order || 1;
            document.getElementById('airlineModalIsActive').checked = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
            document.getElementById('airlineModalNotes').value = item.notes || '';
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Maskapai Penerbangan Baru';
            document.getElementById('airlineModalId').value = '';
            document.getElementById('airlineModalCode').value = '';
            document.getElementById('airlineModalName').value = '';
            document.getElementById('airlineModalFlightType').value = 'DIRECT';
            document.getElementById('airlineModalTransitHub').value = 'None / Direct Flight';
            document.getElementById('airlineModalBaggage').value = '2x 23kg + 5L Air Zamzam';
            document.getElementById('airlineModalCabinClasses').value = 'Ekonomi, Bisnis';
            document.getElementById('airlineModalLogoUrl').value = 'assets/hero-haram.png';
            document.getElementById('airlineModalSortOrder').value = allItems.length + 1;
            document.getElementById('airlineModalIsActive').checked = true;
            document.getElementById('airlineModalNotes').value = '';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    async function saveAirline(event) {
        if (event && event.preventDefault) event.preventDefault();

        const id = document.getElementById('airlineModalId').value.trim();
        const code = document.getElementById('airlineModalCode').value.trim().toUpperCase();
        const name = document.getElementById('airlineModalName').value.trim();
        const flight_type = document.getElementById('airlineModalFlightType').value;
        const transit_hub = document.getElementById('airlineModalTransitHub').value.trim() || (flight_type === 'DIRECT' ? 'None / Direct Flight' : 'Hub Transit');
        const baggage_allowance = document.getElementById('airlineModalBaggage').value.trim() || '2x 23kg + 5L Air Zamzam';
        const cabin_classes = document.getElementById('airlineModalCabinClasses').value.trim() || 'Ekonomi, Bisnis';
        const logo_url = document.getElementById('airlineModalLogoUrl').value.trim() || 'assets/hero-haram.png';
        const sort_order = parseInt(document.getElementById('airlineModalSortOrder').value, 10) || 1;
        const is_active = document.getElementById('airlineModalIsActive').checked;
        const notes = document.getElementById('airlineModalNotes').value.trim();

        if (!code || !name) {
            if (typeof admin.showToast === 'function') admin.showToast('Kode IATA dan Nama Maskapai wajib diisi!', 'error');
            return;
        }

        const allItems = getStoredAirlines();
        let finalId = id;

        if (!finalId) {
            const nextNum = allItems.length + 1;
            finalId = 'AIR-' + String(nextNum).padStart(6, '0');
        }

        const payload = {
            id: finalId,
            code: code,
            name: name,
            flight_type: flight_type,
            transit_hub: transit_hub,
            baggage_allowance: baggage_allowance,
            cabin_classes: cabin_classes,
            logo_url: logo_url,
            sort_order: sort_order,
            is_active: is_active,
            notes: notes
        };

        const existingIdx = allItems.findIndex(i => i.id === finalId);
        if (existingIdx !== -1) {
            allItems[existingIdx] = { ...allItems[existingIdx], ...payload };
        } else {
            allItems.push(payload);
        }

        saveStoredAirlines(allItems);

        // Close modal
        if (typeof admin.closeModal === 'function') admin.closeModal('modalAirlineEditor');
        renderAirlinesList();

        if (typeof admin.showToast === 'function') admin.showToast(`Maskapai ${name} (${code}) berhasil disimpan!`, 'success');

        // Cloud mutation
        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveAirline', payload, 'DB_Airlines');
            }
        } catch (err) {
            console.warn('[SDW_AIRLINES] Cloud mutation saveAirline skipped:', err);
        }
    }

    async function deleteAirline(id) {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin menonaktifkan / menghapus maskapai ini?')) return;

        const allItems = getStoredAirlines();
        const updated = allItems.map(i => i.id === id ? { ...i, is_active: false } : i);
        saveStoredAirlines(updated);
        renderAirlinesList();

        if (typeof admin.showToast === 'function') admin.showToast('Maskapai berhasil dinonaktifkan.', 'info');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('deleteAirline', { id: id }, 'DB_Airlines');
            }
        } catch (err) {
            console.warn('[SDW_AIRLINES] Cloud mutation deleteAirline skipped:', err);
        }
    }

    // ==========================================
    // MODAL DIALOGS & CRUD ACTIONS: BANDARA
    // ==========================================
    function openAirportModal(id) {
        const modal = document.getElementById('modalAirportEditor');
        if (!modal) return;

        const allItems = getStoredAirports();
        const item = id ? allItems.find(i => i.id === id) : null;
        const titleEl = document.getElementById('modalAirportTitle');

        if (item) {
            if (titleEl) titleEl.innerText = `Edit Bandara: ${item.name} (${item.code})`;
            document.getElementById('airportModalId').value = item.id;
            document.getElementById('airportModalCode').value = item.code || '';
            document.getElementById('airportModalName').value = item.name || '';
            document.getElementById('airportModalCity').value = item.city || '';
            document.getElementById('airportModalCountry').value = item.country || 'Indonesia';
            document.getElementById('airportModalRole').value = item.role || 'ORIGIN';
            document.getElementById('airportModalTerminalInfo').value = item.terminal_info || '';
            document.getElementById('airportModalSortOrder').value = item.sort_order || 1;
            document.getElementById('airportModalIsActive').checked = (item.is_active !== false && String(item.is_active).toUpperCase() !== 'FALSE');
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Bandara / Transit Hub Baru';
            document.getElementById('airportModalId').value = '';
            document.getElementById('airportModalCode').value = '';
            document.getElementById('airportModalName').value = '';
            document.getElementById('airportModalCity').value = '';
            document.getElementById('airportModalCountry').value = 'Indonesia';
            document.getElementById('airportModalRole').value = 'ORIGIN';
            document.getElementById('airportModalTerminalInfo').value = 'Terminal Internasional';
            document.getElementById('airportModalSortOrder').value = allItems.length + 1;
            document.getElementById('airportModalIsActive').checked = true;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    async function saveAirport(event) {
        if (event && event.preventDefault) event.preventDefault();

        const id = document.getElementById('airportModalId').value.trim();
        const code = document.getElementById('airportModalCode').value.trim().toUpperCase();
        const name = document.getElementById('airportModalName').value.trim();
        const city = document.getElementById('airportModalCity').value.trim();
        const country = document.getElementById('airportModalCountry').value.trim() || 'Indonesia';
        const role = document.getElementById('airportModalRole').value;
        const terminal_info = document.getElementById('airportModalTerminalInfo').value.trim();
        const sort_order = parseInt(document.getElementById('airportModalSortOrder').value, 10) || 1;
        const is_active = document.getElementById('airportModalIsActive').checked;

        if (!code || !name) {
            if (typeof admin.showToast === 'function') admin.showToast('Kode IATA dan Nama Bandara wajib diisi!', 'error');
            return;
        }

        const allItems = getStoredAirports();
        let finalId = id;

        if (!finalId) {
            const nextNum = allItems.length + 1;
            finalId = 'APT-' + String(nextNum).padStart(6, '0');
        }

        const payload = {
            id: finalId,
            code: code,
            name: name,
            city: city,
            country: country,
            role: role,
            terminal_info: terminal_info,
            sort_order: sort_order,
            is_active: is_active
        };

        const existingIdx = allItems.findIndex(i => i.id === finalId);
        if (existingIdx !== -1) {
            allItems[existingIdx] = { ...allItems[existingIdx], ...payload };
        } else {
            allItems.push(payload);
        }

        saveStoredAirports(allItems);

        // Close modal
        if (typeof admin.closeModal === 'function') admin.closeModal('modalAirportEditor');
        renderAirportsList();

        if (typeof admin.showToast === 'function') admin.showToast(`Bandara ${name} (${code}) berhasil disimpan!`, 'success');

        // Cloud mutation
        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveAirport', payload, 'DB_Airports');
            }
        } catch (err) {
            console.warn('[SDW_AIRLINES] Cloud mutation saveAirport skipped:', err);
        }
    }

    async function deleteAirport(id) {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin menonaktifkan bandara ini?')) return;

        const allItems = getStoredAirports();
        const updated = allItems.map(i => i.id === id ? { ...i, is_active: false } : i);
        saveStoredAirports(updated);
        renderAirportsList();

        if (typeof admin.showToast === 'function') admin.showToast('Bandara berhasil dinonaktifkan.', 'info');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('deleteAirport', { id: id }, 'DB_Airports');
            }
        } catch (err) {
            console.warn('[SDW_AIRLINES] Cloud mutation deleteAirport skipped:', err);
        }
    }

    // ==========================================
    // CLOUD SYNC & REHYDRATION
    // ==========================================
    async function syncAirlinesFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycbycph086osLGD4eQKFhrIki9ZRwXdJhCLeDbzRXVvMEc7pMDCHvf42nZIAn32LqIfBY/exec';

        if (typeof admin.showToast === 'function') admin.showToast('🔄 Memulai sinkronisasi Master Maskapai & Bandara...', 'info');

        try {
            // 1. Fetch Airlines
            const resA = await fetch(syncUrl + '?action=getAirlines');
            if (resA.ok) {
                const dataA = await resA.json();
                if (dataA && dataA.success && Array.isArray(dataA.data) && dataA.data.length > 0) {
                    saveStoredAirlines(dataA.data);
                }
            }

            // 2. Fetch Airports
            const resP = await fetch(syncUrl + '?action=getAirports');
            if (resP.ok) {
                const dataP = await resP.json();
                if (dataP && dataP.success && Array.isArray(dataP.data) && dataP.data.length > 0) {
                    saveStoredAirports(dataP.data);
                }
            }

            renderAirlines();
            if (typeof admin.showToast === 'function') admin.showToast('✅ Sinkronisasi Master Maskapai & Bandara berhasil!', 'success');
        } catch (err) {
            console.error('[SDW_AIRLINES] Sync failed:', err);
            if (typeof admin.showToast === 'function') admin.showToast('Gagal terhubung ke cloud spreadsheet. Data lokal dipertahankan.', 'warning');
        }
    }

    // ==========================================
    // HELPER: POPULASI DROPDOWN UNTUK MODUL LAIN
    // ==========================================
    function populateAirlinesDropdownInPackageEditor() {
        if (typeof document === 'undefined') return;
        const select = document.getElementById('pkgAirlineSelect');
        if (!select) return;

        const airlines = getStoredAirlines().filter(a => a.is_active !== false && String(a.is_active).toUpperCase() !== 'FALSE');
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Pilih dari Master Maskapai --</option>';
        airlines.forEach(a => {
            const opt = document.createElement('option');
            const flightLabel = a.flight_type === 'DIRECT' ? 'Direct' : 'Transit';
            opt.value = `${a.name} (${flightLabel} ${a.code})`;
            opt.textContent = `${a.name} (${a.code}) - ${flightLabel} [${a.baggage_allowance || 'Bagasi 30kg'}]`;
            select.appendChild(opt);
        });
        if (currentVal) select.value = currentVal;
    }

    function populateFlightDropdownsInDepartureEditor() {
        if (typeof document === 'undefined') return;
        const selectAirline = document.getElementById('depModalAirlineSelect');
        const selectAirport = document.getElementById('depModalOriginAirportSelect');

        if (selectAirline) {
            const airlines = getStoredAirlines().filter(a => a.is_active !== false && String(a.is_active).toUpperCase() !== 'FALSE');
            const currentVal = selectAirline.value;
            selectAirline.innerHTML = '<option value="">-- Pilih dari Master Maskapai --</option>';
            airlines.forEach(a => {
                const opt = document.createElement('option');
                opt.value = `${a.name} (${a.code})`;
                opt.textContent = `${a.name} (${a.code}) - ${a.flight_type || 'DIRECT'}`;
                selectAirline.appendChild(opt);
            });
            if (currentVal) selectAirline.value = currentVal;
        }

        if (selectAirport) {
            const airports = getStoredAirports().filter(a => a.is_active !== false && String(a.is_active).toUpperCase() !== 'FALSE' && (a.role || 'ORIGIN').toUpperCase() === 'ORIGIN');
            const currentVal = selectAirport.value;
            selectAirport.innerHTML = '<option value="">-- Pilih dari Master Bandara Asal --</option>';
            airports.forEach(a => {
                const opt = document.createElement('option');
                opt.value = `${a.code} (${a.name})`;
                opt.textContent = `${a.code} - ${a.name} (${a.city})`;
                selectAirport.appendChild(opt);
            });
            if (currentVal) selectAirport.value = currentVal;
        }
    }

    function populateAirlinesSelect(selectElementId, selectedValue) {
        const select = document.getElementById(selectElementId);
        if (!select) return;

        const airlines = getStoredAirlines().filter(a => a.is_active !== false && String(a.is_active).toUpperCase() !== 'FALSE');
        select.innerHTML = '<option value="">-- Pilih dari Master Maskapai --</option>' +
            airlines.map(a => {
                const sel = (selectedValue && (selectedValue === a.name || selectedValue.includes(a.name) || selectedValue.includes(a.code))) ? 'selected' : '';
                const flightLabel = a.flight_type === 'DIRECT' ? 'Direct' : 'Transit';
                return `<option value="${a.name} (${flightLabel} ${a.code})" ${sel}>${a.name} (${a.code}) - ${flightLabel}</option>`;
            }).join('');
    }

    function populateAirportsSelect(selectElementId, selectedValue, roleFilter) {
        const select = document.getElementById(selectElementId);
        if (!select) return;

        let airports = getStoredAirports().filter(a => a.is_active !== false && String(a.is_active).toUpperCase() !== 'FALSE');
        if (roleFilter) {
            airports = airports.filter(a => (a.role || '').toUpperCase() === roleFilter.toUpperCase());
        }

        select.innerHTML = '<option value="">-- Pilih dari Master Bandara --</option>' +
            airports.map(a => {
                const sel = (selectedValue && (selectedValue === a.code || selectedValue.includes(a.code))) ? 'selected' : '';
                return `<option value="${a.code} (${a.city})" ${sel}>${a.code} - ${a.name} (${a.city})</option>`;
            }).join('');
    }

    // Exports
    admin.renderAirlines = renderAirlines;
    admin.switchAirlinesSubtab = switchAirlinesSubtab;
    admin.renderAirlinesList = renderAirlinesList;
    admin.renderAirportsList = renderAirportsList;
    admin.setAirlinesViewMode = setAirlinesViewMode;
    admin.setAirportsViewMode = setAirportsViewMode;
    admin.applyAirlineFilter = applyAirlineFilter;
    admin.applyAirportFilter = applyAirportFilter;
    admin.openAirlineModal = openAirlineModal;
    admin.saveAirline = saveAirline;
    admin.deleteAirline = deleteAirline;
    admin.openAirportModal = openAirportModal;
    admin.saveAirport = saveAirport;
    admin.deleteAirport = deleteAirport;
    admin.syncAirlinesFromCloud = syncAirlinesFromCloud;
    admin.populateAirlinesSelect = populateAirlinesSelect;
    admin.populateAirportsSelect = populateAirportsSelect;
    admin.populateAirlinesDropdownInPackageEditor = populateAirlinesDropdownInPackageEditor;
    admin.populateFlightDropdownsInDepartureEditor = populateFlightDropdownsInDepartureEditor;

    return {
        getStoredAirlines,
        getStoredAirports,
        renderAirlines,
        switchAirlinesSubtab,
        openAirlineModal,
        openAirportModal,
        syncAirlinesFromCloud,
        populateAirlinesSelect,
        populateAirportsSelect,
        populateAirlinesDropdownInPackageEditor,
        populateFlightDropdownsInDepartureEditor
    };
});
