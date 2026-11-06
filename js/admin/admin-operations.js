/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: OPERATIONS & TANAH SUCI LOGISTICS
 * File: js/admin/admin-operations.js
 * Version: 2.7.0
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

    function handleCreateTrip(e) {
        e.preventDefault();

        const nameInput = document.getElementById('trip_name');
        const depInput = document.getElementById('trip_departure_date');
        const retInput = document.getElementById('trip_return_date');
        const airlineInput = document.getElementById('trip_airline');
        const capInput = document.getElementById('trip_capacity');
        const hotelMakkahInput = document.getElementById('trip_hotel_makkah');
        const hotelMadinahInput = document.getElementById('trip_hotel_madinah');
        const muthawwifInput = document.getElementById('trip_muthawwif');
        const tlInput = document.getElementById('trip_tour_leader');

        if (!nameInput || !depInput || !airlineInput) return;

        const capacity = Number(capInput ? capInput.value : 45) || 45;
        const newTripId = `TRP-${2700 + admin.tripsData.length + 1}`;

        const newTrip = {
            id: newTripId,
            title: nameInput.value.trim(),
            date: `${depInput.value.trim()} • ${capacity} Pax`,
            tag: 'SEAT TERBUKA',
            tagClass: 'bg-emerald-100 text-emerald-800',
            airline: airlineInput.value.trim(),
            hotelMakkah: hotelMakkahInput && hotelMakkahInput.value.trim() ? hotelMakkahInput.value.trim() : 'Retaj Al Rayyan (350m)',
            hotelMadinah: hotelMadinahInput && hotelMadinahInput.value.trim() ? hotelMadinahInput.value.trim() : 'Concorde Dar Al Khair (200m)',
            muthawwif: muthawwifInput && muthawwifInput.value.trim() ? muthawwifInput.value.trim() : 'Ust. DR. H. Salman, Lc.',
            tourLeader: tlInput && tlInput.value.trim() ? tlInput.value.trim() : 'Ust. H. Fauzi, S.Ag.',
            busSummary: 'Bus 01 & Bus 02'
        };

        admin.tripsData.unshift(newTrip);
        admin.persistStorage(admin.STORAGE_KEYS.TRIPS, admin.tripsData);

        admin.enqueueMutation('createTrip', newTrip, 'DB_Trips', newTrip.id);
        admin.logAdminAudit('CREATE_TRIP', 'DB_Trips', newTrip.id, `Penerbitan kloter baru: ${newTrip.title} (${newTrip.date}) dengan maskapai ${newTrip.airline}.`);
        admin.showToast(`✅ Kloter baru "${newTrip.title}" berhasil diterbitkan!`);

        const form = document.getElementById('formCreateTrip');
        if (form) form.reset();

        admin.closeModal('modalCreateTrip');
        renderOperations();
    }

    function openTripManifestModal(tripId) {
        const trip = admin.tripsData.find(t => t.id === tripId) || admin.tripsData[0];
        if (!trip) return;

        const titleEl = document.getElementById('manifestModalTitle');
        const subEl = document.getElementById('manifestModalSubtitle');
        const contentEl = document.getElementById('manifestModalContent');

        if (titleEl) titleEl.innerText = `Manifest Kloter: ${trip.title}`;
        if (subEl) subEl.innerText = `${trip.date} • Maskapai ${trip.airline}`;

        if (contentEl) {
            contentEl.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Card Bus 01 -->
                    <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="font-extrabold text-emerald-950 text-sm">🚌 Bus 01 (Sticker Hijau)</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">25 Pax</span>
                        </div>
                        <div class="text-xs text-slate-600 space-y-1">
                            <div>TL Bertugas: <strong>${admin.escapeHtml(trip.muthawwif)}</strong></div>
                            <div>Kontak TL: <span class="font-mono text-emerald-800 font-bold">+966 50 123 4567</span></div>
                        </div>
                        <div class="pt-2 border-t border-emerald-200/60 text-[11px] text-slate-700 space-y-1">
                            <div class="font-bold text-slate-800">Daftar Sebagian Jamaah:</div>
                            <ol class="list-decimal pl-4 space-y-0.5 font-medium">
                                <li>Ahmad Jamaah Teladan (Koper Hijau #01)</li>
                                <li>Ibu Fatimah Zahra (Koper Hijau #02)</li>
                                <li>Keluarga Bpk. Hendra - 3 Orang (Koper Hijau #03-05)</li>
                                <li class="text-slate-400 italic">+20 Jamaah Lainnya</li>
                            </ol>
                        </div>
                    </div>

                    <!-- Card Bus 02 -->
                    <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="font-extrabold text-amber-950 text-sm">🚌 Bus 02 (Sticker Kuning)</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">20 Pax</span>
                        </div>
                        <div class="text-xs text-slate-600 space-y-1">
                            <div>TL Bertugas: <strong>${admin.escapeHtml(trip.tourLeader)}</strong></div>
                            <div>Kontak TL: <span class="font-mono text-amber-800 font-bold">+966 55 987 6543</span></div>
                        </div>
                        <div class="pt-2 border-t border-amber-200/60 text-[11px] text-slate-700 space-y-1">
                            <div class="font-bold text-slate-800">Daftar Sebagian Jamaah:</div>
                            <ol class="list-decimal pl-4 space-y-0.5 font-medium">
                                <li>Bpk. Gunawan Wibisono (Koper Kuning #01)</li>
                                <li>Ibu Hj. Siti Nurhaliza (Koper Kuning #02)</li>
                                <li>Bpk. H. Rahmat Hidayat (Koper Kuning #03)</li>
                                <li class="text-slate-400 italic">+17 Jamaah Lainnya</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <!-- Rooming List Summary -->
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div class="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <i class="fa-solid fa-hotel text-sdw-pine"></i>
                        <span>Alokasi Kamar Hotel (${admin.escapeHtml(trip.hotelMakkah)} &amp; ${admin.escapeHtml(trip.hotelMadinah)})</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div class="p-3 rounded-xl bg-white border border-slate-200">
                            <div class="font-bold text-purple-900">Kamar Quad (4 Orang)</div>
                            <div class="text-lg font-black text-slate-800">6 Kamar</div>
                            <span class="text-[10px] text-slate-500">24 Jamaah (Pemisahan Gender)</span>
                        </div>
                        <div class="p-3 rounded-xl bg-white border border-slate-200">
                            <div class="font-bold text-purple-900">Kamar Triple (3 Orang)</div>
                            <div class="text-lg font-black text-slate-800">3 Kamar</div>
                            <span class="text-[10px] text-slate-500">9 Jamaah (Keluarga)</span>
                        </div>
                        <div class="p-3 rounded-xl bg-white border border-slate-200">
                            <div class="font-bold text-purple-900">Kamar Double (2 Orang)</div>
                            <div class="text-lg font-black text-slate-800">6 Kamar</div>
                            <span class="text-[10px] text-slate-500">12 Jamaah (Pasutri Sah)</span>
                        </div>
                    </div>
                </div>
            `;
        }

        admin.openModal('modalTripManifest');
    }

    function switchOperationsSubtab(tabName) {
        admin.operationsSubtab = tabName;
        const tabs = ['manifest', 'rooming', 'logistics', 'manasik', 'airport', 'trips'];
        tabs.forEach(t => {
            const btn = document.getElementById(`subtab-${t}-btn`);
            const view = document.getElementById(`subtab-${t}-view`);
            if (btn) {
                if (t === tabName) {
                    btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sdw-tab-pill-active transition cursor-pointer flex items-center gap-2 whitespace-nowrap';
                } else {
                    btn.className = 'px-4 py-2.5 rounded-xl font-bold text-xs sdw-tab-pill-inactive transition cursor-pointer flex items-center gap-2 whitespace-nowrap';
                }
            }
            if (view) {
                if (t === tabName) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            }
        });
        renderOperations();
    }

    function changeKloter(tripId) {
        admin.activeKloterId = tripId;
        const trip = admin.tripsData.find(t => t.id === tripId);
        admin.showToast(`Kloter ${trip ? trip.title : tripId} aktif dipilih`);
        renderOperations();
    }

    function renderOperations() {
        // Update Header KPI Badges
        const totalPaxEl = document.getElementById('op-stat-total-pax');
        const boardingEl = document.getElementById('op-header-boarding');
        const roomsEl = document.getElementById('op-stat-rooms');

        const boardedCount = admin.manifestData.filter(m => m.boarded).length;
        const totalPax = admin.manifestData.length;
        const pct = totalPax > 0 ? Math.round((boardedCount / totalPax) * 100) : 0;

        if (totalPaxEl) totalPaxEl.innerText = `${totalPax} Pax`;
        if (boardingEl) boardingEl.innerText = `${boardedCount} / ${totalPax} (${pct}%)`;
        if (roomsEl) roomsEl.innerText = `${admin.roomsData.length} Kamar (100%)`;

        if (admin.operationsSubtab === 'manifest') {
            renderBusManifest();
        } else if (admin.operationsSubtab === 'rooming') {
            renderRoomingList();
        } else if (admin.operationsSubtab === 'logistics') {
            renderLogistics();
        } else if (admin.operationsSubtab === 'manasik') {
            renderManasik();
        } else if (admin.operationsSubtab === 'airport') {
            renderAirportHandling();
        } else if (admin.operationsSubtab === 'trips') {
            renderTripsList();
        }
    }

    // 6.1 MANIFEST BUS AC & BOARDING CHECKLIST
    function renderBusManifest() {
        const container = document.getElementById('subtab-manifest-view');
        if (!container) return;

        const bus01Pax = admin.manifestData.filter(m => m.busId === 'BUS-01');
        const bus02Pax = admin.manifestData.filter(m => m.busId === 'BUS-02');
        const bus01Boarded = bus01Pax.filter(m => m.boarded).length;
        const bus02Boarded = bus02Pax.filter(m => m.boarded).length;

        // Apply manifest filters
        const filtered = admin.manifestData.filter(m => {
            const matchBus = (!admin.manifestFilter.bus || admin.manifestFilter.bus === 'ALL') || (m.busId === admin.manifestFilter.bus);
            const matchStatus = (!admin.manifestFilter.status || admin.manifestFilter.status === 'ALL') || 
                (admin.manifestFilter.status === 'BOARDED' && m.boarded) || 
                (admin.manifestFilter.status === 'PENDING' && !m.boarded);
            const q = (admin.manifestFilter.search || '').toLowerCase().trim();
            const matchSearch = !q || 
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.seat && m.seat.toLowerCase().includes(q)) ||
                (m.passport && m.passport.toLowerCase().includes(q)) ||
                (m.luggageTag && m.luggageTag.toLowerCase().includes(q)) ||
                (m.regId && m.regId.toLowerCase().includes(q));
            return matchBus && matchStatus && matchSearch;
        });

        container.innerHTML = `
            <!-- Top Cards: Bus 01 & Bus 02 Overviews -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Bus 01 Card -->
                <div class="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200/90 shadow-xs space-y-3 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0"></div>
                    <div class="relative z-10 flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                                🚌
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Bus 01 (Stiker Hijau)</h3>
                                <span class="text-[11px] text-emerald-700 font-bold block">Mercedes-Benz Travego • 25 Kursi</span>
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ${bus01Boarded} / 25 Boarded (${Math.round((bus01Boarded/25)*100)}%)
                        </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div class="bg-emerald-600 h-full rounded-full transition-all duration-300" style="width: ${(bus01Boarded/25)*100}%"></div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-400 block font-semibold">Muthawwif Bertugas</span>
                            <strong class="text-slate-800">Ust. DR. H. Salman, Lc.</strong>
                            <div class="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                                <a href="https://wa.me/966501234567" target="_blank" class="hover:underline flex items-center gap-1">
                                    <i class="fa-brands fa-whatsapp text-emerald-600"></i> +966 50 123 4567
                                </a>
                            </div>
                        </div>
                        <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-400 block font-semibold">Label Koper &amp; Bagasi</span>
                            <strong class="text-emerald-800">Stiker HIJAU #01 - #25</strong>
                            <span class="text-[10px] text-slate-500 block">Kargo Prioritas JED-MK</span>
                        </div>
                    </div>
                </div>

                <!-- Bus 02 Card -->
                <div class="p-4 sm:p-5 rounded-3xl bg-white border border-amber-200/90 shadow-xs space-y-3 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0"></div>
                    <div class="relative z-10 flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                                🚌
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Bus 02 (Stiker Kuning)</h3>
                                <span class="text-[11px] text-amber-700 font-bold block">Mercedes-Benz Travego • 20 Kursi</span>
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                            ${bus02Boarded} / 20 Boarded (${Math.round((bus02Boarded/20)*100)}%)
                        </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div class="bg-amber-500 h-full rounded-full transition-all duration-300" style="width: ${(bus02Boarded/20)*100}%"></div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-400 block font-semibold">Tour Leader Bertugas</span>
                            <strong class="text-slate-800">Ust. Syam Elmarusy</strong>
                            <div class="text-[10px] font-mono text-amber-800 font-bold mt-0.5">
                                <a href="https://wa.me/966559876543" target="_blank" class="hover:underline flex items-center gap-1">
                                    <i class="fa-brands fa-whatsapp text-emerald-600"></i> +966 55 987 6543
                                </a>
                            </div>
                        </div>
                        <div class="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span class="text-[10px] text-slate-400 block font-semibold">Label Koper &amp; Bagasi</span>
                            <strong class="text-amber-800">Stiker KUNING #01 - #20</strong>
                            <span class="text-[10px] text-slate-500 block">Kargo Prioritas JED-MK</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filter Multi-Kriteria Manifest Bus -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div class="p-3.5 sm:p-4 border-b border-slate-200/90 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                        <div class="relative flex-1 min-w-[160px] max-w-xs">
                            <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                            <input type="text" id="manifest-filter-search" value="${admin.escapeHtml(admin.manifestFilter.search)}" oninput="SDW_ADMIN.applyManifestFilter()" placeholder="Cari jamaah, kursi, tag koper..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                        </div>
                        <select id="manifest-filter-bus" onchange="SDW_ADMIN.applyManifestFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                            <option value="ALL" ${admin.manifestFilter.bus === 'ALL' ? 'selected' : ''}>Semua Armada Bus</option>
                            <option value="BUS-01" ${admin.manifestFilter.bus === 'BUS-01' ? 'selected' : ''}>Bus 01 (Stiker Hijau)</option>
                            <option value="BUS-02" ${admin.manifestFilter.bus === 'BUS-02' ? 'selected' : ''}>Bus 02 (Stiker Kuning)</option>
                        </select>
                        <select id="manifest-filter-status" onchange="SDW_ADMIN.applyManifestFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                            <option value="ALL" ${admin.manifestFilter.status === 'ALL' ? 'selected' : ''}>Semua Status Boarding</option>
                            <option value="BOARDED" ${admin.manifestFilter.status === 'BOARDED' ? 'selected' : ''}>Sudah Naik Bus (Boarded)</option>
                            <option value="PENDING" ${admin.manifestFilter.status === 'PENDING' ? 'selected' : ''}>Belum Naik (Pending)</option>
                        </select>
                        <button type="button" onclick="SDW_ADMIN.resetManifestFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200/70 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                            <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="button" onclick="SDW_ADMIN.batchBoarding('ALL_BOARDED')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs">
                            <i class="fa-solid fa-check-double"></i>
                            <span>Tandai Semua Naik</span>
                        </button>
                        <button type="button" onclick="SDW_ADMIN.batchBoarding('RESET')" class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[11px] transition cursor-pointer">
                            Reset Absensi
                        </button>
                    </div>
                </div>

                <!-- Table Jamaah Manifest -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="py-3 px-4 w-12 text-center">Boarding</th>
                                <th class="py-3 px-3">Kursi</th>
                                <th class="py-3 px-3">Tag Koper</th>
                                <th class="py-3 px-4">Nama Jamaah &amp; Gender</th>
                                <th class="py-3 px-4">No Paspor</th>
                                <th class="py-3 px-4">Kamar Hotel (MK / MD)</th>
                                <th class="py-3 px-4">Kontak WhatsApp</th>
                                <th class="py-3 px-4">Status</th>
                                <th class="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="9" class="p-8 text-center text-slate-400">
                                        <i class="fa-solid fa-bus text-2xl mb-2 text-slate-300 block"></i>
                                        Tidak ada data jamaah yang sesuai filter pencarian.
                                    </td>
                                </tr>
                            ` : filtered.map(m => `
                                <tr class="hover:bg-slate-50/80 transition ${m.boarded ? 'bg-emerald-50/20' : 'bg-amber-50/15'}">
                                    <td class="py-3 px-4 text-center">
                                        <input type="checkbox" ${m.boarded ? 'checked' : ''} onchange="SDW_ADMIN.toggleBoardingStatus('${m.id}')" class="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600">
                                    </td>
                                    <td class="py-3 px-3 font-mono font-bold text-slate-900">
                                        <span class="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px]">${admin.escapeHtml(m.seat)}</span>
                                    </td>
                                    <td class="py-3 px-3">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-black ${m.busId === 'BUS-01' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}">
                                            ${admin.escapeHtml(m.luggageTag)}
                                        </span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>${m.gender === 'L' ? '👨' : '🧕'}</span>
                                            <span>${admin.escapeHtml(m.name)}</span>
                                        </div>
                                        <span class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(m.regId)} • ${admin.escapeHtml(m.busName)}</span>
                                    </td>
                                    <td class="py-3 px-4 font-mono font-semibold text-slate-700">
                                        ${admin.escapeHtml(m.passport)}
                                    </td>
                                    <td class="py-3 px-4 text-[11px]">
                                        <span class="font-bold text-purple-900">MK: ${admin.escapeHtml(m.roomMakkah)}</span>
                                        <span class="text-slate-300 mx-1">|</span>
                                        <span class="font-bold text-teal-800">MD: ${admin.escapeHtml(m.roomMadinah)}</span>
                                        <span class="text-[10px] text-slate-400 block font-medium">Tipe ${admin.escapeHtml(m.roomType)}</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <a href="https://wa.me/${String(m.phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-[11px] transition">
                                            <i class="fa-brands fa-whatsapp text-emerald-600"></i>
                                            <span>${admin.escapeHtml(m.phone)}</span>
                                        </a>
                                    </td>
                                    <td class="py-3 px-4">
                                        ${m.boarded ? `
                                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                                <i class="fa-solid fa-check text-[9px]"></i> SUDAH NAIK
                                            </span>
                                        ` : `
                                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                                <i class="fa-solid fa-clock text-[9px]"></i> BELUM NAIK
                                            </span>
                                        `}
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <button type="button" onclick="SDW_ADMIN.openAssignBusModal('${m.id}')" class="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition cursor-pointer">
                                            Ubah Kursi
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function toggleBoardingStatus(manifestId) {
        const item = admin.manifestData.find(m => (m.id && m.id === manifestId) || m.regId === manifestId || m.passport === manifestId);
        if (!item) return;

        item.boarded = !item.boarded;
        admin.persistStorage(admin.STORAGE_KEYS.MANIFEST, admin.manifestData);
        admin.enqueueMutation('updateManifest', { manifestId: manifestId, regId: item.regId, boarded: item.boarded, busId: item.busId }, 'DB_Trip_Members', item.regId);

        const statusLabel = item.boarded ? 'SUDAH NAIK BUS' : 'BELUM NAIK (BATAL BOARDING)';
        admin.logAdminAudit('TOGGLE_BOARDING', 'DB_Trip_Members', item.regId, `Absensi bus: ${item.name} (${item.busName} kursi ${item.seat}) status diubah menjadi ${statusLabel}.`);

        admin.showToast(item.boarded ? `✅ ${item.name} berhasil boarding di ${item.busName}!` : `⚠️ ${item.name} ditandai belum naik bus.`);
        renderOperations();
    }

    function batchBoarding(action) {
        if (action === 'ALL_BOARDED' || action === true) {
            admin.manifestData.forEach(m => m.boarded = true);
            admin.showToast('✅ Seluruh jamaah kloter ditandai telah boarding!');
            admin.logAdminAudit('BATCH_BOARDING', 'DB_Trip_Members', admin.activeKloterId, 'Tandai massal: seluruh 45 jamaah telah naik bus.');
        } else {
            admin.manifestData.forEach(m => m.boarded = false);
            admin.showToast('⚠️ Seluruh status boarding telah direset.');
            admin.logAdminAudit('RESET_BOARDING', 'DB_Trip_Members', admin.activeKloterId, 'Reset massal: status absensi bus dikembalikan ke belum naik.');
        }
        admin.persistStorage(admin.STORAGE_KEYS.MANIFEST, admin.manifestData);
        admin.enqueueMutation('updateManifest', { batchAction: action, kloterId: admin.activeKloterId }, 'DB_Trip_Members', admin.activeKloterId);
        renderOperations();
    }

    function openAssignBusModal(manifestId) {
        const item = admin.manifestData.find(m => m.id === manifestId);
        if (!item) return;

        const idEl = document.getElementById('assign-bus-manifest-id');
        const nameEl = document.getElementById('assign-bus-passenger-name');
        const busEl = document.getElementById('assign-bus-select');
        const seatEl = document.getElementById('assign-bus-seat');
        const tagEl = document.getElementById('assign-bus-tag');

        if (idEl) idEl.value = item.id;
        if (nameEl) nameEl.value = `${item.name} (${item.regId})`;
        if (busEl) busEl.value = item.busId;
        if (seatEl) seatEl.value = item.seat;
        if (tagEl) tagEl.value = item.luggageTag;

        admin.openModal('modalAssignBus');
    }

    function handleAssignBus(e) {
        e.preventDefault();
        const manifestId = document.getElementById('assign-bus-manifest-id').value;
        const busSelect = document.getElementById('assign-bus-select').value;
        const seatVal = document.getElementById('assign-bus-seat').value.trim();
        const tagVal = document.getElementById('assign-bus-tag').value.trim();

        const item = admin.manifestData.find(m => m.id === manifestId);
        if (!item) return;

        item.busId = busSelect;
        item.busName = busSelect === 'BUS-01' ? 'Bus 01 (Stiker Hijau)' : 'Bus 02 (Stiker Kuning)';
        item.seat = seatVal;
        item.luggageTag = tagVal;

        admin.persistStorage(admin.STORAGE_KEYS.MANIFEST, admin.manifestData);
        admin.enqueueMutation('updateManifest', { manifestId: manifestId, regId: item.regId, busId: busSelect, seat: seatVal, luggageTag: tagVal }, 'DB_Trip_Members', item.regId);
        admin.logAdminAudit('ASSIGN_BUS', 'DB_Trip_Members', item.regId, `Pemindahan armada: ${item.name} dialokasikan ke ${item.busName} kursi ${seatVal} (${tagVal}).`);

        admin.showToast(`✅ Alokasi bus untuk ${item.name} berhasil diperbarui!`);
        admin.closeModal('modalAssignBus');
        renderOperations();
    }

    function applyManifestFilter() {
        const searchInput = document.getElementById('manifest-filter-search');
        const busSelect = document.getElementById('manifest-filter-bus');
        const statusSelect = document.getElementById('manifest-filter-status');

        admin.manifestFilter.search = searchInput ? searchInput.value : '';
        admin.manifestFilter.bus = busSelect ? busSelect.value : 'ALL';
        admin.manifestFilter.status = statusSelect ? statusSelect.value : 'ALL';

        renderBusManifest();
    }

    function resetManifestFilter() {
        admin.manifestFilter = { bus: 'ALL', status: 'ALL', search: '' };
        renderBusManifest();
    }

    // 6.2 VISUAL ROOMING LIST HOTEL (MAKKAH & MADINAH)
    function renderRoomingList() {
        const container = document.getElementById('subtab-rooming-view');
        if (!container) return;

        const cityRooms = admin.roomsData.filter(r => r.city === admin.roomingFilter.city);

        // Filter rooming list
        const filtered = cityRooms.filter(r => {
            const matchType = (!admin.roomingFilter.type || admin.roomingFilter.type === 'ALL') || (r.type === admin.roomingFilter.type);
            const matchGender = (!admin.roomingFilter.gender || admin.roomingFilter.gender === 'ALL') || (r.gender === admin.roomingFilter.gender);
            const q = (admin.roomingFilter.search || '').toLowerCase().trim();
            const matchSearch = !q || 
                (r.roomNumber && r.roomNumber.toLowerCase().includes(q)) ||
                (r.occupants && r.occupants.some(o => o.toLowerCase().includes(q)));
            return matchType && matchGender && matchSearch;
        });

        const hotelName = admin.roomingFilter.city === 'MAKKAH' ? 'Retaj Al Rayyan Makkah (Bintang 4 • 350m dari Haram)' : 'Concorde Dar Al Khair Madinah (Bintang 4 • 200m dari Nabawi)';

        container.innerHTML = `
            <!-- Hotel Switcher & Top Stats -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs">
                <div class="flex items-center gap-2">
                    <button type="button" onclick="SDW_ADMIN.switchRoomingCity('MAKKAH')" class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${admin.roomingFilter.city === 'MAKKAH' ? 'sdw-tab-pill-active shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
                        <span>🕋 Hotel Makkah: Retaj Al Rayyan</span>
                    </button>
                    <button type="button" onclick="SDW_ADMIN.switchRoomingCity('MADINAH')" class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${admin.roomingFilter.city === 'MADINAH' ? 'sdw-tab-pill-active shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}">
                        <span>🕌 Hotel Madinah: Concorde Dar Al Khair</span>
                    </button>
                </div>
                <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span class="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-100">Quad: 6 Kamar</span>
                    <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-100">Triple: 3 Kamar</span>
                    <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-100">Double: 6 Kamar</span>
                </div>
            </div>

            <!-- Bilah Filter Rooming -->
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                    <div class="relative flex-1 min-w-[160px] max-w-xs">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input type="text" id="rooming-filter-search" value="${admin.escapeHtml(admin.roomingFilter.search)}" oninput="SDW_ADMIN.applyRoomingFilter()" placeholder="Cari kamar, nama penghuni..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                    </div>
                    <select id="rooming-filter-type" onchange="SDW_ADMIN.applyRoomingFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" ${admin.roomingFilter.type === 'ALL' ? 'selected' : ''}>Semua Tipe Kamar</option>
                        <option value="QUAD" ${admin.roomingFilter.type === 'QUAD' ? 'selected' : ''}>Quad (4 Orang)</option>
                        <option value="TRIPLE" ${admin.roomingFilter.type === 'TRIPLE' ? 'selected' : ''}>Triple (3 Orang)</option>
                        <option value="DOUBLE" ${admin.roomingFilter.type === 'DOUBLE' ? 'selected' : ''}>Double (2 Orang)</option>
                    </select>
                    <select id="rooming-filter-gender" onchange="SDW_ADMIN.applyRoomingFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" ${admin.roomingFilter.gender === 'ALL' ? 'selected' : ''}>Semua Kategori Muhrim</option>
                        <option value="IKHWAN" ${admin.roomingFilter.gender === 'IKHWAN' ? 'selected' : ''}>🧔 Ikhwan (Laki-laki)</option>
                        <option value="AKHWAT" ${admin.roomingFilter.gender === 'AKHWAT' ? 'selected' : ''}>🧕 Akhwat (Perempuan)</option>
                        <option value="FAMILY" ${admin.roomingFilter.gender === 'FAMILY' ? 'selected' : ''}>👨‍👩‍👧 Keluarga / Pasutri</option>
                    </select>
                    <button type="button" onclick="SDW_ADMIN.resetRoomingFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200/70 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                </div>
                <span class="text-[11px] font-bold text-slate-500">
                    Menampilkan ${filtered.length} dari ${cityRooms.length} kamar (${hotelName})
                </span>
            </div>

            <!-- Visual Room Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${filtered.length === 0 ? `
                    <div class="col-span-full p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                        <i class="fa-solid fa-hotel text-2xl mb-2 text-slate-300 block"></i>
                        Tidak ada kamar hotel yang cocok dengan filter yang dipilih.
                    </div>
                ` : filtered.map(r => {
                    const isFull = (r.occupants.length >= r.capacity);
                    const genderBadgeClass = r.gender === 'IKHWAN' ? 'bg-blue-100 text-blue-900 border-blue-200' : (r.gender === 'AKHWAT' ? 'bg-rose-100 text-rose-900 border-rose-200' : 'bg-amber-100 text-amber-900 border-amber-200');
                    const genderIcon = r.gender === 'IKHWAN' ? '🧔 IKHWAN' : (r.gender === 'AKHWAT' ? '🧕 AKHWAT' : '👨‍👩‍👧 PASUTRI / KELUARGA');

                    return `
                        <div class="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between hover:border-purple-300 transition">
                            <div class="space-y-2.5">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-black text-xs border border-purple-100">
                                            #${admin.escapeHtml(r.roomNumber)}
                                        </div>
                                        <div>
                                            <h4 class="font-black text-slate-900 text-sm">Kamar ${admin.escapeHtml(r.roomNumber)}</h4>
                                            <span class="text-[10px] text-slate-400 block font-medium">${admin.escapeHtml(r.hotel)}</span>
                                        </div>
                                    </div>
                                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black border ${genderBadgeClass}">
                                        ${genderIcon}
                                    </span>
                                </div>

                                <div class="flex items-center justify-between text-xs pt-1">
                                    <span class="font-extrabold text-purple-950 text-[11px]">Tipe ${admin.escapeHtml(r.type)} (${r.capacity} Kasur)</span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isFull ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}">
                                        ${r.occupants.length} / ${r.capacity} Kasur (${isFull ? 'Penuh' : 'Tersedia'})
                                    </span>
                                </div>

                                <!-- Occupant Bed List -->
                                <div class="space-y-1.5 pt-1">
                                    ${Array.from({ length: r.capacity }).map((_, idx) => {
                                        const occ = r.occupants[idx];
                                        const bedLetter = String.fromCharCode(65 + idx);
                                        return `
                                            <div class="p-2 rounded-xl border flex items-center justify-between text-xs ${occ ? 'bg-slate-50/80 border-slate-100 text-slate-800' : 'bg-dashed border-slate-200 text-slate-400 italic'}">
                                                <div class="flex items-center gap-2 truncate">
                                                    <span class="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        ${bedLetter}
                                                    </span>
                                                    <span class="font-semibold truncate ${occ ? 'text-slate-800' : 'text-slate-400'}">
                                                        ${occ ? admin.escapeHtml(occ) : 'Kasur Kosong'}
                                                    </span>
                                                </div>
                                                <span class="text-[10px] text-slate-400 shrink-0">Kasur ${bedLetter}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>

                            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <span class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(r.id)}</span>
                                <button type="button" onclick="SDW_ADMIN.openAssignRoomModal('${r.id}')" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-[11px] transition cursor-pointer flex items-center gap-1">
                                    <i class="fa-solid fa-user-pen text-[10px]"></i>
                                    <span>Alokasi / Ganti</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function switchRoomingCity(city) {
        admin.roomingFilter.city = city;
        renderRoomingList();
    }

    function applyRoomingFilter() {
        const searchInput = document.getElementById('rooming-filter-search');
        const typeSelect = document.getElementById('rooming-filter-type');
        const genderSelect = document.getElementById('rooming-filter-gender');

        admin.roomingFilter.search = searchInput ? searchInput.value : '';
        admin.roomingFilter.type = typeSelect ? typeSelect.value : 'ALL';
        admin.roomingFilter.gender = genderSelect ? genderSelect.value : 'ALL';

        renderRoomingList();
    }

    function resetRoomingFilter() {
        admin.roomingFilter = { city: admin.roomingFilter.city, type: 'ALL', gender: 'ALL', search: '' };
        renderRoomingList();
    }

    function openAssignRoomModal(roomId) {
        const room = admin.roomsData.find(r => r.id === roomId);
        if (!room) return;

        const idEl = document.getElementById('assign-room-id');
        const nameEl = document.getElementById('assign-room-name');
        const typeEl = document.getElementById('assign-room-type');
        const genderEl = document.getElementById('assign-room-gender');
        const slotEl = document.getElementById('assign-room-slot');
        const occupantEl = document.getElementById('assign-room-occupant');

        if (idEl) idEl.value = room.id;
        if (nameEl) nameEl.value = `${room.hotel} • Kamar ${room.roomNumber}`;
        if (typeEl) typeEl.value = `${room.type} (${room.capacity} Kasur)`;
        if (genderEl) genderEl.value = room.gender;

        if (slotEl) {
            slotEl.innerHTML = Array.from({ length: room.capacity }).map((_, idx) => {
                const bedLetter = String.fromCharCode(65 + idx);
                const occ = room.occupants[idx] || 'Kosong';
                return `<option value="${idx}">Kasur ${bedLetter} (Saat ini: ${admin.escapeHtml(occ)})</option>`;
            }).join('');
        }

        if (occupantEl) occupantEl.value = room.occupants[0] || '';

        admin.openModal('modalAssignRoom');
    }

    function handleAssignRoom(e) {
        e.preventDefault();
        const roomId = document.getElementById('assign-room-id').value;
        const genderVal = document.getElementById('assign-room-gender').value;
        const slotIdx = parseInt(document.getElementById('assign-room-slot').value, 10);
        const occupantVal = document.getElementById('assign-room-occupant').value.trim();

        const room = admin.roomsData.find(r => r.id === roomId);
        if (!room) return;

        room.gender = genderVal;
        room.occupants[slotIdx] = occupantVal;

        admin.persistStorage(admin.STORAGE_KEYS.ROOMS, admin.roomsData);
        admin.enqueueMutation('updateRooming', { roomId: roomId, hotel: room.hotel, roomNumber: room.roomNumber, gender: genderVal, slotIdx: slotIdx, occupant: occupantVal }, 'DB_Trip_Members', roomId);
        admin.logAdminAudit('ASSIGN_ROOM', 'DB_Trip_Members', room.id, `Alokasi kamar: ${room.hotel} Kamar ${room.roomNumber} Kasur ${String.fromCharCode(65 + slotIdx)} diisi oleh ${occupantVal}.`);

        admin.showToast(`✅ Alokasi Kamar ${room.roomNumber} berhasil disimpan!`);
        admin.closeModal('modalAssignRoom');
        renderOperations();
    }

    // 6.3 HANDLING BANDARA & KONTAK DARURAT
    function renderAirportHandling() {
        const container = document.getElementById('subtab-airport-view');
        if (!container) return;

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Card 1: Bandara King Abdulaziz (JED) -->
                <div class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-purple-900 text-white flex items-center justify-center text-lg font-bold">
                                🛫
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Bandara King Abdulaziz (JED) Jeddah</h3>
                                <span class="text-[11px] text-purple-700 font-bold block">Terminal 1 / Terminal Haji &amp; Umroh</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            STANDBY OPERASIONAL
                        </span>
                    </div>

                    <div class="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Chief Ground Handler:</span>
                            <strong class="text-purple-950 font-bold">Sdr. Farhan Al-Harbi</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Meeting Point:</span>
                            <strong class="text-slate-800">Gerbang 4 Plaza Kedatangan</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Layanan Fast-Track:</span>
                            <span class="text-emerald-700 font-bold">Kargo Bagasi &amp; Clearance Imigrasi</span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center gap-2">
                        <a href="tel:+966548881234" class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition">
                            <i class="fa-solid fa-phone mr-1 text-purple-700"></i> +966 54 888 1234
                        </a>
                        <a href="https://wa.me/966548881234" target="_blank" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition shadow-2xs">
                            <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp Handler
                        </a>
                    </div>
                </div>

                <!-- Card 2: Bandara Pangeran Mohammad (MED) -->
                <div class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-lg font-bold">
                                🛬
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Bandara Prince Mohammad (MED) Madinah</h3>
                                <span class="text-[11px] text-teal-700 font-bold block">Terminal Muassasah Barat</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            STANDBY OPERASIONAL
                        </span>
                    </div>

                    <div class="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Chief Ground Handler:</span>
                            <strong class="text-teal-950 font-bold">Sdr. Tariq Al-Madani</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Meeting Point:</span>
                            <strong class="text-slate-800">Ruang Muassasah Gerbang 2</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Distribusi Zamzam:</span>
                            <span class="text-teal-700 font-bold">5 Liter per Jamaah Resmi</span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center gap-2">
                        <a href="tel:+966567775678" class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition">
                            <i class="fa-solid fa-phone mr-1 text-teal-700"></i> +966 56 777 5678
                        </a>
                        <a href="https://wa.me/966567775678" target="_blank" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition shadow-2xs">
                            <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp Handler
                        </a>
                    </div>
                </div>

                <!-- Card 3: Maktab & Muassasah 42 -->
                <div class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-lg font-bold">
                                🏛️
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Maktab No. 42 Asia Tenggara</h3>
                                <span class="text-[11px] text-amber-800 font-bold block">Muassasah Pelayanan Umroh Makkah</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                            RESMI KSA
                        </span>
                    </div>

                    <div class="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Ketua Maktab:</span>
                            <strong class="text-amber-950 font-bold">Syeikh Fahad Al-Qurashi</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Kantor Operasional:</span>
                            <strong class="text-slate-800">Distrik Ajyad, Makkah Mukarramah</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Katering &amp; Logistik:</span>
                            <span class="text-amber-800 font-bold">Menu Masakan Nusantara Siap Saji</span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center gap-2">
                        <a href="tel:+966509998765" class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition">
                            <i class="fa-solid fa-phone mr-1 text-amber-700"></i> +966 50 999 8765
                        </a>
                        <a href="https://wa.me/966509998765" target="_blank" class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition shadow-2xs">
                            <i class="fa-brands fa-whatsapp mr-1"></i> Hubungi Maktab
                        </a>
                    </div>
                </div>

                <!-- Card 4: Posko Medis & KJRI Darurat -->
                <div class="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-10 h-10 rounded-2xl bg-rose-700 text-white flex items-center justify-center text-lg font-bold">
                                🏥
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 text-sm sm:text-base">Posko Medis SDW &amp; KJRI Jeddah</h3>
                                <span class="text-[11px] text-rose-700 font-bold block">Perlindungan WNI &amp; Kesehatan Kloter</span>
                            </div>
                        </div>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900">
                            24 JAM DARURAT
                        </span>
                    </div>

                    <div class="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs space-y-1.5">
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Dokter Kloter SDW:</span>
                            <strong class="text-rose-950 font-bold">dr. H. Arif Rahman, Sp.PD</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Hotline KJRI Jeddah:</span>
                            <strong class="text-slate-800">+966 12 660 3000</strong>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-slate-500 font-semibold">Nomor Darurat Saudi:</span>
                            <span class="text-rose-800 font-bold font-mono">911 (Polisi) • 997 (Ambulans)</span>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center gap-2">
                        <a href="tel:+6281234567890" class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition">
                            <i class="fa-solid fa-user-doctor mr-1 text-rose-700"></i> Dokter Kloter
                        </a>
                        <a href="https://wa.me/966503448467" target="_blank" class="flex-1 py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs text-center transition shadow-2xs">
                            <i class="fa-brands fa-whatsapp mr-1"></i> WA Satgas KJRI
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // 6.4 IKHTISAR SEMUA KLOTER
    function renderTripsList() {
        const tripSummaryEl = document.getElementById('operations-kloter-container');
        if (!tripSummaryEl) return;

        tripSummaryEl.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${admin.tripsData.map(t => `
                    <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-[11px] font-black text-amber-700 uppercase tracking-wider">${admin.escapeHtml(t.title)}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${t.tagClass || 'bg-emerald-100 text-emerald-800'}">${admin.escapeHtml(t.tag || 'OPEN')}</span>
                        </div>
                        <h3 class="font-black text-base text-sdw-pine">${admin.escapeHtml(t.date)}</h3>
                        <div class="text-xs text-slate-600 space-y-1">
                            <div>✈️ Maskapai: <strong>${admin.escapeHtml(t.airline)}</strong></div>
                            <div>🏨 Makkah: <strong>${admin.escapeHtml(t.hotelMakkah)}</strong></div>
                            <div>🏨 Madinah: <strong>${admin.escapeHtml(t.hotelMadinah)}</strong></div>
                            <div>👳 Muthawwif: <strong>${admin.escapeHtml(t.muthawwif)}</strong></div>
                        </div>
                        <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-xs text-slate-500 font-bold">${admin.escapeHtml(t.busSummary || 'Bus 01 & Bus 02')}</span>
                            <button type="button" onclick="SDW_ADMIN.openTripManifestModal('${t.id}')" class="px-3 py-1 rounded-lg bg-sdw-pine text-white text-[11px] font-bold hover:bg-purple-900 transition cursor-pointer">
                                Lihat Manifest &amp; Kamar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }



    function renderLogistics() {
        const container = document.getElementById('operations-logistics-container');
        if (!container) return;

        const total = admin.logisticsData.length;
        const completeCount = admin.logisticsData.filter(l => l.status === 'LENGKAP').length;
        const partialCount = admin.logisticsData.filter(l => l.status === 'SEBAGIAN').length;
        const pendingCount = admin.logisticsData.filter(l => l.status === 'BELUM').length;
        const pct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

        const filtered = admin.logisticsData.filter(l => {
            const q = (admin.logisticsFilter.search || '').toLowerCase().trim();
            const matchSearch = !q ||
                (l.name && l.name.toLowerCase().includes(q)) ||
                (l.regId && l.regId.toLowerCase().includes(q)) ||
                (l.phone && l.phone.includes(q));
            const matchStatus = (!admin.logisticsFilter.status || admin.logisticsFilter.status === 'ALL') || (l.status === admin.logisticsFilter.status);
            return matchSearch && matchStatus;
        });

        container.innerHTML = `
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
                <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Jamaah Kloter</div>
                    <div class="text-2xl font-black text-slate-900 mt-1">${total} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Kloter Utama (15 Jan 2027)</div>
                </div>
                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Koper Lengkap (5/5)</div>
                    <div class="text-2xl font-black text-emerald-700 mt-1">${completeCount} <span class="text-xs font-bold text-emerald-600">(${pct}%)</span></div>
                    <div class="text-[11px] text-emerald-700 mt-0.5">Siap bagasi bandara</div>
                </div>
                <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Distribusi Sebagian</div>
                    <div class="text-2xl font-black text-amber-700 mt-1">${partialCount} <span class="text-xs font-semibold text-amber-600">Pax</span></div>
                    <div class="text-[11px] text-amber-700 mt-0.5">Kurang batik / buku doa</div>
                </div>
                <div class="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Belum Diambil</div>
                    <div class="text-2xl font-black text-rose-700 mt-1">${pendingCount} <span class="text-xs font-semibold text-rose-600">Pax</span></div>
                    <div class="text-[11px] text-rose-700 mt-0.5">Perlu follow up via WA</div>
                </div>
            </div>

            <!-- Toolbar & Filter -->
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div class="flex flex-wrap items-center gap-2 flex-1">
                    <div class="relative flex-1 min-w-[200px] max-w-sm">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input type="text" id="logistics-filter-search" oninput="SDW_ADMIN.applyLogisticsFilter()" value="${admin.escapeHtml(admin.logisticsFilter.search || '')}" placeholder="Cari nama jamaah, ID reg, no telp..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                    </div>
                    <select id="logistics-filter-status" onchange="SDW_ADMIN.applyLogisticsFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" ${admin.logisticsFilter.status === 'ALL' ? 'selected' : ''}>Semua Status Distribusi</option>
                        <option value="LENGKAP" ${admin.logisticsFilter.status === 'LENGKAP' ? 'selected' : ''}>🟢 Lengkap (5/5 Item)</option>
                        <option value="SEBAGIAN" ${admin.logisticsFilter.status === 'SEBAGIAN' ? 'selected' : ''}>🟡 Sebagian</option>
                        <option value="BELUM" ${admin.logisticsFilter.status === 'BELUM' ? 'selected' : ''}>🔴 Belum Diambil</option>
                    </select>
                    <button type="button" onclick="SDW_ADMIN.resetLogisticsFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="SDW_ADMIN.batchLogistics('completeAll')" class="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-check-double text-purple-700"></i>
                        <span>Tandai Semua Lengkap</span>
                    </button>
                    <button type="button" onclick="SDW_ADMIN.exportToCSV('LOGISTICS')" class="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i>
                        <span>Unduh Berita Acara (CSV)</span>
                    </button>
                </div>
            </div>

            <!-- Table of Logistics -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[950px]">
                        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="py-3 px-4">No</th>
                                <th class="py-3 px-4">ID Reg &amp; Nama Jamaah</th>
                                <th class="py-3 px-2 text-center" title="Koper Bagasi 24 Inci">Koper 24"</th>
                                <th class="py-3 px-2 text-center" title="Tas Kabin 7 Kg">Tas Kabin</th>
                                <th class="py-3 px-2 text-center" title="Kain Ihram (Ikhwan) / Mukena (Akhwat)">Ihram/Mukena</th>
                                <th class="py-3 px-2 text-center" title="Seragam Batik Resmi SDW">Batik SDW</th>
                                <th class="py-3 px-2 text-center" title="Buku Panduan Doa &amp; ID Card">Buku &amp; ID</th>
                                <th class="py-3 px-4 text-center">Status</th>
                                <th class="py-3 px-4">Tgl Ambil &amp; Catatan</th>
                                <th class="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="10" class="p-8 text-center text-slate-400 text-xs">
                                        <i class="fa-solid fa-box-open text-slate-300 text-2xl mb-2 block"></i>
                                        Tidak ada data distribusi logistik yang sesuai filter.
                                    </td>
                                </tr>
                            ` : filtered.map((l, idx) => {
                                let badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
                                if (l.status === 'LENGKAP') badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                else if (l.status === 'SEBAGIAN') badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';

                                return `
                                <tr class="hover:bg-slate-50/80 transition">
                                    <td class="py-3 px-4 text-slate-400 font-mono">${idx + 1}</td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-900">${admin.escapeHtml(l.name)}</div>
                                        <div class="text-[11px] font-mono text-slate-500">${admin.escapeHtml(l.regId)} • ${admin.escapeHtml(l.phone || '-')}</div>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('${l.regId}', 'koperBagasi')" class="w-7 h-7 rounded-lg border ${l.koperBagasi ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('${l.regId}', 'tasKabin')" class="w-7 h-7 rounded-lg border ${l.tasKabin ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('${l.regId}', 'kainIhram')" class="w-7 h-7 rounded-lg border ${l.kainIhram ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('${l.regId}', 'batikSDW')" class="w-7 h-7 rounded-lg border ${l.batikSDW ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('${l.regId}', 'bukuDoa')" class="w-7 h-7 rounded-lg border ${l.bukuDoa ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${badgeClass}">${l.status}</span>
                                    </td>
                                    <td class="py-3 px-4 text-slate-600 max-w-[200px]">
                                        <div class="font-medium truncate" title="${admin.escapeHtml(l.notes)}">${admin.escapeHtml(l.notes)}</div>
                                        <div class="text-[10px] text-slate-400 mt-0.5">${l.pickupDate ? 'Diserahkan: ' + l.pickupDate : 'Belum ada tanggal'}</div>
                                    </td>
                                    <td class="py-3 px-4 text-right">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsComplete('${l.regId}')" class="px-2.5 py-1 rounded-lg ${l.status === 'LENGKAP' ? 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-bold text-[11px] transition cursor-pointer shadow-2xs">
                                            ${l.status === 'LENGKAP' ? 'Reset' : 'Lengkapkan'}
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function toggleLogisticsItem(regId, itemKey) {
        const item = admin.logisticsData.find(l => l.regId === regId);
        if (!item) return;

        // Support both property names
        const keyMap = {
            koper: 'koperBagasi',
            kabin: 'tasKabin',
            ihram: 'kainIhram',
            batik: 'batikSDW',
            bukuId: 'bukuDoa'
        };
        const targetProp = keyMap[itemKey] || itemKey;
        const currentVal = item[targetProp] !== undefined ? item[targetProp] : item[itemKey];
        item[targetProp] = !currentVal;
        if (keyMap[itemKey]) item[itemKey] = !currentVal;

        const checkedCount = [item.koperBagasi || item.koper, item.tasKabin || item.kabin, item.kainIhram || item.ihram, item.batikSDW || item.batik, item.bukuDoa || item.bukuId].filter(Boolean).length;
        item.status = checkedCount === 5 ? 'LENGKAP' : (checkedCount > 0 ? 'SEBAGIAN' : 'BELUM');
        if (item.status === 'LENGKAP' && !item.pickupDate) {
            item.pickupDate = new Date().toISOString().slice(0, 10);
            item.notes = 'Penyerahan perlengkapan lengkap tervalidasi.';
        }

        admin.persistStorage(admin.STORAGE_KEYS.LOGISTICS, admin.logisticsData);
        admin.enqueueMutation('updatePreparation', { regId, itemKey, value: item[targetProp], status: item.status, pickupDate: item.pickupDate }, 'DB_Preparation', regId);
        admin.logAdminAudit('UPDATE_LOGISTICS', 'DB_Preparation', regId, `Status ${itemKey} jamaah ${item.name} diubah menjadi ${item[targetProp] ? 'DISERAHKAN' : 'BELUM'}.`, 'INFO');

        admin.showToast(`📦 Status ${itemKey} ${item.name} diperbarui!`);
        renderLogistics();
    }

    function toggleLogisticsComplete(regId) {
        const item = admin.logisticsData.find(l => l.regId === regId);
        if (!item) return;

        const isCurrentlyComplete = item.status === 'LENGKAP';
        const newVal = !isCurrentlyComplete;

        item.koperBagasi = newVal;
        item.tasKabin = newVal;
        item.kainIhram = newVal;
        item.batikSDW = newVal;
        item.bukuDoa = newVal;
        item.koper = newVal;
        item.kabin = newVal;
        item.ihram = newVal;
        item.batik = newVal;
        item.bukuId = newVal;
        item.status = newVal ? 'LENGKAP' : 'BELUM';
        item.pickupDate = newVal ? new Date().toISOString().slice(0, 10) : null;
        item.notes = newVal ? 'Paket perlengkapan 5/5 telah diserahkan lengkap.' : 'Belum konfirmasi pengambilan.';

        admin.persistStorage(admin.STORAGE_KEYS.LOGISTICS, admin.logisticsData);
        admin.enqueueMutation('updatePreparation', { regId, batchAll: true, value: newVal, status: item.status, pickupDate: item.pickupDate }, 'DB_Preparation', regId);
        admin.logAdminAudit('UPDATE_LOGISTICS', 'DB_Preparation', regId, `Status seluruh perlengkapan jamaah ${item.name} diubah menjadi ${item.status}.`, 'INFO');

        admin.showToast(`📦 Perlengkapan ${item.name} ditandai ${item.status}!`);
        renderLogistics();
    }

    function batchLogistics(action) {
        if (action === 'completeAll' || action === 'COMPLETE_ALL') {
            const today = new Date().toISOString().slice(0, 10);
            admin.logisticsData.forEach(l => {
                l.koperBagasi = true;
                l.tasKabin = true;
                l.kainIhram = true;
                l.batikSDW = true;
                l.bukuDoa = true;
                l.koper = true;
                l.kabin = true;
                l.ihram = true;
                l.batik = true;
                l.bukuId = true;
                l.status = 'LENGKAP';
                if (!l.pickupDate) l.pickupDate = today;
                l.notes = 'Penyerahan massal terverifikasi operasional SDW.';
            });
            admin.persistStorage(admin.STORAGE_KEYS.LOGISTICS, admin.logisticsData);
            admin.enqueueMutation('updatePreparation', { batchAction: 'COMPLETE_ALL', timestamp: new Date().toISOString() }, 'DB_Preparation', 'BATCH_ALL');
            admin.logAdminAudit('BATCH_UPDATE_LOGISTICS', 'DB_Preparation', 'ALL', 'Staf menandai seluruh perlengkapan jamaah kloter sebagai LENGKAP.', 'WARNING');
            admin.showToast('📦 Seluruh perlengkapan jamaah kloter ditandai LENGKAP!');
            renderLogistics();
        }
    }

    function applyLogisticsFilter() {
        const searchInput = document.getElementById('logistics-filter-search');
        const statusSelect = document.getElementById('logistics-filter-status');
        admin.logisticsFilter.search = searchInput ? searchInput.value : '';
        admin.logisticsFilter.status = statusSelect ? statusSelect.value : 'ALL';
        renderLogistics();
    }

    function resetLogisticsFilter() {
        admin.logisticsFilter = { search: '', status: 'ALL' };
        renderLogistics();
    }

    // ====================================================================
    // FASE 5: BIMBINGAN & PRESENSI MANASIK
    // ====================================================================
    function renderManasik() {
        const container = document.getElementById('operations-manasik-container');
        if (!container) return;

        const total = admin.manasikData.length;
        const readyCount = admin.manasikData.filter(m => m.readiness === 'SIAP').length;
        const remedialCount = admin.manasikData.filter(m => m.readiness === 'REMEDIAL').length;
        const pendingCount = admin.manasikData.filter(m => m.readiness === 'BELUM_EVALUASI').length;
        const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

        const filtered = admin.manasikData.filter(m => {
            const q = (admin.manasikFilter.search || '').toLowerCase().trim();
            const matchSearch = !q ||
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.regId && m.regId.toLowerCase().includes(q)) ||
                (m.phone && m.phone.includes(q));
            const matchStatus = (!admin.manasikFilter.status || admin.manasikFilter.status === 'ALL') || (m.readiness === admin.manasikFilter.status);
            return matchSearch && matchStatus;
        });

        container.innerHTML = `
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
                <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Peserta Manasik</div>
                    <div class="text-2xl font-black text-slate-900 mt-1">${total} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Kloter Utama (15 Jan 2027)</div>
                </div>
                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Siap Berangkat (Lulus)</div>
                    <div class="text-2xl font-black text-emerald-700 mt-1">${readyCount} <span class="text-xs font-bold text-emerald-600">(${pct}%)</span></div>
                    <div class="text-[11px] text-emerald-700 mt-0.5">Hadir Sesi 1 &amp; Sesi 2</div>
                </div>
                <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Butuh Pengayaan / Izin</div>
                    <div class="text-2xl font-black text-amber-700 mt-1">${remedialCount} <span class="text-xs font-semibold text-amber-600">Pax</span></div>
                    <div class="text-[11px] text-amber-700 mt-0.5">Dijadwalkan sesi susulan</div>
                </div>
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Belum Evaluasi</div>
                    <div class="text-2xl font-black text-slate-700 mt-1">${pendingCount} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Jamaah baru / susulan</div>
                </div>
            </div>

            <!-- Toolbar & Filter -->
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div class="flex flex-wrap items-center gap-2 flex-1">
                    <div class="relative flex-1 min-w-[200px] max-w-sm">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input type="text" id="manasik-filter-search" oninput="SDW_ADMIN.applyManasikFilter()" value="${admin.escapeHtml(admin.manasikFilter.search || '')}" placeholder="Cari nama jamaah, ID reg, no telp..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                    </div>
                    <select id="manasik-filter-status" onchange="SDW_ADMIN.applyManasikFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" ${admin.manasikFilter.status === 'ALL' ? 'selected' : ''}>Semua Tingkat Kesiapan</option>
                        <option value="SIAP" ${admin.manasikFilter.status === 'SIAP' ? 'selected' : ''}>🟢 Siap Berangkat (Lulus 2 Sesi)</option>
                        <option value="REMEDIAL" ${admin.manasikFilter.status === 'REMEDIAL' ? 'selected' : ''}>🟡 Butuh Pengayaan / Remedial</option>
                        <option value="BELUM_EVALUASI" ${admin.manasikFilter.status === 'BELUM_EVALUASI' ? 'selected' : ''}>⚪ Belum Hadir / Evaluasi</option>
                    </select>
                    <button type="button" onclick="SDW_ADMIN.resetManasikFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="SDW_ADMIN.batchManasik('attendAll')" class="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-user-check text-purple-700"></i>
                        <span>Presensi Cepat Hadir Semua</span>
                    </button>
                    <button type="button" onclick="SDW_ADMIN.exportToCSV('MANASIK')" class="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i>
                        <span>Unduh Presensi Manasik (CSV)</span>
                    </button>
                </div>
            </div>

            <!-- Table of Manasik Attendance -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[950px]">
                        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="py-3 px-4">No</th>
                                <th class="py-3 px-4">ID Reg &amp; Nama Jamaah</th>
                                <th class="py-3 px-4 text-center">Sesi 1: Teori Fiqih Umroh</th>
                                <th class="py-3 px-4 text-center">Sesi 2: Praktek Lapangan</th>
                                <th class="py-3 px-4 text-center">Kesiapan Fiqih</th>
                                <th class="py-3 px-4">Catatan Pembimbing</th>
                                <th class="py-3 px-4 text-right">Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                                        <i class="fa-solid fa-mosque text-slate-300 text-2xl mb-2 block"></i>
                                        Tidak ada data presensi manasik yang sesuai filter.
                                    </td>
                                </tr>
                            ` : filtered.map((m, idx) => {
                                let readyBadge = 'bg-slate-100 text-slate-700 border border-slate-200';
                                let readyLabel = 'Belum Evaluasi';
                                if (m.readiness === 'SIAP') {
                                    readyBadge = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                    readyLabel = 'Siap Berangkat';
                                } else if (m.readiness === 'REMEDIAL') {
                                    readyBadge = 'bg-amber-100 text-amber-800 border border-amber-200';
                                    readyLabel = 'Butuh Pengayaan';
                                }

                                return `
                                <tr class="hover:bg-slate-50/80 transition">
                                    <td class="py-3 px-4 text-slate-400 font-mono">${idx + 1}</td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-900">${admin.escapeHtml(m.name)}</div>
                                        <div class="text-[11px] font-mono text-slate-500">${admin.escapeHtml(m.regId)} • ${admin.escapeHtml(m.phone || '-')}</div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi1Teori', 'HADIR')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi1Teori === 'HADIR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Hadir</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi1Teori', 'IZIN')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi1Teori === 'IZIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Izin</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi1Teori', 'ALPHA')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi1Teori === 'ALPHA' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Alpha</button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi2Praktek', 'HADIR')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi2Praktek === 'HADIR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Hadir</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi2Praktek', 'IZIN')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi2Praktek === 'IZIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Izin</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('${m.regId}', 'sesi2Praktek', 'ALPHA')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${m.sesi2Praktek === 'ALPHA' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Alpha</button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${readyBadge}">${readyLabel}</span>
                                    </td>
                                    <td class="py-3 px-4 text-slate-600 max-w-[240px]">
                                        <div class="truncate text-[11px]" title="${admin.escapeHtml(m.notes)}">${admin.escapeHtml(m.notes)}</div>
                                    </td>
                                    <td class="py-3 px-4 text-right">
                                        <button type="button" onclick="SDW_ADMIN.toggleManasikPassBoth('${m.regId}')" class="px-2.5 py-1 rounded-lg bg-sdw-pine hover:bg-purple-900 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs">
                                            Luluskan 2 Sesi
                                        </button>
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function toggleManasikAttendance(regId, sessionKey, status) {
        const item = admin.manasikData.find(m => m.regId === regId);
        if (!item) return;

        if (sessionKey === 'session1' || sessionKey === 'sesi1Teori') {
            item.session1 = status;
            item.sesi1Teori = status;
        } else if (sessionKey === 'session2' || sessionKey === 'sesi2Praktek') {
            item.session2 = status;
            item.sesi2Praktek = status;
        } else {
            item[sessionKey] = status;
        }

        const isSesi1Hadir = (item.sesi1Teori || item.session1) === 'HADIR';
        const isSesi2Hadir = (item.sesi2Praktek || item.session2) === 'HADIR';
        const isSesi1Izin = (item.sesi1Teori || item.session1) === 'IZIN';
        const isSesi2Izin = (item.sesi2Praktek || item.session2) === 'IZIN';

        if (isSesi1Hadir && isSesi2Hadir) {
            item.readiness = 'SIAP';
            item.notes = 'Lulus seluruh materi fiqih & simulasi manasik.';
        } else if (isSesi1Hadir || isSesi2Hadir || isSesi1Izin || isSesi2Izin) {
            item.readiness = 'REMEDIAL';
            item.notes = 'Dijadwalkan pembekalan materi tambahan sebelum keberangkatan.';
        } else {
            item.readiness = 'BELUM_EVALUASI';
        }

        admin.persistStorage(admin.STORAGE_KEYS.MANASIK, admin.manasikData);
        admin.enqueueMutation('updateManasik', { regId, sessionKey, status, readiness: item.readiness, notes: item.notes }, 'DB_Manasik', regId);
        admin.logAdminAudit('UPDATE_MANASIK', 'DB_Manasik', regId, `Presensi ${sessionKey} jamaah ${item.name} diperbarui ke ${status}.`, 'INFO');

        admin.showToast(`🕋 Presensi ${item.name} diperbarui ke ${status}!`);
        renderManasik();
    }

    function toggleManasikPassBoth(regId) {
        const item = admin.manasikData.find(m => m.regId === regId);
        if (!item) return;

        item.sesi1Teori = 'HADIR';
        item.sesi2Praktek = 'HADIR';
        item.session1 = 'HADIR';
        item.session2 = 'HADIR';
        item.readiness = 'SIAP';
        item.notes = 'Lulus bimbingan teori & praktek manasik, siap berangkat.';

        admin.persistStorage(admin.STORAGE_KEYS.MANASIK, admin.manasikData);
        admin.enqueueMutation('updateManasik', { regId, sesi1Teori: 'HADIR', sesi2Praktek: 'HADIR', readiness: 'SIAP', notes: item.notes }, 'DB_Manasik', regId);
        admin.logAdminAudit('UPDATE_MANASIK', 'DB_Manasik', regId, `Jamaah ${item.name} dinyatakan LULUS kedua sesi bimbingan manasik.`, 'INFO');

        admin.showToast(`🕋 ${item.name} dinyatakan SIAP BERANGKAT!`);
        renderManasik();
    }

    function batchManasik(action) {
        if (action === 'attendAll' || action === 'ATTEND_ALL' || action === 'PASS_ALL') {
            admin.manasikData.forEach(m => {
                m.sesi1Teori = 'HADIR';
                m.sesi2Praktek = 'HADIR';
                m.session1 = 'HADIR';
                m.session2 = 'HADIR';
                m.readiness = 'SIAP';
                m.notes = 'Presensi massal kloter, pemahaman rukun umroh tuntas.';
            });
            admin.persistStorage(admin.STORAGE_KEYS.MANASIK, admin.manasikData);
            admin.enqueueMutation('updateManasik', { batchAction: 'ATTEND_ALL', timestamp: new Date().toISOString() }, 'DB_Manasik', 'BATCH_ALL');
            admin.logAdminAudit('BATCH_UPDATE_MANASIK', 'DB_Manasik', 'ALL', 'Presensi massal seluruh jamaah kloter ditandai HADIR pada kedua sesi.', 'WARNING');
            admin.showToast('🕋 Seluruh jamaah kloter ditandai HADIR pada seluruh sesi manasik!');
            renderManasik();
        }
    }

    function applyManasikFilter() {
        const searchInput = document.getElementById('manasik-filter-search');
        const statusSelect = document.getElementById('manasik-filter-status');
        admin.manasikFilter.search = searchInput ? searchInput.value : '';
        admin.manasikFilter.status = statusSelect ? statusSelect.value : 'ALL';
        renderManasik();
    }

    function resetManasikFilter() {
        admin.manasikFilter = { search: '', status: 'ALL' };
        renderManasik();
    }

    // ====================================================================
    // FASE 6: PRIVASI DATA, AUTO-LOCK SCREEN & KEAMANAN SISTEM
    // ====================================================================

    // Attach all exported functions to admin
    admin.handleCreateTrip = handleCreateTrip;
    admin.openTripManifestModal = openTripManifestModal;
    admin.switchOperationsSubtab = switchOperationsSubtab;
    admin.changeKloter = changeKloter;
    admin.renderOperations = renderOperations;
    admin.renderBusManifest = renderBusManifest;
    admin.toggleBoardingStatus = toggleBoardingStatus;
    admin.batchBoarding = batchBoarding;
    admin.openAssignBusModal = openAssignBusModal;
    admin.handleAssignBus = handleAssignBus;
    admin.applyManifestFilter = applyManifestFilter;
    admin.resetManifestFilter = resetManifestFilter;
    admin.renderRoomingList = renderRoomingList;
    admin.switchRoomingCity = switchRoomingCity;
    admin.applyRoomingFilter = applyRoomingFilter;
    admin.resetRoomingFilter = resetRoomingFilter;
    admin.openAssignRoomModal = openAssignRoomModal;
    admin.handleAssignRoom = handleAssignRoom;
    admin.renderAirportHandling = renderAirportHandling;
    admin.renderTripsList = renderTripsList;
    admin.renderLogistics = renderLogistics;
    admin.toggleLogisticsItem = toggleLogisticsItem;
    admin.toggleLogisticsComplete = toggleLogisticsComplete;
    admin.batchLogistics = batchLogistics;
    admin.applyLogisticsFilter = applyLogisticsFilter;
    admin.resetLogisticsFilter = resetLogisticsFilter;
    admin.renderManasik = renderManasik;
    admin.toggleManasikAttendance = toggleManasikAttendance;
    admin.toggleManasikPassBoth = toggleManasikPassBoth;
    admin.batchManasik = batchManasik;
    admin.applyManasikFilter = applyManasikFilter;
    admin.resetManasikFilter = resetManasikFilter;

    return admin;
});
