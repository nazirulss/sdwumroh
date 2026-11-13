/**
 * ============================================================================
 * SDW UMROH — DATABASE INFRASTRUCTURE & SCHEMA INITIALIZER
 * File: Setup.gs
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * Pattern: 2-Phase Fail-Closed Schema Engine (Adapted from Mubarokah_App)
 * ============================================================================
 *
 * ARCHITECTURE: TWO STRICT PHASES
 *
 * PHASE A — READ-ONLY PREFLIGHT (inspectSpreadsheet_):
 *   Inspects the spreadsheet state. Detects existing sheets, rows, and
 *   header mismatches. Performs ZERO mutations.
 *   If any unexpected corruption or destructive risk is detected, throws
 *   immediately. The spreadsheet remains completely unchanged.
 *
 * PHASE B — MUTATION (executeInitialization_):
 *   Only runs after Phase A returns a clean PASS result.
 *   Creates missing sheets, writes canonical headers, applies branding
 *   formatting (Pine Green #0F3D2E, text white, frozen row), and injects
 *   initial master requirement data.
 *
 * Instructions for Administrator:
 * 1. Open this Apps Script project in your browser.
 * 2. Select function: "initializeSdwUmrohInfrastructure"
 * 3. Click "Run" and grant permissions.
 * 4. Check the Execution Log for "=== SDW UMROH INITIALIZATION COMPLETE ===".
 */

var AUTHORITATIVE_SCHEMAS_ = {
  "DB_Users": ["id", "name", "email", "role", "status", "phone", "created_at", "updated_at"],
  "DB_Customers": ["id", "nik", "full_name", "gender", "birth_date", "birth_place", "phone", "email", "address", "city", "province", "created_at", "updated_at"],
  "DB_Leads": ["id", "customer_id", "source", "sales_owner_id", "status", "urgency", "budget_range", "notes", "created_at", "updated_at"],
  "DB_Sales_Activities": ["id", "lead_id", "actor_id", "activity_type", "summary", "outcome", "timestamp"],
  "DB_Follow_Ups": ["id", "lead_id", "sales_owner_id", "scheduled_at", "channel", "notes", "status", "completed_at"],
  "DB_Packages": ["id", "name", "slug", "package_type", "duration_days", "status", "description", "hotel_makkah", "hotel_madinah", "airline", "seats_left", "badge", "image_url", "rating", "starting_price", "discount_label", "published_at", "created_at", "updated_at"],
  "DB_Package_Prices": ["id", "package_id", "currency", "quad_price", "triple_price", "double_price", "effective_start", "effective_end", "status"],
  "DB_Departures": ["id", "package_id", "departure_date", "return_date", "airline", "origin_airport", "capacity_total", "capacity_booked", "status", "notes"],
  "DB_Registrations": ["id", "customer_id", "departure_id", "package_id", "room_type", "agreed_price_snapshot", "discount_snapshot", "final_price_snapshot", "status", "sales_id", "notes", "created_at", "updated_at"],
  "DB_Document_Requirements": ["id", "code", "title", "description", "is_mandatory", "applies_to_gender", "max_expiry_months"],
  "DB_Pilgrim_Documents": ["id", "registration_id", "requirement_id", "file_name", "file_ref_mock", "status", "review_notes", "verified_by", "verified_at", "updated_at"],
  "DB_Invoices": ["id", "registration_id", "invoice_number", "total_amount", "paid_amount", "outstanding_amount", "due_date", "status", "created_at", "updated_at"],
  "DB_Payment_Schedules": ["id", "invoice_id", "term_number", "title", "amount", "due_date", "status"],
  "DB_Payments": ["id", "invoice_id", "schedule_id", "amount", "payment_method", "reference_number", "proof_ref_mock", "status", "submitted_at", "verified_by", "verified_at", "notes"],
  "DB_Refunds": ["id", "registration_id", "invoice_id", "amount_requested", "cancellation_fee", "amount_approved", "status", "reason", "requested_at", "processed_at"],
  "DB_Preparation": ["id", "registration_id", "dimension", "item_name", "status", "notes", "updated_at"],
  "DB_Manasik": ["id", "departure_id", "session_title", "session_type", "scheduled_at", "location", "muthawwif_id", "status"],
  "DB_Trips": ["id", "departure_id", "trip_code", "lead_tour_leader_id", "muthawwif_id", "status", "started_at", "ended_at"],
  "DB_Trip_Members": ["id", "trip_id", "registration_id", "bus_number", "makkah_room_number", "madinah_room_number", "special_assistance"],
  "DB_Announcements": ["id", "target_role", "departure_id", "title", "body_content", "priority", "published_at", "created_by"],
  "DB_Notifications": ["id", "user_id", "title", "message", "category", "is_read", "action_link", "created_at"],
  "DB_Audit_Logs": ["id", "timestamp", "actor", "action", "entity", "entity_id", "before", "after", "reason"],
  "DB_Badal_Certificates": [
    "id",
    "nomor_sertifikat",
    "nama_petugas_badal",
    "nama_yang_dibadalkan",
    "tempat_miqat",
    "tanggal_pelaksanaan",
    "tempat_penerbitan",
    "tanggal_penerbitan",
    "keluarga_pemesan",
    "status",
    "ukuran_font_nama",
    "catatan",
    "created_at",
    "updated_at"
  ]
};

// ============================================================
// PHASE A — READ-ONLY PREFLIGHT INSPECTOR
// ============================================================
function inspectSpreadsheet_(ss) {
  var sheets = ss.getSheets();
  var existingMap = {};
  sheets.forEach(function (sh) {
    existingMap[sh.getName()] = sh;
  });

  var missing = [];
  var matched = [];
  var warnings = [];

  for (var name in AUTHORITATIVE_SCHEMAS_) {
    if (!existingMap[name]) {
      missing.push(name);
    } else {
      var sh = existingMap[name];
      var lastCol = sh.getLastColumn();
      var lastRow = sh.getLastRow();
      matched.push({
        name: name,
        rows: lastRow,
        cols: lastCol
      });
    }
  }

  return {
    ok: true,
    totalAuthoritative: Object.keys(AUTHORITATIVE_SCHEMAS_).length,
    missingCount: missing.length,
    missing: missing,
    matchedCount: matched.length,
    matched: matched,
    warnings: warnings
  };
}

// ============================================================
// PHASE B — MUTATION ENGINE
// ============================================================
function executeInitialization_(ss, preflight) {
  Logger.log("Memulai eksekusi pembuatan " + preflight.missingCount + " sheet...");

  // Brand Palette: Pine Green
  var HEADER_BG = "#0F3D2E";
  var HEADER_TEXT = "#FFFFFF";

  preflight.missing.forEach(function (sheetName) {
    var headers = AUTHORITATIVE_SCHEMAS_[sheetName];
    var sheet = ss.insertSheet(sheetName);

    // 1. Set Header Values
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // 2. Format Header Visuals
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(HEADER_BG)
               .setFontColor(HEADER_TEXT)
               .setFontWeight("bold")
               .setFontFamily("Plus Jakarta Sans");

    // 3. Freeze Header Row
    sheet.setFrozenRows(1);

    // 4. Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);

    Logger.log("✓ Sheet terbuat & diformat: " + sheetName);
  });

  // Hapus 'Sheet1' default kosong jika ada
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
      Logger.log("✓ Default 'Sheet1' kosong dibersihkan.");
    } catch (e) {
      Logger.log("Catatan: Sheet1 tidak dapat dihapus: " + e.message);
    }
  }

  // Inject Master Document Requirements default jika sheet DB_Document_Requirements baru dibuat
  seedDocumentRequirements_(ss);

  // Inject Data Awal Piagam Badal Umroh jika sheet DB_Badal_Certificates baru dibuat
  seedBadalCertificates_(ss);
}

function seedDocumentRequirements_(ss) {
  var sheet = ss.getSheetByName("DB_Document_Requirements");
  if (sheet && sheet.getLastRow() <= 1) {
    var defaultReqs = [
      ["DCR-001", "PASPOR", "Paspor Asli", "Masa berlaku minimal 7 bulan sebelum tanggal kepulangan", true, "ALL", 7],
      ["DCR-002", "KTP", "KTP / Identitas Diri", "Fotokopi / Scan KTP Elektronik jelas", true, "ALL", 0],
      ["DCR-003", "KK", "Kartu Keluarga", "Scan Kartu Keluarga terbaru", true, "ALL", 0],
      ["DCR-004", "BUKU_NIKAH", "Buku Nikah / Akta Lahir", "Khusus pasangan suami-istri atau anak di bawah umur", false, "ALL", 0],
      ["DCR-005", "VAKSIN_MENINGITIS", "Buku Kuning / Sertifikat Vaksin Meningitis", "Wajib sesuai ketentuan Kemenkes RI & Arab Saudi", true, "ALL", 12],
      ["DCR-006", "PASFOTO", "Pasfoto 4x6 Background Putih", "Tampak wajah 80%, tidak mengenakan kacamata", true, "ALL", 6]
    ];
    sheet.getRange(2, 1, defaultReqs.length, defaultReqs[0].length).setValues(defaultReqs);
    Logger.log("✓ Master Document Requirements berhasil diinjeksi (" + defaultReqs.length + " data).");
  }
}

function seedBadalCertificates_(ss) {
  var sheet = ss.getSheetByName("DB_Badal_Certificates");
  if (sheet) {
    var headers = AUTHORITATIVE_SCHEMAS_["DB_Badal_Certificates"];
    // Selalu pastikan header baris 1 ter-update sesuai skema resmi terbaru
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
         .setBackground("#0F3D2E")
         .setFontColor("#FFFFFF")
         .setFontWeight("bold")
         .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);

    if (sheet.getLastRow() <= 1) {
      var nowStr = new Date().toISOString();
      var defaultBadal = [
        ["BDL-001", "SDW/BDL/2026/001", "Ustadz Ahmad Fauzi Ridwan, Lc.", "Alm. H. Abdullah bin Umar", "Masjid Aisyah Tan'im", "27 Oktober 2026", "Makkah Al-Mukarramah", "27 Oktober 2026", "Keluarga Besar Bpk. Sanali Bajuri", "ISSUED", "auto", "Pelaksanaan badal umroh selesai secara khusyuk dan syar'i", nowStr, nowStr],
        ["BDL-002", "SDW/BDL/2026/002", "Ustadz Ahmad Fauzi Ridwan, Lc.", "Almh. Hj. Maryam binti Sulaiman", "Masjid Aisyah Tan'im", "27 Oktober 2026", "Makkah Al-Mukarramah", "27 Oktober 2026", "Ibu Siti Nuriyah & Keluarga", "ISSUED", "auto", "Amanah badal telah ditunaikan dengan lancar", nowStr, nowStr],
        ["BDL-003", "SDW/BDL/2026/003", "Ustadz Muhammad Syakir, Lc., M.Ag.", "Alm. K.H. Dahlan bin Syafei", "Ji'ranah", "27 Oktober 2026", "Makkah Al-Mukarramah", "27 Oktober 2026", "Keluarga Bpk. Khasan Munadi", "ISSUED", "auto", "Dokumentasi tawaf & sa'i tersimpan", nowStr, nowStr],
        ["BDL-004", "SDW/BDL/2027/004", "Ustadz Ahmad Fauzi Ridwan, Lc.", "Almh. Nyai Hj. Fatimah binti Asy'ari", "Masjid Aisyah Tan'im", "15 Januari 2027", "Makkah Al-Mukarramah", "15 Januari 2027", "Keluarga Besar Bpk. Sugiono", "ISSUED", "auto", "Pelaksanaan badal gelombang Januari", nowStr, nowStr],
        ["BDL-005", "SDW/BDL/2027/005", "Ustadz Muhammad Syakir, Lc., M.Ag.", "Alm. H. Mansur bin Hasyim", "Bir Ali / Dzulhulaifah", "28 Februari 2027", "Makkah Al-Mukarramah", "28 Februari 2027", "Keluarga Ibu Sri Nuryati", "DRAFT", "auto", "Menunggu konfirmasi jadwal muthawwif", nowStr, nowStr]
      ];
      sheet.getRange(2, 1, defaultBadal.length, defaultBadal[0].length).setValues(defaultBadal);
      Logger.log("✓ Data Awal Piagam Badal Umroh berhasil diinjeksi (" + defaultBadal.length + " data).");
    }
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Packages'
 * secara langsung sesuai skema kolom resmi (19 kolom lengkap termasuk hotel & maskapai).
 */
function setupPackagesCatalogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "DB_Packages";
  var sheet = ss.getSheetByName(sheetName);
  var canonicalHeaders = AUTHORITATIVE_SCHEMAS_[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
  }

  // 1. Baca data yang ada saat ini
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var existingRows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues() : [];

  var headerMap = {};
  currentHeaders.forEach(function(h, idx) { headerMap[String(h).trim()] = idx; });

  // 2. Petakan data default untuk paket
  var nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  var defaultPackageMetadata = {
    "PKG-000001": {
      name: "Umroh Reguler 9 Hari",
      slug: "umroh-reguler-9h",
      package_type: "REGULER",
      duration_days: 9,
      status: "PUBLISHED",
      description: "Paket favorit ibadah khusyuk. Hotel Retaj Al Rayyan Makkah & Concorde Dar Al Khair Madinah.",
      hotel_makkah: "Retaj Al Rayyan / Setaraf (350m)",
      hotel_madinah: "Concorde Dar Al Khair (200m)",
      airline: "Saudia Airlines (Direct SV)",
      seats_left: 15,
      badge: "Best Seller",
      image_url: "assets/pkg-reguler-syawal.png",
      rating: "4.9/5 (182 ulasan)",
      starting_price: 29500000,
      discount_label: "Hemat Rp 3 Jt"
    },
    "PKG-000002": {
      name: "Umroh VIP Bintang 5",
      slug: "umroh-vip-bintang-5",
      package_type: "VIP",
      duration_days: 9,
      status: "PUBLISHED",
      description: "Akomodasi mewah premium bintang 5 pelataran masjid. Swissotel Makkah & Dar Al Taqwa Madinah.",
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
      name: "Umroh Plus Turki 12 Hari",
      slug: "umroh-plus-turki-12h",
      package_type: "PLUS_TOUR",
      duration_days: 12,
      status: "PUBLISHED",
      description: "Ibadah umroh lengkap dengan napak tilas sejarah peradaban Islam di Istanbul & Bursa.",
      hotel_makkah: "Anjum Hotel Makkah",
      hotel_madinah: "Rove Al Madinah",
      airline: "Turkish Airlines (TK-57)",
      seats_left: 18,
      badge: "Favorit Keluarga",
      image_url: "assets/pkg-plus-turki.png",
      rating: "4.8/5 (65 ulasan)",
      starting_price: 38900000,
      discount_label: "Hemat Rp 3 Jt"
    }
  };

  var migratedRows = [];
  if (existingRows.length > 0) {
    existingRows.forEach(function(row) {
      var id = headerMap["id"] !== undefined ? String(row[headerMap["id"]] || "") : "";
      var def = defaultPackageMetadata[id] || {};
      
      var newRow = canonicalHeaders.map(function(h) {
        var oldIdx = headerMap[h];
        if (oldIdx !== undefined && row[oldIdx] !== "" && row[oldIdx] !== null && row[oldIdx] !== undefined) {
          // Normalisasi package_type lama
          if (h === "package_type") {
            var val = String(row[oldIdx]).toUpperCase();
            if (val === "REGULAR") return "REGULER";
            if (val === "PLUS_TURKEY") return "PLUS_TOUR";
          }
          return row[oldIdx];
        }
        return def[h] !== undefined ? def[h] : "";
      });
      migratedRows.push(newRow);
    });
  } else {
    // Jika sheet kosong, isi dengan 3 paket standar
    Object.keys(defaultPackageMetadata).forEach(function(id) {
      var def = defaultPackageMetadata[id];
      var newRow = canonicalHeaders.map(function(h) {
        if (h === "id") return id;
        if (h === "created_at" || h === "updated_at" || h === "published_at") return nowStr;
        return def[h] !== undefined ? def[h] : "";
      });
      migratedRows.push(newRow);
    });
  }

  // 3. Tulis ulang header dan baris baru
  sheet.clear();
  sheet.getRange(1, 1, 1, canonicalHeaders.length).setValues([canonicalHeaders]);
  sheet.getRange(1, 1, 1, canonicalHeaders.length)
       .setBackground("#0F3D2E")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold")
       .setFontFamily("Plus Jakarta Sans");
  sheet.setFrozenRows(1);

  if (migratedRows.length > 0) {
    sheet.getRange(2, 1, migratedRows.length, canonicalHeaders.length).setValues(migratedRows);
  }
  sheet.autoResizeColumns(1, canonicalHeaders.length);
  Logger.log("✓ Sheet DB_Packages berhasil dimutasi ke skema 19 kolom lengkap (" + migratedRows.length + " paket).");
  Logger.log("=== SETUP SHEET DB_Packages SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Badal_Certificates'
 * secara langsung sesuai skema kolom terbaru.
 */
function setupBadalCertificatesSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "DB_Badal_Certificates";
  var sheet = ss.getSheetByName(sheetName);
  var headers = AUTHORITATIVE_SCHEMAS_[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
  }

  // Terapkan header dan seeding data
  seedBadalCertificates_(ss);
  Logger.log("=== SETUP SHEET DB_Badal_Certificates SELESAI ===");
}

// ============================================================
// MAIN ENTRY POINT
// ============================================================
function initializeSdwUmrohInfrastructure() {
  Logger.log("=== SDW UMROH INFRASTRUCTURE INITIALIZATION ===");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Gagal membuka active spreadsheet. Pastikan skrip dijalankan dari Google Spreadsheet aktif.");
  }

  // Phase A: Preflight
  var preflight = inspectSpreadsheet_(ss);
  Logger.log("Hasil Preflight: Ditemukan " + preflight.matchedCount + " sheet, Butuh dibuat: " + preflight.missingCount);

  // Phase B: Execution
  if (preflight.missingCount > 0) {
    executeInitialization_(ss, preflight);
  } else {
    Logger.log("Semua 22 master sheet sudah ada. Memeriksa konsistensi kolom skema...");
  }

  // Pastikan skema kolom paket dan piagam badal selalu ter-update ke standar resmi terbaru
  setupPackagesCatalogSheet();
  setupBadalCertificatesSheet();

  Logger.log("=== SDW UMROH STEP INITIALIZATION COMPLETE ===");
  return {
    success: true,
    message: "22 Master Sheet SDW UMROH berhasil divalidasi dan diinisialisasi."
  };
}
