/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: E-SERTIFIKAT UMROH
 * File: js/admin/admin-certificates.js
 * Version: 2.7.2
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
    let activeCertCrop = { zoom: 100, offsetX: 0, offsetY: 0 };

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
            const isIssued = !!(cert && cert.isIssued);
            const displayName = (cert && cert.displayName) ? cert.displayName : (r.customer || r.name || r.full_name || 'Jamaah SDW');
            const depDate = (cert && cert.departureDate) ? cert.departureDate : formatCleanDate(r.departure || r.departure_date || '15 Jan 2027');
            const certNo = (cert && cert.certificateNo) ? cert.certificateNo : `SDW/CERT/2027/${String(r.id).replace(/\D/g, '').padStart(3, '0')}`;
            const photoSrc = (cert && cert.photoUrl) ? cert.photoUrl : (r.photo || r.photoUrl || '');

            return `
                <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-12 rounded-lg overflow-hidden bg-slate-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                                ${photoSrc ? `<img src="${photoSrc}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-user text-slate-400 text-sm"></i>`}
                            </div>
                            <div>
                                <span class="font-mono text-[10px] text-amber-800 font-extrabold block">${r.id}</span>
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

        // Pulihkan pengaturan crop tersimpan atau reset ke default
        if (cert.cropSettings) {
            activeCertCrop = { ...cert.cropSettings };
        } else {
            activeCertCrop = { zoom: 100, offsetX: 0, offsetY: 0 };
        }

        syncCropSlidersUI();
        updateCertificatePreview();
        initPhotoDragEvents();

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

    // 3. Sinkronisasi UI Sliders Crop
    function syncCropSlidersUI() {
        const zoomInput = document.getElementById('crop-zoom');
        const xInput = document.getElementById('crop-offset-x');
        const yInput = document.getElementById('crop-offset-y');
        const zoomLabel = document.getElementById('label-crop-zoom');
        const xLabel = document.getElementById('label-crop-x');
        const yLabel = document.getElementById('label-crop-y');

        if (zoomInput) zoomInput.value = activeCertCrop.zoom;
        if (xInput) xInput.value = activeCertCrop.offsetX;
        if (yInput) yInput.value = activeCertCrop.offsetY;

        if (zoomLabel) zoomLabel.textContent = `${activeCertCrop.zoom}%`;
        if (xLabel) xLabel.textContent = `${activeCertCrop.offsetX}%`;
        if (yLabel) yLabel.textContent = `${activeCertCrop.offsetY}%`;
    }

    // Event Handler saat slider crop digeser
    function onPhotoCropChange() {
        const zoomInput = document.getElementById('crop-zoom');
        const xInput = document.getElementById('crop-offset-x');
        const yInput = document.getElementById('crop-offset-y');

        activeCertCrop.zoom = parseInt(zoomInput ? zoomInput.value : '100', 10) || 100;
        activeCertCrop.offsetX = parseInt(xInput ? xInput.value : '0', 10) || 0;
        activeCertCrop.offsetY = parseInt(yInput ? yInput.value : '0', 10) || 0;

        syncCropSlidersUI();
        updatePhotoTransformPreview();
    }

    // Reset posisi dan zoom pasfoto
    function resetPhotoCrop() {
        activeCertCrop = { zoom: 100, offsetX: 0, offsetY: 0 };
        syncCropSlidersUI();
        updatePhotoTransformPreview();
    }

    // Update transformasi CSS foto pratinjau real-time
    function updatePhotoTransformPreview() {
        const previewImg = document.getElementById('modal-cert-preview-photo-img');
        if (!previewImg) return;

        const scale = (activeCertCrop.zoom || 100) / 100;
        const offX = activeCertCrop.offsetX || 0;
        const offY = activeCertCrop.offsetY || 0;

        previewImg.style.transform = `scale(${scale}) translate(${offX}%, ${offY}%)`;
    }

    // Inisialisasi gesture Drag & Pan pada bingkai foto
    function initPhotoDragEvents() {
        const box = document.getElementById('modal-cert-preview-photo-box');
        if (!box || box._dragInitialized) return;
        box._dragInitialized = true;

        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startOffX = 0;
        let startOffY = 0;

        box.addEventListener('mousedown', function (e) {
            if (!activeRawPhotoDataUrl && !activeCertPhotoDataUrl) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startOffX = activeCertCrop.offsetX;
            startOffY = activeCertCrop.offsetY;
            e.preventDefault();
        });

        window.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Rasio geser sensitif: 1px = ~0.6%
            const newX = Math.max(-50, Math.min(50, Math.round(startOffX + dx * 0.6)));
            const newY = Math.max(-50, Math.min(50, Math.round(startOffY + dy * 0.6)));

            activeCertCrop.offsetX = newX;
            activeCertCrop.offsetY = newY;

            syncCropSlidersUI();
            updatePhotoTransformPreview();
        });

        window.addEventListener('mouseup', function () {
            if (isDragging) isDragging = false;
        });
    }

    // 4. Update Real-Time Live Preview Teks di Layar Modal
    function updateCertificatePreview() {
        const nameInput = document.getElementById('cert-input-name');
        const dateInput = document.getElementById('cert-input-date');
        const previewName = document.getElementById('modal-cert-preview-name');
        const previewDate = document.getElementById('modal-cert-preview-date');
        const previewImg = document.getElementById('modal-cert-preview-photo-img');
        const previewPlaceholder = document.getElementById('modal-cert-preview-photo-placeholder');

        const nameVal = (nameInput && nameInput.value.trim()) ? nameInput.value.trim().toUpperCase() : 'NAMA JAMAAH';
        const dateVal = (dateInput && dateInput.value.trim()) ? dateInput.value.trim() : '15 Januari 2027';

        if (previewName) previewName.textContent = nameVal;

        // Wajib 1 Baris Saja
        if (previewDate) {
            const cleanDateLabel = dateVal.startsWith('Keberangkatan') ? dateVal : `Keberangkatan: ${dateVal}`;
            previewDate.textContent = cleanDateLabel;
        }

        const photoToDisplay = activeRawPhotoDataUrl || activeCertPhotoDataUrl;

        if (photoToDisplay) {
            if (previewImg) {
                previewImg.src = photoToDisplay;
                previewImg.classList.remove('hidden');
                updatePhotoTransformPreview();
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
            activeCertPhotoDataUrl = e.target.result;
            resetPhotoCrop();
            updateCertificatePreview();
            if (typeof admin.showToast === 'function') {
                admin.showToast('Pasfoto berhasil diunggah! Sesuaikan zoom & posisi geser sesuai kebutuhan.');
            }
        };
        reader.readAsDataURL(file);
    }

    // Helper: Bake / Crop Foto ke Canvas dengan Rasio Presisi 135:171 (Resolusi Tinggi 405x513)
    function bakeCroppedPhoto(imageSrc, scale, offsetX, offsetY, callback) {
        if (!imageSrc) {
            callback(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            const targetW = 405;
            const targetH = 513;
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, targetW, targetH);

            const imgAspect = img.width / img.height;
            const targetAspect = targetW / targetH;
            let drawW, drawH;

            if (imgAspect > targetAspect) {
                drawH = targetH * scale;
                drawW = drawH * imgAspect;
            } else {
                drawW = targetW * scale;
                drawH = drawW / imgAspect;
            }

            const shiftX = (targetW - drawW) / 2 + (offsetX / 100) * targetW;
            const shiftY = (targetH - drawH) / 2 + (offsetY / 100) * targetH;

            ctx.drawImage(img, shiftX, shiftY, drawW, drawH);
            try {
                callback(canvas.toDataURL('image/jpeg', 0.95));
            } catch (err) {
                callback(imageSrc);
            }
        };
        img.onerror = function () {
            callback(imageSrc);
        };
        img.src = imageSrc;
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
        const scale = (activeCertCrop.zoom || 100) / 100;
        const offX = activeCertCrop.offsetX || 0;
        const offY = activeCertCrop.offsetY || 0;

        bakeCroppedPhoto(sourcePhoto, scale, offX, offY, function (bakedUrl) {
            const certStore = getCertificatesStore();
            certStore[regId] = {
                isIssued: true,
                issuedAt: new Date().toISOString(),
                certificateNo: certificateNo || `SDW/CERT/2027/${String(regId).replace(/\D/g, '').padStart(3, '0')}`,
                displayName: displayName,
                departureDate: departureDate || '15 Januari 2027',
                photoUrl: bakedUrl,
                rawPhotoUrl: sourcePhoto,
                cropSettings: { ...activeCertCrop }
            };
            saveCertificatesStore(certStore);

            closeCertificateModal();
            renderCertificates();
            if (typeof admin.showToast === 'function') {
                admin.showToast(`✅ E-Sertifikat atas nama ${displayName} (${regId}) berhasil disimpan & diterbitkan!`);
            } else {
                alert(`E-Sertifikat atas nama ${displayName} berhasil diterbitkan!`);
            }
        });
    }

    // 7. Cetak Piagam Format A4 Landscape
    function printCertificate(regId) {
        const certStore = getCertificatesStore();
        const regs = getRegistrationsList();
        const pilgrim = regs.find(r => r.id === regId) || {};
        const cert = certStore[regId] || {};

        const displayName = cert.displayName || pilgrim.customer || pilgrim.name || pilgrim.full_name || 'Jamaah Umroh';
        const departureDate = cert.departureDate || formatCleanDate(pilgrim.departure || pilgrim.departure_date || '15 Januari 2027');
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
                    .cert-photo { position: absolute; top: 15.54%; left: 76.56%; width: 13.18%; height: 25.07%; object-fit: cover; border-radius: 2px; }
                    .cert-name { position: absolute; top: 53.6%; left: 49.5%; transform: translate(-50%, -100%); width: 78%; text-align: center; font-size: 32px; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
                    .cert-date { position: absolute; top: 55.4%; left: 49.5%; transform: translateX(-50%); width: 85%; text-align: center; font-size: 14.5px; font-weight: 600; color: #475569; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-template.jpg" class="cert-bg">
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
    admin.onPhotoCropChange = onPhotoCropChange;
    admin.resetPhotoCrop = resetPhotoCrop;
    admin.saveCertificate = saveCertificate;
    admin.printCertificate = printCertificate;
    admin.generateBulkCertificates = generateBulkCertificates;

    return admin;
});
