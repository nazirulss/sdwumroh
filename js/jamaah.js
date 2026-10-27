/**
 * ====================================================================
 * SDW UMROH — SURFACE 2: JAMAAH PWA CONTROLLER
 * File: js/jamaah.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_JAMAAH = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function initJamaahView() {
        renderProfile();
        renderDocuments();
        renderFinance();
        renderManasik();
    }

    function renderProfile() {
        const pilgrim = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.currentPilgrim) ? MOCK_DATA.currentPilgrim : null;
        if (!pilgrim) return;

        const elName = document.getElementById('jamaah-name');
        const elRegId = document.getElementById('jamaah-reg-id');
        const elPackage = document.getElementById('jamaah-package-title');
        const elFlight = document.getElementById('jamaah-flight-info');
        const elRoom = document.getElementById('jamaah-room-type');
        const elDeparture = document.getElementById('jamaah-departure-date');
        const elSnapshotPrice = document.getElementById('jamaah-snapshot-price');

        if (elName) elName.textContent = pilgrim.full_name;
        if (elRegId) elRegId.textContent = pilgrim.registration_id;
        if (elPackage) elPackage.textContent = `${pilgrim.package_name} (${pilgrim.duration_days} Hari)`;
        if (elFlight) elFlight.textContent = pilgrim.flight_info;
        if (elRoom) elRoom.textContent = pilgrim.room_type;
        if (elDeparture) elDeparture.textContent = pilgrim.departure_date;
        if (elSnapshotPrice) elSnapshotPrice.textContent = formatRupiah(pilgrim.final_price_snapshot);
    }

    function renderDocuments() {
        const docs = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.pilgrimDocuments) ? MOCK_DATA.pilgrimDocuments : [];
        const container = document.getElementById('jamaah-documents-list');
        if (!container) return;

        container.innerHTML = docs.map(doc => {
            let statusBadge = '';
            if (doc.status === 'VERIFIED') {
                statusBadge = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300 flex items-center gap-1"><i class="fa-solid fa-check"></i> Terverifikasi</span>`;
            } else if (doc.status === 'UNDER_REVIEW') {
                statusBadge = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300 flex items-center gap-1"><i class="fa-solid fa-clock"></i> Verifikasi Staf</span>`;
            } else if (doc.status === 'REVISION_REQUIRED') {
                statusBadge = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-800 border border-rose-300 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Perlu Revisi</span>`;
            } else {
                statusBadge = `<span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">Belum Unggah</span>`;
            }

            return `
                <div class="p-4 rounded-2xl bg-white border border-sdw-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-sdw-sand text-sdw-pine flex items-center justify-center text-lg shrink-0 mt-0.5">
                            <i class="fa-regular fa-file-lines"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-sm text-sdw-pine">${doc.title}</h4>
                                ${doc.is_mandatory ? '<span class="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Wajib</span>' : ''}
                            </div>
                            <p class="text-xs text-sdw-muted mt-0.5">${doc.file_name ? `File: ${doc.file_name}` : 'Belum ada dokumen yang diunggah.'}</p>
                            ${doc.review_notes ? `<p class="text-xs text-amber-800 mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">${doc.review_notes}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-3 self-end sm:self-center">
                        ${statusBadge}
                        <button type="button" onclick="alert('Simulasi upload dokumen: ${doc.code}')" class="px-3 py-1.5 rounded-xl border border-sdw-border hover:bg-sdw-sand text-xs font-bold text-sdw-pine transition cursor-pointer">
                            ${doc.file_name ? 'Ganti File' : 'Unggah File'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderFinance() {
        const inv = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.invoice) ? MOCK_DATA.invoice : null;
        if (!inv) return;

        const elTotal = document.getElementById('jamaah-inv-total');
        const elPaid = document.getElementById('jamaah-inv-paid');
        const elRemaining = document.getElementById('jamaah-inv-remaining');
        const schedulesContainer = document.getElementById('jamaah-schedules-list');

        const totalPaid = inv.payments.filter(p => p.status === 'VERIFIED').reduce((acc, p) => acc + p.amount, 0);
        const remaining = Math.max(0, inv.total_amount - totalPaid);

        if (elTotal) elTotal.textContent = formatRupiah(inv.total_amount);
        if (elPaid) elPaid.textContent = formatRupiah(totalPaid);
        if (elRemaining) elRemaining.textContent = formatRupiah(remaining);

        if (schedulesContainer) {
            schedulesContainer.innerHTML = inv.schedules.map(sch => {
                const isPaid = sch.status === 'PAID';
                return `
                    <div class="p-3.5 rounded-xl ${isPaid ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'} border flex items-center justify-between text-xs">
                        <div>
                            <div class="font-bold text-sdw-pine">Termin ${sch.term}: ${sch.title}</div>
                            <div class="text-[11px] text-sdw-muted">Jatuh Tempo: ${sch.due_date}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-extrabold text-sm ${isPaid ? 'text-emerald-800' : 'text-sdw-charcoal'}">${formatRupiah(sch.amount)}</div>
                            <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-900'}">
                                ${isPaid ? 'Lunas' : 'Menunggu Pembayaran'}
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    function renderManasik() {
        const manasik = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.nextManasik) ? MOCK_DATA.nextManasik : null;
        if (!manasik) return;

        const elTitle = document.getElementById('manasik-title');
        const elSchedule = document.getElementById('manasik-schedule');
        const elLocation = document.getElementById('manasik-location');
        const elUstadz = document.getElementById('manasik-ustadz');

        if (elTitle) elTitle.textContent = manasik.session_title;
        if (elSchedule) elSchedule.textContent = manasik.scheduled_at;
        if (elLocation) elLocation.textContent = manasik.location;
        if (elUstadz) elUstadz.textContent = manasik.muthawwif;
    }

    return {
        init: initJamaahView,
        formatRupiah: formatRupiah
    };
});
