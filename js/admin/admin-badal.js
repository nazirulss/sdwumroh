/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: E-SERTIFIKAT BADAL UMROH
 * File: js/admin/admin-badal.js
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

    const STORAGE_KEY = 'sdw_admin_badal_certificates';

    // Data Awal Mock Piagam Badal Umroh (Tersinkronisasi dengan Jamaah PWA)
    const DEFAULT_BADAL_CERTIFICATES = [
        {
            id: 'BDL-001',
            almarhumName: 'Alm. H. Abdullah bin Umar',
            beneficiaryTitle: 'Almarhum',
            dibadalkanOleh: 'Keluarga Besar Bpk. Sanali Bajuri',
            muthawwif: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            muthawwifRole: 'Muthawwif Mukim Makkah',
            certNo: 'SDW/BDL/2026/001',
            executionDate: '27 Oktober 2026',
            location: 'Makkah Al-Mukarramah',
            status: 'ISSUED',
            nameFontSize: 'auto'
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
            location: 'Makkah Al-Mukarramah',
            status: 'ISSUED',
            nameFontSize: 'auto'
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
            location: 'Makkah Al-Mukarramah',
            status: 'ISSUED',
            nameFontSize: 'auto'
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
            location: 'Makkah Al-Mukarramah',
            status: 'ISSUED',
            nameFontSize: 'auto'
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
            location: 'Makkah Al-Mukarramah',
            status: 'DRAFT',
            nameFontSize: 'auto'
        }
    ];

    // Helper: Ambil Store Sertifikat Badal dari LocalStorage
    function getBadalStore() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Gagal membaca store sertifikat badal:', e);
        }
        // Inisialisasi awal dengan data default
        saveBadalStore(DEFAULT_BADAL_CERTIFICATES);
        return JSON.parse(JSON.stringify(DEFAULT_BADAL_CERTIFICATES));
    }

    // Helper: Simpan Store Sertifikat Badal ke LocalStorage
    function saveBadalStore(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            console.error('Gagal menyimpan store sertifikat badal:', e);
        }
    }

    // ==================== 1. RENDER TABEL BADAL CERTIFICATES ====================
    function renderBadalCertificates() {
        const tbody = document.getElementById('table-badal-certificates-body');
        if (!tbody) return;

        const searchInput = document.getElementById('badal-search-input');
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

        const periodSelect = document.getElementById('badal-filter-period');
        const periodFilter = periodSelect ? periodSelect.value : 'ALL';

        const statusSelect = document.getElementById('badal-filter-status');
        const statusFilter = statusSelect ? statusSelect.value : 'ALL';

        let list = getBadalStore();

        // Filter Periode
        if (periodFilter && periodFilter !== 'ALL') {
            list = list.filter(item => (item.executionDate || '').includes(periodFilter));
        }

        // Filter Status
        if (statusFilter && statusFilter !== 'ALL') {
            list = list.filter(item => item.status === statusFilter);
        }

        // Filter Pencarian
        if (query) {
            list = list.filter(item => {
                const name = (item.almarhumName || '').toLowerCase();
                const id = (item.id || '').toLowerCase();
                const certNo = (item.certNo || '').toLowerCase();
                const amanah = (item.dibadalkanOleh || '').toLowerCase();
                const muthawwif = (item.muthawwif || '').toLowerCase();
                return name.includes(query) || id.includes(query) || certNo.includes(query) || amanah.includes(query) || muthawwif.includes(query);
            });
        }

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-kaaba text-3xl mb-2 text-slate-300 block"></i>
                        ${query ? 'Tidak ada data piagam badal yang cocok dengan pencarian.' : 'Belum ada data piagam badal umroh pada periode ini.'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = list.map(item => {
            const isIssued = item.status === 'ISSUED';
            return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    <td class="px-4 py-3">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ${item.id}
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-kaaba text-[11px] text-amber-500"></i>
                            <span>${item.almarhumName}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-0.5 font-medium">Gelar: ${item.beneficiaryTitle || 'Almarhum'}</div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-bold text-slate-800">${item.muthawwif}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">Atas Amanah: <span class="font-semibold text-slate-700">${item.dibadalkanOleh}</span></div>
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-semibold text-slate-800">${item.executionDate}</div>
                        <div class="text-[10px] text-slate-400">${item.location}</div>
                    </td>
                    <td class="px-4 py-3 font-mono text-[11px] text-slate-600 font-semibold">
                        ${item.certNo}
                    </td>
                    <td class="px-4 py-3">
                        ${isIssued ? `
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <i class="fa-solid fa-circle-check text-[9px]"></i> Terbit
                            </span>
                        ` : `
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <i class="fa-solid fa-clock text-[8px]"></i> Draft
                            </span>
                        `}
                    </td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openBadalModal('${item.id}')" class="w-8 h-8 rounded-lg bg-purple-900 text-white hover:bg-purple-950 flex items-center justify-center shadow-2xs cursor-pointer transition active:scale-95" title="Edit & Preview Piagam Badal">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.printBadalCertificate('${item.id}')" class="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 flex items-center justify-center shadow-2xs cursor-pointer transition active:scale-95" title="Cetak Piagam Fisik A4">
                                <i class="fa-solid fa-print text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.downloadSingleBadal('${item.id}')" class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 flex items-center justify-center shadow-2xs cursor-pointer transition active:scale-95" title="Download Piagam (JPG)">
                                <i class="fa-solid fa-download text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.shareBadalWA('${item.id}')" class="w-8 h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center justify-center shadow-2xs cursor-pointer transition active:scale-95" title="Kirim Pesan WhatsApp">
                                <i class="fa-brands fa-whatsapp text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteBadalCertificate('${item.id}')" class="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center justify-center shadow-2xs cursor-pointer transition active:scale-95" title="Hapus Piagam Badal">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ==================== 2. MODAL & LIVE PREVIEW CONTROLS ====================
    let activeBadalNameFontSize = 'auto';

    function calculateBadalFontSize(name, requestedSize) {
        if (requestedSize && requestedSize !== 'auto') {
            const val = parseFloat(requestedSize);
            if (!isNaN(val)) {
                const minPx = Math.round(val * 3.5);
                const maxPx = Math.round(val * 7.5);
                return {
                    style: `clamp(${minPx}px, ${val}cqi, ${maxPx}px)`,
                    cqi: val,
                    label: `${val.toFixed(1)}cqi`
                };
            }
        }
        const len = (name || '').trim().length;
        if (len <= 16) {
            return { style: 'clamp(14px, 4.6cqi, 32px)', cqi: 4.6, label: 'Besar (4.6cqi - Auto)' };
        } else if (len <= 24) {
            return { style: 'clamp(12px, 3.8cqi, 28px)', cqi: 3.8, label: 'Sedang (3.8cqi - Auto)' };
        } else if (len <= 32) {
            return { style: 'clamp(11px, 3.2cqi, 24px)', cqi: 3.2, label: 'Kecil (3.2cqi - Auto)' };
        } else {
            return { style: 'clamp(10px, 2.8cqi, 20px)', cqi: 2.8, label: 'Sangat Kecil (2.8cqi - Auto)' };
        }
    }

    function onBadalNameFontSizeChange(val) {
        activeBadalNameFontSize = parseFloat(val);
        updateBadalFontSizeUI();
        updateBadalPreview();
    }

    function setBadalNameFontSizePreset(preset) {
        if (preset === 's') {
            activeBadalNameFontSize = 3.2;
        } else if (preset === 'm') {
            activeBadalNameFontSize = 4.0;
        } else if (preset === 'l') {
            activeBadalNameFontSize = 4.8;
        } else {
            activeBadalNameFontSize = 'auto';
        }
        updateBadalFontSizeUI();
        updateBadalPreview();
    }

    function updateBadalFontSizeUI() {
        const slider = document.getElementById('badal-font-size-slider');
        const label = document.getElementById('badal-font-size-label');
        const nameInput = document.getElementById('badal-input-almarhum');
        const name = nameInput ? nameInput.value : '';

        const calc = calculateBadalFontSize(name, activeBadalNameFontSize);
        if (label) label.innerText = calc.label;
        if (slider) slider.value = calc.cqi;

        const presetButtons = document.querySelectorAll('.badal-font-preset-btn');
        presetButtons.forEach(btn => {
            const p = btn.getAttribute('data-badal-preset');
            const isActive = (p === 'auto' && activeBadalNameFontSize === 'auto') ||
                             (p === 's' && activeBadalNameFontSize === 3.2) ||
                             (p === 'm' && activeBadalNameFontSize === 4.0) ||
                             (p === 'l' && activeBadalNameFontSize === 4.8);
            if (isActive) {
                btn.className = 'badal-font-preset-btn py-1 px-1.5 rounded-lg text-[10px] font-black border border-amber-500 bg-amber-400 text-slate-950 transition cursor-pointer text-center shadow-xs';
            } else {
                btn.className = 'badal-font-preset-btn py-1 px-1.5 rounded-lg text-[10px] font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer text-center';
            }
        });
    }

    function openBadalModal(id) {
        const modal = document.getElementById('modalBadalCertificateEditor');
        const list = getBadalStore();

        let item = null;
        if (id) {
            item = list.find(b => b.id === id);
        }

        const idInput = document.getElementById('badal-input-id');
        const almarhumInput = document.getElementById('badal-input-almarhum');
        const amanahInput = document.getElementById('badal-input-amanah');
        const muthawwifInput = document.getElementById('badal-input-muthawwif');
        const roleInput = document.getElementById('badal-input-muthawwif-role');
        const dateInput = document.getElementById('badal-input-date');
        const locationInput = document.getElementById('badal-input-location');
        const noInput = document.getElementById('badal-input-no');
        const statusSelect = document.getElementById('badal-input-status');

        if (item) {
            if (idInput) idInput.value = item.id;
            if (almarhumInput) almarhumInput.value = item.almarhumName || '';
            if (amanahInput) amanahInput.value = item.dibadalkanOleh || '';
            if (muthawwifInput) muthawwifInput.value = item.muthawwif || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
            if (roleInput) roleInput.value = item.muthawwifRole || 'Muthawwif Mukim Makkah';
            if (dateInput) dateInput.value = item.executionDate || '27 Oktober 2026';
            if (locationInput) locationInput.value = item.location || 'Makkah Al-Mukarramah';
            if (noInput) noInput.value = item.certNo || `SDW/BDL/2026/${String(list.length + 1).padStart(3, '0')}`;
            if (statusSelect) statusSelect.value = item.status || 'ISSUED';
            activeBadalNameFontSize = item.nameFontSize || 'auto';
        } else {
            // Entri Baru (New Entry)
            const nextIdx = list.length + 1;
            const newId = `BDL-${String(nextIdx).padStart(3, '0')}`;
            if (idInput) idInput.value = newId;
            if (almarhumInput) almarhumInput.value = '';
            if (amanahInput) amanahInput.value = '';
            if (muthawwifInput) muthawwifInput.value = 'Ustadz Ahmad Fauzi Ridwan, Lc.';
            if (roleInput) roleInput.value = 'Muthawwif Mukim Makkah';
            if (dateInput) dateInput.value = '27 Oktober 2026';
            if (locationInput) locationInput.value = 'Makkah Al-Mukarramah';
            if (noInput) noInput.value = `SDW/BDL/2026/${String(nextIdx).padStart(3, '0')}`;
            if (statusSelect) statusSelect.value = 'ISSUED';
            activeBadalNameFontSize = 'auto';
        }

        updateBadalFontSizeUI();
        updateBadalPreview();

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    function closeBadalModal() {
        const modal = document.getElementById('modalBadalCertificateEditor');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    function updateBadalPreview() {
        const almarhumInput = document.getElementById('badal-input-almarhum');
        const amanahInput = document.getElementById('badal-input-amanah');
        const muthawwifInput = document.getElementById('badal-input-muthawwif');
        const roleInput = document.getElementById('badal-input-muthawwif-role');
        const dateInput = document.getElementById('badal-input-date');
        const locationInput = document.getElementById('badal-input-location');
        const noInput = document.getElementById('badal-input-no');

        const prevName = document.getElementById('badal-preview-name');
        const prevMuthawwif = document.getElementById('badal-preview-muthawwif');
        const prevDate = document.getElementById('badal-preview-date');
        const prevCertNo = document.getElementById('badal-preview-cert-no');

        const name = (almarhumInput && almarhumInput.value.trim()) ? almarhumInput.value.trim() : 'ALM. H. ABDULLAH BIN UMAR';
        const amanah = (amanahInput && amanahInput.value.trim()) ? amanahInput.value.trim() : 'Keluarga Besar Bpk. Sanali Bajuri';
        const muthawwif = (muthawwifInput && muthawwifInput.value.trim()) ? muthawwifInput.value.trim() : 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const role = (roleInput && roleInput.value.trim()) ? roleInput.value.trim() : 'Muthawwif Mukim Makkah';
        const date = (dateInput && dateInput.value.trim()) ? dateInput.value.trim() : '27 Oktober 2026';
        const loc = (locationInput && locationInput.value.trim()) ? locationInput.value.trim() : 'Makkah Al-Mukarramah';
        const certNo = (noInput && noInput.value.trim()) ? noInput.value.trim() : 'SDW/BDL/2026/001';

        if (prevCertNo) {
            prevCertNo.innerText = certNo.startsWith('No') ? certNo : `No: ${certNo}`;
        }

        if (prevName) {
            prevName.innerText = name.toUpperCase();
            const calc = calculateBadalFontSize(name, activeBadalNameFontSize);
            prevName.style.fontSize = calc.style;
        }

        if (prevMuthawwif) {
            prevMuthawwif.innerHTML = `Pelaksana: <strong>${muthawwif}</strong> (${role}) &bull; Atas Amanah: <strong>${amanah}</strong>`;
        }

        if (prevDate) {
            prevDate.innerText = `Tanggal Pelaksanaan: ${date} di ${loc}`;
        }
    }

    function saveBadalCertificate() {
        const idInput = document.getElementById('badal-input-id');
        const almarhumInput = document.getElementById('badal-input-almarhum');
        const amanahInput = document.getElementById('badal-input-amanah');
        const muthawwifInput = document.getElementById('badal-input-muthawwif');
        const roleInput = document.getElementById('badal-input-muthawwif-role');
        const dateInput = document.getElementById('badal-input-date');
        const locationInput = document.getElementById('badal-input-location');
        const noInput = document.getElementById('badal-input-no');
        const statusSelect = document.getElementById('badal-input-status');

        const id = idInput ? idInput.value : '';
        const almarhumName = almarhumInput ? almarhumInput.value.trim() : '';
        const dibadalkanOleh = amanahInput ? amanahInput.value.trim() : '';
        const muthawwif = muthawwifInput ? muthawwifInput.value.trim() : '';
        const muthawwifRole = roleInput ? roleInput.value.trim() : 'Muthawwif Mukim Makkah';
        const executionDate = dateInput ? dateInput.value.trim() : '27 Oktober 2026';
        const location = locationInput ? locationInput.value.trim() : 'Makkah Al-Mukarramah';
        const certNo = noInput ? noInput.value.trim() : `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const status = statusSelect ? statusSelect.value : 'ISSUED';

        if (!almarhumName) {
            alert('Silakan masukkan nama almarhum/almarhumah.');
            if (almarhumInput) almarhumInput.focus();
            return;
        }

        if (!dibadalkanOleh) {
            alert('Silakan masukkan nama keluarga pemesan amanah badal.');
            if (amanahInput) amanahInput.focus();
            return;
        }

        const list = getBadalStore();
        const existingIdx = list.findIndex(b => b.id === id);

        const beneficiaryTitle = almarhumName.toLowerCase().includes('almh') || almarhumName.toLowerCase().includes('hj.') ? 'Almarhumah' : 'Almarhum';

        const record = {
            id: id || `BDL-${String(list.length + 1).padStart(3, '0')}`,
            almarhumName,
            beneficiaryTitle,
            dibadalkanOleh,
            muthawwif,
            muthawwifRole,
            executionDate,
            location,
            certNo,
            status,
            nameFontSize: activeBadalNameFontSize,
            updatedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
            list[existingIdx] = record;
        } else {
            list.push(record);
        }

        saveBadalStore(list);
        closeBadalModal();
        renderBadalCertificates();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Piagam Badal untuk "${almarhumName}" berhasil disimpan & diterbitkan.`);
        }
    }

    // ==================== 3. CETAK FISIK A4 LANDSCAPE ====================
    function printBadalCertificate(id) {
        const list = getBadalStore();
        const item = list.find(b => b.id === id) || list[0] || {};

        const almarhumName = (item.almarhumName || 'Alm. H. Abdullah bin Umar').toUpperCase();
        const executionDate = item.executionDate || '27 Oktober 2026';
        const location = item.location || 'Makkah Al-Mukarramah';
        const muthawwif = item.muthawwif || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const role = item.muthawwifRole || 'Muthawwif Mukim Makkah';
        const dibadalkanOleh = item.dibadalkanOleh || 'Keluarga';
        const certNo = item.certNo || `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const nameFontSize = item.nameFontSize || 'auto';

        let printFontSize = '38px';
        if (nameFontSize !== 'auto') {
            const val = parseFloat(nameFontSize);
            if (!isNaN(val)) printFontSize = Math.round(val * 8.5) + 'px';
        } else {
            const len = almarhumName.length;
            if (len > 30) printFontSize = '26px';
            else if (len > 22) printFontSize = '30px';
            else if (len > 15) printFontSize = '34px';
            else printFontSize = '38px';
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Mohon izinkan popup browser untuk mencetak piagam badal.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cetak Piagam Badal Umroh - ${almarhumName}</title>
                <style>
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; font-family: "Playfair Display", Georgia, serif; }
                    .cert-box { position: relative; width: 297mm; height: 210mm; overflow: hidden; }
                    .cert-bg { width: 100%; height: 100%; object-fit: cover; }
                    .cert-badge-top { position: absolute; top: 5.5%; right: 7.0%; background: #b45309; color: #fff; font-family: sans-serif; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fbbf24; }
                    .cert-no { position: absolute; top: 5.8%; left: 6.8%; font-family: sans-serif; font-size: 14.5px; font-weight: 600; color: #64748b; letter-spacing: 0.2px; }
                    .cert-kaaba-badge { position: absolute; top: 15.55%; left: 78.2%; width: 14.0%; height: 25.0%; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border: 2.5px solid #fbbf24; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fbbf24; text-align: center; box-sizing: border-box; }
                    .cert-header { position: absolute; top: 47.5%; left: 49.5%; transform: translateX(-50%); width: 85%; text-align: center; font-size: 13.5px; font-weight: 600; color: #475569; font-family: sans-serif; }
                    .cert-name { position: absolute; top: 53.4%; left: 49.5%; transform: translate(-50%, -100%); width: 80%; text-align: center; font-size: ${printFontSize}; font-weight: 900; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
                    .cert-muthawwif { position: absolute; top: 55.4%; left: 49.5%; transform: translateX(-50%); width: 85%; text-align: center; font-size: 13.5px; font-weight: 600; color: #475569; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .cert-date { position: absolute; top: 58.0%; left: 49.5%; transform: translateX(-50%); width: 85%; text-align: center; font-size: 12.5px; font-weight: 500; color: #64748b; font-family: sans-serif; white-space: nowrap; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-template.jpg" class="cert-bg">
                    <div class="cert-badge-top">Piagam Badal Umroh</div>
                    <div class="cert-no">${certNo.startsWith('No') ? certNo : 'No: ' + certNo}</div>
                    <div class="cert-kaaba-badge">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="#fbbf24" style="margin-bottom: 4px;">
                            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.3v7.3l-6-3.3V9.8zm8 10.6v-7.3l6-3.3v7.3l-6 3.3z"/>
                        </svg>
                        <span style="font-family: sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: #fbbf24; text-transform: uppercase;">AMANAH</span>
                        <span style="font-family: sans-serif; font-size: 9px; font-weight: 600; color: #e2e8f0; margin-top: 1px;">Badal Mabrur</span>
                    </div>
                    <div class="cert-header">Diberikan Sebagai Bukti Pelaksanaan Badal Umroh Kepada:</div>
                    <div class="cert-name">${almarhumName}</div>
                    <div class="cert-muthawwif">Pelaksana: <strong>${muthawwif}</strong> (${role}) &bull; Atas Amanah: <strong>${dibadalkanOleh}</strong></div>
                    <div class="cert-date">Tanggal Pelaksanaan: ${executionDate} di ${location}</div>
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

    function printBadalFromModal() {
        const idInput = document.getElementById('badal-input-id');
        if (idInput && idInput.value) {
            printBadalCertificate(idInput.value);
        }
    }

    // ==================== 4. HIGH-RES CANVAS GENERATION & DOWNLOAD JPG ====================
    async function generateBadalCanvas(id) {
        const list = getBadalStore();
        const item = list.find(b => b.id === id) || list[0] || {};

        const almarhumName = (item.almarhumName || 'Alm. H. Abdullah bin Umar').toUpperCase();
        const executionDate = item.executionDate || '27 Oktober 2026';
        const location = item.location || 'Makkah Al-Mukarramah';
        const muthawwif = item.muthawwif || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const role = item.muthawwifRole || 'Muthawwif Mukim Makkah';
        const dibadalkanOleh = item.dibadalkanOleh || 'Keluarga';
        const certNo = item.certNo || `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const nameFontSize = item.nameFontSize || 'auto';

        // Load Background Template
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
            bgImg.onload = resolve;
            bgImg.onerror = () => resolve(null);
            bgImg.src = 'assets/certificate-template.jpg';
        });

        const canvas = document.createElement('canvas');
        const cw = 2048;
        const ch = 1364;
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        if (bgImg && bgImg.width) {
            ctx.drawImage(bgImg, 0, 0, cw, ch);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cw, ch);
        }

        // 1. Badge Top-Right: PIAGAM BADAL UMROH
        const badgeX = Math.round(cw * 0.77);
        const badgeY = Math.round(ch * 0.05);
        const badgeW = 220;
        const badgeH = 46;
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '800 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PIAGAM BADAL UMROH', badgeX + badgeW / 2, badgeY + badgeH / 2);

        // 2. Ka'bah Amanah Badge (Di posisi bingkai foto emas)
        const px = Math.round(784 * 2); // 1568
        const py = Math.round(106 * 2); // 212
        const pw = Math.round(135 * 2); // 270
        const ph = Math.round(170 * 2); // 340

        // Background Gradient Badge
        const grad = ctx.createLinearGradient(px, py, px + pw, py + ph);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(px, py, pw, ph, 8) : ctx.rect(px, py, pw, ph);
        ctx.fill();

        // Border Emas
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Ka'bah Icon / Ilustrasi Geometris Elegan di dalam Badge
        const kCenterX = px + pw / 2;
        const kCenterY = py + 120;
        const kw = 90;
        const kh = 90;

        ctx.fillStyle = '#09090b';
        ctx.fillRect(kCenterX - kw / 2, kCenterY - kh / 2, kw, kh);

        // Pita Kiswah Emas
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(kCenterX - kw / 2, kCenterY - kh / 2 + 18, kw, 12);

        // Pintu Ka'bah Emas (Bab at-Taubah)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(kCenterX + 6, kCenterY + 4, 18, 32);

        // Teks "AMANAH"
        ctx.font = '900 24px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AMANAH', px + pw / 2, py + 225);

        // Teks "Badal Mabrur"
        ctx.font = '600 18px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Badal Mabrur', px + pw / 2, py + 265);

        // 3. Nomor Sertifikat (Top-Left)
        ctx.font = '600 28px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const cleanNo = certNo.startsWith('No') ? certNo : `No: ${certNo}`;
        ctx.fillText(cleanNo, Math.round(cw * 0.068), Math.round(ch * 0.058));

        // 4. Header: Diberikan Sebagai Bukti Pelaksanaan Badal Umroh Kepada:
        ctx.font = '600 28px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Diberikan Sebagai Bukti Pelaksanaan Badal Umroh Kepada:', Math.round(cw * 0.495), Math.round(ch * 0.475));

        // 5. Nama Almarhum / Almarhumah
        let fontSizePx = 68;
        if (nameFontSize !== 'auto') {
            const val = parseFloat(nameFontSize);
            if (!isNaN(val)) fontSizePx = Math.round(val * 17);
        } else {
            const len = almarhumName.length;
            if (len > 30) fontSizePx = 46;
            else if (len > 22) fontSizePx = 54;
            else if (len > 15) fontSizePx = 62;
            else fontSizePx = 70;
        }

        ctx.font = `900 ${fontSizePx}px "Playfair Display", Georgia, serif`;
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(almarhumName, Math.round(cw * 0.495), Math.round(ch * 0.534));

        // 6. Muthawwif & Amanah line
        ctx.font = '600 26px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Pelaksana: ${muthawwif} (${role}) • Atas Amanah: ${dibadalkanOleh}`, Math.round(cw * 0.495), Math.round(ch * 0.554));

        // 7. Date & Location line
        ctx.font = '500 24px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Tanggal Pelaksanaan: ${executionDate} di ${location}`, Math.round(cw * 0.495), Math.round(ch * 0.582));

        const safeName = almarhumName.replace(/[^a-zA-Z0-9]/g, '_');
        return {
            canvas,
            filename: `Piagam_Badal_Umroh_${safeName}_${id}.jpg`
        };
    }

    async function downloadSingleBadal(id) {
        if (!id) return;
        try {
            if (typeof admin.showToast === 'function') admin.showToast('Menyiapkan file piagam badal kualitas cetak...');
            const result = await generateBadalCanvas(id);
            if (!result || !result.canvas) return;

            result.canvas.toBlob((blob) => {
                if (!blob) return;
                const link = document.createElement('a');
                link.download = result.filename;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(link.href), 15000);
                if (typeof admin.showToast === 'function') admin.showToast(`Piagam berhasil diunduh: ${result.filename}`);
            }, 'image/jpeg', 0.95);
        } catch (e) {
            console.error('Gagal mengunduh piagam badal:', e);
            if (typeof admin.showToast === 'function') admin.showToast('Gagal memproses unduhan piagam badal.');
        }
    }

    function downloadSingleBadalFromModal() {
        const idInput = document.getElementById('badal-input-id');
        if (idInput && idInput.value) {
            downloadSingleBadal(idInput.value);
        }
    }

    async function downloadBulkBadal() {
        const list = getBadalStore();
        const issued = list.filter(b => b.status === 'ISSUED');

        if (issued.length === 0) {
            if (typeof admin.showToast === 'function') admin.showToast('Tidak ada piagam badal dengan status terbit.');
            return;
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Memulai unduhan massal ${issued.length} piagam badal...`);
        }

        for (let i = 0; i < issued.length; i++) {
            const b = issued[i];
            try {
                const res = await generateBadalCanvas(b.id);
                if (res && res.canvas) {
                    await new Promise((resolve) => {
                        res.canvas.toBlob((blob) => {
                            if (blob) {
                                const link = document.createElement('a');
                                link.download = res.filename;
                                link.href = URL.createObjectURL(blob);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                setTimeout(() => URL.revokeObjectURL(link.href), 10000);
                            }
                            resolve();
                        }, 'image/jpeg', 0.95);
                    });
                }
            } catch (err) {
                console.warn(`Gagal memproses piagam ${b.id}:`, err);
            }
            // Delay 600ms antar file agar browser tidak memblokir multiple downloads
            await new Promise(r => setTimeout(r, 600));
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Berhasil mengunduh ${issued.length} piagam badal.`);
        }
    }

    function generateBulkBadal() {
        const list = getBadalStore();
        if (list.length === 0) {
            if (typeof admin.showToast === 'function') admin.showToast('Tidak ada data badal.');
            return;
        }

        let updatedCount = 0;
        list.forEach(b => {
            if (b.status !== 'ISSUED') {
                b.status = 'ISSUED';
                updatedCount++;
            }
        });

        saveBadalStore(list);
        renderBadalCertificates();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Seluruh piagam badal (${list.length} jamaah) telah resmi DITERBITKAN.`);
        }
    }

    // ==================== 5. SHARE VIA WHATSAPP ====================
    function shareBadalWA(id) {
        const list = getBadalStore();
        const b = list.find(item => item.id === id) || list[0] || {};

        const origin = window.location.origin || 'https://sdwumroh-ui.vercel.app';
        const shareUrl = `${origin}/app?view=sertifikat&tab=badal&date=${encodeURIComponent(b.executionDate)}`;

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

    // ==================== 6. HAPUS SERTIFIKAT BADAL ====================
    function deleteBadalCertificate(id) {
        if (!confirm(`Apakah Anda yakin ingin menghapus piagam badal ${id}?`)) {
            return;
        }

        let list = getBadalStore();
        list = list.filter(b => b.id !== id);
        saveBadalStore(list);
        renderBadalCertificates();

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Piagam badal ${id} berhasil dihapus.`);
        }
    }

    // ==================== EKSPOR MODUL KE SDW_ADMIN ====================
    admin.renderBadalCertificates = renderBadalCertificates;
    admin.openBadalModal = openBadalModal;
    admin.closeBadalModal = closeBadalModal;
    admin.updateBadalPreview = updateBadalPreview;
    admin.onBadalNameFontSizeChange = onBadalNameFontSizeChange;
    admin.setBadalNameFontSizePreset = setBadalNameFontSizePreset;
    admin.saveBadalCertificate = saveBadalCertificate;
    admin.printBadalCertificate = printBadalCertificate;
    admin.printBadalFromModal = printBadalFromModal;
    admin.generateBadalCanvas = generateBadalCanvas;
    admin.downloadSingleBadal = downloadSingleBadal;
    admin.downloadSingleBadalFromModal = downloadSingleBadalFromModal;
    admin.downloadBulkBadal = downloadBulkBadal;
    admin.generateBulkBadal = generateBulkBadal;
    admin.shareBadalWA = shareBadalWA;
    admin.deleteBadalCertificate = deleteBadalCertificate;

    return admin;
});
