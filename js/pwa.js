/**
 * SDW UMROH — Progressive Web App (PWA) & Mobile Super-App Controller
 * - Referensi Desain & Arsitektur: PPTQ Asnawiyyah & MTs YASUA
 * - Dual-Mode Experience: Web Profil Mewah (Desktop) vs Islamic App Dashboard (Mobile PWA)
 * - Service Worker Registration & Resilient Offline Caching
 * - PWA Install Prompts (Android & iPhone / iOS Safari)
 * - Real-time Islamic Clock, Haramain Prayer Times & Hijri Calendar
 * - Floating Mobile Bottom Dock (5 Tab) & Settings Modal
 * - Modul Doa Manasik & Thawaf/Sa'i Offline (Siap di Tanah Suci)
 */

(function () {
  'use strict';

  // 1. Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SDW PWA] Service Worker registered:', reg.scope);
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdateToast();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[SDW PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 2. Detection (iOS, Android, Standalone)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  let isUrlPwa = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    isUrlPwa = urlParams.get('source') === 'pwa' || urlParams.get('mode') === 'app';
  } catch (e) {}

  function isRunningStandalone() {
    if (isUrlPwa) return true;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      Boolean(document.referrer && document.referrer.includes('android-app://'))
    );
  }

  const savedMode = localStorage.getItem('sdw_preview_mode');
  const isStandalone = isUrlPwa
    ? true
    : savedMode === 'app'
    ? true
    : savedMode === 'web'
    ? false
    : isRunningStandalone();

  function applyStandaloneMode() {
    if (document.body) {
      document.body.classList.add('is-pwa-standalone');
    }
    if (document.documentElement) {
      document.documentElement.classList.add('is-pwa-standalone');
    }
  }

  if (isStandalone) {
    if (document.body) {
      applyStandaloneMode();
    } else {
      document.addEventListener('DOMContentLoaded', applyStandaloneMode);
    }
  }

  // Apply saved text size
  const savedFontSize = localStorage.getItem('sdw_text_size');
  if (savedFontSize === 'large') {
    document.documentElement.classList.add('text-lg-active');
  }

  let deferredPrompt = null;

  // Listen for Chrome/Edge install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[SDW PWA] beforeinstallprompt captured');

    document.querySelectorAll('.pwa-install-btn').forEach((btn) => btn.classList.remove('hidden'));

    const dismissed = localStorage.getItem('sdw_pwa_dismissed');
    const now = Date.now();
    if (!isStandalone && (!dismissed || now - parseInt(dismissed, 10) > 7 * 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        showPwaPrompt();
      }, 3500);
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[SDW PWA] Aplikasi SDW UMROH terpasang!');
    deferredPrompt = null;
    hidePwaPrompt();
    showToast('Aplikasi SDW UMROH berhasil dipasang di layar HP Anda!');
    localStorage.setItem('sdw_pwa_installed', 'true');
    document.body.classList.add('is-pwa-standalone');
    updateSettingsPwaStatus();
  });

  // 3. UI Injections (Install Banner, iOS Modal, Bottom Dock, Settings Modal, Doa Modal)
  function createPwaUI() {
    // A. Floating Install Banner
    if (!document.getElementById('pwaInstallPrompt')) {
      const banner = document.createElement('div');
      banner.id = 'pwaInstallPrompt';
      banner.className =
        'fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 transform translate-y-36 opacity-0 transition-all duration-300 pointer-events-none';
      banner.innerHTML = `
        <div class="glass-nav bg-[#0F281E]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-gold-500/30 flex items-center gap-3 pointer-events-auto">
          <img src="/assets/icon-192.png" alt="Logo SDW UMROH" class="w-11 h-11 rounded-xl object-contain shadow-xs bg-[#143528] p-1 shrink-0 border border-gold-500/40">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs sm:text-sm font-bold text-gold-400 leading-tight truncate">Pasang Aplikasi SDW UMROH</h4>
            <p class="text-[11px] text-emerald-200/80 line-clamp-2 mt-0.5">Panduan doa manasik offline &amp; cek sisa kursi kloter langsung dari layar HP.</p>
          </div>
          <div class="flex flex-col gap-1.5 shrink-0">
            <button id="pwaAcceptBtn" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-xs transition-colors cursor-pointer text-center">
              Pasang
            </button>
            <button id="pwaDismissBtn" class="px-3 py-1 rounded-xl text-emerald-400 hover:text-white text-[10px] font-semibold transition-colors cursor-pointer text-center">
              Nanti
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(banner);

      document.getElementById('pwaAcceptBtn')?.addEventListener('click', window.triggerPwaInstall);
      document.getElementById('pwaDismissBtn')?.addEventListener('click', () => {
        hidePwaPrompt();
        localStorage.setItem('sdw_pwa_dismissed', Date.now().toString());
      });
    }

    // B. Universal Instructions Modal (iOS Safari & Android)
    if (!document.getElementById('pwaInstructionModal')) {
      const modal = document.createElement('div');
      modal.id = 'pwaInstructionModal';
      modal.className =
        'fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 transition-opacity';
      modal.innerHTML = `
        <div class="bg-[#0F281E] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gold-500/30 transform transition-all text-emerald-100 animate-in fade-in zoom-in-95">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <img src="/assets/icon-192.png" alt="SDW UMROH" class="w-12 h-12 rounded-2xl p-1 bg-[#143528] border border-gold-500/40 shadow-xs">
              <div>
                <h3 class="font-bold text-base sm:text-lg text-gold-400">Instal Aplikasi SDW UMROH</h3>
                <p class="text-xs text-emerald-300/80">Panduan untuk HP Android &amp; iPhone (iOS)</p>
              </div>
            </div>
            <button onclick="window.closePWAInstructionModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div id="pwaModalContent" class="space-y-3.5 text-xs sm:text-sm text-emerald-200/90">
            <!-- Content injected dynamically based on device -->
          </div>

          <div class="mt-5 pt-3 border-t border-gold-500/20 flex items-center justify-between">
            <span class="text-[11px] text-gold-400/80 font-medium">✨ Akses Doa Offline di Tanah Suci</span>
            <button onclick="window.closePWAInstructionModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-colors cursor-pointer">
              Mengerti
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // C. Modal Panduan Doa Manasik Offline
    if (!document.getElementById('doaOfflineModal')) {
      const doaModal = document.createElement('div');
      doaModal.id = 'doaOfflineModal';
      doaModal.className =
        'fixed inset-0 z-50 hidden bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 transition-opacity';
      doaModal.innerHTML = `
        <div class="bg-[#0A1C14] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gold-500/40 transform transition-all text-emerald-100 max-h-[88vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-gold-500/20 mb-3 shrink-0">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/30 text-lg">
                📖
              </div>
              <div>
                <h3 class="font-bold text-base text-gold-400 leading-tight">Buku Saku Doa Manasik</h3>
                <p class="text-[11px] text-emerald-300/80">Panduan Thawaf &amp; Sa'i (Dapat Dibuka Offline)</p>
              </div>
            </div>
            <button onclick="window.closeDoaModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Body Tabs -->
          <div class="flex gap-2 mb-3 shrink-0">
            <button onclick="window.switchDoaTab('niat')" id="tabNiatBtn" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-gold-500 text-slate-950 transition-all cursor-pointer text-center">Niat Ihram</button>
            <button onclick="window.switchDoaTab('talbiyah')" id="tabTalbiyahBtn" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white/5 text-emerald-200 border border-white/10 transition-all cursor-pointer text-center">Talbiyah</button>
            <button onclick="window.switchDoaTab('thawaf')" id="tabThawafBtn" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white/5 text-emerald-200 border border-white/10 transition-all cursor-pointer text-center">Thawaf</button>
            <button onclick="window.switchDoaTab('sai')" id="tabSaiBtn" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white/5 text-emerald-200 border border-white/10 transition-all cursor-pointer text-center">Sa'i</button>
          </div>

          <!-- Content (Scrollable) -->
          <div id="doaContentArea" class="flex-1 overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-emerald-100">
            <!-- Injected dynamically -->
          </div>

          <!-- Footer -->
          <div class="mt-4 pt-3 border-t border-gold-500/20 flex items-center justify-between shrink-0">
            <span class="text-[11px] text-emerald-400/80">Disusun sesuai Sunnah Rasulullah SAW</span>
            <button onclick="window.closeDoaModal()" class="px-4 py-1.5 rounded-xl bg-gold-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-colors cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(doaModal);
    }

    // D. Settings Modal
    if (!document.getElementById('settingsModal')) {
      const settingsModal = document.createElement('div');
      settingsModal.id = 'settingsModal';
      settingsModal.className =
        'fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 transition-opacity';
      settingsModal.innerHTML = `
        <div class="bg-[#0F281E] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gold-500/30 transform transition-all text-emerald-100 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-gold-500/20 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/30 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-base text-gold-400 leading-tight">Pengaturan Aplikasi</h3>
                <p class="text-[11px] text-emerald-300/80">SDW UMROH &bull; PWA Super-App v1.0</p>
              </div>
            </div>
            <button onclick="window.closeSettingsModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-300 flex items-center justify-center cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="space-y-3.5">
            <!-- 1. Pilihan Gaya Tampilan Mobile -->
            <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-gold-300 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span>Gaya Tampilan Mobile</span>
                </span>
                <span id="currentModeLabel" class="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/10 text-emerald-300 font-bold">Otomatis</span>
              </div>
              <p class="text-[11px] text-emerald-300/70 mb-2.5">Pilih tampilan Dashboard Aplikasi (ala Asnawiyyah) atau Web Profil Lengkap.</p>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="window.setMobileExperienceMode('app')" class="py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center bg-gold-500/20 text-gold-300 border-gold-500/50 shadow-2xs">
                  Dashboard App
                </button>
                <button onclick="window.setMobileExperienceMode('web')" class="py-2 px-3 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-emerald-200 hover:bg-white/10 transition-all cursor-pointer text-center">
                  Web Profil
                </button>
              </div>
            </div>

            <!-- 2. Aksesibilitas: Ukuran Teks Bacaan (Lansia-Friendly) -->
            <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-gold-300 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 5v14M16 11h5M18.5 11v8"/></svg>
                  <span>Ukuran Teks Bacaan</span>
                </span>
                <span id="currentFontSizeLabel" class="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/10 text-emerald-300 font-bold">Normal</span>
              </div>
              <p class="text-[11px] text-emerald-300/70 mb-2.5">Sangat membantu jamaah lansia agar doa dan jadwal terbaca lebih nyaman.</p>
              <div class="grid grid-cols-2 gap-2">
                <button id="fontNormalBtn" onclick="window.setFontSize('normal')" class="py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center">
                  A (Normal)
                </button>
                <button id="fontLargeBtn" onclick="window.setFontSize('large')" class="py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center">
                  A+ (Lebih Besar)
                </button>
              </div>
            </div>

            <!-- 3. Status PWA & Cache -->
            <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5">
              <span class="text-xs font-bold text-gold-300 flex items-center gap-2 mb-1">
                <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Sinkronisasi Data Kloter</span>
              </span>
              <p class="text-[11px] text-emerald-300/70 mb-2.5">Segarkan data jadwal kloter dan kuota seat terbaru dari server pusat.</p>
              <button onclick="window.refreshAppCache()" class="w-full py-2 px-3 rounded-xl bg-white/5 border border-gold-500/30 hover:bg-gold-500/10 text-gold-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <svg class="w-3.5 h-3.5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Bersihkan Cache &amp; Muat Ulang</span>
              </button>
            </div>

            <!-- 4. Mode Peran Pengguna (Role Switcher Testing Backoffice & Jamaah) -->
            <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-bold text-gold-300 flex items-center gap-2">
                  <svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>Simulasi Peran Pengguna</span>
                </span>
                <span id="settingsCurrentRoleBadge" class="text-[10px] bg-gold-500/20 px-2 py-0.5 rounded-full border border-gold-500/30 text-gold-300 font-bold">PILGRIM</span>
              </div>
              <p class="text-[11px] text-emerald-300/70 mb-2.5">Ganti hak akses untuk menguji tampilan Jamaah, Sales, Muthawwif, atau Admin.</p>
              <select id="settingsRoleSelect" onchange="if(typeof SDW_AUTH!=='undefined'){SDW_AUTH.setRole(this.value); window.updateSettingsRoleUI();}" class="w-full py-2.5 px-3 rounded-xl bg-[#143528] border border-gold-500/30 text-white text-xs font-bold outline-none cursor-pointer">
                <option value="PILGRIM">Jamaah (Pilgrim)</option>
                <option value="SALES">Sales / Marketing</option>
                <option value="DOCUMENT_OFFICER">Document Officer</option>
                <option value="FINANCE">Finance Staff</option>
                <option value="OPERATIONS">Operations Kloter</option>
                <option value="TOUR_LEADER">Tour Leader</option>
                <option value="MUTHAWWIF">Muthawwif</option>
                <option value="PARTNER">Mitra / Agen</option>
                <option value="ADMIN">Admin Sistem</option>
                <option value="OWNER">Executive Owner</option>
              </select>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(settingsModal);
    }
  }

  function showPwaPrompt() {
    if (isStandalone) return;
    const banner = document.getElementById('pwaInstallPrompt');
    if (banner) {
      banner.classList.remove('translate-y-36', 'opacity-0', 'pointer-events-none');
      banner.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  }

  function hidePwaPrompt() {
    const banner = document.getElementById('pwaInstallPrompt');
    if (banner) {
      banner.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      banner.classList.add('translate-y-36', 'opacity-0', 'pointer-events-none');
    }
  }

  // 4. Trigger Install Actions
  window.triggerPwaInstall = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[SDW PWA] User accepted install prompt');
        }
        deferredPrompt = null;
        hidePwaPrompt();
        updateSettingsPwaStatus();
      });
    } else {
      window.openPWAInstructionModal();
    }
  };

  window.openPWAInstructionModal = function () {
    const modal = document.getElementById('pwaInstructionModal');
    const content = document.getElementById('pwaModalContent');
    if (!modal || !content) return;

    if (isIOS) {
      content.innerHTML = `
        <div class="p-3 bg-gold-500/10 rounded-2xl border border-gold-500/30 mb-2">
          <p class="font-bold text-gold-300 text-xs">Pengguna iPhone / iPad (Safari):</p>
          <p class="text-[11.5px] text-emerald-200 mt-0.5">3 langkah mudah untuk memasang ke layar utama HP Anda:</p>
        </div>
        <ol class="space-y-2.5 pl-1">
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
            <span>Ketuk tombol <strong>Bagikan (Share)</strong> <svg class="inline-block w-4 h-4 text-blue-400 align-text-bottom" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg> di bilah bawah Safari.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
            <span>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
            <span>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Ikon SDW UMROH siap dibuka secepat aplikasi native!</span>
          </li>
        </ol>
      `;
    } else {
      content.innerHTML = `
        <div class="p-3 bg-gold-500/10 rounded-2xl border border-gold-500/30 mb-2">
          <p class="font-bold text-gold-300 text-xs">Pengguna Android (Google Chrome):</p>
          <p class="text-[11.5px] text-emerald-200 mt-0.5">Pasang aplikasi instan tanpa perlu download dari Play Store:</p>
        </div>
        <ol class="space-y-2.5 pl-1">
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">1</span>
            <span>Ketuk menu titik tiga (<strong>&vellip;</strong>) di pojok kanan atas Google Chrome.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">2</span>
            <span>Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</span>
          </li>
          <li class="flex items-start gap-2.5">
            <span class="w-6 h-6 rounded-full bg-gold-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">3</span>
            <span>Aplikasi SDW UMROH langsung terpasang dan siap digunakan offline!</span>
          </li>
        </ol>
      `;
    }

    modal.classList.remove('hidden');
    hidePwaPrompt();
  };

  window.closePWAInstructionModal = function () {
    const modal = document.getElementById('pwaInstructionModal');
    if (modal) modal.classList.add('hidden');
  };

  // 5. Settings Modal Controls
  window.updateSettingsRoleUI = function () {
    const role = (typeof SDW_AUTH !== 'undefined' && SDW_AUTH.getCurrentRole)
      ? SDW_AUTH.getCurrentRole()
      : (localStorage.getItem('sdw_user_role') || 'PILGRIM');
    const badge = document.getElementById('settingsCurrentRoleBadge');
    const sel = document.getElementById('settingsRoleSelect');
    if (badge) badge.textContent = role.replace('_', ' ');
    if (sel) sel.value = role;
  };

  window.showNotificationToast = function (msg) {
    let toast = document.getElementById('sdw-notif-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sdw-notif-toast';
      toast.className =
        'fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#0A1C14]/95 text-emerald-100 p-4 rounded-2xl shadow-2xl border border-gold-500/40 backdrop-blur-md transition-all duration-300 transform -translate-y-8 opacity-0 pointer-events-none flex items-start gap-3';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30 text-sm">
        <i class="fa-solid fa-bell"></i>
      </div>
      <div class="flex-1 min-w-0">
        <h5 class="text-xs font-extrabold text-amber-300">Pemberitahuan Manasik</h5>
        <p class="text-xs text-slate-200 mt-0.5 leading-snug">${msg}</p>
      </div>
      <button onclick="document.getElementById('sdw-notif-toast').classList.add('-translate-y-8', 'opacity-0')" class="text-slate-400 hover:text-white text-xs p-1 cursor-pointer">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    toast.classList.remove('-translate-y-8', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');

    setTimeout(() => {
      if (toast) {
        toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        toast.classList.add('-translate-y-8', 'opacity-0', 'pointer-events-none');
      }
    }, 6000);
  };

  window.openSettingsModal = function () {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    updateSettingsPwaStatus();
    updateFontSizeUI();
    window.updateSettingsRoleUI();
    const modeLabel = document.getElementById('currentModeLabel');
    if (modeLabel) {
      modeLabel.textContent = document.body.classList.contains('is-pwa-standalone')
        ? 'Dashboard App'
        : 'Web Profil';
    }
    modal.classList.remove('hidden');
    hidePwaPrompt();
  };

  window.closeSettingsModal = function () {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('hidden');
  };

  window.setMobileExperienceMode = function (mode) {
    if (mode === 'app') {
      document.body.classList.add('is-pwa-standalone');
      localStorage.setItem('sdw_preview_mode', 'app');
      showToast('Beralih ke tampilan Dashboard Aplikasi (Super-App).');
    } else {
      document.body.classList.remove('is-pwa-standalone');
      localStorage.setItem('sdw_preview_mode', 'web');
      showToast('Beralih ke tampilan Web Profil Lengkap.');
    }
    window.closeSettingsModal();
  };

  function updateSettingsPwaStatus() {
    const label = document.getElementById('currentModeLabel');
    if (label) {
      label.textContent = document.body.classList.contains('is-pwa-standalone')
        ? 'Dashboard App'
        : 'Web Profil';
    }
  }

  // Font Size Settings
  window.setFontSize = function (size) {
    if (size === 'large') {
      document.documentElement.classList.add('text-lg-active');
      localStorage.setItem('sdw_text_size', 'large');
    } else {
      document.documentElement.classList.remove('text-lg-active');
      localStorage.setItem('sdw_text_size', 'normal');
    }
    updateFontSizeUI();
    showToast(`Ukuran teks: ${size === 'large' ? 'Lebih Besar (Lansia-Friendly)' : 'Normal'}`);
  };

  function updateFontSizeUI() {
    const isLarge = document.documentElement.classList.contains('text-lg-active');
    const label = document.getElementById('currentFontSizeLabel');
    const normalBtn = document.getElementById('fontNormalBtn');
    const largeBtn = document.getElementById('fontLargeBtn');

    if (label) label.textContent = isLarge ? 'Lebih Besar (+10%)' : 'Normal';

    if (normalBtn) {
      if (!isLarge) {
        normalBtn.className =
          'py-2 px-3 rounded-xl text-xs font-bold border border-gold-500 bg-gold-500/20 text-gold-300 shadow-2xs transition-all cursor-pointer text-center';
      } else {
        normalBtn.className =
          'py-2 px-3 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-emerald-300 hover:bg-white/10 transition-all cursor-pointer text-center';
      }
    }

    if (largeBtn) {
      if (isLarge) {
        largeBtn.className =
          'py-2 px-3 rounded-xl text-xs font-bold border border-gold-500 bg-gold-500/20 text-gold-300 shadow-2xs transition-all cursor-pointer text-center';
      } else {
        largeBtn.className =
          'py-2 px-3 rounded-xl text-xs font-bold border border-white/10 bg-white/5 text-emerald-300 hover:bg-white/10 transition-all cursor-pointer text-center';
      }
    }
  }

  window.refreshAppCache = function () {
    if ('caches' in window) {
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }).then(() => {
        showToast('Cache diperbarui. Memuat ulang...');
        setTimeout(() => window.location.reload(true), 600);
      });
    } else {
      window.location.reload(true);
    }
  };

  // 6. Doa Manasik Offline Modal Controller
  const doaData = {
    niat: `
      <div class="p-4 bg-emerald-950/40 rounded-2xl border border-gold-500/30 space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">Lafadz Niat Umroh</span>
        <p class="text-right text-lg font-serif text-amber-200 leading-loose pt-2">لَبَّيْكَ اللَّهُمَّ عُمْرَةً</p>
        <p class="text-xs text-gold-300 italic">"Labbaikallaahumma 'umratan"</p>
        <p class="text-xs text-emerald-100/90 pt-1"><strong>Artinya:</strong> "Aku penuhi panggilan-Mu ya Allah untuk berumroh."</p>
      </div>
      <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5 text-xs text-emerald-200/80">
        💡 <strong>Adab Berihram:</strong> Dibaca saat berada di Miqat setelah mandi sunnah ihram dan mengenakan pakaian ihram sebelum melintasi garis Miqat.
      </div>
    `,
    talbiyah: `
      <div class="p-4 bg-emerald-950/40 rounded-2xl border border-gold-500/30 space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">Bacaan Talbiyah</span>
        <p class="text-right text-lg font-serif text-amber-200 leading-loose pt-2">لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيْكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيْكَ لَكَ</p>
        <p class="text-xs text-gold-300 italic">"Labbaikallaahumma labbaik, labbaika laa syariika laka labbaik, innal hamda wan ni'mata laka wal mulk, laa syariika lak"</p>
        <p class="text-xs text-emerald-100/90 pt-1"><strong>Artinya:</strong> "Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Tidak ada sekutu bagi-Mu, sesungguhnya pujian, nikmat, dan kerajaan adalah milik-Mu, tiada sekutu bagi-Mu."</p>
      </div>
    `,
    thawaf: `
      <div class="p-4 bg-emerald-950/40 rounded-2xl border border-gold-500/30 space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">Doa Antara Rukun Yamani &amp; Hajar Aswad</span>
        <p class="text-right text-lg font-serif text-amber-200 leading-loose pt-2">رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</p>
        <p class="text-xs text-gold-300 italic">"Rabbanaa aatinaa fid dunyaa hasanah, wa fil aakhirati hasanah, wa qinaa 'adzaaban naar"</p>
        <p class="text-xs text-emerald-100/90 pt-1"><strong>Artinya:</strong> "Wahai Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, serta lindungilah kami dari siksa neraka."</p>
      </div>
      <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5 text-xs text-emerald-200/80">
        💡 <strong>Sunnah Thawaf:</strong> Thawaf dilakukan sebanyak 7 putaran berlawanan arah jarum jam, dimulai dan diakhiri sejajar Hajar Aswad.
      </div>
    `,
    sai: `
      <div class="p-4 bg-emerald-950/40 rounded-2xl border border-gold-500/30 space-y-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">Doa di Bukit Safa &amp; Marwah</span>
        <p class="text-right text-lg font-serif text-amber-200 leading-loose pt-2">إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ</p>
        <p class="text-xs text-gold-300 italic">"Innash shafaa wal marwata min sya'aa-irillaah"</p>
        <p class="text-xs text-emerald-100/90 pt-1">Dilanjutkan menghadap kiblat dan membaca takbir serta tahlil.</p>
      </div>
      <div class="p-3.5 bg-black/20 rounded-2xl border border-white/5 text-xs text-emerald-200/80">
        💡 <strong>Sunnah Sa'i:</strong> Berlari-lari kecil bagi laki-laki di antara dua pilar lampu hijau.
      </div>
    `
  };

  window.openDoaModal = function (tab = 'niat') {
    const modal = document.getElementById('doaOfflineModal');
    if (!modal) return;
    window.switchDoaTab(tab);
    modal.classList.remove('hidden');
  };

  window.closeDoaModal = function () {
    const modal = document.getElementById('doaOfflineModal');
    if (modal) modal.classList.add('hidden');
  };

  window.switchDoaTab = function (tab) {
    const content = document.getElementById('doaContentArea');
    if (!content) return;
    content.innerHTML = doaData[tab] || doaData.niat;

    const tabs = ['niat', 'talbiyah', 'thawaf', 'sai'];
    tabs.forEach((t) => {
      const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
      if (btn) {
        if (t === tab) {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-gold-500 text-slate-950 transition-all cursor-pointer text-center';
        } else {
          btn.className = 'flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-white/5 text-emerald-200 border border-white/10 transition-all cursor-pointer text-center';
        }
      }
    });
  };

  // 7. Clock, Haramain Prayer Times & Hijri Calendar
  function initPrayerAndClockWidget() {
    function updateClockAndPrayer() {
      const now = new Date();

      // Digital Clock WIB
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const clockWib = `${hours}:${mins}:${secs} WIB`;

      // Makkah Clock (WAS = UTC+3, WIB = UTC+7 -> selisih -4 jam)
      const makkahDate = new Date(now.getTime() - 4 * 3600 * 1000);
      const mHours = String(makkahDate.getHours()).padStart(2, '0');
      const mMins = String(makkahDate.getMinutes()).padStart(2, '0');
      const clockMakkah = `${mHours}:${mMins} WAS (Makkah)`;

      const clockEl = document.getElementById('home-digital-clock');
      if (clockEl) clockEl.textContent = clockWib;

      const clockMakkahEl = document.getElementById('home-makkah-clock');
      if (clockMakkahEl) clockMakkahEl.textContent = clockMakkah;

      // Tanggal Masehi
      const dayNames = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jum\'at', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const masehiStr = `${dayNames[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      const masehiEl = document.getElementById('home-date-masehi');
      if (masehiEl) masehiEl.textContent = masehiStr;

      // Tanggal Hijriyah
      const hijriEl = document.getElementById('home-date-hijri');
      if (hijriEl && !hijriEl.textContent.trim()) {
        hijriEl.textContent = '15 Jumadil Ula 1448 H';
      }

      // Waktu Sholat Makkah (Umm al-Qura standard approx)
      const makkahPrayers = [
        { name: 'Subuh Makkah', h: 5, m: 2 },
        { name: 'Terbit', h: 6, m: 18 },
        { name: 'Zuhur Makkah', h: 12, m: 10 },
        { name: 'Ashar Makkah', h: 15, m: 25 },
        { name: 'Maghrib Makkah', h: 17, m: 50 },
        { name: 'Isya Makkah', h: 19, m: 20 }
      ];

      const currentMakkahMins = makkahDate.getHours() * 60 + makkahDate.getMinutes();
      let nextP = makkahPrayers.find((p) => p.h * 60 + p.m > currentMakkahMins);
      if (!nextP) nextP = makkahPrayers[0];

      const prayerNameEl = document.getElementById('home-next-prayer-name');
      const prayerTimeEl = document.getElementById('home-next-prayer-time');
      if (prayerNameEl && prayerTimeEl) {
        prayerNameEl.textContent = nextP.name;
        prayerTimeEl.textContent = `${String(nextP.h).padStart(2, '0')}:${String(nextP.m).padStart(2, '0')} WAS`;
      }
    }

    updateClockAndPrayer();
    setInterval(updateClockAndPrayer, 1000);
  }

  // 8. Toast Helper
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0F281E]/95 text-gold-300 border border-gold-500/40 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300';
    toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  function showUpdateToast() {
    const toast = document.createElement('div');
    toast.className =
      'fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-[#0A1C14] text-white p-3.5 rounded-2xl shadow-2xl border border-gold-500/40 flex items-center justify-between gap-3';
    toast.innerHTML = `
      <div class="text-xs">
        <p class="font-bold text-gold-400">Pembaruan Jadwal Tersedia</p>
        <p class="text-[11px] text-emerald-200/80">Muat ulang untuk melihat jadwal kloter termutakhir.</p>
      </div>
      <button onclick="window.location.reload()" class="px-3 py-1.5 bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer">
        Perbarui
      </button>
    `;
    document.body.appendChild(toast);
  }

  // 9. Banner Auto Slide in App Mode
  function initAppBannerSlider() {
    const track = document.getElementById('appBannerTrack');
    if (!track) return;
    let slideIdx = 0;
    const total = track.children.length;
    if (total <= 1) return;

    setInterval(() => {
      slideIdx = (slideIdx + 1) % total;
      track.style.transform = `translateX(-${slideIdx * 100}%)`;
      // Update dots if present
      document.querySelectorAll('.app-banner-dot').forEach((dot, idx) => {
        if (idx === slideIdx) {
          dot.classList.add('bg-gold-500', 'w-5');
          dot.classList.remove('bg-white/30', 'w-1.5');
        } else {
          dot.classList.remove('bg-gold-500', 'w-5');
          dot.classList.add('bg-white/30', 'w-1.5');
        }
      });
    }, 4500);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createPwaUI();
      initPrayerAndClockWidget();
      initAppBannerSlider();
    });
  } else {
    createPwaUI();
    initPrayerAndClockWidget();
    initAppBannerSlider();
  }
})();
