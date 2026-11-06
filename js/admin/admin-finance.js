/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: FINANCE, INVOICES & PAYMENTS
 * File: js/admin/admin-finance.js
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

    // 1. MUTASI: INPUT PEMBAYARAN BANK
    function handleCreatePayment(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const regSelect = document.getElementById('pay_reg_id');
        const termSelect = document.getElementById('pay_term');
        const amountInput = document.getElementById('pay_amount');
        const bankSelect = document.getElementById('pay_bank');
        const refInput = document.getElementById('pay_ref');

        if (!regSelect || !amountInput || !refInput) return;

        const regId = regSelect.value;
        const reg = admin.registrationsData.find(r => r.id === regId) || { customer: 'Jamaah Terdaftar', package: '-' };
        const amountNum = Number(amountInput.value) || 0;

        const newPayId = `PAY-SDW-00${admin.paymentsData.length + 1}`;
        const newPay = {
            id: newPayId,
            regId: regId,
            customer: reg.customer,
            amount: admin.formatRupiah(amountNum),
            method: bankSelect ? bankSelect.value.split('-')[0].trim() : 'Transfer Bank Syariah',
            ref: refInput.value.trim(),
            term: termSelect ? termSelect.value : 'Termin',
            status: 'PENDING_VERIFY'
        };

        admin.paymentsData.unshift(newPay);
        admin.persistStorage(admin.STORAGE_KEYS.PAYMENTS, admin.paymentsData);

        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('createPayment', newPay, 'DB_Payments', newPay.id);
        }
        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit('CREATE_PAYMENT', 'DB_Payments', newPay.id, `Bukti setor mutasi dicatat an ${newPay.customer} (${newPay.amount}) via ${newPay.method}. Menunggu validasi.`);
        }
        admin.showToast(`✅ Bukti setor ${newPay.id} berhasil dicatat! Menunggu validasi Finance.`);

        const form = document.getElementById('formCreatePayment');
        if (form) form.reset();

        admin.closeModal('modalCreatePayment');
        renderFinance();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();
    }

    function populatePaymentRegOptions() {
        if (typeof document === 'undefined') return;
        const select = document.getElementById('pay_reg_id');
        if (!select) return;

        select.innerHTML = admin.registrationsData.map(r => `
            <option value="${admin.escapeHtml(r.id)}">${admin.escapeHtml(r.id)} — ${admin.escapeHtml(r.customer)} (${admin.escapeHtml(r.package)})</option>
        `).join('');
    }

    // 2. CETAK KUITANSI RESMI
    function openReceiptModal(payId) {
        const pay = admin.paymentsData.find(p => p.id === payId);
        if (!pay) {
            admin.showToast('⚠️ Data pembayaran tidak ditemukan.');
            return;
        }

        const reg = admin.registrationsData.find(r => r.id === pay.regId) || {
            id: pay.regId || 'REG-SDW-2701',
            customer: pay.customer,
            package: 'Umroh Reguler Syawal Barakah 9H'
        };

        let displayCustomer = pay.customer;
        if (!displayCustomer || displayCustomer.startsWith('Jamaah (')) {
            if (reg.customer && !reg.customer.startsWith('Jamaah (')) {
                displayCustomer = reg.customer;
            }
        }

        const numVal = parseInt(pay.amount.replace(/[^0-9]/g, '')) || 15000000;
        const words = admin.numberToWords(numVal).trim() + " Rupiah";

        if (typeof document !== 'undefined') {
            const rNumber = document.getElementById('receiptNumber');
            const rDate = document.getElementById('receiptDate');
            const rCustomer = document.getElementById('receiptCustomer');
            const rRegId = document.getElementById('receiptRegId');
            const rAmountWords = document.getElementById('receiptAmountWords');
            const rPurpose = document.getElementById('receiptPurpose');
            const rMethodRef = document.getElementById('receiptMethodRef');
            const rRemaining = document.getElementById('receiptRemaining');
            const rAmountBox = document.getElementById('receiptAmountBox');

            const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            if (rNumber) rNumber.innerText = `KWT/SDW/${new Date().getFullYear()}/${pay.id.replace('PAY-SDW-', '')}`;
            if (rDate) rDate.innerText = todayFormatted;
            if (rCustomer) rCustomer.innerText = displayCustomer;
            if (rRegId) rRegId.innerText = reg.id;
            if (rAmountWords) rAmountWords.innerText = `"${words}"`;
            if (rPurpose) rPurpose.innerText = `Setoran Biaya Paket Umroh: ${reg.package} • Ref: ${pay.id}`;
            if (rMethodRef) rMethodRef.innerText = `${pay.method} • No. Ref: ${pay.ref}`;
            if (rRemaining) rRemaining.innerText = (pay.status === 'VERIFIED') ? 'Lunas / Sesuai Jadwal Termin Terlampir' : 'Menunggu Validasi Kasir';
            if (rAmountBox) rAmountBox.innerText = `${admin.formatRupiah(numVal)},-`;
        }

        admin.openModal('modalReceiptPrint');
    }

    // 3. RENDER KEUANGAN & PEMBAYARAN (FASE 2 FILTER)
    function renderFinance() {
        if (typeof document === 'undefined') return;
        const tbody = document.getElementById('finance-payments-tbody');
        if (!tbody) return;

        const filtered = admin.paymentsData.filter(p => {
            const query = (admin.financeFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (p.customer && p.customer.toLowerCase().includes(query)) ||
                (p.ref && p.ref.toLowerCase().includes(query)) ||
                (p.id && p.id.toLowerCase().includes(query)) ||
                (p.regId && p.regId.toLowerCase().includes(query));
            const matchStatus = (!admin.financeFilter.status || admin.financeFilter.status === 'ALL') || (p.status === admin.financeFilter.status);
            const matchMethod = (!admin.financeFilter.method || admin.financeFilter.method === 'ALL') || (p.method && p.method.toLowerCase().includes(admin.financeFilter.method.toLowerCase()));
            return matchSearch && matchStatus && matchMethod;
        });

        const badgeEl = document.getElementById('finance-count-badge');
        if (badgeEl) {
            badgeEl.innerText = `Menampilkan ${filtered.length} dari ${admin.paymentsData.length} transaksi`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-receipt text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada transaksi keuangan yang sesuai filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            const reg = (admin.registrationsData || []).find(r => r.id === p.regId) || {};
            let displayCustomer = p.customer;
            if (!displayCustomer || displayCustomer.startsWith('Jamaah (')) {
                if (reg.customer && !reg.customer.startsWith('Jamaah (')) {
                    displayCustomer = reg.customer;
                }
            }

            return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(p.id)}</td>
                <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-800">${admin.escapeHtml(displayCustomer)}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${admin.escapeHtml(p.regId)}</div>
                </td>
                <td class="py-3.5 px-4 font-black text-emerald-700 text-sm">${admin.escapeHtml(p.amount)}</td>
                <td class="py-3.5 px-4 text-slate-600">${admin.escapeHtml(p.method)}</td>
                <td class="py-3.5 px-4 font-mono text-slate-500">${admin.escapeHtml(p.ref)}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}">
                        ${admin.escapeHtml(p.status)}
                    </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                    ${p.status === 'PENDING_VERIFY' ? `
                        <button type="button" onclick="SDW_ADMIN.verifyPaymentAction('${p.id}')" class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer">
                            Validasi Mutasi
                        </button>
                    ` : `
                        <button type="button" onclick="SDW_ADMIN.openReceiptModal('${p.id}')" class="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] transition cursor-pointer">
                            <i class="fa-solid fa-print mr-1"></i> Cetak Kuitansi
                        </button>
                    `}
                </td>
            </tr>
            `;
        }).join('');
    }

    function applyFinanceFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('finance-filter-search');
        const statusSelect = document.getElementById('finance-filter-status');
        const methodSelect = document.getElementById('finance-filter-method');

        admin.financeFilter.search = (searchInput && searchInput.value) ? searchInput.value : '';
        admin.financeFilter.status = (statusSelect && statusSelect.value) ? statusSelect.value : 'ALL';
        admin.financeFilter.method = (methodSelect && methodSelect.value) ? methodSelect.value : 'ALL';

        renderFinance();
    }

    function resetFinanceFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('finance-filter-search');
        const statusSelect = document.getElementById('finance-filter-status');
        const methodSelect = document.getElementById('finance-filter-method');

        if (searchInput) searchInput.value = '';
        if (statusSelect) statusSelect.value = 'ALL';
        if (methodSelect) methodSelect.value = 'ALL';

        admin.financeFilter = { search: '', status: 'ALL', method: 'ALL' };
        renderFinance();
    }

    // 4. VERIFIKASI PEMBAYARAN BANK
    function verifyPaymentAction(payId) {
        const pay = admin.paymentsData.find(p => p.id === payId);
        if (!pay) return;

        pay.status = 'VERIFIED';
        admin.persistStorage(admin.STORAGE_KEYS.PAYMENTS, admin.paymentsData);

        // Jika pembayaran terhubung ke registrasi, otomatis update registrasi menjadi CONFIRMED & terbitkan E-Pass
        if (pay.regId && Array.isArray(admin.registrationsData)) {
            const reg = admin.registrationsData.find(r => r.id === pay.regId);
            if (reg) {
                reg.status = 'CONFIRMED';
                reg.payment = (reg.payment && reg.payment.includes('Menunggu')) 
                    ? reg.payment.replace('Menunggu DP', 'DP Lunas') 
                    : 'DP Lunas (Rp 5.000.000)';
                admin.persistStorage(admin.STORAGE_KEYS.REGS, admin.registrationsData);

                // Update pilgrim session lokal jika ada
                try {
                    if (typeof localStorage !== 'undefined') {
                        const sessRaw = localStorage.getItem('sdw_pilgrim_session');
                        if (sessRaw) {
                            const sess = JSON.parse(sessRaw);
                            if (sess && (sess.regId === reg.id || sess.fullName === reg.customer)) {
                                sess.status = 'CONFIRMED';
                                localStorage.setItem('sdw_pilgrim_session', JSON.stringify(sess));
                            }
                        }
                    }
                } catch (e) {}
            }
        }

        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('verifyPayment', { paymentId: payId, regId: pay.regId, status: 'VERIFIED' }, 'DB_Payments', payId);
        }

        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit('VERIFY_PAYMENT', 'DB_Payments', payId, `Mutasi rekening untuk pembayaran ${payId} (${pay.amount}) tervalidasi sah oleh Finance.`);
        }
        admin.showToast(`✅ Pembayaran ${payId} berhasil divalidasi! E-Pass jamaah aktif & kuitansi siap dicetak.`);
        renderFinance();
        if (typeof admin.renderRegistrations === 'function') admin.renderRegistrations();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();
    }

    // Attach to admin
    admin.handleCreatePayment = handleCreatePayment;
    admin.populatePaymentRegOptions = populatePaymentRegOptions;
    admin.openReceiptModal = openReceiptModal;
    admin.renderFinance = renderFinance;
    admin.applyFinanceFilter = applyFinanceFilter;
    admin.resetFinanceFilter = resetFinanceFilter;
    admin.verifyPaymentAction = verifyPaymentAction;

    return admin;
});
