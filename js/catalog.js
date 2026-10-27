/**
 * ====================================================================
 * SDW UMROH — PUBLIC CATALOG & PACKAGE CONTROLLER
 * File: js/catalog.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_CATALOG = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    let currentFilter = 'ALL';
    let activePackage = null;

    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function initCatalog(containerId = 'katalog-package-grid') {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        renderPackageList(grid);
    }

    function setCategoryFilter(category, btnElement) {
        currentFilter = category;

        // Update Tab Button Styles
        const allButtons = document.querySelectorAll('.category-filter-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('bg-sdw-pine', 'text-white', 'shadow-md');
            btn.classList.add('bg-white', 'text-sdw-charcoal', 'hover:bg-sdw-sand', 'border-sdw-border');
        });

        if (btnElement) {
            btnElement.classList.add('bg-sdw-pine', 'text-white', 'shadow-md');
            btnElement.classList.remove('bg-white', 'text-sdw-charcoal', 'hover:bg-sdw-sand');
        }

        const grid = document.getElementById('katalog-package-grid');
        if (grid) renderPackageList(grid);
    }

    function renderPackageList(grid) {
        const packages = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.packages) ? MOCK_DATA.packages : [];
        const filtered = packages.filter(p => currentFilter === 'ALL' || p.package_type === currentFilter);

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-sdw-border p-8">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sdw-sand flex items-center justify-center text-sdw-pine text-2xl">
                        <i class="fa-solid fa-kaaba"></i>
                    </div>
                    <h3 class="font-bold text-lg text-sdw-pine mb-1">Paket Belum Tersedia</h3>
                    <p class="text-sm text-sdw-muted max-w-md mx-auto mb-5">Belum ada paket untuk kategori ini saat ini. Silakan hubungi konsultan kami untuk program kustom.</p>
                    <button type="button" onclick="SDW_CATALOG.setCategoryFilter('ALL', document.querySelector('[data-category=ALL]'))" class="px-5 py-2.5 rounded-xl bg-sdw-pine text-white text-xs font-bold hover:bg-sdw-pineLight transition">
                        Tampilkan Semua Paket
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(pkg => {
            const seatsBadge = pkg.seats_left > 0
                ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-400/30">
                     <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sisa ${pkg.seats_left} Seat
                   </span>`
                : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-800 border border-rose-400/30">
                     Kursi Penuh
                   </span>`;

            const waText = encodeURIComponent(`Assalamualaikum CS SDW UMROH, saya tertarik dengan ${pkg.name} (${pkg.discount_label || 'Promo'}). Mohon informasi ketersediaan seat terdekat.`);
            const waNumber = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.contact && APP_CONFIG.contact.whatsapp) ? APP_CONFIG.contact.whatsapp : "6281234567890";
            const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

            const originalPriceDisplay = pkg.original_price
                ? `<span class="text-xs text-slate-400 line-through font-semibold block leading-tight">${formatRupiah(pkg.original_price)}</span>`
                : '';

            return `
                <div class="bg-white rounded-3xl overflow-hidden border border-sdw-border shadow-soft hover:shadow-card transition-all duration-300 flex flex-col group">
                    <!-- Image Box (TicketPlan Hot Deals Style) -->
                    <div class="relative h-60 overflow-hidden bg-sdw-sand">
                        <img src="${pkg.image}" alt="${pkg.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                        
                        <!-- Top Badges: Promo Discount + Wishlist Button -->
                        <div class="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-md uppercase tracking-wider">
                                <i class="fa-solid fa-fire text-amber-300"></i> ${pkg.discount_label || 'Promo'}
                            </span>
                            <button type="button" onclick="event.stopPropagation(); this.classList.toggle('text-rose-500'); this.classList.toggle('text-white');" aria-label="Simpan Paket Favorit" class="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition border border-white/20 cursor-pointer">
                                <i class="fa-solid fa-heart text-xs"></i>
                            </button>
                        </div>

                        <!-- Bottom Image Info (Duration & Airline) -->
                        <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                            <span class="flex items-center gap-1.5 font-semibold bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                                <i class="fa-regular fa-clock text-sdw-gold"></i> ${pkg.duration_days} Hari
                            </span>
                            <span class="flex items-center gap-1.5 font-semibold bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
                                <i class="fa-solid fa-plane text-sdw-gold"></i> ${pkg.airline.split(' ')[0]}
                            </span>
                        </div>
                    </div>

                    <!-- Body Card -->
                    <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <span class="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-sdw-sand text-sdw-pine border border-sdw-border/80">
                                    ${pkg.package_type}
                                </span>
                                ${seatsBadge}
                            </div>
                            <h3 class="font-extrabold text-lg text-sdw-pine group-hover:text-sdw-emerald transition leading-snug line-clamp-2">
                                ${pkg.name}
                            </h3>
                            <p class="text-xs text-sdw-muted mt-2 leading-relaxed line-clamp-2">
                                ${pkg.description}
                            </p>
                        </div>

                        <!-- Hotel Highlights -->
                        <div class="pt-3 border-t border-sdw-border/80 space-y-2 text-xs text-sdw-charcoal">
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-hotel text-sdw-gold w-4 text-center"></i>
                                <span class="truncate">Makkah: <strong>${pkg.hotel_makkah}</strong></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="fa-solid fa-mosque text-sdw-gold w-4 text-center"></i>
                                <span class="truncate">Madinah: <strong>${pkg.hotel_madinah}</strong></span>
                            </div>
                        </div>

                        <!-- Price & Action (TicketPlan Hot Deals Style) -->
                        <div class="pt-4 border-t border-sdw-border/80 space-y-3">
                            <!-- Price & Detail Row -->
                            <div class="flex items-baseline justify-between gap-2">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xl sm:text-2xl font-black text-sdw-pine leading-tight">${formatRupiah(pkg.starting_price)}</span>
                                        ${originalPriceDisplay}
                                    </div>
                                    <span class="text-[10px] text-sdw-muted uppercase font-semibold block mt-0.5">Mulai dari / Jamaah (Kamar Quad)</span>
                                </div>
                                <button type="button" onclick="SDW_CATALOG.openPackageModal('${pkg.id}')" class="text-xs font-bold text-sdw-pine hover:text-sdw-pineLight underline underline-offset-4 transition cursor-pointer whitespace-nowrap">
                                    Lihat Detail &rarr;
                                </button>
                            </div>

                            <!-- Dedicated Full Width Action Pill (Matches TicketPlan Discover Now) -->
                            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 rounded-full bg-sdw-pine hover:bg-sdw-pineLight text-white text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group/btn whitespace-nowrap">
                                <i class="fa-brands fa-whatsapp text-base text-emerald-400 group-hover/btn:scale-110 transition"></i>
                                <span>Amankan Kursi Sekarang</span>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openPackageModal(packageId) {
        const packages = (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.packages) ? MOCK_DATA.packages : [];
        activePackage = packages.find(p => p.id === packageId) || packages[0];
        if (!activePackage) return;

        const modal = document.getElementById('package-detail-modal');
        if (!modal) return;

        document.getElementById('modal-pkg-title').textContent = activePackage.name;
        document.getElementById('modal-pkg-type').textContent = activePackage.package_type;
        document.getElementById('modal-pkg-price').textContent = formatRupiah(activePackage.starting_price);
        document.getElementById('modal-pkg-duration').textContent = `${activePackage.duration_days} Hari`;
        document.getElementById('modal-pkg-airline').textContent = activePackage.airline;
        document.getElementById('modal-pkg-makkah').textContent = activePackage.hotel_makkah;
        document.getElementById('modal-pkg-madinah').textContent = activePackage.hotel_madinah;
        document.getElementById('modal-pkg-desc').textContent = activePackage.description;
        document.getElementById('modal-pkg-image').src = activePackage.image;

        const waText = encodeURIComponent(`Assalamualaikum CS SDW UMROH, saya ingin mendaftar untuk paket ${activePackage.name}.`);
        const waNumber = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.contact && APP_CONFIG.contact.whatsapp) ? APP_CONFIG.contact.whatsapp : "6281234567890";
        document.getElementById('modal-pkg-wa-btn').href = `https://wa.me/${waNumber}?text=${waText}`;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function closePackageModal() {
        const modal = document.getElementById('package-detail-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }

    return {
        init: initCatalog,
        setCategoryFilter: setCategoryFilter,
        openPackageModal: openPackageModal,
        closePackageModal: closePackageModal,
        formatRupiah: formatRupiah
    };
});
