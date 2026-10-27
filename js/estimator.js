/**
 * ====================================================================
 * SDW UMROH — FAMILY COST ESTIMATOR CONTROLLER
 * File: js/estimator.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_ESTIMATOR = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Base Price Reference per Package & Room Type
    const PRICING_MATRIX = {
        'PKG-000001': { baseQuad: 29500000, tripleAdd: 2000000, doubleAdd: 4500000 }, // Reguler
        'PKG-000002': { baseQuad: 43500000, tripleAdd: 3500000, doubleAdd: 7000000 }, // VIP
        'PKG-000003': { baseQuad: 38900000, tripleAdd: 2500000, doubleAdd: 5500000 }, // Plus Turki
        'PKG-000004': { baseQuad: 36500000, tripleAdd: 2500000, doubleAdd: 5000000 }, // Ramadhan
        'PKG-000005': { baseQuad: 26800000, tripleAdd: 1500000, doubleAdd: 3500000 }  // Hemat
    };

    const DP_PER_PAX = 10000000; // Rp 10 Juta DP per Jamaah
    const FAMILY_DISCOUNT_PER_PAX = 500000; // Diskon Rp 500rb/pax jika >= 4 jamaah

    let state = {
        packageId: 'PKG-000001',
        adults: 2,
        children: 0,
        roomType: 'QUAD' // 'QUAD', 'TRIPLE', 'DOUBLE'
    };

    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function initEstimator() {
        attachEventListeners();
        calculateAndRender();
    }

    function attachEventListeners() {
        const pkgSelect = document.getElementById('est-package-select');
        if (pkgSelect) {
            pkgSelect.addEventListener('change', (e) => {
                state.packageId = e.target.value;
                calculateAndRender();
            });
        }

        const roomButtons = document.querySelectorAll('.est-room-btn');
        roomButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                state.roomType = btn.getAttribute('data-room');
                roomButtons.forEach(b => {
                    b.classList.remove('bg-sdw-pine', 'text-white', 'shadow');
                    b.classList.add('bg-white', 'text-sdw-charcoal', 'border-sdw-border');
                });
                btn.classList.add('bg-sdw-pine', 'text-white', 'shadow');
                btn.classList.remove('bg-white', 'text-sdw-charcoal');
                calculateAndRender();
            });
        });
    }

    function adjustAdults(delta) {
        state.adults = Math.max(1, Math.min(10, state.adults + delta));
        const el = document.getElementById('est-adult-count');
        if (el) el.textContent = state.adults;
        calculateAndRender();
    }

    function adjustChildren(delta) {
        state.children = Math.max(0, Math.min(6, state.children + delta));
        const el = document.getElementById('est-child-count');
        if (el) el.textContent = state.children;
        calculateAndRender();
    }

    function calculateAndRender() {
        const matrix = PRICING_MATRIX[state.packageId] || PRICING_MATRIX['PKG-000001'];
        let pricePerPax = matrix.baseQuad;
        if (state.roomType === 'TRIPLE') pricePerPax += matrix.tripleAdd;
        if (state.roomType === 'DOUBLE') pricePerPax += matrix.doubleAdd;

        const totalPax = state.adults + state.children;
        // Anak mendapat diskon tiket/akomodasi 15% jika tanpa bed tambahan
        const adultTotal = state.adults * pricePerPax;
        const childTotal = state.children * (pricePerPax * 0.85);
        const subtotal = adultTotal + childTotal;

        const isFamilyDiscount = totalPax >= 4;
        const discountAmount = isFamilyDiscount ? (totalPax * FAMILY_DISCOUNT_PER_PAX) : 0;
        const finalTotal = Math.max(0, subtotal - discountAmount);

        const totalDP = totalPax * DP_PER_PAX;
        const pelunasan = Math.max(0, finalTotal - totalDP);

        // Update UI Elements
        const elPricePerPax = document.getElementById('est-price-per-pax');
        const elTotalPax = document.getElementById('est-total-pax');
        const elDiscountBox = document.getElementById('est-discount-box');
        const elDiscountAmount = document.getElementById('est-discount-amount');
        const elTotalAmount = document.getElementById('est-total-amount');
        const elDpAmount = document.getElementById('est-dp-amount');
        const elPelunasanAmount = document.getElementById('est-pelunasan-amount');

        if (elPricePerPax) elPricePerPax.textContent = formatRupiah(pricePerPax) + ' / pax';
        if (elTotalPax) elTotalPax.textContent = `${totalPax} Jamaah (${state.adults} Dewasa${state.children > 0 ? `, ${state.children} Anak` : ''})`;

        if (elDiscountBox && elDiscountAmount) {
            if (discountAmount > 0) {
                elDiscountBox.classList.remove('hidden');
                elDiscountAmount.textContent = `- ${formatRupiah(discountAmount)}`;
            } else {
                elDiscountBox.classList.add('hidden');
            }
        }

        if (elTotalAmount) elTotalAmount.textContent = formatRupiah(finalTotal);
        if (elDpAmount) elDpAmount.textContent = formatRupiah(totalDP);
        if (elPelunasanAmount) elPelunasanAmount.textContent = formatRupiah(pelunasan);

        // Update WhatsApp Konsultasi Estimasi Button
        const pkgName = (document.getElementById('est-package-select')?.selectedOptions[0]?.text) || 'Paket Umroh';
        const waText = encodeURIComponent(
            `Assalamualaikum CS SDW UMROH, saya ingin konsultasi rencana umroh:\n` +
            `• Paket: ${pkgName}\n` +
            `• Tipe Kamar: ${state.roomType}\n` +
            `• Jamaah: ${state.adults} Dewasa, ${state.children} Anak (Total ${totalPax} Pax)\n` +
            `• Estimasi Biaya: ${formatRupiah(finalTotal)}\n` +
            `• DP Booking: ${formatRupiah(totalDP)}\n` +
            `Mohon dibantu ketersediaan kloter dan pendaftarannya.`
        );

        const waNumber = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.contact && APP_CONFIG.contact.whatsapp) ? APP_CONFIG.contact.whatsapp : "6281234567890";
        const btnWa = document.getElementById('est-wa-btn');
        if (btnWa) {
            btnWa.href = `https://wa.me/${waNumber}?text=${waText}`;
        }
    }

    return {
        init: initEstimator,
        adjustAdults: adjustAdults,
        adjustChildren: adjustChildren,
        calculateAndRender: calculateAndRender
    };
});
