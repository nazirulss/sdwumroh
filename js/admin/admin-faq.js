/**
 * ====================================================================
 * SDW UMROH — BACKOFFICE FAQ & HELPDESK MASTER CONTROLLER
 * File: js/admin/admin-faq.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['./admin-state'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./admin-state'));
    } else {
        root.SDW_ADMIN_FAQ = factory(root.SDW_ADMIN);
    }
})(typeof self !== 'undefined' ? self : this, function (adminState) {
    'use strict';

    const admin = adminState || window.SDW_ADMIN || {};

    // 1. DEFAULT SEED FAQS (6 Pertanyaan Populer)
    const DEFAULT_FAQS = [
        {
            id: 'FAQ-000001',
            category: 'DOKUMEN_PASPOR',
            question: 'Apa saja syarat dokumen paspor dan visa untuk mendaftar umroh?',
            answer: 'Syarat utama: 1) Paspor RI asli dengan masa berlaku minimal 7 bulan sebelum tanggal kepulangan dan nama minimal 2 suku kata. 2) Scan KTP & Kartu Keluarga asli. 3) Buku Nikah asli bagi suami-istri atau Akta Lahir anak. 4) Rekam biometrik melalui aplikasi resmi Saudi Visa Bio didampingi tim SDW.',
            icon: 'fa-passport',
            sort_order: 1,
            is_featured: true,
            status: 'PUBLISHED'
        },
        {
            id: 'FAQ-000002',
            category: 'PEMBAYARAN_BIAYA',
            question: 'Bagaimana sistem pembayaran dan keamanan dana jamaah?',
            answer: 'Pembayaran uang muka (DP) hanya sebesar Rp 5.000.000 / jamaah untuk mengunci seat maskapai dan kamar hotel. Seluruh transaksi wajib disalurkan melalui rekening escrow bank syariah atas nama PT Sahabat Dhuha Wisata (BSI & Bank Muamalat), bukan rekening perorangan. Pelunasan dapat dilakukan maksimal 30 hari sebelum keberangkatan.',
            icon: 'fa-money-check-dollar',
            sort_order: 2,
            is_featured: true,
            status: 'PUBLISHED'
        },
        {
            id: 'FAQ-000003',
            category: 'LANSIA_KESEHATAN',
            question: 'Apakah tersedia fasilitas kursi roda dan pendampingan khusus lansia?',
            answer: 'Ya, SDW UMROH menyediakan layanan prioritas bagi jamaah lansia. Kami menyediakan kursi roda lipat, pendampingan muthawwif khusus saat thawaf dan sa\'i di pelataran berbayar resmi Masjidil Haram, serta penataan kamar hotel yang dekat dengan lift.',
            icon: 'fa-wheelchair',
            sort_order: 3,
            is_featured: true,
            status: 'PUBLISHED'
        },
        {
            id: 'FAQ-000004',
            category: 'HOTEL_AKOMODASI',
            question: 'Berapa jarak hotel penginapan ke Masjidil Haram dan Masjid Nabawi?',
            answer: 'Untuk Paket VIP Khidmat, hotel Makkah berada langsung di pelataran Clock Tower (0 - 50 meter) seperti Swissotel / Pullman Zamzam. Untuk Paket Reguler, jarak hotel Makkah berkisar 250 - 350 meter. Di Madinah, seluruh paket menggunakan hotel di ring satu Masjid Nabawi (kurang dari 200 meter dari gerbang utama wanita dan pria).',
            icon: 'fa-hotel',
            sort_order: 4,
            is_featured: true,
            status: 'PUBLISHED'
        },
        {
            id: 'FAQ-000005',
            category: 'JADWAL_BATAL',
            question: 'Bagaimana ketentuan jika jamaah terpaksa reschedule atau membatalkan?',
            answer: 'SDW UMROH memiliki kebijakan reschedule fleksibel jika terdapat kendala medis (disertai surat dokter RS). Pemindahan kloter bebas biaya administrasi jika dilakukan minimal 35 hari sebelum tanggal terbang. Untuk pembatalan sepihak, pengembalian dana diatur transparan sesuai regulasi PPIU Kemenag RI.',
            icon: 'fa-calendar-xmark',
            sort_order: 5,
            is_featured: true,
            status: 'PUBLISHED'
        },
        {
            id: 'FAQ-000006',
            category: 'MANASIK_IBADAH',
            question: 'Berapa kali bimbingan manasik diadakan sebelum keberangkatan?',
            answer: 'Manasik diadakan 2 kali secara intensif: 1) Manasik Fiqih Ibadah & Teori di hotel berbintang, 2) Manasik Praktik Simulasi Tawaf & Sa\'i di asrama haji. Selain itu, ada sesi pemantapan briefing H-3 di Jakarta dan pemantapan kembali sebelum miqat di Tanah Suci.',
            icon: 'fa-kaaba',
            sort_order: 6,
            is_featured: true,
            status: 'PUBLISHED'
        }
    ];

    // 2. DEFAULT SEED HELPDESK CONTACTS (3 Saluran Resmi)
    const DEFAULT_CONTACTS = [
        {
            id: 'CS-000001',
            title: 'Hotline Konsultasi Umroh & Pendaftaran',
            channel: 'WHATSAPP',
            contact_number: '6281234567890',
            greeting_message: 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi paket umroh.',
            operating_hours: '24 Jam Non-Stop',
            is_primary: true,
            sort_order: 1,
            status: 'ACTIVE'
        },
        {
            id: 'CS-000002',
            title: 'Layanan Paspor & Verifikasi Visa Bio',
            channel: 'WHATSAPP',
            contact_number: '6281234567891',
            greeting_message: 'Assalamualaikum Admin Dokumen, mohon info verifikasi paspor & visa saya.',
            operating_hours: 'Senin - Jumat 08.00 - 17.00 WIB',
            is_primary: false,
            sort_order: 2,
            status: 'ACTIVE'
        },
        {
            id: 'CS-000003',
            title: 'Customer Care Kantor Pusat Jakarta',
            channel: 'PHONE',
            contact_number: '02178901234',
            greeting_message: 'Customer Service Telepon Kantor Pusat SDW UMROH',
            operating_hours: 'Senin - Sabtu 08.30 - 17.00 WIB',
            is_primary: false,
            sort_order: 3,
            status: 'ACTIVE'
        }
    ];

    let activeFaqSubtab = 'faq'; // 'faq' | 'helpdesk'
    let faqViewMode = 'table';
    let helpdeskViewMode = 'table';

    let faqFilter = {
        search: '',
        category: 'ALL',
        status: 'ALL'
    };

    let helpdeskFilter = {
        search: '',
        channel: 'ALL',
        status: 'ALL'
    };

    // Helpers: Storage management
    function getStoredFaq() {
        try {
            const raw = localStorage.getItem('sdw_admin_faq');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('[SDW_FAQ] Gagal membaca storage faq:', e);
        }
        return DEFAULT_FAQS.slice();
    }

    function saveStoredFaq(data) {
        try {
            localStorage.setItem('sdw_admin_faq', JSON.stringify(data));
            if (admin.state) admin.state.faqData = data;
        } catch (e) {
            console.error('[SDW_FAQ] Gagal menyimpan storage faq:', e);
        }
    }

    function getStoredContacts() {
        try {
            const raw = localStorage.getItem('sdw_admin_contacts');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('[SDW_FAQ] Gagal membaca storage contacts:', e);
        }
        return DEFAULT_CONTACTS.slice();
    }

    function saveStoredContacts(data) {
        try {
            localStorage.setItem('sdw_admin_contacts', JSON.stringify(data));
            if (admin.state) admin.state.contactsData = data;
        } catch (e) {
            console.error('[SDW_FAQ] Gagal menyimpan storage contacts:', e);
        }
    }

    // ==========================================
    // RENDER CONTROLLER UTAMA (tab-faq)
    // ==========================================
    function renderFaq() {
        const tabEl = document.getElementById('tab-faq');
        if (!tabEl) return;

        const btnSubtabFaq = document.getElementById('btnSubtabFaq');
        const btnSubtabHelpdesk = document.getElementById('btnSubtabHelpdesk');
        const secFaqList = document.getElementById('secFaqList');
        const secHelpdeskList = document.getElementById('secHelpdeskList');
        const btnAddNewFaq = document.getElementById('btnAddNewFaq');
        const btnAddNewContact = document.getElementById('btnAddNewContact');

        if (activeFaqSubtab === 'faq') {
            if (btnSubtabFaq) {
                btnSubtabFaq.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer';
            }
            if (btnSubtabHelpdesk) {
                btnSubtabHelpdesk.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
            }
            if (secFaqList) secFaqList.classList.remove('hidden');
            if (secHelpdeskList) secHelpdeskList.classList.add('hidden');
            if (btnAddNewFaq) btnAddNewFaq.classList.remove('hidden');
            if (btnAddNewContact) btnAddNewContact.classList.add('hidden');

            renderFaqList();
        } else {
            if (btnSubtabFaq) {
                btnSubtabFaq.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer';
            }
            if (btnSubtabHelpdesk) {
                btnSubtabHelpdesk.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-sdw-pine text-white shadow-xs transition cursor-pointer';
            }
            if (secFaqList) secFaqList.classList.add('hidden');
            if (secHelpdeskList) secHelpdeskList.classList.remove('hidden');
            if (btnAddNewFaq) btnAddNewFaq.classList.add('hidden');
            if (btnAddNewContact) btnAddNewContact.classList.remove('hidden');

            renderHelpdeskList();
        }
    }

    function switchFaqSubtab(subtab) {
        activeFaqSubtab = subtab;
        if (admin.state) admin.state.faqSubtab = subtab;
        renderFaq();
    }

    // ==========================================
    // SUBTAB 1: TANYA JAWAB FAQ
    // ==========================================
    function renderFaqList() {
        const allItems = getStoredFaq();

        // 1. KPI Stats
        const total = allItems.length;
        const docCount = allItems.filter(i => (i.category || '').toUpperCase() === 'DOKUMEN_PASPOR').length;
        const financeCount = allItems.filter(i => (i.category || '').toUpperCase() === 'PEMBAYARAN_BIAYA' || (i.category || '').toUpperCase() === 'HOTEL_AKOMODASI').length;
        const liveCount = allItems.filter(i => (i.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED').length;

        const kpiTotal = document.getElementById('kpiTotalFaq');
        const kpiDoc = document.getElementById('kpiDocFaq');
        const kpiFinance = document.getElementById('kpiFinanceFaq');
        const kpiLive = document.getElementById('kpiPublishedFaq');
        const badgeCount = document.getElementById('badgeFaqCount');

        if (kpiTotal) kpiTotal.innerText = total;
        if (kpiDoc) kpiDoc.innerText = docCount;
        if (kpiFinance) kpiFinance.innerText = financeCount;
        if (kpiLive) kpiLive.innerText = liveCount;
        if (badgeCount) badgeCount.innerText = `${liveCount} Live`;

        // 2. Filter logic
        const q = (faqFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (faqFilter.category !== 'ALL' && (item.category || '').toUpperCase() !== faqFilter.category) {
                return false;
            }
            if (faqFilter.status !== 'ALL' && (item.status || 'PUBLISHED').toUpperCase() !== faqFilter.status) {
                return false;
            }
            if (q) {
                const combined = `${item.question || ''} ${item.answer || ''} ${item.category || ''}`.toLowerCase();
                if (!combined.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => (Number(a.sort_order) || 99) - (Number(b.sort_order) || 99));

        const tableBody = document.getElementById('faqTableBody');
        const cardsGrid = document.getElementById('faqCardsGrid');
        const tableView = document.getElementById('faqTableView');
        const cardsView = document.getElementById('faqCardsView');
        const emptyState = document.getElementById('faqEmptyState');

        if (faqViewMode === 'table') {
            if (tableView) tableView.classList.remove('hidden');
            if (cardsView) cardsView.classList.add('hidden');
        } else {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
        }

        if (filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table View
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const isPublished = (item.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED';
                const statusBadge = isPublished
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1"><i class="fa-solid fa-circle-check"></i> Tayang</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Draft/Arsip</span>`;

                const featuredBadge = (item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE')
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1"><i class="fa-solid fa-star text-amber-500"></i> Sorotan</span>`
                    : `<span class="text-[10px] text-slate-400 font-medium">Biasa</span>`;

                const iconClass = item.icon || 'fa-circle-question';

                return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">
                        <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200">${item.id || 'FAQ'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-start gap-3 max-w-md">
                            <div class="w-7 h-7 rounded-lg bg-purple-50 text-sdw-pine flex items-center justify-center shrink-0 mt-0.5 text-xs">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <div>
                                <div class="font-extrabold text-slate-900 text-xs leading-snug">${item.question}</div>
                                <div class="text-[11px] text-slate-500 line-clamp-2 mt-1">${item.answer}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[10px]">${item.category || 'UMUM'}</span>
                    </td>
                    <td class="py-3 px-4 text-center font-bold text-slate-700">#${item.sort_order || 1}</td>
                    <td class="py-3 px-4 text-center">${featuredBadge}</td>
                    <td class="py-3 px-4 text-center">${statusBadge}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openFaqModal('${item.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-slate-100 transition cursor-pointer" title="Edit Pertanyaan">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteFaq('${item.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus / Arsipkan">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards View
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const isPublished = (item.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED';
                const iconClass = item.icon || 'fa-circle-question';

                return `
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-2.5">
                            <span class="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                                ${item.category || 'UMUM'}
                            </span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}">
                                ${isPublished ? 'Tayang' : 'Draft'}
                            </span>
                        </div>
                        <div class="flex items-start gap-3 mb-2.5">
                            <div class="w-8 h-8 rounded-xl bg-purple-50 text-sdw-pine flex items-center justify-center shrink-0 text-sm">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">${item.question}</h4>
                        </div>
                        <div class="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                            ${item.answer}
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span class="text-slate-400 text-[10px]">Urutan Prioritas: #${item.sort_order || 1}</span>
                        <div class="flex items-center gap-2">
                            <button type="button" onclick="SDW_ADMIN.openFaqModal('${item.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold text-sdw-pine bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteFaq('${item.id}')" class="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // ==========================================
    // SUBTAB 2: CHANNEL LAYANAN CS & HOTLINE
    // ==========================================
    function renderHelpdeskList() {
        const allItems = getStoredContacts();

        // 1. KPI Stats
        const total = allItems.length;
        const waCount = allItems.filter(i => (i.channel || 'WHATSAPP').toUpperCase() === 'WHATSAPP').length;
        const nonStopCount = allItems.filter(i => (i.operating_hours || '').includes('24')).length;
        const primary = allItems.find(i => i.is_primary === true || String(i.is_primary).toUpperCase() === 'TRUE') || allItems[0];

        const kpiTotal = document.getElementById('kpiTotalContacts');
        const kpiWa = document.getElementById('kpiWaContacts');
        const kpi24h = document.getElementById('kpi24hContacts');
        const kpiPrimary = document.getElementById('kpiPrimaryContactNumber');
        const bannerTitle = document.getElementById('primaryContactTitle');
        const bannerNumber = document.getElementById('primaryContactDisplay');

        if (kpiTotal) kpiTotal.innerText = total;
        if (kpiWa) kpiWa.innerText = waCount;
        if (kpi24h) kpi24h.innerText = nonStopCount;
        if (kpiPrimary && primary) kpiPrimary.innerText = `+${primary.contact_number}`;
        if (bannerTitle && primary) bannerTitle.innerText = primary.title;
        if (bannerNumber && primary) bannerNumber.innerText = `+${primary.contact_number} (${primary.operating_hours || '24 Jam'})`;

        // 2. Filter logic
        const q = (helpdeskFilter.search || '').toLowerCase().trim();
        const filtered = allItems.filter(item => {
            if (helpdeskFilter.channel !== 'ALL' && (item.channel || 'WHATSAPP').toUpperCase() !== helpdeskFilter.channel) {
                return false;
            }
            const isActive = (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
            if (helpdeskFilter.status === 'ACTIVE' && !isActive) return false;
            if (helpdeskFilter.status === 'INACTIVE' && isActive) return false;

            if (q) {
                const combined = `${item.title || ''} ${item.contact_number || ''} ${item.operating_hours || ''}`.toLowerCase();
                if (!combined.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => (Number(a.sort_order) || 99) - (Number(b.sort_order) || 99));

        const tableBody = document.getElementById('helpdeskTableBody');
        const cardsGrid = document.getElementById('helpdeskCardsGrid');
        const tableView = document.getElementById('helpdeskTableView');
        const cardsView = document.getElementById('helpdeskCardsView');
        const emptyState = document.getElementById('helpdeskEmptyState');

        if (helpdeskViewMode === 'table') {
            if (tableView) tableView.classList.remove('hidden');
            if (cardsView) cardsView.classList.add('hidden');
        } else {
            if (tableView) tableView.classList.add('hidden');
            if (cardsView) cardsView.classList.remove('hidden');
        }

        if (filtered.length === 0) {
            if (tableBody) tableBody.innerHTML = '';
            if (cardsGrid) cardsGrid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render Table View
        if (tableBody) {
            tableBody.innerHTML = filtered.map(item => {
                const isWa = (item.channel || 'WHATSAPP').toUpperCase() === 'WHATSAPP';
                const isPrimary = (item.is_primary === true || String(item.is_primary).toUpperCase() === 'TRUE');
                const isActive = (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

                const channelBadge = isWa
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1"><i class="fa-brands fa-whatsapp text-emerald-500"></i> WhatsApp</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1"><i class="fa-solid fa-phone text-blue-500"></i> Telepon</span>`;

                const primaryBadge = isPrimary
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1"><i class="fa-solid fa-crown text-amber-500"></i> Nomor Utama</span>`
                    : `<button type="button" onclick="SDW_ADMIN.setPrimaryHelpdeskContact('${item.id}')" class="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 hover:text-sdw-pine hover:bg-slate-100 border border-slate-200 cursor-pointer">Set Utama</button>`;

                const statusBadge = isActive
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200">Aktif</span>`
                    : `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Non-Aktif</span>`;

                return `
                <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs">
                    <td class="py-3 px-4 font-mono font-bold text-sdw-pine">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">${item.id || 'CS'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="font-extrabold text-slate-900 text-xs">${item.title}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Jam: ${item.operating_hours || '24 Jam'}</div>
                    </td>
                    <td class="py-3 px-4">${channelBadge}</td>
                    <td class="py-3 px-4 font-mono font-bold text-slate-800">
                        <div class="flex items-center gap-1.5">
                            <span>+${item.contact_number}</span>
                            ${isWa ? `<a href="https://wa.me/${item.contact_number}?text=${encodeURIComponent(item.greeting_message || '')}" target="_blank" class="text-emerald-600 hover:text-emerald-700" title="Tes WhatsApp Web"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>` : ''}
                        </div>
                    </td>
                    <td class="py-3 px-4">${primaryBadge}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button type="button" onclick="SDW_ADMIN.openHelpdeskModal('${item.id}')" class="p-1.5 rounded-lg text-slate-500 hover:text-sdw-pine hover:bg-slate-100 transition cursor-pointer" title="Edit Kontak CS">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteHelpdeskContact('${item.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" title="Hapus / Nonaktifkan">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Render Cards View
        if (cardsGrid) {
            cardsGrid.innerHTML = filtered.map(item => {
                const isWa = (item.channel || 'WHATSAPP').toUpperCase() === 'WHATSAPP';
                const isPrimary = (item.is_primary === true || String(item.is_primary).toUpperCase() === 'TRUE');
                const isActive = (item.status || 'ACTIVE').toUpperCase() === 'ACTIVE';

                return `
                <div class="bg-white rounded-2xl border ${isPrimary ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30' : 'border-slate-200 shadow-sm'} p-4 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isWa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}">
                                ${isWa ? 'WhatsApp' : 'Telepon'}
                            </span>
                            ${isPrimary ? '<span class="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">Utama (Live)</span>' : ''}
                        </div>
                        <h4 class="font-extrabold text-slate-900 text-sm mb-1">${item.title}</h4>
                        <div class="text-sm font-mono font-black text-sdw-pine mb-2">+${item.contact_number}</div>
                        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3 space-y-1">
                            <div><span class="font-semibold text-slate-500">Jam Operasional:</span> ${item.operating_hours || '24 Jam'}</div>
                            ${item.greeting_message ? `<div class="italic text-[11px] text-slate-500 line-clamp-2">"${item.greeting_message}"</div>` : ''}
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span class="text-slate-400 text-[10px]">Prioritas #${item.sort_order || 1}</span>
                        <div class="flex items-center gap-2">
                            ${!isPrimary ? `<button type="button" onclick="SDW_ADMIN.setPrimaryHelpdeskContact('${item.id}')" class="px-2 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition cursor-pointer">Jadikan Utama</button>` : ''}
                            <button type="button" onclick="SDW_ADMIN.openHelpdeskModal('${item.id}')" class="px-2.5 py-1 rounded-lg text-xs font-bold text-sdw-pine bg-purple-50 hover:bg-purple-100 transition cursor-pointer">
                                Edit
                            </button>
                            <button type="button" onclick="SDW_ADMIN.deleteHelpdeskContact('${item.id}')" class="px-2 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // View Modes
    function setFaqViewMode(mode) {
        faqViewMode = mode;
        const btnTable = document.getElementById('btnFaqViewTable');
        const btnCards = document.getElementById('btnFaqViewCards');
        if (mode === 'table') {
            if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            if (btnCards) btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
        } else {
            if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            if (btnCards) btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
        }
        renderFaqList();
    }

    function setHelpdeskViewMode(mode) {
        helpdeskViewMode = mode;
        const btnTable = document.getElementById('btnContactViewTable');
        const btnCards = document.getElementById('btnContactViewCards');
        if (mode === 'table') {
            if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
            if (btnCards) btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
        } else {
            if (btnTable) btnTable.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition';
            if (btnCards) btnCards.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-sdw-pine text-white shadow-xs transition';
        }
        renderHelpdeskList();
    }

    // Filters
    function applyFaqFilter(key, val) {
        faqFilter[key] = val;
        renderFaqList();
    }

    function applyContactFilter(key, val) {
        helpdeskFilter[key] = val;
        renderHelpdeskList();
    }

    // ==========================================
    // MODAL DIALOGS & CRUD ACTIONS: FAQ
    // ==========================================
    function openFaqModal(id) {
        const modal = document.getElementById('modalFaqEditor');
        if (!modal) return;

        const allItems = getStoredFaq();
        const item = id ? allItems.find(i => i.id === id) : null;
        const titleEl = document.getElementById('modalFaqTitle');

        if (item) {
            if (titleEl) titleEl.innerText = `Edit Pertanyaan FAQ: ${item.id}`;
            document.getElementById('faqModalId').value = item.id;
            document.getElementById('faqModalCategory').value = item.category || 'DOKUMEN_PASPOR';
            document.getElementById('faqModalQuestion').value = item.question || '';
            document.getElementById('faqModalAnswer').value = item.answer || '';
            document.getElementById('faqModalIcon').value = item.icon || 'fa-circle-question';
            document.getElementById('faqModalSortOrder').value = item.sort_order || 1;
            document.getElementById('faqModalIsFeatured').checked = (item.is_featured === true || String(item.is_featured).toUpperCase() === 'TRUE');
            document.getElementById('faqModalStatus').value = item.status || 'PUBLISHED';
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Pertanyaan FAQ Baru';
            document.getElementById('faqModalId').value = '';
            document.getElementById('faqModalCategory').value = 'DOKUMEN_PASPOR';
            document.getElementById('faqModalQuestion').value = '';
            document.getElementById('faqModalAnswer').value = '';
            document.getElementById('faqModalIcon').value = 'fa-circle-question';
            document.getElementById('faqModalSortOrder').value = allItems.length + 1;
            document.getElementById('faqModalIsFeatured').checked = false;
            document.getElementById('faqModalStatus').value = 'PUBLISHED';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    async function saveFaq(event) {
        if (event && event.preventDefault) event.preventDefault();

        const id = document.getElementById('faqModalId').value.trim();
        const category = document.getElementById('faqModalCategory').value;
        const question = document.getElementById('faqModalQuestion').value.trim();
        const answer = document.getElementById('faqModalAnswer').value.trim();
        const icon = document.getElementById('faqModalIcon').value.trim() || 'fa-circle-question';
        const sort_order = parseInt(document.getElementById('faqModalSortOrder').value, 10) || 1;
        const is_featured = document.getElementById('faqModalIsFeatured').checked;
        const status = document.getElementById('faqModalStatus').value;

        if (!question || !answer) {
            if (typeof admin.showToast === 'function') admin.showToast('Pertanyaan dan Jawaban wajib diisi!', 'error');
            return;
        }

        const allItems = getStoredFaq();
        let finalId = id;

        if (!finalId) {
            const nextNum = allItems.length + 1;
            finalId = 'FAQ-' + String(nextNum).padStart(6, '0');
        }

        const payload = {
            id: finalId,
            category: category,
            question: question,
            answer: answer,
            icon: icon,
            sort_order: sort_order,
            is_featured: is_featured,
            status: status
        };

        const existingIdx = allItems.findIndex(i => i.id === finalId);
        if (existingIdx !== -1) {
            allItems[existingIdx] = { ...allItems[existingIdx], ...payload };
        } else {
            allItems.push(payload);
        }

        saveStoredFaq(allItems);

        if (typeof admin.closeModal === 'function') admin.closeModal('modalFaqEditor');
        renderFaqList();

        if (typeof admin.showToast === 'function') admin.showToast('Pertanyaan FAQ berhasil disimpan!', 'success');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveFaq', payload, 'DB_Faq');
            }
        } catch (err) {
            console.warn('[SDW_FAQ] Cloud mutation saveFaq skipped:', err);
        }
    }

    async function deleteFaq(id) {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin mengarsipkan pertanyaan FAQ ini?')) return;

        const allItems = getStoredFaq();
        const updated = allItems.map(i => i.id === id ? { ...i, status: 'ARCHIVED' } : i);
        saveStoredFaq(updated);
        renderFaqList();

        if (typeof admin.showToast === 'function') admin.showToast('FAQ berhasil diarsipkan.', 'info');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('deleteFaq', { id: id }, 'DB_Faq');
            }
        } catch (err) {
            console.warn('[SDW_FAQ] Cloud mutation deleteFaq skipped:', err);
        }
    }

    // ==========================================
    // MODAL DIALOGS & CRUD ACTIONS: HELPDESK
    // ==========================================
    function openHelpdeskModal(id) {
        const modal = document.getElementById('modalHelpdeskEditor');
        if (!modal) return;

        const allItems = getStoredContacts();
        const item = id ? allItems.find(i => i.id === id) : null;
        const titleEl = document.getElementById('modalHelpdeskTitle');

        if (item) {
            if (titleEl) titleEl.innerText = `Edit Kontak Layanan: ${item.title}`;
            document.getElementById('contactModalId').value = item.id;
            document.getElementById('contactModalTitle').value = item.title || '';
            document.getElementById('contactModalChannel').value = item.channel || 'WHATSAPP';
            document.getElementById('contactModalNumber').value = item.contact_number || '';
            document.getElementById('contactModalGreeting').value = item.greeting_message || '';
            document.getElementById('contactModalHours').value = item.operating_hours || '24 Jam Non-Stop';
            document.getElementById('contactModalIsPrimary').checked = (item.is_primary === true || String(item.is_primary).toUpperCase() === 'TRUE');
            document.getElementById('contactModalSortOrder').value = item.sort_order || 1;
            document.getElementById('contactModalStatus').value = item.status || 'ACTIVE';
        } else {
            if (titleEl) titleEl.innerText = 'Tambah Saluran Bantuan CS Baru';
            document.getElementById('contactModalId').value = '';
            document.getElementById('contactModalTitle').value = '';
            document.getElementById('contactModalChannel').value = 'WHATSAPP';
            document.getElementById('contactModalNumber').value = '628';
            document.getElementById('contactModalGreeting').value = 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi paket umroh.';
            document.getElementById('contactModalHours').value = '24 Jam Non-Stop';
            document.getElementById('contactModalIsPrimary').checked = false;
            document.getElementById('contactModalSortOrder').value = allItems.length + 1;
            document.getElementById('contactModalStatus').value = 'ACTIVE';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    async function saveHelpdeskContact(event) {
        if (event && event.preventDefault) event.preventDefault();

        const id = document.getElementById('contactModalId').value.trim();
        const title = document.getElementById('contactModalTitle').value.trim();
        const channel = document.getElementById('contactModalChannel').value;
        const contact_number = document.getElementById('contactModalNumber').value.trim().replace(/[^0-9]/g, '');
        const greeting_message = document.getElementById('contactModalGreeting').value.trim();
        const operating_hours = document.getElementById('contactModalHours').value.trim() || '24 Jam';
        const is_primary = document.getElementById('contactModalIsPrimary').checked;
        const sort_order = parseInt(document.getElementById('contactModalSortOrder').value, 10) || 1;
        const status = document.getElementById('contactModalStatus').value;

        if (!title || !contact_number) {
            if (typeof admin.showToast === 'function') admin.showToast('Nama Layanan dan Nomor Kontak wajib diisi!', 'error');
            return;
        }

        const allItems = getStoredContacts();
        let finalId = id;

        if (!finalId) {
            const nextNum = allItems.length + 1;
            finalId = 'CS-' + String(nextNum).padStart(6, '0');
        }

        // If primary, reset other items
        if (is_primary) {
            allItems.forEach(i => {
                if (i.id !== finalId) i.is_primary = false;
            });
        }

        const payload = {
            id: finalId,
            title: title,
            channel: channel,
            contact_number: contact_number,
            greeting_message: greeting_message,
            operating_hours: operating_hours,
            is_primary: is_primary,
            sort_order: sort_order,
            status: status
        };

        const existingIdx = allItems.findIndex(i => i.id === finalId);
        if (existingIdx !== -1) {
            allItems[existingIdx] = { ...allItems[existingIdx], ...payload };
        } else {
            allItems.push(payload);
        }

        saveStoredContacts(allItems);

        if (typeof admin.closeModal === 'function') admin.closeModal('modalHelpdeskEditor');
        renderHelpdeskList();

        if (typeof admin.showToast === 'function') admin.showToast(`Kontak ${title} berhasil disimpan!`, 'success');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveHelpdeskContact', payload, 'DB_Helpdesk_Contacts');
            }
        } catch (err) {
            console.warn('[SDW_FAQ] Cloud mutation saveHelpdeskContact skipped:', err);
        }
    }

    async function setPrimaryHelpdeskContact(id) {
        if (!id) return;
        const allItems = getStoredContacts();
        let chosenTitle = '';

        const updated = allItems.map(i => {
            const isTarget = i.id === id;
            if (isTarget) chosenTitle = i.title;
            return { ...i, is_primary: isTarget };
        });

        saveStoredContacts(updated);
        renderHelpdeskList();

        if (typeof admin.showToast === 'function') admin.showToast(`Nomor utama diubah ke: ${chosenTitle}`, 'success');

        try {
            const target = updated.find(i => i.id === id);
            if (target && typeof admin.executeMutation === 'function') {
                await admin.executeMutation('saveHelpdeskContact', target, 'DB_Helpdesk_Contacts');
            }
        } catch (err) {
            console.warn('[SDW_FAQ] Cloud mutation setPrimary skipped:', err);
        }
    }

    async function deleteHelpdeskContact(id) {
        if (!id) return;
        if (!confirm('Apakah Anda yakin ingin menonaktifkan kontak ini?')) return;

        const allItems = getStoredContacts();
        const updated = allItems.map(i => i.id === id ? { ...i, status: 'INACTIVE', is_primary: false } : i);
        saveStoredContacts(updated);
        renderHelpdeskList();

        if (typeof admin.showToast === 'function') admin.showToast('Kontak CS dinonaktifkan.', 'info');

        try {
            if (typeof admin.executeMutation === 'function') {
                await admin.executeMutation('deleteHelpdeskContact', { id: id }, 'DB_Helpdesk_Contacts');
            }
        } catch (err) {
            console.warn('[SDW_FAQ] Cloud mutation deleteHelpdeskContact skipped:', err);
        }
    }

    // ==========================================
    // CLOUD SYNC & REHYDRATION
    // ==========================================
    async function syncFaqFromCloud() {
        const syncUrl = 'https://script.google.com/macros/s/AKfycby_fIi0G6ebEUfHvdn8mM24d2hnELe-nU495Cm3JUrYjMSHpIzchMcP2elJzQjlCEs-/exec';

        if (typeof admin.showToast === 'function') admin.showToast('🔄 Memulai sinkronisasi Master FAQ & Layanan CS...', 'info');

        try {
            // 1. Fetch FAQ
            const resF = await fetch(syncUrl + '?action=getFaq');
            if (resF.ok) {
                const dataF = await resF.json();
                if (dataF && dataF.success && Array.isArray(dataF.data) && dataF.data.length > 0) {
                    saveStoredFaq(dataF.data);
                }
            }

            // 2. Fetch Contacts
            const resC = await fetch(syncUrl + '?action=getHelpdeskContacts');
            if (resC.ok) {
                const dataC = await resC.json();
                if (dataC && dataC.success && Array.isArray(dataC.data) && dataC.data.length > 0) {
                    saveStoredContacts(dataC.data);
                }
            }

            renderFaq();
            if (typeof admin.showToast === 'function') admin.showToast('✅ Sinkronisasi Master FAQ & Layanan CS berhasil!', 'success');
        } catch (err) {
            console.error('[SDW_FAQ] Sync failed:', err);
            if (typeof admin.showToast === 'function') admin.showToast('Gagal terhubung ke cloud spreadsheet. Data lokal dipertahankan.', 'warning');
        }
    }

    function getPrimaryWhatsAppContact() {
        const contacts = getStoredContacts().filter(c => (c.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
        const primary = contacts.find(c => c.is_primary === true || String(c.is_primary).toUpperCase() === 'TRUE') || contacts[0];
        return primary || DEFAULT_CONTACTS[0];
    }

    // Exports
    admin.renderFaq = renderFaq;
    admin.switchFaqSubtab = switchFaqSubtab;
    admin.renderFaqList = renderFaqList;
    admin.renderHelpdeskList = renderHelpdeskList;
    admin.setFaqViewMode = setFaqViewMode;
    admin.setHelpdeskViewMode = setHelpdeskViewMode;
    admin.applyFaqFilter = applyFaqFilter;
    admin.applyContactFilter = applyContactFilter;
    admin.openFaqModal = openFaqModal;
    admin.saveFaq = saveFaq;
    admin.deleteFaq = deleteFaq;
    admin.openHelpdeskModal = openHelpdeskModal;
    admin.saveHelpdeskContact = saveHelpdeskContact;
    admin.setPrimaryHelpdeskContact = setPrimaryHelpdeskContact;
    admin.deleteHelpdeskContact = deleteHelpdeskContact;
    admin.syncFaqFromCloud = syncFaqFromCloud;
    admin.getPrimaryWhatsAppContact = getPrimaryWhatsAppContact;

    return {
        getStoredFaq,
        getStoredContacts,
        renderFaq,
        switchFaqSubtab,
        openFaqModal,
        openHelpdeskModal,
        syncFaqFromCloud,
        getPrimaryWhatsAppContact
    };
});

