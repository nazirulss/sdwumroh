/**
 * ====================================================================
 * SDW UMROH — CANONICAL UI COMPONENTS (VANILLA MODERN)
 * File: js/components.js
 * Version: 2.7.0 (Tahap 2: Komponen Antarmuka Terpadu & PWA Hardening)
 * Philosophy: ONE JOURNEY, ONE PLATFORM — SINGLE SOURCE OF TRUTH UI
 * Provides:
 *   1. Canonical Responsive Top Navbar (#mainNavbar) with Scroll Transition
 *   2. Canonical Mobile Bottom Navigation Dock (#mobileBottomBar)
 *   3. Canonical Corporate & Legal Footer (#globalFooter)
 *   4. Mobile Navigation Drawer (#mobileNavDrawer)
 *   5. Dual Clock Ticker (Makkah AST & Jakarta WIB)
 * ====================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SDW_COMPONENTS = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function getActivePageKey(explicitKey) {
        if (explicitKey) return explicitKey.toLowerCase();
        if (typeof window === 'undefined') return 'beranda';

        const path = (window.location.pathname || '').toLowerCase();
        if (path === '/' || path.endsWith('/index.html') || path === '') return 'beranda';
        if (path.includes('/paket')) return 'paket';
        if (path.includes('/jadwal')) return 'jadwal';
        if (path.includes('/hotel')) return 'hotel';
        if (path.includes('/ziarah')) return 'ziarah';
        if (path.includes('/kalkulator')) return 'kalkulator';
        if (path.includes('/koper')) return 'koper';
        if (path.includes('/kiblat')) return 'kiblat';
        if (path.includes('/live')) return 'live';
        if (path.includes('/galeri')) return 'galeri';
        if (path.includes('/tentang') || path.includes('/profil')) return 'tentang';
        if (path.includes('/sambutan')) return 'sambutan';
        if (path.includes('/muthawwif') || path.includes('/guru')) return 'muthawwif';
        if (path.includes('/legalitas') || path.includes('/mou')) return 'legalitas';
        if (path.includes('/faq')) return 'faq';
        if (path.includes('/admin') || path.includes('/backoffice')) return 'admin';
        if (path.includes('/app') || path.includes('/jamaah')) return 'app';
        return 'beranda';
    }

    /**
     * Resolves the primary WhatsApp contact link dynamically from local cache (sdw_admin_contacts)
     * fallback to canonical default WhatsApp if not set.
     */
    function getPrimaryWhatsAppLink() {
        const defaultNum = '6281234567890';
        const defaultMsg = 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi paket umroh.';
        try {
            if (typeof localStorage !== 'undefined') {
                const csRaw = localStorage.getItem('sdw_admin_contact_social');
                if (csRaw) {
                    const cs = JSON.parse(csRaw);
                    if (cs && (cs.whatsapp_clean || cs.whatsapp_number)) {
                        const num = (cs.whatsapp_clean || cs.whatsapp_number).replace(/[^0-9]/g, '');
                        const msg = cs.whatsapp_template || defaultMsg;
                        return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
                    }
                }
                const raw = localStorage.getItem('sdw_admin_contacts');
                if (raw) {
                    const list = JSON.parse(raw);
                    if (Array.isArray(list) && list.length > 0) {
                        const activeList = list.filter(c => (c.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
                        const primary = activeList.find(c => c.is_primary === true || String(c.is_primary).toUpperCase() === 'TRUE') || activeList[0];
                        if (primary && primary.contact_number) {
                            const cleanNum = String(primary.contact_number).replace(/[^0-9]/g, '');
                            const greeting = primary.greeting_message || defaultMsg;
                            return `https://wa.me/${cleanNum}?text=${encodeURIComponent(greeting)}`;
                        }
                    }
                }
            }
        } catch (_) {}
        return `https://wa.me/${defaultNum}?text=${encodeURIComponent(defaultMsg)}`;
    }

    /**
     * Renders the canonical Desktop & Mobile Top Navbar
     */
    function getNavbarHTML(activeKey) {
        const key = getActivePageKey(activeKey);
        const waLink = getPrimaryWhatsAppLink();

        const isBeranda = key === 'beranda';
        const isPaket = key === 'paket';
        const isLayanan = ['jadwal', 'kalkulator', 'faq'].includes(key);
        const isPanduan = ['ziarah', 'hotel', 'koper', 'kiblat', 'live', 'galeri'].includes(key);
        const isProfil = ['tentang', 'profil', 'sambutan', 'muthawwif', 'legalitas'].includes(key);
        const isTentang = key === 'tentang';

        return `
    <nav id="mainNavbar" class="fixed top-0 left-0 right-0 z-50 nav-transparent transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <!-- Brand Logo & Slogan -->
            <div class="flex items-center gap-4">
                <a href="/" class="flex items-center gap-3 group" title="SDW UMROH - Beranda">
                    <picture>
                        <source srcset="assets/sdw-logo.webp" type="image/webp">
                        <img src="assets/sdw-logo.webp" alt="SDW Umroh" class="nav-logo-img h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300">
                    </picture>
                    <div class="flex flex-col">
                        <span class="nav-logo-text font-black text-lg sm:text-xl tracking-tight leading-none transition-colors">SDW <span class="text-sdw-gold">UMROH</span></span>
                        <span class="nav-logo-sub text-[9px] sm:text-[10px] text-sdw-gold font-bold uppercase tracking-wider block mt-1">One Journey, One Platform</span>
                    </div>
                </a>
            </div>

            <!-- Desktop Nav Menu (5 Items: Beranda, Profil, Paket, Layanan, Panduan) -->
            <div class="hidden lg:flex items-center gap-6 lg:gap-7 xl:gap-9 text-xs font-bold">
                <!-- Nav Item 1: Beranda -->
                <a href="/" class="nav-link-item ${isBeranda ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-1.5 transition py-1">
                    <span>Beranda</span>
                </a>

                <!-- Nav Item 2: Profil (Multi-Page Architecture adopted from MTs YASUA) -->
                <div class="nav-dropdown-group py-3">
                    <a href="/tentang" class="nav-link-item ${isProfil ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Profil</span>
                        <i class="fa-solid fa-chevron-down text-[9px] opacity-60 transition-transform"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/tentang" class="nav-dropdown-item ${key === 'tentang' ? 'bg-purple-50' : ''}">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-compass text-sdw-pine"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Profil, Visi &amp; Misi</div>
                                <div class="text-[10px] text-slate-500 font-medium">Landasan nilai &amp; komitmen ibadah</div>
                            </div>
                        </a>
                        <a href="/sambutan" class="nav-dropdown-item ${key === 'sambutan' ? 'bg-purple-50' : ''}">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-user-tie text-amber-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Sambutan Direktur Utama</div>
                                <div class="text-[10px] text-slate-500 font-medium">Arah &amp; komitmen khidmat pimpinan</div>
                            </div>
                        </a>
                        <a href="/muthawwif" class="nav-dropdown-item ${key === 'muthawwif' ? 'bg-purple-50' : ''}">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-users-rays text-purple-700"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Dewan Pembimbing &amp; Muthawwif</div>
                                <div class="text-[10px] text-slate-500 font-medium">Asatidz alumni UIM &amp; tim medis</div>
                            </div>
                        </a>
                        <a href="/legalitas" class="nav-dropdown-item ${key === 'legalitas' ? 'bg-purple-50' : ''}">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-certificate text-emerald-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Legalitas &amp; Jaringan Mitra</div>
                                <div class="text-[10px] text-slate-500 font-medium">Izin PPIU Kemenag &amp; Mitra Syiar Daerah</div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Nav Item 3: Paket -->
                <div class="nav-dropdown-group py-3">
                    <a href="/paket" class="nav-link-item ${isPaket ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Paket</span>
                        <i class="fa-solid fa-chevron-down text-[9px] opacity-60 transition-transform"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/paket" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-cubes"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Semua Paket Umroh</div>
                                <div class="text-[10px] text-slate-500 font-medium">Katalog lengkap &amp; komparasi</div>
                            </div>
                        </a>
                        <a href="/paket?cat=reguler" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-star-half-stroke"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Paket Umroh Reguler</div>
                                <div class="text-[10px] text-slate-500 font-medium">Hotel Bintang 4 Dekat Masjid</div>
                            </div>
                        </a>
                        <a href="/paket?cat=vip" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-crown text-amber-500"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Paket VIP Khidmat</div>
                                <div class="text-[10px] text-slate-500 font-medium">Pelataran Ka'bah &amp; Clock Tower</div>
                            </div>
                        </a>
                        <a href="/paket?cat=ramadhan" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-moon text-indigo-500"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Ramadhan &amp; Syawal</div>
                                <div class="text-[10px] text-slate-500 font-medium">I'tikaf 10 Malam Terakhir</div>
                            </div>
                        </a>
                        <a href="/paket?cat=plus" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-plane-departure text-emerald-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Umroh Plus Wisata Halal</div>
                                <div class="text-[10px] text-slate-500 font-medium">Turki, Dubai &amp; Mesir</div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Nav Item 4: Layanan -->
                <div class="nav-dropdown-group py-3">
                    <a href="/jadwal" class="nav-link-item ${isLayanan ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Layanan</span>
                        <i class="fa-solid fa-chevron-down text-[9px] opacity-60 transition-transform"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/jadwal" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-calendar-check text-emerald-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Jadwal Kloter &amp; Kuota</div>
                                <div class="text-[10px] text-slate-500 font-medium">Cek tanggal &amp; sisa kursi keberangkatan</div>
                            </div>
                        </a>
                        <a href="/kalkulator" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-calculator text-amber-500"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Kalkulator Biaya &amp; Estimasi</div>
                                <div class="text-[10px] text-slate-500 font-medium">Simulasi tipe kamar &amp; tabungan syariah</div>
                            </div>
                        </a>
                        <a href="/faq" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-circle-question text-indigo-500"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Tanya Jawab &amp; Bantuan (FAQ)</div>
                                <div class="text-[10px] text-slate-500 font-medium">Syarat paspor, visa bio, lansia &amp; refund</div>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Nav Item 5: Panduan -->
                <div class="nav-dropdown-group py-3">
                    <a href="/ziarah" class="nav-link-item ${isPanduan ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Panduan</span>
                        <i class="fa-solid fa-chevron-down text-[9px] opacity-60 transition-transform"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/hotel" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-hotel text-amber-700"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Hotel &amp; Akomodasi Ring 1</div>
                                <div class="text-[10px] text-slate-500 font-medium">Makkah &amp; Madinah pelataran masjid</div>
                            </div>
                        </a>
                        <a href="/ziarah" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-map-location-dot text-emerald-700"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Peta Ziarah Haramain</div>
                                <div class="text-[10px] text-slate-500 font-medium">Makkah, Madinah &amp; Raudhah</div>
                            </div>
                        </a>
                        <a href="/koper" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-suitcase-rolling text-blue-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Panduan Koper &amp; Bawaan</div>
                                <div class="text-[10px] text-slate-500 font-medium">Checklist resmi 5 item perlengkapan</div>
                            </div>
                        </a>
                        <a href="/kiblat" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-compass text-indigo-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Kompas Arah Kiblat</div>
                                <div class="text-[10px] text-slate-500 font-medium">Sensor arah kiblat satelit GPS</div>
                            </div>
                        </a>
                        <a href="/galeri" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-images text-rose-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Galeri Dokumentasi</div>
                                <div class="text-[10px] text-slate-500 font-medium">Momen ibadah jamaah SDW</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Header Action Capsule: Dual Clock, Hotline & Mobile Toggle -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- Dual Clock Ticker (AST Makkah & WIB Jakarta) -->
                <div class="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-[11px] font-mono text-slate-700">
                    <span title="Waktu Makkah (Arabia Standard Time)"><i class="fa-solid fa-kaaba text-amber-600 mr-1"></i><strong id="makkahClock">--:--</strong> AST</span>
                    <span class="text-slate-300">|</span>
                    <span title="Waktu Jakarta (WIB)"><i class="fa-solid fa-clock text-slate-400 mr-1"></i><strong id="jakartaClock">--:--</strong> WIB</span>
                </div>

                <!-- Hotline WhatsApp Button -->
                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="nav-hotline-pill inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold transition shadow-xs cursor-pointer hover:scale-105">
                    <i class="fa-brands fa-whatsapp text-emerald-400 text-sm"></i>
                    <span class="hidden sm:inline">Hotline 24 Jam</span>
                    <span class="inline sm:hidden">CS</span>
                </a>

                <!-- Mobile Hamburger Button -->
                <button type="button" onclick="SDW_COMPONENTS.toggleMobileNav(true)" class="nav-mobile-toggle lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-base transition cursor-pointer" aria-label="Buka Menu Navigasi">
                    <i class="fa-solid fa-bars"></i>
                </button>
            </div>
        </div>
    </nav>

    <!-- Mobile Drawer Overlay & Container -->
    <div id="mobileNavDrawer" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 opacity-0 pointer-events-none lg:hidden" aria-hidden="true">
        <div id="mobileNavPanel" class="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between transform translate-x-full transition-transform duration-300">
            <div>
                <div class="flex items-center justify-between pb-5 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                        <img src="assets/sdw-logo.webp" alt="SDW" class="h-8 w-auto">
                        <span class="font-black text-base text-sdw-pine">SDW <span class="text-sdw-gold">UMROH</span></span>
                    </div>
                    <button type="button" onclick="SDW_COMPONENTS.toggleMobileNav(false)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm cursor-pointer" aria-label="Tutup Menu">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="py-4 space-y-1 text-xs font-bold text-slate-700">
                    <a href="/" class="flex items-center gap-3 p-2.5 rounded-xl ${isBeranda ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-kaaba text-sdw-pine w-4 text-center"></i> Beranda
                    </a>

                    <!-- Profil Submenu Links for Mobile (Placed right after Beranda) -->
                    <div class="pt-1.5 pb-1.5 border-y border-slate-100 my-1 space-y-0.5">
                        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2.5 block mb-1">Profil Lembaga</span>
                        <a href="/tentang" class="flex items-center gap-3 p-2 rounded-xl text-xs ${key === 'tentang' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50 font-bold'}">
                            <i class="fa-solid fa-compass text-sdw-pine w-4 text-center"></i> Profil, Visi &amp; Misi
                        </a>
                        <a href="/sambutan" class="flex items-center gap-3 p-2 rounded-xl text-xs ${key === 'sambutan' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50 font-bold'}">
                            <i class="fa-solid fa-user-tie text-amber-600 w-4 text-center"></i> Sambutan Direktur
                        </a>
                        <a href="/muthawwif" class="flex items-center gap-3 p-2 rounded-xl text-xs ${key === 'muthawwif' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50 font-bold'}">
                            <i class="fa-solid fa-users-rays text-purple-700 w-4 text-center"></i> Dewan Muthawwif
                        </a>
                        <a href="/legalitas" class="flex items-center gap-3 p-2 rounded-xl text-xs ${key === 'legalitas' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50 font-bold'}">
                            <i class="fa-solid fa-certificate text-emerald-600 w-4 text-center"></i> Legalitas &amp; Jaringan Mitra
                        </a>
                    </div>

                    <a href="/paket" class="flex items-center gap-3 p-2.5 rounded-xl ${isPaket ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-cubes text-sdw-pine w-4 text-center"></i> Paket Umroh
                    </a>
                    <a href="/jadwal" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'jadwal' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-calendar-check text-emerald-600 w-4 text-center"></i> Jadwal Kloter
                    </a>
                    <a href="/kalkulator" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'kalkulator' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-calculator text-amber-600 w-4 text-center"></i> Kalkulator Biaya
                    </a>
                    <a href="/hotel" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'hotel' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-hotel text-amber-700 w-4 text-center"></i> Hotel Ring 1
                    </a>
                    <a href="/ziarah" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'ziarah' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-map-location-dot text-emerald-700 w-4 text-center"></i> Rute Ziarah Suci
                    </a>
                    <a href="/koper" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'koper' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-suitcase-rolling text-blue-600 w-4 text-center"></i> Panduan Koper
                    </a>
                    <a href="/kiblat" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'kiblat' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-compass text-indigo-600 w-4 text-center"></i> Kompas Kiblat
                    </a>
                    <a href="/faq" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'faq' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-circle-question text-purple-700 w-4 text-center"></i> Tanya Jawab (FAQ)
                    </a>
                </div>
            </div>

            <div class="pt-4 border-t border-slate-100 space-y-2">
                <a href="/app" class="w-full py-2.5 rounded-xl bg-sdw-pine text-white font-black text-xs text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:bg-purple-900 transition">
                    <i class="fa-solid fa-mobile-screen-button text-amber-300"></i> Buka Aplikasi Jamaah (PWA)
                </a>
                <a href="/admin" class="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs text-center flex items-center justify-center gap-2">
                    <i class="fa-solid fa-user-shield"></i> Portal Admin
                </a>
            </div>
        </div>
    </div>`;
    }

    /**
     * Renders the canonical Mobile Floating Bottom Dock
     */
    function getBottomBarHTML(activeKey) {
        const key = getActivePageKey(activeKey);

        const isHome = key === 'beranda';
        const isPaket = key === 'paket';
        const isJadwal = key === 'jadwal';

        const activeClass = 'text-sdw-pine';
        const inactiveClass = 'text-slate-500 hover:text-sdw-pine';

        return `
    <nav id="mobileBottomBar" class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 px-2 transition-transform duration-300">
        <div class="grid grid-cols-5 items-center text-center max-w-md mx-auto">
            <!-- 1. Beranda -->
            <a href="/" class="flex flex-col items-center justify-center py-1 transition group ${isHome ? activeClass : inactiveClass}">
                <div class="w-8 h-8 flex items-center justify-center rounded-xl ${isHome ? 'bg-purple-100/80 text-sdw-pine shadow-2xs' : 'text-slate-500 group-hover:bg-purple-50'}">
                    <i class="fa-solid fa-kaaba text-sm"></i>
                </div>
                <span class="text-[9.5px] ${isHome ? 'font-extrabold text-sdw-pine' : 'font-semibold'} mt-1">Beranda</span>
            </a>

            <!-- 2. Paket -->
            <a href="/paket" class="flex flex-col items-center justify-center py-1 transition group ${isPaket ? activeClass : inactiveClass}" aria-label="Paket Umroh">
                <div class="w-8 h-8 flex items-center justify-center rounded-xl ${isPaket ? 'bg-purple-100/80 text-sdw-pine shadow-2xs' : 'text-slate-500 group-hover:bg-purple-50'}">
                    <i class="fa-solid fa-cubes text-sm"></i>
                </div>
                <span class="text-[9.5px] ${isPaket ? 'font-extrabold text-sdw-pine' : 'font-semibold'} mt-1">Paket</span>
            </a>

            <!-- 3. Panduan Manasik (Elevated Center Action Button) -->
            <a href="/koper" class="flex flex-col items-center justify-center -mt-4 transition group cursor-pointer active:scale-95" aria-label="Pusat Panduan &amp; Manasik">
                <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-sdw-gold to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/35 ring-4 ring-white active:scale-95 transition-transform">
                    <i class="fa-solid fa-hands-praying text-lg text-slate-950"></i>
                </div>
                <span class="text-[9.5px] font-extrabold mt-1 text-amber-700">Panduan</span>
            </a>

            <!-- 4. Kalender & Jadwal -->
            <a href="/jadwal" class="flex flex-col items-center justify-center py-1 transition group ${isJadwal ? activeClass : inactiveClass}" aria-label="Kalender &amp; Jadwal Kloter">
                <div class="w-8 h-8 flex items-center justify-center rounded-xl ${isJadwal ? 'bg-purple-100/80 text-sdw-pine shadow-2xs' : 'text-slate-500 group-hover:bg-purple-50'}">
                    <i class="fa-solid fa-calendar-days text-sm"></i>
                </div>
                <span class="text-[9.5px] ${isJadwal ? 'font-extrabold text-sdw-pine' : 'font-semibold'} mt-1">Jadwal</span>
            </a>

            <!-- 5. Aplikasi Jamaah (PWA) -->
            <a href="/app" class="flex flex-col items-center justify-center py-1 transition group text-slate-500 hover:text-sdw-pine" aria-label="Aplikasi Jamaah PWA">
                <div class="w-8 h-8 flex items-center justify-center rounded-xl transition text-slate-500 group-hover:text-sdw-pine group-hover:bg-purple-50">
                    <i class="fa-solid fa-mobile-screen-button text-sm"></i>
                </div>
                <span class="text-[9.5px] font-semibold mt-1">App Jamaah</span>
            </a>
        </div>
    </nav>`;
    }

    /**
     * Renders the canonical Corporate & Legal Footer
     */
    function getFooterHTML() {
        let addressText = 'Jl. Raya Kudus - Jepara KM 5, Kabupaten Kudus, Jawa Tengah 59333';
        let phoneText = '(0291) 438-999 / +62 812-3456-7890';
        let emailText = 'layanan@sdwumroh.co.id';
        let igUrl = 'https://instagram.com';
        let fbUrl = 'https://facebook.com';
        let ytUrl = 'https://youtube.com';
        let ttUrl = 'https://tiktok.com';
        let igTitle = 'Instagram Resmi';
        let fbTitle = 'Facebook Resmi';
        let ytTitle = 'YouTube Manasik';
        let ttTitle = 'TikTok Edukasi';

        try {
            if (typeof localStorage !== 'undefined') {
                const csRaw = localStorage.getItem('sdw_admin_contact_social');
                if (csRaw) {
                    const cs = JSON.parse(csRaw);
                    if (cs) {
                        if (cs.address_line) addressText = cs.address_line + (cs.city_province_postal ? ', ' + cs.city_province_postal : '');
                        if (cs.phone_office || cs.whatsapp_number) {
                            phoneText = cs.phone_office && cs.whatsapp_number ? `${cs.phone_office} / ${cs.whatsapp_number}` : (cs.phone_office || cs.whatsapp_number);
                        }
                        if (cs.email_official) emailText = cs.email_official;
                        if (cs.instagram_url) igUrl = cs.instagram_url;
                        if (cs.instagram_handle) igTitle = `Instagram: ${cs.instagram_handle}`;
                        if (cs.facebook_url) fbUrl = cs.facebook_url;
                        if (cs.facebook_name) fbTitle = `Facebook: ${cs.facebook_name}`;
                        if (cs.youtube_url) ytUrl = cs.youtube_url;
                        if (cs.youtube_name) ytTitle = `YouTube: ${cs.youtube_name}`;
                        if (cs.tiktok_url) ttUrl = cs.tiktok_url;
                        if (cs.tiktok_handle) ttTitle = `TikTok: ${cs.tiktok_handle}`;
                    }
                }
            }
        } catch (_) {}

        return `
    <footer id="globalFooter" class="bg-sdw-footer text-white border-t border-sdw-gold/30 pt-16 pb-20 lg:pb-12 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <!-- 4 Main Columns -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/10">
                <!-- Col 1: Brand & Legalitas Resmi -->
                <div class="space-y-4">
                    <a href="/" class="flex items-center gap-3 group" title="SDW UMROH - Beranda">
                        <picture>
                            <source srcset="assets/sdw-logo.webp" type="image/webp">
                            <img src="assets/sdw-logo.webp" alt="SDW Umroh" class="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300">
                        </picture>
                        <div class="flex flex-col">
                            <span class="font-black text-xl tracking-tight leading-none text-white">SDW <span class="text-sdw-gold">UMROH</span></span>
                            <span class="text-[9.5px] text-sdw-gold font-bold uppercase tracking-wider block mt-1">One Journey, One Platform</span>
                        </div>
                    </a>
                    <p class="text-xs text-slate-300 leading-relaxed">
                        Biro Penyelenggara Perjalanan Ibadah Umroh (PPIU) resmi dengan komitmen bimbingan sesuai sunnah shahihah, akomodasi hotel pelataran ring-1 Masjidil Haram &amp; Nabawi, serta kepastian tiket maskapai tanpa biaya tersembunyi.
                    </p>
                    
                    <!-- Legal Credentials Badges -->
                    <div class="pt-2 space-y-2">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
                            <i class="fa-solid fa-certificate text-sdw-gold"></i>
                            <span class="font-bold text-white">Izin PPIU Kemenag RI:</span>
                            <span class="text-sdw-gold font-bold">No. U.123/2026</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-slate-300">
                            <span class="inline-flex items-center gap-1 text-amber-400 font-bold"><i class="fa-solid fa-award"></i> Akreditasi A</span>
                            <span class="text-white/30">•</span>
                            <span>Anggota AMPHURI</span>
                            <span class="text-white/30">•</span>
                            <span>IATA Partner</span>
                        </div>
                    </div>
                </div>

                <!-- Col 2: Program Paket & Ziarah -->
                <div>
                    <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-sdw-gold pl-2.5">Program Paket Umroh</h4>
                    <ul class="space-y-2.5 text-xs text-slate-300">
                        <li><a href="/paket?cat=reguler" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Paket Umroh Reguler Syawal</a></li>
                        <li><a href="/paket?cat=vip" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Paket VIP Khidmat Bintang 5</a></li>
                        <li><a href="/paket?cat=plus" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Paket Umroh Plus Wisata Turki</a></li>
                        <li><a href="/paket?cat=ramadhan" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Umroh Ramadhan Lailatul Qadr</a></li>
                        <li><a href="/ziarah" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Galeri Ziarah Suci Haramain</a></li>
                        <li><a href="/jadwal" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Jadwal Kloter 1447H</a></li>
                    </ul>
                </div>

                <!-- Col 3: Panduan & Transparansi -->
                <div>
                    <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-sdw-gold pl-2.5">Panduan &amp; Fasilitas</h4>
                    <ul class="space-y-2.5 text-xs text-slate-300">
                        <li><a href="/kalkulator" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Simulasi Estimator Biaya</a></li>
                        <li><a href="/hotel" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Fasilitas Hotel Ring 1</a></li>
                        <li><a href="/koper" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Checklist Koper &amp; Bagasi</a></li>
                        <li><a href="/kiblat" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Kompas Kiblat Satelit</a></li>
                        <li><a href="/faq" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Pusat Bantuan &amp; FAQ</a></li>
                        <li><a href="/tentang" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Profil, Visi &amp; Misi</a></li>
                        <li><a href="/sambutan" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Sambutan Direktur Utama</a></li>
                        <li><a href="/muthawwif" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Dewan Pembimbing &amp; Medis</a></li>
                        <li><a href="/legalitas" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Legalitas PPIU &amp; Kemitraan</a></li>
                    </ul>
                </div>

                <!-- Col 4: Kontak Kantor & Layanan -->
                <div>
                    <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-sdw-gold pl-2.5">Kantor Pusat &amp; Layanan</h4>
                    <div class="space-y-3 text-xs text-slate-300">
                        <div class="flex items-start gap-2.5">
                            <i class="fa-solid fa-location-dot text-sdw-gold mt-1 shrink-0"></i>
                            <span id="footerAddress">${addressText}</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-phone text-sdw-gold shrink-0"></i>
                            <span id="footerPhone">${phoneText}</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-envelope text-sdw-gold shrink-0"></i>
                            <span id="footerEmail">${emailText}</span>
                        </div>
                        <div class="pt-2 flex items-center gap-2">
                            <a id="footerIg" href="${igUrl}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="${igTitle}"><i class="fa-brands fa-instagram"></i></a>
                            <a id="footerFb" href="${fbUrl}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="${fbTitle}"><i class="fa-brands fa-facebook"></i></a>
                            <a id="footerYt" href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="${ytTitle}"><i class="fa-brands fa-youtube"></i></a>
                            <a id="footerTt" href="${ttUrl}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="${ttTitle}"><i class="fa-brands fa-tiktok"></i></a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Disclaimer & Copyright -->
            <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <p>&copy; 2026 PT Sahabat Dhuha Wisata (SDW UMROH). Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
                <div class="flex items-center gap-4 text-[11px]">
                    <a href="/faq" class="hover:text-white transition">Kebijakan Privasi</a>
                    <span>•</span>
                    <a href="/faq" class="hover:text-white transition">Syarat &amp; Ketentuan</a>
                    <span>•</span>
                    <a href="/admin" class="hover:text-sdw-gold font-bold transition">Akses Portal Staf</a>
                </div>
            </div>
        </div>
    </footer>`;
    }

    /**
     * Dual Clock Ticker (Makkah AST & Jakarta WIB)
     */
    function startDualClock() {
        if (typeof window === 'undefined') return;

        function update() {
            const now = new Date();
            // Makkah is UTC+3
            const makkahTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 3600000));
            // Jakarta is UTC+7
            const jakartaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (7 * 3600000));

            const makkahEl = document.getElementById('makkahClock');
            const jakartaEl = document.getElementById('jakartaClock');

            const pad = (n) => String(n).padStart(2, '0');

            if (makkahEl) {
                makkahEl.innerText = `${pad(makkahTime.getHours())}:${pad(makkahTime.getMinutes())}`;
            }
            if (jakartaEl) {
                jakartaEl.innerText = `${pad(jakartaTime.getHours())}:${pad(jakartaTime.getMinutes())}`;
            }
        }

        update();
        setInterval(update, 1000);
    }

    /**
     * Mobile Menu Drawer Toggle
     */
    function toggleMobileNav(isOpen) {
        const overlay = document.getElementById('mobileNavDrawer');
        const panel = document.getElementById('mobileNavPanel');

        if (!overlay || !panel) return;

        if (isOpen) {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            overlay.classList.add('opacity-100', 'pointer-events-auto');
            panel.classList.remove('translate-x-full');
            document.body.style.overflow = 'hidden';
        } else {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            overlay.classList.remove('opacity-100', 'pointer-events-auto');
            panel.classList.add('translate-x-full');
            document.body.style.overflow = '';
        }
    }

    /**
     * Navbar Scroll State Handler
     */
    function initNavbarScroll() {
        if (typeof window === 'undefined') return;

        const nav = document.getElementById('mainNavbar');
        if (!nav) return;

        function onScroll() {
            if (window.scrollY > 40) {
                nav.classList.remove('nav-transparent');
                nav.classList.add('nav-scrolled', 'bg-white/95', 'backdrop-blur-md', 'shadow-md');
            } else {
                nav.classList.add('nav-transparent');
                nav.classList.remove('nav-scrolled', 'bg-white/95', 'backdrop-blur-md', 'shadow-md');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /**
     * Renders the canonical Floating WhatsApp Widget (Universal Mobile & Desktop)
     */
    function getFloatingContactHTML() {
        const waLink = getPrimaryWhatsAppLink();
        return `
    <aside id="floatingContact">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="flex fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white items-center justify-center shadow-2xl shadow-emerald-950/40 hover:scale-110 active:scale-95 transition-all cursor-pointer group" aria-label="Tanya Kami di WhatsApp">
            <i class="fa-brands fa-whatsapp text-2xl sm:text-2xl"></i>
            <span class="hidden sm:inline-block absolute right-16 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
                Tanya Kami di WhatsApp
            </span>
        </a>
    </aside>`;
    }

    /**
     * Auto Mount on DOM Ready
     */
    function autoMount() {
        if (typeof document === 'undefined') return;

        // 1. Mount or enhance Header
        const headerPlaceholder = document.getElementById('app-header') || document.getElementById('sdw-header');
        if (headerPlaceholder) {
            const activeKey = headerPlaceholder.getAttribute('data-active');
            headerPlaceholder.outerHTML = getNavbarHTML(activeKey);
        }

        // 2. Mount or enhance Bottom Dock
        // Pemisahan Total: Bottom navigation bar dipusatkan eksklusif pada PWA App (app.html).
        // Pada Web Publik, biarkan layar bersih dan lega untuk pengalaman marketing landing page.
        const bottomPlaceholder = document.getElementById('app-bottom-bar') || document.getElementById('sdw-bottom-bar');
        if (bottomPlaceholder) {
            bottomPlaceholder.outerHTML = '';
        }

        // 3. Mount or enhance Footer
        const footerPlaceholder = document.getElementById('app-footer') || document.getElementById('sdw-footer');
        if (footerPlaceholder) {
            footerPlaceholder.outerHTML = getFooterHTML();
        }

        // 4. Mount or enhance Floating WhatsApp Contact
        const contactPlaceholder = document.getElementById('app-floating-contact') || document.getElementById('floating-contact');
        if (contactPlaceholder) {
            contactPlaceholder.outerHTML = getFloatingContactHTML();
        } else if (!document.getElementById('floatingContact') && typeof window !== 'undefined' && !window.location.pathname.includes('/admin')) {
            if (document.body) {
                document.body.insertAdjacentHTML('beforeend', getFloatingContactHTML());
            }
        }

        // 5. Initialize Scroll & Clock
        initNavbarScroll();
        startDualClock();
    }

    // Auto mount if browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', autoMount);
        } else {
            autoMount();
        }
    }

    return {
        getNavbarHTML: getNavbarHTML,
        getBottomBarHTML: getBottomBarHTML,
        getFooterHTML: getFooterHTML,
        getFloatingContactHTML: getFloatingContactHTML,
        toggleMobileNav: toggleMobileNav,
        startDualClock: startDualClock,
        initNavbarScroll: initNavbarScroll,
        autoMount: autoMount
    };
}));
