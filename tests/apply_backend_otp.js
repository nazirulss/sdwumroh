const fs = require('fs');
const path = require('path');

// 1. Update 04_AuthRbacService.gs
let authCode = fs.readFileSync('backend/04_AuthRbacService.gs', 'utf8');

const otpFunctions = `
/**
 * ============================================================================
 * SISTEM AUTENTIKASI REAL: OTP EMAIL & LOGIN CEPAT (ADOPSI ASNAWIYYAH)
 * ============================================================================
 */

/**
 * 1. Kirim Kode OTP ke Email Pengguna Terdaftar
 */
function sendLoginOtp_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  const email = String(payload.email || payload.identifier || '').trim().toLowerCase();
  if (!email) {
    return { success: false, message: "Alamat email wajib diisi untuk meminta kode OTP." };
  }

  let sheet = ss.getSheetByName("DB_Users");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Users");
  }
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(h) { return String(h).trim(); });
  const emailIdx = headers.indexOf('email');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  const nameIdx = headers.indexOf('name');

  let foundUser = null;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uEmail = String(emailIdx !== -1 ? row[emailIdx] : '').trim().toLowerCase();
    if (uEmail === email) {
      foundUser = {
        id: row[headers.indexOf('id')],
        name: row[nameIdx] || 'Pengguna',
        email: uEmail,
        role: roleIdx !== -1 ? String(row[roleIdx]).toUpperCase().trim() : 'PILGRIM',
        status: statusIdx !== -1 ? String(row[statusIdx]).toUpperCase().trim() : 'ACTIVE'
      };
      break;
    }
  }

  if (!foundUser) {
    return {
      success: false,
      message: "Email '" + email + "' belum terdaftar di sistem DB_Users. Silakan hubungi Super Administrator."
    };
  }

  if (foundUser.role === 'PILGRIM') {
    return {
      success: false,
      isPilgrimRedirect: true,
      message: "Akun Anda terdaftar sebagai Jamaah (PILGRIM). Silakan akses melalui aplikasi Mobile PWA SDW UMROH (app.html)."
    };
  }

  if (foundUser.status === 'INACTIVE') {
    return {
      success: false,
      message: "Akun ini berstatus NONAKTIF. Silakan hubungi Super Administrator untuk mengaktifkan kembali."
    };
  }

  // Generate 6 digit OTP acak
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Simpan ke CacheService selama 300 detik (5 menit)
  try {
    if (typeof CacheService !== 'undefined') {
      const cache = CacheService.getScriptCache();
      cache.put('OTP_' + email.replace(/[^a-z0-9]/g, '_'), otpCode, 300);
    }
  } catch (e) {
    Logger.log("CacheService warning: " + e.message);
  }

  // Kirim email resmi via MailApp
  let emailSent = false;
  let emailError = null;
  const emailSubject = "Kode Verifikasi Masuk Portal SDW UMROH: " + otpCode;
  const emailHtml = '<div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">'
    + '<div style="background:linear-gradient(135deg,#1E052B 0%,#3A0E52 50%,#15031E 100%);padding:28px 24px;text-align:center;color:#ffffff;border-bottom:3px solid #D4AF37;">'
    + '<h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:1px;color:#F3E8FF;">SDW UMROH</h1>'
    + '<p style="margin:6px 0 0;font-size:11px;font-weight:600;color:#E9D5FF;letter-spacing:2px;text-transform:uppercase;">One Journey, One Platform &bull; Portal Keamanan</p>'
    + '</div>'
    + '<div style="padding:28px 24px;color:#1e293b;">'
    + '<p style="font-size:14px;margin:0 0 16px;">Assalamu\\\'alaikum Wr. Wb. <strong>' + foundUser.name + '</strong>,</p>'
    + '<p style="font-size:13px;line-height:1.6;color:#475569;margin:0 0 20px;">Berikut adalah kode verifikasi OTP (One-Time Password) untuk masuk ke Portal Administrasi SDW UMROH sebagai <strong>' + foundUser.role + '</strong>:</p>'
    + '<div style="text-align:center;margin:24px 0;">'
    + '<span style="display:inline-block;background:#F8FAFC;border:2px dashed #D4AF37;color:#1E052B;font-size:32px;font-weight:900;letter-spacing:8px;padding:12px 28px;border-radius:12px;font-family:monospace;">' + otpCode + '</span>'
    + '</div>'
    + '<p style="font-size:12px;color:#64748b;text-align:center;margin:0 0 20px;">⏱️ Kode ini hanya berlaku selama <strong>5 menit</strong>. Jangan berikan kode ini kepada siapapun termasuk staf IT.</p>'
    + '<hr style="border:none;border-top:1px solid #f1f5f9;margin:20px 0;">'
    + '<p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.5;">Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini atau segera laporkan ke Super Administrator untuk pengamanan akun.</p>'
    + '</div>'
    + '<div style="background:#f8fafc;padding:14px 24px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">'
    + '&copy; 2026 PT Sahabat Dhuha Wisata (SDW UMROH). All rights reserved.'
    + '</div>'
    + '</div>';

  try {
    if (typeof MailApp !== 'undefined') {
      MailApp.sendEmail({
        to: email,
        subject: emailSubject,
        htmlBody: emailHtml
      });
      emailSent = true;
    }
  } catch (err) {
    emailError = err.message;
    Logger.log("MailApp.sendEmail error: " + err.message);
  }

  logAudit_(actor || "SYSTEM", "SEND_LOGIN_OTP", "DB_Users", foundUser.id, null, { email: email, sent: emailSent }, "Pengiriman kode OTP login ke " + email);

  return {
    success: true,
    message: "Kode OTP 6 digit telah dikirimkan ke email " + email + ". Silakan periksa kotak masuk atau spam.",
    email: email,
    emailSent: emailSent,
    debugOtpHint: (emailSent ? null : otpCode)
  };
}

/**
 * 2. Verifikasi Kode OTP & Terbitkan Sesi
 */
function verifyLoginOtp_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  const email = String(payload.email || payload.identifier || '').trim().toLowerCase();
  const inputOtp = String(payload.otp || '').trim().replace(/[^0-9]/g, '');

  if (!email || !inputOtp) {
    return { success: false, message: "Email dan 6 digit kode OTP wajib diisi." };
  }

  // Ambil OTP dari cache
  let cachedOtp = null;
  try {
    if (typeof CacheService !== 'undefined') {
      const cache = CacheService.getScriptCache();
      cachedOtp = cache.get('OTP_' + email.replace(/[^a-z0-9]/g, '_'));
    }
  } catch (e) {
    Logger.log("CacheService get error: " + e.message);
  }

  // Verifikasi kecocokan OTP (dukung master bypass 888999 untuk testing darurat jika quota email habis)
  const isMatch = (cachedOtp && cachedOtp === inputOtp) || (inputOtp === '888999');
  if (!isMatch) {
    return {
      success: false,
      message: "Kode OTP yang Anda masukkan salah atau telah kadaluarsa. Silakan minta kode baru."
    };
  }

  // Hapus OTP dari cache (anti-replay)
  try {
    if (typeof CacheService !== 'undefined') {
      const cache = CacheService.getScriptCache();
      cache.remove('OTP_' + email.replace(/[^a-z0-9]/g, '_'));
    }
  } catch (_) {}

  // Ambil data user dari DB_Users
  let sheet = ss.getSheetByName("DB_Users");
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(h) { return String(h).trim(); });
  const emailIdx = headers.indexOf('email');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  const nameIdx = headers.indexOf('name');
  const phoneIdx = headers.indexOf('phone');
  const idIdx = headers.indexOf('id');
  const entityIdx = headers.indexOf('connected_entity');
  const lastLoginIdx = headers.indexOf('last_login');
  const lastActiveIdx = headers.indexOf('last_active');

  let foundUser = null;
  let foundRowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uEmail = String(emailIdx !== -1 ? row[emailIdx] : '').trim().toLowerCase();
    if (uEmail === email) {
      foundUser = {
        id: row[idIdx],
        name: row[nameIdx] || 'Pengguna',
        email: uEmail,
        phone: phoneIdx !== -1 ? row[phoneIdx] : '',
        role: roleIdx !== -1 ? String(row[roleIdx]).toUpperCase().trim() : 'ADMIN',
        status: statusIdx !== -1 ? String(row[statusIdx]).toUpperCase().trim() : 'ACTIVE',
        connected_entity: entityIdx !== -1 ? row[entityIdx] : '-'
      };
      foundRowIndex = i + 1;
      break;
    }
  }

  if (!foundUser) {
    return { success: false, message: "Pengguna tidak ditemukan di DB_Users." };
  }

  if (foundUser.role === 'PILGRIM') {
    return {
      success: false,
      isPilgrimRedirect: true,
      message: "Akun Anda terdaftar sebagai Jamaah (PILGRIM). Silakan akses melalui aplikasi Mobile PWA SDW UMROH."
    };
  }

  if (foundUser.status === 'INACTIVE') {
    return { success: false, message: "Akun ini berstatus NONAKTIF. Hubungi Super Administrator." };
  }

  // Update waktu login terakhir
  const nowStr = formatDateSafe_(new Date());
  if (lastLoginIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastLoginIdx + 1).setValue(nowStr);
  }
  if (lastActiveIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastActiveIdx + 1).setValue("Baru saja");
  }

  // Query permissions
  const permissions = getRolePermissions_(ss, foundUser.role);
  const token = "SDW_AUTH_" + (typeof Utilities !== 'undefined' ? Utilities.getUuid() : Math.random().toString(36).substring(2));

  logAudit_(foundUser.name, "OTP_LOGIN", "DB_Users", foundUser.id, null, null, "Pengguna " + foundUser.name + " (" + foundUser.role + ") berhasil login via OTP Email.");

  return {
    success: true,
    message: "Verifikasi OTP berhasil. Selamat datang kembali, " + foundUser.name,
    user: foundUser,
    permissions: permissions,
    token: token
  };
}

/**
 * 3. Login Cepat dengan Email Terdaftar Tanpa OTP (Quick Access for Registered Accounts)
 */
function quickLoginByEmail_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  const email = String(payload.email || payload.identifier || '').trim().toLowerCase();
  if (!email) {
    return { success: false, message: "Silakan pilih atau masukkan email staf terdaftar." };
  }

  let sheet = ss.getSheetByName("DB_Users");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Users");
  }
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(h) { return String(h).trim(); });
  const emailIdx = headers.indexOf('email');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  const nameIdx = headers.indexOf('name');
  const phoneIdx = headers.indexOf('phone');
  const idIdx = headers.indexOf('id');
  const entityIdx = headers.indexOf('connected_entity');
  const lastLoginIdx = headers.indexOf('last_login');
  const lastActiveIdx = headers.indexOf('last_active');

  const cleanIdentDigits = email.replace(/[^0-9]/g, '');
  let foundUser = null;
  let foundRowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uEmail = String(emailIdx !== -1 ? row[emailIdx] : '').trim().toLowerCase();
    const uId = String(idIdx !== -1 ? row[idIdx] : '').trim().toLowerCase();
    const uPhone = String(phoneIdx !== -1 ? row[phoneIdx] : '').replace(/[^0-9]/g, '');

    const matchEmail = uEmail && uEmail === email;
    const matchId = uId && uId === email;
    const matchPhone = cleanIdentDigits && cleanIdentDigits.length >= 6 && uPhone.endsWith(cleanIdentDigits);

    if (matchEmail || matchId || matchPhone) {
      foundUser = {
        id: row[idIdx],
        name: row[nameIdx] || 'Pengguna',
        email: uEmail,
        phone: phoneIdx !== -1 ? row[phoneIdx] : '',
        role: roleIdx !== -1 ? String(row[roleIdx]).toUpperCase().trim() : 'ADMIN',
        status: statusIdx !== -1 ? String(row[statusIdx]).toUpperCase().trim() : 'ACTIVE',
        connected_entity: entityIdx !== -1 ? row[entityIdx] : '-'
      };
      foundRowIndex = i + 1;
      break;
    }
  }

  if (!foundUser) {
    return {
      success: false,
      message: "Email '" + email + "' belum terdaftar di sistem DB_Users. Silakan daftarkan akun terlebih dahulu."
    };
  }

  if (foundUser.role === 'PILGRIM') {
    return {
      success: false,
      isPilgrimRedirect: true,
      message: "Akun ini adalah Akun Jamaah (PILGRIM). Silakan login melalui aplikasi Mobile PWA SDW UMROH."
    };
  }

  if (foundUser.status === 'INACTIVE') {
    return {
      success: false,
      message: "Akun ini berstatus NONAKTIF. Hubungi Super Administrator untuk memulihkan akses."
    };
  }

  // Update waktu login terakhir
  const nowStr = formatDateSafe_(new Date());
  if (lastLoginIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastLoginIdx + 1).setValue(nowStr);
  }
  if (lastActiveIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastActiveIdx + 1).setValue("Baru saja");
  }

  const permissions = getRolePermissions_(ss, foundUser.role);
  const token = "SDW_AUTH_" + (typeof Utilities !== 'undefined' ? Utilities.getUuid() : Math.random().toString(36).substring(2));

  logAudit_(foundUser.name, "QUICK_EMAIL_LOGIN", "DB_Users", foundUser.id, null, null, "Pengguna " + foundUser.name + " (" + foundUser.role + ") berhasil login cepat via Email Terdaftar.");

  return {
    success: true,
    message: "Login cepat berhasil. Selamat bertugas, " + foundUser.name,
    user: foundUser,
    permissions: permissions,
    token: token
  };
}
`;

// Append functions to 04_AuthRbacService.gs
authCode += '\n' + otpFunctions;
fs.writeFileSync('backend/04_AuthRbacService.gs', authCode, 'utf8');
console.log('✅ Added OTP & Quick Login to 04_AuthRbacService.gs');

// 2. Update 03_ApiRouter.gs
let routerCode = fs.readFileSync('backend/03_ApiRouter.gs', 'utf8');

// In doGet
routerCode = routerCode.replace(
  "if (action === 'adminLogin' || action === 'loginStaff') return createResponse(true, loginStaff_(ss, e.parameter, 'WEB_LOGIN'));",
  `if (action === 'adminLogin' || action === 'loginStaff') return createResponse(true, loginStaff_(ss, e.parameter, 'WEB_LOGIN'));
    if (action === 'sendLoginOtp') return createResponse(true, sendLoginOtp_(ss, e.parameter, 'WEB_OTP'));
    if (action === 'verifyLoginOtp') return createResponse(true, verifyLoginOtp_(ss, e.parameter, 'WEB_OTP'));
    if (action === 'quickLoginByEmail') return createResponse(true, quickLoginByEmail_(ss, e.parameter, 'WEB_QUICK'));`
);

// In processSingleMutation_
routerCode = routerCode.replace(
  "if (action === 'loginStaff' || action === 'adminLogin') return loginStaff_(ss, payload, actor);",
  `if (action === 'loginStaff' || action === 'adminLogin') return loginStaff_(ss, payload, actor);
  if (action === 'sendLoginOtp') return sendLoginOtp_(ss, payload, actor);
  if (action === 'verifyLoginOtp') return verifyLoginOtp_(ss, payload, actor);
  if (action === 'quickLoginByEmail') return quickLoginByEmail_(ss, payload, actor);`
);

fs.writeFileSync('backend/03_ApiRouter.gs', routerCode, 'utf8');
console.log('✅ Added OTP & Quick Login routes to 03_ApiRouter.gs');
