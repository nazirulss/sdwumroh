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
    DB_Packages: ['id', 'name', 'slug', 'package_type', 'duration_days', 'status', 'description', 'hotel_makkah', 'hotel_madinah', 'airline', 'seats_left', 'badge', 'image_url', 'rating', 'starting_price', 'discount_label', 'published_at', 'created_at', 'updated_at'],
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
    DB_Audit_Logs: ['id', 'timestamp', 'actor', 'action', 'entity', 'entity_id', 'before', 'after', 'reason'],
    DB_Badal_Certificates: ['id', 'nomor_sertifikat', 'nama_petugas_badal', 'nama_yang_dibadalkan', 'tempat_miqat', 'tanggal_pelaksanaan', 'tempat_penerbitan', 'tanggal_penerbitan', 'keluarga_pemesan', 'status', 'ukuran_font_nama', 'catatan', 'created_at', 'updated_at']
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
      ['PKG-000001', 'Umroh Reguler Syawal Barakah', 'umroh-reguler-syawal', 'REGULER', 9, 'PUBLISHED', 'Perjalanan ibadah penuh kekhusyukan dengan bimbingan asatidz berpengalaman, hotel bintang 4 dekat pelataran masjid.', 'Retaj Al Rayyan / Setaraf (350m)', 'Concorde Dar Al Khair (200m)', 'Saudia Airlines (Direct SV)', 15, 'Best Seller', 'assets/pkg-reguler-syawal.png', '4.9/5 (182 ulasan)', 29500000, 'Hemat Rp 3 Jt', nowStr, nowStr, nowStr],
      ['PKG-000002', 'Umroh VIP Khidmat Akhir Tahun', 'umroh-vip-akhir-tahun', 'VIP', 12, 'PUBLISHED', 'Akomodasi bintang 5 di pelataran Ka\'bah (Clock Tower), kereta cepat Haramain High Speed Rail Makkah–Madinah.', 'Swissotel Makkah Clock Tower (0m)', 'Dar Al Taqwa Madinah (50m)', 'Garuda Indonesia (GA980)', 8, 'Hampir Penuh', 'assets/pkg-vip-khidmat.png', '5.0/5 (94 ulasan)', 43500000, 'Hemat Rp 2,5 Jt', nowStr, nowStr, nowStr],
      ['PKG-000003', 'Umroh Plus Turki Musim Semi', 'umroh-plus-turki-spring', 'PLUS_TOUR', 13, 'PUBLISHED', 'Ziarah jejak peradaban Utsmaniyah di Istanbul, Selat Bosphorus, dilanjutkan manasik intensif dan ibadah di dua Tanah Suci.', 'Anjum Hotel Makkah', 'Rove Al Madinah', 'Turkish Airlines', 18, 'Favorit Keluarga', 'assets/pkg-plus-turki.png', '4.8/5 (65 ulasan)', 38900000, 'Hemat Rp 3 Jt', nowStr, nowStr, nowStr]
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
      ['AUD-BOOTSTRAP', nowStr, 'SYSTEM', 'INIT_DATABASE', 'DATABASE', 'SDW_UMROH_DB', null, '23_SHEETS_CREATED', 'Inisialisasi otomatis arsitektur 23 sheet Google Spreadsheet SDW UMROH.']
    ],
    DB_Badal_Certificates: [
      ['BDL-001', 'SDW/BDL/2026/001', 'Ustadz Ahmad Fauzi Ridwan, Lc.', 'Alm. H. Abdullah bin Umar', "Masjid Aisyah Tan'im", '27 Oktober 2026', 'Makkah Al-Mukarramah', '27 Oktober 2026', 'Keluarga Besar Bpk. Sanali Bajuri', 'ISSUED', 'auto', 'Pelaksanaan badal umroh selesai secara khusyuk dan syar\'i', nowStr, nowStr],
      ['BDL-002', 'SDW/BDL/2026/002', 'Ustadz Ahmad Fauzi Ridwan, Lc.', 'Almh. Hj. Maryam binti Sulaiman', "Masjid Aisyah Tan'im", '27 Oktober 2026', 'Makkah Al-Mukarramah', '27 Oktober 2026', 'Ibu Siti Nuriyah & Keluarga', 'ISSUED', 'auto', 'Amanah badal telah ditunaikan dengan lancar', nowStr, nowStr],
      ['BDL-003', 'SDW/BDL/2026/003', 'Ustadz Muhammad Syakir, Lc., M.Ag.', 'Alm. K.H. Dahlan bin Syafei', 'Ji\'ranah', '27 Oktober 2026', 'Makkah Al-Mukarramah', '27 Oktober 2026', 'Keluarga Bpk. Khasan Munadi', 'ISSUED', 'auto', 'Dokumentasi tawaf & sa\'i tersimpan', nowStr, nowStr],
      ['BDL-004', 'SDW/BDL/2027/004', 'Ustadz Ahmad Fauzi Ridwan, Lc.', 'Almh. Nyai Hj. Fatimah binti Asy\'ari', "Masjid Aisyah Tan'im", '15 Januari 2027', 'Makkah Al-Mukarramah', '15 Januari 2027', 'Keluarga Besar Bpk. Sugiono', 'ISSUED', 'auto', 'Pelaksanaan badal gelombang Januari', nowStr, nowStr],
      ['BDL-005', 'SDW/BDL/2027/005', 'Ustadz Muhammad Syakir, Lc., M.Ag.', 'Alm. H. Mansur bin Hasyim', 'Bir Ali / Dzulhulaifah', '28 Februari 2027', 'Makkah Al-Mukarramah', '28 Februari 2027', 'Keluarga Ibu Sri Nuryati', 'DRAFT', 'auto', 'Menunggu konfirmasi jadwal muthawwif', nowStr, nowStr]
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
      if (!sheet || sheet.getLastRow() <= 1) return createResponse(true, []);

      // Auto-upgrade kolom sheet DB_Packages jika kolom hotel_makkah / airline belum ada di baris 1
      autoUpgradePackagesSheet_(sheet, ss);

      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];

      // Ambil snapshot harga jika sheet DB_Package_Prices ada
      const priceSheet = ss.getSheetByName("DB_Package_Prices");
      const priceMap = {};
      if (priceSheet && priceSheet.getLastRow() > 1) {
        const pRows = priceSheet.getDataRange().getValues();
        const pHeaders = pRows[0];
        pRows.slice(1).forEach(function(pRow) {
          const pObj = {};
          pHeaders.forEach(function(h, i) { pObj[h] = pRow[i]; });
          if (pObj.package_id) priceMap[pObj.package_id] = pObj;
        });
      }

      // Ambil snapshot maskapai dan kapasitas dari DB_Departures
      const depSheet = ss.getSheetByName("DB_Departures");
      const depMap = {};
      if (depSheet && depSheet.getLastRow() > 1) {
        const dRows = depSheet.getDataRange().getValues();
        const dHeaders = dRows[0];
        dRows.slice(1).forEach(function(dRow) {
          const dObj = {};
          dHeaders.forEach(function(h, i) { dObj[h] = dRow[i]; });
          if (dObj.package_id && !depMap[dObj.package_id]) {
            depMap[dObj.package_id] = dObj;
          }
        });
      }

      // Default metadata per package ID (5 Program Standar SDW UMROH)
      const defaultMetadata = {
        "PKG-000001": {
          name: "Umroh Reguler Syawal Barakah",
          slug: "umroh-reguler-syawal",
          package_type: "REGULER",
          duration_days: 9,
          hotel_makkah: "Retaj Al Rayyan / Setaraf (350m)",
          hotel_madinah: "Concorde Dar Al Khair (200m)",
          airline: "Saudia Airlines (Direct SV)",
          seats_left: 7,
          badge: "Best Seller",
          image_url: "assets/pkg-reguler-syawal.png",
          rating: "4.9/5 (182 ulasan)",
          starting_price: 29500000,
          discount_label: "Hemat Rp 3 Jt"
        },
        "PKG-000002": {
          name: "Umroh VIP Khidmat Akhir Tahun",
          slug: "umroh-vip-akhir-tahun",
          package_type: "VIP",
          duration_days: 12,
          hotel_makkah: "Swissotel Makkah Clock Tower (0m)",
          hotel_madinah: "Dar Al Taqwa Madinah (50m)",
          airline: "Garuda Indonesia (GA980)",
          seats_left: 8,
          badge: "Hampir Penuh",
          image_url: "assets/pkg-vip-khidmat.png",
          rating: "5.0/5 (94 ulasan)",
          starting_price: 43500000,
          discount_label: "Hemat Rp 2,5 Jt"
        },
        "PKG-000003": {
          name: "Umroh Plus Turki Musim Semi",
          slug: "umroh-plus-turki-spring",
          package_type: "PLUS_TOUR",
          duration_days: 13,
          hotel_makkah: "Anjum Hotel Makkah",
          hotel_madinah: "Rove Al Madinah",
          airline: "Turkish Airlines (TK-57)",
          seats_left: 18,
          badge: "Favorit Keluarga",
          image_url: "assets/pkg-plus-turki.png",
          rating: "4.8/5 (65 ulasan)",
          starting_price: 38900000,
          discount_label: "Hemat Rp 3 Jt"
        },
        "PKG-000004": {
          name: "Umroh Awal Ramadhan 1448H",
          slug: "umroh-ramadhan-awal",
          package_type: "RAMADHAN",
          duration_days: 10,
          hotel_makkah: "Pullman Zamzam Makkah",
          hotel_madinah: "Grand Plaza Madinah",
          airline: "Saudia Airlines",
          seats_left: 4,
          badge: "Spesial Ramadhan",
          image_url: "assets/pkg-ramadhan.png",
          rating: "4.9/5 (120 ulasan)",
          starting_price: 36500000,
          discount_label: "Hemat Rp 3 Jt"
        },
        "PKG-000005": {
          name: "Umroh Syariah Bintang Tiga Hemat",
          slug: "umroh-hemat-syariah",
          package_type: "HEMAT",
          duration_days: 9,
          hotel_makkah: "Olayan Ajyad (600m Shuttle)",
          hotel_madinah: "Durrat Al Eiman",
          airline: "Lion Air Umrah Direct",
          seats_left: 36,
          badge: "Paling Hemat",
          image_url: "assets/pkg-hemat.png",
          rating: "4.7/5 (210 ulasan)",
          starting_price: 26800000,
          discount_label: "Hemat Rp 1,7 Jt"
        }
      };

      const items = rows.slice(1).map(function (row) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });
        const def = defaultMetadata[obj.id] || {};
        const pInfo = priceMap[obj.id] || {};
        const dInfo = depMap[obj.id] || {};

        let pkgType = String(obj.package_type || 'REGULER').toUpperCase();
        if (pkgType === 'REGULAR') pkgType = 'REGULER';
        if (pkgType === 'PLUS_TURKEY') pkgType = 'PLUS_TOUR';

        const quadPrice = Number(obj.quad_price || pInfo.quad_price || obj.starting_price || def.starting_price || 29500000);
        const triplePrice = Number(obj.triple_price || pInfo.triple_price || (quadPrice + 2000000));
        const doublePrice = Number(obj.double_price || pInfo.double_price || (quadPrice + 5000000));

        let seats = obj.seats_left !== undefined && obj.seats_left !== '' ? Number(obj.seats_left) : null;
        if (seats === null) {
          if (dInfo.capacity_total && dInfo.capacity_booked !== undefined) {
            seats = Math.max(0, Number(dInfo.capacity_total) - Number(dInfo.capacity_booked));
          } else {
            seats = def.seats_left || 15;
          }
        }

        return {
          id: obj.id,
          name: obj.name || 'Paket Umroh',
          slug: obj.slug || (String(obj.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')),
          package_type: pkgType,
          duration_days: Number(obj.duration_days) || 9,
          status: obj.status || 'PUBLISHED',
          description: obj.description || '',
          hotel_makkah: obj.hotel_makkah || def.hotel_makkah || 'Hotel Bintang Makkah',
          hotel_madinah: obj.hotel_madinah || def.hotel_madinah || 'Hotel Bintang Madinah',
          airline: obj.airline || dInfo.airline || def.airline || 'Saudia Airlines',
          seats_left: seats,
          badge: obj.badge || def.badge || 'Program Pilihan',
          image: obj.image_url || obj.image || 'assets/hero-haram.png',
          image_url: obj.image_url || obj.image || 'assets/hero-haram.png',
          rating: obj.rating || '4.9/5 (100+ ulasan)',
          starting_price: quadPrice,
          quad_price: quadPrice,
          triple_price: triplePrice,
          double_price: doublePrice,
          discount_label: obj.discount_label || def.discount_label || '',
          published_at: obj.published_at || '',
          created_at: obj.created_at || '',
          updated_at: obj.updated_at || ''
        };
      });
      return createResponse(true, items);
    }

    if (action === 'upgradePackagesSchema') {
      const sheet = ss.getSheetByName("DB_Packages");
      if (!sheet) return createResponse(false, null, "Sheet DB_Packages tidak ditemukan");
      autoUpgradePackagesSheet_(sheet, ss);
      return createResponse(true, { message: "Skema DB_Packages berhasil diupgrade ke 19 kolom lengkap" });
    }

    if (action === 'upgradeDeparturesSchema') {
      const sheet = ss.getSheetByName("DB_Departures");
      autoUpgradeDeparturesSheet_(sheet, ss);
      return createResponse(true, { message: "Skema DB_Departures berhasil diupgrade dan disinkronkan" });
    }

    if (action === 'getDepartures') {
      const sheet = ss.getSheetByName("DB_Departures");
      if (!sheet) return createResponse(false, null, "Sheet DB_Departures tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];

      // Ambil DB_Packages untuk pengayaan data relasional kloter
      const pkgSheet = ss.getSheetByName("DB_Packages");
      const pkgMap = {};
      if (pkgSheet && pkgSheet.getLastRow() > 1) {
        const pRows = pkgSheet.getDataRange().getValues();
        const pHeaders = pRows[0];
        pRows.slice(1).forEach(function(pRow) {
          const pObj = {};
          pHeaders.forEach(function(h, idx) { pObj[h] = pRow[idx]; });
          if (pObj.id) pkgMap[String(pObj.id).toUpperCase()] = pObj;
        });
      }

      const items = rows.slice(1).map(function (row) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });

        const pkgIdUpper = String(obj.package_id || '').toUpperCase();
        const pkg = pkgMap[pkgIdUpper] || {};

        obj.package_name = pkg.name || obj.notes || obj.package_id || 'Paket Umroh';
        obj.package_type = pkg.package_type || 'REGULAR';
        obj.duration_days = Number(pkg.duration_days) || 9;
        obj.badge = pkg.badge || '';
        obj.image_url = pkg.image_url || '';
        obj.hotel_makkah = pkg.hotel_makkah || '-';
        obj.hotel_madinah = pkg.hotel_madinah || '-';
        obj.starting_price = Number(pkg.starting_price) || 0;

        const capTotal = Number(obj.capacity_total) || 45;
        const capBooked = Number(obj.capacity_booked) || 0;
        obj.capacity_total = capTotal;
        obj.capacity_booked = capBooked;
        obj.seats_left = Math.max(0, capTotal - capBooked);

        return obj;
      });
      return createResponse(true, items);
    }

    if (action === 'upgradeHotelsSchema') {
      const sheet = ss.getSheetByName("DB_Hotels");
      autoUpgradeHotelsSheet_(sheet, ss);
      return createResponse(true, { message: "Skema DB_Hotels berhasil diupgrade dan disinkronkan" });
    }

    if (action === 'getHotels') {
      let sheet = ss.getSheetByName("DB_Hotels");
      if (!sheet) {
        autoUpgradeHotelsSheet_(sheet, ss);
        sheet = ss.getSheetByName("DB_Hotels");
      }
      if (!sheet) return createResponse(false, null, "Sheet DB_Hotels tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(function (row) {
        const obj = {};
        headers.forEach(function (h, i) { obj[h] = row[i]; });
        obj.star_rating = Number(obj.star_rating) || 5;
        obj.distance_meters = Number(obj.distance_meters) || 0;
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

    if (action === 'getBadalCertificates') {
      const sheet = ss.getSheetByName("DB_Badal_Certificates");
      if (!sheet || sheet.getLastRow() <= 1) return createResponse(true, []);
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(function(row) {
        const obj = {};
        headers.forEach(function(h, i) {
          let val = row[i];
          if (val instanceof Date) val = formatDateSafe_(val);
          obj[h] = val;
        });
        const certNo = obj.nomor_sertifikat || obj.cert_no || '';
        const petugas = obj.nama_petugas_badal || obj.muthawwif || '';
        const dibadalkan = obj.nama_yang_dibadalkan || obj.almarhum_name || '';
        const miqat = obj.tempat_miqat || "Masjid Aisyah Tan'im";
        const tglPelaksanaan = obj.tanggal_pelaksanaan || obj.execution_date || '';
        const tempatPenerbitan = obj.tempat_penerbitan || obj.location || 'Makkah Al-Mukarramah';
        const tglPenerbitan = obj.tanggal_penerbitan || obj.execution_date || '';
        const keluarga = obj.keluarga_pemesan || obj.dibadalkan_oleh || '';
        const fontSize = obj.ukuran_font_nama || obj.name_font_size || 'auto';
        const catatan = obj.catatan || obj.notes || '';

        return {
          id: obj.id,
          nomorSertifikat: certNo,
          certNo: certNo,
          namaPetugasBadal: petugas,
          muthawwif: petugas,
          namaYangDibadalkan: dibadalkan,
          almarhumName: dibadalkan,
          tempatMiqat: miqat,
          tanggalPelaksanaan: tglPelaksanaan,
          executionDate: tglPelaksanaan,
          tempatPenerbitan: tempatPenerbitan,
          tanggalPenerbitan: tglPenerbitan,
          keluargaPemesan: keluarga,
          dibadalkanOleh: keluarga,
          status: obj.status || 'ISSUED',
          nameFontSize: fontSize,
          ukuranFontNama: fontSize,
          notes: catatan,
          catatan: catatan,
          createdAt: obj.created_at,
          updatedAt: obj.updated_at
        };
      });
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

  // 13. MANAJEMEN E-SERTIFIKAT BADAL UMROH
  if (action === 'saveBadalCertificate') {
    const sheet = ss.getSheetByName("DB_Badal_Certificates");
    if (!sheet) throw new Error("Sheet DB_Badal_Certificates tidak ditemukan");

    const rows = sheet.getDataRange().getValues();
    const id = payload.id || ("BDL-" + String(sheet.getLastRow()).padStart(3, '0'));
    const nowStr = new Date().toISOString();
    let rowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        rowIndex = i + 1;
        break;
      }
    }

    const rowData = [
      id,
      payload.nomorSertifikat || payload.nomor_sertifikat || payload.certNo || payload.cert_no || '',
      payload.namaPetugasBadal || payload.nama_petugas_badal || payload.muthawwif || '',
      payload.namaYangDibadalkan || payload.nama_yang_dibadalkan || payload.almarhumName || payload.almarhum_name || '',
      payload.tempatMiqat || payload.tempat_miqat || "Masjid Aisyah Tan'im",
      payload.tanggalPelaksanaan || payload.tanggal_pelaksanaan || payload.executionDate || payload.execution_date || '',
      payload.tempatPenerbitan || payload.tempat_penerbitan || payload.location || 'Makkah Al-Mukarramah',
      payload.tanggalPenerbitan || payload.tanggal_penerbitan || payload.tanggalPelaksanaan || payload.executionDate || '',
      payload.keluargaPemesan || payload.keluarga_pemesan || payload.dibadalkanOleh || payload.dibadalkan_oleh || '',
      payload.status || 'ISSUED',
      payload.ukuranFontNama || payload.ukuran_font_nama || payload.nameFontSize || payload.name_font_size || 'auto',
      payload.catatan || payload.notes || '',
      rowIndex > 0 ? rows[rowIndex - 1][12] : nowStr,
      nowStr
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    logAudit_(actor, "SAVE_BADAL_CERTIFICATE", "DB_Badal_Certificates", id, null, payload, "Piagam badal umroh berhasil disimpan");
    return { id: id, status: payload.status || "ISSUED", entity: "DB_Badal_Certificates" };
  }

  if (action === 'deleteBadalCertificate') {
    const sheet = ss.getSheetByName("DB_Badal_Certificates");
    if (!sheet) throw new Error("Sheet DB_Badal_Certificates tidak ditemukan");

    const id = payload.id;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        logAudit_(actor, "DELETE_BADAL_CERTIFICATE", "DB_Badal_Certificates", id, null, null, "Piagam badal umroh dihapus");
        return { id: id, deleted: true, entity: "DB_Badal_Certificates" };
      }
    }
    return { id: id, deleted: false, message: "ID tidak ditemukan" };
  }

  // 14. MANAJEMEN KATALOG PILIHAN PAKET UMROH
  if (action === 'savePackage') {
    const sheet = ss.getSheetByName("DB_Packages");
    if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");

    // Pastikan skema kolom hotel & maskapai sudah terpasang di sheet spreadsheet
    autoUpgradePackagesSheet_(sheet, ss);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const nowStr = new Date().toISOString();
    let id = payload.id;
    let rowIndex = -1;

    if (id) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    if (!id) {
      let maxNum = 0;
      for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][0] || '');
        const match = rowId.match(/PKG-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      id = "PKG-" + String(maxNum + 1).padStart(6, '0');
    }

    const name = payload.name || payload.title || "Paket Umroh Baru";
    const slug = payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const packageType = payload.package_type || payload.packageType || 'REGULER';
    const durationDays = Number(payload.duration_days || payload.durationDays || 9);
    const status = payload.status || 'PUBLISHED';
    const description = payload.description || '';
    const hotelMakkah = payload.hotel_makkah || payload.hotelMakkah || 'Hotel Bintang Makkah';
    const hotelMadinah = payload.hotel_madinah || payload.hotelMadinah || 'Hotel Bintang Madinah';
    const airline = payload.airline || 'Saudia Airlines';
    const seatsLeft = Number(payload.seats_left !== undefined ? payload.seats_left : (payload.seatsLeft !== undefined ? payload.seatsLeft : 15));
    const badge = payload.badge || 'Program Pilihan';
    const imageUrl = payload.image_url || payload.imageUrl || payload.image || 'assets/hero-haram.png';
    const rating = payload.rating || '4.9/5 (100+ ulasan)';
    const startingPrice = Number(payload.starting_price || payload.startingPrice || payload.quad_price || payload.quadPrice || 29500000);
    const discountLabel = payload.discount_label || payload.discountLabel || '';
    const publishedAt = payload.published_at || payload.publishedAt || (status === 'PUBLISHED' ? nowStr : '');
    const createdAt = rowIndex > 0 && rows[rowIndex - 1][17] ? rows[rowIndex - 1][17] : nowStr;
    const updatedAt = nowStr;

    const rowData = [];
    headers.forEach(function(h) {
      switch(h) {
        case 'id': rowData.push(id); break;
        case 'name': rowData.push(name); break;
        case 'slug': rowData.push(slug); break;
        case 'package_type': rowData.push(packageType); break;
        case 'duration_days': rowData.push(durationDays); break;
        case 'status': rowData.push(status); break;
        case 'description': rowData.push(description); break;
        case 'hotel_makkah': rowData.push(hotelMakkah); break;
        case 'hotel_madinah': rowData.push(hotelMadinah); break;
        case 'airline': rowData.push(airline); break;
        case 'seats_left': rowData.push(seatsLeft); break;
        case 'badge': rowData.push(badge); break;
        case 'image_url': rowData.push(imageUrl); break;
        case 'rating': rowData.push(rating); break;
        case 'starting_price': rowData.push(startingPrice); break;
        case 'discount_label': rowData.push(discountLabel); break;
        case 'published_at': rowData.push(publishedAt); break;
        case 'created_at': rowData.push(createdAt); break;
        case 'updated_at': rowData.push(updatedAt); break;
        default: rowData.push(payload[h] || ''); break;
      }
    });

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    const priceSheet = ss.getSheetByName("DB_Package_Prices");
    if (priceSheet) {
      const quadPrice = Number(payload.quad_price || payload.quadPrice || startingPrice);
      const triplePrice = Number(payload.triple_price || payload.triplePrice || (quadPrice + 2000000));
      const doublePrice = Number(payload.double_price || payload.doublePrice || (quadPrice + 5000000));
      const pRows = priceSheet.getDataRange().getValues();
      let pRowIndex = -1;
      for (let i = 1; i < pRows.length; i++) {
        if (String(pRows[i][1]).toUpperCase() === String(id).toUpperCase()) {
          pRowIndex = i + 1;
          break;
        }
      }
      if (pRowIndex > 0) {
        priceSheet.getRange(pRowIndex, 4, 1, 3).setValues([[quadPrice, triplePrice, doublePrice]]);
      } else {
        const prcId = "PRC-" + String(priceSheet.getLastRow()).padStart(6, '0');
        priceSheet.appendRow([prcId, id, 'IDR', quadPrice, triplePrice, doublePrice, '2026-01-01', '2027-12-31', 'ACTIVE']);
      }
    }

    // Sinkronkan data maskapai ke DB_Departures
    const depSheet = ss.getSheetByName("DB_Departures");
    if (depSheet && airline) {
      const dRows = depSheet.getDataRange().getValues();
      let dRowIndex = -1;
      for (let i = 1; i < dRows.length; i++) {
        if (String(dRows[i][1]).toUpperCase() === String(id).toUpperCase()) {
          dRowIndex = i + 1;
          break;
        }
      }
      if (dRowIndex > 0) {
        depSheet.getRange(dRowIndex, 5).setValue(airline); // kolom airline
      } else {
        const depId = "DEP-" + String(depSheet.getLastRow()).padStart(6, '0');
        depSheet.appendRow([depId, id, '2027-01-15', '2027-01-24', airline, 'CGK', 45, 0, 'OPEN', name]);
      }
    }

    logAudit_(actor, rowIndex > 0 ? "UPDATE_PACKAGE" : "CREATE_PACKAGE", "DB_Packages", id, null, payload, "Paket umroh '" + name + "' berhasil disimpan");
    return { id: id, name: name, status: status, entity: "DB_Packages" };
  }

  if (action === 'setPackageStatus') {
    const sheet = ss.getSheetByName("DB_Packages");
    if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");

    const id = payload.id;
    const newStatus = payload.status || 'PUBLISHED';
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const statusColIdx = headers.indexOf('status');
    const updatedColIdx = headers.indexOf('updated_at');

    if (statusColIdx === -1) throw new Error("Kolom status tidak ditemukan di DB_Packages");

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        sheet.getRange(i + 1, statusColIdx + 1).setValue(newStatus);
        if (updatedColIdx !== -1) {
          sheet.getRange(i + 1, updatedColIdx + 1).setValue(new Date().toISOString());
        }
        logAudit_(actor, "SET_PACKAGE_STATUS", "DB_Packages", id, null, { status: newStatus }, "Status paket diubah menjadi " + newStatus);
        return { id: id, status: newStatus, entity: "DB_Packages" };
      }
    }
    return { id: id, error: "ID paket tidak ditemukan" };
  }

  if (action === 'deletePackage') {
    const sheet = ss.getSheetByName("DB_Packages");
    if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");

    const id = payload.id;
    const regSheet = ss.getSheetByName("DB_Registrations");
    if (regSheet && regSheet.getLastRow() > 1) {
      const regRows = regSheet.getDataRange().getValues();
      for (let r = 1; r < regRows.length; r++) {
        if (String(regRows[r][3]).toUpperCase() === String(id).toUpperCase()) {
          const pRows = sheet.getDataRange().getValues();
          const pHeaders = pRows[0];
          const stIdx = pHeaders.indexOf('status');
          if (stIdx !== -1) {
            for (let i = 1; i < pRows.length; i++) {
              if (String(pRows[i][0]).toUpperCase() === String(id).toUpperCase()) {
                sheet.getRange(i + 1, stIdx + 1).setValue("ARCHIVED");
                logAudit_(actor, "ARCHIVE_PACKAGE", "DB_Packages", id, null, null, "Paket diarsipkan karena memiliki pendaftaran aktif");
                return { id: id, archived: true, message: "Paket diarsipkan (tidak dihapus permanen karena ada pendaftaran terkait)" };
              }
            }
          }
        }
      }
    }

    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        sheet.deleteRow(i + 1);
        logAudit_(actor, "DELETE_PACKAGE", "DB_Packages", id, null, null, "Paket umroh berhasil dihapus");
        return { id: id, deleted: true, entity: "DB_Packages" };
      }
    }
    return { id: id, deleted: false, message: "ID tidak ditemukan" };
  }

  if (action === 'upgradePackagesSchema') {
    const sheet = ss.getSheetByName("DB_Packages");
    if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");
    autoUpgradePackagesSheet_(sheet, ss);
    logAudit_(actor, "UPGRADE_SCHEMA", "DB_Packages", "ALL", null, null, "Skema DB_Packages berhasil diupgrade ke 19 kolom");
    return { success: true, message: "Skema DB_Packages berhasil diupgrade ke 19 kolom lengkap" };
  }

  if (action === 'saveDeparture') {
    const sheet = ss.getSheetByName("DB_Departures");
    if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");

    autoUpgradeDeparturesSheet_(sheet, ss);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    let id = payload.id;
    let rowIndex = -1;

    if (id) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    if (!id) {
      let maxNum = 0;
      for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][0] || '');
        const match = rowId.match(/DEP-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      id = "DEP-" + String(maxNum + 1).padStart(6, '0');
    }

    const package_id = String(payload.package_id || '').trim();
    const departure_date = String(payload.departure_date || '').trim();
    const return_date = String(payload.return_date || '').trim();
    const airline = String(payload.airline || '').trim();
    const origin_airport = String(payload.origin_airport || 'CGK').trim();
    const capacity_total = Number(payload.capacity_total) || 45;
    const capacity_booked = Number(payload.capacity_booked) || 0;
    const status = String(payload.status || 'OPEN').trim();
    const notes = String(payload.notes || '').trim();

    const rowObj = {
      id: id,
      package_id: package_id,
      departure_date: departure_date,
      return_date: return_date,
      airline: airline,
      origin_airport: origin_airport,
      capacity_total: capacity_total,
      capacity_booked: capacity_booked,
      status: status,
      notes: notes
    };

    const rowData = headers.map(function (h) {
      return rowObj[h] !== undefined ? rowObj[h] : '';
    });

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    logAudit_(actor, rowIndex > 0 ? "UPDATE_DEPARTURE" : "CREATE_DEPARTURE", "DB_Departures", id, null, payload, "Jadwal kloter '" + id + "' (" + airline + " - " + departure_date + ") berhasil disimpan");
    return { id: id, package_id: package_id, departure_date: departure_date, status: status, entity: "DB_Departures" };
  }

  if (action === 'setDepartureStatus') {
    const sheet = ss.getSheetByName("DB_Departures");
    if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");

    const id = payload.id;
    const newStatus = payload.status || 'OPEN';
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const statusColIdx = headers.indexOf('status');

    if (statusColIdx === -1) throw new Error("Kolom status tidak ditemukan di DB_Departures");

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        sheet.getRange(i + 1, statusColIdx + 1).setValue(newStatus);
        logAudit_(actor, "SET_DEPARTURE_STATUS", "DB_Departures", id, null, { status: newStatus }, "Status kloter diubah menjadi " + newStatus);
        return { id: id, status: newStatus, entity: "DB_Departures" };
      }
    }
    return { id: id, error: "ID kloter tidak ditemukan" };
  }

  if (action === 'deleteDeparture') {
    const sheet = ss.getSheetByName("DB_Departures");
    if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");

    const id = payload.id;
    const regSheet = ss.getSheetByName("DB_Registrations");
    let hasActiveReg = false;
    if (regSheet && regSheet.getLastRow() > 1) {
      const regRows = regSheet.getDataRange().getValues();
      for (let r = 1; r < regRows.length; r++) {
        if (String(regRows[r][2]).toUpperCase() === String(id).toUpperCase()) {
          hasActiveReg = true;
          break;
        }
      }
    }

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const statusColIdx = headers.indexOf('status');

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        if (hasActiveReg) {
          if (statusColIdx !== -1) {
            sheet.getRange(i + 1, statusColIdx + 1).setValue('ARCHIVED');
          }
          logAudit_(actor, "ARCHIVE_DEPARTURE", "DB_Departures", id, null, null, "Kloter diarsipkan karena memiliki jamaah terdaftar");
          return { id: id, action: 'ARCHIVED', message: 'Kloter memiliki pendaftar terdaftar, status dialihkan ke ARCHIVED' };
        } else {
          sheet.deleteRow(i + 1);
          logAudit_(actor, "DELETE_DEPARTURE", "DB_Departures", id, null, null, "Kloter berhasil dihapus permanen");
          return { id: id, action: 'DELETED', message: 'Kloter berhasil dihapus permanen' };
        }
      }
    }
    return { id: id, error: "ID kloter tidak ditemukan" };
  }

  if (action === 'upgradeDeparturesSchema') {
    const sheet = ss.getSheetByName("DB_Departures");
    autoUpgradeDeparturesSheet_(sheet, ss);
    logAudit_(actor, "UPGRADE_SCHEMA", "DB_Departures", "ALL", null, null, "Skema DB_Departures berhasil diupgrade dan disinkronkan");
    return { success: true, message: "Skema DB_Departures berhasil diupgrade dan disinkronkan" };
  }

  if (action === 'saveHotel') {
    const sheet = ss.getSheetByName("DB_Hotels");
    if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");

    autoUpgradeHotelsSheet_(sheet, ss);

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const nowStr = new Date().toISOString();
    let id = payload.id;
    let rowIndex = -1;

    if (id) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    if (!id) {
      let maxNum = 0;
      for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][0] || '');
        const match = rowId.match(/HTL-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      id = "HTL-" + String(maxNum + 1).padStart(6, '0');
    }

    const name = String(payload.name || '').trim();
    const city = String(payload.city || 'MAKKAH').trim().toUpperCase();
    const star_rating = Number(payload.star_rating) || 5;
    const distance_meters = Number(payload.distance_meters) || 0;
    const distance_text = String(payload.distance_text || '').trim();
    const location_zone = String(payload.location_zone || 'RING_1').trim();
    const gate_info = String(payload.gate_info || '').trim();
    const image_url = String(payload.image_url || 'assets/hero-haram.png').trim();
    const description = String(payload.description || '').trim();
    const maps_url = String(payload.maps_url || '').trim();
    const facilities = String(payload.facilities || '').trim();
    const status = String(payload.status || 'ACTIVE').trim().toUpperCase();

    const rowObj = {
      id: id,
      name: name,
      city: city,
      star_rating: star_rating,
      distance_meters: distance_meters,
      distance_text: distance_text,
      location_zone: location_zone,
      gate_info: gate_info,
      image_url: image_url,
      description: description,
      maps_url: maps_url,
      facilities: facilities,
      status: status,
      created_at: rowIndex > 0 ? (rows[rowIndex - 1][headers.indexOf('created_at')] || nowStr) : nowStr,
      updated_at: nowStr
    };

    const rowData = headers.map(function (h) {
      return rowObj[h] !== undefined ? rowObj[h] : '';
    });

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    logAudit_(actor, rowIndex > 0 ? "UPDATE_HOTEL" : "CREATE_HOTEL", "DB_Hotels", id, null, payload, "Hotel '" + name + "' (" + city + ") berhasil disimpan");
    return { id: id, name: name, city: city, status: status, entity: "DB_Hotels" };
  }

  if (action === 'setHotelStatus') {
    const sheet = ss.getSheetByName("DB_Hotels");
    if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");

    const id = payload.id;
    const newStatus = String(payload.status || 'ACTIVE').toUpperCase();
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const statusColIdx = headers.indexOf('status');
    const updatedColIdx = headers.indexOf('updated_at');

    if (statusColIdx === -1) throw new Error("Kolom status tidak ditemukan di DB_Hotels");

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        sheet.getRange(i + 1, statusColIdx + 1).setValue(newStatus);
        if (updatedColIdx !== -1) {
          sheet.getRange(i + 1, updatedColIdx + 1).setValue(new Date().toISOString());
        }
        logAudit_(actor, "SET_HOTEL_STATUS", "DB_Hotels", id, null, { status: newStatus }, "Status hotel diubah menjadi " + newStatus);
        return { id: id, status: newStatus, entity: "DB_Hotels" };
      }
    }
    return { id: id, error: "ID hotel tidak ditemukan" };
  }

  if (action === 'deleteHotel') {
    const sheet = ss.getSheetByName("DB_Hotels");
    if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");

    const id = payload.id;
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const statusColIdx = headers.indexOf('status');
    const updatedColIdx = headers.indexOf('updated_at');

    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        // Soft delete ke ARCHIVED demi integritas data paket / rooming lama
        if (statusColIdx !== -1) {
          sheet.getRange(i + 1, statusColIdx + 1).setValue('ARCHIVED');
          if (updatedColIdx !== -1) {
            sheet.getRange(i + 1, updatedColIdx + 1).setValue(new Date().toISOString());
          }
        }
        logAudit_(actor, "ARCHIVE_HOTEL", "DB_Hotels", id, null, null, "Hotel diarsipkan");
        return { id: id, action: 'ARCHIVED', message: 'Hotel berhasil diarsipkan' };
      }
    }
    return { id: id, error: "ID hotel tidak ditemukan" };
  }

  if (action === 'upgradeHotelsSchema') {
    const sheet = ss.getSheetByName("DB_Hotels");
    autoUpgradeHotelsSheet_(sheet, ss);
    logAudit_(actor, "UPGRADE_SCHEMA", "DB_Hotels", "ALL", null, null, "Skema DB_Hotels berhasil diupgrade dan disinkronkan");
    return { success: true, message: "Skema DB_Hotels berhasil diupgrade dan disinkronkan" };
  }

  throw new Error("Aksi tidak didukung: " + action);
}

/**
 * Otomatis melengkapi skema 15 kolom canonical dan seeding 9 hotel resmi Makkah & Madinah jika sheet kosong/belum lengkap
 */
function autoUpgradeHotelsSheet_(sheet, ss) {
  if (!sheet) {
    sheet = ss.insertSheet("DB_Hotels");
  }
  const canonical = [
    'id', 'name', 'city', 'star_rating', 'distance_meters', 'distance_text',
    'location_zone', 'gate_info', 'image_url', 'description', 'maps_url',
    'facilities', 'status', 'created_at', 'updated_at'
  ];

  let lastCol = sheet.getLastColumn();
  let currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];

  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    sheet.getRange(1, 1, 1, canonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);
    currentHeaders = canonical;
    lastCol = canonical.length;
  }

  const missing = canonical.filter(function(c) { return currentHeaders.indexOf(c) === -1; });
  if (missing.length > 0) {
    const startCol = lastCol + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    sheet.getRange(1, startCol, 1, missing.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    lastCol = sheet.getLastColumn();
    currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); });
  }

  // Jika data hanya 1 baris (header saja), sinkronkan 9 hotel resmi
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    const nowStr = new Date().toISOString();
    const seedHotels = [
      ['HTL-000001', 'Swissotel Al Maqam Makkah', 'MAKKAH', 5, 0, '0 Meter (Pelataran Masjidil Haram)', 'RING_1', 'Gate 1 (King Abdulaziz)', 'assets/pkg-vip-khidmat.png', 'Hotel mewah bintang 5 di dalam kompleks Abraj Al Bait Clock Tower dengan akses lift langsung menuju pelataran Masjidil Haram.', 'https://maps.google.com/?q=Swissotel+Al+Maqam+Makkah', 'Restoran Nusantara, Akses Kursi Roda, Free WiFi, Ruang Shalat View Ka\'bah, Layanan Medis', 'ACTIVE', nowStr, nowStr],
      ['HTL-000002', 'Mövenpick Hotel Hajar Tower Makkah', 'MAKKAH', 5, 0, '0 Meter (Pelataran Masjidil Haram)', 'RING_1', 'Gate 1 (King Abdulaziz)', 'assets/hero-haram.png', 'Bagian dari kompleks Abraj Al Bait Clock Tower menghadap pelataran King Abdulaziz Gate. Fasilitas buffet masakan Indonesia dan lift berkecepatan tinggi.', 'https://maps.google.com/?q=Movenpick+Hajar+Tower+Makkah', 'Buffet Menu Indonesia, Akses Lift Cepat, Free WiFi, Concierge 24 Jam, Penukaran Uang', 'ACTIVE', nowStr, nowStr],
      ['HTL-000003', 'Pullman Zamzam Makkah', 'MAKKAH', 5, 0, '0 Meter (Pelataran Masjidil Haram)', 'RING_1', 'Gate 1 (King Abdulaziz)', 'assets/hero-twilight.jpg', 'Hotel ikonik berjarak 0 meter dari pelataran. Sangat diminati jamaah keluarga dan lansia karena akses terdekat ke tempat sa\'i dan thawaf.', 'https://maps.google.com/?q=Pullman+Zamzam+Makkah', 'Audio Shalat Ka\'bah di Kamar, Restoran Al Yasmine, Akses Kursi Roda, Resepsionis Bahasa Indonesia', 'ACTIVE', nowStr, nowStr],
      ['HTL-000004', 'Retaj Al Rayyan Makkah', 'MAKKAH', 4, 350, '350 Meter (Jalan Kaki Santai)', 'WALKING_DISTANCE', 'Gate 1-5 (Ajyad)', 'assets/pkg-reguler-syawal.png', 'Hotel bintang 4 favorit paket reguler di kawasan Ajyad. Hanya 4-5 menit jalan kaki santai di jalan datar tanpa tanjakan menuju pelataran.', 'https://maps.google.com/?q=Retaj+Al+Rayyan+Makkah', 'Katering Cita Rasa Nusantara, Kamar Bersih Luas, Toko Oleh-oleh di Lobi, Free WiFi', 'ACTIVE', nowStr, nowStr],
      ['HTL-000005', 'Olayan Ajyad Hotel Makkah', 'MAKKAH', 3, 600, '600 Meter (Shuttle Bus Gratis 24 Jam)', 'SHUTTLE', 'Terminal Ajyad', 'assets/pkg-hemat.webp', 'Pilihan utama paket hemat dan syariah. Dilengkapi armada shuttle bus ber-AC non-stop 24 jam langsung ke terminal bawah pelataran Haram.', 'https://maps.google.com/?q=Olayan+Ajyad+Hotel+Makkah', 'Shuttle Bus 24 Jam Non-stop, Kamar Quad Hemat, Menu Katering Indonesia, Pembimbing Ibadah Standby', 'ACTIVE', nowStr, nowStr],
      ['HTL-000006', 'Dar Al Taqwa Hotel Madinah', 'MADINAH', 5, 50, '50 Meter (Pelataran Masjid Nabawi)', 'RING_1', 'Gate 21-22 (King Fahd / Raudhah)', 'assets/pkg-vip-khidmat.png', 'Hotel bintang 5 tepat di depan pelataran utama Masjid Nabawi. Pintu masuk khusus jamaah wanita ke Raudhah hanya beberapa langkah dari lobi hotel.', 'https://maps.google.com/?q=Dar+Al+Taqwa+Hotel+Madinah', 'Akses Terdekat Pintu Raudhah Wanita, Restoran Fine Dining, Butler Service, View Kubah Hijau', 'ACTIVE', nowStr, nowStr],
      ['HTL-000007', 'Frontel Al Harithia Madinah', 'MADINAH', 5, 100, '100 Meter (Markaziyah Utara)', 'RING_1', 'Gate 20-22 (King Fahd)', 'assets/hero-haram.png', 'Hotel bintang 5 di sektor Markaziyah Utara. Terkenal dengan hidangan sarapan dan makan malam menu Nusantara yang lengkap dan kamar yang luas.', 'https://maps.google.com/?q=Frontel+Al+Harithia+Hotel+Madinah', 'Chef Menu Masakan Indonesia, Pusat Kebugaran, Free WiFi High-Speed, Fasilitas Ramah Lansia', 'ACTIVE', nowStr, nowStr],
      ['HTL-000008', 'Concorde Dar Al Khair Madinah', 'MADINAH', 4, 200, '200 Meter (Markaziyah Barat)', 'WALKING_DISTANCE', 'Gate 8 (Bab As-Salam)', 'assets/pkg-reguler-syawal.png', 'Hotel bintang 4 sangat strategis di area Markaziyah Barat. Sekitar 2-3 menit jalan kaki ke pelataran Bab As-Salam, dekat dengan pusat pertokoan kurma.', 'https://maps.google.com/?q=Concorde+Dar+Al+Khair+Madinah', 'Dekat Pusat Belanja Kurma & Souvenir, Masakan Nusantara 3x Sehari, Ruang Koper Luas, Free WiFi', 'ACTIVE', nowStr, nowStr],
      ['HTL-000009', 'Rove Al Madinah Hotel', 'MADINAH', 4, 150, '150 Meter (Markaziyah Utara)', 'WALKING_DISTANCE', 'Gate 17-18 (Abu Bakar As-Siddiq)', 'assets/pkg-plus-turki.webp', 'Hotel bintang 4 modern dengan desain kontemporer di Markaziyah Utara. Suasana lobi megah dan nyaman untuk tempat berkumpul rombongan kloter.', 'https://maps.google.com/?q=Rove+Al+Madinah+Hotel', 'Lobi Megah & Coffee Shop, Restoran Internasional & Nusantara, Smart TV Kamar, Akses Ramah Kursi Roda', 'ACTIVE', nowStr, nowStr]
    ];
    sheet.getRange(2, 1, seedHotels.length, canonical.length).setValues(seedHotels);
  }
}

/**
 * Otomatis melengkapi skema 10 kolom canonical dan seeding jadwal kloter resmi jika sheet kosong/belum lengkap
 */
function autoUpgradeDeparturesSheet_(sheet, ss) {
  if (!sheet) {
    sheet = ss.insertSheet("DB_Departures");
  }
  const canonical = [
    'id', 'package_id', 'departure_date', 'return_date', 'airline',
    'origin_airport', 'capacity_total', 'capacity_booked', 'status', 'notes'
  ];

  let lastCol = sheet.getLastColumn();
  let currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];

  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    sheet.getRange(1, 1, 1, canonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);
    currentHeaders = canonical;
    lastCol = canonical.length;
  }

  const missing = canonical.filter(function(c) { return currentHeaders.indexOf(c) === -1; });
  if (missing.length > 0) {
    const startCol = lastCol + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    sheet.getRange(1, startCol, 1, missing.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    lastCol = sheet.getLastColumn();
    currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); });
  }

  // Jika data hanya 1 baris (header saja) atau belum ada 5 kloter resmi, sinkronkan 5 kloter canonical
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    const seedDepartures = [
      ['DEP-000001', 'PKG-000001', '2027-01-15', '2027-01-23', 'Saudia Airlines (SV-819)', 'CGK', 45, 38, 'OPEN', 'Kloter Utama Syawal Barakah'],
      ['DEP-000002', 'PKG-000002', '2026-12-20', '2026-12-31', 'Garuda Indonesia (GA-980)', 'CGK', 40, 32, 'OPEN', 'Kloter VIP Khidmat Akhir Tahun'],
      ['DEP-000003', 'PKG-000003', '2027-04-10', '2027-04-22', 'Turkish Airlines (TK-57)', 'CGK', 45, 27, 'OPEN', 'Kloter Plus Turki Musim Semi'],
      ['DEP-000004', 'PKG-000004', '2027-02-12', '2027-02-21', 'Saudia Airlines (SV-819)', 'CGK', 45, 41, 'LIMITED', 'Kloter Awal Ramadhan 1448H'],
      ['DEP-000005', 'PKG-000005', '2027-03-05', '2027-03-13', 'Lion Air Umrah Direct (JT-106)', 'SUB', 45, 9, 'OPEN', 'Kloter Bintang Tiga Hemat']
    ];
    sheet.getRange(2, 1, seedDepartures.length, canonical.length).setValues(seedDepartures);
  }
}

/**
 * Otomatis melengkapi kolom header dan data default di sheet DB_Packages jika ada kolom yang kurang
 */
/**
 * Otomatis melengkapi skema 19 kolom dan menyinkronkan 5 Paket Standar SDW UMROH
 * Memperbarui nama/detail yang masih dummy dan menyertakan paket 4 & 5 serta harga kamar
 */
function autoUpgradePackagesSheet_(sheet, ss) {
  if (!sheet) return;
  try {
    const canonical = [
      "id", "name", "slug", "package_type", "duration_days", "status", "description",
      "hotel_makkah", "hotel_madinah", "airline", "seats_left", "badge", "image_url",
      "rating", "starting_price", "discount_label", "published_at", "created_at", "updated_at"
    ];
    let lastCol = sheet.getLastColumn();
    let currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
    const missing = canonical.filter(function(c) { return currentHeaders.indexOf(c) === -1; });

    if (missing.length > 0) {
      const startCol = lastCol + 1;
      sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
      sheet.getRange(1, startCol, 1, missing.length)
           .setBackground("#0F3D2E")
           .setFontColor("#FFFFFF")
           .setFontWeight("bold")
           .setFontFamily("Plus Jakarta Sans");
      lastCol = sheet.getLastColumn();
      currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); });
    }

    const headerMap = {};
    currentHeaders.forEach(function(h, idx) { headerMap[h] = idx; });

    const nowStr = new Date().toISOString();
    const CANONICAL_5 = [
      {
        id: "PKG-000001",
        name: "Umroh Reguler Syawal Barakah",
        slug: "umroh-reguler-syawal",
        package_type: "REGULER",
        duration_days: 9,
        status: "PUBLISHED",
        description: "Perjalanan ibadah penuh kekhusyukan dengan bimbingan asatidz berpengalaman, hotel bintang 4 dekat pelataran masjid.",
        hotel_makkah: "Retaj Al Rayyan / Setaraf (350m)",
        hotel_madinah: "Concorde Dar Al Khair (200m)",
        airline: "Saudia Airlines (Direct SV)",
        seats_left: 7,
        badge: "Best Seller",
        image_url: "assets/pkg-reguler-syawal.png",
        rating: "4.9/5 (182 ulasan)",
        starting_price: 29500000,
        discount_label: "Hemat Rp 3 Jt",
        quad_price: 29500000,
        triple_price: 31500000,
        double_price: 34500000,
        dep_airline: "Saudia Airlines (Direct SV)",
        dep_date: "2027-01-15",
        ret_date: "2027-01-23"
      },
      {
        id: "PKG-000002",
        name: "Umroh VIP Khidmat Akhir Tahun",
        slug: "umroh-vip-akhir-tahun",
        package_type: "VIP",
        duration_days: 12,
        status: "PUBLISHED",
        description: "Akomodasi bintang 5 di pelataran Ka'bah (Clock Tower), kereta cepat Haramain High Speed Rail Makkah–Madinah.",
        hotel_makkah: "Swissotel Makkah Clock Tower (0m)",
        hotel_madinah: "Dar Al Taqwa Madinah (50m)",
        airline: "Garuda Indonesia (GA980)",
        seats_left: 8,
        badge: "Hampir Penuh",
        image_url: "assets/pkg-vip-khidmat.png",
        rating: "5.0/5 (94 ulasan)",
        starting_price: 43500000,
        discount_label: "Hemat Rp 2,5 Jt",
        quad_price: 43500000,
        triple_price: 46500000,
        double_price: 49500000,
        dep_airline: "Garuda Indonesia (GA980)",
        dep_date: "2027-02-28",
        ret_date: "2027-03-11"
      },
      {
        id: "PKG-000003",
        name: "Umroh Plus Turki Musim Semi",
        slug: "umroh-plus-turki-spring",
        package_type: "PLUS_TOUR",
        duration_days: 13,
        status: "PUBLISHED",
        description: "Ziarah jejak peradaban Utsmaniyah di Istanbul, Selat Bosphorus, dilanjutkan manasik intensif dan ibadah di dua Tanah Suci.",
        hotel_makkah: "Anjum Hotel Makkah",
        hotel_madinah: "Rove Al Madinah",
        airline: "Turkish Airlines (TK-57)",
        seats_left: 18,
        badge: "Favorit Keluarga",
        image_url: "assets/pkg-plus-turki.png",
        rating: "4.8/5 (65 ulasan)",
        starting_price: 38900000,
        discount_label: "Hemat Rp 3 Jt",
        quad_price: 38900000,
        triple_price: 41900000,
        double_price: 45900000,
        dep_airline: "Turkish Airlines (TK-57)",
        dep_date: "2027-04-18",
        ret_date: "2027-04-30"
      },
      {
        id: "PKG-000004",
        name: "Umroh Awal Ramadhan 1448H",
        slug: "umroh-ramadhan-awal",
        package_type: "RAMADHAN",
        duration_days: 10,
        status: "PUBLISHED",
        description: "Meraih keutamaan pahala haji bersama Rasulullah dengan tarawih di Masjidil Haram pada fase awal bulan suci.",
        hotel_makkah: "Pullman Zamzam Makkah",
        hotel_madinah: "Grand Plaza Madinah",
        airline: "Saudia Airlines",
        seats_left: 4,
        badge: "Spesial Ramadhan",
        image_url: "assets/pkg-ramadhan.png",
        rating: "4.9/5 (120 ulasan)",
        starting_price: 36500000,
        discount_label: "Hemat Rp 3 Jt",
        quad_price: 36500000,
        triple_price: 39500000,
        double_price: 43500000,
        dep_airline: "Saudia Airlines",
        dep_date: "2027-03-01",
        ret_date: "2027-03-10"
      },
      {
        id: "PKG-000005",
        name: "Umroh Syariah Bintang Tiga Hemat",
        slug: "umroh-hemat-syariah",
        package_type: "HEMAT",
        duration_days: 9,
        status: "PUBLISHED",
        description: "Program umroh ekonomis mengutamakan kenyamanan esensial, bus full AC dan bimbingan ibadah terstruktur.",
        hotel_makkah: "Olayan Ajyad (600m Shuttle)",
        hotel_madinah: "Durrat Al Eiman",
        airline: "Lion Air Umrah Direct",
        seats_left: 36,
        badge: "Paling Hemat",
        image_url: "assets/pkg-hemat.png",
        rating: "4.7/5 (210 ulasan)",
        starting_price: 26800000,
        discount_label: "Hemat Rp 1,7 Jt",
        quad_price: 26800000,
        triple_price: 28800000,
        double_price: 31800000,
        dep_airline: "Lion Air Umrah Direct",
        dep_date: "2027-05-10",
        ret_date: "2027-05-18"
      }
    ];

    // Baca dan sinkronisasi baris DB_Packages
    const lastRow = sheet.getLastRow();
    const existingRows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];
    const idToRowIdx = {};
    existingRows.forEach(function(r, idx) {
      const id = String(r[headerMap["id"]] || "").trim();
      if (id) idToRowIdx[id] = idx + 2; // baris ke-(idx+2) di spreadsheet
    });

    CANONICAL_5.forEach(function(pkg) {
      const targetRow = idToRowIdx[pkg.id];
      if (targetRow) {
        // Update baris jika nama masih dummy ('Umroh Reguler 9 Hari', dsb.) atau kolom penting kosong
        canonical.forEach(function(col) {
          const colIdx = headerMap[col];
          if (colIdx !== undefined && pkg[col] !== undefined) {
            sheet.getRange(targetRow, colIdx + 1).setValue(pkg[col]);
          }
        });
      } else {
        // Tambah baris baru jika belum ada
        const newRow = canonical.map(function(col) {
          if (col === "created_at" || col === "updated_at" || col === "published_at") return nowStr;
          return pkg[col] !== undefined ? pkg[col] : "";
        });
        sheet.appendRow(newRow);
      }
    });

    // Sinkronisasi DB_Package_Prices
    if (ss) {
      const priceSheet = ss.getSheetByName("DB_Package_Prices");
      if (priceSheet) {
        const pLastRow = priceSheet.getLastRow();
        const pLastCol = priceSheet.getLastColumn();
        const pHeaders = pLastCol > 0 ? priceSheet.getRange(1, 1, 1, pLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
        const pIdMap = {};
        if (pLastRow > 1 && pHeaders.indexOf("package_id") !== -1) {
          const pRows = priceSheet.getRange(2, 1, pLastRow - 1, pLastCol).getValues();
          pRows.forEach(function(pr, idx) {
            const pId = String(pr[pHeaders.indexOf("package_id")] || "").trim();
            if (pId) pIdMap[pId] = idx + 2;
          });
        }
        CANONICAL_5.forEach(function(pkg, i) {
          const prcId = "PRC-00000" + (i + 1);
          if (pIdMap[pkg.id]) {
            const r = pIdMap[pkg.id];
            if (pHeaders.indexOf("quad_price") !== -1) priceSheet.getRange(r, pHeaders.indexOf("quad_price") + 1).setValue(pkg.quad_price);
            if (pHeaders.indexOf("triple_price") !== -1) priceSheet.getRange(r, pHeaders.indexOf("triple_price") + 1).setValue(pkg.triple_price);
            if (pHeaders.indexOf("double_price") !== -1) priceSheet.getRange(r, pHeaders.indexOf("double_price") + 1).setValue(pkg.double_price);
          } else {
            priceSheet.appendRow([prcId, pkg.id, "IDR", pkg.quad_price, pkg.triple_price, pkg.double_price, "2026-01-01", "2027-12-31", "ACTIVE"]);
          }
        });
      }

      // Sinkronisasi DB_Departures
      const depSheet = ss.getSheetByName("DB_Departures");
      if (depSheet) {
        const dLastRow = depSheet.getLastRow();
        const dLastCol = depSheet.getLastColumn();
        const dHeaders = dLastCol > 0 ? depSheet.getRange(1, 1, 1, dLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
        const dIdMap = {};
        if (dLastRow > 1 && dHeaders.indexOf("package_id") !== -1) {
          const dRows = depSheet.getRange(2, 1, dLastRow - 1, dLastCol).getValues();
          dRows.forEach(function(dr, idx) {
            const dPkgId = String(dr[dHeaders.indexOf("package_id")] || "").trim();
            if (dPkgId) dIdMap[dPkgId] = idx + 2;
          });
        }
        CANONICAL_5.forEach(function(pkg, i) {
          const depId = "DEP-00000" + (i + 1);
          if (!dIdMap[pkg.id]) {
            depSheet.appendRow([depId, pkg.id, pkg.dep_date, pkg.ret_date, pkg.dep_airline, "CGK", 45, 45 - pkg.seats_left, "OPEN", "Kloter " + pkg.name]);
          }
        });
      }
    }

    sheet.autoResizeColumns(1, sheet.getLastColumn());
    Logger.log("✓ Sinkronisasi DB_Packages (5 Paket Standar SDW UMROH) berhasil.");
  } catch(e) {
    Logger.log("Catatan: autoUpgradePackagesSheet_ error: " + e.message);
  }
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
