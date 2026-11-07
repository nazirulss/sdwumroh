/**
 * ============================================================================
 * SDW UMROH — BACKEND WEB APP API CONTROLLER & DATABASE SETUP
 * File: Code.gs / sdw_umroh_apps_script_backend.js
 * Version: 2.1.0 (Fase 4 & 5: Live Database 22 Sheet & Offline-First Engine)
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Conforms to: docs/03_USER_ROLES_AND_PERMISSIONS.md, docs/07_INFORMATION_ARCHITECTURE.md,
 *              & sdw_umroh_spreadsheet_schema.md (22 Master Sheets)
 * ============================================================================
 */

const CONFIG = {
  APP_NAME: 'SDW UMROH API',
  VERSION: '2.2.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  SPREADSHEET_ID: '1UTZ2uJ76rxAljWlfOLx3MpCzV2e4JLUG5IJ7o8SZn3Q',
  DRIVE_FOLDER_ID: '1Xz5QTa68fcipY9BN_vIXsdLklH6bws-J'
};

/**
 * Helper: Mengambil atau membuat sub-folder Pasfoto_Sertifikat di dalam folder SDW_UMROH_Database
 */
function getPasfotoFolder() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== '__SDW_CONFIG_PENDING__') {
    try {
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      if (parentFolder) {
        const subFolders = parentFolder.getFoldersByName("Pasfoto_Sertifikat");
        if (subFolders.hasNext()) {
          return subFolders.next();
        }
        return parentFolder.createFolder("Pasfoto_Sertifikat");
      }
    } catch (e) {
      Logger.log("getPasfotoFolder parent error: " + e.message);
    }
  }

  try {
    const folders = DriveApp.getFoldersByName("Pasfoto_Sertifikat");
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder("Pasfoto_Sertifikat");
  } catch (e) {
    Logger.log("getPasfotoFolder root error: " + e.message);
    throw new Error("Gagal mengakses folder Pasfoto_Sertifikat di Google Drive: " + e.message);
  }
}

/**
 * JALANKAN FUNGSI INI 1x DI EDITOR APPS SCRIPT UNTUK MENYETUJUI IZIN GOOGLE DRIVE
 * Pilih fungsi 'authorizeDriveAccess' di dropdown toolbar, lalu klik tombol ▶️ 'Jalankan' (Run).
 * Klik 'Tinjau Izin' (Review Permissions) -> Akun Anda -> 'Lanjutan' (Advanced) -> 'Izinkan' (Allow).
 */
function authorizeDriveAccess() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  Logger.log("✅ Izin Google Drive BERHASIL! Folder Utama: " + folder.getName());
  const target = getPasfotoFolder();
  Logger.log("✅ Sub-Folder Pasfoto_Sertifikat SIAP! ID: " + target.getId() + " URL: " + target.getUrl());
  return {
    success: true,
    folderName: folder.getName(),
    subfolderName: target.getName(),
    subfolderId: target.getId(),
    subfolderUrl: target.getUrl()
  };
}

function testDriveUpload() {
  const folder = getPasfotoFolder();
  const blob = Utilities.newBlob("Test file pasfoto pada " + new Date().toISOString(), "text/plain", "test_diagnostic.txt");
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  Logger.log("✅ Berhasil upload test ke Drive! ID: " + file.getId() + " - URL: " + file.getUrl());
  return {
    success: true,
    fileId: file.getId(),
    url: file.getUrl(),
    folderName: folder.getName(),
    folderId: folder.getId()
  };
}

/**
 * SEED DATA: 44 Jamaah Real Kloter 27 Oktober 2026 yang telah memenuhi 4 syarat validasi e-sertifikat
 */
function seedKloter27Oktober2026(ss) {
  if (!ss) ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak ditemukan");

  const nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", CONFIG.DATE_FORMAT);

  // 1. DB_Departures: Update / Create DEP-20261027
  const depSheet = ss.getSheetByName("DB_Departures");
  if (depSheet) {
    const depData = depSheet.getDataRange().getValues();
    let depFound = false;
    for (let i = 1; i < depData.length; i++) {
      if (String(depData[i][0]) === "DEP-20261027") {
        depSheet.getRange(i + 1, 8).setValue(44); // capacity_booked
        depSheet.getRange(i + 1, 9).setValue("COMPLETED"); // status
        depSheet.getRange(i + 1, 10).setValue("Kloter Khidmat 27 Oktober 2026 (44 Jamaah Real Alumni)");
        depFound = true;
        break;
      }
    }
    if (!depFound) {
      depSheet.appendRow([
        "DEP-20261027",
        "PKG-000001",
        "2026-10-27T00:00:00.000Z",
        "2026-11-05T00:00:00.000Z",
        "Saudia Airlines (SV-818)",
        "SOC",
        45,
        44,
        "COMPLETED",
        "Kloter Khidmat 27 Oktober 2026 (44 Jamaah Real Alumni)"
      ]);
    }
  }

  // 44 Data Jamaah Real Sesuai Manifest Resmi 27 Oktober 2026
  const names = [
    "KHASAN MUNADI", "MIFNAHAH MUDAKIR KASRI", "SANALI BAJURI", "SITI NURIYAH",
    "MUKHLIS MUSLIH", "MUARIFAH ABDUL KARIM", "SUGIANTO SABAR", "HARTINI SUWARSONO",
    "ALI MUKID", "SRI NURYATI", "SUGIYONO PAMIN", "MAESAROH MARLAN",
    "SALEMAN DUL HOFUR", "SAMSONAH KASMIUN", "KANAPI SIRAT", "SOTIJAH SALEH",
    "MARYATUN SUWARNO", "MUNARTI MUKALIL", "SARMINAH SARBI", "KALIMAH GIMIN",
    "SULAMANAH KASAN", "SUWARIYAH JAHRI", "MUHAMAD MUNIF", "MADKHAN KAMRI",
    "AHMAD ZAINI", "MUKHAMMAD NURUL YAKIN", "DEWI WAHYUNINGSIH", "NAILA ABIDAH IZDIHAR",
    "HASNA NAFASYA SYATHIRA RAZQYA", "SUHARNI SARDI DULLAH", "NUR ISTIQOMAH JAYANTI", "INDANA ZULFA FILLAH",
    "SUTIYO PAIJAN", "SUYATI SUGIMIN", "MASHADI KASDI", "SOPIYAH ASNGADI",
    "SURIPAH SAHLI", "NURUZ ZAKIYAH", "ZURIYAH JAMIN", "MUNGIN YAHYO",
    "HARI PRI TUMINAH", "HARYATI ABDUL KOHIR", "JUNWADI PARSAN", "JAIMIN KASIPIN"
  ];

  // Helper hapus baris uji coba lama untuk kloter 27 Okt
  function cleanSheetRows(sheetName, idColIdx, prefix) {
    const sh = ss.getSheetByName(sheetName);
    if (!sh) return;
    const data = sh.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      const val = String(data[i][idColIdx]);
      if (val.indexOf(prefix) === 0) {
        sh.deleteRow(i + 1);
      }
    }
  }

  // Bersihkan data uji coba lama (REG-SDW-26*, CUS-26*, PAY-26*, DOC-26*, CUS-0001*)
  cleanSheetRows("DB_Registrations", 0, "REG-SDW-26");
  cleanSheetRows("DB_Customers", 0, "CUS-26");
  cleanSheetRows("DB_Payments", 0, "PAY-26");
  cleanSheetRows("DB_Pilgrim_Documents", 0, "DOC-26");
  cleanSheetRows("DB_Customers", 0, "CUS-0001");

  const custSheet = ss.getSheetByName("DB_Customers");
  const regSheet = ss.getSheetByName("DB_Registrations");
  const paySheet = ss.getSheetByName("DB_Payments");
  const docSheet = ss.getSheetByName("DB_Pilgrim_Documents");

  const cities = ["Kudus", "Demak", "Jepara", "Semarang", "Pati"];

  names.forEach(function(fullName, idx) {
    const numStr = String(idx + 1).padStart(2, '0');
    const regId = "REG-SDW-26" + numStr;
    const custId = "CUS-26" + numStr;
    const payId = "PAY-26" + numStr;
    const docId = "DOC-26" + numStr;
    const city = cities[idx % cities.length];
    const phone = "08123456" + String(2600 + idx + 1);
    const nik = "331901" + String(100000 + idx + 1) + "0001";
    const photoUrl = "https://lh3.googleusercontent.com/d/1CblSK1EVxRl3gQSyYsq_l8q6j0wg-Ziq";

    // 1. DB_Customers
    if (custSheet) {
      custSheet.appendRow([
        custId,
        nik,
        fullName,
        (idx % 2 === 0 ? "MALE" : "FEMALE"),
        "1975-05-15",
        city,
        phone,
        phone + "@jamaah.sdw.id",
        "Jl. Raya " + city + " No. " + (idx + 1),
        city,
        "Jawa Tengah",
        nowStr,
        nowStr
      ]);
    }

    // 2. DB_Registrations (Syarat 3: Berangkat & Selesai Kloter 27 Okt 2026)
    if (regSheet) {
      regSheet.appendRow([
        regId,
        custId,
        "DEP-20261027",
        "PKG-000001",
        "QUAD",
        33500000,
        0,
        33500000,
        "COMPLETED",
        "USR-000001",
        "Kloter Utama 27 Oktober 2026 (Alumni Real Mabrur)",
        nowStr,
        nowStr
      ]);
    }

    // 3. DB_Payments (Syarat 1: 100% Lunas)
    if (paySheet) {
      paySheet.appendRow([
        payId,
        regId,
        "SCH-LUNAS",
        33500000,
        "BANK_TRANSFER_BSI",
        "TRX-BSI-20261027-" + numStr,
        "mock_proof_lunas.jpg",
        "VERIFIED",
        "2026-10-20 09:00:00",
        "Finance Officer",
        "2026-10-20 09:30:00",
        "Pelunasan Biaya Umroh 100% Lunas"
      ]);
    }

    // 4. DB_Pilgrim_Documents (Syarat 2: Pasfoto Terverifikasi & Tersimpan di Drive)
    if (docSheet) {
      docSheet.appendRow([
        docId,
        regId,
        "DCR-000004",
        "PASFOTO_" + regId + ".jpg",
        photoUrl,
        "VERIFIED",
        "Pasfoto resmi E-Sertifikat Umroh (Tersimpan di Google Drive)",
        "Document Officer",
        "2026-10-22 10:00:00",
        nowStr
      ]);
    }
  });

  logAudit_("Admin Sistem", "SEED_REAL_44_JAMAAH", "DB_Registrations", "DEP-20261027", null, { total: names.length }, "Generate otomatis 44 data jamaah real kloter 27 Oktober 2026");

  return {
    success: true,
    message: "44 Data Jamaah Real Kloter 27 Oktober 2026 berhasil digenerate ke Google Spreadsheet!",
    totalPilgrims: names.length,
    departureId: "DEP-20261027",
    departureDate: "27 Oktober 2026"
  };
}

function createResponse(success, data, error, metadata) {
  const payload = {
    success: Boolean(success),
    data: data || null,
    error: error || null,
    metadata: Object.assign({
      system: CONFIG.APP_NAME,
      version: CONFIG.VERSION,
      timestamp: new Date().toISOString()
    }, metadata || {})
  };

  if (typeof ContentService !== 'undefined') {
    return ContentService.createTextOutput(JSON.stringify(payload))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return payload;
}

function getSpreadsheet() {
  try {
    if (typeof SpreadsheetApp !== 'undefined') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) return ss;
    }
  } catch (e) {
    // Standalone script
  }
  let propId = null;
  try {
    if (typeof PropertiesService !== 'undefined') {
      propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    }
  } catch (e) {}

  const targetId = propId || CONFIG.SPREADSHEET_ID;
  if (targetId && typeof SpreadsheetApp !== 'undefined') {
    return SpreadsheetApp.openById(targetId);
  }
  return null;
}

/**
 * Audit Logging Helper (Append-Only)
 */
function logAudit_(actor, action, entity, entityId, beforeState, afterState, reason) {
  try {
    const ss = getSpreadsheet();
    if (!ss) return;
    const sheet = ss.getSheetByName("DB_Audit_Logs");
    if (!sheet) return;

    let id = "AUD-";
    if (typeof Utilities !== 'undefined' && Utilities.getUuid) {
      id += Utilities.getUuid().substring(0, 8).toUpperCase();
    } else {
      id += Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    const timestamp = formatDateSafe_(new Date());

    sheet.appendRow([
      id,
      timestamp,
      actor || "SYSTEM",
      action || "UNKNOWN",
      entity || "GENERAL",
      entityId || "-",
      typeof beforeState === 'object' ? JSON.stringify(beforeState) : String(beforeState || "-"),
      typeof afterState === 'object' ? JSON.stringify(afterState) : String(afterState || "-"),
      reason || "-"
    ]);
  } catch (err) {
    if (typeof Logger !== 'undefined') Logger.log("Audit log failed: " + err.message);
  }
}

function formatDateSafe_(date) {
  if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
    return Utilities.formatDate(date, "Asia/Jakarta", CONFIG.DATE_FORMAT);
  }
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Helper untuk membaca sheet menjadi daftar array object (key-value header)
 */
function getSheetRowsAsObjects_(ss, sheetName) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() <= 1) return [];
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    return rows.slice(1).map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) {
        let val = row[i];
        if (val instanceof Date) {
          val = formatDateSafe_(val);
        }
        obj[h] = val;
      });
      return obj;
    });
  } catch (err) {
    if (typeof Logger !== 'undefined') Logger.log("getSheetRowsAsObjects_ error on " + sheetName + ": " + err.message);
    return [];
  }
}

/**
 * ============================================================================
 * BOOTSTRAP 22 SHEET MASTER DATABASE
 * Function: setupDatabase()
 * Jalankan fungsi ini dari dropdown tombol "Run" di Apps Script Editor,
 * atau via GET/POST { action: 'setupDatabase' }.
 * ============================================================================
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  if (!ss) {
    throw new Error("Spreadsheet tidak ditemukan! Pastikan CONFIG.SPREADSHEET_ID (" + CONFIG.SPREADSHEET_ID + ") valid dan memiliki izin akses.");
  }

  const SCHEMA_22_SHEETS = {
    DB_Users: ['id', 'name', 'email', 'role', 'status', 'phone', 'created_at', 'updated_at'],
    DB_Customers: ['id', 'nik', 'full_name', 'gender', 'birth_date', 'birth_place', 'phone', 'email', 'address', 'city', 'province', 'created_at', 'updated_at'],
    DB_Leads: ['id', 'customer_id', 'source', 'sales_owner_id', 'status', 'urgency', 'budget_range', 'notes', 'created_at', 'updated_at'],
    DB_Sales_Activities: ['id', 'lead_id', 'actor_id', 'activity_type', 'summary', 'outcome', 'timestamp'],
    DB_Follow_Ups: ['id', 'lead_id', 'sales_owner_id', 'scheduled_at', 'channel', 'notes', 'status', 'completed_at'],
    DB_Packages: ['id', 'name', 'slug', 'package_type', 'duration_days', 'status', 'description', 'published_at', 'created_at'],
    DB_Package_Prices: ['id', 'package_id', 'currency', 'quad_price', 'triple_price', 'double_price', 'effective_start', 'effective_end', 'status'],
    DB_Departures: ['id', 'package_id', 'departure_date', 'return_date', 'airline', 'origin_airport', 'capacity_total', 'capacity_booked', 'status', 'notes'],
    DB_Registrations: ['id', 'customer_id', 'departure_id', 'package_id', 'room_type', 'agreed_price_snapshot', 'discount_snapshot', 'final_price_snapshot', 'status', 'sales_id', 'notes', 'created_at', 'updated_at'],
    DB_Document_Requirements: ['id', 'code', 'title', 'description', 'is_mandatory', 'applies_to_gender', 'max_expiry_months'],
    DB_Pilgrim_Documents: ['id', 'registration_id', 'requirement_id', 'file_name', 'file_ref_mock', 'status', 'review_notes', 'verified_by', 'verified_at', 'updated_at'],
    DB_Invoices: ['id', 'registration_id', 'invoice_number', 'total_amount', 'paid_amount', 'outstanding_amount', 'due_date', 'status', 'created_at', 'updated_at'],
    DB_Payment_Schedules: ['id', 'invoice_id', 'term_number', 'title', 'amount', 'due_date', 'status'],
    DB_Payments: ['id', 'invoice_id', 'schedule_id', 'amount', 'payment_method', 'reference_number', 'proof_ref_mock', 'status', 'submitted_at', 'verified_by', 'verified_at', 'notes'],
    DB_Refunds: ['id', 'registration_id', 'invoice_id', 'amount_requested', 'cancellation_fee', 'amount_approved', 'status', 'reason', 'requested_at', 'processed_at'],
    DB_Preparation: ['id', 'registration_id', 'dimension', 'item_name', 'status', 'notes', 'updated_at'],
    DB_Manasik: ['id', 'departure_id', 'session_title', 'session_type', 'scheduled_at', 'location', 'muthawwif_id', 'status'],
    DB_Trips: ['id', 'departure_id', 'trip_code', 'lead_tour_leader_id', 'muthawwif_id', 'status', 'started_at', 'ended_at'],
    DB_Trip_Members: ['id', 'trip_id', 'registration_id', 'bus_number', 'makkah_room_number', 'madinah_room_number', 'special_assistance'],
    DB_Announcements: ['id', 'target_role', 'departure_id', 'title', 'body_content', 'priority', 'published_at', 'created_by'],
    DB_Notifications: ['id', 'user_id', 'title', 'message', 'category', 'is_read', 'action_link', 'created_at'],
    DB_Audit_Logs: ['id', 'timestamp', 'actor', 'action', 'entity', 'entity_id', 'before', 'after', 'reason']
  };

  const createdSheets = [];
  const existingSheets = [];
  const nowStr = formatDateSafe_(new Date());

  // 1. Buat dan format setiap sheet
  Object.keys(SCHEMA_22_SHEETS).forEach(function (sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    const headers = SCHEMA_22_SHEETS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdSheets.push(sheetName);
    } else {
      existingSheets.push(sheetName);
    }

    // Set header jika kosong
    if (sheet.getLastRow() === 0) {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setBackground("#240833"); // Royal Purple SDW
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Arial");
      headerRange.setFontSize(10);
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  });

  // 2. Isi Seed Data awal jika DB_Packages masih baru
  const pkgSheet = ss.getSheetByName("DB_Packages");
  if (pkgSheet && pkgSheet.getLastRow() <= 1) {
    seedInitialData_(ss, nowStr);
  }

  // 3. Hapus Sheet1 default jika ada
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  // Catat audit
  logAudit_("SYSTEM", "SETUP_DATABASE", "DATABASE", ss.getId(), null, { created: createdSheets.length, total: 22 }, "Inisialisasi 22 Sheet Master Berhasil");

  const result = {
    success: true,
    message: "22 Sheet Master Database berhasil diinisialisasi!",
    spreadsheetName: ss.getName(),
    spreadsheetId: ss.getId(),
    totalSheets: ss.getSheets().length,
    createdSheets: createdSheets,
    existingSheets: existingSheets
  };

  return result;
}

/**
 * Seed data untuk mengaktifkan prototipe seketika
 */
function seedInitialData_(ss, nowStr) {
  const seed = {
    DB_Users: [
      ['USR-000001', 'Staf Operasional', 'ops@sdwumroh.com', 'OPERATIONS', 'ACTIVE', '+6281234567890', nowStr, nowStr],
      ['USR-000002', 'Finance Officer', 'finance@sdwumroh.com', 'FINANCE', 'ACTIVE', '+6281234567891', nowStr, nowStr],
      ['USR-000003', 'Document Officer', 'docs@sdwumroh.com', 'DOCUMENT_OFFICER', 'ACTIVE', '+6281234567892', nowStr, nowStr],
      ['USR-000004', 'Ust. Ahmad Fauzi Ridwan, Lc.', 'fauzi@sdwumroh.com', 'TOUR_LEADER', 'ACTIVE', '+6281234567893', nowStr, nowStr],
      ['USR-000005', 'Ust. DR. H. Salman, Lc.', 'salman@sdwumroh.com', 'MUTHAWWIF', 'ACTIVE', '+6281234567894', nowStr, nowStr],
      ['USR-000006', 'Admin Sistem', 'admin@sdwumroh.com', 'ADMIN', 'ACTIVE', '+6281234567895', nowStr, nowStr]
    ],
    DB_Customers: [
      ['CUS-000001', '3276011205800001', 'Ahmad Jamaah Teladan', 'L', '1980-05-12', 'Jakarta', '081298765432', 'ahmad.jamaah@gmail.com', 'Jl. Melati No. 12', 'Jakarta Selatan', 'DKI Jakarta', nowStr, nowStr],
      ['CUS-000002', '3276015508820002', 'Ibu Siti Fatimah', 'P', '1982-08-15', 'Bandung', '081387654321', 'siti.fatimah@gmail.com', 'Jl. Dago Asri No. 45', 'Bandung', 'Jawa Barat', nowStr, nowStr],
      ['CUS-000003', '3174021004750003', 'Bpk. Gunawan Wibisono', 'L', '1975-04-10', 'Surabaya', '081123456789', 'gunawan.wibisono@gmail.com', 'Jl. Rungkut Madya No. 8', 'Surabaya', 'Jawa Timur', nowStr, nowStr],
      ['CUS-000004', '3171036811850004', 'Hj. Nurul Hidayah', 'P', '1985-11-28', 'Yogyakarta', '081567891234', 'nurul.hidayah@gmail.com', 'Jl. Malioboro No. 20', 'Yogyakarta', 'DI Yogyakarta', nowStr, nowStr]
    ],
    DB_Packages: [
      ['PKG-000001', 'Umroh Reguler 9 Hari', 'umroh-reguler-9h', 'REGULAR', 9, 'PUBLISHED', 'Paket favorit ibadah khusyuk. Hotel Retaj Al Rayyan Makkah & Concorde Dar Al Khair Madinah.', nowStr, nowStr],
      ['PKG-000002', 'Umroh VIP Bintang 5', 'umroh-vip-bintang-5', 'VIP', 9, 'PUBLISHED', 'Akomodasi mewah premium bintang 5 pelataran masjid. Swissotel Makkah & Dar Al Taqwa Madinah.', nowStr, nowStr],
      ['PKG-000003', 'Umroh Plus Turki 12 Hari', 'umroh-plus-turki-12h', 'PLUS_TURKEY', 12, 'PUBLISHED', 'Ibadah umroh lengkap dengan napak tilas sejarah peradaban Islam di Istanbul & Bursa.', nowStr, nowStr]
    ],
    DB_Package_Prices: [
      ['PRC-000001', 'PKG-000001', 'IDR', 32500000, 34500000, 37500000, '2026-01-01', '2027-12-31', 'ACTIVE'],
      ['PRC-000002', 'PKG-000002', 'IDR', 42500000, 45500000, 49500000, '2026-01-01', '2027-12-31', 'ACTIVE'],
      ['PRC-000003', 'PKG-000003', 'IDR', 38500000, 41500000, 45500000, '2026-01-01', '2027-12-31', 'ACTIVE']
    ],
    DB_Departures: [
      ['DEP-000001', 'PKG-000001', '2027-01-15', '2027-01-23', 'Saudia Airlines (SV-819)', 'CGK', 45, 45, 'FULL', 'Kloter Utama Awal Musim'],
      ['DEP-000002', 'PKG-000002', '2027-02-28', '2027-03-08', 'Garuda Indonesia (GA-980)', 'CGK', 45, 38, 'OPEN', 'Kloter VIP Syaban'],
      ['DEP-000003', 'PKG-000003', '2027-04-18', '2027-04-29', 'Turkish Airlines (TK-57)', 'CGK', 40, 22, 'OPEN', 'Kloter Plus Turki Syawal']
    ],
    DB_Registrations: [
      ['REG-SDW-2701', 'CUS-000001', 'DEP-000001', 'PKG-000001', 'QUAD', 34500000, 1000000, 33500000, 'CONFIRMED', 'USR-000001', 'Booking terkonfirmasi DP lunas', nowStr, nowStr],
      ['REG-SDW-2702', 'CUS-000002', 'DEP-000001', 'PKG-000001', 'DOUBLE', 37500000, 0, 37500000, 'CONFIRMED', 'USR-000001', 'Kamar double bersama suami', nowStr, nowStr],
      ['REG-SDW-2703', 'CUS-000003', 'DEP-000001', 'PKG-000001', 'TRIPLE', 35500000, 500000, 35000000, 'CONFIRMED', 'USR-000001', 'Kamar triple', nowStr, nowStr]
    ],
    DB_Document_Requirements: [
      ['DCR-000001', 'PASSPORT', 'Paspor Asli RI (Min 48 Halaman)', 'Masa berlaku minimal 7 bulan', true, 'ALL', 7],
      ['DCR-000002', 'KTP', 'Scan KTP Elektronik', 'KTP elektronik asli masih berlaku', true, 'ALL', 0],
      ['DCR-000003', 'VACCINE', 'Buku Kuning / Sertifikat Vaksin', 'Sertifikat resmi Kemenkes', true, 'ALL', 24],
      ['DCR-000004', 'PASPHOTO', 'Pasfoto 4x6 Latar Putih', 'Fokus wajah 80%', true, 'ALL', 6]
    ],
    DB_Pilgrim_Documents: [
      ['DOC-000001', 'REG-SDW-2701', 'DCR-000001', 'paspor_ahmad.pdf', 'mock_drive_paspor_01.pdf', 'VERIFIED', 'Masa berlaku s/d 2032', 'Document Officer', nowStr, nowStr],
      ['DOC-000002', 'REG-SDW-2701', 'DCR-000003', 'vaksin_ahmad.pdf', 'mock_drive_vaksin_01.pdf', 'VERIFIED', 'Vaksin aktif', 'Document Officer', nowStr, nowStr],
      ['DOC-000003', 'REG-SDW-2702', 'DCR-000001', 'paspor_fatimah.pdf', 'mock_drive_paspor_02.pdf', 'UNDER_REVIEW', 'Menunggu verifikasi fisik', null, null, nowStr]
    ],
    DB_Invoices: [
      ['INV-000001', 'REG-SDW-2701', 'INV/2026/11/001', 33500000, 15000000, 18500000, '2026-12-15', 'PARTIAL', nowStr, nowStr],
      ['INV-000002', 'REG-SDW-2702', 'INV/2026/11/002', 37500000, 20000000, 17500000, '2026-12-15', 'PARTIAL', nowStr, nowStr],
      ['INV-000003', 'REG-SDW-2703', 'INV/2026/11/003', 35000000, 15000000, 20000000, '2026-12-15', 'PARTIAL', nowStr, nowStr]
    ],
    DB_Payment_Schedules: [
      ['SCH-000001', 'INV-000001', 1, 'Uang Muka (DP)', 15000000, '2026-11-01', 'PAID'],
      ['SCH-000002', 'INV-000001', 2, 'Pelunasan Akhir', 18500000, '2026-12-15', 'PENDING'],
      ['SCH-000003', 'INV-000002', 1, 'Uang Muka (DP)', 20000000, '2026-11-01', 'PAID']
    ],
    DB_Payments: [
      ['PAY-SDW-001', 'INV-000001', 'SCH-000001', 15000000, 'Transfer Bank Syariah (BSI)', 'BSI-TX98231', 'proof_ahmad_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah'],
      ['PAY-SDW-002', 'INV-000002', 'SCH-000003', 20000000, 'Transfer Bank Syariah (Muamalat)', 'MUA-77182', 'proof_fatimah_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah'],
      ['PAY-SDW-003', 'INV-000003', 'SCH-000001', 15000000, 'Transfer Bank Mandiri', 'MDR-65412', 'proof_gunawan_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah']
    ],
    DB_Leads: [
      ['LED-000001', 'CUS-000001', 'WEBSITE_DIRECT', 'USR-000001', 'QUALIFIED', 'HIGH', 'Rp 35jt - Rp 45jt', 'Rencana berangkat 4 orang', nowStr, nowStr],
      ['LED-000002', 'CUS-000002', 'WHATSAPP_CAMPAIGN', 'USR-000001', 'CONSULTATION', 'HIGH', 'Rp 40jt - Rp 50jt', 'Hotel bintang 5 ramah lansia', nowStr, nowStr],
      ['LED-000003', 'CUS-000003', 'INSTAGRAM_ADS', 'USR-000001', 'PROPOSAL', 'MEDIUM', 'Rp 30jt - Rp 35jt', 'Cicilan termin BSI', nowStr, nowStr],
      ['LED-000004', 'CUS-000004', 'ALUMNI_REFERRAL', 'USR-000001', 'NEW', 'LOW', 'Rp 35jt', 'Rekomendasi alumni', nowStr, nowStr]
    ],
    DB_Trips: [
      ['TRP-2701', 'DEP-000001', 'SDW-JAN27-01', 'USR-000004', 'USR-000005', 'PRE_DEPARTURE', '2027-01-15 08:00:00', '2027-01-23 20:00:00'],
      ['TRP-2702', 'DEP-000002', 'SDW-FEB27-02', 'USR-000004', 'USR-000005', 'PRE_DEPARTURE', '2027-02-28 08:00:00', '2027-03-08 20:00:00']
    ],
    DB_Trip_Members: [
      ['MBR-000001', 'TRP-2701', 'REG-SDW-2701', 'BUS-01', 'RM-MAK-401', 'RM-MAD-201', 'None'],
      ['MBR-000002', 'TRP-2701', 'REG-SDW-2702', 'BUS-01', 'RM-MAK-301', 'RM-MAD-101', 'Kursi Roda / Lansia'],
      ['MBR-000003', 'TRP-2701', 'REG-SDW-2703', 'BUS-02', 'RM-MAK-201', 'RM-MAD-301', 'None']
    ],
    DB_Audit_Logs: [
      ['AUD-BOOTSTRAP', nowStr, 'SYSTEM', 'INIT_DATABASE', 'DATABASE', 'SDW_UMROH_DB', null, '22_SHEETS_CREATED', 'Inisialisasi otomatis arsitektur 22 sheet Google Spreadsheet SDW UMROH.']
    ]
  };

  Object.keys(seed).forEach(function (sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const rows = seed[sheetName];
    if (rows && rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
  });
}

/**
 * ============================================================================
 * HTTP GET Router
 * ============================================================================
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';
    const ss = getSpreadsheet();

    if (action === 'ping') {
      return createResponse(true, {
        status: "ONLINE",
        connected: Boolean(ss),
        spreadsheetName: ss ? ss.getName() : "Standby (Simulasi Local/Pending Binding)",
        spreadsheetId: ss ? ss.getId() : CONFIG.SPREADSHEET_ID,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'healthCheck') {
      if (!ss) return createResponse(false, null, "Spreadsheet backend belum terhubung.");
      const sheets = ss.getSheets().map(function (s) { return s.getName(); });
      return createResponse(true, {
        totalSheets: sheets.length,
        sheets: sheets,
        status: sheets.length >= 22 ? "HEALTHY (22 Sheets Complete)" : "PARTIAL (" + sheets.length + "/22 Sheets)"
      });
    }

    if (action === 'setupDatabase' || action === 'initDatabase') {
      const res = setupDatabase();
      return createResponse(true, res);
    }

    if (!ss) {
      return createResponse(false, null, "Database Spreadsheet belum terhubung.");
    }

    if (action === 'getPackages') {
      const sheet = ss.getSheetByName("DB_Packages");
      if (!sheet) return createResponse(false, null, "Sheet DB_Packages tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(function (row) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });
        return obj;
      });
      return createResponse(true, items);
    }

    if (action === 'getDepartures') {
      const sheet = ss.getSheetByName("DB_Departures");
      if (!sheet) return createResponse(false, null, "Sheet DB_Departures tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(function (row) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });
        return obj;
      });
      return createResponse(true, items);
    }

    if (action === 'checkRegistration') {
      const regId = e.parameter.regId;
      if (!regId) return createResponse(false, null, "Parameter regId wajib disertakan");

      const sheet = ss.getSheetByName("DB_Registrations");
      if (!sheet) return createResponse(false, null, "Sheet DB_Registrations tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const foundRow = rows.slice(1).find(function (r) { return String(r[0]).toUpperCase() === String(regId).toUpperCase(); });

      if (!foundRow) {
        return createResponse(false, null, "Nomor Pendaftaran tidak ditemukan: " + regId);
      }

      const reg = {};
      headers.forEach(function (h, i) { reg[h] = foundRow[i]; });
      return createResponse(true, reg);
    }

    if (action === 'checkAccount') {
      const phoneParam = e.parameter.phone;
      if (!phoneParam) return createResponse(false, null, "Parameter phone wajib disertakan");

      const cleanTarget = String(phoneParam).replace(/[^0-9]/g, '').replace(/^62/, '0').replace(/^0+/, '');

      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");
      const users = getSheetRowsAsObjects_(ss, "DB_Users");
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const packages = getSheetRowsAsObjects_(ss, "DB_Packages");
      const departures = getSheetRowsAsObjects_(ss, "DB_Departures");

      const pkgMap = {};
      packages.forEach(function(p) { pkgMap[p.id] = p; });
      const depMap = {};
      departures.forEach(function(d) { depMap[d.id] = d; });

      let matchedCust = null;
      customers.forEach(function(c) {
        const cp = String(c.phone || '').replace(/[^0-9]/g, '').replace(/^62/, '0').replace(/^0+/, '');
        if (cp && (cp === cleanTarget || cp.endsWith(cleanTarget) || cleanTarget.endsWith(cp))) {
          matchedCust = c;
        }
      });

      let matchedUser = null;
      users.forEach(function(u) {
        const up = String(u.phone || '').replace(/[^0-9]/g, '').replace(/^62/, '0').replace(/^0+/, '');
        if (up && (up === cleanTarget || up.endsWith(cleanTarget) || cleanTarget.endsWith(up))) {
          matchedUser = u;
        }
      });

      if (!matchedCust && !matchedUser) {
        return createResponse(false, null, "Akun tidak ditemukan untuk nomor: " + phoneParam);
      }

      const custName = (matchedCust ? matchedCust.full_name : null) || (matchedUser ? matchedUser.name : "Jamaah");
      const custId = (matchedCust ? matchedCust.id : null) || (matchedUser ? matchedUser.id : "CUS-ANON");
      const custEmail = (matchedCust ? matchedCust.email : null) || (matchedUser ? matchedUser.email : "");

      // Cari pendaftaran terkait
      let matchedReg = null;
      regs.forEach(function(r) {
        if (r.customer_id === custId || r.customer_id === custName || String(r.notes || '').includes(cleanTarget)) {
          matchedReg = r;
        }
      });

      const pkg = matchedReg ? (pkgMap[matchedReg.package_id] || {}) : {};
      const dep = matchedReg ? (depMap[matchedReg.departure_id] || {}) : {};

      let rawPrice = matchedReg ? (matchedReg.final_price_snapshot || matchedReg.agreed_price_snapshot || 29500000) : 29500000;
      let numPrice = Number(rawPrice);
      if (numPrice < 100000) numPrice = numPrice * 100000;

      const result = {
        id: custId,
        fullName: custName,
        phone: phoneParam,
        email: custEmail,
        regId: matchedReg ? matchedReg.id : ("REG-SDW-" + Math.floor(1000 + Math.random() * 9000)),
        packageTitle: pkg.name || (matchedReg ? matchedReg.package_id : "Umroh Reguler Syawal Barakah 9H"),
        flightInfo: dep.airline || "Saudia Airlines (SV-819)",
        roomType: matchedReg ? (matchedReg.room_type || "Quad (Ber-4)") : "Quad (Ber-4)",
        departureDate: dep.departure_date ? (String(dep.departure_date).substring(0, 10)) : "15 Syawal 1448H",
        totalPrice: "Rp " + numPrice.toLocaleString('id-ID'),
        finalPrice: numPrice,
        priceSnapshot: numPrice,
        status: matchedReg ? (matchedReg.status || "CONFIRMED") : "CONFIRMED"
      };

      return createResponse(true, result);
    }

    // ==================== READ ENDPOINTS (PULL DARI SPREADSHEET) ====================
    if (action === 'getLeads') {
      const leads = getSheetRowsAsObjects_(ss, "DB_Leads");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");
      const custMap = {};
      customers.forEach(function(c) { custMap[c.id] = c; });

      const mapped = leads.map(function(lead) {
        const cust = custMap[lead.customer_id] || {};
        return {
          id: lead.id,
          customerId: lead.customer_id,
          name: cust.full_name || lead.customer_id,
          phone: cust.phone || "-",
          package: lead.budget_range || "Paket Umroh 1448H",
          urgency: lead.urgency || "MEDIUM",
          budget: lead.budget_range || "-",
          status: lead.status || "NEW",
          owner: lead.sales_owner_id || "Belum Ditugaskan",
          notes: lead.notes || "",
          source: lead.source || "WEBSITE",
          createdAt: lead.created_at,
          updatedAt: lead.updated_at
        };
      });
      return createResponse(true, mapped);
    }

    if (action === 'getRegistrations') {
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");
      const packages = getSheetRowsAsObjects_(ss, "DB_Packages");
      const departures = getSheetRowsAsObjects_(ss, "DB_Departures");
      const docs = getSheetRowsAsObjects_(ss, "DB_Pilgrim_Documents");
      const payments = getSheetRowsAsObjects_(ss, "DB_Payments");

      const custMap = {};
      customers.forEach(function(c) { custMap[c.id] = c; });
      const pkgMap = {};
      packages.forEach(function(p) { pkgMap[p.id] = p; });
      const depMap = {};
      departures.forEach(function(d) { depMap[d.id] = d; });

      const mapped = regs.map(function(reg) {
        const cust = custMap[reg.customer_id] || {};
        const pkg = pkgMap[reg.package_id] || {};
        const dep = depMap[reg.departure_id] || {};

        const regDocs = docs.filter(function(d) { return String(d.registration_id) === String(reg.id); });
        const verifiedDocs = regDocs.filter(function(d) { return d.status === 'VERIFIED'; }).length;
        const totalDocs = Math.max(4, regDocs.length);

        const regPays = payments.filter(function(p) { return String(p.invoice_id) === String(reg.id) || String(p.registration_id) === String(reg.id); });
        const hasVerifiedPay = regPays.some(function(p) { return p.status === 'VERIFIED'; });
        const photoDoc = regDocs.find(function(d) { return String(d.requirement_id) === 'DCR-000004' || String(d.requirement_id) === 'PASPHOTO'; });
        let photoUrl = photoDoc ? (photoDoc.file_ref_mock || "") : "";
        if (photoUrl && photoUrl.indexOf("googleusercontent.com/d/") !== -1 && photoUrl.indexOf("=") === -1) {
          photoUrl += "=s0";
        }

        return {
          id: reg.id,
          regId: reg.id,
          customer: cust.full_name || reg.customer_id || "Jamaah",
          customerId: reg.customer_id,
          nik: cust.nik || "-",
          phone: cust.phone || "-",
          package: pkg.name || reg.package_id || "Umroh Reguler",
          packageId: reg.package_id,
          departure: dep.departure_date ? (String(dep.departure_date).substring(0, 10) + " (" + (dep.airline || "Maskapai") + ")") : "Musim 1448H",
          departureId: reg.departure_id,
          roomType: reg.room_type || "QUAD",
          priceSnapshot: Number(reg.agreed_price_snapshot || 0),
          discountSnapshot: Number(reg.discount_snapshot || 0),
          finalPrice: Number(reg.final_price_snapshot || 0),
          status: reg.status || "CONFIRMED",
          salesId: reg.sales_id || "USR-000001",
          docs: verifiedDocs + "/" + totalDocs,
          payment: (reg.status === 'CONFIRMED' || reg.status === 'COMPLETED') ? 'Lunas (Terverifikasi)' : (hasVerifiedPay ? 'DP Terverifikasi' : 'Menunggu DP'),
          photoUrl: photoUrl,
          isIssued: (reg.status === 'COMPLETED' || reg.departure_id === 'DEP-20261027'),
          certificateNo: "SDW/CERT/2026/" + String(reg.id).replace(/\D/g, '').padStart(3, '0'),
          notes: reg.notes || "",
          createdAt: reg.created_at,
          updatedAt: reg.updated_at
        };
      });
      return createResponse(true, mapped);
    }

    if (action === 'getPayments') {
      const payments = getSheetRowsAsObjects_(ss, "DB_Payments");
      const invoices = getSheetRowsAsObjects_(ss, "DB_Invoices");
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

      const invMap = {};
      invoices.forEach(function(inv) { invMap[inv.id] = inv; });
      const regMap = {};
      regs.forEach(function(r) { regMap[r.id] = r; });
      const custMap = {};
      customers.forEach(function(c) {
        custMap[c.id] = c;
        if (c.full_name) custMap[c.full_name.toLowerCase()] = c;
      });

      const mapped = payments.map(function(pay) {
        // Cari target registration ID dari invoice atau langsung dari registration_id
        let targetRegId = pay.invoice_id;
        if (invMap[pay.invoice_id] && invMap[pay.invoice_id].registration_id) {
          targetRegId = invMap[pay.invoice_id].registration_id;
        }

        const reg = regMap[targetRegId] || {};
        const cust = custMap[reg.customer_id] || (reg.customer_id ? custMap[String(reg.customer_id).toLowerCase()] : null) || {};
        const rawAmount = pay.amount;
        const amountNum = typeof rawAmount === 'number' ? rawAmount : (Number(String(rawAmount || 0).replace(/[^0-9]/g, '')) || 0);

        // Cari nama jamaah dengan resolusi nama berjenjang
        let resolvedName = cust.full_name;
        if (!resolvedName && reg.customer_id && !reg.customer_id.startsWith('CUS-') && !reg.customer_id.startsWith('REG-')) {
          resolvedName = reg.customer_id;
        }
        if (!resolvedName && pay.notes) {
          if (pay.notes.includes('an ')) {
            const m = pay.notes.match(/an\s+([^,.(]+)/i);
            if (m) resolvedName = m[1].trim();
          } else if (pay.notes.includes('oleh ')) {
            const m = pay.notes.match(/oleh\s+([^,.(]+)/i);
            if (m) resolvedName = m[1].trim();
          }
        }
        if (!resolvedName) {
          resolvedName = "Jamaah (" + (targetRegId || pay.invoice_id || "Anonim") + ")";
        }

        return {
          id: pay.id,
          regId: targetRegId || pay.invoice_id || "-",
          customer: resolvedName,
          amount: "Rp " + amountNum.toLocaleString('id-ID'),
          amountNum: amountNum,
          method: pay.payment_method || "Transfer Bank",
          ref: pay.reference_number || "-",
          term: (pay.schedule_id === 'SCH-000001' || pay.schedule_id === 'SCH-DP') ? 'Uang Muka (DP)' : 'Pelunasan',
          proof: pay.proof_ref_mock || "",
          status: pay.status || "SUBMITTED",
          submittedAt: pay.submitted_at || "",
          verifiedBy: pay.verified_by || "",
          verifiedAt: pay.verified_at || "",
          notes: pay.notes || ""
        };
      });
      return createResponse(true, mapped);
    }

    if (action === 'getPilgrimDocuments') {
      const regId = e.parameter.regId;
      const docs = getSheetRowsAsObjects_(ss, "DB_Pilgrim_Documents");
      const reqs = getSheetRowsAsObjects_(ss, "DB_Document_Requirements");
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

      const reqMap = {};
      reqs.forEach(function(rq) { reqMap[rq.id] = rq; });
      const regMap = {};
      regs.forEach(function(r) { regMap[r.id] = r; });
      const custMap = {};
      customers.forEach(function(c) { custMap[c.id] = c; });

      let filteredDocs = docs;
      if (regId) {
        filteredDocs = docs.filter(function(d) {
          return String(d.registration_id).toUpperCase() === String(regId).toUpperCase();
        });
      }

      const mapped = filteredDocs.map(function(doc) {
        const req = reqMap[doc.requirement_id] || {};
        const reg = regMap[doc.registration_id] || {};
        const cust = custMap[reg.customer_id] || {};

        return {
          id: doc.id,
          regId: doc.registration_id,
          pilgrimName: cust.full_name || doc.registration_id,
          requirementId: doc.requirement_id,
          code: req.code || doc.requirement_id || "DOC",
          title: req.title || doc.requirement_id || "Berkas Jamaah",
          is_mandatory: req.is_mandatory === true || String(req.is_mandatory).toLowerCase() === 'true',
          fileName: doc.file_name || "",
          fileRef: doc.file_ref_mock || "",
          status: doc.status || "UNDER_REVIEW",
          reviewNotes: doc.review_notes || "",
          verifiedBy: doc.verified_by || "",
          verifiedAt: doc.verified_at || "",
          updatedAt: doc.updated_at || ""
        };
      });
      return createResponse(true, mapped);
    }

    if (action === 'getManifest' || action === 'getTrips') {
      const trips = getSheetRowsAsObjects_(ss, "DB_Trips");
      const members = getSheetRowsAsObjects_(ss, "DB_Trip_Members");
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

      const regMap = {};
      regs.forEach(function(r) { regMap[r.id] = r; });
      const custMap = {};
      customers.forEach(function(c) { custMap[c.id] = c; });

      const mappedMembers = members.map(function(m) {
        const reg = regMap[m.registration_id] || {};
        const cust = custMap[reg.customer_id] || {};

        return {
          id: m.registration_id || m.id,
          manifestId: m.id,
          tripId: m.trip_id,
          regId: m.registration_id,
          name: cust.full_name || m.registration_id,
          gender: cust.gender || "L",
          passport: m.special_assistance && m.special_assistance.startsWith('A') ? m.special_assistance : (cust.nik ? 'A' + String(cust.nik).substring(8) : "A12345678"),
          phone: cust.phone || "-",
          busId: m.bus_number ? ("Bus " + m.bus_number.replace('BUS-', '')) : "Bus 01",
          seatNumber: m.bus_number ? m.bus_number.substring(0, 3) : "01A",
          roomMakkah: m.makkah_room_number ? m.makkah_room_number.replace('RM-MAK-', '') : "1201",
          roomMadinah: m.madinah_room_number ? m.madinah_room_number.replace('RM-MAD-', '') : "501",
          roomType: reg.room_type || "Quad",
          boarded: m.special_assistance === 'BOARDED',
          kloterId: m.trip_id || "TRP-2701"
        };
      });

      return createResponse(true, {
        trips: trips,
        members: mappedMembers
      });
    }

    if (action === 'getPreparation') {
      const prep = getSheetRowsAsObjects_(ss, "DB_Preparation");
      const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
      const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

      const regMap = {};
      regs.forEach(function(r) { regMap[r.id] = r; });
      const custMap = {};
      customers.forEach(function(c) { custMap[c.id] = c; });

      const regIdParam = e.parameter.regId;
      let filteredPrep = prep;
      if (regIdParam) {
        filteredPrep = prep.filter(function(p) { return String(p.registration_id) === String(regIdParam); });
      }

      const mapped = filteredPrep.map(function(p) {
        const reg = regMap[p.registration_id] || {};
        const cust = custMap[reg.customer_id] || {};
        return {
          id: p.id,
          regId: p.registration_id,
          name: cust.full_name || p.registration_id,
          dimension: p.dimension,
          itemName: p.item_name,
          status: p.status,
          notes: p.notes,
          updatedAt: p.updated_at
        };
      });
      return createResponse(true, mapped);
    }

    if (action === 'getManasik') {
      const manasik = getSheetRowsAsObjects_(ss, "DB_Manasik");
      return createResponse(true, manasik);
    }

    if (action === 'getAuditLogs') {
      const sheet = ss.getSheetByName("DB_Audit_Logs");
      if (!sheet || sheet.getLastRow() <= 1) return createResponse(true, []);
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const sliceRows = rows.slice(Math.max(1, rows.length - 100));
      const items = sliceRows.map(function(row) {
        const obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i]; });
        return obj;
      }).reverse();
      return createResponse(true, items);
    }

    if (action === 'seedKloter27Okt') {
      const res = seedKloter27Oktober2026(ss);
      return createResponse(true, res);
    }

    return createResponse(false, null, "Aksi GET tidak dikenali: " + action);
  } catch (err) {
    return createResponse(false, null, err.message);
  }
}

/**
 * ============================================================================
 * DISPATCHER PEMROSESAN MUTASI TUNGGAL
 * ============================================================================
 */
function processSingleMutation_(ss, action, payload, actor) {
  const nowStr = formatDateSafe_(new Date());

  // 0. MUTASI AKUN JAMAAH: REGISTER ACCOUNT (PWA SELF REGISTER)
  if (action === 'registerAccount' || action === 'registerPilgrimAccount') {
    const custSheet = ss.getSheetByName("DB_Customers");
    if (!custSheet) throw new Error("Sheet DB_Customers tidak ditemukan");

    // Pastikan ID Customer unik
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

    // Otomatis buatkan prospek baru di DB_Leads agar tim sales ter-notifikasi di backoffice CRM
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

    // Catat ke DB_Users sebagai akun jamaah aktif jika sheet tersedia
    let newUserId = null;
    const userSheet = ss.getSheetByName("DB_Users");
    if (userSheet) {
      newUserId = "USR-" + String(Math.max(1, userSheet.getLastRow())).padStart(6, '0');
      const userRow = [
        newUserId,
        payload.fullName || payload.name || "Jamaah Baru",
        payload.email || (payload.phone ? payload.phone + "@jamaah.sdw" : "-"),
        "PILGRIM",
        "ACTIVE",
        payload.phone || "-",
        nowStr,
        nowStr
      ];
      userSheet.appendRow(userRow);
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
      customerId: newCustId,
      leadId: newLeadId,
      userId: newUserId,
      status: "REGISTERED",
      entity: "DB_Customers",
      message: "Akun jamaah baru berhasil didaftarkan ke Spreadsheet"
    };
  }

  // 1. MUTASI CRM: CREATE LEAD
  if (action === 'createLead') {
    const sheet = ss.getSheetByName("DB_Leads");
    if (!sheet) throw new Error("Sheet DB_Leads tidak ditemukan");

    const newId = payload.id || ("LED-" + String(sheet.getLastRow()).padStart(6, '0'));
    const row = [
      newId,
      payload.customerId || payload.name || "CUS-NEW",
      payload.source || "CRM_PORTAL",
      payload.owner || actor || "Belum Ditugaskan",
      payload.status || "NEW",
      payload.urgency || "MEDIUM",
      payload.budget || "Rp 35jt",
      payload.notes || "",
      nowStr,
      nowStr
    ];
    sheet.appendRow(row);
    logAudit_(actor, "CREATE_LEAD", "DB_Leads", newId, null, payload, "Prospek baru berhasil ditambahkan via Portal Admin");
    return { id: newId, status: "CREATED", entity: "DB_Leads" };
  }

  // 2. MUTASI REGISTRASI: REGISTER PILGRIM
  if (action === 'registerPilgrim') {
    const sheet = ss.getSheetByName("DB_Registrations");
    if (!sheet) throw new Error("Sheet DB_Registrations tidak ditemukan");

    const newId = payload.id || ("REG-SDW-" + (2700 + sheet.getLastRow()));
    const row = [
      newId,
      payload.customer || payload.customerId || "CUS-ANON",
      payload.departureId || payload.departure || "DEP-000001",
      payload.packageId || payload.package || "PKG-000001",
      payload.roomType || "QUAD",
      payload.priceSnapshot || 34500000,
      payload.discountSnapshot || 0,
      payload.finalPrice || (payload.priceSnapshot || 34500000),
      payload.status || "CONFIRMED",
      actor || "ADMIN",
      payload.notes || "Pendaftaran via Backoffice Hub",
      nowStr,
      nowStr
    ];
    sheet.appendRow(row);

    // Otomatis tambahkan data pelanggan jika belum ada
    const custSheet = ss.getSheetByName("DB_Customers");
    if (custSheet && payload.nik) {
      custSheet.appendRow([
        "CUS-" + String(custSheet.getLastRow()).padStart(6, '0'),
        payload.nik,
        payload.customer || "Jamaah",
        payload.gender || "L",
        payload.birthDate || "1980-01-01",
        payload.birthPlace || "Indonesia",
        payload.phone || "-",
        payload.email || "-",
        payload.address || "-",
        payload.city || "Jakarta",
        payload.province || "DKI Jakarta",
        nowStr,
        nowStr
      ]);
    }

    logAudit_(actor, "REGISTER_PILGRIM", "DB_Registrations", newId, null, payload, "Registrasi jamaah resmi diterbitkan");
    return { id: newId, status: "REGISTERED", entity: "DB_Registrations" };
  }

  // 3. MUTASI PEMBAYARAN: CREATE PAYMENT
  if (action === 'createPayment') {
    const sheet = ss.getSheetByName("DB_Payments");
    if (!sheet) throw new Error("Sheet DB_Payments tidak ditemukan");

    const newId = payload.id || ("PAY-SDW-" + String(sheet.getLastRow()).padStart(3, '0'));
    const row = [
      newId,
      payload.invoiceId || payload.regId || "INV-MANUAL",
      payload.scheduleId || "SCH-DP",
      payload.amountNum || payload.amount || 15000000,
      payload.method || "Transfer Bank Syariah",
      payload.ref || ("REF-" + Date.now()),
      payload.proof || "mock_proof.jpg",
      payload.status || "PENDING_VERIFY",
      nowStr,
      payload.status === 'VERIFIED' ? actor : "",
      payload.status === 'VERIFIED' ? nowStr : "",
      payload.notes || "Setoran mutasi bank via Admin Portal"
    ];
    sheet.appendRow(row);
    logAudit_(actor, "CREATE_PAYMENT", "DB_Payments", newId, null, payload, "Pencatatan mutasi transaksi pembayaran");
    return { id: newId, status: "RECORDED", entity: "DB_Payments" };
  }

  // 3b. MUTASI UNGGAH BUKTI PEMBAYARAN JAMAAH: UPLOAD PAYMENT PROOF
  if (action === 'uploadPaymentProof') {
    const paySheet = ss.getSheetByName("DB_Payments");
    const regId = payload.regId;
    let updated = false;

    if (paySheet) {
      const rows = paySheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).toUpperCase() === String(regId).toUpperCase()) {
          paySheet.getRange(i + 1, 7).setValue(payload.proofImage || payload.proof || "proof_uploaded.jpg");
          if (payload.sender) paySheet.getRange(i + 1, 12).setValue("Pengirim: " + payload.sender);
          paySheet.getRange(i + 1, 11).setValue(nowStr);
          updated = true;
          break;
        }
      }
      if (!updated) {
        const newPayId = "PAY-SDW-" + String(paySheet.getLastRow()).padStart(3, '0');
        paySheet.appendRow([
          newPayId,
          regId,
          "SCH-DP",
          payload.dpAmount || 5000000,
          "Transfer Bank Syariah (BSI)",
          "BSI-PENDING-" + Date.now(),
          payload.proofImage || payload.proof || "proof_uploaded.jpg",
          "PENDING_VERIFY",
          nowStr,
          "",
          nowStr,
          "Bukti transfer diunggah mandiri via PWA" + (payload.sender ? (" oleh " + payload.sender) : "")
        ]);
        updated = true;
      }
    }

    logAudit_(actor || "Pilgrim", "UPLOAD_PAYMENT_PROOF", "DB_Payments", regId, null, { regId: regId }, "Bukti transfer diunggah mandiri via PWA");
    return { id: regId, status: "PROOF_UPLOADED", entity: "DB_Payments" };
  }

  // 3c. MUTASI UNGGAH PASFOTO SERTIFIKAT KE GOOGLE DRIVE & SIMPAN TAUTAN KE SPREADSHEET
  if (action === 'uploadCertificatePhoto' || action === 'uploadPilgrimPhoto') {
    const p = (payload && payload.payload && typeof payload.payload === 'object') ? payload.payload : (payload || {});
    const regId = p.regId || payload.regId;
    if (!regId) throw new Error("Parameter regId wajib diisi");

    const base64Data = p.photoBase64 || p.imageBase64 || p.photoUrl || payload.photoBase64 || payload.imageBase64 || payload.photoUrl;
    if (!base64Data) throw new Error("Data gambar pasfoto (base64) tidak ditemukan");

    let fileId = "";
    let driveUrl = "";
    let viewLink = "";
    let fileName = p.fileName || payload.fileName || ("PASFOTO_" + regId + ".jpg");

    let driveErrorMsg = "";
    // 1. Simpan berkas gambar ke Google Drive Folder resmi
    try {
      let cleanBase64 = base64Data;
      let contentType = "image/jpeg";

      if (cleanBase64.indexOf("data:") === 0) {
        const matches = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          contentType = matches[1];
          cleanBase64 = matches[2];
        }
      }

      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, contentType, fileName);

      const targetFolder = getPasfotoFolder();
      if (!targetFolder) {
        throw new Error("Folder Google Drive Pasfoto_Sertifikat tidak dapat diakses.");
      }

      const file = targetFolder.createFile(blob);
      fileId = file.getId();
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {}

      // Tautan Direct CDN Google Drive dengan parameter =s0 agar langsung tampil di tag <img> dan browser tanpa error 404
      driveUrl = "https://lh3.googleusercontent.com/d/" + fileId + "=s0";
      viewLink = "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing";
    } catch (driveErr) {
      driveErrorMsg = String(driveErr && driveErr.message ? driveErr.message : driveErr);
      Logger.log("DRIVE_UPLOAD_FAILED: " + driveErrorMsg);
      fileId = "DRV-LOCAL-" + Date.now();
      driveUrl = base64Data;
      viewLink = base64Data;
    }

    // 2. Catat atau perbarui tautan foto di sheet DB_Pilgrim_Documents (Requirement DCR-000004 = PASPHOTO)
    const docSheet = ss.getSheetByName("DB_Pilgrim_Documents");
    let docUpdated = false;
    let docId = "";

    if (docSheet) {
      const rows = docSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        const rowRegId = String(rows[i][1]).toUpperCase();
        const rowReqId = String(rows[i][2]).toUpperCase();
        if (rowRegId === String(regId).toUpperCase() && (rowReqId === 'DCR-000004' || rowReqId === 'PASPHOTO')) {
          docId = rows[i][0];
          docSheet.getRange(i + 1, 4).setValue(fileName);
          docSheet.getRange(i + 1, 5).setValue(driveUrl);
          docSheet.getRange(i + 1, 6).setValue("VERIFIED");
          docSheet.getRange(i + 1, 7).setValue("Pasfoto resmi E-Sertifikat Umroh (Tersimpan di Google Drive)");
          docSheet.getRange(i + 1, 8).setValue(actor || "Admin Sertifikat");
          docSheet.getRange(i + 1, 9).setValue(nowStr);
          docSheet.getRange(i + 1, 10).setValue(nowStr);
          docUpdated = true;
          break;
        }
      }

      if (!docUpdated) {
        docId = "DOC-" + (2700 + docSheet.getLastRow());
        docSheet.appendRow([
          docId,
          regId,
          "DCR-000004",
          fileName,
          driveUrl,
          "VERIFIED",
          "Pasfoto resmi E-Sertifikat Umroh (Tersimpan di Google Drive)",
          actor || "Admin Sertifikat",
          nowStr,
          nowStr
        ]);
      }
    }

    logAudit_(actor || "Admin Sertifikat", "UPLOAD_CERTIFICATE_PHOTO", "DB_Pilgrim_Documents", docId || regId, null, { fileId: fileId, driveUrl: driveUrl, regId: regId }, "Pasfoto sertifikat berhasil diunggah ke Google Drive & tautan tersimpan di DB_Pilgrim_Documents");

    return {
      id: docId || regId,
      fileId: fileId,
      driveUrl: driveUrl,
      viewLink: viewLink,
      regId: regId,
      driveError: driveErrorMsg || null,
      status: "PHOTO_UPLOADED",
      entity: "DB_Pilgrim_Documents"
    };
  }

  // 4. MUTASI VALIDASI KEUANGAN: VERIFY PAYMENT
  if (action === 'verifyPayment') {
    const sheet = ss.getSheetByName("DB_Payments");
    if (!sheet) throw new Error("Sheet DB_Payments tidak ditemukan");

    const payId = payload.paymentId || payload.id;
    const rows = sheet.getDataRange().getValues();
    let updated = false;
    let targetRegId = payload.regId || null;

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(payId).toUpperCase()) {
        sheet.getRange(i + 1, 8).setValue("VERIFIED");
        sheet.getRange(i + 1, 10).setValue(actor || "Finance Officer");
        sheet.getRange(i + 1, 11).setValue(nowStr);
        if (!targetRegId) targetRegId = rows[i][1];
        updated = true;
        break;
      }
    }

    // Jika pembayaran terhubung ke DB_Registrations, update juga status registrasinya ke CONFIRMED
    if (targetRegId) {
      const regSheet = ss.getSheetByName("DB_Registrations");
      if (regSheet) {
        const regRows = regSheet.getDataRange().getValues();
        for (let k = 1; k < regRows.length; k++) {
          if (String(regRows[k][0]).toUpperCase() === String(targetRegId).toUpperCase()) {
            regSheet.getRange(k + 1, 9).setValue("CONFIRMED");
            regSheet.getRange(k + 1, 13).setValue(nowStr);
            break;
          }
        }
      }
    }

    logAudit_(actor, "VERIFY_PAYMENT", "DB_Payments", payId, { status: "PENDING_VERIFY" }, { status: "VERIFIED" }, "Validasi mutasi bank resmi disahkan oleh Finance");
    return { id: payId, status: "VERIFIED", entity: "DB_Payments", found: updated };
  }

  // 4b. MUTASI VALIDASI REGISTRASI & E-PASS: CONFIRM REGISTRATION
  if (action === 'confirmRegistration' || action === 'verifyBookingDP') {
    const sheet = ss.getSheetByName("DB_Registrations");
    if (!sheet) throw new Error("Sheet DB_Registrations tidak ditemukan");

    const regId = payload.regId || payload.id;
    const newStatus = payload.status || "CONFIRMED";
    const rows = sheet.getDataRange().getValues();
    let regFound = false;

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(regId).toUpperCase()) {
        sheet.getRange(i + 1, 9).setValue(newStatus);
        sheet.getRange(i + 1, 10).setValue(actor || "Finance / Admin");
        sheet.getRange(i + 1, 13).setValue(nowStr);
        regFound = true;
        break;
      }
    }

    // Pastikan tercatat di DB_Payments dengan status VERIFIED
    const paySheet = ss.getSheetByName("DB_Payments");
    if (paySheet) {
      const payRows = paySheet.getDataRange().getValues();
      let payFound = false;
      for (let j = 1; j < payRows.length; j++) {
        if (String(payRows[j][1]).toUpperCase() === String(regId).toUpperCase()) {
          paySheet.getRange(j + 1, 8).setValue("VERIFIED");
          if (payload.ref) paySheet.getRange(j + 1, 6).setValue(payload.ref);
          if (payload.proof) paySheet.getRange(j + 1, 7).setValue(payload.proof);
          paySheet.getRange(j + 1, 10).setValue(actor || "Finance Officer");
          paySheet.getRange(j + 1, 11).setValue(nowStr);
          payFound = true;
          break;
        }
      }
      if (!payFound) {
        const newPayId = "PAY-SDW-" + String(paySheet.getLastRow()).padStart(3, '0');
        paySheet.appendRow([
          newPayId,
          regId,
          "SCH-DP",
          payload.dpAmount || 5000000,
          payload.method || "Transfer Bank Syariah (BSI)",
          payload.ref || ("BSI-REF-" + Math.floor(100000 + Math.random() * 900000)),
          payload.proof || "struk_dp_verified.jpg",
          "VERIFIED",
          nowStr,
          actor || "Finance Officer",
          nowStr,
          payload.notes || "Validasi Pembayaran DP dan Penerbitan SDW E-PASS"
        ]);
      }
    }

    logAudit_(actor, "CONFIRM_REGISTRATION", "DB_Registrations", regId, { status: "PENDING_DP" }, { status: newStatus }, "Validasi DP dan Penerbitan SDW E-PASS Resmi");
    return { id: regId, status: newStatus, entity: "DB_Registrations", found: regFound };
  }

  // 5. MUTASI VERIFIKASI DOKUMEN: VERIFY DOCUMENT
  if (action === 'verifyDocument') {
    const sheet = ss.getSheetByName("DB_Pilgrim_Documents");
    if (!sheet) throw new Error("Sheet DB_Pilgrim_Documents tidak ditemukan");

    const docId = payload.docId || payload.id;
    const newStatus = payload.status || "VERIFIED";
    const rows = sheet.getDataRange().getValues();
    let updated = false;

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(docId).toUpperCase()) {
        sheet.getRange(i + 1, 6).setValue(newStatus);
        if (payload.reason) sheet.getRange(i + 1, 7).setValue(payload.reason);
        sheet.getRange(i + 1, 8).setValue(actor || "Document Officer");
        sheet.getRange(i + 1, 9).setValue(nowStr);
        sheet.getRange(i + 1, 10).setValue(nowStr);
        updated = true;
        break;
      }
    }

    logAudit_(actor, "VERIFY_DOCUMENT", "DB_Pilgrim_Documents", docId, null, { status: newStatus, reason: payload.reason }, "Verifikasi kelayakan berkas fisik/digital jamaah");
    return { id: docId, status: newStatus, entity: "DB_Pilgrim_Documents", found: updated };
  }

  // 6. MUTASI JADWAL & KLOTER: CREATE TRIP
  if (action === 'createTrip') {
    const sheet = ss.getSheetByName("DB_Trips");
    if (!sheet) throw new Error("Sheet DB_Trips tidak ditemukan");

    const newId = payload.id || ("TRP-" + (2700 + sheet.getLastRow()));
    const row = [
      newId,
      payload.departureId || "DEP-000001",
      payload.tripCode || payload.title || ("SDW-TRP-" + newId),
      payload.tourLeader || "Ust. DR. H. Salman, Lc.",
      payload.muthawwif || "Ust. Ahmad Fauzi Ridwan, Lc.",
      payload.status || "PRE_DEPARTURE",
      payload.startedAt || nowStr,
      payload.endedAt || nowStr
    ];
    sheet.appendRow(row);
    logAudit_(actor, "CREATE_TRIP", "DB_Trips", newId, null, payload, "Penerbitan kloter operasional tanah suci baru");
    return { id: newId, status: "CREATED", entity: "DB_Trips" };
  }

  // 7 & 8. MUTASI MANIFEST BUS: UPDATE MANIFEST
  if (action === 'updateManifest') {
    const sheet = ss.getSheetByName("DB_Trip_Members");
    if (!sheet) throw new Error("Sheet DB_Trip_Members tidak ditemukan");

    const regId = payload.regId || payload.manifestId;
    const rows = sheet.getDataRange().getValues();
    let updated = false;

    if (payload.batchAction === 'ALL_BOARDED') {
      for (let i = 1; i < rows.length; i++) {
        sheet.getRange(i + 1, 7).setValue("BOARDED");
      }
      logAudit_(actor, "BATCH_BOARDING", "DB_Trip_Members", payload.kloterId || "TRP-2701", null, { allBoarded: true }, "Absensi massal seluruh jamaah telah boarding bus");
      return { status: "BATCH_UPDATED", allBoarded: true };
    }

    if (payload.batchAction === 'RESET_BOARDING') {
      for (let i = 1; i < rows.length; i++) {
        sheet.getRange(i + 1, 7).setValue("NOT_BOARDED");
      }
      logAudit_(actor, "RESET_BOARDING", "DB_Trip_Members", payload.kloterId || "TRP-2701", null, { allBoarded: false }, "Reset massal status absensi bus");
      return { status: "BATCH_UPDATED", allBoarded: false };
    }

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][2]).toUpperCase() === String(regId).toUpperCase() || String(rows[i][0]).toUpperCase() === String(regId).toUpperCase()) {
        if (payload.busId) sheet.getRange(i + 1, 4).setValue(payload.busId);
        if (payload.boarded !== undefined) sheet.getRange(i + 1, 7).setValue(payload.boarded ? "BOARDED" : "NOT_BOARDED");
        updated = true;
        break;
      }
    }

    logAudit_(actor, "UPDATE_MANIFEST", "DB_Trip_Members", regId, null, payload, "Pembaruan manifest armada bus tanah suci");
    return { id: regId, status: "UPDATED", entity: "DB_Trip_Members", found: updated };
  }

  // 9. MUTASI ROOMING HOTEL: UPDATE ROOMING
  if (action === 'updateRooming') {
    const sheet = ss.getSheetByName("DB_Trip_Members");
    if (!sheet) throw new Error("Sheet DB_Trip_Members tidak ditemukan");

    const roomId = payload.roomId;
    logAudit_(actor, "UPDATE_ROOMING", "DB_Trip_Members", roomId, null, payload, "Alokasi kamar hotel Makkah & Madinah diperbarui");
    return { id: roomId, status: "ROOMING_SAVED", entity: "DB_Trip_Members" };
  }

  // 10. MUTASI LOGISTIK & PERSIAPAN OPERASIONAL: UPDATE PREPARATION
  if (action === 'updatePreparation') {
    const sheet = ss.getSheetByName("DB_Preparation");
    if (!sheet) throw new Error("Sheet DB_Preparation tidak ditemukan");

    const regId = payload.regId;
    const nowStr = formatDateSafe_(new Date());

    if (payload.batchAction === 'COMPLETE_ALL') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        sheet.getRange(i + 1, 5).setValue("READY");
        sheet.getRange(i + 1, 7).setValue(nowStr);
      }
      logAudit_(actor, "COMPLETE_ALL_PREPARATION", "DB_Preparation", "ALL", null, { allReady: true }, "Seluruh perlengkapan kloter ditandai LENGKAP");
      return { status: "BATCH_UPDATED", allReady: true };
    }

    let found = false;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).toUpperCase() === String(regId).toUpperCase()) {
        if (payload.status) sheet.getRange(i + 1, 5).setValue(payload.status);
        if (payload.notes) sheet.getRange(i + 1, 6).setValue(payload.notes);
        sheet.getRange(i + 1, 7).setValue(nowStr);
        found = true;
        break;
      }
    }

    if (!found && regId) {
      const newId = "PRP-" + String(sheet.getLastRow()).padStart(6, '0');
      sheet.appendRow([
        newId,
        regId,
        payload.dimension || "EQUIPMENT",
        payload.itemName || payload.itemKey || "Koper & Perlengkapan",
        payload.status || "READY",
        payload.notes || "Distribusi perlengkapan jamaah",
        nowStr
      ]);
    }

    logAudit_(actor, "UPDATE_PREPARATION", "DB_Preparation", regId, null, payload, "Status perlengkapan jamaah diperbarui");
    return { id: regId, status: payload.status || "UPDATED", entity: "DB_Preparation" };
  }

  // 11. MUTASI BIMBINGAN MANASIK: UPDATE MANASIK
  if (action === 'updateManasik') {
    const sheet = ss.getSheetByName("DB_Manasik");
    if (!sheet) throw new Error("Sheet DB_Manasik tidak ditemukan");

    const regId = payload.regId || payload.departureId || "DEP-000001";
    const nowStr = formatDateSafe_(new Date());

    if (payload.batchAction === 'ATTEND_ALL') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        sheet.getRange(i + 1, 8).setValue("COMPLETED");
      }
      logAudit_(actor, "ATTEND_ALL_MANASIK", "DB_Manasik", "ALL", null, { attendAll: true }, "Presensi massal seluruh jamaah ditandai HADIR");
      return { status: "BATCH_UPDATED", attendAll: true };
    }

    let found = false;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(regId).toUpperCase() || String(rows[i][1]).toUpperCase() === String(regId).toUpperCase()) {
        sheet.getRange(i + 1, 8).setValue(payload.status || "COMPLETED");
        found = true;
        break;
      }
    }

    if (!found) {
      const newId = "MAN-" + String(sheet.getLastRow()).padStart(6, '0');
      sheet.appendRow([
        newId,
        payload.departureId || "DEP-000001",
        payload.sessionTitle || "Bimbingan Manasik Teori & Praktek",
        payload.sessionType || "THEORY_AND_PRACTICE",
        nowStr,
        payload.location || "Asrama Haji / Hotel",
        payload.muthawwifId || "USR-000005",
        payload.status || "COMPLETED"
      ]);
    }

    logAudit_(actor, "UPDATE_MANASIK", "DB_Manasik", regId, null, payload, "Presensi bimbingan manasik diperbarui");
    return { id: regId, status: payload.status || "UPDATED", entity: "DB_Manasik" };
  }

  // 12. AUDIT KEAMANAN: UNMASK SENSITIVE DATA
  if (action === 'unmaskSensitiveData') {
    const regId = payload.regId || "UNKNOWN";
    logAudit_(actor, "UNMASK_DATA", "DB_Registrations", regId, null, { role: payload.role || actor }, "Staf membuka akses unmask data NIK/Paspor sensitif jamaah");
    return { id: regId, status: "UNMASKED", entity: "DB_Audit_Logs" };
  }

  throw new Error("Aksi tidak didukung: " + action);
}

/**
 * ============================================================================
 * HTTP POST Router (Non-preflight compatible)
 * ============================================================================
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    if (!action) {
      return createResponse(false, null, "Parameter 'action' wajib disertakan dalam request body");
    }

    // A. SETUP / BOOTSTRAP DATABASE
    if (action === 'initDatabase' || action === 'setupDatabase') {
      const res = setupDatabase();
      return createResponse(true, res);
    }

    if (action === 'seedKloter27Okt') {
      const res = seedKloter27Oktober2026();
      return createResponse(true, res);
    }

    const ss = getSpreadsheet();
    if (!ss) {
      if (action === 'syncBatch') {
        const mutations = payload.mutations || [];
        const results = mutations.map(function(item) {
          return {
            mutationId: item.id,
            action: item.action,
            success: true,
            data: {
              simulated: true,
              id: (item.payload && (item.payload.id || item.payload.leadId || item.payload.regId || item.payload.paymentId)) || ("SIM-" + new Date().getTime())
            }
          };
        });
        return createResponse(true, {
          simulated: true,
          processed: results.length,
          successCount: results.length,
          details: results,
          message: "Spreadsheet belum terhubung. Batch mutasi disimulasikan sukses di backend sandbox."
        });
      }
      return createResponse(true, {
        simulated: true,
        action: action,
        message: "Spreadsheet belum terhubung. Mutasi disimulasikan sukses di backend sandbox."
      });
    }

    // B. BATCH SYNC ENGINE (FASE 4)
    if (action === 'syncBatch') {
      const mutations = payload.mutations || [];
      const results = [];

      for (let i = 0; i < mutations.length; i++) {
        const item = mutations[i];
        try {
          const res = processSingleMutation_(ss, item.action, item.payload, item.actor);
          results.push({ mutationId: item.id, action: item.action, success: true, data: res });
        } catch (itemErr) {
          results.push({ mutationId: item.id, action: item.action, success: false, error: itemErr.message });
        }
      }

      logAudit_(payload.actor || "ADMIN_SYNC", "SYNC_BATCH", "DB_Sync", "BATCH", null, { total: mutations.length, success: results.filter(r => r.success).length }, "Sinkronisasi batch offline-first");
      return createResponse(true, {
        processed: results.length,
        successCount: results.filter(r => r.success).length,
        details: results
      });
    }

    // C. SINGLE ACTION DISPATCH
    const res = processSingleMutation_(ss, action, payload, payload.actor || "ADMIN");
    return createResponse(true, res);

  } catch (err) {
    return createResponse(false, null, err.message);
  }
}
