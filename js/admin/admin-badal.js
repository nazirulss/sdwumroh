/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: E-SERTIFIKAT BADAL UMROH
 * File: js/admin/admin-badal.js
 * Version: 2.0.0
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

    // Data Awal Mock Piagam Badal Umroh Sesuai Skema Kolom Baru
    const DEFAULT_BADAL_CERTIFICATES = [
        {
            id: 'BDL-001',
            nomorSertifikat: 'SDW/BDL/2026/001',
            namaPetugasBadal: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            namaYangDibadalkan: 'Alm. H. Abdullah bin Umar',
            tempatMiqat: "Masjid Aisyah Tan'im",
            tanggalPelaksanaan: '27 Oktober 2026',
            tempatPenerbitan: 'Makkah',
            tanggalPenerbitan: '27 Oktober 2026',
            keluargaPemesan: 'Keluarga Besar Bpk. Sanali Bajuri',
            status: 'ISSUED',
            ukuranFontNama: 'auto',
            catatan: "Pelaksanaan badal umroh selesai secara khusyuk dan syar'i"
        },
        {
            id: 'BDL-002',
            nomorSertifikat: 'SDW/BDL/2026/002',
            namaPetugasBadal: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            namaYangDibadalkan: 'Almh. Hj. Maryam binti Sulaiman',
            tempatMiqat: "Masjid Aisyah Tan'im",
            tanggalPelaksanaan: '27 Oktober 2026',
            tempatPenerbitan: 'Makkah',
            tanggalPenerbitan: '27 Oktober 2026',
            keluargaPemesan: 'Ibu Siti Nuriyah & Keluarga',
            status: 'ISSUED',
            ukuranFontNama: 'auto',
            catatan: 'Amanah badal telah ditunaikan dengan lancar'
        },
        {
            id: 'BDL-003',
            nomorSertifikat: 'SDW/BDL/2026/003',
            namaPetugasBadal: 'Ustadz Muhammad Syakir, Lc., M.Ag.',
            namaYangDibadalkan: 'Alm. K.H. Dahlan bin Syafei',
            tempatMiqat: "Ji'ranah",
            tanggalPelaksanaan: '27 Oktober 2026',
            tempatPenerbitan: 'Makkah',
            tanggalPenerbitan: '27 Oktober 2026',
            keluargaPemesan: 'Keluarga Bpk. Khasan Munadi',
            status: 'ISSUED',
            ukuranFontNama: 'auto',
            catatan: "Dokumentasi tawaf & sa'i tersimpan"
        },
        {
            id: 'BDL-004',
            nomorSertifikat: 'SDW/BDL/2027/004',
            namaPetugasBadal: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
            namaYangDibadalkan: 'Almh. Nyai Hj. Fatimah binti Asy\'ari',
            tempatMiqat: "Masjid Aisyah Tan'im",
            tanggalPelaksanaan: '15 Januari 2027',
            tempatPenerbitan: 'Makkah',
            tanggalPenerbitan: '15 Januari 2027',
            keluargaPemesan: 'Keluarga Besar Bpk. Sugiono',
            status: 'ISSUED',
            ukuranFontNama: 'auto',
            catatan: 'Pelaksanaan badal gelombang Januari'
        },
        {
            id: 'BDL-005',
            nomorSertifikat: 'SDW/BDL/2027/005',
            namaPetugasBadal: 'Ustadz Muhammad Syakir, Lc., M.Ag.',
            namaYangDibadalkan: 'Alm. H. Mansur bin Hasyim',
            tempatMiqat: 'Bir Ali / Dzulhulaifah',
            tanggalPelaksanaan: '28 Februari 2027',
            tempatPenerbitan: 'Makkah',
            tanggalPenerbitan: '28 Februari 2027',
            keluargaPemesan: 'Keluarga Ibu Sri Nuryati',
            status: 'DRAFT',
            ukuranFontNama: 'auto',
            catatan: 'Menunggu konfirmasi jadwal muthawwif'
        }
    ];

    // Helper: Normalisasi Record agar kompatibel dengan varian nama kolom
    function normalizeBadalRecord(item) {
        if (!item) return {};
        const certNo = item.nomorSertifikat || item.nomor_sertifikat || item.certNo || item.cert_no || '';
        const petugas = item.namaPetugasBadal || item.nama_petugas_badal || item.muthawwif || '';
        const nama = item.namaYangDibadalkan || item.nama_yang_dibadalkan || item.almarhumName || item.almarhum_name || '';
        const miqat = item.tempatMiqat || item.tempat_miqat || "Masjid Aisyah Tan'im";
        const tglPelaksanaan = item.tanggalPelaksanaan || item.tanggal_pelaksanaan || item.executionDate || item.execution_date || '27 Oktober 2026';
        const tempatPenerbitan = item.tempatPenerbitan || item.tempat_penerbitan || item.location || 'Makkah';
        const tglPenerbitan = item.tanggalPenerbitan || item.tanggal_penerbitan || tglPelaksanaan;
        const keluarga = item.keluargaPemesan || item.keluarga_pemesan || item.dibadalkanOleh || item.dibadalkan_oleh || '';
        const fontSize = item.ukuranFontNama || item.ukuran_font_nama || item.nameFontSize || item.name_font_size || 'auto';
        const catatan = item.catatan || item.notes || '';

        return {
            id: item.id || '',
            nomorSertifikat: certNo,
            certNo: certNo,
            namaPetugasBadal: petugas,
            muthawwif: petugas,
            namaYangDibadalkan: nama,
            almarhumName: nama,
            tempatMiqat: miqat,
            tanggalPelaksanaan: tglPelaksanaan,
            executionDate: tglPelaksanaan,
            tempatPenerbitan: tempatPenerbitan,
            tanggalPenerbitan: tglPenerbitan,
            keluargaPemesan: keluarga,
            dibadalkanOleh: keluarga,
            status: item.status || 'ISSUED',
            ukuranFontNama: fontSize,
            nameFontSize: fontSize,
            catatan: catatan,
            notes: catatan,
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            updatedAt: item.updatedAt || item.updated_at || new Date().toISOString()
        };
    }

    // Helper: Format tanggal Indonesia (mengubah format ISO/timestamp seperti "2026-11-05 00:00:00" menjadi "5 November 2026")
    function formatBadalDateIndo(rawDate) {
        if (!rawDate) return '';
        let str = String(rawDate).trim();
        str = str.replace(/[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/, '').trim();
        const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (isoMatch) {
            const y = parseInt(isoMatch[1], 10);
            const m = parseInt(isoMatch[2], 10) - 1;
            const d = parseInt(isoMatch[3], 10);
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            if (m >= 0 && m < 12) {
                return `${d} ${months[m]} ${y}`;
            }
        }
        return str;
    }

    // Helper: Ambil Store Sertifikat Badal dari LocalStorage
    function getBadalStore() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(normalizeBadalRecord);
                }
            }
        } catch (e) {
            console.warn('Gagal membaca store sertifikat badal:', e);
        }
        // Inisialisasi awal dengan data default
        saveBadalStore(DEFAULT_BADAL_CERTIFICATES);
        return DEFAULT_BADAL_CERTIFICATES.map(normalizeBadalRecord);
    }

    // Helper: Simpan Store Sertifikat Badal ke LocalStorage
    function saveBadalStore(list) {
        try {
            const normalized = list.map(normalizeBadalRecord);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } catch (e) {
            console.error('Gagal menyimpan store sertifikat badal:', e);
        }
    }

    // Helper: Sinkronisasi Live dengan Spreadsheet Cloud (Jika Online & Terhubung)
    let hasSyncedCloud = false;
    async function syncLiveBadalCertificatesAsync() {
        if (typeof SDW_API !== 'undefined' && typeof SDW_API.get === 'function') {
            try {
                const res = await SDW_API.get('getBadalCertificates');
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    saveBadalStore(res.data);
                    renderBadalCertificates();
                }
            } catch (err) {
                console.warn('[SDW_BADAL] Gagal mengambil data badal live dari Spreadsheet:', err);
            }
        }
    }

    // ==================== 1. RENDER TABEL BADAL CERTIFICATES ====================
    function renderBadalCertificates() {
        if (!hasSyncedCloud) {
            hasSyncedCloud = true;
            syncLiveBadalCertificatesAsync();
        }

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
            list = list.filter(item => (item.tanggalPelaksanaan || '').includes(periodFilter));
        }

        // Filter Status
        if (statusFilter && statusFilter !== 'ALL') {
            list = list.filter(item => item.status === statusFilter);
        }

        // Filter Pencarian
        if (query) {
            list = list.filter(item => {
                const name = (item.namaYangDibadalkan || '').toLowerCase();
                const id = (item.id || '').toLowerCase();
                const certNo = (item.nomorSertifikat || '').toLowerCase();
                const keluarga = (item.keluargaPemesan || '').toLowerCase();
                const petugas = (item.namaPetugasBadal || '').toLowerCase();
                const miqat = (item.tempatMiqat || '').toLowerCase();
                return name.includes(query) || id.includes(query) || certNo.includes(query) || keluarga.includes(query) || petugas.includes(query) || miqat.includes(query);
            });
        }

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-4 py-8 text-center text-slate-400 text-xs">
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
                    <td class="px-4 py-3 font-mono text-[11px] text-slate-600 font-bold whitespace-nowrap">
                        ${item.nomorSertifikat}
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-black text-slate-900 flex items-center gap-1.5">
                            <i class="fa-solid fa-kaaba text-[11px] text-amber-500"></i>
                            <span>${item.namaYangDibadalkan}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-0.5">Pemesan: <span class="font-medium text-slate-600">${item.keluargaPemesan}</span></div>
                    </td>
                    <td class="px-4 py-3 font-semibold text-slate-800">
                        ${item.namaPetugasBadal}
                    </td>
                    <td class="px-4 py-3">
                        <div class="font-semibold text-slate-800 flex items-center gap-1">
                            <i class="fa-solid fa-location-dot text-amber-600 text-[10px]"></i>
                            <span>${item.tempatMiqat}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${item.tanggalPelaksanaan}</div>
                    </td>
                    <td class="px-4 py-3 text-slate-600">
                        <div class="font-medium">${item.tempatPenerbitan}</div>
                        <div class="text-[10px] text-slate-400">${item.tanggalPenerbitan}</div>
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
                const minPx = Math.round(val * 2.5);
                const maxPx = Math.round(val * 6.5);
                return {
                    style: `clamp(${minPx}px, ${val}cqi, ${maxPx}px)`,
                    cqi: val,
                    label: `${val.toFixed(1)}cqi`
                };
            }
        }
        const len = (name || '').trim().length;
        if (len <= 16) {
            return { style: 'clamp(11px, 4.2cqi, 26px)', cqi: 4.2, label: 'Besar (4.2cqi - Auto)' };
        } else if (len <= 23) {
            return { style: 'clamp(9.5px, 3.5cqi, 22px)', cqi: 3.5, label: 'Sedang (3.5cqi - Auto)' };
        } else if (len <= 30) {
            return { style: 'clamp(8px, 2.8cqi, 18px)', cqi: 2.8, label: 'Kecil (2.8cqi - Auto)' };
        } else {
            return { style: 'clamp(7px, 2.3cqi, 15px)', cqi: 2.3, label: 'Sangat Kecil (2.3cqi - Auto)' };
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
        const nameInput = document.getElementById('badal-input-nama-dibadalkan');
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
        const noInput = document.getElementById('badal-input-no');
        const petugasInput = document.getElementById('badal-input-petugas');
        const namaInput = document.getElementById('badal-input-nama-dibadalkan');
        const miqatInput = document.getElementById('badal-input-miqat');
        const tglPelaksanaanInput = document.getElementById('badal-input-tgl-pelaksanaan');
        const tempatPenerbitanInput = document.getElementById('badal-input-tempat-penerbitan');
        const tglPenerbitanInput = document.getElementById('badal-input-tgl-penerbitan');
        const keluargaInput = document.getElementById('badal-input-keluarga');
        const statusSelect = document.getElementById('badal-input-status');

        if (item) {
            if (idInput) idInput.value = item.id;
            if (noInput) noInput.value = item.nomorSertifikat || `SDW/BDL/2026/${String(item.id).replace(/\D/g, '').padStart(3, '0')}`;
            if (petugasInput) petugasInput.value = item.namaPetugasBadal || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
            if (namaInput) namaInput.value = item.namaYangDibadalkan || '';
            if (miqatInput) miqatInput.value = item.tempatMiqat || "Masjid Aisyah Tan'im";
            if (tglPelaksanaanInput) tglPelaksanaanInput.value = item.tanggalPelaksanaan || '27 Oktober 2026';
            if (tempatPenerbitanInput) tempatPenerbitanInput.value = item.tempatPenerbitan || 'Makkah';
            if (tglPenerbitanInput) tglPenerbitanInput.value = item.tanggalPenerbitan || item.tanggalPelaksanaan || '27 Oktober 2026';
            if (keluargaInput) keluargaInput.value = item.keluargaPemesan || '';
            if (statusSelect) statusSelect.value = item.status || 'ISSUED';
            activeBadalNameFontSize = item.ukuranFontNama || 'auto';
        } else {
            // Entri Baru (New Entry)
            const nextIdx = list.length + 1;
            const newId = `BDL-${String(nextIdx).padStart(3, '0')}`;
            if (idInput) idInput.value = newId;
            if (noInput) noInput.value = `SDW/BDL/2026/${String(nextIdx).padStart(3, '0')}`;
            if (petugasInput) petugasInput.value = 'Ustadz Ahmad Fauzi Ridwan, Lc.';
            if (namaInput) namaInput.value = '';
            if (miqatInput) miqatInput.value = "Masjid Aisyah Tan'im";
            if (tglPelaksanaanInput) tglPelaksanaanInput.value = '27 Oktober 2026';
            if (tempatPenerbitanInput) tempatPenerbitanInput.value = 'Makkah';
            if (tglPenerbitanInput) tglPenerbitanInput.value = '27 Oktober 2026';
            if (keluargaInput) keluargaInput.value = '';
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
        const noInput = document.getElementById('badal-input-no');
        const petugasInput = document.getElementById('badal-input-petugas');
        const namaInput = document.getElementById('badal-input-nama-dibadalkan');
        const miqatInput = document.getElementById('badal-input-miqat');
        const tglPelaksanaanInput = document.getElementById('badal-input-tgl-pelaksanaan');
        const tempatPenerbitanInput = document.getElementById('badal-input-tempat-penerbitan');
        const tglPenerbitanInput = document.getElementById('badal-input-tgl-penerbitan');

        const prevNo = document.getElementById('badal-preview-cert-no');
        const prevPetugas = document.getElementById('badal-preview-petugas');
        const prevNama = document.getElementById('badal-preview-nama');
        const prevMiqat = document.getElementById('badal-preview-miqat');
        const prevPelaksanaan = document.getElementById('badal-preview-pelaksanaan');
        const prevTitimangsa = document.getElementById('badal-preview-titimangsa');

        const certNo = (noInput && noInput.value.trim()) ? noInput.value.trim() : 'SDW/BDL/2026/001';
        const petugas = (petugasInput && petugasInput.value.trim()) ? petugasInput.value.trim() : 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const nama = (namaInput && namaInput.value.trim()) ? namaInput.value.trim() : 'ALM. H. ABDULLAH BIN UMAR';
        const miqat = (miqatInput && miqatInput.value.trim()) ? miqatInput.value.trim() : "Masjid Aisyah Tan'im";
        const tglPelaksanaan = (tglPelaksanaanInput && tglPelaksanaanInput.value.trim()) ? tglPelaksanaanInput.value.trim() : '27 Oktober 2026';
        const tempatPenerbitan = (tempatPenerbitanInput && tempatPenerbitanInput.value.trim()) ? tempatPenerbitanInput.value.trim() : 'Makkah';
        const tglPenerbitan = (tglPenerbitanInput && tglPenerbitanInput.value.trim()) ? tglPenerbitanInput.value.trim() : tglPelaksanaan;

        if (prevNo) {
            prevNo.innerText = certNo.startsWith('No') ? certNo : `No: ${certNo}`;
        }

        if (prevPetugas) {
            prevPetugas.innerText = petugas;
        }

        if (prevNama) {
            prevNama.innerText = nama.toUpperCase();
            const calc = calculateBadalFontSize(nama, activeBadalNameFontSize);
            prevNama.style.fontSize = calc.style;
            prevNama.style.letterSpacing = nama.length > 22 ? '0.3px' : '0.6px';
        }

        if (prevMiqat) {
            prevMiqat.innerText = miqat;
        }

        if (prevPelaksanaan) {
            prevPelaksanaan.innerText = formatBadalDateIndo(tglPelaksanaan);
        }

        if (prevTitimangsa) {
            prevTitimangsa.innerText = `${tempatPenerbitan}, ${formatBadalDateIndo(tglPenerbitan)}`;
        }
    }

    function saveBadalCertificate() {
        const idInput = document.getElementById('badal-input-id');
        const noInput = document.getElementById('badal-input-no');
        const petugasInput = document.getElementById('badal-input-petugas');
        const namaInput = document.getElementById('badal-input-nama-dibadalkan');
        const miqatInput = document.getElementById('badal-input-miqat');
        const tglPelaksanaanInput = document.getElementById('badal-input-tgl-pelaksanaan');
        const tempatPenerbitanInput = document.getElementById('badal-input-tempat-penerbitan');
        const tglPenerbitanInput = document.getElementById('badal-input-tgl-penerbitan');
        const keluargaInput = document.getElementById('badal-input-keluarga');
        const statusSelect = document.getElementById('badal-input-status');

        const id = idInput ? idInput.value : '';
        const nomorSertifikat = noInput ? noInput.value.trim() : `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const namaPetugasBadal = petugasInput ? petugasInput.value.trim() : '';
        const namaYangDibadalkan = namaInput ? namaInput.value.trim() : '';
        const tempatMiqat = miqatInput ? miqatInput.value.trim() : "Masjid Aisyah Tan'im";
        const tanggalPelaksanaan = tglPelaksanaanInput ? tglPelaksanaanInput.value.trim() : '27 Oktober 2026';
        const tempatPenerbitan = tempatPenerbitanInput ? tempatPenerbitanInput.value.trim() : 'Makkah';
        const tanggalPenerbitan = tglPenerbitanInput ? tglPenerbitanInput.value.trim() : tanggalPelaksanaan;
        const keluargaPemesan = keluargaInput ? keluargaInput.value.trim() : '';
        const status = statusSelect ? statusSelect.value : 'ISSUED';

        if (!namaYangDibadalkan) {
            alert('Silakan masukkan nama yang dibadalkan (almarhum/almarhumah).');
            if (namaInput) namaInput.focus();
            return;
        }

        if (!namaPetugasBadal) {
            alert('Silakan masukkan nama petugas badal (muthawwif).');
            if (petugasInput) petugasInput.focus();
            return;
        }

        if (!keluargaPemesan) {
            alert('Silakan masukkan nama keluarga pemesan amanah badal.');
            if (keluargaInput) keluargaInput.focus();
            return;
        }

        const list = getBadalStore();
        const existingIdx = list.findIndex(b => b.id === id);

        const record = normalizeBadalRecord({
            id: id || `BDL-${String(list.length + 1).padStart(3, '0')}`,
            nomorSertifikat,
            namaPetugasBadal,
            namaYangDibadalkan,
            tempatMiqat,
            tanggalPelaksanaan,
            tempatPenerbitan,
            tanggalPenerbitan,
            keluargaPemesan,
            status,
            ukuranFontNama: activeBadalNameFontSize,
            catatan: `Amanah badal selesai secara syar'i di ${tempatMiqat}`,
            updatedAt: new Date().toISOString()
        });

        if (existingIdx >= 0) {
            list[existingIdx] = record;
        } else {
            list.push(record);
        }

        saveBadalStore(list);
        closeBadalModal();
        renderBadalCertificates();

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            SDW_API.post('saveBadalCertificate', record).catch(function(err) {
                console.warn('[SDW_BADAL] Sinkronisasi background ke cloud gagal/offline:', err);
            });
        }

        if (typeof admin.showToast === 'function') {
            admin.showToast(`Piagam Badal untuk "${namaYangDibadalkan}" berhasil disimpan & diterbitkan.`);
        }
    }

    // ==================== 3. CETAK FISIK A4 LANDSCAPE ====================
    function printBadalCertificate(id) {
        const list = getBadalStore();
        const item = list.find(b => b.id === id) || list[0] || {};

        const certNo = item.nomorSertifikat || `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const petugas = item.namaPetugasBadal || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const nama = (item.namaYangDibadalkan || 'Alm. H. Abdullah bin Umar').toUpperCase();
        const miqat = item.tempatMiqat || "Masjid Aisyah Tan'im";
        const tglPelaksanaan = item.tanggalPelaksanaan || '27 Oktober 2026';
        const tempatPenerbitan = item.tempatPenerbitan || 'Makkah';
        const tglPenerbitan = item.tanggalPenerbitan || tglPelaksanaan;

        const nameFontSize = item.ukuranFontNama || 'auto';
        let printFontSize = '36px';
        if (nameFontSize !== 'auto') {
            const val = parseFloat(nameFontSize);
            if (!isNaN(val)) printFontSize = Math.round(val * 9.5) + 'px';
        } else {
            const len = nama.length;
            if (len > 30) printFontSize = '28px';
            else if (len > 23) printFontSize = '34px';
            else if (len > 16) printFontSize = '38px';
            else printFontSize = '44px';
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
                <meta charset="UTF-8">
                <title>Cetak Piagam Badal Umroh - ${nama}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4 landscape; margin: 0; }
                    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; font-family: "Playfair Display", Georgia, serif; }
                    .cert-box { position: relative; width: 297mm; height: 210mm; overflow: hidden; }
                    .cert-bg { width: 100%; height: 100%; object-fit: cover; }
                    
                    .cert-no { position: absolute; top: 33.0%; left: 50%; transform: translate(-50%, -50%); font-family: monospace; font-size: 15px; font-weight: 700; color: #475569; letter-spacing: 0.5px; white-space: nowrap; }
                    .cert-petugas { position: absolute; top: 44.4%; left: 50%; transform: translate(-50%, -50%); width: 85%; text-align: center; font-family: "Playfair Display", Georgia, serif; font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; white-space: nowrap; }
                    .cert-nama { position: absolute; top: 53.5%; left: 50%; transform: translate(-50%, -50%); width: 90%; text-align: center; font-family: "Playfair Display", Georgia, serif; font-size: ${printFontSize}; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; }
                    .cert-miqat { position: absolute; top: 59.0%; left: 47.5%; transform: translateY(-50%); font-size: 16px; font-weight: 700; color: #0f172a; font-family: "Plus Jakarta Sans", sans-serif; white-space: nowrap; }
                    .cert-pelaksanaan { position: absolute; top: 62.5%; left: 47.5%; transform: translateY(-50%); font-size: 16px; font-weight: 700; color: #0f172a; font-family: "Plus Jakarta Sans", sans-serif; white-space: nowrap; }
                    .cert-titimangsa { position: absolute; top: 74.4%; left: 50%; transform: translate(-50%, -50%); font-size: 14px; font-weight: 600; color: #334155; font-family: "Plus Jakarta Sans", sans-serif; white-space: nowrap; }
                </style>
            </head>
            <body>
                <div class="cert-box">
                    <img src="${window.location.origin}/assets/certificate-badal-template.jpg" class="cert-bg">
                    <div class="cert-no">${certNo.startsWith('No') ? certNo : 'No: ' + certNo}</div>
                    <div class="cert-petugas">${petugas}</div>
                    <div class="cert-nama">${nama}</div>
                    <div class="cert-miqat">${miqat}</div>
                    <div class="cert-pelaksanaan">${formatBadalDateIndo(tglPelaksanaan)}</div>
                    <div class="cert-titimangsa">${tempatPenerbitan}, ${formatBadalDateIndo(tglPenerbitan)}</div>
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

        const certNo = item.nomorSertifikat || `SDW/BDL/2026/${String(id).replace(/\D/g, '').padStart(3, '0')}`;
        const petugas = item.namaPetugasBadal || 'Ustadz Ahmad Fauzi Ridwan, Lc.';
        const nama = (item.namaYangDibadalkan || 'Alm. H. Abdullah bin Umar').toUpperCase();
        const miqat = item.tempatMiqat || "Masjid Aisyah Tan'im";
        const tglPelaksanaan = item.tanggalPelaksanaan || '27 Oktober 2026';
        const tempatPenerbitan = item.tempatPenerbitan || 'Makkah';
        const tglPenerbitan = item.tanggalPenerbitan || tglPelaksanaan;

        // Load Background Template Resmi
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
            bgImg.onload = resolve;
            bgImg.onerror = () => resolve(null);
            bgImg.src = 'assets/certificate-badal-template.jpg';
        });

        if (typeof document !== 'undefined' && document.fonts) {
            try {
                await document.fonts.ready;
            } catch (e) {}
        }

        const canvas = document.createElement('canvas');
        const cw = 2048;
        const ch = 1446; // 1024 x 723 scaled 2x
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');

        if (bgImg && bgImg.width) {
            ctx.drawImage(bgImg, 0, 0, cw, ch);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, cw, ch);
        }

        // 1. Nomor Sertifikat (Di bawah teks BADAL UMROH)
        ctx.font = '700 28px monospace';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cleanNo = certNo.startsWith('No') ? certNo : `No: ${certNo}`;
        ctx.fillText(cleanNo, Math.round(cw * 0.5), Math.round(ch * 0.330));

        // 2. Nama Petugas Badal (Di bawah teks Yang bertanda tangan dibawah ini...)
        ctx.font = '800 42px "Playfair Display", Georgia, serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(petugas, Math.round(cw * 0.5), Math.round(ch * 0.444));

        // 3. Nama Yang Dibadalkan (Di bawah teks BADAL UMROH untuk :)
        let fontSizePx = 72;
        const nameFontSize = item.ukuranFontNama || 'auto';
        if (nameFontSize !== 'auto') {
            const val = parseFloat(nameFontSize);
            if (!isNaN(val)) fontSizePx = Math.round(val * 18);
        } else {
            const len = nama.length;
            if (len > 30) fontSizePx = 54;
            else if (len > 23) fontSizePx = 66;
            else if (len > 16) fontSizePx = 76;
            else fontSizePx = 86;
        }

        ctx.font = `900 ${fontSizePx}px "Playfair Display", Georgia, serif`;
        ctx.fillStyle = '#1e1b4b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nama, Math.round(cw * 0.5), Math.round(ch * 0.535));

        // 4. Tempat Miqat (Di samping Tempat Miqat :)
        ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(miqat, Math.round(cw * 0.475), Math.round(ch * 0.590));

        // 5. Pelaksanaan (Di samping Pelaksanaan :)
        ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatBadalDateIndo(tglPelaksanaan), Math.round(cw * 0.475), Math.round(ch * 0.625));

        // 6. Tempat & Tanggal Penerbitan (Di atas kolom tanda tangan)
        ctx.font = '600 27px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${tempatPenerbitan}, ${formatBadalDateIndo(tglPenerbitan)}`, Math.round(cw * 0.5), Math.round(ch * 0.744));

        const safeName = nama.replace(/[^a-zA-Z0-9]/g, '_');
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

        list.forEach(b => {
            if (b.status !== 'ISSUED') {
                b.status = 'ISSUED';
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
        const shareUrl = `${origin}/app?view=sertifikat&tab=badal&date=${encodeURIComponent(b.tanggalPelaksanaan)}`;

        let text = `*PIAGAM RESMI BADAL UMROH PT SDW MANDIRI UTAMA*\n`;
        text += `Nama Yang Dibadalkan: *${b.namaYangDibadalkan}*\n`;
        text += `Nomor Sertifikat: *${b.nomorSertifikat}*\n`;
        text += `Petugas Badal (Muthawwif): *${b.namaPetugasBadal}*\n`;
        text += `Tempat Miqat: *${b.tempatMiqat}*\n`;
        text += `Pelaksanaan: *${b.tanggalPelaksanaan}*\n`;
        text += `Tempat/Tanggal Penerbitan: *${b.tempatPenerbitan}, ${b.tanggalPenerbitan}*\n`;
        text += `Atas Amanah Dari: *${b.keluargaPemesan}*\n\n`;
        text += `Semoga Allah SWT mengabulkan umrohnya dan dijadikan umroh yang Mabrur, aamiin ya rabbal 'alamin.\n\n`;
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

        if (typeof SDW_API !== 'undefined' && typeof SDW_API.post === 'function') {
            SDW_API.post('deleteBadalCertificate', { id }).catch(function(err) {
                console.warn('[SDW_BADAL] Sinkronisasi delete cloud gagal/offline:', err);
            });
        }

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
    admin.calculateBadalFontSize = calculateBadalFontSize;
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
