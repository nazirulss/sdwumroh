/**
 * ====================================================================
 * SDW UMROH — ADMIN MODULE: OFFLINE-FIRST TWO-WAY SYNC ENGINE
 * File: js/admin/admin-sync.js
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

    function initSyncEngine() {
        // Muat antrean pending dan riwayat sync dari localStorage
        try {
            const savedQueue = localStorage.getItem(admin.STORAGE_KEYS.SYNC_QUEUE);
            if (savedQueue) {
                const parsed = JSON.parse(savedQueue);
                if (Array.isArray(parsed)) admin.syncQueue = parsed;
            }
            const savedHist = localStorage.getItem(admin.STORAGE_KEYS.SYNC_HISTORY);
            if (savedHist) {
                const parsed = JSON.parse(savedHist);
                if (Array.isArray(parsed)) admin.syncHistory = parsed;
            }
            admin.lastSyncTimestamp = localStorage.getItem(admin.STORAGE_KEYS.LAST_SYNC) || null;
        } catch (e) {
            console.warn('[SDW_SYNC] Gagal inisialisasi antrean:', e);
        }

        // Event listener status jaringan online/offline
        if (typeof window !== 'undefined') {
            window.addEventListener('online', function () {
                console.log('[SDW_SYNC] Koneksi internet terhubung kembali.');
                updateSyncUI();
                if (admin.syncQueue.length > 0) {
                    admin.showToast(`🌐 Online: Mengirim ${admin.syncQueue.length} mutasi tertunda ke database...`);
                    flushSyncQueue();
                } else {
                    admin.showToast('🌐 Koneksi internet aktif. Menarik data terbaru dari database...');
                    pullCloudDatabase();
                }
            });

            window.addEventListener('offline', function () {
                console.warn('[SDW_SYNC] Perangkat beralih ke mode offline.');
                updateSyncUI();
                admin.showToast('⚠️ Mode offline aktif: Perubahan akan disimpan di antrean lokal.');
            });
        }

        // Tampilkan status awal di UI
        updateSyncUI();

        // Jika online dan ada antrean tertunda dari sesi sebelumnya, otomatis flush
        if (typeof navigator !== 'undefined' && navigator.onLine && admin.syncQueue.length > 0) {
            setTimeout(flushSyncQueue, 1500);
        } else if (typeof navigator !== 'undefined' && navigator.onLine) {
            // Auto-pull data terbaru dari Google Spreadsheet saat dibuka
            setTimeout(pullCloudDatabase, 1000);
        }
    }

    /**
     * PULL DATA TERBARU DARI GOOGLE SPREADSHEET (Two-Way Sync / Cloud Hydration)
     */
    async function pullCloudDatabase() {
        if (typeof SDW_API === 'undefined' || typeof SDW_API.get !== 'function') {
            console.warn('[SDW_SYNC] SDW_API tidak tersedia untuk pull cloud database.');
            return false;
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            admin.showToast('⚠️ Perangkat offline: Menggunakan cache lokal.');
            return false;
        }

        admin.isSyncing = true;
        updateSyncUI();
        admin.showToast('⏳ Menarik data live terbaru dari Google Spreadsheet...');

        try {
            const [leadsRes, regsRes, paysRes, manifestRes] = await Promise.allSettled([
                SDW_API.get('getLeads'),
                SDW_API.get('getRegistrations'),
                SDW_API.get('getPayments'),
                SDW_API.get('getManifest')
            ]);

            let pulledCount = 0;

            if (leadsRes.status === 'fulfilled' && leadsRes.value && leadsRes.value.success && Array.isArray(leadsRes.value.data) && leadsRes.value.data.length > 0) {
                admin.leadsData = leadsRes.value.data;
                admin.persistStorage(admin.STORAGE_KEYS.LEADS, admin.leadsData);
                pulledCount += admin.leadsData.length;
            }

            if (regsRes.status === 'fulfilled' && regsRes.value && regsRes.value.success && Array.isArray(regsRes.value.data) && regsRes.value.data.length > 0) {
                admin.registrationsData = regsRes.value.data;
                admin.persistStorage(admin.STORAGE_KEYS.REGS, admin.registrationsData);
                pulledCount += admin.registrationsData.length;
            }

            if (paysRes.status === 'fulfilled' && paysRes.value && paysRes.value.success && Array.isArray(paysRes.value.data) && paysRes.value.data.length > 0) {
                admin.paymentsData = paysRes.value.data;
                admin.persistStorage(admin.STORAGE_KEYS.PAYMENTS, admin.paymentsData);
                pulledCount += admin.paymentsData.length;
            }

            if (manifestRes.status === 'fulfilled' && manifestRes.value && manifestRes.value.success && manifestRes.value.data) {
                if (Array.isArray(manifestRes.value.data.members) && manifestRes.value.data.members.length > 0) {
                    admin.manifestData = manifestRes.value.data.members;
                    admin.persistStorage(admin.STORAGE_KEYS.MANIFEST, admin.manifestData);
                    pulledCount += admin.manifestData.length;
                }
            }

            const nowIso = new Date().toISOString();
            admin.lastSyncTimestamp = nowIso;
            admin.persistStorage(admin.STORAGE_KEYS.LAST_SYNC, admin.lastSyncTimestamp);

            // Re-render modul admin yang sedang aktif
            if (typeof admin.renderCRM === 'function') admin.renderCRM();
            if (typeof admin.renderRegistrations === 'function') admin.renderRegistrations();
            if (typeof admin.renderFinance === 'function') admin.renderFinance();
            if (typeof admin.renderOperations === 'function') admin.renderOperations();

            admin.showToast(`✅ Berhasil menarik ${pulledCount} entri live dari Google Spreadsheet!`);
            console.info(`[SDW_SYNC] pullCloudDatabase selesai. Total entri termuat: ${pulledCount}`);
            return true;
        } catch (err) {
            console.error('[SDW_SYNC] Gagal menarik data dari Google Spreadsheet:', err);
            admin.showToast('⚠️ Gagal terhubung ke Spreadsheet: ' + (err.message || 'Koneksi lambat'));
            return false;
        } finally {
            admin.isSyncing = false;
            updateSyncUI();
        }
    }

    /**
     * Enqueue mutation ke offline queue (Optimistic Local State + Background Sync)
     */
    function enqueueMutation(action, payload, entity, entityId) {
        const mutationItem = {
            id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            action: action,
            entity: entity || 'DB_General',
            entityId: entityId || (payload && (payload.id || payload.leadId || payload.regId || payload.paymentId || 'UNKNOWN')),
            payload: payload,
            actor: `${admin.currentRole.replace('_', ' ')} (SDW Staf)`,
            queuedAt: new Date().toISOString(),
            status: 'PENDING',
            retryCount: 0,
            lastError: null
        };

        admin.syncQueue.push(mutationItem);
        admin.persistStorage(admin.STORAGE_KEYS.SYNC_QUEUE, admin.syncQueue);
        updateSyncUI();

        console.info(`[SDW_SYNC] Mutasi ${mutationItem.id} [${action}] masuk antrean.`);

        // Jika online, jadwalkan background auto-flush cepat (300ms debounce)
        if (typeof navigator !== 'undefined' && navigator.onLine && !admin.isSyncing) {
            setTimeout(flushSyncQueue, 300);
        }
    }

    /**
     * Flush antrean mutasi ke backend Apps Script via SDW_API.post('syncBatch')
     */
    async function flushSyncQueue() {
        if (admin.isSyncing || admin.syncQueue.length === 0) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            console.info('[SDW_SYNC] Perangkat offline, menunda flush antrean.');
            updateSyncUI();
            return;
        }

        admin.isSyncing = true;
        updateSyncUI();

        const batchToProcess = admin.syncQueue.slice(0, 25); // Batch sampai 25 mutasi per request
        const batchIds = batchToProcess.map(m => m.id);

        try {
            console.info(`[SDW_SYNC] Memulai syncBatch dengan ${batchToProcess.length} mutasi...`);
            const res = await (typeof SDW_API !== 'undefined' ? SDW_API.post('syncBatch', {
                mutations: batchToProcess,
                actor: `${admin.currentRole} (SDW Staf)`
            }) : Promise.resolve({ success: true, data: { processed: batchToProcess.length } }));

            if (res && res.success) {
                const nowIso = new Date().toISOString();
                admin.lastSyncTimestamp = nowIso;
                admin.persistStorage(admin.STORAGE_KEYS.LAST_SYNC, admin.lastSyncTimestamp);

                // Tandai berhasil dan masukkan ke riwayat sinkronisasi lokal (maks 25 entri)
                batchToProcess.forEach(m => {
                    m.status = 'SYNCED';
                    m.syncedAt = nowIso;
                });
                admin.syncHistory = [...batchToProcess, ...admin.syncHistory].slice(0, 25);
                admin.persistStorage(admin.STORAGE_KEYS.SYNC_HISTORY, admin.syncHistory);

                // Hapus mutasi yang telah tersinkron dari antrean aktif
                admin.syncQueue = admin.syncQueue.filter(m => !batchIds.includes(m.id));
                admin.persistStorage(admin.STORAGE_KEYS.SYNC_QUEUE, admin.syncQueue);

                console.info(`[SDW_SYNC] Batch sync sukses: ${batchToProcess.length} mutasi telah terkirim.`);
            } else {
                throw new Error((res && res.error) || 'Gagal memproses respons batch sync');
            }
        } catch (err) {
            console.error('[SDW_SYNC] Gagal mengirim antrean mutasi:', err);
            // Tingkatkan counter retry
            batchToProcess.forEach(m => {
                m.retryCount = (m.retryCount || 0) + 1;
                m.lastError = err.message || 'Koneksi gagal';
                m.status = 'FAILED';
            });
            admin.persistStorage(admin.STORAGE_KEYS.SYNC_QUEUE, admin.syncQueue);
        } finally {
            admin.isSyncing = false;
            updateSyncUI();

            // Jika masih ada sisa antrean dan masih online, jadwalkan batch berikutnya
            if (admin.syncQueue.length > 0 && typeof navigator !== 'undefined' && navigator.onLine) {
                setTimeout(flushSyncQueue, 1000);
            }
        }
    }

    /**
     * Memperbarui visual indikator sync (Header pill, Dashboard badge, Modal list)
     */
    function updateSyncUI() {
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        const pendingCount = admin.syncQueue.length;

        // 1. Header Pill: #adminSyncButton, #adminSyncIndicator, #adminSyncText
        const headerBtn = document.getElementById('adminSyncButton');
        const headerIndicator = document.getElementById('adminSyncIndicator');
        const headerText = document.getElementById('adminSyncText');

        if (headerBtn && headerIndicator && headerText) {
            if (!isOnline) {
                headerBtn.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition cursor-pointer";
                headerIndicator.className = "w-2 h-2 rounded-full bg-rose-500";
                headerText.textContent = pendingCount > 0 ? `Offline (${pendingCount} Tertunda)` : `Offline (Mode Antrean)`;
            } else if (admin.isSyncing) {
                headerBtn.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition cursor-pointer";
                headerIndicator.className = "w-2 h-2 rounded-full bg-blue-500 animate-spin";
                headerText.textContent = `Menyinkronkan...`;
            } else if (pendingCount > 0) {
                headerBtn.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition cursor-pointer";
                headerIndicator.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
                headerText.textContent = `${pendingCount} Menunggu Sinkron`;
            } else {
                headerBtn.className = "hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition cursor-pointer";
                headerIndicator.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
                headerText.textContent = `Live DB Synced`;
            }
        }

        // 2. Dashboard Badge: #dashSyncBadge, #dashSyncIndicator, #dashSyncText
        const dashBadge = document.getElementById('dashSyncBadge');
        const dashIndicator = document.getElementById('dashSyncIndicator');
        const dashText = document.getElementById('dashSyncText');

        if (dashBadge && dashIndicator && dashText) {
            if (!isOnline) {
                dashBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer";
                dashIndicator.className = "w-2 h-2 rounded-full bg-rose-500";
                dashText.textContent = `Offline (${pendingCount} Pending)`;
            } else if (admin.isSyncing) {
                dashBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer";
                dashIndicator.className = "w-2 h-2 rounded-full bg-blue-500 animate-spin";
                dashText.textContent = `Sinkronisasi Batch...`;
            } else if (pendingCount > 0) {
                dashBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition cursor-pointer";
                dashIndicator.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
                dashText.textContent = `${pendingCount} Antrean Belum Sync`;
            } else {
                dashBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer";
                dashIndicator.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
                dashText.textContent = `22 Sheet Database Live`;
            }
        }

        // 3. Render Modal Konten jika modal terbuka
        renderSyncStatusModal();
    }

    /**
     * Render isi modal #modalSyncStatus
     */
    function renderSyncStatusModal() {
        const netStatus = document.getElementById('syncNetworkStatus');
        const pendBadge = document.getElementById('syncPendingBadge');
        const pendCount = document.getElementById('syncPendingCount');
        const lastTimeEl = document.getElementById('syncLastTime');
        const histCountEl = document.getElementById('syncHistoryCount');
        const queueContainer = document.getElementById('syncQueueContainer');
        const btnSync = document.getElementById('btnTriggerManualSync');
        const btnSyncText = document.getElementById('btnTriggerSyncText');

        if (!queueContainer) return;

        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        if (netStatus) {
            netStatus.innerHTML = isOnline
                ? `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online (Tersambung)`
                : `<span class="w-2 h-2 rounded-full bg-rose-500"></span> Terputus (Mode Offline)`;
            netStatus.className = isOnline ? "text-xs font-black text-emerald-700 flex items-center gap-1.5" : "text-xs font-black text-rose-700 flex items-center gap-1.5";
        }

        if (pendBadge) pendBadge.textContent = admin.syncQueue.length;
        if (pendCount) {
            pendCount.innerHTML = `<span class="px-1.5 py-0.5 rounded ${admin.syncQueue.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'} font-mono text-[11px]">${admin.syncQueue.length}</span> Mutasi ${admin.syncQueue.length > 0 ? 'Tertunda' : 'Pending'}`;
        }

        if (lastTimeEl) {
            if (admin.lastSyncTimestamp) {
                const diffSec = Math.floor((Date.now() - new Date(admin.lastSyncTimestamp).getTime()) / 1000);
                if (diffSec < 60) lastTimeEl.textContent = 'Baru Saja (< 1 mnt)';
                else if (diffSec < 3600) lastTimeEl.textContent = `${Math.floor(diffSec / 60)} menit lalu`;
                else lastTimeEl.textContent = new Date(admin.lastSyncTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            } else {
                lastTimeEl.textContent = 'Belum Ada';
            }
        }

        if (histCountEl) {
            histCountEl.textContent = `${admin.syncHistory.length} mutasi berhasil disinkronkan`;
        }

        if (btnSync && btnSyncText) {
            btnSync.disabled = admin.isSyncing || !isOnline;
            btnSyncText.textContent = admin.isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang';
        }

        // Render daftar item dalam antrean
        if (admin.syncQueue.length === 0) {
            queueContainer.innerHTML = `
                <div class="py-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div class="text-xs font-bold text-slate-700">Semua Data Telah Tersinkronisasi</div>
                    <p class="text-[11px] text-slate-400 max-w-xs">Tidak ada mutasi yang tertunda. Portal admin terhubung langsung dengan Google Apps Script backend.</p>
                </div>
            `;
        } else {
            queueContainer.innerHTML = admin.syncQueue.map((m, idx) => `
                <div class="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <span class="w-6 h-6 rounded-md ${m.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-sdw-pine'} flex items-center justify-center font-bold text-[10px]">
                            ${idx + 1}
                        </span>
                        <div class="min-w-0">
                            <div class="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                                <span>${admin.escapeHtml(m.action)}</span>
                                <span class="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">${admin.escapeHtml(m.entityId || m.entity)}</span>
                            </div>
                            <div class="text-[10px] text-slate-400">
                                Antre: ${new Date(m.queuedAt).toLocaleTimeString('id-ID')} &bull; Oleh: ${admin.escapeHtml(m.actor)}
                                ${m.retryCount > 0 ? `<span class="text-rose-600 font-semibold ml-1">(Retry #${m.retryCount})</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                        ${m.status}
                    </span>
                </div>
            `).join('');
        }
    }

    function openSyncStatusModal() {
        admin.openModal('modalSyncStatus');
        renderSyncStatusModal();
    }

    function triggerManualSync() {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            admin.showToast('⚠️ Tidak dapat menyinkronkan: Perangkat sedang offline.');
            return;
        }
        if (admin.syncQueue.length === 0) {
            admin.showToast('ℹ️ Antrean kosong: Semua data sudah tersinkronisasi sempurna.');
            return;
        }
        admin.showToast('🔄 Memulai sinkronisasi manual ke Google Apps Script...');
        flushSyncQueue();
    }

    function clearSyncHistory() {
        admin.syncHistory = [];
        admin.persistStorage(admin.STORAGE_KEYS.SYNC_HISTORY, admin.syncHistory);
        renderSyncStatusModal();
        admin.showToast('🗑️ Riwayat sinkronisasi lokal berhasil dibersihkan.');
    }


    // Attach all exported functions to admin
    admin.initSyncEngine = initSyncEngine;
    admin.enqueueMutation = enqueueMutation;
    admin.flushSyncQueue = flushSyncQueue;
    admin.pullCloudDatabase = pullCloudDatabase;
    admin.updateSyncUI = updateSyncUI;
    admin.renderSyncStatusModal = renderSyncStatusModal;
    admin.openSyncStatusModal = openSyncStatusModal;
    admin.triggerManualSync = triggerManualSync;
    admin.clearSyncHistory = clearSyncHistory;
    admin.getSyncQueue = () => admin.syncQueue;
    admin.getSyncHistory = () => admin.syncHistory;

    if (typeof window !== 'undefined') {
        window.triggerCloudPull = pullCloudDatabase;
    }

    return admin;
});
