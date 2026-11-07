/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: E-SERTIFIKAT UMROH
 * File: js/admin/admin-certificates.js
 * Version: 2.7.3
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

    let activeCertPhotoDataUrl = null;
    let activeRawPhotoDataUrl = null;
    let activeCertCrop = { zoom: 100 };

    function getCertificatesStore() {
        try {
            return JSON.parse(localStorage.getItem('sdw_admin_certificates') || '{}');
        } catch (e) {
            return {};
        }
    }

    function saveCertificatesStore(store) {
        try {
            localStorage.setItem('sdw_admin_certificates', JSON.stringify(store));
        } catch (e) {
            console.error('Gagal menyimpan sertifikat ke localStorage:', e);
        }
    }

    // Helper: Normalisasi Google Drive Photo URL agar selalu memiliki size parameter (=s0)
    function normalizePhotoUrl(url) {
        if (!url || typeof url !== 'string') return '';
        if (url.includes('googleusercontent.com/d/') && !url.includes('=')) {
            return url + '=s0';
        }
        return url;
    }

    // Helper: Format tanggal bersih 1 baris
    function formatCleanDate(str) {
        if (!str) return '15 Januari 2027';
        // Deteksi format ISO YYYY-MM-DD
        const isoMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const d = parseInt(isoMatch[3], 10);
            const m = months[parseInt(isoMatch[2], 10) - 1];
            const y = isoMatch[1];
            return `${d} ${m} ${y}`;
        }
        return str.replace(/\s*\(.*?\)\s*/g, ' ').trim();
    }

    // Helper: Ambil daftar seluruh registrasi jamaah secara aman & reaktif
    function getRegistrationsList() {
        if (Array.isArray(admin.registrationsData) && admin.registrationsData.length > 0) {
            return admin.registrationsData;
        }
        try {
            const raw = localStorage.getItem('sdw_admin_registrations');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    admin.registrationsData = parsed;
                    return parsed;
                }
            }
        } catch (e) {}

        if (typeof MOCK_DATA !== 'undefined' && Array.isArray(MOCK_DATA.registrations) && MOCK_DATA.registrations.length > 0) {
            admin.registrationsData = JSON.parse(JSON.stringify(MOCK_DATA.registrations));
            return admin.registrationsData;
        }

        // Fallback default sample registrations bila store belum terisi
        const fallback = [
            { id: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'CONFIRMED', phone: '0812-9876-5432' },
            { id: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'UNDER_REVIEW', phone: '0813-2233-4455' },
            { id: 'REG-SDW-2703', customer: 'Bpk. Gunawan Wibisono', package: 'Umroh VIP 12H', departure: '28 Feb 2027', status: 'APPROVED', phone: '0817-8899-0011' }
        ];
        admin.registrationsData = fallback;
        return fallback;
    }

    // 1. Render Tabel E-Sertifikat di Portal Admin
    function renderCertificates() {
        const tbody = document.getElementById('table-certificates-body');
        if (!tbody) return;

        const searchInput = document.getElementById('cert-search-input');
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

        let regs = getRegistrationsList();
        const certStore = getCertificatesStore();

        if (query) {
            regs = regs.filter(r => {
                const name = (r.customer || r.name || r.full_name || '').toLowerCase();
                const id = (r.id || '').toLowerCase();
                const pkg = (r.package || r.packageName || '').toLowerCase();
                return name.includes(query) || id.includes(query) || pkg.includes(query);
            });
        }

        if (regs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-award text-3xl mb-2 text-slate-300 block"></i>
                        ${query ? 'Tidak ada data jamaah yang cocok dengan pencarian.' : 'Belum ada data jamaah terkonfirmasi untuk diterbitkan sertifikat.'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = regs.map(r => {
            const cert = certStore[r.id] || null;
            const isIssued = (cert && cert.isIssued !== undefined) ? !!cert.isIssued : (r.isIssued === true || r.status === 'COMPLETED');
            const displayName = (cert && cert.displayName) ? cert.displayName : (r.customer || r.name || r.full_name || 'Jamaah SDW');
            const depDate = (cert && cert.departureDate) ? cert.departureDate : formatCleanDate(r.departure || r.departure_date || '15 Jan 2027');
            const certNo = (cert && cert.certificateNo) ? cert.certificateNo : (r.certificateNo || `SDW/CERT/2026/${String(r.id).replace(/\D/g, '').padStart(3, '0')}`);
            const photoSrc = normalizePhotoUrl((cert && cert.photoUrl) ? cert.photoUrl : (r.photo || r.photoUrl || ''));

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-12 rounded-lg overflow-hidden bg-slate-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                                ${photoSrc ? `<img src="${photoSrc}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-slate-400 text-sm"></i>`}
                            </div>
                            <div>
                                <span class="font-mono text-[10px] text-amber-800 font-extrabold flex items-center gap-1">
                                    <span>${r.id}</span>
                                    ${(photoSrc && (photoSrc.includes('googleusercontent') || photoSrc.includes('drive.google') || (cert && cert.isDriveSynced))) ? '<i class="fa-solid fa-cloud-check text-emerald-600 text-[9px]" title="Tersimpan di Google Drive & Spreadsheet"></i>' : ''}
                                </span>
                                <span class="text-[9.5px] text-slate-400">${r.phone || '-'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-extrabold text-slate-900">${displayName}</div>
                        <span class="text-[10px] text-slate-500">${r.package || r.packageName || 'Umroh Reguler 9 Hari'}</span>
                    </td>
                    <td class="px-4 py-3 font-semibold text-slate-700">
                        ${depDate}
                    </td>
                    <td class="px-4 py-3 font-mono text-[10.5px] text-slate-600">
                        ${certNo}
                    </td>
                    <td class="px-4 py-3">
                        ${isIssued ? `
                            <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                <i class="fa-solid fa-circle-check text-[8px]"></i> Terbit
                            </span>
                        ` : `
                            <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                                <i class="fa-solid fa-clock text-[8px]"></i> Draft
                            </span>
                        `}
                    </td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openCertificateModal('${r.id}')" class="px-2.5 py-1.5 rounded-lg bg-sdw-pine text-white hover:bg-slate-800 font-bold text-[10.5px] flex items-center gap-1 shadow-2xs cursor-pointer transition">
                                <i class="fa-solid fa-pen-to-square text-[9.5px]"></i>
                                <span>Edit &amp; Preview</span>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.printCertificate('${r.id}')" class="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-bold text-[10.5px] flex items-center gap-1 cursor-pointer transition" title="Cetak Piagam A4">
                                <i class="fa-solid fa-print text-[9.5px]"></i>
                                <span>Cetak A4</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 2. Buka Modal Edit & Preview E-Sertifikat
    function openCertificateModal(regId) {
        const regs = getRegistrationsList();
        const pilgrim = regs.find(r => r.id === regId);
        if (!pilgrim) {
            if (typeof admin.showToast === 'function') admin.showToast('Data jamaah tidak ditemukan.');
            return;
        }

        const certStore = getCertificatesStore();
        const cert = certStore[regId] || {};

        const regIdInput = document.getElementById('cert-input-reg-id');
        const nameInput = document.getElementById('cert-input-name');
        const dateInput = document.getElementById('cert-input-date');
        const certNoInput = document.getElementById('cert-input-no');
        const modal = document.getElementById('modalCertificateEditor');

        if (regIdInput) regIdInput.value = regId;
        if (nameInput) nameInput.value = cert.displayName || pilgrim.customer || pilgrim.name || pilgrim.full_name || '';
        if (dateInput) dateInput.value = cert.departureDate || formatCleanDate(pilgrim.departure || pilgrim.departure_date || '15 Januari 2027');
        if (certNoInput) certNoInput.value = cert.certificateNo || `SDW/CERT/2027/${String(regId).replace(/\D/g, '').padStart(3, '0')}`;

        activeRawPhotoDataUrl = cert.rawPhotoUrl || cert.photoUrl || pilgrim.photo || pilgrim.photoUrl || null;
        activeCertPhotoDataUrl = cert.photoUrl || activeRawPhotoDataUrl;

        // Pulihkan pengaturan zoom tersimpan atau reset ke 100%
        activeCertCrop = { zoom: cert.cropZoom || (cert.cropSettings && cert.cropSettings.zoom) || 100 };

        syncCropSlidersUI();
        updateCertificatePreview();

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    function closeCertificateModal() {
        const modal = document.getElementById('modalCertificateEditor');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // 3. Status & Interaksi Cropper Pasfoto Interaktif (Corner Dragging & Moving)
    const CROP_RATIO = 135 / 171; // Rasio piagam bingkai emas (~0.7895)
    let cropperState = {
        isDragging: false,
        isResizing: false,
        activeHandle: null,
        startX: 0,
        startY: 0,
        boxStartX: 0,
        boxStartY: 0,
        boxStartW: 0,
        boxStartH: 0,
        imgNaturalW: 0,
        imgNaturalH: 0,
        imgRenderedW: 0,
        imgRenderedH: 0,
        imgOffsetLeft: 0,
        imgOffsetTop: 0,
        initializedEvents: false
    };

    // Helper compatibility
    function syncCropSlidersUI() {}
    function onPhotoCropChange() {}
    function resetPhotoCrop() {
        activeCertCrop = { zoom: 100 };
    }

    // 4. Update Real-Time Live Preview Teks di Layar Modal
    function updateCertificatePreview() {
        const nameInput = document.getElementById('cert-input-name');
        const dateInput = document.getElementById('cert-input-date');
        const certNoInput = document.getElementById('cert-input-no');
        const previewName = document.getElementById('modal-cert-preview-name');
        const previewDate = document.getElementById('modal-cert-preview-date');
        const previewNo = document.getElementById('modal-cert-preview-no');
        const previewImg = document.getElementById('modal-cert-preview-photo-img');
        const previewPlaceholder = document.getElementById('modal-cert-preview-photo-placeholder');

        const nameVal = (nameInput && nameInput.value.trim()) ? nameInput.value.trim().toUpperCase() : 'NAMA JAMAAH';
        const dateVal = (dateInput && dateInput.value.trim()) ? dateInput.value.trim() : '15 Januari 2027';
        const noVal = (certNoInput && certNoInput.value.trim()) ? certNoInput.value.trim() : 'SDW/CERT/2027/2701';

        if (previewName) previewName.textContent = nameVal;

        // Nomor Sertifikat di Pojok Kiri Atas (Warna & Ukuran serasi dengan tanggal)
        if (previewNo) {
            previewNo.textContent = noVal.startsWith('No') ? noVal : `No: ${noVal}`;
        }

        // Wajib 1 Baris Saja
        if (previewDate) {
            const cleanDateLabel = dateVal.startsWith('Keberangkatan') ? dateVal : `Keberangkatan: ${dateVal}`;
            previewDate.textContent = cleanDateLabel;
        }

        const photoToDisplay = activeCertPhotoDataUrl || activeRawPhotoDataUrl;

        if (photoToDisplay) {
            if (previewImg) {
                previewImg.src = photoToDisplay;
                previewImg.classList.remove('hidden');
                previewImg.style.transform = 'none';
            }
            if (previewPlaceholder) previewPlaceholder.classList.add('hidden');
        } else {
            if (previewImg) previewImg.classList.add('hidden');
            if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
        }
    }

    // 5. Handle Upload Foto Pasfoto Kustom di Modal
    function handleCertificatePhotoUpload(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            activeRawPhotoDataUrl = e.target.result;
            // Langsung buka modal pratinjau crop interaktif sebelum ditampilkan ke sertifikat!
            openPhotoCropper(activeRawPhotoDataUrl);
        };
        reader.readAsDataURL(file);
        input.value = ''; // Reset input agar file yang sama bisa dipilih kembali jika diinginkan
    }

    // Buka Modal Cropper Interaktif
    function openPhotoCropper(imageSrc) {
        if (!imageSrc) return;
        const modal = document.getElementById('modalPhotoCropper');
        const sourceImg = document.getElementById('cropper-source-img');
        if (!modal || !sourceImg) return;

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        initCropperEventListeners();

        sourceImg.onload = function () {
            initCropBoxPosition();
        };
        sourceImg.src = imageSrc;

        if (sourceImg.complete && sourceImg.naturalWidth > 0) {
            setTimeout(initCropBoxPosition, 60);
        }
    }

    function closePhotoCropperModal() {
        const modal = document.getElementById('modalPhotoCropper');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    function reopenPhotoCropper() {
        const src = activeRawPhotoDataUrl || activeCertPhotoDataUrl;
        if (!src) {
            alert('Silakan pilih foto jamaah terlebih dahulu menggunakan tombol Pilih Foto Baru.');
            return;
        }
        openPhotoCropper(src);
    }

    // Posisikan Crop Box di tengah gambar dengan rasio piagam 135:171
    function initCropBoxPosition() {
        const stage = document.getElementById('cropper-stage-container');
        const sourceImg = document.getElementById('cropper-source-img');
        const cropBox = document.getElementById('cropper-crop-box');
        if (!stage || !sourceImg || !cropBox) return;

        const imgRect = sourceImg.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();

        const imgW = imgRect.width;
        const imgH = imgRect.height;
        if (imgW <= 0 || imgH <= 0) return;

        const imgLeft = imgRect.left - stageRect.left;
        const imgTop = imgRect.top - stageRect.top;

        cropperState.imgNaturalW = sourceImg.naturalWidth || imgW;
        cropperState.imgNaturalH = sourceImg.naturalHeight || imgH;
        cropperState.imgRenderedW = imgW;
        cropperState.imgRenderedH = imgH;
        cropperState.imgOffsetLeft = imgLeft;
        cropperState.imgOffsetTop = imgTop;

        // Inisialisasi crop box proporsional (~72% tinggi gambar agar leluasa ditarik ke segala arah)
        let boxH = imgH * 0.72;
        let boxW = boxH * CROP_RATIO;

        if (boxW > imgW * 0.85) {
            boxW = imgW * 0.85;
            boxH = boxW / CROP_RATIO;
        }

        const boxLeft = Math.max(imgLeft + 10, imgLeft + (imgW - boxW) / 2);
        const boxTop = Math.max(imgTop + 10, imgTop + (imgH - boxH) / 2);

        cropBox.style.left = `${boxLeft}px`;
        cropBox.style.top = `${boxTop}px`;
        cropBox.style.width = `${boxW}px`;
        cropBox.style.height = `${boxH}px`;
    }

    // Pasang Event Listeners untuk drag box dan tarik sudut (corner handles)
    function initCropperEventListeners() {
        if (cropperState.initializedEvents) return;
        cropperState.initializedEvents = true;

        const stage = document.getElementById('cropper-stage-container');
        const cropBox = document.getElementById('cropper-crop-box');
        if (!stage || !cropBox) return;

        function getPoint(e) {
            if (e.touches && e.touches.length > 0) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            return { x: e.clientX, y: e.clientY };
        }

        // Deteksi kedekatan klik/kursor dengan 4 sudut crop box (toleransi 40px)
        function getClosestCorner(clickX, clickY) {
            const boxRect = cropBox.getBoundingClientRect();
            const corners = [
                { handle: 'nw', x: boxRect.left, y: boxRect.top },
                { handle: 'ne', x: boxRect.right, y: boxRect.top },
                { handle: 'sw', x: boxRect.left, y: boxRect.bottom },
                { handle: 'se', x: boxRect.right, y: boxRect.bottom }
            ];

            let closest = null;
            let minDist = Infinity;
            for (const c of corners) {
                const dist = Math.hypot(clickX - c.x, clickY - c.y);
                if (dist < minDist) {
                    minDist = dist;
                    closest = c;
                }
            }
            if (minDist <= 40) {
                return closest.handle;
            }
            return null;
        }

        // Ubah cursor secara dinamis saat mouse diarahkan ke sudut crop box
        cropBox.addEventListener('mousemove', function (e) {
            if (cropperState.isDragging || cropperState.isResizing) return;
            const corner = getClosestCorner(e.clientX, e.clientY);
            if (corner === 'nw' || corner === 'se') {
                cropBox.style.cursor = 'nwse-resize';
            } else if (corner === 'ne' || corner === 'sw') {
                cropBox.style.cursor = 'nesw-resize';
            } else {
                cropBox.style.cursor = 'move';
            }
        });

        // Pointer down (Mouse & Touch)
        function handlePointerStart(e) {
            const pt = getPoint(e);
            const handleEl = e.target.closest('.crop-corner-handle');

            if (handleEl) {
                e.preventDefault();
                e.stopPropagation();
                startResize(handleEl.getAttribute('data-handle'), pt);
                return;
            }

            if (e.target.closest('#cropper-crop-box')) {
                e.preventDefault();
                // Jika klik berada di area sudut kotak (meskipun meleset dari pin handle), otomatis aktifkan resize!
                const corner = getClosestCorner(pt.x, pt.y);
                if (corner) {
                    startResize(corner, pt);
                } else {
                    startDrag(pt);
                }
            }
        }

        stage.addEventListener('mousedown', handlePointerStart);
        stage.addEventListener('touchstart', handlePointerStart, { passive: false });

        function startDrag(pt) {
            cropperState.isDragging = true;
            cropperState.isResizing = false;
            cropperState.startX = pt.x;
            cropperState.startY = pt.y;
            cropperState.boxStartX = parseFloat(cropBox.style.left) || 0;
            cropperState.boxStartY = parseFloat(cropBox.style.top) || 0;
            cropBox.style.cursor = 'move';
        }

        function startResize(handleType, pt) {
            cropperState.isResizing = true;
            cropperState.isDragging = false;
            cropperState.activeHandle = handleType;
            cropperState.startX = pt.x;
            cropperState.startY = pt.y;

            const curL = parseFloat(cropBox.style.left) || 0;
            const curT = parseFloat(cropBox.style.top) || 0;
            const curW = parseFloat(cropBox.style.width) || 100;
            const curH = parseFloat(cropBox.style.height) || (100 / CROP_RATIO);

            cropperState.boxStartX = curL;
            cropperState.boxStartY = curT;
            cropperState.boxStartW = curW;
            cropperState.boxStartH = curH;
            cropperState.fixedRight = curL + curW;
            cropperState.fixedBottom = curT + curH;

            if (handleType === 'nw' || handleType === 'se') {
                cropBox.style.cursor = 'nwse-resize';
            } else {
                cropBox.style.cursor = 'nesw-resize';
            }
        }

        function onPointerMove(e) {
            if (!cropperState.isDragging && !cropperState.isResizing) return;
            const pt = getPoint(e);

            const minX = cropperState.imgOffsetLeft;
            const maxX = cropperState.imgOffsetLeft + cropperState.imgRenderedW;
            const minY = cropperState.imgOffsetTop;
            const maxY = cropperState.imgOffsetTop + cropperState.imgRenderedH;
            const minBoxW = 45;

            if (cropperState.isDragging) {
                const dx = pt.x - cropperState.startX;
                const dy = pt.y - cropperState.startY;
                const curW = parseFloat(cropBox.style.width) || cropperState.boxStartW;
                const curH = parseFloat(cropBox.style.height) || cropperState.boxStartH;

                let newL = cropperState.boxStartX + dx;
                let newT = cropperState.boxStartY + dy;

                if (newL < minX) newL = minX;
                if (newL + curW > maxX) newL = maxX - curW;
                if (newT < minY) newT = minY;
                if (newT + curH > maxY) newT = maxY - curH;

                cropBox.style.left = `${newL}px`;
                cropBox.style.top = `${newT}px`;
            } else if (cropperState.isResizing) {
                const handle = cropperState.activeHandle;
                const dx = pt.x - cropperState.startX;
                const dy = pt.y - cropperState.startY;

                if (handle === 'se') {
                    // Sudut kiri-atas tetap: (boxStartX, boxStartY)
                    // Ambil delta perubahan terbesar (horizontal/vertikal)
                    const deltaW = Math.abs(dx) >= Math.abs(dy * CROP_RATIO) ? dx : (dy * CROP_RATIO);
                    let targetW = cropperState.boxStartW + deltaW;
                    targetW = Math.max(minBoxW, targetW);

                    const maxWByRight = maxX - cropperState.boxStartX;
                    const maxWByBottom = (maxY - cropperState.boxStartY) * CROP_RATIO;
                    const maxW = Math.min(maxWByRight, maxWByBottom);
                    targetW = Math.min(targetW, maxW);
                    const targetH = targetW / CROP_RATIO;

                    cropBox.style.width = `${targetW}px`;
                    cropBox.style.height = `${targetH}px`;
                    cropBox.style.left = `${cropperState.boxStartX}px`;
                    cropBox.style.top = `${cropperState.boxStartY}px`;
                } else if (handle === 'sw') {
                    // Sudut kanan-atas tetap: (fixedRight, boxStartY)
                    const deltaW = Math.abs(dx) >= Math.abs(dy * CROP_RATIO) ? -dx : (dy * CROP_RATIO);
                    let targetW = cropperState.boxStartW + deltaW;
                    targetW = Math.max(minBoxW, targetW);

                    const maxWByLeft = cropperState.fixedRight - minX;
                    const maxWByBottom = (maxY - cropperState.boxStartY) * CROP_RATIO;
                    const maxW = Math.min(maxWByLeft, maxWByBottom);
                    targetW = Math.min(targetW, maxW);
                    const targetH = targetW / CROP_RATIO;
                    const newL = cropperState.fixedRight - targetW;

                    cropBox.style.width = `${targetW}px`;
                    cropBox.style.height = `${targetH}px`;
                    cropBox.style.left = `${newL}px`;
                    cropBox.style.top = `${cropperState.boxStartY}px`;
                } else if (handle === 'ne') {
                    // Sudut kiri-bawah tetap: (boxStartX, fixedBottom)
                    const deltaW = Math.abs(dx) >= Math.abs(dy * CROP_RATIO) ? dx : (-dy * CROP_RATIO);
                    let targetW = cropperState.boxStartW + deltaW;
                    targetW = Math.max(minBoxW, targetW);

                    const maxWByRight = maxX - cropperState.boxStartX;
                    const maxWByTop = (cropperState.fixedBottom - minY) * CROP_RATIO;
                    const maxW = Math.min(maxWByRight, maxWByTop);
                    targetW = Math.min(targetW, maxW);
                    const targetH = targetW / CROP_RATIO;
                    const newT = cropperState.fixedBottom - targetH;

                    cropBox.style.width = `${targetW}px`;
                    cropBox.style.height = `${targetH}px`;
                    cropBox.style.left = `${cropperState.boxStartX}px`;
                    cropBox.style.top = `${newT}px`;
                } else if (handle === 'nw') {
                    // Sudut kanan-bawah tetap: (fixedRight, fixedBottom)
                    const deltaW = Math.abs(dx) >= Math.abs(dy * CROP_RATIO) ? -dx : (-dy * CROP_RATIO);
                    let targetW = cropperState.boxStartW + deltaW;
                    targetW = Math.max(minBoxW, targetW);

                    const maxWByLeft = cropperState.fixedRight - minX;
                    const maxWByTop = (cropperState.fixedBottom - minY) * CROP_RATIO;
                    const maxW = Math.min(maxWByLeft, maxWByTop);
                    targetW = Math.min(targetW, maxW);
                    const targetH = targetW / CROP_RATIO;
                    const newL = cropperState.fixedRight - targetW;
                    const newT = cropperState.fixedBottom - targetH;

                    cropBox.style.width = `${targetW}px`;
                    cropBox.style.height = `${targetH}px`;
                    cropBox.style.left = `${newL}px`;
                    cropBox.style.top = `${newT}px`;
                }
            }
        }

        function onPointerUp() {
            cropperState.isDragging = false;
            cropperState.isResizing = false;
            cropperState.activeHandle = null;
        }

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);
    }

    // Terapkan Hasil Crop ke Sertifikat
    function applyPhotoCrop() {
        const sourceImg = document.getElementById('cropper-source-img');
        const cropBox = document.getElementById('cropper-crop-box');
        if (!sourceImg || !cropBox) return;

        const boxRect = cropBox.getBoundingClientRect();
        const imgRect = sourceImg.getBoundingClientRect();

        const scaleX = sourceImg.naturalWidth / imgRect.width;
        const scaleY = sourceImg.naturalHeight / imgRect.height;

        const cropX = Math.max(0, (boxRect.left - imgRect.left) * scaleX);
        const cropY = Math.max(0, (boxRect.top - imgRect.top) * scaleY);
        const cropW = Math.min(sourceImg.naturalWidth - cropX, boxRect.width * scaleX);
        const cropH = Math.min(sourceImg.naturalHeight - cropY, boxRect.height * scaleY);

        const canvas = document.createElement('canvas');
        canvas.width = 405;
        canvas.height = 513;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sourceImg, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

        try {
            activeCertPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        } catch (err) {
            console.warn('Gagal export canvas crop:', err);
            activeCertPhotoDataUrl = sourceImg.src;
        }

        updateCertificatePreview();
        closePhotoCropperModal();

        if (typeof admin.showToast === 'function') {
            admin.showToast('✅ Pasfoto berhasil disesuaikan & diterapkan ke sertifikat!');
        }
    }

    // 6. Simpan Sertifikat & Terbitkan ke Aplikasi Jamaah
    function saveCertificate() {
        const regIdInput = document.getElementById('cert-input-reg-id');
        const nameInput = document.getElementById('cert-input-name');
        const dateInput = document.getElementById('cert-input-date');
        const certNoInput = document.getElementById('cert-input-no');

        if (!regIdInput || !regIdInput.value) return;

        const regId = regIdInput.value;
        const displayName = nameInput ? nameInput.value.trim() : '';
        const departureDate = dateInput ? dateInput.value.trim() : '';
        const certificateNo = certNoInput ? certNoInput.value.trim() : '';

        if (!displayName) {
            alert('Mohon isi nama jamaah yang akan dicetak pada sertifikat.');
            return;
        }

        const sourcePhoto = activeRawPhotoDataUrl || activeCertPhotoDataUrl;
        const finalPhoto = activeCertPhotoDataUrl || sourcePhoto;

        const certStore = getCertificatesStore();
        certStore[regId] = {
            isIssued: true,
            issuedAt: new Date().toISOString(),
            certificateNo: certificateNo || `SDW/CERT/2027/${String(regId).replace(/\D/g, '').padStart(3, '0')}`,
            displayName: displayName,
            departureDate: departureDate || '15 Januari 2027',
            photoUrl: finalPhoto,
            rawPhotoUrl: sourcePhoto,
            isDriveSynced: !!(finalPhoto && (finalPhoto.includes('googleusercontent') || finalPhoto.includes('drive.google')))
        };
        saveCertificatesStore(certStore);

        closeCertificateModal();
        renderCertificates();
        if (typeof admin.showToast === 'function') {
            admin.showToast(`✅ E-Sertifikat atas nama ${displayName} (${regId}) berhasil disimpan & diterbitkan!`);
        } else {
            alert(`E-Sertifikat atas nama ${displayName} berhasil diterbitkan!`);
        }

        // Unggah otomatis pasfoto ke Google Drive & simpan link ke Spreadsheet jika data base64 baru
        if (finalPhoto && finalPhoto.startsWith('data:image/')) {
            uploadCertificatePhotoToCloud(regId, finalPhoto, displayName, certStore[regId].certificateNo);
        }
    }

    // 6b. Unggah Asynchronous ke Google Drive & Catat ke Spreadsheet DB_Pilgrim_Documents
    async function uploadCertificatePhotoToCloud(regId, photoBase64, displayName, certNo) {
        if (typeof SDW_API === 'undefined' || typeof SDW_API.post !== 'function') return;
        try {
            if (typeof admin.showToast === 'function') {
                admin.showToast(`☁️ Menyimpan pasfoto ${displayName} ke Google Drive & Spreadsheet...`);
            }
            const res = await SDW_API.post('uploadCertificatePhoto', {
                regId: regId,
                photoBase64: photoBase64,
                displayName: displayName,
                certificateNo: certNo,
                fileName: `PASFOTO_${regId}.jpg`
            });
            if (res && res.success && res.data) {
                if (res.data.driveError) {
                    console.warn('[SDW_CERT] Google Drive scope pending:', res.data.driveError);
                    if (typeof admin.showToast === 'function') {
                        admin.showToast(`⚠️ Foto tersimpan di spreadsheet, namun izin Google Drive perlu diperbarui via Deploy > Kelola Deployment.`);
                    }
                } else if (res.data.driveUrl) {
                    const certStore = getCertificatesStore();
                    if (certStore[regId]) {
                        certStore[regId].photoUrl = res.data.driveUrl;
                        certStore[regId].driveFileId = res.data.fileId;
                        certStore[regId].driveViewLink = res.data.viewLink;
                        certStore[regId].isDriveSynced = true;
                        certStore[regId].driveSyncedAt = new Date().toISOString();
                        saveCertificatesStore(certStore);
                        renderCertificates();
                    }
                    if (typeof admin.showToast === 'function') {
                        admin.showToast(`🎉 Pasfoto ${displayName} berhasil tersimpan di Google Drive & Spreadsheet!`);
                    }
                }
            }
        } catch (err) {
            console.warn('[SDW_CERT] Gagal upload foto ke Google Drive:', err);
        }
    }

    // 7. Cetak Piagam Format A4 Landscape
    function printCertificate(regId) {
        const certStore = getCertificatesStore();
        const regs = getRegistrationsList();
        const pilgrim = regs.find(r => r.id === regId) || {};
        const cert = certStore[regId] || {};

        const displayName = cert.displayName || pilgrim.customer || pilgrim.name || pilgrim.full_name || 'Jamaah Umroh';
        const departureDate = cert.departureDate || formatCleanDate(pilgrim.departure || pilgrim.departure_date || '15 Januari 2027');
        const certNo = cert.certificateNo || `SDW/CERT/2027/${String(regId).replace(/\D/g, '').padStart(3, '0')}`;
        const photoSrc = cert.photoUrl || pilgrim.photo || pilgrim.photoUrl || '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Mohon izinkan popup browser untuk mencetak piagam sertifikat.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Piagam Sertifikat - ${displayName}</title>
                <style>
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; font-family: "Playfair Display", Georgia, serif; }
                    .cert-box { position: relative; width: 297mm; height: 210mm; overflow: hidden; }
                    .cert-bg { width: 100%; height: 100%; object-fit: cover; }
                    .cert-no { position: absolute; top: 5.8%; left: 6.8%; font-family: sans-serif; font-size: 14.5px; font-weight: 600; color: #64748b; letter-spacing: 0.2px; }
                    .cert-photo { position: absolute; top: 15.55%; left: 76.8%; width: 13.75%; height: 25.1%; object-fit: cover; border-radius: 2px; }
                    .cert-name { position: absolute; top: 53.6%; left: 49.5%; transform: translate(-50%, -100%); width: 78%; text-align: center; font-size: 32px; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
                    .cert-date { position: absolute; top: 55.4%; left: 49.5%; transform: translateX(-50%); width: 85%; text-align: center; font-size: 14.5px; font-weight: 600; color: #475569; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-template.jpg" class="cert-bg">
                    <div class="cert-no">${certNo.startsWith('No') ? certNo : 'No: ' + certNo}</div>
                    ${photoSrc ? `<img src="${photoSrc}" class="cert-photo">` : ''}
                    <div class="cert-name">${displayName}</div>
                    <div class="cert-date">Keberangkatan: ${departureDate}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // 8. Terbitkan Massal Seluruh Jamaah Kloter
    function generateBulkCertificates() {
        const regs = getRegistrationsList();
        if (regs.length === 0) {
            if (typeof admin.showToast === 'function') {
                admin.showToast('Tidak ada data jamaah dalam sistem.');
            } else {
                alert('Tidak ada data jamaah dalam sistem.');
            }
            return;
        }

        const certStore = getCertificatesStore();
        let unissuedCount = 0;
        regs.forEach(r => {
            if (!certStore[r.id] || !certStore[r.id].isIssued) unissuedCount++;
        });

        if (unissuedCount === 0) {
            if (typeof admin.showToast === 'function') {
                admin.showToast('ℹ️ Seluruh jamaah kloter sudah memiliki E-Sertifikat terbit.');
            } else {
                alert('Seluruh jamaah kloter sudah memiliki E-Sertifikat terbit.');
            }
            return;
        }

        if (!confirm(`Terbitkan E-Sertifikat secara otomatis untuk ${unissuedCount} jamaah yang belum terbit?`)) {
            return;
        }

        let count = 0;
        regs.forEach(r => {
            if (!certStore[r.id] || !certStore[r.id].isIssued) {
                certStore[r.id] = {
                    isIssued: true,
                    issuedAt: new Date().toISOString(),
                    certificateNo: (certStore[r.id] && certStore[r.id].certificateNo) || `SDW/CERT/2027/${String(r.id).replace(/\D/g, '').padStart(3, '0')}`,
                    displayName: (certStore[r.id] && certStore[r.id].displayName) || (r.customer || r.name || r.full_name || 'Jamaah Umroh').toUpperCase(),
                    departureDate: (certStore[r.id] && certStore[r.id].departureDate) || formatCleanDate(r.departure || r.departure_date || '15 Januari 2027'),
                    photoUrl: (certStore[r.id] && certStore[r.id].photoUrl) || r.photo || r.photoUrl || null
                };
                count++;
            }
        });

        saveCertificatesStore(certStore);
        renderCertificates();
        if (typeof admin.showToast === 'function') {
            admin.showToast(`✅ Berhasil menerbitkan ${count} E-Sertifikat baru secara massal!`);
        } else {
            alert(`Berhasil menerbitkan ${count} E-Sertifikat baru secara massal!`);
        }
    }

    // Bind ke SDW_ADMIN
    admin.getRegistrations = getRegistrationsList;
    admin.renderCertificates = renderCertificates;
    admin.openCertificateModal = openCertificateModal;
    admin.closeCertificateModal = closeCertificateModal;
    admin.updateCertificatePreview = updateCertificatePreview;
    admin.handleCertificatePhotoUpload = handleCertificatePhotoUpload;
    admin.openPhotoCropper = openPhotoCropper;
    admin.closePhotoCropperModal = closePhotoCropperModal;
    admin.reopenPhotoCropper = reopenPhotoCropper;
    admin.applyPhotoCrop = applyPhotoCrop;
    admin.onPhotoCropChange = onPhotoCropChange;
    admin.resetPhotoCrop = resetPhotoCrop;
    admin.saveCertificate = saveCertificate;
    admin.uploadCertificatePhotoToCloud = uploadCertificatePhotoToCloud;
    admin.printCertificate = printCertificate;
    admin.generateBulkCertificates = generateBulkCertificates;

    return admin;
});
