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
    function renderPilgrimCertificate() {
        const session = (typeof SDW_AUTH !== 'undefined') ? SDW_AUTH.getPilgrimSession() : null;
        const certNameEl = document.getElementById('cert-pilgrim-name');
        const certDateEl = document.getElementById('cert-pilgrim-date');
        const photoImg = document.getElementById('cert-pilgrim-photo-img');
        const photoPlaceholder = document.getElementById('cert-pilgrim-photo-placeholder');

        if (!certNameEl) return;

        // Cek apakah ada sertifikat kustom yang diterbitkan Admin dari localStorage
        let customCert = null;
        try {
            const certStore = JSON.parse(localStorage.getItem('sdw_admin_certificates') || '{}');
            if (session && session.regId && certStore[session.regId]) {
                customCert = certStore[session.regId];
            } else if (session && session.fullName && certStore[session.fullName]) {
                customCert = certStore[session.fullName];
            } else if (certStore['REG-SDW-2701']) {
                customCert = certStore['REG-SDW-2701'];
            }
        } catch (e) {
            console.warn('Gagal membaca sdw_admin_certificates:', e);
        }

        const displayName = (customCert && customCert.displayName) ? customCert.displayName : (session && session.fullName ? session.fullName : 'Ahmad Jamaah Teladan');
        
        let displayDate = 'Keberangkatan: 15 Januari 2027 • Musim 1448 H';
        if (customCert && customCert.departureDate) {
            displayDate = customCert.departureDate.startsWith('Keberangkatan') ? customCert.departureDate : `Keberangkatan: ${customCert.departureDate} • Musim 1448 H`;
        } else if (session && session.departureDate) {
            let dep = session.departureDate;
            if (/^\d{4}-\d{2}-\d{2}$/.test(dep)) {
                const parts = dep.split('-');
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                dep = `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
            }
            displayDate = `Keberangkatan: ${dep} • Musim 1448 H`;
        }

        const photoUrl = (customCert && customCert.photoUrl) ? customCert.photoUrl : (session && (session.photoUrl || session.photo) ? (session.photoUrl || session.photo) : null);

        certNameEl.textContent = displayName;
        if (certDateEl) certDateEl.textContent = displayDate;

        if (photoUrl) {
            if (photoImg) {
                photoImg.src = photoUrl;
                photoImg.classList.remove('hidden');
            }
            if (photoPlaceholder) photoPlaceholder.classList.add('hidden');
        } else {
            if (photoImg) photoImg.classList.add('hidden');
            if (photoPlaceholder) photoPlaceholder.classList.remove('hidden');
        }
    }

    function downloadCertificateImage() {
        const certName = document.getElementById('cert-pilgrim-name')?.textContent || 'Jamaah-SDW';
        const certDate = document.getElementById('cert-pilgrim-date')?.textContent || 'Keberangkatan: 15 Januari 2027 • Musim 1448 H';
        const photoImg = document.getElementById('cert-pilgrim-photo-img');

        const canvas = document.createElement('canvas');
        canvas.width = 1480;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        const template = new Image();
        template.crossOrigin = 'anonymous';
        template.src = 'assets/certificate-template.jpg';
        template.onload = function () {
            // 1. Gambar Master Mockup Template
            ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

            // 2. Gambar Foto Jamaah di dalam Bingkai Emas
            const frameX = canvas.width - (canvas.width * 0.088) - (canvas.width * 0.162);
            const frameY = canvas.height * 0.132;
            const frameW = canvas.width * 0.162;
            const frameH = canvas.height * 0.274;

            if (photoImg && !photoImg.classList.contains('hidden') && photoImg.src) {
                try {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(frameX, frameY, frameW, frameH);
                    ctx.clip();
                    ctx.drawImage(photoImg, frameX, frameY, frameW, frameH);
                    ctx.restore();
                } catch (err) {
                    console.warn('Gagal render foto ke canvas:', err);
                }
            }

            // 3. Cetak Nama Jamaah di atas garis
            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.font = 'bold 36px "Playfair Display", Georgia, serif';
            const nameX = canvas.width * 0.495;
            const nameY = canvas.height * 0.482;
            ctx.fillText(certName.trim().toUpperCase(), nameX, nameY);

            // 4. Cetak Tanggal di bawah garis
            ctx.fillStyle = '#475569';
            ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
            const dateY = canvas.height * 0.555;
            ctx.fillText(certDate.trim(), nameX, dateY);

            // 5. Unduh file
            const link = document.createElement('a');
            link.download = `Sertifikat-Umroh-${certName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        };
        template.onerror = function () {
            alert('Template sertifikat belum termuat sempurna. Silakan refresh halaman.');
        };
    }

    function downloadCertificatePDF() {
        const certName = document.getElementById('cert-pilgrim-name')?.textContent || 'Jamaah SDW';
        const certDate = document.getElementById('cert-pilgrim-date')?.textContent || 'Keberangkatan: 15 Januari 2027 • Musim 1448 H';
        const photoImg = document.getElementById('cert-pilgrim-photo-img');
        const photoSrc = (photoImg && !photoImg.classList.contains('hidden')) ? photoImg.src : '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Mohon izinkan popup browser untuk mengunduh / mencetak PDF.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sertifikat Umroh - ${certName}</title>
                <style>
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; font-family: "Playfair Display", Georgia, serif; }
                    .cert-box { position: relative; width: 297mm; height: 210mm; overflow: hidden; }
                    .cert-bg { width: 100%; height: 100%; object-fit: cover; }
                    .cert-photo { position: absolute; top: 13.2%; right: 8.8%; width: 16.2%; height: 27.4%; object-fit: cover; border-radius: 4px; }
                    .cert-name { position: absolute; top: 48.2%; left: 49.5%; transform: translate(-50%, -100%); width: 74%; text-align: center; font-size: 32px; font-weight: 900; color: #1e293b; text-transform: uppercase; }
                    .cert-date { position: absolute; top: 55.5%; left: 49.5%; transform: translateX(-50%); width: 74%; text-align: center; font-size: 16px; font-weight: 600; color: #475569; font-family: sans-serif; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-template.jpg" class="cert-bg">
                    ${photoSrc ? `<img src="${photoSrc}" class="cert-photo">` : ''}
                    <div class="cert-name">${certName}</div>
                    <div class="cert-date">${certDate}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

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
        window.downloadCertificateImage = downloadCertificateImage;
        window.downloadCertificatePDF = downloadCertificatePDF;
        window.shareCertificateWA = shareCertificateWA;
    }

    return {
        init: initJamaahView,
        loadPilgrimDocumentsAsync: loadPilgrimDocumentsAsync,
        renderDocuments: renderDocuments,
        switchJourneyStep: switchJourneyStep,
        closeJourneyPanels: closeJourneyPanels,
        toggleJourneyCollapse: toggleJourneyCollapse,
        renderPilgrimCertificate: renderPilgrimCertificate,
        downloadCertificateImage: downloadCertificateImage,
        downloadCertificatePDF: downloadCertificatePDF,
        shareCertificateWA: shareCertificateWA,
        formatRupiah: formatRupiah
    };
});
