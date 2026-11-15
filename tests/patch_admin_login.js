const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// 1. Replace Role Simulator Switcher
const simStart = html.indexOf('<!-- Role Simulator Switcher');
const simEnd = html.indexOf('<!-- Menu Navigasi Sesuai Asnawiyyah');
if (simStart !== -1 && simEnd !== -1) {
  const targetSim = html.substring(simStart, simEnd);
  const replacementSim = `<!-- Status Sesi Autentikasi Real (Bebas Simulasi) -->
                            <div class="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                                <div class="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span><i class="fa-solid fa-shield-halved text-sdw-pine mr-1"></i> Sesi Autentikasi Real</span>
                                    <span class="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Terverifikasi
                                    </span>
                                </div>
                                <div id="currentSessionRoleDisplay" class="text-xs font-black text-sdw-pine flex items-center gap-1.5 pt-0.5">
                                    <i class="fa-solid fa-user-check text-amber-500"></i>
                                    <span id="headerRoleBadgeText">Administrator</span>
                                </div>
                            </div>

                            `;
  html = html.replace(targetSim, replacementSim);
  console.log('✅ Role simulator removed from admin.html dropdown');
} else {
  console.error('❌ Could not find simulator section');
}

// 2. Replace Login Modal
const modalStart = html.indexOf('<div id="modalAdminLogin"');
const modalEnd = html.indexOf('<!-- Toast Notification Element -->');
if (modalStart !== -1 && modalEnd !== -1) {
  const targetModal = html.substring(modalStart, modalEnd);
  const newModal = `<!-- ==================== MODAL LOGIN ADMIN: 2 METODE (OTP EMAIL & LOGIN CEPAT) ==================== -->
    <div id="modalAdminLogin" class="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-all duration-300 opacity-0 pointer-events-none" aria-hidden="true">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-left space-y-5 transform scale-95 transition-transform duration-200">
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-sdw-pine to-emerald-950 text-white flex items-center justify-center text-lg shadow-md ring-4 ring-emerald-100">
                        <i class="fa-solid fa-shield-halved text-amber-300"></i>
                    </div>
                    <div>
                        <h3 class="text-base font-black text-slate-900 tracking-tight">Portal Administrasi SDW UMROH</h3>
                        <p class="text-[11px] text-slate-500 font-medium">Sistem Autentikasi Real &bull; Pola Asnawiyyah</p>
                    </div>
                </div>
                <button type="button" onclick="SDW_ADMIN.closeLoginModal()" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs transition cursor-pointer" title="Tutup">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Two Tab Switcher: OTP Email vs Login Cepat -->
            <div class="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold gap-1">
                <button type="button" id="tabBtnLoginOtp" onclick="SDW_ADMIN_AUTH.switchLoginTab('otp')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 bg-white text-sdw-pine shadow-xs cursor-pointer">
                    <i class="fa-solid fa-envelope-open-text text-amber-500"></i>
                    <span>Login OTP Email</span>
                </button>
                <button type="button" id="tabBtnLoginQuick" onclick="SDW_ADMIN_AUTH.switchLoginTab('quick')" class="py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer">
                    <i class="fa-solid fa-bolt text-emerald-600"></i>
                    <span>Login Cepat (Terdaftar)</span>
                </button>
            </div>

            <!-- ==================== TAB 1: LOGIN DENGAN OTP EMAIL ==================== -->
            <div id="loginTabContentOtp" class="space-y-4">
                <!-- STEP 1: Input Email -->
                <div id="otpStep1Container" class="space-y-3.5">
                    <div class="space-y-1">
                        <label class="block text-xs font-bold text-slate-700">Alamat Email Terdaftar (DB_Users)</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                                <i class="fa-solid fa-envelope"></i>
                            </span>
                            <input type="email" id="loginOtpEmailInput" placeholder="contoh: ops@sdwumroh.com atau admin@sdwumroh.com" class="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:border-sdw-pine focus:ring-2 focus:ring-emerald-200 outline-none transition bg-white">
                        </div>
                        <p class="text-[10.5px] text-slate-500">Sistem akan mengirimkan 6 digit kode OTP rahasia ke kotak masuk email Anda.</p>
                    </div>

                    <button type="button" id="btnSendLoginOtp" onclick="SDW_ADMIN_AUTH.handleSendOtp()" class="w-full py-3 px-4 rounded-xl bg-sdw-pine hover:bg-emerald-900 active:scale-98 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                        <i class="fa-solid fa-paper-plane text-amber-300"></i>
                        <span>Kirim Kode OTP ke Email</span>
                    </button>
                </div>

                <!-- STEP 2: Input 6 Digit OTP (Hidden awalnya) -->
                <div id="otpStep2Container" class="hidden space-y-4">
                    <div class="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                        <div class="flex items-center gap-1.5 font-bold">
                            <i class="fa-solid fa-circle-check text-emerald-600"></i>
                            <span>Kode OTP Berhasil Dikirim!</span>
                        </div>
                        <p class="text-[11px] text-emerald-800">
                            Silakan masukkan 6 digit angka yang dikirimkan ke <strong id="otpSentToEmailText" class="font-mono">email@sdwumroh.com</strong>.
                        </p>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-slate-700 text-center">Masukkan 6 Digit Kode OTP</label>
                        <div class="relative max-w-xs mx-auto">
                            <input type="text" id="loginOtpCodeInput" maxlength="6" placeholder="• • • • • •" class="w-full py-3 text-center text-2xl font-black font-mono tracking-[10px] rounded-2xl border-2 border-slate-300 focus:border-sdw-pine focus:ring-4 focus:ring-emerald-100 outline-none transition bg-white text-slate-900">
                        </div>
                        <div class="flex items-center justify-between text-[11px] pt-1">
                            <span id="otpCountdownText" class="text-slate-500 font-semibold">Berlaku: <strong class="text-amber-600 font-mono">05:00</strong></span>
                            <button type="button" id="btnResendOtp" onclick="SDW_ADMIN_AUTH.handleSendOtp()" class="text-emerald-700 font-bold hover:underline cursor-pointer">
                                Kirim Ulang OTP
                            </button>
                        </div>
                    </div>

                    <button type="button" id="btnVerifyLoginOtp" onclick="SDW_ADMIN_AUTH.handleVerifyOtp()" class="w-full py-3 px-4 rounded-xl bg-sdw-pine hover:bg-emerald-900 active:scale-98 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                        <i class="fa-solid fa-key text-amber-300"></i>
                        <span>Verifikasi OTP &amp; Masuk Portal</span>
                    </button>

                    <button type="button" onclick="SDW_ADMIN_AUTH.resetOtpStep()" class="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
                        &larr; Ganti Alamat Email
                    </button>
                </div>
            </div>

            <!-- ==================== TAB 2: LOGIN CEPAT (EMAIL TERDAFTAR TANPA OTP) ==================== -->
            <div id="loginTabContentQuick" class="hidden space-y-4">
                <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div class="flex items-center gap-1.5 font-bold">
                        <i class="fa-solid fa-bolt text-amber-600"></i>
                        <span>Akses Cepat Khusus Email Terdaftar</span>
                    </div>
                    <p class="text-[11px] text-amber-800">
                        Pilih staf dari master pengguna aktif di <strong>DB_Users</strong> untuk langsung masuk tanpa OTP.
                    </p>
                </div>

                <!-- Input / Dropdown Email Terdaftar -->
                <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-700">Pilih Staf / Masukkan Email Terdaftar</label>
                    <div class="relative">
                        <select id="quickLoginSelect" onchange="document.getElementById('quickLoginEmailInput').value = this.value" class="w-full py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer">
                            <option value="">-- Pilih Akun Staf Terdaftar --</option>
                            <option value="admin@sdwumroh.com">👑 Admin Sistem (admin@sdwumroh.com) - ADMIN</option>
                            <option value="ops@sdwumroh.com">✈️ Staf Operasional (ops@sdwumroh.com) - OPERATIONS</option>
                            <option value="finance@sdwumroh.com">💰 Finance Officer (finance@sdwumroh.com) - FINANCE</option>
                            <option value="syarif@sdwumroh.com">👔 H. Muhammad Syarif (syarif@sdwumroh.com) - DIRECTOR</option>
                            <option value="sales@sdwumroh.com">💼 Senior Sales (sales@sdwumroh.com) - SALES</option>
                            <option value="salman@sdwumroh.com">🕋 Ust. DR. H. Salman, Lc. (salman@sdwumroh.com) - MUTHAWWIF</option>
                        </select>
                    </div>
                    <div class="pt-1">
                        <input type="email" id="quickLoginEmailInput" placeholder="Atau ketik email staf terdaftar..." class="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sdw-pine outline-none transition">
                    </div>
                </div>

                <button type="button" id="btnQuickLoginSubmit" onclick="SDW_ADMIN_AUTH.handleQuickLogin()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sdw-pine via-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 active:scale-98 text-white font-black text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <i class="fa-solid fa-arrow-right-to-bracket text-amber-300"></i>
                    <span>Masuk Langsung (Tanpa OTP)</span>
                </button>
            </div>

            <!-- Error Banner -->
            <div id="adminLoginError" class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hidden flex items-start gap-2">
                <i class="fa-solid fa-triangle-exclamation text-rose-500 mt-0.5 shrink-0"></i>
                <span id="adminLoginErrorMessage">Pemberitahuan galat.</span>
            </div>

            <!-- Footer Security Note -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-lock text-emerald-600"></i>
                    <span>RBAC 8 Role &bull; Real Database DB_Users</span>
                </span>
                <span class="font-mono text-slate-400">v2.5.1</span>
            </div>
        </div>
    </div>

    `;
  html = html.replace(targetModal, newModal);
  console.log('✅ Replaced modalAdminLogin with 2-Tab OTP & Quick Login in admin.html');
} else {
  console.error('❌ Could not find modalAdminLogin section');
}

fs.writeFileSync('admin.html', html, 'utf8');
console.log('✅ admin.html updated successfully');
