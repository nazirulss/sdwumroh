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
        loadPilgrimDocumentsAsync();
        syncLiveRegistrationsAsync();
    }

    async function syncLiveRegistrationsAsync() {
        if (typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            try {
                const res = await SDW_API.get('getRegistrations');
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    try {
                        localStorage.setItem('sdw_admin_registrations', JSON.stringify(res.data));
                    } catch (e) {}
                    // Refresh tampilan sertifikat kloter & daftar nama jamaah live
                    populateCertificateDateFilter();
                    renderPilgrimCertificate();
                }
            } catch (err) {
                console.warn('[SDW_JAMAAH] Gagal mengambil data registrasi live dari Spreadsheet:', err);
            }
        }
    }

    async function loadPilgrimDocumentsAsync() {
        const session = (typeof SDW_AUTH !== 'undefined') ? SDW_AUTH.getPilgrimSession() : null;
        if (!session || !session.regId) return;

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            try {
                const res = await SDW_API.get('getPilgrimDocuments', { regId: session.regId });
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    if (typeof MOCK_DATA !== 'undefined') {
                        MOCK_DATA.pilgrimDocuments = res.data.map(d => ({
                            id: d.id,
                            code: d.code,
                            title: d.title,
                            is_mandatory: d.is_mandatory,
                            file_name: d.fileName || d.file_name,
                            file_ref_mock: d.fileRef || d.file_ref_mock,
                            status: d.status,
                            review_notes: d.reviewNotes || d.review_notes
                        }));
                    }
                    renderDocuments();
                }
            } catch (err) {
                console.warn('[SDW_JAMAAH] Gagal mengambil dokumen live dari Spreadsheet:', err);
            }
        }
    }

    function renderProfile() {
        if (typeof SDW_AUTH !== 'undefined' && typeof SDW_AUTH.syncPilgrimUI === 'function') {
            SDW_AUTH.syncPilgrimUI();
            const session = SDW_AUTH.getPilgrimSession();
            if (session) return;
        }

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
        if (elDeparture) {
            let dep = pilgrim.departure_date || '-';
            if (/^\d{4}-\d{2}-\d{2}$/.test(dep)) {
                const parts = dep.split('-');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                dep = `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
            }
            elDeparture.textContent = dep;
        }
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

        const elTotal = document.getElementById('jamaah-inv-total');
        const elPaid = document.getElementById('jamaah-inv-paid');
        const elRemaining = document.getElementById('jamaah-inv-remaining');
        const schedulesContainer = document.getElementById('jamaah-schedules-list');

        const session = (typeof SDW_AUTH !== 'undefined' && typeof SDW_AUTH.getPilgrimSession === 'function') ? SDW_AUTH.getPilgrimSession() : null;

        if (session && session.status === 'CONFIRMED') {
            const rawPrice = session.finalPrice || (session.totalPrice ? parseInt(String(session.totalPrice).replace(/[^0-9]/g, '')) : 29500000);
            const totalPkgPrice = rawPrice < 100000 ? rawPrice * 100000 : rawPrice;
            const totalPaid = 5000000; // DP Terverifikasi
            const remaining = Math.max(0, totalPkgPrice - totalPaid);

            if (elTotal) elTotal.textContent = formatRupiah(totalPkgPrice);
            if (elPaid) elPaid.textContent = formatRupiah(totalPaid);
            if (elRemaining) elRemaining.textContent = formatRupiah(remaining);
        } else if (inv) {
            const totalPaid = inv.payments.filter(p => p.status === 'VERIFIED').reduce((acc, p) => acc + p.amount, 0);
            const remaining = Math.max(0, inv.total_amount - totalPaid);

            if (elTotal) elTotal.textContent = formatRupiah(inv.total_amount);
            if (elPaid) elPaid.textContent = formatRupiah(totalPaid);
            if (elRemaining) elRemaining.textContent = formatRupiah(remaining);
        }

        if (!inv) return;

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

    const STEP_INFO = {
        1: { name: 'DP Setor (Lunas)', badge: 'Tahap 1: DP Setor (Lunas Sah)', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        2: { name: 'Paspor & Berkas', badge: 'Tahap 2: Paspor & Berkas Dokumen', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
        3: { name: 'Pelunasan Termin', badge: 'Tahap 3: Pelunasan Biaya & Termin', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
        4: { name: 'Bimbingan Manasik', badge: 'Tahap 4: Bimbingan Manasik Akbar', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
        5: { name: 'Keberangkatan & Kloter', badge: 'Tahap 5: Keberangkatan & Kloter Siap', badgeClass: 'bg-teal-100 text-teal-800 border-teal-300' }
    };

    let currentActiveJourneyStep = 2; // Default terbuka di Step 2

    function closeJourneyPanels() {
        const container = document.getElementById('journey-panels-container');
        if (container) container.classList.add('hidden');

        const allPanels = document.querySelectorAll('.journey-panel');
        allPanels.forEach(p => p.classList.add('hidden'));

        const badge = document.getElementById('journey-active-badge');
        if (badge) {
            badge.textContent = 'Klik Menu untuk Buka Rincian';
            badge.className = 'px-2.5 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200';
        }

        const collapseIcon = document.getElementById('journey-collapse-icon');
        if (collapseIcon) {
            collapseIcon.className = 'fa-solid fa-chevron-down text-[10px]';
        }

        // Normalkan style semua tombol
        for (let i = 1; i <= 5; i++) {
            const btn = document.getElementById(`step-btn-${i}`);
            const icon = document.getElementById(`step-icon-${i}`);
            if (!btn || !icon) continue;

            if (i === 1) {
                btn.className = 'journey-step-btn group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer hover:bg-slate-100';
                icon.className = 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs';
            } else {
                btn.className = 'journey-step-btn group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer hover:bg-slate-100';
                icon.className = 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs';
            }
        }

        currentActiveJourneyStep = null;
    }

    function switchJourneyStep(stepNum) {
        const step = parseInt(stepNum, 10) || 2;

        // Toggle behavior: Jika tombol yang aktif diklik lagi, tutup rinciannya
        if (currentActiveJourneyStep === step) {
            closeJourneyPanels();
            return;
        }

        // 1. Tampilkan kontainer rincian inline (NO POPUP)
        const container = document.getElementById('journey-panels-container');
        if (container) container.classList.remove('hidden');

        const allPanels = document.querySelectorAll('.journey-panel');
        allPanels.forEach(p => p.classList.add('hidden'));

        const targetPanel = document.getElementById(`journey-panel-${step}`);
        if (targetPanel) {
            targetPanel.classList.remove('hidden');
        }

        // 2. Update Badge Judul di Header Stepper
        const badge = document.getElementById('journey-active-badge');
        if (badge && STEP_INFO[step]) {
            badge.textContent = STEP_INFO[step].badge;
            badge.className = `px-2.5 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-black border ${STEP_INFO[step].badgeClass}`;
        }

        const collapseIcon = document.getElementById('journey-collapse-icon');
        if (collapseIcon) {
            collapseIcon.className = 'fa-solid fa-chevron-up text-[10px]';
        }

        // 3. Update Visual Style pada Tiap Tombol Stepper (3 Baris Rapi & Proporsional)
        for (let i = 1; i <= 5; i++) {
            const btn = document.getElementById(`step-btn-${i}`);
            const icon = document.getElementById(`step-icon-${i}`);
            if (!btn || !icon) continue;

            if (i === step) {
                btn.className = 'journey-step-btn group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer bg-amber-50 border border-amber-300/80 shadow-xs ring-2 ring-amber-400/40';
                icon.className = 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs ring-2 ring-amber-300/80 animate-pulse';
            } else if (i === 1) {
                btn.className = 'journey-step-btn group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer hover:bg-slate-100';
                icon.className = 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs';
            } else {
                btn.className = 'journey-step-btn group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer hover:bg-slate-100';
                icon.className = 'w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs';
            }
        }

        currentActiveJourneyStep = step;
    }

    function toggleJourneyCollapse() {
        if (currentActiveJourneyStep !== null) {
            closeJourneyPanels();
        } else {
            switchJourneyStep(2);
        }
    }

    // Auto-close ketika jamaah mengklik di luar kotak menu tahapan
    if (typeof document !== 'undefined') {
        document.addEventListener('click', function (e) {
            if (currentActiveJourneyStep === null) return;
            const card = document.getElementById('journeyStepperCard');
            if (!card) return;

            // Jika klik terjadi di luar elemen kartu tahapan
            if (!card.contains(e.target)) {
                closeJourneyPanels();
            }
        });
    }

    // ==================== E-SERTIFIKAT UMROH CONTROLLERS ====================
    let activeCertDateFilter = '';
    let activePilgrimInFilter = null;

    // Helper standardisasi tanggal keberangkatan
    function normalizeDepartureDate(dateStr) {
        if (!dateStr) return '15 Januari 2027';
        let str = String(dateStr).trim();
        str = str.replace(/^Keberangkatan:\s*/i, '').replace(/\s*•.*$/, '').trim();

        const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return `${parseInt(isoMatch[3], 10)} ${months[parseInt(isoMatch[2], 10) - 1]} ${isoMatch[1]}`;
        }

        str = str.replace(/\bJan\b/i, 'Januari')
                 .replace(/\bFeb\b/i, 'Februari')
                 .replace(/\bMar\b/i, 'Maret')
                 .replace(/\bApr\b/i, 'April')
                 .replace(/\bMei\b/i, 'Mei')
                 .replace(/\bJun\b/i, 'Juni')
                 .replace(/\bJul\b/i, 'Juli')
                 .replace(/\bAgu\b|\bAgt\b/i, 'Agustus')
                 .replace(/\bSep\b/i, 'September')
                 .replace(/\bOkt\b/i, 'Oktober')
                 .replace(/\bNov\b/i, 'November')
                 .replace(/\bDes\b/i, 'Desember');
        return str;
    }

    // Helper: Ekstraksi Google Drive File ID dari berbagai macam format URL
    function extractDriveFileId(url) {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();
        const m1 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (m1 && m1[1] && m1[1] !== 'file') return m1[1];
        const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (m2 && m2[1]) return m2[1];
        return null;
    }

    function normalizePhotoUrl(url) {
        if (!url || typeof url !== 'string') return null;
        const trimmed = url.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
        if (trimmed.startsWith('data:image/') || trimmed.startsWith('blob:')) return trimmed;

        const fileId = extractDriveFileId(trimmed);
        if (fileId) {
            return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
        }
        return trimmed;
    }

    // Helper cek apakah pasfoto jamaah sudah tersedia/ter-upload
    function pilgrimHasPhoto(p) {
        if (!p) return false;
        const url = p.photoUrl || p.photo;
        if (!url || typeof url !== 'string') return false;
        const trimmed = url.trim();
        if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;
        if (trimmed.includes('placeholder') || trimmed.includes('default-avatar')) return false;
        return true;
    }

    // Ambil daftar seluruh sertifikat & jamaah
    function getAllPilgrimCertificates() {
        const list = [];
        let certStore = {};
        try {
            certStore = JSON.parse(localStorage.getItem('sdw_admin_certificates') || '{}');
        } catch (e) {}

        let regs = [];
        try {
            regs = JSON.parse(localStorage.getItem('sdw_admin_registrations') || 'null');
        } catch (e) {}
        if (!Array.isArray(regs) || regs.length === 0) {
            if (typeof SDW_DATA_MOCK !== 'undefined' && Array.isArray(SDW_DATA_MOCK.registrations)) {
                regs = SDW_DATA_MOCK.registrations;
            } else {
                regs = [
                    { id: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', departure: '15 Jan 2027' },
                    { id: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', departure: '15 Jan 2027' },
                    { id: 'REG-SDW-2703', customer: 'Bpk. Gunawan Wibisono', departure: '28 Feb 2027' }
                ];
            }
        }

        regs.forEach(r => {
            const cert = certStore[r.id] || {};
            const cleanDep = normalizeDepartureDate(cert.departureDate || r.departure || r.departure_date || '27 Oktober 2026');
            
            // Validasi Status Terbit: hanya tampilkan jika Admin sudah menerbitkan (isIssued true) atau status COMPLETED di DB
            const isIssued = (cert.isIssued !== undefined) ? !!cert.isIssued : (!!r.isIssued || r.status === 'COMPLETED');
            
            if (isIssued) {
                list.push({
                    regId: r.id,
                    name: cert.displayName || r.customer || r.name || r.full_name || 'Jamaah Umroh',
                    departureDate: cleanDep,
                    certNo: cert.certificateNo || r.certificateNo || `SDW/CERT/2026/${String(r.id).replace(/\D/g, '').padStart(3, '0')}`,
                    photoUrl: normalizePhotoUrl(cert.photoUrl || r.photoUrl || r.photo || null),
                    isIssued: true
                });
            }
        });

        Object.keys(certStore).forEach(k => {
            if (!list.some(p => p.regId === k)) {
                const c = certStore[k];
                if (c && c.displayName && c.isIssued) {
                    list.push({
                        regId: k,
                        name: c.displayName,
                        departureDate: normalizeDepartureDate(c.departureDate),
                        certNo: c.certificateNo || 'SDW/CERT/2026/2601',
                        photoUrl: c.photoUrl || null,
                        isIssued: true
                    });
                }
            }
        });

        return list;
    }

    // Isi Opsi Filter Tanggal Keberangkatan
    function populateCertificateDateFilter() {
        const filterEl = document.getElementById('certFilterDepartureDate');
        if (!filterEl) return;

        const all = getAllPilgrimCertificates();
        const dates = Array.from(new Set(all.map(p => p.departureDate).filter(Boolean)));

        if (dates.length === 0) {
            dates.push('15 Januari 2027');
        }

        // Cek parameter URL (?date=...)
        let urlDate = null;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const qDate = urlParams.get('date');
            if (qDate) {
                const foundMatch = dates.find(d => d.toLowerCase() === qDate.toLowerCase().trim());
                urlDate = foundMatch || qDate;
                if (!dates.includes(urlDate)) {
                    dates.push(urlDate);
                }
            }
        } catch (e) {}

        // Simpan nilai pilihan sebelumnya jika ada
        const prevValue = filterEl.value;
        filterEl.innerHTML = dates.map(d => `<option value="${d}">${d}</option>`).join('');

        if (urlDate) {
            filterEl.value = urlDate;
            activeCertDateFilter = urlDate;
        } else if (prevValue && dates.includes(prevValue)) {
            filterEl.value = prevValue;
            activeCertDateFilter = prevValue;
        } else if (!activeCertDateFilter || !dates.includes(activeCertDateFilter)) {
            const session = (typeof SDW_AUTH !== 'undefined') ? SDW_AUTH.getPilgrimSession() : null;
            const sessionDate = session ? normalizeDepartureDate(session.departureDate) : '';
            if (sessionDate && dates.includes(sessionDate)) {
                activeCertDateFilter = sessionDate;
            } else {
                activeCertDateFilter = dates[0];
            }
            filterEl.value = activeCertDateFilter;
        } else {
            filterEl.value = activeCertDateFilter;
        }
    }

    // Handler saat Admin / Jamaah mengubah dropdown Filter Keberangkatan
    function onCertificateDateFilterChange(val) {
        activeCertDateFilter = val;
        activePilgrimInFilter = null;
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('date', val);
            window.history.replaceState(window.history.state, '', url.toString());
        } catch (e) {}
        renderPilgrimCertificate();
    }

    // Pilih Jamaah spesifik di dalam kloter
    function selectPilgrimInKloter(regId) {
        const all = getAllPilgrimCertificates();
        const found = all.find(p => p.regId === regId);
        if (found) {
            activePilgrimInFilter = found;
            renderCertificateDisplay(found);

            // Perbarui styling tombol aktif pada switcher
            const switcherEl = document.getElementById('certPilgrimSwitcher');
            if (switcherEl) {
                const buttons = switcherEl.querySelectorAll('button');
                buttons.forEach(btn => {
                    const bRegId = btn.getAttribute('data-reg-id');
                    const bHasPhoto = btn.getAttribute('data-has-photo') === '1';
                    const isActive = bRegId === regId;

                    if (isActive) {
                        btn.className = bHasPhoto
                            ? 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-sdw-pine text-white border border-transparent'
                            : 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-sdw-pine text-red-300 border-2 border-red-500';
                    } else {
                        btn.className = bHasPhoto
                            ? 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                            : 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs bg-red-50/90 text-red-600 hover:bg-red-100 border border-red-200/80';
                    }

                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.className = `fa-solid fa-user text-[10px] mr-1 ${bHasPhoto ? (isActive ? 'text-white' : 'text-slate-500') : (isActive ? 'text-red-400' : 'text-red-500')}`;
                    }
                    const span = btn.querySelector('span');
                    if (span) {
                        span.className = bHasPhoto
                            ? (isActive ? 'text-white' : 'text-slate-700')
                            : (isActive ? 'text-red-300 font-extrabold' : 'text-red-600 font-bold');
                    }
                });
            }
        }
    }

    // Render E-Sertifikat Utama
    function renderPilgrimCertificate() {
        populateCertificateDateFilter();

        const all = getAllPilgrimCertificates();
        const filterEl = document.getElementById('certFilterDepartureDate');
        const currentFilteredDate = (filterEl && filterEl.value) || activeCertDateFilter || '15 Januari 2027';
        const kloterPilgrims = all.filter(p => p.departureDate === currentFilteredDate);

        let pilgrimToShow = activePilgrimInFilter;
        if (!pilgrimToShow || pilgrimToShow.departureDate !== currentFilteredDate) {
            pilgrimToShow = kloterPilgrims[0] || all[0] || {
                name: 'AHMAD JAMAAH TELADAN',
                departureDate: currentFilteredDate,
                certNo: 'SDW/CERT/2027/2701',
                photoUrl: null
            };
            activePilgrimInFilter = pilgrimToShow;
        }

        renderCertificateDisplay(pilgrimToShow);

        // Switcher jamaah dalam kloter
        const switcherEl = document.getElementById('certPilgrimSwitcher');
        if (switcherEl) {
            if (kloterPilgrims.length > 1) {
                switcherEl.innerHTML = kloterPilgrims.map(p => {
                    const isActive = p.regId === pilgrimToShow.regId;
                    const shortName = (p.name || 'Jamaah').split(' ').slice(0, 2).join(' ');
                    const hasPhoto = pilgrimHasPhoto(p);

                    const btnClass = isActive
                        ? (hasPhoto
                            ? 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-sdw-pine text-white border border-transparent'
                            : 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs bg-sdw-pine text-red-300 border-2 border-red-500')
                        : (hasPhoto
                            ? 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/50'
                            : 'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs bg-red-50/90 text-red-600 hover:bg-red-100 border border-red-200/80');

                    const iconClass = `fa-solid fa-user text-[10px] mr-1 ${hasPhoto ? (isActive ? 'text-white' : 'text-slate-500') : (isActive ? 'text-red-400' : 'text-red-500')}`;
                    const textClass = hasPhoto
                        ? (isActive ? 'text-white' : 'text-slate-700')
                        : (isActive ? 'text-red-300 font-extrabold' : 'text-red-600 font-bold');

                    const titleHint = hasPhoto ? `${p.name} (Foto Lengkap)` : `${p.name} (Belum Upload Foto)`;

                    return `
                        <button type="button" data-reg-id="${p.regId}" data-has-photo="${hasPhoto ? '1' : '0'}" title="${titleHint}" onclick="window.selectPilgrimInKloter('${p.regId}')" class="${btnClass}">
                            <i class="${iconClass}"></i>
                            <span class="${textClass}">${shortName}</span>
                        </button>
                    `;
                }).join('');
                switcherEl.classList.remove('hidden');
            } else {
                switcherEl.classList.add('hidden');
            }
        }
    }

    // Render Tampilan Canvas / Dynamic Overlay Sertifikat
    function renderCertificateDisplay(p) {
        const certNameEl = document.getElementById('cert-pilgrim-name');
        const certDateEl = document.getElementById('cert-pilgrim-date');
        const certNoEl = document.getElementById('cert-pilgrim-no');
        const photoImg = document.getElementById('cert-pilgrim-photo-img');
        const photoPlaceholder = document.getElementById('cert-pilgrim-photo-placeholder');

        if (!certNameEl) return;

        const nameText = (p.name || 'AHMAD JAMAAH TELADAN').toUpperCase();
        certNameEl.textContent = nameText;

        // Auto-fit or custom font size agar nama panjang tidak terpotong (truncate)
        const customSize = p.nameFontSize || p.fontSize;
        if (customSize && customSize !== 'auto') {
            const val = parseFloat(customSize);
            if (!isNaN(val)) {
                certNameEl.style.fontSize = `clamp(${Math.round(val * 3.5)}px, ${val}cqi, ${Math.round(val * 7.5)}px)`;
            }
        } else {
            const len = nameText.length;
            if (len <= 14) {
                certNameEl.style.fontSize = 'clamp(14px, 4.8cqi, 32px)';
            } else if (len <= 20) {
                certNameEl.style.fontSize = 'clamp(12px, 4.0cqi, 28px)';
            } else if (len <= 26) {
                certNameEl.style.fontSize = 'clamp(11px, 3.4cqi, 24px)';
            } else {
                certNameEl.style.fontSize = 'clamp(10px, 2.9cqi, 20px)';
            }
        }
        certNameEl.classList.remove('truncate');
        certNameEl.style.whiteSpace = 'nowrap';

        if (certDateEl) {
            const cleanD = p.departureDate.startsWith('Keberangkatan') ? p.departureDate : `Keberangkatan: ${p.departureDate}`;
            certDateEl.textContent = cleanD;
        }

        if (certNoEl) {
            const cleanNo = p.certNo || 'SDW/CERT/2027/2701';
            certNoEl.textContent = cleanNo.startsWith('No') ? cleanNo : `No: ${cleanNo}`;
        }

        const resolvedPhoto = normalizePhotoUrl(p.photoUrl);
        if (resolvedPhoto) {
            if (photoImg) {
                photoImg.src = resolvedPhoto;
                photoImg.classList.remove('hidden');
            }
            if (photoPlaceholder) photoPlaceholder.classList.add('hidden');
        } else {
            if (photoImg) photoImg.classList.add('hidden');
            if (photoPlaceholder) photoPlaceholder.classList.remove('hidden');
        }
    }

    // Bagikan E-Sertifikat ke WhatsApp Berdasarkan Tanggal Keberangkatan Kloter
    function shareKloterCertificateWA() {
        const filterEl = document.getElementById('certFilterDepartureDate');
        const selectedDate = filterEl ? filterEl.value : (activeCertDateFilter || '15 Januari 2027');

        const all = getAllPilgrimCertificates();
        const kloterPilgrims = all.filter(p => p.departureDate === selectedDate);

        let pilgrimListText = '';
        if (kloterPilgrims.length > 0) {
            pilgrimListText = kloterPilgrims.map((p, idx) => `${idx + 1}. *${p.name}* (${p.certNo})`).join('\n');
        } else {
            pilgrimListText = `1. *Ahmad Jamaah Teladan* (SDW/CERT/2027/2701)`;
        }

        const shareUrl = `${window.location.origin}/app?view=sertifikat&tab=umroh&date=${encodeURIComponent(selectedDate)}`;

        let text = `*E-SERTIFIKAT UMROH RESMI PT SDW TOUR & TRAVEL*\n`;
        text += `Kloter Keberangkatan: *${selectedDate}*\n\n`;
        text += `Alhamdulillah, E-Sertifikat Umroh Resmi bagi seluruh jamaah kloter keberangkatan *${selectedDate}* telah resmi diterbitkan oleh PT SDW Mandiri Utama (SDW Tour & Travel).\n\n`;
        text += `*Daftar Jamaah Kloter:*\n${pilgrimListText}\n\n`;
        text += `Semoga seluruh jamaah meraih predikat umroh yang mabrur dan penuh keberkahan bersama keluarga tercinta. Aamiin ya Rabbal 'Alamin.\n\n`;
        text += `Buka & Cek E-Sertifikat: ${shareUrl}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }

    // ==================== TAB SWITCHER E-SERTIFIKAT (UMROH VS BADAL) ====================
    let activeCertificateTab = 'umroh';

    function switchCertificateTab(tab = 'umroh') {
        activeCertificateTab = tab === 'badal' ? 'badal' : 'umroh';

        const umrohBtn = document.getElementById('certTabUmrohBtn');
        const badalBtn = document.getElementById('certTabBadalBtn');
        const umrohContent = document.getElementById('certTabContentUmroh');
        const badalContent = document.getElementById('certTabContentBadal');

        if (activeCertificateTab === 'umroh') {
            if (umrohBtn) {
                umrohBtn.className = 'py-2.5 px-3 rounded-xl bg-sdw-pine text-white transition text-center cursor-pointer shadow-xs font-black';
            }
            if (badalBtn) {
                badalBtn.className = 'py-2.5 px-3 rounded-xl text-slate-600 hover:text-slate-900 transition text-center cursor-pointer font-bold';
            }
            if (umrohContent) umrohContent.classList.remove('hidden');
            if (badalContent) badalContent.classList.add('hidden');
            renderPilgrimCertificate();
        } else {
            if (badalBtn) {
                badalBtn.className = 'py-2.5 px-3 rounded-xl bg-purple-900 text-white transition text-center cursor-pointer shadow-xs font-black';
            }
            if (umrohBtn) {
                umrohBtn.className = 'py-2.5 px-3 rounded-xl text-slate-600 hover:text-slate-900 transition text-center cursor-pointer font-bold';
            }
            if (badalContent) badalContent.classList.remove('hidden');
            if (umrohContent) umrohContent.classList.add('hidden');
            renderBadalCertificate();
        }

        try {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', activeCertificateTab);
            window.history.replaceState(window.history.state, '', url.toString());
        } catch (e) {}
    }

    // ==================== SERTIFIKAT BADAL UMROH CONTROLLERS ====================
    const BADAL_CERTIFICATES = [
        {
            id: 'BDL-001',
            almarhumName: 'Alm. H. Abdullah bin Umar',
            beneficiaryTitle: 'Almarhum',
            dibadalkanOleh: 'Keluarga Besar Bpk. Sanali Bajuri',
            muthawwif: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            muthawwifRole: 'Muthawwif Mukim Makkah',
            certNo: 'SDW/BDL/2026/001',
            executionDate: '27 Oktober 2026',
            location: 'Makkah Al-Mukarramah'
        },
        {
            id: 'BDL-002',
            almarhumName: 'Almh. Hj. Maryam binti Sulaiman',
            beneficiaryTitle: 'Almarhumah',
            dibadalkanOleh: 'Ibu Siti Nuriyah & Keluarga',
            muthawwif: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            muthawwifRole: 'Muthawwif Mukim Makkah',
            certNo: 'SDW/BDL/2026/002',
            executionDate: '27 Oktober 2026',
            location: 'Makkah Al-Mukarramah'
        },
        {
            id: 'BDL-003',
            almarhumName: 'Alm. K.H. Dahlan bin Syafei',
            beneficiaryTitle: 'Almarhum',
            dibadalkanOleh: 'Keluarga Bpk. Khasan Munadi',
            muthawwif: 'Ustadz Muhammad Syakir, Lc., M.Ag.',
            muthawwifRole: 'Muthawwif Senior Makkah',
            certNo: 'SDW/BDL/2026/003',
            executionDate: '27 Oktober 2026',
            location: 'Makkah Al-Mukarramah'
        },
        {
            id: 'BDL-004',
            almarhumName: 'Almh. Nyai Hj. Fatimah binti Asy\'ari',
            beneficiaryTitle: 'Almarhumah',
            dibadalkanOleh: 'Keluarga Besar Bpk. Sugiono',
            muthawwif: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            muthawwifRole: 'Muthawwif Mukim Makkah',
            certNo: 'SDW/BDL/2027/004',
            executionDate: '15 Januari 2027',
            location: 'Makkah Al-Mukarramah'
        },
        {
            id: 'BDL-005',
            almarhumName: 'Alm. H. Mansur bin Hasyim',
            beneficiaryTitle: 'Almarhum',
            dibadalkanOleh: 'Keluarga Ibu Sri Nuryati',
            muthawwif: 'Ustadz Muhammad Syakir, Lc., M.Ag.',
            muthawwifRole: 'Muthawwif Senior Makkah',
            certNo: 'SDW/BDL/2027/005',
            executionDate: '28 Februari 2027',
            location: 'Makkah Al-Mukarramah'
        }
    ];

    let activeBadalDateFilter = '27 Oktober 2026';
    let activeBadalPilgrim = null;

    function renderBadalCertificate() {
        const filterEl = document.getElementById('badalFilterDate');
        const selectedDate = (filterEl && filterEl.value) || activeBadalDateFilter || '27 Oktober 2026';
        activeBadalDateFilter = selectedDate;

        const badalList = BADAL_CERTIFICATES.filter(b => b.executionDate === selectedDate);
        if (!activeBadalPilgrim || activeBadalPilgrim.executionDate !== selectedDate) {
            activeBadalPilgrim = badalList[0] || BADAL_CERTIFICATES[0];
        }

        const b = activeBadalPilgrim;
        const noEl = document.getElementById('badal-cert-no');
        const nameEl = document.getElementById('badal-pilgrim-name');
        const execEl = document.getElementById('badal-executor-info');
        const miqatEl = document.getElementById('badal-cert-miqat');
        const dateEl = document.getElementById('badal-cert-date');
        const titimangsaEl = document.getElementById('badal-cert-titimangsa');

        const certNo = b.nomorSertifikat || b.certNo || 'SDW/BDL/2026/001';
        const nama = (b.namaYangDibadalkan || b.almarhumName || '').toUpperCase();
        const petugas = b.namaPetugasBadal || b.muthawwif || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const miqat = b.tempatMiqat || "Masjid Aisyah Tan'im";
        const tgl = b.tanggalPelaksanaan || b.executionDate || '27 Oktober 2026';
        const tempatPenerbitan = b.tempatPenerbitan || b.location || 'Makkah';
        const tglPenerbitan = b.tanggalPenerbitan || tgl;

        if (noEl) noEl.textContent = certNo.startsWith('No') ? certNo : `No: ${certNo}`;
        if (nameEl) nameEl.textContent = nama;
        if (execEl) execEl.textContent = petugas;
        if (miqatEl) miqatEl.textContent = miqat;
        if (dateEl) dateEl.textContent = tgl;
        if (titimangsaEl) titimangsaEl.textContent = `${tempatPenerbitan}, ${tglPenerbitan}`;

        const switcherEl = document.getElementById('badalPilgrimSwitcher');
        if (switcherEl) {
            if (badalList.length > 1) {
                switcherEl.innerHTML = badalList.map(item => {
                    const isActive = item.id === b.id;
                    return `
                        <button type="button" onclick="window.selectBadalPilgrim('${item.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${isActive ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                            <i class="fa-solid fa-kaaba text-[10px] mr-1 text-amber-400"></i>
                            <span>${item.almarhumName}</span>
                        </button>
                    `;
                }).join('');
                switcherEl.classList.remove('hidden');
            } else {
                switcherEl.classList.add('hidden');
            }
        }
    }

    function onBadalDateFilterChange(val) {
        activeBadalDateFilter = val;
        activeBadalPilgrim = null;
        renderBadalCertificate();
    }

    function selectBadalPilgrim(id) {
        const found = BADAL_CERTIFICATES.find(b => b.id === id);
        if (found) {
            activeBadalPilgrim = found;
            renderBadalCertificate();
        }
    }

    function shareBadalCertificateWA() {
        const b = activeBadalPilgrim || BADAL_CERTIFICATES[0];
        const shareUrl = `${window.location.origin}/app?view=sertifikat&tab=badal&date=${encodeURIComponent(b.executionDate)}`;

        let text = `*PIAGAM RESMI BADAL UMROH PT SDW MANDIRI UTAMA*\n`;
        text += `Almarhum/ah: *${b.almarhumName}*\n`;
        text += `Nomor Sertifikat: *${b.certNo}*\n`;
        text += `Pelaksana Amanah: *${b.muthawwif}* (${b.muthawwifRole})\n`;
        text += `Tanggal Pelaksanaan: *${b.executionDate}* di ${b.location}\n`;
        text += `Atas Amanah Dari: *${b.dibadalkanOleh}*\n\n`;
        text += `Alhamdulillah, rangkaian rukun Badal Umroh telah ditunaikan secara khusyuk dan syar'i. Semoga amal ibadah ini diterima oleh Allah SWT dan pahalanya mengalir sempurna kepada almarhum/almarhumah. Aamiin ya Rabbal 'Alamin.\n\n`;
        text += `Lihat Piagam Digital: ${shareUrl}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }

    // ==================== GALERI FOTO DOKUMENTASI KLOTER ====================
    const GALERI_PHOTOS = [
        {
            id: 'GLR-01',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Masjidil Haram, Makkah',
            caption: 'Thawaf Wada Jamaah Kloter 27 Oktober 2026 mengelilingi Ka\'bah Baitullah.',
            imgUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
            dateStr: '28 Oktober 2026'
        },
        {
            id: 'GLR-02',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Bukit Shafa & Marwah',
            caption: 'Ibadah Sa\'i jamaah bersama Muthawwif pembimbing PT SDW.',
            imgUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
            dateStr: '28 Oktober 2026'
        },
        {
            id: 'GLR-03',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Masjid Nabawi, Madinah',
            caption: 'Ziarah Raudhah Syarifah dan Makam Rasulullah SAW.',
            imgUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
            dateStr: '01 November 2026'
        },
        {
            id: 'GLR-04',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Jabal Uhud, Madinah',
            caption: 'Napak tilas perjuangan syuhada perang Uhud dan doa bersama.',
            imgUrl: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=800&q=80',
            dateStr: '02 November 2026'
        },
        {
            id: 'GLR-05',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Miqat Masjid Bir Ali',
            caption: 'Pengambilan Miqat ihram dan pemantapan niat manasik.',
            imgUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80',
            dateStr: '27 Oktober 2026'
        },
        {
            id: 'GLR-06',
            kloterDate: '2026-10-27',
            kloterTitle: '27 Oktober 2026',
            location: 'Jabal Rahmah, Padang Arafah',
            caption: 'Momen kebersamaan keluarga jamaah di puncak Jabal Rahmah.',
            imgUrl: 'https://images.unsplash.com/photo-1565019091460-a889814c81ef?auto=format&fit=crop&w=800&q=80',
            dateStr: '29 Oktober 2026'
        },
        {
            id: 'GLR-07',
            kloterDate: '2027-01-15',
            kloterTitle: '15 Januari 2027',
            location: 'Pelataran Ka\'bah Baitullah',
            caption: 'Khidmat doa bersama di depan Multazam dan Hijir Ismail.',
            imgUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
            dateStr: '16 Januari 2027'
        },
        {
            id: 'GLR-08',
            kloterDate: '2027-02-28',
            kloterTitle: '28 Februari 2027',
            location: 'Masjid Quba, Madinah',
            caption: 'Sholat sunnah dua rakaat di Masjid Quba berpahala seperti umroh.',
            imgUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80',
            dateStr: '01 Maret 2027'
        }
    ];

    let activeGaleriKloterFilter = '2026-10-27';

    function renderGaleriKloter(selectedKloter) {
        const selectEl = document.getElementById('galeriFilterKloterSelect');
        if (selectedKloter) {
            activeGaleriKloterFilter = selectedKloter;
            if (selectEl) selectEl.value = selectedKloter;
        } else if (selectEl && selectEl.value) {
            activeGaleriKloterFilter = selectEl.value;
        }

        const filtered = activeGaleriKloterFilter === 'ALL'
            ? GALERI_PHOTOS
            : GALERI_PHOTOS.filter(item => item.kloterDate === activeGaleriKloterFilter);

        const badgeEl = document.getElementById('galeriTotalFotoText');
        if (badgeEl) {
            badgeEl.textContent = `${filtered.length} Foto Dokumentasi`;
        }

        const container = document.getElementById('galeriFotoGridContainer');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    <i class="fa-solid fa-camera-retro text-3xl mb-2 text-slate-300"></i>
                    <p class="text-xs font-bold text-slate-600">Belum ada foto untuk kloter ini.</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">Dokumentasi sedang dikurasi oleh tim multimedia SDW.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group flex flex-col transition hover:shadow-md">
                <div class="relative w-full aspect-[4/3] overflow-hidden bg-slate-900">
                    <img src="${item.imgUrl}" alt="${item.location}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        <i class="fa-solid fa-location-dot text-amber-400 mr-1"></i> ${item.location}
                    </span>
                    <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-400/90 text-slate-950 text-[9.5px] font-extrabold">
                        ${item.dateStr}
                    </span>
                </div>
                <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <p class="text-xs text-slate-700 leading-snug line-clamp-2">${item.caption}</p>
                    <div class="pt-1 flex items-center justify-between border-t border-slate-100">
                        <span class="text-[10px] font-bold text-purple-900">${item.kloterTitle}</span>
                        <a href="${item.imgUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-sdw-pine hover:text-emerald-700 flex items-center gap-1 active:scale-95 transition">
                            <span>Perbesar</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function onGaleriKloterFilterChange(val) {
        activeGaleriKloterFilter = val;
        renderGaleriKloter(val);
    }

    // ==================== PUSAT IBADAH & MANASIK SPA CONTROLLERS ====================
    let activeIbadahTab = 'kiblat';

    function switchIbadahTab(tab = 'kiblat') {
        activeIbadahTab = tab;
        const tabs = ['kiblat', 'sholat', 'manasik', 'doa'];

        tabs.forEach(t => {
            const btn = document.getElementById(`ibadahTab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
            const content = document.getElementById(`ibadahTabContent${t.charAt(0).toUpperCase() + t.slice(1)}`);

            if (t === tab) {
                if (btn) {
                    btn.className = 'ibadah-tab-btn py-2 px-1 rounded-xl bg-sdw-pine text-white transition text-center cursor-pointer shadow-xs font-black';
                }
                if (content) content.classList.remove('hidden');
            } else {
                if (btn) {
                    btn.className = 'ibadah-tab-btn py-2 px-1 rounded-xl text-slate-600 hover:text-slate-900 transition text-center cursor-pointer font-bold';
                }
                if (content) content.classList.add('hidden');
            }
        });

        try {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState(window.history.state, '', url.toString());
        } catch (e) {}
    }

    const SHOLAT_CITY_TIMES = {
        MAKKAH: {
            subuh: '05:02 AST',
            syuruq: '06:21 AST',
            dzuhur: '12:12 AST',
            ashar: '15:28 AST',
            maghrib: '17:49 AST',
            isya: '19:19 AST'
        },
        MADINAH: {
            subuh: '05:05 AST',
            syuruq: '06:24 AST',
            dzuhur: '12:13 AST',
            ashar: '15:27 AST',
            maghrib: '17:47 AST',
            isya: '19:17 AST'
        },
        INDONESIA: {
            subuh: '04:15 WIB',
            syuruq: '05:32 WIB',
            dzuhur: '11:42 WIB',
            ashar: '14:55 WIB',
            maghrib: '17:51 WIB',
            isya: '19:03 WIB'
        }
    };

    function switchSholatCity(city = 'MAKKAH', clickedBtn) {
        const cityKey = String(city).toUpperCase();
        const times = SHOLAT_CITY_TIMES[cityKey] || SHOLAT_CITY_TIMES.MAKKAH;

        const subuhEl = document.getElementById('sholatTimeSubuh');
        const syuruqEl = document.getElementById('sholatTimeSyuruq');
        const dzuhurEl = document.getElementById('sholatTimeDzuhur');
        const asharEl = document.getElementById('sholatTimeAshar');
        const maghribEl = document.getElementById('sholatTimeMaghrib');
        const isyaEl = document.getElementById('sholatTimeIsya');

        if (subuhEl) subuhEl.textContent = times.subuh;
        if (syuruqEl) syuruqEl.textContent = times.syuruq;
        if (dzuhurEl) dzuhurEl.textContent = times.dzuhur;
        if (asharEl) asharEl.textContent = times.ashar;
        if (maghribEl) maghribEl.textContent = times.maghrib;
        if (isyaEl) isyaEl.textContent = times.isya;

        const allCityBtns = document.querySelectorAll('.inapp-sholat-city-btn');
        allCityBtns.forEach(btn => {
            btn.className = 'inapp-sholat-city-btn py-2 px-2 rounded-xl text-slate-600 hover:text-slate-900 transition text-center cursor-pointer';
        });
        if (clickedBtn) {
            clickedBtn.className = 'inapp-sholat-city-btn py-2 px-2 rounded-xl bg-sdw-pine text-white transition text-center cursor-pointer shadow-xs font-black';
        }
    }

    function downloadCertificateImage() {}
    function downloadCertificatePDF() {}

    function shareCertificateWA() {
        const certName = document.getElementById('cert-pilgrim-name')?.textContent || 'Jamaah';
        const text = encodeURIComponent(`Alhamdulillah, telah terbit E-Sertifikat Umroh Resmi atas nama *${certName}* dari PT SDW Mandiri Utama (SDW Tour & Travel). Semoga menjadi umroh yang mabrur dan penuh keberkahan.`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }

    if (typeof window !== 'undefined') {
        window.switchJourneyStep = switchJourneyStep;
        window.closeJourneyPanels = closeJourneyPanels;
        window.toggleJourneyCollapse = toggleJourneyCollapse;
        window.renderPilgrimCertificate = renderPilgrimCertificate;
        window.onCertificateDateFilterChange = onCertificateDateFilterChange;
        window.selectPilgrimInKloter = selectPilgrimInKloter;
        window.shareKloterCertificateWA = shareKloterCertificateWA;
        window.shareCertificateWA = shareKloterCertificateWA;
        window.downloadCertificateImage = downloadCertificateImage;
        window.downloadCertificatePDF = downloadCertificatePDF;
        window.syncLiveRegistrationsAsync = syncLiveRegistrationsAsync;

        // New Tab & Subview Controllers
        window.switchCertificateTab = switchCertificateTab;
        window.renderBadalCertificate = renderBadalCertificate;
        window.onBadalDateFilterChange = onBadalDateFilterChange;
        window.selectBadalPilgrim = selectBadalPilgrim;
        window.shareBadalCertificateWA = shareBadalCertificateWA;
        window.renderGaleriKloter = renderGaleriKloter;
        window.onGaleriKloterFilterChange = onGaleriKloterFilterChange;
        window.switchIbadahTab = switchIbadahTab;
        window.switchSholatCity = switchSholatCity;
    }

    return {
        init: initJamaahView,
        syncLiveRegistrationsAsync: syncLiveRegistrationsAsync,
        loadPilgrimDocumentsAsync: loadPilgrimDocumentsAsync,
        renderDocuments: renderDocuments,
        switchJourneyStep: switchJourneyStep,
        closeJourneyPanels: closeJourneyPanels,
        toggleJourneyCollapse: toggleJourneyCollapse,
        renderPilgrimCertificate: renderPilgrimCertificate,
        onCertificateDateFilterChange: onCertificateDateFilterChange,
        selectPilgrimInKloter: selectPilgrimInKloter,
        shareKloterCertificateWA: shareKloterCertificateWA,
        shareCertificateWA: shareKloterCertificateWA,
        downloadCertificateImage: downloadCertificateImage,
        downloadCertificatePDF: downloadCertificatePDF,
        formatRupiah: formatRupiah,
        switchCertificateTab: switchCertificateTab,
        renderBadalCertificate: renderBadalCertificate,
        onBadalDateFilterChange: onBadalDateFilterChange,
        selectBadalPilgrim: selectBadalPilgrim,
        shareBadalCertificateWA: shareBadalCertificateWA,
        renderGaleriKloter: renderGaleriKloter,
        onGaleriKloterFilterChange: onGaleriKloterFilterChange,
        switchIbadahTab: switchIbadahTab,
        switchSholatCity: switchSholatCity
    };
});
