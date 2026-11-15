const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminHtmlPath, 'utf8');

// Target regex for modalAdminLogin
const targetRegex = /<div id="modalAdminLogin"[\s\S]*?<!-- Toast Notification Element -->/;

const replacement = `<div id="modalAdminLogin" class="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none" aria-hidden="true">
        <div class="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left space-y-4 transform scale-95 transition-transform duration-200">
            <!-- Close Button (Pojok Kanan Atas Sesuai Desain RMI NU Demak) -->
            <button type="button" onclick="SDW_ADMIN_AUTH.handleCloseLoginModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition cursor-pointer" title="Tutup / Kembali">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- Centered Shield Icon & Header -->
            <div class="text-center pt-1">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl border border-blue-100/80 shadow-xs mb-3">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">Masuk Pengelola / Admin</h3>
                <p class="text-xs text-slate-500 mt-1">Akses khusus operasional dan data center SDW UMROH</p>
            </div>

            <!-- Two Tab Switcher Capsule: 1-Klik Akun vs Email OTP (Default: 1-Klik Akun Aktif) -->
            <div class="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 text-xs font-semibold gap-1">
                <button type="button" id="tabBtnLoginQuick" onclick="SDW_ADMIN_AUTH.switchLoginTab('quick')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 bg-white text-blue-600 shadow-xs cursor-pointer font-bold">
                    <i class="fa-solid fa-bolt text-amber-500 text-xs"></i>
                    <span>1-Klik Akun</span>
                </button>
                <button type="button" id="tabBtnLoginOtp" onclick="SDW_ADMIN_AUTH.switchLoginTab('otp')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer">
                    <i class="fa-regular fa-envelope text-slate-400 text-xs"></i>
                    <span>Email OTP</span>
                </button>
            </div>

            <!-- ==================== TAB 1: 1-KLIK AKUN (PERSIS DESAIN RMI NU DEMAK) ==================== -->
            <div id="loginTabContentQuick" class="space-y-3.5 pt-1">
                <!-- Info Box Biru Muda dengan Badge Instan -->
                <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 space-y-3 text-left">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5 text-[11px] font-bold text-blue-800 tracking-wider uppercase">
                            <i class="fa-solid fa-shield-halved text-blue-600"></i>
                            <span>AKUN RESMI PENGURUS</span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wide">INSTAN</span>
                    </div>
                    <p class="text-[11.5px] text-blue-900/80 leading-relaxed font-normal">
                        Masuk instan tanpa kata sandi menggunakan Akun Pengurus resmi yang terdaftar sebagai Administrator, Operasional, Keuangan, atau Muthawwif.
                    </p>

                    <!-- Kartu Aksi 1-Klik (Continue as Pengurus) -->
                    <button type="button" id="btnContinueAsUser" onclick="SDW_ADMIN_AUTH.handleContinueAsClick()" class="w-full p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition text-left flex items-center justify-between group cursor-pointer shadow-xs">
                        <div class="flex items-center gap-3">
                            <div id="quickLoginAvatar" class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs">AF</div>
                            <div>
                                <span class="block text-[10.5px] text-slate-500 font-medium">Continue as pengurus</span>
                                <h4 id="quickLoginName" class="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">H. Ahmad Fauzi (Admin)</h4>
                                <span id="quickLoginEmailDisplay" class="block text-[10px] text-slate-400 font-mono">admin@sdwumroh.com</span>
                            </div>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 flex items-center justify-center text-xs transition">
                            <i class="fa-solid fa-arrow-right"></i>
                        </div>
                    </button>
                </div>

                <!-- Tombol Buka Pilihan Akun / Masukkan Email Lain -->
                <button type="button" onclick="SDW_ADMIN_AUTH.toggleOtherAccounts()" class="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <i class="fa-solid fa-at text-slate-400"></i>
                    <span>Buka Pilihan Akun / Masukkan Email Lain</span>
                </button>

                <!-- Collapsible Container Pilihan Akun Lain (Hidden Default) -->
                <div id="containerOtherAccounts" class="hidden space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span class="block text-[11px] font-bold text-slate-700">Pilih Staf Lainnya:</span>
                    <div class="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin('ops@sdwumroh.com')" class="w-full p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-left flex items-center justify-between text-xs transition cursor-pointer">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">OP</span>
                                <div>
                                    <span class="font-bold text-slate-800 block text-[11px]">Staf Operasional</span>
                                    <span class="text-[10px] text-slate-500 font-mono">ops@sdwumroh.com</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-emerald-700">OPERATIONS &rarr;</span>
                        </button>
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin('finance@sdwumroh.com')" class="w-full p-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left flex items-center justify-between text-xs transition cursor-pointer">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">FO</span>
                                <div>
                                    <span class="font-bold text-slate-800 block text-[11px]">Finance Officer</span>
                                    <span class="text-[10px] text-slate-500 font-mono">finance@sdwumroh.com</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-amber-700">FINANCE &rarr;</span>
                        </button>
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin('docs@sdwumroh.com')" class="w-full p-2 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 text-left flex items-center justify-between text-xs transition cursor-pointer">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center justify-center">DO</span>
                                <div>
                                    <span class="font-bold text-slate-800 block text-[11px]">Dokumen & Paspor</span>
                                    <span class="text-[10px] text-slate-500 font-mono">docs@sdwumroh.com</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-cyan-700">DOC_OFFICER &rarr;</span>
                        </button>
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin('fauzi@sdwumroh.com')" class="w-full p-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-left flex items-center justify-between text-xs transition cursor-pointer">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center">TL</span>
                                <div>
                                    <span class="font-bold text-slate-800 block text-[11px]">Ust. Ahmad Fauzi (Tour Leader)</span>
                                    <span class="text-[10px] text-slate-500 font-mono">fauzi@sdwumroh.com</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-indigo-700">TOUR_LEADER &rarr;</span>
                        </button>
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin('salman@sdwumroh.com')" class="w-full p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left flex items-center justify-between text-xs transition cursor-pointer">
                            <div class="flex items-center gap-2">
                                <span class="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">MW</span>
                                <div>
                                    <span class="font-bold text-slate-800 block text-[11px]">Ust. DR. H. Salman (Muthawwif)</span>
                                    <span class="text-[10px] text-slate-500 font-mono">salman@sdwumroh.com</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold text-purple-700">MUTHAWWIF &rarr;</span>
                        </button>
                    </div>

                    <!-- Input Email Bebas Terdaftar -->
                    <div class="pt-2 border-t border-slate-200 flex gap-1.5">
                        <input type="email" id="quickLoginCustomEmailInput" placeholder="Ketik email terdaftar..." class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-blue-600 outline-none">
                        <button type="button" onclick="SDW_ADMIN_AUTH.handleQuickLogin(document.getElementById('quickLoginCustomEmailInput').value)" class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shrink-0">
                            Masuk
                        </button>
                    </div>
                </div>

                <!-- Footer Section Daftarkan Akun / Hubungi Admin -->
                <div class="pt-1 space-y-2 text-center">
                    <p class="text-[11px] text-slate-500">Pengurus atau Staf Anda belum terdaftar di SDW UMROH?</p>
                    <a href="https://wa.me/6281234567890?text=Assalamu'alaikum%20Admin%20SDW%20UMROH,%20saya%20ingin%20mendaftarkan%20akun%20pengelola/staf%20baru" target="_blank" rel="noopener" class="w-full py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs">
                        <i class="fa-solid fa-user-plus text-emerald-600 text-xs"></i>
                        <span>Hubungi Admin / Daftarkan Pengelola Baru</span>
                    </a>
                </div>

                <!-- Link Kembali ke Web Publik -->
                <div class="text-center pt-1">
                    <a href="index.html" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer">
                        <span>&larr;</span> <span>Kembali ke Halaman Web Publik</span>
                    </a>
                </div>
            </div>

            <!-- ==================== TAB 2: EMAIL OTP ==================== -->
            <div id="loginTabContentOtp" class="hidden space-y-4 pt-1">
                <!-- STEP 1: Input Email -->
                <div id="otpStep1Container" class="space-y-3.5">
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-slate-700">Email Resmi Pengelola</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm pointer-events-none">
                                <i class="fa-regular fa-envelope"></i>
                            </span>
                            <input type="email" id="loginOtpEmailInput" placeholder="nama@sdwumroh.com" class="w-full pl-10 pr-3.5 py-3 text-xs font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white text-slate-900 placeholder:text-slate-400">
                        </div>
                        <p class="text-[11px] text-slate-500">Kode OTP rahasia 6 digit akan dikirimkan langsung ke inbox email ini.</p>
                    </div>

                    <button type="button" id="btnSendLoginOtp" onclick="SDW_ADMIN_AUTH.handleSendOtp()" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                        <span>Kirim Kode OTP</span>
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                </div>

                <!-- STEP 2: Input 6 Digit OTP (Hidden awalnya) -->
                <div id="otpStep2Container" class="hidden space-y-4">
                    <div class="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs space-y-1">
                        <div class="flex items-center gap-2 font-bold text-blue-800">
                            <i class="fa-solid fa-circle-check text-blue-600"></i>
                            <span>Kode OTP Terkirim!</span>
                        </div>
                        <p class="text-[11px] text-blue-700">
                            Silakan masukkan 6 digit angka yang dikirimkan ke <strong id="otpSentToEmailText" class="font-mono text-blue-950 font-bold">nama@sdwumroh.com</strong>.
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-700 text-center">Masukkan 6 Digit Kode OTP</label>
                        <div class="relative max-w-xs mx-auto">
                            <input type="text" id="loginOtpCodeInput" maxlength="6" placeholder="• • • • • •" class="w-full py-3 text-center text-2xl font-black font-mono tracking-[10px] rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition bg-white text-slate-900">
                        </div>
                        <div class="flex items-center justify-between text-[11px] pt-1">
                            <span id="otpCountdownText" class="text-slate-500 font-medium">Berlaku: <strong class="text-amber-600 font-mono font-bold">05:00</strong></span>
                            <button type="button" id="btnResendOtp" onclick="SDW_ADMIN_AUTH.handleSendOtp()" class="text-blue-600 font-bold hover:underline cursor-pointer">
                                Kirim Ulang OTP
                            </button>
                        </div>
                    </div>

                    <button type="button" id="btnVerifyLoginOtp" onclick="SDW_ADMIN_AUTH.handleVerifyOtp()" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                        <i class="fa-solid fa-key text-amber-300"></i>
                        <span>Verifikasi & Masuk Portal</span>
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </button>

                    <button type="button" onclick="SDW_ADMIN_AUTH.resetOtpStep()" class="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                        &larr; Ganti Alamat Email
                    </button>
                </div>

                <!-- Link Kembali ke Web Publik -->
                <div class="text-center pt-2">
                    <a href="index.html" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer">
                        <span>&larr;</span> <span>Kembali ke Halaman Web Publik</span>
                    </a>
                </div>
            </div>

            <!-- Error Banner -->
            <div id="adminLoginError" class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hidden flex items-start gap-2.5">
                <i class="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5 shrink-0 text-sm"></i>
                <span id="adminLoginErrorMessage">Pemberitahuan galat.</span>
            </div>
        </div>
    </div>

    <!-- Toast Notification Element -->`;

if (targetRegex.test(content)) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(adminHtmlPath, content, 'utf8');
    console.log('✅ 1-Klik Akun modal in admin.html successfully updated to match RMI NU Demak exactly!');
} else {
    console.error('❌ Failed to match targetRegex');
    process.exit(1);
}
