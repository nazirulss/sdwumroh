const fs = require('fs');

let code = fs.readFileSync('js/admin-core.js', 'utf8');

// 1. In init(), add call to initInactivityTracker()
const initSyncSearch = "        // 7. Inisialisasi Offline-First Mutation Sync Engine (Fase 4)\n        initSyncEngine();\n    }";
const initSyncReplace = `        // 7. Inisialisasi Offline-First Mutation Sync Engine (Fase 4)
        initSyncEngine();

        // 8. Inisialisasi Inactivity Screen Lock (Fase 6)
        initInactivityTracker();
    }`;

if (code.includes(initSyncSearch)) {
    code = code.replace(initSyncSearch, initSyncReplace);
    console.log('Successfully injected initInactivityTracker into init()');
} else {
    console.warn('initSyncSearch not found, searching alternative...');
}

// 2. Update renderRegistrations to show masked NIK with toggleUnmaskNIK
const regNameSearch = `<td class="py-3.5 px-4 font-bold text-slate-800">\${escapeHtml(r.customer)}</td>`;
const regNameReplace = `<td class="py-3.5 px-4 font-bold text-slate-800">
                    <div class="text-slate-900">\${escapeHtml(r.customer)}</div>
                    <div class="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 font-normal">
                        <span>NIK:</span>
                        \${formatMaskedNIK(r.nik, r.id)}
                    </div>
                </td>`;

if (code.includes(regNameSearch)) {
    code = code.replace(regNameSearch, regNameReplace);
    console.log('Successfully updated renderRegistrations with formatMaskedNIK');
} else {
    console.warn('regNameSearch not found');
}

// 3. Update logAdminAudit to support severity
const logAuditSearch = `    function logAdminAudit(action, entity, ref, desc) {
        const newLog = {
            id: \`AUD-00\${auditLogs.length + 196}\`,
            time: 'Baru saja',
            actor: \`\${currentRole.replace('_', ' ')} (SDW Staf)\`,
            action: action,
            entity: entity,
            ref: ref,
            desc: desc
        };
        auditLogs.unshift(newLog);
        persistStorage(STORAGE_KEYS.AUDIT, auditLogs);
    }`;

const logAuditReplace = `    function logAdminAudit(action, entity, ref, desc, severity) {
        if (!severity) {
            if (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(action)) {
                severity = 'CRITICAL';
            } else if (['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(action)) {
                severity = 'WARNING';
            } else {
                severity = 'INFO';
            }
        }
        const newLog = {
            id: \`AUD-00\${auditLogs.length + 196}\`,
            time: 'Baru saja',
            actor: \`\${currentRole.replace('_', ' ')} (SDW Staf)\`,
            action: action,
            severity: severity,
            entity: entity,
            ref: ref,
            desc: desc
        };
        auditLogs.unshift(newLog);
        persistStorage(STORAGE_KEYS.AUDIT, auditLogs);
    }`;

if (code.includes(logAuditSearch)) {
    code = code.replace(logAuditSearch, logAuditReplace);
    console.log('Successfully updated logAdminAudit with severity');
} else {
    console.warn('logAuditSearch not found');
}

// 4. Update renderAuditLogs to filter by severity and display severity badge
const renderAuditSearch = `    // 7. RENDER JEJAK AUDIT SISTEM (FASE 2 FILTER)
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

        auditFilter.search = '';
        auditFilter.action = 'ALL';

        renderAuditLogs();
    }`;

const renderAuditReplace = `    // 7. RENDER JEJAK AUDIT SISTEM (FASE 2 & FASE 6 SECURITY FILTER)
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

        auditFilter.search = '';
        auditFilter.action = 'ALL';
        auditFilter.severity = 'ALL';

        renderAuditLogs();
    }`;

if (code.includes(renderAuditSearch)) {
    code = code.replace(renderAuditSearch, renderAuditReplace);
    console.log('Successfully updated renderAuditLogs with severity filtering and badges');
} else {
    console.warn('renderAuditSearch not found');
}

// 5. Update exportToCSV to support LOGISTICS, MANASIK, and SECURITY
const exportAuditBranch = `        } else if (type === 'AUDIT') {
            filename = \`SDW_Jejak_Audit_Log_\${dateStr}_\${timeStr}.csv\`;
            rows.push(['ID Audit', 'Waktu', 'Aktor Staf', 'Aksi Mutasi', 'Tabel Entitas', 'ID Referensi', 'Uraian Mutasi']);
            auditLogs.forEach(a => {
                rows.push([a.id, a.time, a.actor, a.action, a.entity, a.ref, a.desc]);
            });
        }`;

const exportNewBranches = `        } else if (type === 'LOGISTICS') {
            filename = \`SDW_Kesiapan_Logistik_Koper_\${dateStr}_\${timeStr}.csv\`;
            rows.push(['ID Logistik', 'ID Registrasi', 'Nama Jamaah', 'Gender', 'No WhatsApp', 'Koper 24 Bagasi', 'Tas Kabin', 'Kain Ihram/Mukena', 'Batik SDW', 'Buku Doa & ID Card', 'Status Distribusi', 'Tanggal Penyerahan', 'Catatan']);
            logisticsData.forEach(l => {
                rows.push([
                    l.id,
                    l.regId,
                    l.name,
                    l.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    l.phone || '-',
                    l.koperBagasi ? 'SUDAH' : 'BELUM',
                    l.tasKabin ? 'SUDAH' : 'BELUM',
                    l.kainIhram ? 'SUDAH' : 'BELUM',
                    l.batikSDW ? 'SUDAH' : 'BELUM',
                    l.bukuDoa ? 'SUDAH' : 'BELUM',
                    l.status,
                    l.pickupDate || '-',
                    l.notes || '-'
                ]);
            });
        } else if (type === 'MANASIK') {
            filename = \`SDW_Presensi_Bimbingan_Manasik_\${dateStr}_\${timeStr}.csv\`;
            rows.push(['ID Manasik', 'ID Registrasi', 'Nama Jamaah', 'Gender', 'No WhatsApp', 'Sesi 1 Teori Fiqih', 'Sesi 2 Praktek Lapangan', 'Status Kesiapan', 'Catatan Bimbingan']);
            manasikData.forEach(m => {
                rows.push([
                    m.id,
                    m.regId,
                    m.name,
                    m.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    m.phone || '-',
                    m.sesi1Teori,
                    m.sesi2Praktek,
                    m.readiness === 'SIAP' ? 'SIAP BERANGKAT' : (m.readiness === 'REMEDIAL' ? 'BUTUH PENGAYAAN / REMEDIAL' : 'BELUM EVALUASI'),
                    m.notes || '-'
                ]);
            });
        } else if (type === 'SECURITY') {
            filename = \`SDW_Insiden_Keamanan_Forensik_\${dateStr}_\${timeStr}.csv\`;
            rows.push(['ID Audit', 'Waktu', 'Aktor Staf', 'Tingkat Keparahan', 'Aksi Mutasi', 'Tabel Entitas', 'ID Referensi', 'Uraian Mutasi']);
            const securityLogs = auditLogs.filter(a => {
                const sev = a.severity || (
                    ['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT', 'SECURITY_BREACH', 'EMERGENCY'].includes(a.action) ? 'CRITICAL' :
                    ['UNAUTHORIZED_UNMASK_ATTEMPT', 'FAILED_UNLOCK_ATTEMPT', 'REJECT_DOCUMENT', 'BATCH_UPDATE_LOGISTICS', 'BATCH_UPDATE_MANASIK'].includes(a.action) ? 'WARNING' : 'INFO'
                );
                return sev === 'CRITICAL' || sev === 'WARNING';
            });
            securityLogs.forEach(a => {
                const sev = a.severity || (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT'].includes(a.action) ? 'CRITICAL' : 'WARNING');
                rows.push([a.id, a.time, a.actor, sev, a.action, a.entity, a.ref, a.desc]);
            });
        } else if (type === 'AUDIT') {
            filename = \`SDW_Jejak_Audit_Log_\${dateStr}_\${timeStr}.csv\`;
            rows.push(['ID Audit', 'Waktu', 'Aktor Staf', 'Tingkat Keparahan', 'Aksi Mutasi', 'Tabel Entitas', 'ID Referensi', 'Uraian Mutasi']);
            auditLogs.forEach(a => {
                const sev = a.severity || (['UNMASK_SENSITIVE_DATA', 'VERIFY_PAYMENT', 'REJECT_PAYMENT'].includes(a.action) ? 'CRITICAL' : 'INFO');
                rows.push([a.id, a.time, a.actor, sev, a.action, a.entity, a.ref, a.desc]);
            });
        }`;

if (code.includes(exportAuditBranch)) {
    code = code.replace(exportAuditBranch, exportNewBranches);
    console.log('Successfully updated exportToCSV with LOGISTICS, MANASIK, and SECURITY');
} else {
    console.warn('exportAuditBranch not found');
}

fs.writeFileSync('js/admin-core.js', code, 'utf8');
console.log('Step 2 complete');

