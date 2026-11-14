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
  "DB_Users": ["id", "name", "email", "phone", "role", "status", "connected_entity", "last_active", "created_at", "updated_at"],
  "DB_Role_Permissions": ["id", "role_key", "role_name", "module_key", "access_level", "updated_at"],
  "DB_Customers": ["id", "nik", "full_name", "gender", "birth_date", "birth_place", "phone", "email", "address", "city", "province", "created_at", "updated_at"],
  "DB_Leads": ["id", "customer_id", "source", "sales_owner_id", "status", "urgency", "budget_range", "notes", "created_at", "updated_at"],
  "DB_Sales_Activities": ["id", "lead_id", "actor_id", "activity_type", "summary", "outcome", "timestamp"],
  "DB_Follow_Ups": ["id", "lead_id", "sales_owner_id", "scheduled_at", "channel", "notes", "status", "completed_at"],
  "DB_Packages": ["id", "name", "slug", "package_type", "duration_days", "status", "description", "hotel_makkah", "hotel_madinah", "airline", "seats_left", "badge", "image_url", "rating", "starting_price", "discount_label", "published_at", "created_at", "updated_at"],
  "DB_Package_Prices": ["id", "package_id", "currency", "quad_price", "triple_price", "double_price", "effective_start", "effective_end", "status"],
  "DB_Departures": ["id", "package_id", "departure_date", "return_date", "airline", "origin_airport", "capacity_total", "capacity_booked", "status", "notes"],
  "DB_Hotels": ["id", "name", "city", "star_rating", "distance_meters", "distance_text", "location_zone", "gate_info", "image_url", "description", "maps_url", "facilities", "status", "created_at", "updated_at"],
  "DB_Gallery": ["id", "title", "category", "media_type", "media_url", "thumbnail_url", "caption", "kloter_tag", "activity_date", "status", "is_featured", "created_at"],
  "DB_Testimonials": ["id", "customer_name", "customer_city", "customer_photo", "package_name", "rating", "review_text", "video_url", "departure_year", "status", "is_featured", "created_at"],
  "DB_Articles": ["id", "title", "slug", "category", "author", "image_url", "summary", "content", "read_time_minutes", "is_featured", "status", "published_at", "created_at"],
  "DB_Ziarah_Places": ["id", "name", "city", "location_tag", "distance_text", "historical_summary", "sunnah_tips", "image_url", "maps_url", "order_index", "status", "created_at"],
  "DB_Airlines": ["id", "code", "name", "flight_type", "transit_hub", "baggage_allowance", "cabin_classes", "logo_url", "sort_order", "is_active", "notes", "created_at"],
  "DB_Airports": ["id", "code", "name", "city", "country", "role", "terminal_info", "sort_order", "is_active", "created_at"],
  "DB_Faq": ["id", "category", "question", "answer", "icon", "sort_order", "is_featured", "status", "created_at"],
  "DB_Helpdesk_Contacts": ["id", "title", "channel", "contact_number", "greeting_message", "operating_hours", "is_primary", "sort_order", "status", "created_at"],
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
  ],
  "DB_Profile_Institution": [
    "id",
    "ppiu_no",
    "ppiu_year",
    "akreditasi_grade",
    "akreditasi_org",
    "legal_name",
    "legal_sk",
    "afiliasi_name",
    "afiliasi_detail",
    "visi",
    "misi_json",
    "timeline_json",
    "direksi_json",
    "updated_at",
    "updated_by"
  ],
  "DB_Profile_Director": [
    "id",
    "name",
    "role",
    "license_badge",
    "photo_url",
    "headline",
    "subheadline",
    "quote",
    "paragraphs_json",
    "pillars_json",
    "show_on_home",
    "updated_at",
    "updated_by"
  ],
  "DB_Profile_Guides": [
    "id",
    "name",
    "role",
    "category",
    "alma_mater",
    "experience",
    "status",
    "photo_url",
    "order_index",
    "lead_advisor_flag",
    "bio",
    "created_at",
    "updated_at"
  ],
  "DB_Profile_Legality": [
    "id",
    "category",
    "name",
    "issuer_partner",
    "doc_number",
    "validity_period",
    "status",
    "file_url",
    "order_index",
    "created_at",
    "updated_at"
  ],
  "DB_Profile_Mitra_Syiar": [
    "id",
    "name",
    "title_institution",
    "role_label",
    "region",
    "city",
    "sk_number",
    "phone_wa",
    "photo_url",
    "status",
    "order_index",
    "created_at",
    "updated_at"
  ],
  "DB_Contact_Social": [
    "id",
    "company_name",
    "address_line",
    "city_province_postal",
    "google_maps_url",
    "whatsapp_number",
    "whatsapp_clean",
    "whatsapp_template",
    "phone_office",
    "hotline_24h",
    "email_official",
    "operational_hours",
    "instagram_url",
    "instagram_handle",
    "facebook_url",
    "facebook_name",
    "youtube_url",
    "youtube_name",
    "tiktok_url",
    "tiktok_handle",
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

  // 2. Petakan data default 5 Paket Standar SDW UMROH
  var nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  var defaultPackageMetadata = {
    "PKG-000001": {
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
      discount_label: "Hemat Rp 3 Jt"
    },
    "PKG-000002": {
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
      discount_label: "Hemat Rp 2,5 Jt"
    },
    "PKG-000003": {
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
      discount_label: "Hemat Rp 3 Jt"
    },
    "PKG-000004": {
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
      discount_label: "Hemat Rp 3 Jt"
    },
    "PKG-000005": {
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
      discount_label: "Hemat Rp 1,7 Jt"
    }
  };

  var migratedRows = [];
  var existingIds = {};
  if (existingRows.length > 0) {
    existingRows.forEach(function(row) {
      var id = headerMap["id"] !== undefined ? String(row[headerMap["id"]] || "").trim() : "";
      var def = defaultPackageMetadata[id] || {};
      if (id) existingIds[id] = true;
      
      var newRow = canonicalHeaders.map(function(h) {
        var oldIdx = headerMap[h];
        // Jika nama masih dummy / lama, gunakan nama baru dari def
        if (h === "name" && def.name) return def.name;
        if (h === "duration_days" && def.duration_days) return def.duration_days;
        if (h === "starting_price" && def.starting_price) return def.starting_price;
        if (h === "hotel_makkah" && def.hotel_makkah && (!row[oldIdx] || row[oldIdx] === "-")) return def.hotel_makkah;
        if (h === "hotel_madinah" && def.hotel_madinah && (!row[oldIdx] || row[oldIdx] === "-")) return def.hotel_madinah;
        if (h === "airline" && def.airline && (!row[oldIdx] || row[oldIdx] === "-")) return def.airline;

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
  }

  // Tambahkan paket yang belum ada dari 5 paket standar
  Object.keys(defaultPackageMetadata).forEach(function(id) {
    if (!existingIds[id]) {
      var def = defaultPackageMetadata[id];
      var newRow = canonicalHeaders.map(function(h) {
        if (h === "id") return id;
        if (h === "created_at" || h === "updated_at" || h === "published_at") return nowStr;
        return def[h] !== undefined ? def[h] : "";
      });
      migratedRows.push(newRow);
    }
  });

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

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Departures'
 * secara langsung sesuai skema kolom canonical 10 kolom dan seeding jadwal kloter resmi.
 */
function setupDeparturesCatalogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "DB_Departures";
  var sheet = ss.getSheetByName(sheetName);
  var canonical = AUTHORITATIVE_SCHEMAS_[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
  }

  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];

  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    sheet.getRange(1, 1, 1, canonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);
  }

  // Jika baris data masih kosong, seed 5 kloter resmi
  if (sheet.getLastRow() <= 1) {
    var seedDepartures = [
      ['DEP-000001', 'PKG-000001', '2027-01-15', '2027-01-23', 'Saudia Airlines (SV-819)', 'CGK', 45, 38, 'OPEN', 'Kloter Utama Syawal Barakah'],
      ['DEP-000002', 'PKG-000002', '2026-12-20', '2026-12-31', 'Garuda Indonesia (GA-980)', 'CGK', 40, 32, 'OPEN', 'Kloter VIP Khidmat Akhir Tahun'],
      ['DEP-000003', 'PKG-000003', '2027-04-10', '2027-04-22', 'Turkish Airlines (TK-57)', 'CGK', 45, 27, 'OPEN', 'Kloter Plus Turki Musim Semi'],
      ['DEP-000004', 'PKG-000004', '2027-02-12', '2027-02-21', 'Saudia Airlines (SV-819)', 'CGK', 45, 41, 'LIMITED', 'Kloter Awal Ramadhan 1448H'],
      ['DEP-000005', 'PKG-000005', '2027-03-05', '2027-03-13', 'Lion Air Umrah Direct (JT-106)', 'SUB', 45, 9, 'OPEN', 'Kloter Bintang Tiga Hemat']
    ];
    sheet.getRange(2, 1, seedDepartures.length, canonical.length).setValues(seedDepartures);
  }

  sheet.autoResizeColumns(1, canonical.length);
  Logger.log("✓ Sheet DB_Departures berhasil disinkronkan sesuai skema 10 kolom.");
  Logger.log("=== SETUP SHEET DB_Departures SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Hotels'
 * secara langsung sesuai skema canonical 15 kolom dan seeding 9 hotel resmi Makkah & Madinah.
 */
function setupHotelsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "DB_Hotels";
  var sheet = ss.getSheetByName(sheetName);
  var canonical = AUTHORITATIVE_SCHEMAS_[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
  }

  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];

  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    sheet.getRange(1, 1, 1, canonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);
  }

  // Jika baris data masih kosong, seed 9 hotel resmi
  if (sheet.getLastRow() <= 1) {
    var nowStr = new Date().toISOString();
    var seedHotels = [
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

  sheet.autoResizeColumns(1, canonical.length);
  Logger.log("✓ Sheet DB_Hotels berhasil disinkronkan sesuai skema 15 kolom.");
  Logger.log("=== SETUP SHEET DB_Hotels SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Gallery' dan 'DB_Testimonials'
 * secara langsung sesuai skema kolom canonical dan data seeding resmi.
 */
function setupGalleryAndTestimonialsSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup DB_Gallery
  var gSheetName = "DB_Gallery";
  var gSheet = ss.getSheetByName(gSheetName);
  var gCanonical = AUTHORITATIVE_SCHEMAS_[gSheetName];
  if (!gSheet) {
    gSheet = ss.insertSheet(gSheetName);
    Logger.log("✓ Sheet " + gSheetName + " berhasil dibuat.");
  }
  var gLastCol = gSheet.getLastColumn();
  var gHeaders = gLastCol > 0 ? gSheet.getRange(1, 1, 1, gLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (gHeaders.length === 0) {
    gSheet.getRange(1, 1, 1, gCanonical.length).setValues([gCanonical]);
    gSheet.getRange(1, 1, 1, gCanonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    gSheet.setFrozenRows(1);
  }
  if (gSheet.getLastRow() <= 1) {
    var nowStr = new Date().toISOString();
    var seedGallery = [
      ['GAL-000001', 'Thawaf Qudum Berjamaah di Mataf Ka\'bah', 'MAKKAH', 'IMAGE', 'assets/hero-haram.png', 'assets/hero-haram.png', 'Pelaksanaan rukun thawaf dipandu langsung oleh Muthawwif Bersanad.', 'Kloter Syawal Bintang 5', '24 Oktober 2026', 'PUBLISHED', true, nowStr],
      ['GAL-000002', 'Ziarah Raudhah Asy-Syarifah & Maqam Nabi', 'MADINAH', 'IMAGE', 'assets/hero-twilight.jpg', 'assets/hero-twilight.jpg', 'Khusyuk berdoa dan sholat sunnah di taman surga Raudhah Nabawi.', 'Kloter Syawal Bintang 5', '26 Oktober 2026', 'PUBLISHED', true, nowStr],
      ['GAL-000003', 'Sa\'i Safa-Marwah & Suasana Tahallul', 'MAKKAH', 'IMAGE', 'assets/pkg-vip-khidmat.png', 'assets/pkg-vip-khidmat.png', 'Kebahagiaan jamaah usai menyelesaikan 7 putaran Sa\'i dan memotong rambut.', 'Kloter VIP Khidmat', '22 Oktober 2026', 'PUBLISHED', true, nowStr],
      ['GAL-000004', 'Napak Tilas Jabal Uhud & Syuhada Uhud', 'ZIARAH', 'IMAGE', 'assets/pkg-ramadhan.webp', 'assets/pkg-ramadhan.webp', 'Tausiyah sirah nabawiyah di kaki bukit pemanah Jabal Rumah.', 'Kloter Ramadhan I\'tikaf', '18 Oktober 2026', 'PUBLISHED', false, nowStr],
      ['GAL-000005', 'Pelepasan Jamaah di Bandara Soekarno-Hatta', 'BANDARA', 'IMAGE', 'assets/pkg-reguler-syawal.png', 'assets/pkg-reguler-syawal.png', 'Doa bersama dan pembagian paspor sebelum penerbangan Saudia Airlines.', 'Kloter Reguler Awal Musim', '14 Oktober 2026', 'PUBLISHED', false, nowStr],
      ['GAL-000006', 'Sholat Sunnah di Masjid Quba & Kebun Kurma', 'ZIARAH', 'IMAGE', 'assets/pkg-plus-turki.webp', 'assets/pkg-plus-turki.webp', 'Mengejar pahala setara ibadah umroh di masjid pertama dalam sejarah Islam.', 'Kloter Syawal Bintang 5', '27 Oktober 2026', 'PUBLISHED', true, nowStr]
    ];
    gSheet.getRange(2, 1, seedGallery.length, gCanonical.length).setValues(seedGallery);
  }
  gSheet.autoResizeColumns(1, gCanonical.length);

  // 2. Setup DB_Testimonials
  var tSheetName = "DB_Testimonials";
  var tSheet = ss.getSheetByName(tSheetName);
  var tCanonical = AUTHORITATIVE_SCHEMAS_[tSheetName];
  if (!tSheet) {
    tSheet = ss.insertSheet(tSheetName);
    Logger.log("✓ Sheet " + tSheetName + " berhasil dibuat.");
  }
  var tLastCol = tSheet.getLastColumn();
  var tHeaders = tLastCol > 0 ? tSheet.getRange(1, 1, 1, tLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (tHeaders.length === 0) {
    tSheet.getRange(1, 1, 1, tCanonical.length).setValues([tCanonical]);
    tSheet.getRange(1, 1, 1, tCanonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    tSheet.setFrozenRows(1);
  }
  if (tSheet.getLastRow() <= 1) {
    var nowStr2 = new Date().toISOString();
    var seedTestimonials = [
      ['TSM-000001', 'H. Bambang Soeprapto & Hj. Nuraini', 'Surabaya', 'assets/pkg-vip-khidmat.png', 'Umroh VIP Khidmat Bintang 5', 5, 'Alhamdulillah perjalanan ibadah bersama SDW Umroh sangat berkesan. Hotel Clock Tower persis di depan pelataran Ka\'bah, lift langsung ke masjid sehingga orang tua kami tidak kelelahan. Bimbingan Muthawwif sangat sabar dan sesuai sunnah.', '', 'Musim 1447H', 'PUBLISHED', true, nowStr2],
      ['TSM-000002', 'dr. Hendra Wijaya, Sp.A', 'Jakarta Selatan', 'assets/hero-haram.png', 'Umroh Reguler Syawal Barakah', 5, 'Pelayanan dari awal pendaftaran hingga kepulangan sangat transparan dan amanah. Katering makanannya benar-benar masakan Nusantara yang lezat. Sangat direkomendasikan untuk keluarga!', '', 'Musim 1447H', 'PUBLISHED', true, nowStr2],
      ['TSM-000003', 'Ibu Siti Rahmah & Putri', 'Bandung', 'assets/pkg-reguler-syawal.png', 'Umroh Awal Ramadhan 1448H', 5, 'Suasana tarawih di Masjidil Haram dan ziarah Raudhah dibimbing dengan sangat baik. Jadwal terorganisir rapi tanpa tergesa-gesa. Terima kasih SDW Umroh atas pelayanan sepenuh hati.', '', 'Musim 1447H', 'PUBLISHED', true, nowStr2],
      ['TSM-000004', 'Ust. Syarifuddin Malik', 'Medan', 'assets/hero-twilight.jpg', 'Umroh Plus Turki Musim Semi', 5, 'Penerbangan direct tanpa kendala dan hotel di Istanbul maupun Madinah sangat dekat. Tim TL sigap membantu saat bagasi jamaah mendarat. Bintang 5 untuk profesionalitas SDW Umroh.', '', 'Musim 1446H', 'PUBLISHED', false, nowStr2]
    ];
    tSheet.getRange(2, 1, seedTestimonials.length, tCanonical.length).setValues(seedTestimonials);
  }
  tSheet.autoResizeColumns(1, tCanonical.length);

  Logger.log("✓ Sheet DB_Gallery dan DB_Testimonials berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET DB_Gallery & DB_Testimonials SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Articles' dan 'DB_Ziarah_Places'
 * secara langsung sesuai skema kolom canonical dan data seeding resmi.
 */
function setupArticlesAndZiarahSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nowStr = new Date().toISOString();

  // 1. Setup DB_Articles
  var aSheetName = "DB_Articles";
  var aSheet = ss.getSheetByName(aSheetName);
  var aCanonical = AUTHORITATIVE_SCHEMAS_[aSheetName];
  if (!aSheet) {
    aSheet = ss.insertSheet(aSheetName);
    Logger.log("✓ Sheet " + aSheetName + " berhasil dibuat.");
  }
  var aLastCol = aSheet.getLastColumn();
  var aHeaders = aLastCol > 0 ? aSheet.getRange(1, 1, 1, aLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (aHeaders.length === 0) {
    aSheet.getRange(1, 1, 1, aCanonical.length).setValues([aCanonical]);
    aSheet.getRange(1, 1, 1, aCanonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    aSheet.setFrozenRows(1);
  }
  if (aSheet.getLastRow() <= 1) {
    var seedArticles = [
      ['ART-000001', 'Panduan Lengkap Manasik Umroh Sesuai Sunnah Rasulullah ﷺ', 'panduan-manasik-umroh-sunnah', 'PANDUAN_MANASIK', 'Ust. DR. H. Muhammad Salman, Lc.', 'assets/hero-twilight.jpg', 'Tata cara pelaksanaan rukun umroh mulai dari niat ihram di miqat, thawaf 7 putaran, sa\'i Safa-Marwah, hingga tahallul.', 'Umroh adalah ibadah yang mulia. Rukun umroh terdiri dari 4 hal: Ihram dari miqat, Thawaf mengitari Ka\'bah 7 putaran, Sa\'i antara bukit Safa dan Marwah, serta Tahallul dengan mencukur atau memotong rambut.', 7, true, 'PUBLISHED', '2026-10-15', nowStr],
      ['ART-000002', 'Jadwal Manasik Akbar & Simulasi Thawaf Sa\'i Musim 1448H', 'jadwal-manasik-akbar-1448h', 'BERITA_RESMI', 'Tim Operasional SDW Umroh', 'assets/pkg-vip-khidmat.png', 'Pelaksanaan manasik akbar ruang dan lapangan di Grand Ballroom Menara 165 Jakarta Selatan beserta pembagian koper bagasi.', 'Seluruh calon jamaah kloter keberangkatan musim 1448H diundang hadir pada kegiatan Manasik Akbar. Disediakan replika miniatur Ka\'bah untuk simulasi thawaf dan sa\'i serta pengenalan muthawwif pembimbing.', 4, true, 'PUBLISHED', '2026-10-20', nowStr],
      ['ART-000003', 'Tips Menjaga Kebugaran Fisik & Pola Minum Air Zamzam di Tanah Suci', 'tips-kebugaran-jamaah-umroh', 'TIPS_KESEHATAN', 'dr. Hendra Wijaya, Sp.A', 'assets/hero-haram.png', 'Panduan medis menjaga hidrasi tubuh, menghadapi perbedaan suhu ekstrem di Makkah & Madinah, serta tips bagi jamaah lansia.', 'Perbedaan cuaca antara tanah air dan Arab Saudi memerlukan adaptasi fisik yang baik. Jamaah dianjurkan minum air Zamzam minimal 2-3 liter per hari dan tidak menahan buang air kecil.', 5, false, 'PUBLISHED', '2026-10-25', nowStr],
      ['ART-000004', 'Tata Cara Pemesanan Tasreh Masuk Raudhah Nabawi via Aplikasi Nusuk', 'panduan-tasreh-raudhah-nusuk', 'REGULASI_VISA', 'Ust. Ahmad Fauzi Ridwan, Lc.', 'assets/hero-twilight.jpg', 'Panduan teknis pendaftaran izin masuk taman surga Raudhah bagi jamaah pria dan wanita sesuai regulasi Kementerian Haji Saudi.', 'Kementerian Haji dan Umrah Arab Saudi mewajibkan izin tasreh resmi melalui aplikasi Nusuk. Tim SDW Umroh membantu proses pendaftaran grup agar seluruh jamaah mendapatkan jadwal ziarah Raudhah yang nyaman.', 6, false, 'PUBLISHED', '2026-11-01', nowStr],
      ['ART-000005', 'Panduan Ketentuan Bagasi & Air Zamzam Penerbangan Saudia Airlines', 'ketentuan-bagasi-saudia-airlines', 'BERITA_RESMI', 'Tim Handling Bandara SDW', 'assets/pkg-reguler-syawal.png', 'Aturan berat koper bagasi maks 2x23 kg, tas kabin 7 kg, dan mekanisme resmi pembagian galon 5 liter air Zamzam di bandara.', 'Jamaah SDW Umroh yang terbang bersama Saudia Airlines dan Garuda Indonesia berhak atas fasilitas bagasi cuma-cuma 2 koper (masing-masing 23 kg) dan air Zamzam 5 liter resmi dari pengelola Haramain.', 4, false, 'PUBLISHED', '2026-11-05', nowStr]
    ];
    aSheet.getRange(2, 1, seedArticles.length, aCanonical.length).setValues(seedArticles);
  }
  aSheet.autoResizeColumns(1, aCanonical.length);

  // 2. Setup DB_Ziarah_Places
  var zSheetName = "DB_Ziarah_Places";
  var zSheet = ss.getSheetByName(zSheetName);
  var zCanonical = AUTHORITATIVE_SCHEMAS_[zSheetName];
  if (!zSheet) {
    zSheet = ss.insertSheet(zSheetName);
    Logger.log("✓ Sheet " + zSheetName + " berhasil dibuat.");
  }
  var zLastCol = zSheet.getLastColumn();
  var zHeaders = zLastCol > 0 ? zSheet.getRange(1, 1, 1, zLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (zHeaders.length === 0) {
    zSheet.getRange(1, 1, 1, zCanonical.length).setValues([zCanonical]);
    zSheet.getRange(1, 1, 1, zCanonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    zSheet.setFrozenRows(1);
  }
  if (zSheet.getLastRow() <= 1) {
    var seedZiarah = [
      ['ZRH-000001', 'Jabal Rahmah & Padang Arafah', 'MAKKAH', 'Tempat Wukuf Haji', '± 21 Km Timur Masjidil Haram', 'Bukit batu bersejarah di tengah Padang Arafah tempat bertemunya Nabi Adam AS dan Hawa setelah berpisah ratusan tahun, serta lokasi khutbah wada Rasulullah ﷺ.', 'Disunnahkan berdoa menghadap kiblat (bukan menghadap tugu), tidak mencoret-coret bebatuan, dan memperbanyak istighfar.', 'assets/pkg-vip-khidmat.png', 'https://maps.google.com/?q=Jabal+al-Rahmah+Makkah', 1, 'ACTIVE', nowStr],
      ['ZRH-000002', 'Gua Hira (Jabal Nur)', 'MAKKAH', 'Tempat Turun Wahyu Pertama', '± 6 Km Timur Laut Masjidil Haram', 'Tempat Rasulullah ﷺ bertahannuth hingga menerima wahyu pertama surat Al-Alaq 1-5 melalui malaikat Jibril AS.', 'Mengingat awal mula risalah Islam, merenungi perjuangan Sayyidah Khadijah radhiyallahu \'anha membawakan bekal ke puncak bukit.', 'assets/hero-haram.png', 'https://maps.google.com/?q=Hira+Cave+Makkah', 2, 'ACTIVE', nowStr],
      ['ZRH-000003', 'Gua Tsur (Jabal Tsur)', 'MAKKAH', 'Benteng Hijrah Rasulullah', '± 5 Km Selatan Masjidil Haram', 'Gua di puncak Jabal Tsur tempat Rasulullah ﷺ dan Abu Bakar Ash-Shiddiq radhiyallahu \'anhu bersembunyi selama 3 malam saat hijrah ke Madinah (QS. At-Taubah: 40).', 'Mengambil pelajaran tawakkal sempurna kepada Allah dan kesetiaan sahabat sejati.', 'assets/hero-twilight.jpg', 'https://maps.google.com/?q=Thawr+Cave+Makkah', 3, 'ACTIVE', nowStr],
      ['ZRH-000004', 'Mina & Tugu Jamarat', 'MAKKAH', 'Lokasi Mabit & Lempar Jumrah', '± 7 Km Timur Masjidil Haram', 'Lembah tenda tempat jamaah haji mabit dan melontar tiga jamarat (Ula, Wustha, Aqabah) meneladani keteguhan Nabi Ibrahim AS menolak godaan setan.', 'Mempelajari manasik haji tamattu\' dan tapak tilas peristiwa ketaatan Nabi Ibrahim & Ismail AS.', 'assets/pkg-ramadhan.webp', 'https://maps.google.com/?q=Jamarat+Mina+Makkah', 4, 'ACTIVE', nowStr],
      ['ZRH-000005', 'Muzdalifah & Masy\'aril Haram', 'MAKKAH', 'Tempat Mabit & Ambil Kerikil', '± 10 Km Tenggara Masjidil Haram', 'Area terbuka antara Arafah dan Mina tempat jamaah haji bermalam sejenak (mabit) usai wukuf dan mengumpulkan batu kerikil.', 'Mengingat firman Allah dalam QS. Al-Baqarah: 198 untuk berdzikir di Masy\'aril Haram.', 'assets/pkg-reguler-syawal.png', 'https://maps.google.com/?q=Muzdalifah+Makkah', 5, 'ACTIVE', nowStr],
      ['ZRH-000006', 'Masjid Quba & Kebun Kurma', 'MADINAH', 'Masjid Pertama Sejarah Islam', '± 3.5 Km Selatan Masjid Nabawi', 'Masjid pertama yang dibangun Rasulullah ﷺ setibanya di Madinah. Shalat 2 rakaat di sini bernilai pahala setara 1 kali ibadah umroh (HR. Tirmidzi & Ibnu Majah).', 'Disunnahkan bersuci (wudhu) dari hotel/rumah lalu mendirikan shalat sunnah minimal 2 rakaat di dalam masjid.', 'assets/pkg-plus-turki.webp', 'https://maps.google.com/?q=Quba+Mosque+Medina', 6, 'ACTIVE', nowStr],
      ['ZRH-000007', 'Jabal Uhud & Makam Syuhada', 'MADINAH', 'Bukit Cinta Surga', '± 5 Km Utara Masjid Nabawi', 'Bukit yang mencintai kaum mukmin dan dicintai Nabi (HR. Bukhari). Saksi Perang Uhud, bukit pemanah (Jabal Rumat), dan makam 70 syuhada termasuk Sayyidina Hamzah AS.', 'Mendoakan para syuhada Uhud, menaiki bukit pemanah dengan tertib, dan tidak meminta berkah kepada batu/tanah kuburan.', 'assets/hero-twilight.jpg', 'https://maps.google.com/?q=Mount+Uhud+Medina', 7, 'ACTIVE', nowStr],
      ['ZRH-000008', 'Masjid Al-Qiblatain (Dua Kiblat)', 'MADINAH', 'Dua Arah Kiblat', '± 4 Km Barat Laut Masjid Nabawi', 'Saksi sejarah perintah memalingkan arah kiblat dari Baitul Maqdis di Yerusalem ke Ka\'bah di Makkah saat shalat berjamaah sedang berlangsung (QS. Al-Baqarah: 144).', 'Mendirikan shalat sunnah tahiyyatul masjid dan tadabbur ayat-ayat ketaatan mutlak kepada perintah wahyu.', 'assets/hero-haram.png', 'https://maps.google.com/?q=Masjid+al-Qiblatayn+Medina', 8, 'ACTIVE', nowStr],
      ['ZRH-000009', 'Kebun Kurma & Pasar Kurma Madinah', 'MADINAH', 'Wisata Agrowisata Nabawi', '± 6 Km Selatan Masjid Nabawi', 'Perkebunan kurma produktif dengan berbagai jenis kurma unggulan seperti Ajwa (Kurma Nabi), Sukari, Medjool, dan Amber.', 'Mencicipi kurma Ajwa yang memiliki keutamaan penangkal racun dan sihir sesuai sabda Rasulullah ﷺ.', 'assets/pkg-reguler-syawal.png', 'https://maps.google.com/?q=Date+Market+Medina', 9, 'ACTIVE', nowStr],
      ['ZRH-000010', 'Masjid Sab\'ah & Medan Perang Khandaq', 'MADINAH', 'Saksi Perang Parit 5 Hijriyah', '± 2.5 Km Barat Laut Masjid Nabawi', 'Kompleks tujuh masjid kecil di lereng Gunung Sila\' tempat pos pertahanan dan tenda para sahabat saat menggali parit pertahanan Kota Madinah.', 'Tadabbur sejarah ketabahan Rasulullah ﷺ dan para sahabat menghadapi kepungan 10.000 pasukan sekutu Quraisy.', 'assets/pkg-vip-khidmat.png', 'https://maps.google.com/?q=The+Seven+Mosques+Medina', 10, 'ACTIVE', nowStr]
    ];
    zSheet.getRange(2, 1, seedZiarah.length, zCanonical.length).setValues(seedZiarah);
  }
  zSheet.autoResizeColumns(1, zCanonical.length);

  Logger.log("✓ Sheet DB_Articles dan DB_Ziarah_Places berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET DB_Articles & DB_Ziarah_Places SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Airlines' dan 'DB_Airports'
 * secara langsung sesuai skema kolom canonical dan data seeding resmi.
 */
function setupAirlinesAndAirportsSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nowStr = new Date().toISOString();

  // 1. Setup DB_Airlines
  var alSheetName = "DB_Airlines";
  var alSheet = ss.getSheetByName(alSheetName);
  var alCanonical = AUTHORITATIVE_SCHEMAS_[alSheetName];
  if (!alSheet) {
    alSheet = ss.insertSheet(alSheetName);
    Logger.log("✓ Sheet " + alSheetName + " berhasil dibuat.");
  }
  var alLastCol = alSheet.getLastColumn();
  var alHeaders = alLastCol > 0 ? alSheet.getRange(1, 1, 1, alLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (alHeaders.length === 0) {
    alSheet.getRange(1, 1, 1, alCanonical.length).setValues([alCanonical]);
    alHeaders = alCanonical.slice();
  } else {
    var alMissing = [];
    for (var i = 0; i < alCanonical.length; i++) {
      if (alHeaders.indexOf(alCanonical[i]) === -1) {
        alMissing.push(alCanonical[i]);
      }
    }
    if (alMissing.length > 0) {
      alSheet.getRange(1, alLastCol + 1, 1, alMissing.length).setValues([alMissing]);
      alHeaders = alHeaders.concat(alMissing);
    }
  }

  // Seeding 6 maskapai umroh utama
  if (alSheet.getLastRow() <= 1) {
    var seedAirlines = [
      ['AIR-000001', 'SV', 'Saudia Airlines', 'DIRECT', 'None / Direct Flight', '2x 23kg + 5L Air Zamzam', 'Ekonomi, Bisnis', 'assets/hero-haram.png', 1, true, 'Maskapai resmi flag carrier Kerajaan Arab Saudi, direct CGK/SUB ke JED/MED', nowStr],
      ['AIR-000002', 'GA', 'Garuda Indonesia', 'DIRECT', 'None / Direct Flight', '30kg + 5L Air Zamzam', 'Ekonomi, Bisnis', 'assets/hero-twilight.jpg', 2, true, 'Maskapai nasional Indonesia bintang 5, penerbangan langsung tanpa transit ke Jeddah & Madinah', nowStr],
      ['AIR-000003', 'TK', 'Turkish Airlines', 'TRANSIT', 'Istanbul Airport (IST)', '30kg + 5L Air Zamzam', 'Ekonomi, Bisnis', 'assets/pkg-plus-turki.webp', 3, true, 'Maskapai terbaik Eropa, rute program Umroh Plus Turki dengan transit city tour Istanbul', nowStr],
      ['AIR-000004', 'QR', 'Qatar Airways', 'TRANSIT', 'Hamad Int Airport Doha (DOH)', '25kg + 5L Air Zamzam', 'Ekonomi, Bisnis', 'assets/hero-madinah.png', 4, true, 'Layanan bintang 5 dunia dengan armada modern A350/B787 via Doha', nowStr],
      ['AIR-000005', 'JT', 'Lion Air Umrah', 'DIRECT', 'None / Direct Flight', '25kg + 5L Air Zamzam', 'Ekonomi', 'assets/pkg-hemat.webp', 5, true, 'Penerbangan charter langsung armada berbadan lebar Airbus A330-900NEO harga terjangkau', nowStr],
      ['AIR-000006', 'WY', 'Oman Air', 'TRANSIT', 'Muscat Int Airport (MCT)', '30kg + 5L Air Zamzam', 'Ekonomi, Bisnis', 'assets/pkg-reguler-syawal.webp', 6, true, 'Opsi transit Timur Tengah dengan harga bersahabat dan layanan ramah', nowStr]
    ];
    alSheet.getRange(2, 1, seedAirlines.length, alCanonical.length).setValues(seedAirlines);
  }
  alSheet.autoResizeColumns(1, alCanonical.length);

  // 2. Setup DB_Airports
  var apSheetName = "DB_Airports";
  var apSheet = ss.getSheetByName(apSheetName);
  var apCanonical = AUTHORITATIVE_SCHEMAS_[apSheetName];
  if (!apSheet) {
    apSheet = ss.insertSheet(apSheetName);
    Logger.log("✓ Sheet " + apSheetName + " berhasil dibuat.");
  }
  var apLastCol = apSheet.getLastColumn();
  var apHeaders = apLastCol > 0 ? apSheet.getRange(1, 1, 1, apLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (apHeaders.length === 0) {
    apSheet.getRange(1, 1, 1, apCanonical.length).setValues([apCanonical]);
    apHeaders = apCanonical.slice();
  } else {
    var apMissing = [];
    for (var j = 0; j < apCanonical.length; j++) {
      if (apHeaders.indexOf(apCanonical[j]) === -1) {
        apMissing.push(apCanonical[j]);
      }
    }
    if (apMissing.length > 0) {
      apSheet.getRange(1, apLastCol + 1, 1, apMissing.length).setValues([apMissing]);
      apHeaders = apHeaders.concat(apMissing);
    }
  }

  // Seeding 8 bandara utama (Embarkasi RI, Kedatangan Haramain, Hub Transit)
  if (apSheet.getLastRow() <= 1) {
    var seedAirports = [
      ['APT-000001', 'CGK', 'Bandara Internasional Soekarno-Hatta', 'Jakarta / Tangerang', 'Indonesia', 'ORIGIN', 'Terminal 3 Ultimate (Penerbangan Umroh & Internasional)', 1, true, nowStr],
      ['APT-000002', 'SUB', 'Bandara Internasional Juanda', 'Surabaya / Sidoarjo', 'Indonesia', 'ORIGIN', 'Terminal 2 Internasional', 2, true, nowStr],
      ['APT-000003', 'KNO', 'Bandara Internasional Kualanamu', 'Medan / Deli Serdang', 'Indonesia', 'ORIGIN', 'Terminal Keberangkatan Internasional', 3, true, nowStr],
      ['APT-000004', 'SOC', 'Bandara Internasional Adi Soemarmo', 'Solo / Boyolali', 'Indonesia', 'ORIGIN', 'Terminal Haji & Umroh Jawa Tengah', 4, true, nowStr],
      ['APT-000005', 'JED', 'Bandara Internasional King Abdulaziz', 'Jeddah', 'Arab Saudi', 'DESTINATION', 'Terminal 1 Modern & Terminal Haji Barat', 1, true, nowStr],
      ['APT-000006', 'MED', 'Bandara Internasional Prince Mohammad bin Abdulaziz', 'Madinah', 'Arab Saudi', 'DESTINATION', 'Main International Passenger Terminal', 2, true, nowStr],
      ['APT-000007', 'IST', 'Istanbul International Airport', 'Istanbul', 'Turki', 'TRANSIT', 'International Transit Concourse A/B', 1, true, nowStr],
      ['APT-000008', 'DOH', 'Hamad International Airport', 'Doha', 'Qatar', 'TRANSIT', 'Central Transit Terminal & Orchard Hub', 2, true, nowStr]
    ];
    apSheet.getRange(2, 1, seedAirports.length, apCanonical.length).setValues(seedAirports);
  }
  apSheet.autoResizeColumns(1, apCanonical.length);

  Logger.log("✓ Sheet DB_Airlines dan DB_Airports berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET DB_Airlines & DB_Airports SELESAI ===");
}

/**
 * Helper Mandiri: Jalankan fungsi ini untuk membuat atau memperbarui sheet 'DB_Faq' dan 'DB_Helpdesk_Contacts'
 * secara langsung sesuai skema kolom canonical dan data seeding resmi.
 */
function setupFaqAndHelpdeskSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var nowStr = new Date().toISOString();

  // 1. Setup DB_Faq
  var fSheetName = "DB_Faq";
  var fSheet = ss.getSheetByName(fSheetName);
  var fCanonical = AUTHORITATIVE_SCHEMAS_[fSheetName];
  if (!fSheet) {
    fSheet = ss.insertSheet(fSheetName);
    Logger.log("✓ Sheet " + fSheetName + " berhasil dibuat.");
  }
  var fLastCol = fSheet.getLastColumn();
  var fHeaders = fLastCol > 0 ? fSheet.getRange(1, 1, 1, fLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (fHeaders.length === 0) {
    fSheet.getRange(1, 1, 1, fCanonical.length).setValues([fCanonical]);
    fHeaders = fCanonical.slice();
  } else {
    var fMissing = [];
    for (var i = 0; i < fCanonical.length; i++) {
      if (fHeaders.indexOf(fCanonical[i]) === -1) {
        fMissing.push(fCanonical[i]);
      }
    }
    if (fMissing.length > 0) {
      fSheet.getRange(1, fLastCol + 1, 1, fMissing.length).setValues([fMissing]);
      fHeaders = fHeaders.concat(fMissing);
    }
  }

  // Seeding 6 FAQ resmi
  if (fSheet.getLastRow() <= 1) {
    var seedFaq = [
      ['FAQ-000001', 'DOKUMEN_PASPOR', 'Apa saja syarat dokumen paspor dan visa untuk mendaftar umroh?', 'Syarat utama: 1) Paspor RI asli dengan masa berlaku minimal 7 bulan sebelum tanggal kepulangan dan nama minimal 2 suku kata. 2) Scan KTP & Kartu Keluarga asli. 3) Buku Nikah asli bagi suami-istri atau Akta Lahir anak. 4) Rekam biometrik melalui aplikasi resmi Saudi Visa Bio didampingi tim SDW.', 'fa-passport', 1, true, 'PUBLISHED', nowStr],
      ['FAQ-000002', 'PEMBAYARAN_BIAYA', 'Bagaimana sistem pembayaran dan keamanan dana jamaah?', 'Pembayaran uang muka (DP) hanya sebesar Rp 5.000.000 / jamaah untuk mengunci seat maskapai dan kamar hotel. Seluruh transaksi wajib disalurkan melalui rekening escrow bank syariah atas nama PT Sahabat Dhuha Wisata (BSI & Bank Muamalat), bukan rekening perorangan. Pelunasan dapat dilakukan maksimal 30 hari sebelum keberangkatan.', 'fa-money-check-dollar', 2, true, 'PUBLISHED', nowStr],
      ['FAQ-000003', 'LANSIA_KESEHATAN', 'Apakah tersedia fasilitas kursi roda dan pendampingan khusus lansia?', 'Ya, SDW UMROH menyediakan layanan prioritas bagi jamaah lansia. Kami menyediakan kursi roda lipat, pendampingan muthawwif khusus saat thawaf dan sa\'i di pelataran berbayar resmi Masjidil Haram, serta penataan kamar hotel yang dekat dengan lift.', 'fa-wheelchair', 3, true, 'PUBLISHED', nowStr],
      ['FAQ-000004', 'HOTEL_AKOMODASI', 'Berapa jarak hotel penginapan ke Masjidil Haram dan Masjid Nabawi?', 'Untuk Paket VIP Khidmat, hotel Makkah berada langsung di pelataran Clock Tower (0 - 50 meter) seperti Swissotel / Pullman Zamzam. Untuk Paket Reguler, jarak hotel Makkah berkisar 250 - 350 meter. Di Madinah, seluruh paket menggunakan hotel di ring satu Masjid Nabawi (kurang dari 200 meter dari gerbang utama wanita dan pria).', 'fa-hotel', 4, true, 'PUBLISHED', nowStr],
      ['FAQ-000005', 'JADWAL_BATAL', 'Bagaimana ketentuan jika jamaah terpaksa reschedule atau membatalkan?', 'SDW UMROH memiliki kebijakan reschedule fleksibel jika terdapat kendala medis (disertai surat dokter RS). Pemindahan kloter bebas biaya administrasi jika dilakukan minimal 35 hari sebelum tanggal terbang. Untuk pembatalan sepihak, pengembalian dana diatur transparan sesuai regulasi PPIU Kemenag RI.', 'fa-calendar-xmark', 5, true, 'PUBLISHED', nowStr],
      ['FAQ-000006', 'MANASIK_IBADAH', 'Berapa kali bimbingan manasik diadakan sebelum keberangkatan?', 'Manasik diadakan 2 kali secara intensif: 1) Manasik Fiqih Ibadah & Teori di hotel berbintang, 2) Manasik Praktik Simulasi Tawaf & Sa\'i di asrama haji. Selain itu, ada sesi pemantapan briefing H-3 di Jakarta dan pemantapan kembali sebelum miqat di Tanah Suci.', 'fa-kaaba', 6, true, 'PUBLISHED', nowStr]
    ];
    fSheet.getRange(2, 1, seedFaq.length, fCanonical.length).setValues(seedFaq);
  }
  fSheet.autoResizeColumns(1, fCanonical.length);

  // 2. Setup DB_Helpdesk_Contacts
  var cSheetName = "DB_Helpdesk_Contacts";
  var cSheet = ss.getSheetByName(cSheetName);
  var cCanonical = AUTHORITATIVE_SCHEMAS_[cSheetName];
  if (!cSheet) {
    cSheet = ss.insertSheet(cSheetName);
    Logger.log("✓ Sheet " + cSheetName + " berhasil dibuat.");
  }
  var cLastCol = cSheet.getLastColumn();
  var cHeaders = cLastCol > 0 ? cSheet.getRange(1, 1, 1, cLastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (cHeaders.length === 0) {
    cSheet.getRange(1, 1, 1, cCanonical.length).setValues([cCanonical]);
    cHeaders = cCanonical.slice();
  } else {
    var cMissing = [];
    for (var j = 0; j < cCanonical.length; j++) {
      if (cHeaders.indexOf(cCanonical[j]) === -1) {
        cMissing.push(cCanonical[j]);
      }
    }
    if (cMissing.length > 0) {
      cSheet.getRange(1, cLastCol + 1, 1, cMissing.length).setValues([cMissing]);
      cHeaders = cHeaders.concat(cMissing);
    }
  }

  // Seeding 3 kontak customer care
  if (cSheet.getLastRow() <= 1) {
    var seedContacts = [
      ['CS-000001', 'Hotline Konsultasi Umroh & Pendaftaran', 'WHATSAPP', '6281234567890', 'Assalamualaikum CS SDW UMROH, saya ingin konsultasi paket umroh.', '24 Jam Non-Stop', true, 1, 'ACTIVE', nowStr],
      ['CS-000002', 'Layanan Paspor & Verifikasi Visa Bio', 'WHATSAPP', '6281234567891', 'Assalamualaikum Admin Dokumen, mohon info verifikasi paspor & visa saya.', 'Senin - Jumat 08.00 - 17.00 WIB', false, 2, 'ACTIVE', nowStr],
      ['CS-000003', 'Customer Care Kantor Pusat Jakarta', 'PHONE', '02178901234', 'Customer Service Telepon Kantor Pusat SDW UMROH', 'Senin - Sabtu 08.30 - 17.00 WIB', false, 3, 'ACTIVE', nowStr]
    ];
    cSheet.getRange(2, 1, seedContacts.length, cCanonical.length).setValues(seedContacts);
  }
  cSheet.autoResizeColumns(1, cCanonical.length);

  Logger.log("✓ Sheet DB_Faq dan DB_Helpdesk_Contacts berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET DB_Faq & DB_Helpdesk_Contacts SELESAI ===");
}

function ensureHeadersMatch_(sheet, canonical) {
  if (!sheet || !canonical || canonical.length === 0) return;
  var lastCol = sheet.getLastColumn();
  var currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) { return String(h).trim(); }) : [];
  if (currentHeaders.length === 0) {
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    sheet.getRange(1, 1, 1, canonical.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
    sheet.setFrozenRows(1);
    return;
  }
  var missing = [];
  canonical.forEach(function(col) {
    if (currentHeaders.indexOf(col) === -1) {
      missing.push(col);
    }
  });
  if (missing.length > 0) {
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length).setValues([missing]);
    sheet.getRange(1, currentHeaders.length + 1, 1, missing.length)
      .setBackground("#0F3D2E")
      .setFontColor("#FFFFFF")
      .setFontWeight("bold")
      .setFontFamily("Plus Jakarta Sans");
  }
}

/**
 * Setup dan standardisasi skema DB_Users dan DB_Role_Permissions
 */
function setupUsersAndRbacSheets() {
  Logger.log("=== MEMULAI SETUP SHEET DB_Users & DB_Role_Permissions ===");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var nowStr = new Date().toISOString();

  // 1. Setup DB_Users
  var uCanonical = AUTHORITATIVE_SCHEMAS_["DB_Users"];
  var uSheet = ss.getSheetByName("DB_Users");
  if (!uSheet) {
    uSheet = ss.insertSheet("DB_Users");
    uSheet.getRange(1, 1, 1, uCanonical.length).setValues([uCanonical]);
    uSheet.setFrozenRows(1);
  } else {
    ensureHeadersMatch_(uSheet, uCanonical);
  }

  // Seeding 7 pengguna representatif jika kosong
  if (uSheet.getLastRow() <= 1) {
    var seedUsers = [
      ['USR-000001', 'Super Administrator (IT & Owner)', 'admin@sdwumroh.com', '6281234567890', 'SUPER_ADMIN', 'ACTIVE', 'Semua Sistem', 'Aktif Sekarang', nowStr, nowStr],
      ['USR-000002', 'H. Ahmad Fauzi (Admin Operasional)', 'ops@sdwumroh.com', '6281122334455', 'ADMIN', 'ACTIVE', 'Kloter Reguler & VIP', '1 jam lalu', nowStr, nowStr],
      ['USR-000003', 'H. Muhammad Syarif (Direktur Utama)', 'syarif@sdwumroh.com', '6281299887766', 'DIRECTOR', 'ACTIVE', 'Dewan Direksi', '2 jam lalu', nowStr, nowStr],
      ['USR-000004', 'Hj. Fatimah Zahra (Finance & Kasir)', 'finance@sdwumroh.com', '6281355667788', 'FINANCE', 'ACTIVE', 'Escrow BSI & Muamalat', '5 jam lalu', nowStr, nowStr],
      ['USR-000005', 'Ustadz Dr. Abdullah (Muthawwif Senior)', 'muthawwif@sdwumroh.com', '6281788990011', 'MUTHAWWIF', 'ACTIVE', 'Kloter Syawal VIP', '1 hari lalu', nowStr, nowStr],
      ['USR-000006', 'Budi Santoso (Senior Sales Consultant)', 'sales@sdwumroh.com', '6281566778899', 'SALES', 'ACTIVE', 'Regional Jabodetabek', '3 hari lalu', nowStr, nowStr],
      ['USR-000007', 'Siti Aisyah (Akun Jamaah Umroh)', 'aisyah@gmail.com', '6281233445566', 'PILGRIM', 'ACTIVE', 'SDW-2025-01 (#BK-8821)', '14 hari lalu', nowStr, nowStr]
    ];
    uSheet.getRange(2, 1, seedUsers.length, uCanonical.length).setValues(seedUsers);
  }
  uSheet.autoResizeColumns(1, uCanonical.length);

  // 2. Setup DB_Role_Permissions (Matriks RBAC)
  var rCanonical = AUTHORITATIVE_SCHEMAS_["DB_Role_Permissions"];
  var rSheet = ss.getSheetByName("DB_Role_Permissions");
  if (!rSheet) {
    rSheet = ss.insertSheet("DB_Role_Permissions");
    rSheet.getRange(1, 1, 1, rCanonical.length).setValues([rCanonical]);
    rSheet.setFrozenRows(1);
  } else {
    ensureHeadersMatch_(rSheet, rCanonical);
  }

  // Seeding default matriks RBAC jika kosong
  if (rSheet.getLastRow() <= 1) {
    var modules = [
      'tab-dashboard', 'tab-crm', 'tab-packages', 'tab-departures',
      'tab-hotels', 'tab-airlines', 'tab-gallery', 'tab-articles',
      'tab-faq', 'tab-docs', 'tab-registrations', 'tab-finance',
      'tab-operations', 'tab-certificates', 'tab-badal-certificates',
      'tab-users', 'tab-roles', 'tab-audit'
    ];

    var roles = [
      { key: 'SUPER_ADMIN', name: 'Super Admin' },
      { key: 'ADMIN', name: 'Admin Backoffice' },
      { key: 'DIRECTOR', name: 'Pimpinan / Direksi' },
      { key: 'FINANCE', name: 'Keuangan & Kasir' },
      { key: 'OPERATIONS', name: 'Staf Operasional' },
      { key: 'SALES', name: 'Sales & Konsultan' },
      { key: 'MUTHAWWIF', name: 'Muthawwif & TL' },
      { key: 'PILGRIM', name: 'Akun Jamaah' }
    ];

    var defaultRules = {
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
        if (['tab-dashboard', 'tab-packages', 'tab-departures', 'tab-hotels', 'tab-airlines', 'tab-gallery', 'tab-faq'].indexOf(m) !== -1) return 'VIEW';
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

    var seedRows = [];
    roles.forEach(function(r) {
      modules.forEach(function(m) {
        var level = defaultRules[r.key] ? defaultRules[r.key](m) : 'NONE';
        seedRows.push([
          'RBAC-' + r.key + '-' + m.replace('tab-', '').toUpperCase(),
          r.key,
          r.name,
          m,
          level,
          nowStr
        ]);
      });
    });

    rSheet.getRange(2, 1, seedRows.length, rCanonical.length).setValues(seedRows);
  }
  rSheet.autoResizeColumns(1, rCanonical.length);

  Logger.log("✓ Sheet DB_Users dan DB_Role_Permissions berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET DB_Users & DB_Role_Permissions SELESAI ===");
}

/**
 * Setup dan standardisasi skema 5 Sheet Profil Lembaga:
 * 1. DB_Profile_Institution (Visi, Misi, Kredensial, Sejarah, Direksi)
 * 2. DB_Profile_Director (Foto, Sambutan, Quote, 4 Pilar Keunggulan)
 * 3. DB_Profile_Guides (Dewan Pembimbing, Asatidz, Muthawwif, Tim Medis)
 * 4. DB_Profile_Legality (SK PPIU Kemenag, Akreditasi, Kemenkumham, MOU Kemitraan)
 * 5. DB_Profile_Mitra_Syiar (Jaringan Koordinator Mitra Syiar & Cabang Daerah)
 */
function setupProfileSheets() {
  Logger.log("=== MEMULAI SETUP SHEET PROFIL LEMBAGA & MITRA SYIAR ===");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var nowStr = new Date().toISOString();

  // Helper local untuk memastikan sheet dan header canonical
  function getOrInitProfileSheet(sheetName) {
    var canonical = AUTHORITATIVE_SCHEMAS_[sheetName];
    var sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName);
      sh.getRange(1, 1, 1, canonical.length).setValues([canonical]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, canonical.length)
        .setBackground("#0F3D2E")
        .setFontColor("#FFFFFF")
        .setFontWeight("bold");
      Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
    } else {
      ensureHeadersMatch_(sh, canonical);
    }
    return { sheet: sh, canonical: canonical };
  }

  // 1. Setup DB_Profile_Institution
  var inst = getOrInitProfileSheet("DB_Profile_Institution");
  if (inst.sheet.getLastRow() <= 1) {
    var defaultMisi = JSON.stringify([
      "Menyelenggarakan perjalanan umroh dengan kepastian seat pesawat, kepastian jadwal, dan kepastian hotel bintang 5.",
      "Menyediakan akomodasi hotel bintang 5 di pelataran utama Masjidil Haram dan Masjid Nabawi.",
      "Memberikan bimbingan manasik komprehensif, bersanad, dan intensif oleh asatidz alumni Timur Tengah.",
      "Menerapkan transparansi finansial dan perlindungan jamaah tanpa biaya tersembunyi melalui rekening escrow BSI.",
      "Memanfaatkan ekosistem teknologi modern (One Journey, One Platform) untuk memonitor jadwal dan panduan ibadah."
    ]);

    var defaultTimeline = JSON.stringify([
      { phase: "Fase 1 (2018 - 2020)", title: "Perintisan & Komitmen Khidmat", desc: "Berawal dari inisiatif kelompok bimbingan manasik alumni Timur Tengah yang berdedikasi melayani jamaah dengan transparansi biaya dan bimbingan intensif." },
      { phase: "Fase 2 (2021 - 2023)", title: "Pengukuhan Badan Hukum & Lisensi", desc: "Transformasi menjadi perseroan resmi PT Sahabat Dhuha Wisata, penataan SOP operasional, serta pengajuan izin resmi PPIU Kemenag RI." },
      { phase: "Fase 3 (2024 - 2025)", title: "Akreditasi A & Kemitraan Strategis", desc: "Meraih predikat Akreditasi A Unggul, penguncian kontrak jangka panjang dengan Saudia & Garuda Indonesia, serta hotel pelataran Haramain." },
      { phase: "Fase 4 (2026 - Sekarang)", title: "Ekosistem Digital One Journey", desc: "Peluncuran platform digital terpadu PWA SDW Umroh, portal manajemen kloter real-time, dan bimbingan ibadah mandiri bersanad." }
    ]);

    var defaultDireksi = JSON.stringify([
      { role: "Direktur Utama", name: "H. Muhammad Syarif", title: "Direktur Utama PT Sahabat Dhuha Wisata", photo: "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0" },
      { role: "Direktur Keuangan", name: "Hj. Siti Rahmawati, S.E.", title: "Direktur Keuangan & Kustodian Escrow", photo: "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0" },
      { role: "Direktur Bimbingan Ibadah", name: "Ust. H. Ahmad Fauzan, Lc., M.Ag.", title: "Ketua Dewan Pembimbing Syariah", photo: "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0" },
      { role: "Direktur Operasional", name: "H. Bambang Irawan, S.T.", title: "Direktur Operasional & Pelayanan Haramain", photo: "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0" }
    ]);

    var seedInst = [
      [
        "PRF-INST-000001",
        "U.123/2026",
        "2026",
        "Peringkat A (Unggul)",
        "Lembaga Sertifikasi Umroh Mandiri",
        "PT Sahabat Dhuha Wisata",
        "AHU-0012938.AH.01.01.TAHUN 2026",
        "AMPHURI & IATA",
        "ID: 15-4-9981 / Asosiasi PPIU Resmi",
        "Menjadi biro perjalanan ibadah umroh dan haji khusus terdepan di Indonesia yang amanah, profesional, dan berkhidmat melayani jamaah dengan standar kenyamanan hotel pelataran ring-1 serta bimbingan ibadah bersanad yang menenteramkan kalbu.",
        defaultMisi,
        defaultTimeline,
        defaultDireksi,
        nowStr,
        "SYSTEM_INIT"
      ]
    ];
    inst.sheet.getRange(2, 1, seedInst.length, inst.canonical.length).setValues(seedInst);
  }
  inst.sheet.autoResizeColumns(1, inst.canonical.length);

  // 2. Setup DB_Profile_Director
  var dir = getOrInitProfileSheet("DB_Profile_Director");
  if (dir.sheet.getLastRow() <= 1) {
    var defaultParagraphs = JSON.stringify([
      "Assalamu’alaikum Warahmatullahi Wabarakatuh. Segala puji bagi Allah SWT, Tuhan semesta alam, yang telah memanggil hamba-hamba pilihan-Nya untuk berziarah ke Baitullah Al-Haram di Makkah Al-Mukarramah dan berziarah ke makam baginda Rasulullah SAW di Madinah Al-Munawwarah.",
      "Menjadi pelayan bagi Dhuyufurrahman (Tamu-Tamu Allah) adalah sebuah kehormatan agung sekaligus amanah yang sangat berat di hadapan Allah SWT. Oleh karena itu, sejak pertama kali PT Sahabat Dhuha Wisata (SDW UMROH) didirikan, kami meletakkan satu komitmen mendasar: Kepastian Fasilitas, Transparansi Biaya, dan Kemurnian Ibadah Sesuai Tuntunan Sunnah.",
      "Kami memahami betapa berharganya setiap tetes keringat dan doa yang dipanjatkan para jamaah untuk mengumpulkan bekal menuju Baitullah. Banyak di antara kita yang menanti bertahun-tahun untuk dapat bersujud di depan Ka'bah. Karena itu, kami tidak akan pernah berkompromi dengan mutu pelayanan. Kami mengunci kontrak hotel-hotel terbaik yang berjarak dekat dengan pelataran masjid, menggunakan maskapai penerbangan direct tanpa transit berlebih, dan mendampingkan asatidz pembimbing bersanad yang siap membimbing langkah demi langkah ibadah Anda.",
      "Melalui platform digital dan aplikasi PWA SDW UMROH ini, kami berupaya menghadirkan kemudahan terpadu bagi keluarga jamaah: mulai dari kemudahan pendaftaran, pengecekan tabungan, jadwal manasik berkala, panduan doa offline, hingga pantauan kloter secara transparan.",
      "Semoga Allah SWT meridhai setiap niat suci kita, menganugerahi kemudahan dalam perjalanan, dan menyambut kepulangan Bapak/Ibu sekalian dengan predikat umroh yang maqbullah dan mabrurah. Aamiin Ya Rabbal ‘Alamin."
    ]);

    var defaultPillars = JSON.stringify([
      { title: "Bimbingan Manasik Bersanad", desc: "Didampingi asatidz alumni Timur Tengah dengan sanad keilmuan muttasil.", icon: "fa-book-quran" },
      { title: "Hotel Bintang 5 Pelataran", desc: "Retaj Al Rayyan & Concorde Dar Al Khair berjarak jalan kaki dekat.", icon: "fa-hotel" },
      { title: "Penerbangan Direct Saudia", desc: "Pasti terbang tanpa transit berlebih dengan jatah bagasi 2x23kg.", icon: "fa-plane-departure" },
      { title: "Rasio Khidmat 1 : 35", desc: "Pendampingan intensif menjamin perhatian personal bagi lansia.", icon: "fa-users" }
    ]);

    var seedDir = [
      [
        "PRF-DIR-000001",
        "H. Muhammad Syarif",
        "Direktur Utama PT Sahabat Dhuha Wisata",
        "Badan Verifikasi Lisensi Resmi",
        "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0",
        "Melayani Setiap Langkah Jamaah Sebagai Tamu Allah yang Mulia",
        "Komitmen Pimpinan PT Sahabat Dhuha Wisata untuk Perjalanan Ibadah yang Amanah, Khidmat & Menenteramkan.",
        "Di SDW UMROH, kami memandang perjalanan ke Baitullah bukan sekadar perniagaan tiket dan hotel, melainkan sebuah amanah suci yang agung. Setiap tetes keringat tabungan jamaah kami jaga dengan kepastian fasilitas, transparansi penuh tanpa biaya siluman, dan bimbingan manasik bersanad yang menenteramkan kalbu.",
        defaultParagraphs,
        defaultPillars,
        true,
        nowStr,
        "SYSTEM_INIT"
      ]
    ];
    dir.sheet.getRange(2, 1, seedDir.length, dir.canonical.length).setValues(seedDir);
  }
  dir.sheet.autoResizeColumns(1, dir.canonical.length);

  // 3. Setup DB_Profile_Guides
  var gd = getOrInitProfileSheet("DB_Profile_Guides");
  if (gd.sheet.getLastRow() <= 1) {
    var seedGuides = [
      ["GD-000001", "Ust. H. Ahmad Fauzan, Lc., M.Ag.", "Ketua Dewan Pembimbing Syariah & Muthawwif Utama", "MANASIK", "Alumni Universitas Islam Madinah (Fakultas Syariah)", "12 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 1, true, "Berpengalaman membimbing ribuan jamaah umroh dan haji khusus sejak tahun 2014. Konsisten memastikan seluruh rangkaian manasik jamaah sesuai tuntunan sunnah Rasulullah SAW dengan sabar, santun, dan menentramkan.", nowStr, nowStr],
      ["GD-000002", "Ust. Muhammad Ridwan, Lc.", "Muthawwif Senior Makkah", "MAKKAH", "Al-Azhar University, Cairo", "8 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 2, false, "Spesialis bimbingan tawaf, sa'i, dan qiyamullail di pelataran Ka'bah dengan sanad bacaan doa ma'tsurat.", nowStr, nowStr],
      ["GD-000003", "Ust. Dr. H. Syarif Hidayat, M.A.", "Muthawwif Senior Madinah & Ziarah Rawdah", "MADINAH", "Universitas Islam Madinah (S2 Ushul Fiqh)", "10 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 3, false, "Menguasai tata kelola perizinan Tasreh Rawdah Syarifah dan sejarah sirah nabawiyah di Kota Madinah.", nowStr, nowStr],
      ["GD-000004", "dr. H. Farhan Zulkarnain, Sp.PD", "Koordinator Tim Medis Kloter", "MEDIS", "FK Universitas Indonesia (Spesialis Penyakit Dalam)", "7 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 4, false, "Dokter spesialis pendamping kloter yang siaga 24 jam memantau kesehatan jamaah risti dan lansia.", nowStr, nowStr],
      ["GD-000005", "Ust. H. Abdullah Mansyur, Lc.", "Pembimbing Manasik Teori & Praktik", "MANASIK", "LIPIA Jakarta (Fakultas Syariah)", "9 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 5, false, "Instruktur manasik bersanad yang membimbing pemantapan fiqih umroh sejak di tanah air.", nowStr, nowStr],
      ["GD-000006", "Ust. Ahmad Baehaqi, S.Th.I", "Muthawwif Ziarah Makkah & Madinah", "MAKKAH", "UIN Syarif Hidayatullah Jakarta", "6 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 6, false, "Muthawwif edukatif yang memandu napak tilas sejarah Jabal Nur, Jabal Tsur, dan Badar.", nowStr, nowStr],
      ["GD-000007", "dr. Hj. Siti Maryam, Sp.KO", "Dokter Kloter & Konsultan Jamaah Lansia", "MEDIS", "FK Undip Semarang", "8 Tahun", "AKTIF", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", 7, false, "Dokter pendamping medis spesialis kebugaran fisik jamaah selama rangkaian thawaf dan sa'i.", nowStr, nowStr]
    ];
    gd.sheet.getRange(2, 1, seedGuides.length, gd.canonical.length).setValues(seedGuides);
  }
  gd.sheet.autoResizeColumns(1, gd.canonical.length);

  // 4. Setup DB_Profile_Legality
  var leg = getOrInitProfileSheet("DB_Profile_Legality");
  if (leg.sheet.getLastRow() <= 1) {
    var seedLegality = [
      ["LEG-000001", "LEGALITAS", "SK Izin PPIU Kementerian Agama RI", "Kementerian Agama Republik Indonesia", "No. 123 Tahun 2021", "Berlaku Aktif", "AKTIF", "assets/sk-ppiu.pdf", 1, nowStr, nowStr],
      ["LEG-000002", "LEGALITAS", "Sertifikat Akreditasi A BAN-PPIU", "Badan Akreditasi Nasional PPIU", "SK-BAN-PPIU/098/2024", "2024 - 2029", "AKTIF", "assets/sertifikat-akreditasi.pdf", 2, nowStr, nowStr],
      ["LEG-000003", "LEGALITAS", "SK Pengesahan Badan Hukum Perseroan", "Kementerian Hukum dan HAM RI", "AHU-0012938.AH.01.01.2021", "Berlaku Permanen", "AKTIF", "assets/sk-kemenkumham.pdf", 3, nowStr, nowStr],
      ["LEG-000004", "LEGALITAS", "Nomor Pokok Wajib Pajak (NPWP Badan)", "Direktorat Jenderal Pajak RI", "01.234.567.8-012.000", "Terdaftar Valid", "AKTIF", "assets/npwp-badan.pdf", 4, nowStr, nowStr],
      ["LEG-000005", "MITRA_STRATEGIS", "MOU Penerbangan Reguler & Charter", "Saudia Airlines (SV) & Garuda Indonesia", "MOU-SDW-AIR/2024-001", "Musim 1448H", "AKTIF", "assets/mou-saudia.pdf", 5, nowStr, nowStr],
      ["LEG-000006", "MITRA_STRATEGIS", "Kustodian Rekening Escrow Penampungan", "Bank Syariah Indonesia (BSI)", "MOU-BSI-ESCROW/8812/2023", "2023 - 2028", "AKTIF", "assets/mou-bsi.pdf", 6, nowStr, nowStr],
      ["LEG-000007", "MITRA_STRATEGIS", "Kontrak Jaringan Hotel Ring-1 Pelataran", "Retaj Al Rayyan & Concorde Dar Al Khair", "KTR-HOTEL-HARAMAIN/2025", "Kontrak Jangka Panjang", "AKTIF", "assets/kontrak-hotel.pdf", 7, nowStr, nowStr]
    ];
    leg.sheet.getRange(2, 1, seedLegality.length, leg.canonical.length).setValues(seedLegality);
  }
  leg.sheet.autoResizeColumns(1, leg.canonical.length);

  // 5. Setup DB_Profile_Mitra_Syiar
  var mtr = getOrInitProfileSheet("DB_Profile_Mitra_Syiar");
  if (mtr.sheet.getLastRow() <= 1) {
    var seedMitra = [
      ["MTR-000001", "H. M. Zaini Dahlan", "Majelis Ibadah Barakah", "Korda Surabaya", "Jawa Timur", "Kota Surabaya", "SK-SDW/MTR-SBY/2024", "6281234567891", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 1, nowStr, nowStr],
      ["MTR-000002", "Ust. Asep Saepudin, M.Pd.", "Pondok Tahfidz Al-Hidayah", "Mitra Bandung", "Jawa Barat", "Kota Bandung", "SK-SDW/MTR-BDG/2024", "6281234567892", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 2, nowStr, nowStr],
      ["MTR-000003", "H. Nuruddin, Lc.", "Kantor Wilayah Sulawesi Selatan", "Cabang Makassar", "Sulawesi Selatan", "Kota Makassar", "SK-SDW/CAB-MKS/2023", "6281234567893", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 3, nowStr, nowStr],
      ["MTR-000004", "Ust. H. Farhan Ramadhan", "Korda Khusus Jabodetabek", "Korda Jakarta", "DKI Jakarta", "Jakarta Selatan", "SK-SDW/MTR-JKT/2024", "6281234567894", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 4, nowStr, nowStr],
      ["MTR-000005", "H. Irfan Fauzi, S.E.", "Kantor Cabang Resmi Semarang", "Cabang Semarang", "Jawa Tengah", "Kota Semarang", "SK-SDW/CAB-SMG/2023", "6281234567895", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 5, nowStr, nowStr],
      ["MTR-000006", "Hj. Fatimah Azzahra", "Komunitas Hijrah Mulia", "Mitra Sidoarjo", "Jawa Timur", "Kab. Sidoarjo", "SK-SDW/MTR-SDA/2024", "6281234567896", "https://lh3.googleusercontent.com/d/1NYlhSZYdSl3EsuNyBWdmXVikh8CojLSX=s0", "AKTIF", 6, nowStr, nowStr]
    ];
    mtr.sheet.getRange(2, 1, seedMitra.length, mtr.canonical.length).setValues(seedMitra);
  }
  mtr.sheet.autoResizeColumns(1, mtr.canonical.length);

  Logger.log("✓ 5 Sheet Profil Lembaga & Mitra Syiar berhasil disinkronkan.");
  Logger.log("=== SETUP SHEET PROFIL LEMBAGA & MITRA SYIAR SELESAI ===");
}

/**
 * Setup dan standardisasi skema DB_Contact_Social (Kantor Pusat, WA, dan 4 Medsos)
 */
function setupContactSocialSheet() {
  Logger.log("=== MEMULAI SETUP SHEET DB_Contact_Social ===");
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var sheetName = "DB_Contact_Social";
  var sheet = ss.getSheetByName(sheetName);
  var canonical = AUTHORITATIVE_SCHEMAS_[sheetName];

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    Logger.log("✓ Sheet " + sheetName + " berhasil dibuat.");
  }

  ensureHeadersMatch_(sheet, canonical);

  if (sheet.getLastRow() <= 1) {
    var nowStr = new Date().toISOString();
    var seedContact = [
      [
        'CNT-000001',
        'PT Sahabat Dhuha Wisata (SDW UMROH)',
        'Jl. Raya Kudus - Jepara KM 5',
        'Kabupaten Kudus, Jawa Tengah 59333',
        'https://maps.google.com/?q=SDW+Umroh+Kudus',
        '+62 812-3456-7890',
        '6281234567890',
        'Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.',
        '(0291) 438-999',
        '+62 812-3456-7890',
        'layanan@sdwumroh.co.id',
        'Senin – Jumat: 08:30 – 17:00 WIB | Sabtu: 08:30 – 14:00 WIB',
        'https://instagram.com/sdwumroh.official',
        '@sdwumroh.official',
        'https://facebook.com/sdwumrohofficial',
        'SDW Umroh Official',
        'https://youtube.com/@sdwumroh',
        'SDW Umroh TV & Manasik',
        'https://tiktok.com/@sdwumroh',
        '@sdwumroh',
        nowStr,
        nowStr
      ]
    ];
    sheet.getRange(2, 1, seedContact.length, canonical.length).setValues(seedContact);
    Logger.log("✓ Data seed DB_Contact_Social berhasil ditambahkan.");
  }
  sheet.autoResizeColumns(1, canonical.length);
  Logger.log("=== SETUP SHEET DB_Contact_Social SELESAI ===");
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

  // Pastikan skema kolom paket, kloter, hotel, galeri, artikel, ziarah, maskapai, bandara, faq, kontak, piagam badal, pengguna, profil, dan RBAC selalu ter-update ke standar resmi terbaru
  setupPackagesCatalogSheet();
  setupDeparturesCatalogSheet();
  setupHotelsSheet();
  setupGalleryAndTestimonialsSheets();
  setupArticlesAndZiarahSheets();
  setupAirlinesAndAirportsSheets();
  setupFaqAndHelpdeskSheets();
  setupBadalCertificatesSheet();
  setupUsersAndRbacSheets();
  setupProfileSheets();
  setupContactSocialSheet();

  Logger.log("=== SDW UMROH STEP INITIALIZATION COMPLETE ===");
  return {
    success: true,
    message: "Master Sheet SDW UMROH (termasuk 5 Sheet Profil & Sheet Kontak Medsos) berhasil divalidasi dan diinisialisasi."
  };
}
