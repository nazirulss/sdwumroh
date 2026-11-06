/**
 * ====================================================================
 * SDW UMROH — DEPARTURES SCHEDULE CONTROLLER
 * File: js/departures.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_DEPARTURES = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function initDepartures(containerId = 'departures-table-body') {
        const tbody = document.getElementById(containerId);
        if (tbody) renderDeparturesTable(tbody);
        loadDeparturesAsync(containerId);
    }

    async function loadDeparturesAsync(containerId = 'departures-table-body') {
        const tbody = document.getElementById(containerId);
        if (typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            try {
                const res = await SDW_API.get('getDepartures');
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    if (typeof MOCK_DATA !== 'undefined') {
                        const liveDeps = res.data.map(d => {
                            const existing = (MOCK_DATA.departures || []).find(ed => ed.id === d.id) || {};
                            return {
                                ...existing,
                                ...d,
                                id: d.id,
                                package_id: d.package_id,
                                departure_date: d.departure_date ? String(d.departure_date).substring(0, 10) : existing.departure_date,
                                return_date: d.return_date ? String(d.return_date).substring(0, 10) : existing.return_date,
                                airline: d.airline || existing.airline,
                                origin_airport: d.origin_airport || existing.origin_airport || 'CGK',
                                capacity_total: Number(d.capacity_total) || existing.capacity_total || 45,
                                capacity_booked: Number(d.capacity_booked) || existing.capacity_booked || 0,
                                status: d.status || existing.status || 'OPEN',
                                notes: d.notes || existing.notes || ''
                            };
                        });
                        MOCK_DATA.departures = liveDeps;
                    }
                    if (tbody) renderDeparturesTable(tbody);
                    if (typeof window.renderDepartures === 'function') window.renderDepartures();
                    return res.data;
                }
            } catch (err) {
                console.warn('[SDW_DEPARTURES] Gagal memuat jadwal live dari Spreadsheet, menggunakan cache lokal:', err);
            }
        }
        if (tbody) renderDeparturesTable(tbody);
    }

    function renderDeparturesTable(tbody) {
        const departures = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.departures) ? MOCK_DATA.departures : [];
        const packages = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.packages) ? MOCK_DATA.packages : [];

        if (departures.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-sdw-muted">Belum ada jadwal keberangkatan yang dipublikasikan.</td></tr>`;
            return;
        }

        tbody.innerHTML = departures.map(dep => {
            const pkg = packages.find(p => p.id === dep.package_id) || { name: 'Paket Umroh', starting_price: 0 };
            const percent = Math.min(100, Math.round((dep.capacity_booked / dep.capacity_total) * 100));
            const seatsLeft = Math.max(0, dep.capacity_total - dep.capacity_booked);
            const isFull = dep.status === 'FULL' || seatsLeft === 0;

            const statusChip = isFull
                ? `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 border border-rose-300">Penuh</span>`
                : `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">Sisa ${seatsLeft} Kursi</span>`;

            const waText = encodeURIComponent(`Assalamualaikum CS SDW UMROH, saya ingin menanyakan jadwal keberangkatan ${dep.departure_date} untuk ${pkg.name}.`);
            const waNumber = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.contact && APP_CONFIG.contact.whatsapp) ? APP_CONFIG.contact.whatsapp : "6281234567890";

            return `
                <tr class="hover:bg-sdw-sand/60 transition border-b border-sdw-border/80 text-xs sm:text-sm">
                    <td class="py-4 px-4 font-bold text-sdw-pine">
                        <div class="flex items-center gap-2">
                            <i class="fa-regular fa-calendar-check text-sdw-gold text-base"></i>
                            <div>
                                <div>${dep.departure_date}</div>
                                <div class="text-[11px] text-sdw-muted font-normal">s.d. ${dep.return_date}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4 font-semibold text-sdw-charcoal">
                        ${pkg.name}
                        <div class="text-[11px] text-sdw-muted">${pkg.duration_days ? pkg.duration_days + ' Hari' : ''}</div>
                    </td>
                    <td class="py-4 px-4">
                        <div class="font-medium text-sdw-charcoal">${dep.airline}</div>
                        <div class="text-[11px] text-sdw-muted">${dep.origin_airport}</div>
                    </td>
                    <td class="py-4 px-4">
                        <div class="w-32 sm:w-40">
                            <div class="flex justify-between text-[11px] font-bold text-sdw-charcoal mb-1">
                                <span>${dep.capacity_booked} / ${dep.capacity_total} Seat</span>
                                <span class="${percent >= 90 ? 'text-rose-600' : 'text-emerald-700'}">${percent}%</span>
                            </div>
                            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div class="h-full rounded-full ${percent >= 90 ? 'bg-rose-500' : 'bg-sdw-emerald'}" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-4">
                        ${statusChip}
                    </td>
                    <td class="py-4 px-4 text-right">
                        ${isFull 
                            ? `<button disabled class="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">Habis</button>`
                            : `<a href="https://wa.me/${waNumber}?text=${waText}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sdw-pine hover:bg-sdw-pineLight text-white text-xs font-bold transition shadow-xs">
                                 <span>Booking</span>
                                 <i class="fa-solid fa-arrow-right text-[10px]"></i>
                               </a>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }

    return {
        init: initDepartures,
        loadDeparturesAsync: loadDeparturesAsync,
        renderDeparturesTable: renderDeparturesTable
    };
});
