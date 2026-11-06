/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: E-SERTIFIKAT UMROH
 * File: js/admin/admin-certificates.js
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

    let activeCertPhotoDataUrl = null;

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

    // 1. Render Tabel E-Sertifikat di Portal Admin
    function renderCertificates() {
        const tbody = document.getElementById('table-certificates-body');
        if (!tbody) return;

        const regs = (typeof admin.getRegistrations === 'function') ? admin.getRegistrations() : [];
        const certStore = getCertificatesStore();

        if (regs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-award text-3xl mb-2 text-slate-300 block"></i>
                        Belum ada data jamaah terkonfirmasi untuk diterbitkan sertifikat.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = regs.map(r => {
            const cert = certStore[r.id] || null;
            const isIssued = !!(cert && cert.isIssued);
            const displayName = (cert && cert.displayName) ? cert.displayName : (r.name || r.full_name || 'Jamaah SDW');
            const depDate = (cert && cert.departureDate) ? cert.departureDate : (r.departure || r.departure_date || '15 Jan 2027');
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
        const regs = (typeof admin.getRegistrations === 'function') ? admin.getRegistrations() : [];
        const pilgrim = regs.find(r => r.id === regId);
        if (!pilgrim) {
            admin.showToast('Data jamaah tidak ditemukan.');
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
        if (nameInput) nameInput.value = cert.displayName || pilgrim.name || pilgrim.full_name || '';
        if (dateInput) dateInput.value = cert.departureDate || pilgrim.departure || pilgrim.departure_date || '15 Januari 2027';
        if (certNoInput) certNoInput.value = cert.certificateNo || `SDW/CERT/2027/${String(regId).replace(/\D/g, '').padStart(3, '0')}`;

        activeCertPhotoDataUrl = cert.photoUrl || pilgrim.photo || pilgrim.photoUrl || null;

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

    // 3. Update Real-Time Live Preview di Layar Modal
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
        if (previewDate) previewDate.textContent = `Keberangkatan: ${dateVal} • Musim 1448 H`;

        if (activeCertPhotoDataUrl) {
            if (previewImg) {
                previewImg.src = activeCertPhotoDataUrl;
                previewImg.classList.remove('hidden');
            }
            if (previewPlaceholder) previewPlaceholder.classList.add('hidden');
        } else {
            if (previewImg) previewImg.classList.add('hidden');
            if (previewPlaceholder) previewPlaceholder.classList.remove('hidden');
        }
    }

    // 4. Handle Upload Foto Pasfoto Kustom di Modal
    function handleCertificatePhotoUpload(input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            activeCertPhotoDataUrl = e.target.result;
            updateCertificatePreview();
            admin.showToast('Foto sertifikat berhasil diperbarui di preview.');
        };
        reader.readAsDataURL(file);
    }

    // 5. Simpan Sertifikat & Terbitkan ke Aplikasi Jamaah
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

        const certStore = getCertificatesStore();
        certStore[regId] = {
            isIssued: true,
            issuedAt: new Date().toISOString(),
            certificateNo: certificateNo,
            displayName: displayName,
            departureDate: departureDate,
            photoUrl: activeCertPhotoDataUrl
        };
        saveCertificatesStore(certStore);

        closeCertificateModal();
        renderCertificates();
        admin.showToast(`E-Sertifikat atas nama ${displayName} berhasil diterbitkan ke aplikasi jamaah!`);
    }

    // 6. Cetak Piagam Format A4 Landscape
    function printCertificate(regId) {
        const certStore = getCertificatesStore();
        const regs = (typeof admin.getRegistrations === 'function') ? admin.getRegistrations() : [];
        const pilgrim = regs.find(r => r.id === regId) || {};
        const cert = certStore[regId] || {};

        const displayName = cert.displayName || pilgrim.name || pilgrim.full_name || 'Jamaah Umroh';
        const departureDate = cert.departureDate || pilgrim.departure || pilgrim.departure_date || '15 Januari 2027';
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
                    .cert-photo { position: absolute; top: 13.2%; right: 8.8%; width: 16.2%; height: 27.4%; object-fit: cover; border-radius: 4px; }
                    .cert-name { position: absolute; top: 48.2%; left: 49.5%; transform: translate(-50%, -100%); width: 74%; text-align: center; font-size: 34px; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
                    .cert-date { position: absolute; top: 55.5%; left: 49.5%; transform: translateX(-50%); width: 74%; text-align: center; font-size: 16px; font-weight: 600; color: #475569; font-family: sans-serif; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-template.jpg" class="cert-bg">
                    ${photoSrc ? `<img src="${photoSrc}" class="cert-photo">` : ''}
                    <div class="cert-name">${displayName}</div>
                    <div class="cert-date">Keberangkatan: ${departureDate} • Musim 1448 H</div>
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

    // 7. Terbitkan Massal Seluruh Jamaah Kloter
    function generateBulkCertificates() {
        const regs = (typeof admin.getRegistrations === 'function') ? admin.getRegistrations() : [];
        if (regs.length === 0) {
            alert('Tidak ada jamaah dalam antrean untuk diterbitkan sertifikat.');
            return;
        }

        if (!confirm(`Terbitkan E-Sertifikat secara otomatis untuk ${regs.length} jamaah terdaftar?`)) {
            return;
        }

        const certStore = getCertificatesStore();
        let count = 0;

        regs.forEach(r => {
            if (!certStore[r.id]) {
                certStore[r.id] = {
                    isIssued: true,
                    issuedAt: new Date().toISOString(),
                    certificateNo: `SDW/CERT/2027/${String(r.id).replace(/\D/g, '').padStart(3, '0')}`,
                    displayName: (r.name || r.full_name || 'Jamaah Umroh').toUpperCase(),
                    departureDate: r.departure || r.departure_date || '15 Januari 2027',
                    photoUrl: r.photo || r.photoUrl || null
                };
                count++;
            }
        });

        saveCertificatesStore(certStore);
        renderCertificates();
        admin.showToast(`Berhasil menerbitkan ${count} E-Sertifikat baru secara massal!`);
    }

    // Bind ke SDW_ADMIN
    admin.renderCertificates = renderCertificates;
    admin.openCertificateModal = openCertificateModal;
    admin.closeCertificateModal = closeCertificateModal;
    admin.updateCertificatePreview = updateCertificatePreview;
    admin.handleCertificatePhotoUpload = handleCertificatePhotoUpload;
    admin.saveCertificate = saveCertificate;
    admin.printCertificate = printCertificate;
    admin.generateBulkCertificates = generateBulkCertificates;

    return admin;
});
