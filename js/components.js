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
        if (path.includes('/tentang')) return 'tentang';
        if (path.includes('/faq')) return 'faq';
        if (path.includes('/admin') || path.includes('/backoffice')) return 'admin';
        if (path.includes('/app') || path.includes('/jamaah')) return 'app';
        return 'beranda';
    }

    /**
     * Renders the canonical Desktop & Mobile Top Navbar
     */
    function getNavbarHTML(activeKey) {
        const key = getActivePageKey(activeKey);

        const isBeranda = key === 'beranda';
        const isPaket = key === 'paket';
        const isLayanan = ['jadwal', 'kalkulator', 'faq'].includes(key);
        const isPanduan = ['ziarah', 'hotel', 'koper', 'kiblat', 'live', 'galeri'].includes(key);
        const isTentang = key === 'tentang';

        return `
    <nav id="mainNavbar" class="fixed top-0 left-0 right-0 z-50 nav-transparent transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <!-- Brand Logo & Slogan -->
            <div class="flex items-center gap-4">
                <a href="/" class="flex items-center gap-3 group" title="SDW UMROH - Beranda">
                    <picture>
                        <source srcset="assets/sdw-logo.webp" type="image/webp">
                        <img src="assets/sdw-logo.png" alt="SDW Umroh" class="nav-logo-img h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300">
                    </picture>
                    <div class="flex flex-col">
                        <span class="nav-logo-text font-black text-lg sm:text-xl tracking-tight leading-none transition-colors">SDW <span class="text-sdw-gold">UMROH</span></span>
                        <span class="nav-logo-sub text-[9px] sm:text-[10px] text-sdw-gold font-bold uppercase tracking-wider block mt-1">One Journey, One Platform</span>
                    </div>
                </a>
            </div>

            <!-- Desktop Nav Menu (5 Items: Beranda + 4 Dropdown Groups) -->
            <div class="hidden lg:flex items-center gap-6 lg:gap-7 xl:gap-9 text-xs font-bold">
                <!-- Nav Item: Beranda -->
                <a href="/" class="nav-link-item ${isBeranda ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-1.5 transition py-1">
                    <span>Beranda</span>
                </a>

                <!-- Dropdown 1: Pilihan Paket -->
                <div class="nav-dropdown-group py-3">
                    <a href="/paket" class="nav-link-item ${isPaket ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Pilihan Paket</span>
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

                <!-- Dropdown 2: Layanan -->
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

                <!-- Dropdown 3: Panduan & Ziarah -->
                <div class="nav-dropdown-group py-3">
                    <a href="/ziarah" class="nav-link-item ${isPanduan ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Panduan &amp; Ziarah</span>
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

                <!-- Dropdown 4: Tentang Kami -->
                <div class="nav-dropdown-group py-3">
                    <a href="/tentang" class="nav-link-item ${isTentang ? 'nav-link-active text-sdw-pine' : ''} inline-flex items-center gap-2 transition">
                        <span>Tentang Kami</span>
                        <i class="fa-solid fa-chevron-down text-[9px] opacity-60 transition-transform"></i>
                    </a>
                    <div class="nav-dropdown-menu">
                        <a href="/tentang" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-shield-halved text-emerald-600"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Profil &amp; Legalitas Resmi</div>
                                <div class="text-[10px] text-slate-500 font-medium">Izin PPIU Kemenag &amp; Akreditasi A</div>
                            </div>
                        </a>
                        <a href="/app" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-mobile-screen-button text-purple-700"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Aplikasi Jamaah (PWA)</div>
                                <div class="text-[10px] text-slate-500 font-medium">Doa manasik, kartu jamaah &amp; jadwal</div>
                            </div>
                        </a>
                        <a href="/admin" class="nav-dropdown-item">
                            <div class="nav-dropdown-icon"><i class="fa-solid fa-user-lock text-slate-800"></i></div>
                            <div>
                                <div class="font-extrabold text-xs text-sdw-pine">Portal Staf Backoffice</div>
                                <div class="text-[10px] text-slate-500 font-medium">Manajemen operasional &amp; keuangan</div>
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
                <a href="https://wa.me/6281234567890?text=Assalamualaikum%20CS%20SDW%20UMROH,%20saya%20ingin%20konsultasi%20paket%20umroh." target="_blank" rel="noopener noreferrer" class="nav-hotline-pill inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold transition shadow-xs cursor-pointer hover:scale-105">
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
                        <img src="assets/sdw-logo.png" alt="SDW" class="h-8 w-auto">
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
                    <a href="/paket" class="flex items-center gap-3 p-2.5 rounded-xl ${isPaket ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-cubes text-sdw-pine w-4 text-center"></i> Pilihan Paket Umroh
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
                    <a href="/tentang" class="flex items-center gap-3 p-2.5 rounded-xl ${isTentang ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-building text-slate-600 w-4 text-center"></i> Profil &amp; Legalitas
                    </a>
                    <a href="/faq" class="flex items-center gap-3 p-2.5 rounded-xl ${key === 'faq' ? 'bg-purple-50 text-sdw-pine font-black' : 'hover:bg-slate-50'}">
                        <i class="fa-solid fa-circle-question text-purple-700 w-4 text-center"></i> Tanya Jawab (FAQ)
                    </a>
                </div>
            </div>

            <div class="pt-4 border-t border-slate-100 space-y-2">
                <a href="/app" class="w-full py-2.5 rounded-xl bg-purple-100 text-sdw-pine font-black text-xs text-center flex items-center justify-center gap-2">
                    <i class="fa-solid fa-mobile-screen-button"></i> Buka Aplikasi Jamaah (PWA)
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
        return `
    <footer id="globalFooter" class="bg-sdw-footer text-white border-t border-sdw-gold/30 pt-16 pb-28 lg:pb-12 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <!-- 4 Main Columns -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-white/10">
                <!-- Col 1: Brand & Legalitas Resmi -->
                <div class="space-y-4">
                    <a href="/" class="flex items-center gap-3 group" title="SDW UMROH - Beranda">
                        <picture>
                            <source srcset="assets/sdw-logo.webp" type="image/webp">
                            <img src="assets/sdw-logo.png" alt="SDW Umroh" class="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300">
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
                            <span class="text-sdw-gold font-bold">No. U.412/2020</span>
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
                        <li><a href="/tentang" class="hover:text-sdw-gold transition flex items-center gap-1.5"><i class="fa-solid fa-chevron-right text-[10px] text-sdw-gold"></i> Profil &amp; Legalitas Kantor</a></li>
                    </ul>
                </div>

                <!-- Col 4: Kontak Kantor & Layanan -->
                <div>
                    <h4 class="font-bold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-sdw-gold pl-2.5">Kantor Pusat &amp; Layanan</h4>
                    <div class="space-y-3 text-xs text-slate-300">
                        <div class="flex items-start gap-2.5">
                            <i class="fa-solid fa-location-dot text-sdw-gold mt-1 shrink-0"></i>
                            <span>Jl. Raya Kudus - Jepara KM 5, Kabupaten Kudus, Jawa Tengah 59333</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-phone text-sdw-gold shrink-0"></i>
                            <span>(0291) 438-999 / +62 812-3456-7890</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <i class="fa-solid fa-envelope text-sdw-gold shrink-0"></i>
                            <span>layanan@sdwumroh.co.id</span>
                        </div>
                        <div class="pt-2 flex items-center gap-2">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="Instagram Resmi"><i class="fa-brands fa-instagram"></i></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="Facebook Resmi"><i class="fa-brands fa-facebook"></i></a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="YouTube Manasik"><i class="fa-brands fa-youtube"></i></a>
                            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-sdw-gold hover:text-slate-900 transition flex items-center justify-center text-xs" title="TikTok Edukasi"><i class="fa-brands fa-tiktok"></i></a>
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
     * Renders the canonical Floating WhatsApp Widget (Desktop)
     */
    function getFloatingContactHTML() {
        return `
    <aside id="floatingContact">
        <a href="https://wa.me/6281234567890?text=Assalamualaikum%20CS%20SDW%20UMROH,%20saya%20ingin%20konsultasi%20paket%20umroh." target="_blank" rel="noopener noreferrer" class="hidden lg:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white items-center justify-center shadow-2xl shadow-emerald-950/40 hover:scale-110 transition-all cursor-pointer group" aria-label="Tanya Kami di WhatsApp">
            <i class="fa-brands fa-whatsapp text-2xl"></i>
            <span class="absolute right-16 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
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
        const bottomPlaceholder = document.getElementById('app-bottom-bar') || document.getElementById('sdw-bottom-bar');
        if (bottomPlaceholder) {
            const activeKey = bottomPlaceholder.getAttribute('data-active');
            bottomPlaceholder.outerHTML = getBottomBarHTML(activeKey);
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
