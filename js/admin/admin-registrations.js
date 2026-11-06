/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: REGISTRATIONS & PRIVACY CONTROLLER
 * File: js/admin/admin-registrations.js
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

    // 1. MUTASI: BOOKING KURSI & REGISTRASI BARU
    function handleCreateRegistration(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (typeof document === 'undefined') return;

        const customerInput = document.getElementById('reg_customer');
        const nikInput = document.getElementById('reg_nik');
        const phoneInput = document.getElementById('reg_phone');
        const packageInput = document.getElementById('reg_package');
        const departureInput = document.getElementById('reg_departure');
        const priceInput = document.getElementById('reg_price');
        const discountInput = document.getElementById('reg_discount');
        const dpInput = document.getElementById('reg_dp');

        if (!customerInput || !nikInput) return;

        const price = Number(priceInput ? priceInput.value : 34500000) || 34500000;
        const discount = Number(discountInput ? discountInput.value : 1000000) || 0;
        const dp = Number(dpInput ? dpInput.value : 15000000) || 15000000;
        const finalPrice = Math.max(0, price - discount);

        const newRegId = `REG-SDW-${2701 + admin.registrationsData.length}`;
        const paymentLabel = `Rp ${(dp / 1000000).toFixed(0)}jt / ${(finalPrice / 1000000).toFixed(1)}jt`;

        const newReg = {
            id: newRegId,
            customer: customerInput.value.trim(),
            nik: nikInput.value.trim(),
            phone: phoneInput ? phoneInput.value.trim() : '',
            package: packageInput ? packageInput.value : 'Umroh Reguler 9H',
            departure: departureInput ? departureInput.value : '15 Jan 2027',
            status: 'CONFIRMED',
            docs: '1/4',
            payment: paymentLabel,
            priceSnapshot: finalPrice,
            dpAmount: dp
        };

        admin.registrationsData.unshift(newReg);
        admin.persistStorage(admin.STORAGE_KEYS.REGS, admin.registrationsData);
        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('registerPilgrim', newReg, 'DB_Registrations', newReg.id);
        }

        // Otomatis buat entri pembayaran DP tervalidasi
        const newPayId = `PAY-SDW-00${admin.paymentsData.length + 1}`;
        const newPayment = {
            id: newPayId,
            regId: newReg.id,
            customer: newReg.customer,
            amount: admin.formatRupiah(dp),
            method: 'Transfer Bank Syariah (BSI)',
            ref: 'BSI-TX' + Math.floor(100000 + Math.random() * 900000),
            status: 'VERIFIED'
        };
        admin.paymentsData.unshift(newPayment);
        admin.persistStorage(admin.STORAGE_KEYS.PAYMENTS, admin.paymentsData);
        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('createPayment', newPayment, 'DB_Payments', newPayment.id);
        }

        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit('CREATE_REGISTRATION', 'DB_Registrations', newReg.id, `Registrasi baru diterbitkan untuk ${newReg.customer}. Price snapshot: ${admin.formatRupiah(finalPrice)}, DP: ${admin.formatRupiah(dp)}.`);
        }
        admin.showToast(`✅ Pendaftaran ${newReg.id} (${newReg.customer}) berhasil diterbitkan!`);

        const form = document.getElementById('formCreateRegistration');
        if (form) form.reset();

        admin.closeModal('modalCreateRegistration');
        renderRegistrations();
        if (typeof admin.renderFinance === 'function') admin.renderFinance();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();
    }

    // 2. PRIVASI & MASKING NIK
    function formatMaskedNIK(nik, regId) {
        if (!nik || nik === '-') return '<span class="text-slate-400 font-sans italic">Belum diinput</span>';
        const isUnmasked = admin.unmaskedRecords.has(regId);
        if (isUnmasked) {
            return `<span class="text-emerald-700 font-bold font-mono">${admin.escapeHtml(nik)}</span>
                <button type="button" onclick="SDW_ADMIN.toggleUnmaskNIK('${regId}')" class="ml-1 text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer" title="Sembunyikan NIK">
                    <i class="fa-solid fa-eye-slash"></i>
                </button>`;
        } else {
            const masked = nik.length >= 8 ? (nik.slice(0, 4) + '••••••••' + nik.slice(-4)) : '3276••••••••0001';
            return `<span class="text-slate-600 font-mono">${masked}</span>
                <button type="button" onclick="SDW_ADMIN.toggleUnmaskNIK('${regId}')" class="ml-1 text-slate-400 hover:text-sdw-pine transition p-0.5 cursor-pointer" title="Buka Masking NIK (Hanya Staf Berwenang)">
                    <i class="fa-solid fa-eye"></i>
                </button>`;
        }
    }

    function toggleUnmaskNIK(regId) {
        const authorizedRoles = ['ADMIN', 'FINANCE', 'MANAGER', 'OWNER'];
        if (!authorizedRoles.includes(admin.currentRole)) {
            admin.showToast('⚠️ Akses ditolak: Hanya Staf Admin/Finance/Manager yang berwenang membuka NIK.');
            if (typeof admin.logAdminAudit === 'function') {
                admin.logAdminAudit('UNAUTHORIZED_UNMASK_ATTEMPT', 'DB_Registrations', regId, `Percobaan akses buka masking data sensitif NIK ditolak untuk role ${admin.currentRole}.`, 'WARNING');
            }
            if (typeof admin.renderAuditLogs === 'function') admin.renderAuditLogs();
            return;
        }

        if (admin.unmaskedRecords.has(regId)) {
            admin.unmaskedRecords.delete(regId);
            admin.showToast(`🔒 NIK ${regId} kembali disensor.`);
        } else {
            admin.unmaskedRecords.add(regId);
            admin.showToast(`👁️ NIK ${regId} dibuka untuk verifikasi paspor.`);
            if (typeof admin.logAdminAudit === 'function') {
                admin.logAdminAudit('UNMASK_SENSITIVE_DATA', 'DB_Registrations', regId, `Staf ${admin.currentRole} membuka enkripsi/masking NIK jamaah demi verifikasi paspor & Siskopatuh Kemenag.`, 'CRITICAL');
            }
            if (typeof admin.enqueueMutation === 'function') {
                admin.enqueueMutation('unmaskSensitiveData', { regId: regId, role: admin.currentRole, timestamp: new Date().toISOString() }, 'DB_Audit_Logs', regId);
            }
            if (typeof admin.renderAuditLogs === 'function') admin.renderAuditLogs();
        }
        renderRegistrations();
    }

    // 3. RENDER REGISTRASI & BOOKING (FASE 2 FILTER)
    function renderRegistrations() {
        if (typeof document === 'undefined') return;
        const tbody = document.getElementById('registrations-table-tbody');
        if (!tbody) return;

        const filtered = admin.registrationsData.filter(r => {
            const query = (admin.regsFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (r.customer && r.customer.toLowerCase().includes(query)) ||
                (r.id && r.id.toLowerCase().includes(query)) ||
                (r.nik && r.nik.includes(query));
            const matchPackage = (!admin.regsFilter.package || admin.regsFilter.package === 'ALL') || (r.package && r.package.toLowerCase().includes(admin.regsFilter.package.toLowerCase()));
            const matchStatus = (!admin.regsFilter.status || admin.regsFilter.status === 'ALL') || (r.status === admin.regsFilter.status);
            return matchSearch && matchPackage && matchStatus;
        });

        const badgeEl = document.getElementById('regs-count-badge');
        if (badgeEl) {
            badgeEl.innerText = `Menampilkan ${filtered.length} dari ${admin.registrationsData.length} jamaah`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-id-card-clip text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada registrasi yang sesuai kriteria filter.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(r => `
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3.5 px-4 font-mono font-bold text-sdw-pine">${admin.escapeHtml(r.id)}</td>
                <td class="py-3.5 px-4 font-bold text-slate-800">
                    <div class="text-slate-900">${admin.escapeHtml(r.customer)}</div>
                    <div class="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 font-normal">
                        <span>NIK:</span>
                        ${formatMaskedNIK(r.nik, r.id)}
                    </div>
                </td>
                <td class="py-3.5 px-4 text-slate-700 font-medium">${admin.escapeHtml(r.package)}</td>
                <td class="py-3.5 px-4 text-slate-600">${admin.escapeHtml(r.departure)}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${admin.getStatusBadgeClass(r.status)}">${admin.escapeHtml(r.status)}</span>
                </td>
                <td class="py-3.5 px-4 font-bold text-slate-700">
                    <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px]">${admin.escapeHtml(r.docs)} Lengkap</span>
                </td>
                <td class="py-3.5 px-4 font-black text-sdw-pine">${admin.escapeHtml(r.payment)}</td>
                <td class="py-3.5 px-4 text-right space-x-1">
                    ${(r.status === 'PENDING_DP' || r.status === 'PENDING') ? `
                        <button type="button" onclick="SDW_ADMIN.confirmRegistrationDP('${r.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs mr-1" title="Konfirmasi DP &amp; Terbitkan E-Pass">
                            <i class="fa-solid fa-circle-check mr-1"></i> Validasi DP
                        </button>
                    ` : ''}
                    <button type="button" onclick="SDW_ADMIN.openDrawer('REG', '${r.id}')" class="px-3 py-1 rounded-lg bg-sdw-pine hover:bg-purple-900 text-white font-bold text-[11px] transition cursor-pointer shadow-xs">
                        Review Pendaftaran
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 4. KONFIRMASI PEMBAYARAN DP & TERBITKAN E-PASS RESMI
    function confirmRegistrationDP(regId) {
        if (!regId) return;
        const r = admin.registrationsData.find(item => item.id === regId);
        if (!r) {
            admin.showToast('⚠️ Data registrasi tidak ditemukan: ' + regId);
            return;
        }

        const confirmMsg = `Konfirmasi pembayaran DP untuk ${r.customer} (${r.id})?\n\n` +
            `• Paket: ${r.package}\n` +
            `• Status akan berubah menjadi: CONFIRMED\n` +
            `• E-PASS Digital jamaah akan aktif secara otomatis.`;
            
        if (typeof confirm === 'function' && !confirm(confirmMsg)) {
            return;
        }

        // A. Mutasi State Registrasi
        r.status = 'CONFIRMED';
        r.payment = (r.payment && r.payment.includes('Menunggu')) 
            ? r.payment.replace('Menunggu DP', 'DP Lunas') 
            : 'DP Lunas (Rp 5.000.000)';
        admin.persistStorage(admin.STORAGE_KEYS.REGS, admin.registrationsData);

        // B. Mutasi Keuangan / Payments
        let pay = admin.paymentsData.find(p => p.regId === regId);
        if (pay) {
            pay.status = 'VERIFIED';
            pay.term = 'DP Terverifikasi';
        } else {
            const newPayId = `PAY-SDW-00${admin.paymentsData.length + 1}`;
            pay = {
                id: newPayId,
                regId: regId,
                customer: r.customer,
                amount: admin.formatRupiah(r.dpAmount || 5000000),
                method: 'Transfer Bank Syariah (BSI)',
                ref: 'BSI-TX' + Math.floor(100000 + Math.random() * 900000),
                term: 'DP Booking',
                status: 'VERIFIED'
            };
            admin.paymentsData.unshift(pay);
        }
        admin.persistStorage(admin.STORAGE_KEYS.PAYMENTS, admin.paymentsData);

        // C. Update sesi jamaah jika berada pada browser yang sama (PWA Live Sync)
        try {
            if (typeof localStorage !== 'undefined') {
                const pilgrimSessionRaw = localStorage.getItem('sdw_pilgrim_session');
                if (pilgrimSessionRaw) {
                    const pilgrimSession = JSON.parse(pilgrimSessionRaw);
                    if (pilgrimSession && (pilgrimSession.regId === regId || pilgrimSession.fullName === r.customer)) {
                        pilgrimSession.status = 'CONFIRMED';
                        localStorage.setItem('sdw_pilgrim_session', JSON.stringify(pilgrimSession));
                    }
                }
            }
        } catch (e) {
            console.warn('[SDW_ADMIN] Gagal sync pilgrim session lokal:', e);
        }

        // D. Antrean Mutasi Offline-First / Kirim ke Apps Script & Google Spreadsheet
        if (typeof admin.enqueueMutation === 'function') {
            admin.enqueueMutation('confirmRegistration', {
                regId: regId,
                status: 'CONFIRMED',
                dpAmount: r.dpAmount || 5000000,
                customer: r.customer,
                paymentId: pay.id
            }, 'DB_Registrations', regId);
        }

        // E. Audit Log
        if (typeof admin.logAdminAudit === 'function') {
            admin.logAdminAudit(
                'CONFIRM_REGISTRATION',
                'DB_Registrations',
                regId,
                `Pembayaran DP jamaah ${r.customer} (${regId}) telah diverifikasi sah oleh ${admin.currentRole}. E-PASS resmi diterbitkan.`,
                'SUCCESS'
            );
        }

        admin.showToast(`✅ Booking ${r.id} (${r.customer}) berhasil diverifikasi! E-PASS aktif.`);

        // Re-render tampilan
        renderRegistrations();
        if (typeof admin.renderFinance === 'function') admin.renderFinance();
        if (typeof admin.renderDashboard === 'function') admin.renderDashboard();

        // Refresh Drawer jika sedang terbuka
        const drawer = document.getElementById('adminSideDrawer');
        if (drawer && drawer.classList.contains('active') && typeof admin.openDrawer === 'function') {
            admin.openDrawer('REG', regId);
        }
    }

    function applyRegsFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('regs-filter-search');
        const pkgSelect = document.getElementById('regs-filter-package');
        const statusSelect = document.getElementById('regs-filter-status');

        admin.regsFilter.search = (searchInput && searchInput.value) ? searchInput.value : '';
        admin.regsFilter.package = (pkgSelect && pkgSelect.value) ? pkgSelect.value : 'ALL';
        admin.regsFilter.status = (statusSelect && statusSelect.value) ? statusSelect.value : 'ALL';

        renderRegistrations();
    }

    function resetRegsFilter() {
        if (typeof document === 'undefined') return;
        const searchInput = document.getElementById('regs-filter-search');
        const pkgSelect = document.getElementById('regs-filter-package');
        const statusSelect = document.getElementById('regs-filter-status');

        if (searchInput) searchInput.value = '';
        if (pkgSelect) pkgSelect.value = 'ALL';
        if (statusSelect) statusSelect.value = 'ALL';

        admin.regsFilter = { search: '', package: 'ALL', status: 'ALL' };
        renderRegistrations();
    }

    // Attach to admin
    admin.handleCreateRegistration = handleCreateRegistration;
    admin.confirmRegistrationDP = confirmRegistrationDP;
    admin.renderRegistrations = renderRegistrations;
    admin.applyRegsFilter = applyRegsFilter;
    admin.resetRegsFilter = resetRegsFilter;
    admin.formatMaskedNIK = formatMaskedNIK;
    admin.toggleUnmaskNIK = toggleUnmaskNIK;

    return admin;
});
