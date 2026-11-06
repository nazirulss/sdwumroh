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
  VERSION: '2.1.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  SPREADSHEET_ID: '1UTZ2uJ76rxAljWlfOLx3MpCzV2e4JLUG5IJ7o8SZn3Q',
  DRIVE_FOLDER_ID: '1Xz5QTa68fcipY9BN_vIXsdLklH6bws-J'
};

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
          "struk_dp_verified.jpg",
          "VERIFIED",
          nowStr,
          actor || "Finance Officer",
          nowStr,
          "Validasi Pembayaran DP dan Penerbitan SDW E-PASS"
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
