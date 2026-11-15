/**
 * ============================================================================
 * SDW UMROH — AUTHENTICATION & RBAC PERMISSION SERVICE
 * File: 04_AuthRbacService.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: 8 User Roles (SUPER_ADMIN, ADMIN, DIRECTOR, FINANCE, OPERATIONS, SALES, MUTHAWWIF, PILGRIM)
 * ============================================================================
 */

/**
 * Hash password / PIN dengan algoritma HMAC-SHA256
 */
function hashPassword_(password, salt) {
  if (!password) return '';
  salt = salt || CONFIG.DEFAULT_SALT;
  if (typeof Utilities !== 'undefined' && Utilities.computeHmacSha256Signature) {
    const signature = Utilities.computeHmacSha256Signature(String(password), salt);
    let hex = '';
    for (let i = 0; i < signature.length; i++) {
      let byteVal = signature[i];
      if (byteVal < 0) byteVal += 256;
      let byteHex = byteVal.toString(16);
      if (byteHex.length === 1) byteHex = '0' + byteHex;
      hex += byteHex;
    }
    return hex;
  }
  // Fallback environment test
  return 'hashed_' + password;
}

/**
 * Verifikasi kecocokan password terhadap hash atau default master password
 */
function verifyPassword_(inputPassword, salt, storedHash) {
  if (!inputPassword) return false;
  // Jika hash belum tercatat di database, verifikasi password default warisan
  if (!storedHash || storedHash === '-' || storedHash === '') {
    return inputPassword === 'admin123' || inputPassword === 'sdw123' || inputPassword === '123456';
  }
  const computed = hashPassword_(inputPassword, salt);
  return computed === storedHash;
}

/**
 * Autentikasi Pengguna Staf Backoffice (7 Role Staf Internal)
 */
function loginStaff_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  let sheet = ss.getSheetByName("DB_Users");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Users");
  }
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const identifier = String(payload.identifier || payload.email || payload.phone || '').trim().toLowerCase();
  const password = String(payload.password || '').trim();

  if (!identifier || !password) {
    return { success: false, message: "Email / No. HP dan Kata Sandi wajib diisi" };
  }

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(h) { return String(h).trim(); });

  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('name');
  const emailIdx = headers.indexOf('email');
  const phoneIdx = headers.indexOf('phone');
  const roleIdx = headers.indexOf('role');
  const statusIdx = headers.indexOf('status');
  const entityIdx = headers.indexOf('connected_entity');
  const hashIdx = headers.indexOf('password_hash');
  const saltIdx = headers.indexOf('salt');
  const lastActiveIdx = headers.indexOf('last_active');
  const lastLoginIdx = headers.indexOf('last_login');

  const cleanDigits = identifier.replace(/[^0-9]/g, '');
  let foundUser = null;
  let foundRowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const uId = String(idIdx !== -1 ? row[idIdx] : '').trim().toLowerCase();
    const uEmail = String(emailIdx !== -1 ? row[emailIdx] : '').trim().toLowerCase();
    const uPhone = String(phoneIdx !== -1 ? row[phoneIdx] : '').replace(/[^0-9]/g, '');

    const matchEmail = uEmail && uEmail === identifier;
    const matchId = uId && uId === identifier;
    const matchPhone = cleanDigits && cleanDigits.length >= 6 && uPhone.endsWith(cleanDigits);

    if (matchEmail || matchId || matchPhone) {
      foundUser = {
        id: row[idIdx],
        name: row[nameIdx] || 'Pengguna',
        email: emailIdx !== -1 ? row[emailIdx] : '',
        phone: phoneIdx !== -1 ? row[phoneIdx] : '',
        role: roleIdx !== -1 ? String(row[roleIdx]).toUpperCase().trim() : 'PILGRIM',
        status: statusIdx !== -1 ? String(row[statusIdx]).toUpperCase().trim() : 'ACTIVE',
        connected_entity: entityIdx !== -1 ? row[entityIdx] : '-',
        password_hash: hashIdx !== -1 ? row[hashIdx] : '',
        salt: saltIdx !== -1 ? row[saltIdx] : ''
      };
      foundRowIndex = i + 1;
      break;
    }
  }

  if (!foundUser) {
    return { success: false, message: "Pengguna dengan email / no. HP tersebut tidak ditemukan di sistem." };
  }

  // Larang login jamaah di portal admin
  if (foundUser.role === 'PILGRIM') {
    return {
      success: false,
      isPilgrimRedirect: true,
      message: "Akun Anda terdaftar sebagai Jamaah (PILGRIM). Silakan masuk melalui aplikasi Mobile PWA SDW UMROH (app.html)."
    };
  }

  if (foundUser.status === 'INACTIVE') {
    return { success: false, message: "Akun ini berstatus NONAKTIF. Silakan hubungi Super Administrator." };
  }

  const isValidPassword = verifyPassword_(password, foundUser.salt, foundUser.password_hash);
  if (!isValidPassword) {
    return { success: false, message: "Kata sandi yang Anda masukkan salah. Silakan coba kembali." };
  }

  // Update last_login jika kolom tersedia
  const nowStr = formatDateSafe_(new Date());
  if (lastLoginIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastLoginIdx + 1).setValue(nowStr);
  }
  if (lastActiveIdx !== -1 && foundRowIndex > 0) {
    sheet.getRange(foundRowIndex, lastActiveIdx + 1).setValue("Baru saja");
  }

  // Query permissions dari DB_Role_Permissions
  const permissions = getRolePermissions_(ss, foundUser.role);

  logAudit_(foundUser.name, "STAFF_LOGIN", "DB_Users", foundUser.id, null, null, "Staf " + foundUser.name + " (" + foundUser.role + ") berhasil login ke portal admin.");

  const token = "SDW_AUTH_" + (typeof Utilities !== 'undefined' ? Utilities.getUuid() : Math.random().toString(36).substring(2));

  return {
    success: true,
    message: "Login berhasil. Selamat datang, " + foundUser.name,
    user: {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      phone: foundUser.phone,
      role: foundUser.role,
      status: foundUser.status,
      connected_entity: foundUser.connected_entity
    },
    permissions: permissions,
    token: token
  };
}

/**
 * Autentikasi Pengguna Jamaah (PILGRIM) via Mobile PWA (NIK + No WhatsApp)
 */
function loginPilgrim_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  const nik = String(payload.nik || '').trim();
  const phone = normalizePhone_(payload.phone);

  if (!nik && !phone) {
    return { success: false, message: "Nomor WhatsApp atau NIK KTP wajib diisi untuk masuk." };
  }

  // 1. Cari di DB_Customers
  const custSheet = ss.getSheetByName("DB_Customers");
  let foundCustomer = null;
  if (custSheet && custSheet.getLastRow() > 1) {
    const rows = custSheet.getDataRange().getValues();
    const headers = rows[0];
    const nikIdx = headers.indexOf('nik');
    const phoneIdx = headers.indexOf('phone');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rNik = nikIdx !== -1 ? String(row[nikIdx]).trim() : '';
      const rPhone = phoneIdx !== -1 ? normalizePhone_(row[phoneIdx]) : '';

      if ((nik && rNik === nik) || (phone && rPhone && (rPhone === phone || rPhone.endsWith(phone.slice(-8))))) {
        const obj = {};
        headers.forEach(function(h, idx) { obj[h] = row[idx]; });
        foundCustomer = obj;
        break;
      }
    }
  }

  // 2. Cari pendaftaran aktif di DB_Registrations
  let activeRegistration = null;
  if (foundCustomer) {
    const regSheet = ss.getSheetByName("DB_Registrations");
    if (regSheet && regSheet.getLastRow() > 1) {
      const regRows = regSheet.getDataRange().getValues();
      const regHeaders = regRows[0];
      const custIdIdx = regHeaders.indexOf('customer_id');
      for (let i = regRows.length - 1; i >= 1; i--) {
        if (regRows[i][custIdIdx] === foundCustomer.id) {
          const rObj = {};
          regHeaders.forEach(function(h, idx) { rObj[h] = regRows[i][idx]; });
          activeRegistration = rObj;
          break;
        }
      }
    }
  }

  if (!foundCustomer) {
    return {
      success: false,
      notRegistered: true,
      message: "Data jamaah dengan NIK / WhatsApp tersebut belum terdaftar di sistem. Silakan lakukan pendaftaran mandiri atau hubungi konsultan kami."
    };
  }

  logAudit_(foundCustomer.full_name || "JAMAAH", "PILGRIM_LOGIN", "DB_Customers", foundCustomer.id, null, null, "Jamaah berhasil login via PWA Mobile");

  return {
    success: true,
    message: "Selamat datang kembali, " + (foundCustomer.full_name || "Jamaah"),
    customer: foundCustomer,
    registration: activeRegistration,
    token: "SDW_PILGRIM_" + (typeof Utilities !== 'undefined' ? Utilities.getUuid() : Math.random().toString(36).substring(2))
  };
}

/**
 * Pendaftaran Mandiri Jamaah (Self-Register via PWA)
 */
function registerPilgrim_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses");

  const nowStr = formatDateSafe_(new Date());

  const custSheet = ss.getSheetByName("DB_Customers");
  if (!custSheet) throw new Error("Sheet DB_Customers tidak ditemukan");

  const newCustId = payload.customerId || payload.id || ("CUS-" + String(Math.max(1, custSheet.getLastRow())).padStart(6, '0'));
  const custRow = [
    newCustId,
    payload.nik || "-",
    payload.fullName || payload.name || "Jamaah Baru",
    payload.gender || "-",
    payload.birthDate || "-",
    payload.birthPlace || "-",
    payload.phone || "-",
    payload.email || "-",
    payload.address || "-",
    payload.city || "-",
    payload.province || "-",
    nowStr,
    nowStr
  ];
  custSheet.appendRow(custRow);

  // Buatkan prospek baru di DB_Leads agar tim sales ternotifikasi
  let newLeadId = null;
  const leadSheet = ss.getSheetByName("DB_Leads");
  if (leadSheet) {
    newLeadId = "LED-" + String(Math.max(1, leadSheet.getLastRow())).padStart(6, '0');
    const leadRow = [
      newLeadId,
      newCustId,
      payload.source || "PWA_SELF_REGISTER",
      "Belum Ditugaskan",
      "NEW",
      "MEDIUM",
      payload.budget || "Program Umroh 1448H",
      payload.notes || ("Pendaftaran mandiri akun jamaah via PWA (" + (payload.phone || "") + ")"),
      nowStr,
      nowStr
    ];
    leadSheet.appendRow(leadRow);
  }

  // Buatkan akun di DB_Users dengan role PILGRIM
  let newUserId = null;
  const userSheet = ss.getSheetByName("DB_Users");
  if (userSheet) {
    newUserId = "USR-" + String(Math.max(1, userSheet.getLastRow())).padStart(6, '0');
    const headers = userSheet.getDataRange().getValues()[0];
    const userRowObj = {
      id: newUserId,
      name: payload.fullName || payload.name || "Jamaah Baru",
      email: payload.email || (payload.phone ? payload.phone + "@jamaah.sdw" : "-"),
      phone: payload.phone || "-",
      role: "PILGRIM",
      status: "ACTIVE",
      connected_entity: newCustId,
      last_active: "Baru saja",
      created_at: nowStr,
      updated_at: nowStr
    };
    const rowData = headers.map(function(h) { return userRowObj[h] !== undefined ? userRowObj[h] : "-"; });
    userSheet.appendRow(rowData);
  }

  logAudit_(actor || "PWA_APP", "REGISTER_ACCOUNT", "DB_Customers", newCustId, null, {
    customerId: newCustId,
    leadId: newLeadId,
    userId: newUserId,
    fullName: payload.fullName,
    phone: payload.phone
  }, "Pendaftaran mandiri akun jamaah via PWA");

  return {
    id: newCustId,
    leadId: newLeadId,
    userId: newUserId,
    status: "CREATED",
    entity: "DB_Customers",
    fullName: payload.fullName
  };
}

/**
 * Menyimpan atau memperbarui data pengguna (DB_Users)
 */
function saveUser_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  let sheet = ss.getSheetByName("DB_Users");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Users");
  }
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(function(h) { return String(h).trim(); });

  let id = payload.id;
  let rowIndex = -1;

  if (id) {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][headers.indexOf('id')]).toUpperCase() === String(id).toUpperCase()) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  if (!id || rowIndex === -1) {
    id = "USR-" + Utilities.formatString("%06d", rows.length);
  }

  // Validasi Role
  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'FINANCE', 'OPERATIONS', 'SALES', 'MUTHAWWIF', 'PILGRIM'];
  let role = String(payload.role || 'PILGRIM').toUpperCase().trim();
  if (validRoles.indexOf(role) === -1) {
    role = 'PILGRIM';
  }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').toLowerCase().trim();
  const phone = normalizePhone_(payload.phone);
  const status = String(payload.status || 'ACTIVE').toUpperCase().trim();
  const connected_entity = String(payload.connected_entity || '-').trim();

  // Tangani Password Hashing jika disertakan
  let salt = (rowIndex > 0 && headers.indexOf('salt') !== -1) ? rows[rowIndex - 1][headers.indexOf('salt')] : '';
  let password_hash = (rowIndex > 0 && headers.indexOf('password_hash') !== -1) ? rows[rowIndex - 1][headers.indexOf('password_hash')] : '';

  if (payload.password) {
    salt = typeof Utilities !== 'undefined' ? Utilities.getUuid().substring(0, 16) : Math.random().toString(36).substring(2, 10);
    password_hash = hashPassword_(payload.password, salt);
  }

  const created_at = (rowIndex > 0 && headers.indexOf('created_at') !== -1 && rows[rowIndex - 1][headers.indexOf('created_at')])
    ? rows[rowIndex - 1][headers.indexOf('created_at')]
    : nowStr;

  const userMap = {
    id: id,
    name: name,
    email: email,
    phone: phone,
    role: role,
    status: status,
    connected_entity: connected_entity,
    password_hash: password_hash,
    salt: salt,
    last_active: 'Baru saja',
    last_login: (rowIndex > 0 && headers.indexOf('last_login') !== -1) ? rows[rowIndex - 1][headers.indexOf('last_login')] : '-',
    created_at: created_at,
    updated_at: nowStr
  };

  const rowData = headers.map(function(h) {
    return userMap[h] !== undefined ? userMap[h] : '-';
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_USER" : "CREATE_USER", "DB_Users", id, null, {
    id: id, name: name, email: email, role: role, status: status
  }, "Pengguna '" + name + "' (" + role + ") berhasil disimpan");

  return { id: id, name: name, email: email, role: role, status: status, entity: "DB_Users" };
}

/**
 * Menghapus/menonaktifkan pengguna (Soft Delete)
 */
function deleteUser_(ss, userId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Users");
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(userId).toUpperCase()) {
      if (statusIdx !== -1) {
        sheet.getRange(i + 1, statusIdx + 1).setValue('INACTIVE');
      }
      logAudit_(actor, "DEACTIVATE_USER", "DB_Users", userId, null, null, "Pengguna dinonaktifkan");
      return { id: userId, action: 'INACTIVE', message: 'Pengguna berhasil dinonaktifkan' };
    }
  }
  return { id: userId, error: "ID pengguna tidak ditemukan" };
}

/**
 * Mengubah status aktif/nonaktif pengguna
 */
function toggleUserStatus_(ss, userId, newStatus, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Users");
  if (!sheet) throw new Error("Sheet DB_Users tidak ditemukan");

  newStatus = String(newStatus || 'ACTIVE').toUpperCase().trim();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(userId).toUpperCase()) {
      if (statusIdx !== -1) {
        sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      }
      logAudit_(actor, "TOGGLE_USER_STATUS", "DB_Users", userId, null, { status: newStatus }, "Status pengguna diubah ke " + newStatus);
      return { id: userId, status: newStatus, message: 'Status pengguna berhasil diperbarui' };
    }
  }
  return { id: userId, error: "ID pengguna tidak ditemukan" };
}

/**
 * Membaca seluruh daftar pengguna dengan sanitasi data sensitif
 */
function getUsers_(ss) {
  if (!ss) ss = getSpreadsheet();
  const rawUsers = getSheetRowsAsObjects_(ss, "DB_Users");
  return rawUsers.map(function(u) {
    const clean = Object.assign({}, u);
    delete clean.password_hash;
    delete clean.salt;
    delete clean.password;
    return clean;
  });
}

/**
 * Membaca matriks izin RBAC dari DB_Role_Permissions
 */
function getRolePermissions_(ss, specificRoleKey) {
  if (!ss) ss = getSpreadsheet();
  let permissions = getSheetRowsAsObjects_(ss, "DB_Role_Permissions");
  if (specificRoleKey) {
    const filtered = {};
    permissions.forEach(function(p) {
      if (String(p.role_key).toUpperCase() === String(specificRoleKey).toUpperCase()) {
        filtered[p.module_key] = p.access_level;
      }
    });
    return filtered;
  }
  return permissions;
}

/**
 * Menyimpan 1 baris izin modul RBAC
 */
function saveRoleMatrixPermission_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  let sheet = ss.getSheetByName("DB_Role_Permissions");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Role_Permissions");
  }
  if (!sheet) throw new Error("Sheet DB_Role_Permissions tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const role_key = String(payload.role_key || '').toUpperCase().trim();
  const role_name = String(payload.role_name || role_key).trim();
  const module_key = String(payload.module_key || '').trim();
  const access_level = String(payload.access_level || 'NONE').toUpperCase().trim();
  const relId = 'RBAC-' + role_key + '-' + module_key.replace('tab-', '').toUpperCase();

  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toUpperCase() === role_key && String(rows[i][3]) === module_key) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowData = [relId, role_key, role_name, module_key, access_level, nowStr];
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, "UPDATE_RBAC_PERMISSION", "DB_Role_Permissions", relId, null, payload, "Izin " + role_key + " untuk " + module_key + " diset ke " + access_level);
  return { id: relId, role_key: role_key, module_key: module_key, access_level: access_level, entity: "DB_Role_Permissions" };
}

/**
 * Update massal level akses suatu peran
 */
function batchUpdateRolePermissions_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  let sheet = ss.getSheetByName("DB_Role_Permissions");
  if (!sheet) {
    upgradeUsersSchema_(ss);
    sheet = ss.getSheetByName("DB_Role_Permissions");
  }
  if (!sheet) throw new Error("Sheet DB_Role_Permissions tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const role_key = String(payload.role_key || '').toUpperCase().trim();
  const access_level = String(payload.access_level || 'VIEW').toUpperCase().trim();
  const rows = sheet.getDataRange().getValues();
  let updatedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).toUpperCase() === role_key) {
      sheet.getRange(i + 1, 5).setValue(access_level);
      sheet.getRange(i + 1, 6).setValue(nowStr);
      updatedCount++;
    }
  }

  logAudit_(actor, "BATCH_UPDATE_RBAC", "DB_Role_Permissions", role_key, null, payload, "Seluruh modul peran " + role_key + " diset ke " + access_level);
  return { role_key: role_key, access_level: access_level, updatedCount: updatedCount, entity: "DB_Role_Permissions" };
}

/**
 * Upgrade skema DB_Users dan DB_Role_Permissions
 */
function upgradeUsersSchema_(ss) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) return;

  const nowStr = formatDateSafe_(new Date());
  let uSheet = ss.getSheetByName("DB_Users");
  const targetHeaders = ["id", "name", "email", "phone", "role", "status", "connected_entity", "password_hash", "salt", "last_active", "last_login", "created_at", "updated_at"];

  if (!uSheet) {
    uSheet = ss.insertSheet("DB_Users");
    uSheet.getRange(1, 1, 1, targetHeaders.length).setValues([targetHeaders]);
    uSheet.setFrozenRows(1);
  } else {
    const curHeaders = uSheet.getRange(1, 1, 1, Math.max(1, uSheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
    targetHeaders.forEach(function(h) {
      if (curHeaders.indexOf(h) === -1) {
        const nextCol = uSheet.getLastColumn() + 1;
        uSheet.getRange(1, nextCol).setValue(h);
      }
    });
  }

  let rSheet = ss.getSheetByName("DB_Role_Permissions");
  const rHeaders = ["id", "role_key", "role_name", "module_key", "access_level", "updated_at"];
  if (!rSheet) {
    rSheet = ss.insertSheet("DB_Role_Permissions");
    rSheet.getRange(1, 1, 1, rHeaders.length).setValues([rHeaders]);
    rSheet.setFrozenRows(1);
  }

  // Inisialisasi default jika kosong
  if (rSheet.getLastRow() <= 1) {
    seedRbacDefaultMatrix_(ss);
  }
}

/**
 * Seed default 8 role x 20 modul matriks RBAC
 */
function seedRbacDefaultMatrix_(ss) {
  if (!ss) ss = getSpreadsheet();
  const rSheet = ss.getSheetByName("DB_Role_Permissions");
  if (!rSheet) return;

  const nowStr = formatDateSafe_(new Date());
  const modules = [
    'tab-dashboard', 'tab-crm', 'tab-packages', 'tab-departures',
    'tab-hotels', 'tab-airlines', 'tab-gallery', 'tab-articles',
    'tab-faq', 'tab-docs', 'tab-registrations', 'tab-finance',
    'tab-operations', 'tab-certificates', 'tab-badal-certificates',
    'tab-profile', 'tab-contact-social', 'tab-users', 'tab-roles', 'tab-audit'
  ];

  const roles = [
    { key: 'SUPER_ADMIN', name: 'Super Admin' },
    { key: 'ADMIN', name: 'Admin Backoffice' },
    { key: 'DIRECTOR', name: 'Pimpinan / Direksi' },
    { key: 'FINANCE', name: 'Keuangan & Kasir' },
    { key: 'OPERATIONS', name: 'Staf Operasional' },
    { key: 'SALES', name: 'Sales & Konsultan' },
    { key: 'MUTHAWWIF', name: 'Muthawwif & TL' },
    { key: 'PILGRIM', name: 'Akun Jamaah' }
  ];

  const defaultRules = {
    'SUPER_ADMIN': function() { return 'FULL'; },
    'ADMIN': function(m) { return m === 'tab-roles' ? 'VIEW' : 'FULL'; },
    'DIRECTOR': function() { return 'VIEW'; },
    'FINANCE': function(m) {
      if (m === 'tab-finance') return 'FULL';
      if (['tab-dashboard', 'tab-registrations', 'tab-packages', 'tab-departures'].indexOf(m) !== -1) return 'VIEW';
      return 'NONE';
    },
    'OPERATIONS': function(m) {
      if (['tab-operations', 'tab-departures', 'tab-hotels', 'tab-airlines', 'tab-certificates', 'tab-badal-certificates'].indexOf(m) !== -1) return 'FULL';
      if (['tab-dashboard', 'tab-packages', 'tab-registrations'].indexOf(m) !== -1) return 'VIEW';
      return 'NONE';
    },
    'SALES': function(m) {
      if (m === 'tab-crm') return 'OWN';
      if (['tab-dashboard', 'tab-packages', 'tab-departures', 'tab-hotels', 'tab-airlines', 'tab-gallery', 'tab-faq', 'tab-profile', 'tab-contact-social'].indexOf(m) !== -1) return 'VIEW';
      if (m === 'tab-registrations') return 'INPUT';
      return 'NONE';
    },
    'MUTHAWWIF': function(m) {
      if (m === 'tab-operations') return 'OWN';
      if (['tab-dashboard', 'tab-articles', 'tab-faq', 'tab-certificates'].indexOf(m) !== -1) return 'VIEW';
      return 'NONE';
    },
    'PILGRIM': function() { return 'NONE'; }
  };

  const matrixRows = [];
  roles.forEach(function(r) {
    modules.forEach(function(m) {
      const relId = 'RBAC-' + r.key + '-' + m.replace('tab-', '').toUpperCase();
      const level = defaultRules[r.key] ? defaultRules[r.key](m) : 'NONE';
      matrixRows.push([relId, r.key, r.name, m, level, nowStr]);
    });
  });

  if (matrixRows.length > 0) {
    rSheet.getRange(2, 1, matrixRows.length, 6).setValues(matrixRows);
  }
}
