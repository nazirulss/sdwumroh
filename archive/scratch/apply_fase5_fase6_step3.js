const fs = require('fs');

let code = fs.readFileSync('js/admin-core.js', 'utf8');

// 1. Update renderAuditLogs, applyAuditFilter, resetAuditFilter
const oldAuditSection = `    // 7. RENDER JEJAK AUDIT SISTEM (FASE 2 FILTER)
    function renderAuditLogs() {
        const tbody = document.getElementById('audit-logs-table-tbody');
        if (!tbody) return;

        const filtered = auditLogs.filter(a => {
            const query = (auditFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (a.actor && a.actor.toLowerCase().includes(query)) ||
                (a.ref && a.ref.toLowerCase().includes(query)) ||
                (a.desc && a.desc.toLowerCase().includes(query)) ||
                (a.entity && a.entity.toLowerCase().includes(query));
            const matchAction = (!auditFilter.action || auditFilter.action === 'ALL') || (a.action === auditFilter.action);
            return matchSearch && matchAction;
        });

        const badgeEl = document.getElementById('audit-count-badge');
        if (badgeEl) {
            badgeEl.innerText = \`Menampilkan \${filtered.length} dari \${auditLogs.length} log\`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = \`
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-shield-halved text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada log audit yang sesuai filter.
                    </td>
                </tr>
            \`;
            return;
        }

        tbody.innerHTML = filtered.map(a => \`
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3 px-4 font-mono font-bold text-sdw-pine">\${escapeHtml(a.id)}</td>
                <td class="py-3 px-4 text-slate-500 whitespace-nowrap">\${escapeHtml(a.time)}</td>
                <td class="py-3 px-4 font-bold text-slate-800">\${escapeHtml(a.actor)}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">\${escapeHtml(a.action)}</span>
                </td>
                <td class="py-3 px-4 font-mono text-purple-900 font-semibold">\${escapeHtml(a.entity)}</td>
                <td class="py-3 px-4 font-mono text-slate-600">\${escapeHtml(a.ref)}</td>
                <td class="py-3 px-4 text-slate-700 max-w-xs truncate" title="\${escapeHtml(a.desc)}">\${escapeHtml(a.desc)}</td>
            </tr>
        \`).join('');
    }

    function applyAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');

        auditFilter.search = searchInput ? searchInput.value : '';
        auditFilter.action = actionSelect ? actionSelect.value : 'ALL';

        renderAuditLogs();
    }

    function resetAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');

        if (searchInput) searchInput.value = '';
        if (actionSelect) actionSelect.value = 'ALL';

        auditFilter = { search: '', action: 'ALL' };
        renderAuditLogs();
    }`;

const newAuditSection = `    // 7. RENDER JEJAK AUDIT SISTEM (FASE 2 & FASE 6 SECURITY FILTER)
    function renderAuditLogs() {
        const tbody = document.getElementById('audit-logs-table-tbody');
        if (!tbody) return;

        const filtered = auditLogs.filter(a => {
            const query = (auditFilter.search || '').toLowerCase().trim();
            const matchSearch = !query ||
                (a.actor && a.actor.toLowerCase().includes(query)) ||
                (a.ref && a.ref.toLowerCase().includes(query)) ||
                (a.desc && a.desc.toLowerCase().includes(query)) ||
                (a.entity && a.entity.toLowerCase().includes(query));
            const matchAction = (!auditFilter.action || auditFilter.action === 'ALL') || (a.action === auditFilter.action);
            const sev = a.severity || (
                ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
            );
            const matchSeverity = (!auditFilter.severity || auditFilter.severity === 'ALL') || (sev === auditFilter.severity);
            return matchSearch && matchAction && matchSeverity;
        });

        const badgeEl = document.getElementById('audit-count-badge');
        if (badgeEl) {
            badgeEl.innerText = \`Menampilkan \${filtered.length} dari \${auditLogs.length} log\`;
        }

        if (filtered.length === 0) {
            tbody.innerHTML = \`
                <tr>
                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                        <i class="fa-solid fa-shield-halved text-slate-300 text-2xl mb-2 block"></i>
                        Tidak ada log audit yang sesuai filter.
                    </td>
                </tr>
            \`;
            return;
        }

        tbody.innerHTML = filtered.map(a => {
            const sev = a.severity || (
                ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
            );
            let sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">INFO</span>';
            if (sev === 'CRITICAL') {
                sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>';
            } else if (sev === 'WARNING') {
                sevBadge = '<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">WARNING</span>';
            }

            return \`
            <tr class="hover:bg-slate-50 border-b border-slate-100 text-xs transition">
                <td class="py-3 px-4 font-mono font-bold text-sdw-pine">\${escapeHtml(a.id)}</td>
                <td class="py-3 px-4 text-slate-500 whitespace-nowrap">\${escapeHtml(a.time)}</td>
                <td class="py-3 px-4 font-bold text-slate-800">\${escapeHtml(a.actor)}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-1.5">
                        \${sevBadge}
                        <span class="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">\${escapeHtml(a.action)}</span>
                    </div>
                </td>
                <td class="py-3 px-4 font-mono text-purple-900 font-semibold">\${escapeHtml(a.entity)}</td>
                <td class="py-3 px-4 font-mono text-slate-600">\${escapeHtml(a.ref)}</td>
                <td class="py-3 px-4 text-slate-700 max-w-xs truncate" title="\${escapeHtml(a.desc)}">\${escapeHtml(a.desc)}</td>
            </tr>
            \`;
        }).join('');
    }

    function applyAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');
        const severitySelect = document.getElementById('audit-filter-severity');

        auditFilter.search = searchInput ? searchInput.value : '';
        auditFilter.action = actionSelect ? actionSelect.value : 'ALL';
        auditFilter.severity = severitySelect ? severitySelect.value : 'ALL';

        renderAuditLogs();
    }

    function resetAuditFilter() {
        const searchInput = document.getElementById('audit-filter-search');
        const actionSelect = document.getElementById('audit-filter-action');
        const severitySelect = document.getElementById('audit-filter-severity');

        if (searchInput) searchInput.value = '';
        if (actionSelect) actionSelect.value = 'ALL';
        if (severitySelect) severitySelect.value = 'ALL';

        auditFilter = { search: '', action: 'ALL', severity: 'ALL' };
        renderAuditLogs();
    }`;

if (code.includes(oldAuditSection)) {
    code = code.replace(oldAuditSection, newAuditSection);
    console.log('Successfully replaced oldAuditSection');
} else {
    console.error('Could not find oldAuditSection');
}

// 2. Add Phase 5 & Phase 6 Core Methods right before Drawer & Quick Search
const drawerSearch = '    // ====================================================================\n    // DRAWER & QUICK SEARCH\n    // ====================================================================';

const phase5and6Code = `    // ====================================================================
    // FASE 5: LOGISTIK & PERLENGKAPAN KOPER JAMAAH
    // ====================================================================
    function renderLogistics() {
        const container = document.getElementById('operations-logistics-container');
        if (!container) return;

        const total = logisticsData.length;
        const completeCount = logisticsData.filter(l => l.status === 'LENGKAP').length;
        const partialCount = logisticsData.filter(l => l.status === 'SEBAGIAN').length;
        const pendingCount = logisticsData.filter(l => l.status === 'BELUM').length;
        const pct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

        const filtered = logisticsData.filter(l => {
            const q = (logisticsFilter.search || '').toLowerCase().trim();
            const matchSearch = !q ||
                (l.name && l.name.toLowerCase().includes(q)) ||
                (l.regId && l.regId.toLowerCase().includes(q)) ||
                (l.phone && l.phone.includes(q));
            const matchStatus = (!logisticsFilter.status || logisticsFilter.status === 'ALL') || (l.status === logisticsFilter.status);
            return matchSearch && matchStatus;
        });

        container.innerHTML = \`
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
                <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Jamaah Kloter</div>
                    <div class="text-2xl font-black text-slate-900 mt-1">\${total} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Kloter Utama (15 Jan 2027)</div>
                </div>
                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Koper Lengkap (5/5)</div>
                    <div class="text-2xl font-black text-emerald-700 mt-1">\${completeCount} <span class="text-xs font-bold text-emerald-600">(\${pct}%)</span></div>
                    <div class="text-[11px] text-emerald-700 mt-0.5">Siap bagasi bandara</div>
                </div>
                <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Distribusi Sebagian</div>
                    <div class="text-2xl font-black text-amber-700 mt-1">\${partialCount} <span class="text-xs font-semibold text-amber-600">Pax</span></div>
                    <div class="text-[11px] text-amber-700 mt-0.5">Kurang batik / buku doa</div>
                </div>
                <div class="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Belum Diambil</div>
                    <div class="text-2xl font-black text-rose-700 mt-1">\${pendingCount} <span class="text-xs font-semibold text-rose-600">Pax</span></div>
                    <div class="text-[11px] text-rose-700 mt-0.5">Perlu follow up via WA</div>
                </div>
            </div>

            <!-- Toolbar & Filter -->
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div class="flex flex-wrap items-center gap-2 flex-1">
                    <div class="relative flex-1 min-w-[200px] max-w-sm">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input type="text" id="logistics-filter-search" oninput="SDW_ADMIN.applyLogisticsFilter()" value="\${escapeHtml(logisticsFilter.search || '')}" placeholder="Cari nama jamaah, ID reg, no telp..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                    </div>
                    <select id="logistics-filter-status" onchange="SDW_ADMIN.applyLogisticsFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" \${logisticsFilter.status === 'ALL' ? 'selected' : ''}>Semua Status Distribusi</option>
                        <option value="LENGKAP" \${logisticsFilter.status === 'LENGKAP' ? 'selected' : ''}>🟢 Lengkap (5/5 Item)</option>
                        <option value="SEBAGIAN" \${logisticsFilter.status === 'SEBAGIAN' ? 'selected' : ''}>🟡 Sebagian</option>
                        <option value="BELUM" \${logisticsFilter.status === 'BELUM' ? 'selected' : ''}>🔴 Belum Diambil</option>
                    </select>
                    <button type="button" onclick="SDW_ADMIN.resetLogisticsFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="SDW_ADMIN.batchLogistics('completeAll')" class="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-check-double text-purple-700"></i>
                        <span>Tandai Semua Lengkap</span>
                    </button>
                    <button type="button" onclick="SDW_ADMIN.exportToCSV('LOGISTICS')" class="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i>
                        <span>Unduh Berita Acara (CSV)</span>
                    </button>
                </div>
            </div>

            <!-- Table of Logistics -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[950px]">
                        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="py-3 px-4">No</th>
                                <th class="py-3 px-4">ID Reg &amp; Nama Jamaah</th>
                                <th class="py-3 px-2 text-center" title="Koper Bagasi 24 Inci">Koper 24"</th>
                                <th class="py-3 px-2 text-center" title="Tas Kabin 7 Kg">Tas Kabin</th>
                                <th class="py-3 px-2 text-center" title="Kain Ihram (Ikhwan) / Mukena (Akhwat)">Ihram/Mukena</th>
                                <th class="py-3 px-2 text-center" title="Seragam Batik Resmi SDW">Batik SDW</th>
                                <th class="py-3 px-2 text-center" title="Buku Panduan Doa &amp; ID Card">Buku &amp; ID</th>
                                <th class="py-3 px-4 text-center">Status</th>
                                <th class="py-3 px-4">Tgl Ambil &amp; Catatan</th>
                                <th class="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            \${filtered.length === 0 ? \`
                                <tr>
                                    <td colspan="10" class="p-8 text-center text-slate-400 text-xs">
                                        <i class="fa-solid fa-box-open text-slate-300 text-2xl mb-2 block"></i>
                                        Tidak ada data distribusi logistik yang sesuai filter.
                                    </td>
                                </tr>
                            \` : filtered.map((l, idx) => {
                                let badgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';
                                if (l.status === 'LENGKAP') badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                else if (l.status === 'SEBAGIAN') badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';

                                return \`
                                <tr class="hover:bg-slate-50/80 transition">
                                    <td class="py-3 px-4 text-slate-400 font-mono">\${idx + 1}</td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-900">\${escapeHtml(l.name)}</div>
                                        <div class="text-[11px] font-mono text-slate-500">\${escapeHtml(l.regId)} • \${escapeHtml(l.phone || '-')}</div>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('\${l.regId}', 'koperBagasi')" class="w-7 h-7 rounded-lg border \${l.koperBagasi ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('\${l.regId}', 'tasKabin')" class="w-7 h-7 rounded-lg border \${l.tasKabin ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('\${l.regId}', 'kainIhram')" class="w-7 h-7 rounded-lg border \${l.kainIhram ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('\${l.regId}', 'batikSDW')" class="w-7 h-7 rounded-lg border \${l.batikSDW ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-2 text-center">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsItem('\${l.regId}', 'bukuDoa')" class="w-7 h-7 rounded-lg border \${l.bukuDoa ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent hover:text-slate-300'} transition flex items-center justify-center mx-auto cursor-pointer shadow-2xs">
                                            <i class="fa-solid fa-check text-xs"></i>
                                        </button>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black \${badgeClass}">\${l.status}</span>
                                    </td>
                                    <td class="py-3 px-4 text-slate-600 max-w-[200px]">
                                        <div class="font-medium truncate" title="\${escapeHtml(l.notes)}">\${escapeHtml(l.notes)}</div>
                                        <div class="text-[10px] text-slate-400 mt-0.5">\${l.pickupDate ? 'Diserahkan: ' + l.pickupDate : 'Belum ada tanggal'}</div>
                                    </td>
                                    <td class="py-3 px-4 text-right">
                                        <button type="button" onclick="SDW_ADMIN.toggleLogisticsComplete('\${l.regId}')" class="px-2.5 py-1 rounded-lg \${l.status === 'LENGKAP' ? 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-bold text-[11px] transition cursor-pointer shadow-2xs">
                                            \${l.status === 'LENGKAP' ? 'Reset' : 'Lengkapkan'}
                                        </button>
                                    </td>
                                </tr>
                                \`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        \`;
    }

    function toggleLogisticsItem(regId, itemKey) {
        const item = logisticsData.find(l => l.regId === regId);
        if (!item) return;

        item[itemKey] = !item[itemKey];

        const checkedCount = [item.koperBagasi, item.tasKabin, item.kainIhram, item.batikSDW, item.bukuDoa].filter(Boolean).length;
        item.status = checkedCount === 5 ? 'LENGKAP' : (checkedCount > 0 ? 'SEBAGIAN' : 'BELUM');
        if (item.status === 'LENGKAP' && !item.pickupDate) {
            item.pickupDate = new Date().toISOString().slice(0, 10);
            item.notes = 'Penyerahan perlengkapan lengkap tervalidasi.';
        }

        persistStorage(STORAGE_KEYS.LOGISTICS, logisticsData);
        enqueueMutation('updatePreparation', { regId, itemKey, value: item[itemKey], status: item.status, pickupDate: item.pickupDate }, 'DB_Preparation', regId);
        logAdminAudit('UPDATE_LOGISTICS', 'DB_Preparation', regId, \`Status \${itemKey} jamaah \${item.name} diubah menjadi \${item[itemKey] ? 'DISERAHKAN' : 'BELUM'}.\`, 'INFO');

        showToast(\`📦 Status \${itemKey} \${item.name} diperbarui!\`);
        renderLogistics();
    }

    function toggleLogisticsComplete(regId) {
        const item = logisticsData.find(l => l.regId === regId);
        if (!item) return;

        const isCurrentlyComplete = item.status === 'LENGKAP';
        const newVal = !isCurrentlyComplete;

        item.koperBagasi = newVal;
        item.tasKabin = newVal;
        item.kainIhram = newVal;
        item.batikSDW = newVal;
        item.bukuDoa = newVal;
        item.status = newVal ? 'LENGKAP' : 'BELUM';
        item.pickupDate = newVal ? new Date().toISOString().slice(0, 10) : null;
        item.notes = newVal ? 'Paket perlengkapan 5/5 telah diserahkan lengkap.' : 'Belum konfirmasi pengambilan.';

        persistStorage(STORAGE_KEYS.LOGISTICS, logisticsData);
        enqueueMutation('updatePreparation', { regId, batchAll: true, value: newVal, status: item.status, pickupDate: item.pickupDate }, 'DB_Preparation', regId);
        logAdminAudit('UPDATE_LOGISTICS', 'DB_Preparation', regId, \`Status seluruh perlengkapan jamaah \${item.name} diubah menjadi \${item.status}.\`, 'INFO');

        showToast(\`📦 Perlengkapan \${item.name} ditandai \${item.status}!\`);
        renderLogistics();
    }

    function batchLogistics(action) {
        if (action === 'completeAll') {
            const today = new Date().toISOString().slice(0, 10);
            logisticsData.forEach(l => {
                l.koperBagasi = true;
                l.tasKabin = true;
                l.kainIhram = true;
                l.batikSDW = true;
                l.bukuDoa = true;
                l.status = 'LENGKAP';
                if (!l.pickupDate) l.pickupDate = today;
                l.notes = 'Penyerahan massal terverifikasi operasional SDW.';
            });
            persistStorage(STORAGE_KEYS.LOGISTICS, logisticsData);
            enqueueMutation('updatePreparation', { batchAction: 'COMPLETE_ALL', timestamp: new Date().toISOString() }, 'DB_Preparation', 'BATCH_ALL');
            logAdminAudit('BATCH_UPDATE_LOGISTICS', 'DB_Preparation', 'ALL', 'Staf menandai seluruh perlengkapan jamaah kloter sebagai LENGKAP.', 'WARNING');
            showToast('📦 Seluruh perlengkapan jamaah kloter ditandai LENGKAP!');
            renderLogistics();
        }
    }

    function applyLogisticsFilter() {
        const searchInput = document.getElementById('logistics-filter-search');
        const statusSelect = document.getElementById('logistics-filter-status');
        logisticsFilter.search = searchInput ? searchInput.value : '';
        logisticsFilter.status = statusSelect ? statusSelect.value : 'ALL';
        renderLogistics();
    }

    function resetLogisticsFilter() {
        logisticsFilter = { search: '', status: 'ALL' };
        renderLogistics();
    }

    // ====================================================================
    // FASE 5: BIMBINGAN & PRESENSI MANASIK
    // ====================================================================
    function renderManasik() {
        const container = document.getElementById('operations-manasik-container');
        if (!container) return;

        const total = manasikData.length;
        const readyCount = manasikData.filter(m => m.readiness === 'SIAP').length;
        const remedialCount = manasikData.filter(m => m.readiness === 'REMEDIAL').length;
        const pendingCount = manasikData.filter(m => m.readiness === 'BELUM_EVALUASI').length;
        const pct = total > 0 ? Math.round((readyCount / total) * 100) : 0;

        const filtered = manasikData.filter(m => {
            const q = (manasikFilter.search || '').toLowerCase().trim();
            const matchSearch = !q ||
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.regId && m.regId.toLowerCase().includes(q)) ||
                (m.phone && m.phone.includes(q));
            const matchStatus = (!manasikFilter.status || manasikFilter.status === 'ALL') || (m.readiness === manasikFilter.status);
            return matchSearch && matchStatus;
        });

        container.innerHTML = \`
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
                <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Peserta Manasik</div>
                    <div class="text-2xl font-black text-slate-900 mt-1">\${total} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Kloter Utama (15 Jan 2027)</div>
                </div>
                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Siap Berangkat (Lulus)</div>
                    <div class="text-2xl font-black text-emerald-700 mt-1">\${readyCount} <span class="text-xs font-bold text-emerald-600">(\${pct}%)</span></div>
                    <div class="text-[11px] text-emerald-700 mt-0.5">Hadir Sesi 1 &amp; Sesi 2</div>
                </div>
                <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
                    <div class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Butuh Pengayaan / Izin</div>
                    <div class="text-2xl font-black text-amber-700 mt-1">\${remedialCount} <span class="text-xs font-semibold text-amber-600">Pax</span></div>
                    <div class="text-[11px] text-amber-700 mt-0.5">Dijadwalkan sesi susulan</div>
                </div>
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Belum Evaluasi</div>
                    <div class="text-2xl font-black text-slate-700 mt-1">\${pendingCount} <span class="text-xs font-semibold text-slate-400">Pax</span></div>
                    <div class="text-[11px] text-slate-500 mt-0.5">Jamaah baru / susulan</div>
                </div>
            </div>

            <!-- Toolbar & Filter -->
            <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div class="flex flex-wrap items-center gap-2 flex-1">
                    <div class="relative flex-1 min-w-[200px] max-w-sm">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                        <input type="text" id="manasik-filter-search" oninput="SDW_ADMIN.applyManasikFilter()" value="\${escapeHtml(manasikFilter.search || '')}" placeholder="Cari nama jamaah, ID reg, no telp..." class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-sdw-pine outline-none">
                    </div>
                    <select id="manasik-filter-status" onchange="SDW_ADMIN.applyManasikFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                        <option value="ALL" \${manasikFilter.status === 'ALL' ? 'selected' : ''}>Semua Tingkat Kesiapan</option>
                        <option value="SIAP" \${manasikFilter.status === 'SIAP' ? 'selected' : ''}>🟢 Siap Berangkat (Lulus 2 Sesi)</option>
                        <option value="REMEDIAL" \${manasikFilter.status === 'REMEDIAL' ? 'selected' : ''}>🟡 Butuh Pengayaan / Remedial</option>
                        <option value="BELUM_EVALUASI" \${manasikFilter.status === 'BELUM_EVALUASI' ? 'selected' : ''}>⚪ Belum Hadir / Evaluasi</option>
                    </select>
                    <button type="button" onclick="SDW_ADMIN.resetManasikFilter()" class="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[11px] transition cursor-pointer">
                        <i class="fa-solid fa-rotate-left mr-1"></i> Reset
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="SDW_ADMIN.batchManasik('attendAll')" class="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-user-check text-purple-700"></i>
                        <span>Presensi Cepat Hadir Semua</span>
                    </button>
                    <button type="button" onclick="SDW_ADMIN.exportToCSV('MANASIK')" class="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i>
                        <span>Unduh Presensi Manasik (CSV)</span>
                    </button>
                </div>
            </div>

            <!-- Table of Manasik Attendance -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[950px]">
                        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500 border-b border-slate-200">
                            <tr>
                                <th class="py-3 px-4">No</th>
                                <th class="py-3 px-4">ID Reg &amp; Nama Jamaah</th>
                                <th class="py-3 px-4 text-center">Sesi 1: Teori Fiqih Umroh</th>
                                <th class="py-3 px-4 text-center">Sesi 2: Praktek Lapangan</th>
                                <th class="py-3 px-4 text-center">Kesiapan Fiqih</th>
                                <th class="py-3 px-4">Catatan Pembimbing</th>
                                <th class="py-3 px-4 text-right">Aksi Cepat</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-xs">
                            \${filtered.length === 0 ? \`
                                <tr>
                                    <td colspan="7" class="p-8 text-center text-slate-400 text-xs">
                                        <i class="fa-solid fa-mosque text-slate-300 text-2xl mb-2 block"></i>
                                        Tidak ada data presensi manasik yang sesuai filter.
                                    </td>
                                </tr>
                            \` : filtered.map((m, idx) => {
                                let readyBadge = 'bg-slate-100 text-slate-700 border border-slate-200';
                                let readyLabel = 'Belum Evaluasi';
                                if (m.readiness === 'SIAP') {
                                    readyBadge = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                    readyLabel = 'Siap Berangkat';
                                } else if (m.readiness === 'REMEDIAL') {
                                    readyBadge = 'bg-amber-100 text-amber-800 border border-amber-200';
                                    readyLabel = 'Butuh Pengayaan';
                                }

                                return \`
                                <tr class="hover:bg-slate-50/80 transition">
                                    <td class="py-3 px-4 text-slate-400 font-mono">\${idx + 1}</td>
                                    <td class="py-3 px-4">
                                        <div class="font-bold text-slate-900">\${escapeHtml(m.name)}</div>
                                        <div class="text-[11px] font-mono text-slate-500">\${escapeHtml(m.regId)} • \${escapeHtml(m.phone || '-')}</div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi1Teori', 'HADIR')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi1Teori === 'HADIR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Hadir</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi1Teori', 'IZIN')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi1Teori === 'IZIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Izin</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi1Teori', 'ALPHA')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi1Teori === 'ALPHA' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Alpha</button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <div class="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 gap-0.5">
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi2Praktek', 'HADIR')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi2Praktek === 'HADIR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Hadir</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi2Praktek', 'IZIN')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi2Praktek === 'IZIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Izin</button>
                                            <button type="button" onclick="SDW_ADMIN.toggleManasikAttendance('\${m.regId}', 'sesi2Praktek', 'ALPHA')" class="px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer \${m.sesi2Praktek === 'ALPHA' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'}">Alpha</button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-center">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black \${readyBadge}">\${readyLabel}</span>
                                    </td>
                                    <td class="py-3 px-4 text-slate-600 max-w-[240px]">
                                        <div class="truncate text-[11px]" title="\${escapeHtml(m.notes)}">\${escapeHtml(m.notes)}</div>
                                    </td>
                                    <td class="py-3 px-4 text-right">
                                        <button type="button" onclick="SDW_ADMIN.toggleManasikPassBoth('\${m.regId}')" class="px-2.5 py-1 rounded-lg bg-sdw-pine hover:bg-purple-900 text-white font-bold text-[11px] transition cursor-pointer shadow-2xs">
                                            Luluskan 2 Sesi
                                        </button>
                                    </td>
                                </tr>
                                \`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        \`;
    }

    function toggleManasikAttendance(regId, sessionKey, status) {
        const item = manasikData.find(m => m.regId === regId);
        if (!item) return;

        item[sessionKey] = status;

        if (item.sesi1Teori === 'HADIR' && item.sesi2Praktek === 'HADIR') {
            item.readiness = 'SIAP';
            item.notes = 'Lulus seluruh materi fiqih & simulasi manasik.';
        } else if (item.sesi1Teori === 'HADIR' || item.sesi2Praktek === 'HADIR' || item.sesi1Teori === 'IZIN' || item.sesi2Praktek === 'IZIN') {
            item.readiness = 'REMEDIAL';
            item.notes = 'Dijadwalkan pembekalan materi tambahan sebelum keberangkatan.';
        } else {
            item.readiness = 'BELUM_EVALUASI';
        }

        persistStorage(STORAGE_KEYS.MANASIK, manasikData);
        enqueueMutation('updateManasik', { regId, sessionKey, status, readiness: item.readiness, notes: item.notes }, 'DB_Manasik', regId);
        logAdminAudit('UPDATE_MANASIK', 'DB_Manasik', regId, \`Presensi \${sessionKey} jamaah \${item.name} diperbarui ke \${status}.\`, 'INFO');

        showToast(\`🕋 Presensi \${item.name} diperbarui ke \${status}!\`);
        renderManasik();
    }

    function toggleManasikPassBoth(regId) {
        const item = manasikData.find(m => m.regId === regId);
        if (!item) return;

        item.sesi1Teori = 'HADIR';
        item.sesi2Praktek = 'HADIR';
        item.readiness = 'SIAP';
        item.notes = 'Lulus bimbingan teori & praktek manasik, siap berangkat.';

        persistStorage(STORAGE_KEYS.MANASIK, manasikData);
        enqueueMutation('updateManasik', { regId, sesi1Teori: 'HADIR', sesi2Praktek: 'HADIR', readiness: 'SIAP', notes: item.notes }, 'DB_Manasik', regId);
        logAdminAudit('UPDATE_MANASIK', 'DB_Manasik', regId, \`Jamaah \${item.name} dinyatakan LULUS kedua sesi bimbingan manasik.\`, 'INFO');

        showToast(\`🕋 \${item.name} dinyatakan SIAP BERANGKAT!\`);
        renderManasik();
    }

    function batchManasik(action) {
        if (action === 'attendAll') {
            manasikData.forEach(m => {
                m.sesi1Teori = 'HADIR';
                m.sesi2Praktek = 'HADIR';
                m.readiness = 'SIAP';
                m.notes = 'Presensi massal kloter, pemahaman rukun umroh tuntas.';
            });
            persistStorage(STORAGE_KEYS.MANASIK, manasikData);
            enqueueMutation('updateManasik', { batchAction: 'ATTEND_ALL', timestamp: new Date().toISOString() }, 'DB_Manasik', 'BATCH_ALL');
            logAdminAudit('BATCH_UPDATE_MANASIK', 'DB_Manasik', 'ALL', 'Presensi massal seluruh jamaah kloter ditandai HADIR pada kedua sesi.', 'WARNING');
            showToast('🕋 Seluruh jamaah kloter ditandai HADIR pada seluruh sesi manasik!');
            renderManasik();
        }
    }

    function applyManasikFilter() {
        const searchInput = document.getElementById('manasik-filter-search');
        const statusSelect = document.getElementById('manasik-filter-status');
        manasikFilter.search = searchInput ? searchInput.value : '';
        manasikFilter.status = statusSelect ? statusSelect.value : 'ALL';
        renderManasik();
    }

    function resetManasikFilter() {
        manasikFilter = { search: '', status: 'ALL' };
        renderManasik();
    }

    // ====================================================================
    // FASE 6: PRIVASI DATA, AUTO-LOCK SCREEN & KEAMANAN SISTEM
    // ====================================================================
    function formatMaskedNIK(nik, regId) {
        if (!nik || nik === '-') return '<span class="text-slate-400 font-sans italic">Belum diinput</span>';
        const isUnmasked = unmaskedRecords.has(regId);
        if (isUnmasked) {
            return \`<span class="text-emerald-700 font-bold font-mono">\${escapeHtml(nik)}</span>
                <button type="button" onclick="SDW_ADMIN.toggleUnmaskNIK('\${regId}')" class="ml-1 text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer" title="Sembunyikan NIK">
                    <i class="fa-solid fa-eye-slash"></i>
                </button>\`;
        } else {
            const masked = nik.length >= 8 ? (nik.slice(0, 4) + '••••••••' + nik.slice(-4)) : '3276••••••••0001';
            return \`<span class="text-slate-600 font-mono">\${masked}</span>
                <button type="button" onclick="SDW_ADMIN.toggleUnmaskNIK('\${regId}')" class="ml-1 text-slate-400 hover:text-sdw-pine transition p-0.5 cursor-pointer" title="Buka Masking NIK (Hanya Staf Berwenang)">
                    <i class="fa-solid fa-eye"></i>
                </button>\`;
        }
    }

    function toggleUnmaskNIK(regId) {
        const authorizedRoles = ['ADMIN', 'FINANCE', 'MANAGER', 'OWNER'];
        if (!authorizedRoles.includes(currentRole)) {
            showToast('⚠️ Akses ditolak: Hanya Staf Admin/Finance/Manager yang berwenang membuka NIK.');
            logAdminAudit('UNAUTHORIZED_UNMASK_ATTEMPT', 'DB_Registrations', regId, \`Percobaan akses buka masking data sensitif NIK ditolak untuk role \${currentRole}.\`, 'WARNING');
            renderAuditLogs();
            return;
        }

        if (unmaskedRecords.has(regId)) {
            unmaskedRecords.delete(regId);
            showToast(\`🔒 NIK \${regId} kembali disensor.\`);
        } else {
            unmaskedRecords.add(regId);
            showToast(\`👁️ NIK \${regId} dibuka untuk verifikasi paspor.\`);
            logAdminAudit('UNMASK_SENSITIVE_DATA', 'DB_Registrations', regId, \`Staf \${currentRole} membuka enkripsi/masking NIK jamaah demi verifikasi paspor & Siskopatuh Kemenag.\`, 'CRITICAL');
            enqueueMutation('unmaskSensitiveData', { regId: regId, role: currentRole, timestamp: new Date().toISOString() }, 'DB_Audit_Logs', regId);
            renderAuditLogs();
        }
        renderRegistrations();
    }

    function initInactivityTracker() {
        const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
        const resetTimer = () => {
            if (isScreenLocked) return;
            if (inactivityTimer) clearTimeout(inactivityTimer);
            // 15 menit timeout
            inactivityTimer = setTimeout(() => {
                lockScreen(true);
            }, 15 * 60 * 1000);
        };

        events.forEach(evt => {
            window.addEventListener(evt, resetTimer, { passive: true });
        });
        resetTimer();
    }

    function lockScreen(isAuto = false) {
        isScreenLocked = true;
        const modal = document.getElementById('modalScreenLock');
        const roleBadge = document.getElementById('lockScreenRoleBadge');
        const pinInput = document.getElementById('lockScreenPin');
        const errEl = document.getElementById('lockScreenError');

        if (roleBadge) {
            roleBadge.innerText = \`\${currentRole.replace('_', ' ')} (Akses Aktif)\`;
        }
        if (pinInput) {
            pinInput.value = '';
        }
        if (errEl) {
            errEl.classList.add('hidden');
        }

        if (modal) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100', 'pointer-events-auto');
            const inner = modal.querySelector('div');
            if (inner) {
                inner.classList.remove('scale-95');
                inner.classList.add('scale-100');
            }
            if (pinInput) {
                setTimeout(() => pinInput.focus(), 100);
            }
        }

        if (isAuto) {
            logAdminAudit('AUTO_LOCK_INACTIVITY', 'SYSTEM_SECURITY', 'AUTO_TIMEOUT', 'Layar portal terkunci otomatis setelah 15 menit tidak ada aktivitas staf demi kepatuhan keamanan data.', 'INFO');
        } else {
            logAdminAudit('MANUAL_SCREEN_LOCK', 'SYSTEM_SECURITY', 'MANUAL_LOCK', 'Staf mengunci layar portal admin secara manual.', 'INFO');
            showToast('🔒 Layar portal berhasil dikunci.');
        }
        renderAuditLogs();
    }

    function unlockScreen() {
        const pinInput = document.getElementById('lockScreenPin');
        const errEl = document.getElementById('lockScreenError');
        const modal = document.getElementById('modalScreenLock');

        const enteredPin = pinInput ? pinInput.value.trim() : '';

        if (enteredPin === MASTER_PIN) {
            isScreenLocked = false;
            if (modal) {
                modal.classList.remove('opacity-100', 'pointer-events-auto');
                modal.classList.add('opacity-0', 'pointer-events-none');
                const inner = modal.querySelector('div');
                if (inner) {
                    inner.classList.remove('scale-100');
                    inner.classList.add('scale-95');
                }
            }
            if (pinInput) pinInput.value = '';
            if (errEl) errEl.classList.add('hidden');

            logAdminAudit('SCREEN_UNLOCKED', 'SYSTEM_SECURITY', 'PIN_VERIFIED', 'Sesi portal berhasil dibuka kembali dengan otentikasi PIN keamanan yang sah.', 'INFO');
            showToast('🔓 Sesi portal aktif kembali.');
            renderAuditLogs();
            initInactivityTracker();
        } else {
            if (errEl) errEl.classList.remove('hidden');
            if (pinInput) {
                pinInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-200');
                setTimeout(() => {
                    pinInput.classList.remove('border-rose-500', 'ring-2', 'ring-rose-200');
                }, 1500);
                pinInput.focus();
            }
            logAdminAudit('FAILED_UNLOCK_ATTEMPT', 'SYSTEM_SECURITY', 'WRONG_PIN', 'Percobaan membuka kunci layar gagal dengan PIN yang tidak sesuai.', 'WARNING');
            renderAuditLogs();
        }
    }

    function appendLockPin(digit) {
        const pinInput = document.getElementById('lockScreenPin');
        if (pinInput && pinInput.value.length < 6) {
            pinInput.value += digit;
        }
    }

    function clearLockPin() {
        const pinInput = document.getElementById('lockScreenPin');
        if (pinInput) {
            pinInput.value = '';
        }
        const errEl = document.getElementById('lockScreenError');
        if (errEl) errEl.classList.add('hidden');
    }

    function handleUnlock(e) {
        if (e && e.preventDefault) e.preventDefault();
        unlockScreen();
    }

    function exportSecurityIncidents() {
        exportToCSV('SECURITY');
    }

` + drawerSearch;

if (code.includes(drawerSearch)) {
    code = code.replace(drawerSearch, phase5and6Code);
    console.log('Successfully injected Phase 5 and Phase 6 functions');
} else {
    console.error('Could not find drawerSearch');
}

// 3. Export all new methods in return object
const returnExportSearch = `        getSyncQueue: () => syncQueue,
        getSyncHistory: () => syncHistory
    };`;

const returnExportReplace = `        getSyncQueue: () => syncQueue,
        getSyncHistory: () => syncHistory,
        // Fase 5 Exports
        renderLogistics: renderLogistics,
        toggleLogisticsItem: toggleLogisticsItem,
        toggleLogisticsComplete: toggleLogisticsComplete,
        batchLogistics: batchLogistics,
        applyLogisticsFilter: applyLogisticsFilter,
        resetLogisticsFilter: resetLogisticsFilter,
        renderManasik: renderManasik,
        toggleManasikAttendance: toggleManasikAttendance,
        toggleManasikPassBoth: toggleManasikPassBoth,
        batchManasik: batchManasik,
        applyManasikFilter: applyManasikFilter,
        resetManasikFilter: resetManasikFilter,
        // Fase 6 Exports
        formatMaskedNIK: formatMaskedNIK,
        toggleUnmaskNIK: toggleUnmaskNIK,
        lockScreen: lockScreen,
        unlockScreen: unlockScreen,
        appendLockPin: appendLockPin,
        clearLockPin: clearLockPin,
        handleUnlock: handleUnlock,
        exportSecurityIncidents: exportSecurityIncidents
    };`;

if (code.includes(returnExportSearch)) {
    code = code.replace(returnExportSearch, returnExportReplace);
    console.log('Successfully updated return export object');
} else {
    console.error('Could not find returnExportSearch');
}

fs.writeFileSync('js/admin-core.js', code, 'utf8');
console.log('Step 3 successfully written!');

