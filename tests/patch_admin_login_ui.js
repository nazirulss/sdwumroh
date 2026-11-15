const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminHtmlPath, 'utf8');

const targetRegex = /<!-- =+ MODAL: FORM LOGIN ADMINISTRATOR & AUTENTIKASI DB_USERS =+ -->[\s\S]*?<!-- =+ MODAL LOGIN ADMIN: 2 METODE \(OTP EMAIL & LOGIN CEPAT\) =+ -->[\s\S]*?<!-- Toast Notification Element -->/;

const replacement = `<!-- ==================== MODAL LOGIN PENGELOLA / ADMIN (DESAIN PERSIS ASNAWIYYAH & RMI NU DEMAK) ==================== -->
    <div id="modalAdminLogin" class="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none" aria-hidden="true">
        <div class="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left space-y-5 transform scale-95 transition-transform duration-200">
            <!-- Close Button (Pojok Kanan Atas Sesuai Desain RMI NU Demak) -->
            <button type="button" onclick="SDW_ADMIN_AUTH.handleCloseLoginModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition cursor-pointer" title="Tutup / Kembali">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- Centered Shield Icon & Header -->
            <div class="text-center pt-2">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl border border-blue-100/80 shadow-xs mb-3">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 tracking-tight">Masuk Pengelola / Admin</h3>
                <p class="text-xs text-slate-500 mt-1">Akses khusus operasional dan data center SDW UMROH</p>
            </div>

            <!-- Two Tab Switcher Capsule: 1-Klik Akun vs Email OTP -->
            <div class="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 text-xs font-semibold gap-1">
                <button type="button" id="tabBtnLoginQuick" onclick="SDW_ADMIN_AUTH.switchLoginTab('quick')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer">
                    <i class="fa-solid fa-bolt text-amber-500 text-xs"></i>
                    <span>1-Klik Akun</span>
                </button>
                <button type="button" id="tabBtnLoginOtp" onclick="SDW_ADMIN_AUTH.switchLoginTab('otp')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 bg-white text-blue-600 shadow-xs cursor-pointer font-bold">
                    <i class="fa-regular fa-envelope text-blue-600 text-xs"></i>
                    <span>Email OTP</span>
                </button>
            </div>

            <!-- ==================== TAB 1: EMAIL OTP ==================== -->
            <div id="loginTabContentOtp" class="space-y-4 pt-1">
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

            <!-- ==================== TAB 2: 1-KLIK AKUN (LOGIN CEPAT EMAIL TERDAFTAR) ==================== -->
            <div id="loginTabContentQuick" class="hidden space-y-4 pt-1">
                <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">Pilih Staf Terdaftar di DB_Users</label>
                    <div class="relative">
                        <select id="quickLoginSelect" onchange="document.getElementById('quickLoginEmailInput').value = this.value" class="w-full py-3 px-3.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer">
                            <option value="">-- Pilih Akun Staf Resmi --</option>
                            <option value="admin@sdwumroh.com">👑 Admin Sistem (admin@sdwumroh.com) - ADMIN</option>
                            <option value="ops@sdwumroh.com">✈️ Staf Operasional (ops@sdwumroh.com) - OPERATIONS</option>
                            <option value="finance@sdwumroh.com">💰 Finance Officer (finance@sdwumroh.com) - FINANCE</option>
                            <option value="docs@sdwumroh.com">📄 Dokumen & Visa (docs@sdwumroh.com) - DOCUMENT_OFFICER</option>
                            <option value="fauzi@sdwumroh.com">🚩 Tour Leader (fauzi@sdwumroh.com) - TOUR_LEADER</option>
                            <option value="salman@sdwumroh.com">🕋 Muthawwif (salman@sdwumroh.com) - MUTHAWWIF</option>
                        </select>
                    </div>
                    <div class="pt-1.5">
                        <label class="block text-[11px] font-medium text-slate-500 mb-1">Atau ketik email pengelola terdaftar:</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm pointer-events-none">
                                <i class="fa-regular fa-envelope"></i>
                            </span>
                            <input type="email" id="quickLoginEmailInput" placeholder="nama@sdwumroh.com" class="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition">
                        </div>
                    </div>
                </div>

                <button type="button" id="btnQuickLoginSubmit" onclick="SDW_ADMIN_AUTH.handleQuickLogin()" class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2">
                    <i class="fa-solid fa-bolt text-amber-300"></i>
                    <span>Masuk Langsung Sekarang</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>

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
    console.log('✅ modalAdminLogin in admin.html successfully updated to match RMI NU Demak / Asnawiyyah design!');
} else {
    console.error('❌ Failed to match targetRegex in admin.html');
    process.exit(1);
}
