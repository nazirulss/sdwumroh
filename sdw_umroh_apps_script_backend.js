/**
 * ============================================================================
 * SDW UMROH — BACKEND PROTOTYPE SERVICE
 * File: Code.gs
 * Version: 1.0.0 (Step 1: Prototype Foundation)
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 * 
 * Master Constraints:
 * - Domain operations through Google Apps Script functions (No frontend raw mutation)
 * - Authoritative single Google Spreadsheet backend
 * - Append-only Audit Log simulation
 * - Safe error boundaries and standardized response envelopes
 */

// Konfigurasi Properties
const CONFIG = {
  APP_NAME: 'SDW UMROH PROTOTYPE',
  VERSION: '1.0.0-STEP1',
  SCHEMA_VERSION: '1.0.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss'
};

/**
 * Metadata Master 22 Sheet & Skema Header
 */
const SCHEMA_DEFINITIONS = {
  'DB_Users': ['id', 'name', 'email', 'role', 'status', 'phone', 'created_at', 'updated_at'],
  'DB_Customers': ['id', 'nik', 'full_name', 'gender', 'birth_date', 'birth_place', 'phone', 'email', 'address', 'city', 'province', 'created_at', 'updated_at'],
  'DB_Leads': ['id', 'customer_id', 'source', 'sales_owner_id', 'status', 'urgency', 'budget_range', 'notes', 'created_at', 'updated_at'],
  'DB_Sales_Activities': ['id', 'lead_id', 'actor_id', 'activity_type', 'summary', 'outcome', 'timestamp'],
  'DB_Follow_Ups': ['id', 'lead_id', 'sales_owner_id', 'scheduled_at', 'channel', 'notes', 'status', 'completed_at'],
  'DB_Packages': ['id', 'name', 'slug', 'package_type', 'duration_days', 'status', 'description', 'published_at', 'created_at'],
  'DB_Package_Prices': ['id', 'package_id', 'currency', 'quad_price', 'triple_price', 'double_price', 'effective_start', 'effective_end', 'status'],
  'DB_Departures': ['id', 'package_id', 'departure_date', 'return_date', 'airline', 'origin_airport', 'capacity_total', 'capacity_booked', 'status', 'notes'],
  'DB_Registrations': ['id', 'customer_id', 'departure_id', 'package_id', 'room_type', 'agreed_price_snapshot', 'discount_snapshot', 'final_price_snapshot', 'status', 'sales_id', 'notes', 'created_at', 'updated_at'],
  'DB_Document_Requirements': ['id', 'code', 'title', 'description', 'is_mandatory', 'applies_to_gender', 'max_expiry_months'],
  'DB_Pilgrim_Documents': ['id', 'registration_id', 'requirement_id', 'file_name', 'file_ref_mock', 'status', 'review_notes', 'verified_by', 'verified_at', 'updated_at'],
  'DB_Invoices': ['id', 'registration_id', 'invoice_number', 'total_amount', 'paid_amount', 'outstanding_amount', 'due_date', 'status', 'created_at', 'updated_at'],
  'DB_Payment_Schedules': ['id', 'invoice_id', 'term_number', 'title', 'amount', 'due_date', 'status'],
  'DB_Payments': ['id', 'invoice_id', 'schedule_id', 'amount', 'payment_method', 'reference_number', 'proof_ref_mock', 'status', 'submitted_at', 'verified_by', 'verified_at', 'notes'],
  'DB_Refunds': ['id', 'registration_id', 'invoice_id', 'amount_requested', 'cancellation_fee', 'amount_approved', 'status', 'reason', 'requested_at', 'processed_at'],
  'DB_Preparation': ['id', 'registration_id', 'dimension', 'item_name', 'status', 'notes', 'updated_at'],
  'DB_Manasik': ['id', 'departure_id', 'session_title', 'session_type', 'scheduled_at', 'location', 'muthawwif_id', 'status'],
  'DB_Trips': ['id', 'departure_id', 'trip_code', 'lead_tour_leader_id', 'muthawwif_id', 'status', 'started_at', 'ended_at'],
  'DB_Trip_Members': ['id', 'trip_id', 'registration_id', 'bus_number', 'makkah_room_number', 'madinah_room_number', 'special_assistance'],
  'DB_Announcements': ['id', 'target_role', 'departure_id', 'title', 'body_content', 'priority', 'published_at', 'created_by'],
  'DB_Notifications': ['id', 'user_id', 'title', 'message', 'category', 'is_read', 'action_link', 'created_at'],
  'DB_Audit_Logs': ['id', 'timestamp', 'actor', 'action', 'entity', 'entity_id', 'before', 'after', 'reason']
};

/**
 * Standard Response Envelope Helper
 */
function createResponse(success, data, error, metadata) {
  return {
    success: Boolean(success),
    data: data || null,
    error: error || null,
    metadata: Object.assign({
      system: CONFIG.APP_NAME,
      version: CONFIG.VERSION,
      timestamp: new Date().toISOString()
    }, metadata || {})
  };
}

/**
 * Mendapatkan referensi Spreadsheet aktif atau fallback ID
 */
function getDatabase() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {
    // Apabila dijalankan standalone dengan Script Properties SPREADSHEET_ID
  }
  const propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (propId) {
    return SpreadsheetApp.openById(propId);
  }
  throw new Error('Spreadsheet tidak terhubung. Jalankan fungsi di Spreadsheet bound script atau konfigurasikan SPREADSHEET_ID.');
}

/**
 * Web App Entry Point (GET)
 * Mendukung rendering HTML langsung atau respon JSON jika dipanggil via client REST
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.api === 'true') {
    const action = e.parameter.action || 'healthCheck';
    let result;
    if (action === 'healthCheck') {
      result = testConnection();
    } else if (action === 'schemaOverview') {
      result = getDatabaseOverview();
    } else if (action === 'readWriteTest') {
      result = performReadWriteTest('WEBAPP_CLIENT');
    } else {
      result = createResponse(false, null, 'Action tidak dikenali: ' + action);
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Render file index.html jika diakses langsung di browser
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('SDW UMROH — Prototype Foundation')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Web App Entry Point (POST)
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents || '{}');
    const action = contents.action;
    const payload = contents.payload || {};

    if (action === 'readWriteTest') {
      const res = performReadWriteTest(payload.actor || 'API_USER');
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'initDatabase') {
      const res = initDatabase();
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify(createResponse(false, null, 'Unknown action: ' + action)))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify(createResponse(false, null, err.message)))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 1. INITIALIZE DATABASE
 * Membuat semua 22 sheet yang dibutuhkan secara otomatis dengan header terformat rapi
 */
function initDatabase() {
  try {
    const ss = getDatabase();
    const existingSheets = ss.getSheets().map(s => s.getName());
    const createdSheets = [];
    const existingCount = [];

    for (const sheetName in SCHEMA_DEFINITIONS) {
      let sheet;
      if (existingSheets.indexOf(sheetName) === -1) {
        sheet = ss.insertSheet(sheetName);
        createdSheets.push(sheetName);
      } else {
        sheet = ss.getSheetByName(sheetName);
        existingCount.push(sheetName);
      }

      // Pastikan header terpasang di baris 1
      const headers = SCHEMA_DEFINITIONS[sheetName];
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setValues([headers]);
      range.setFontWeight('bold');
      range.setBackground('#0F3D2E'); // SDW Umroh Signature Pine Green
      range.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }

    // Catat ke Audit Log
    logAudit('SYSTEM_BOOTSTRAP', 'INIT_DATABASE', 'SYSTEM', 'SYS-SCHEMA', '', '22 Sheets configured', 'Inisialisasi Foundation Prototype');

    return createResponse(true, {
      totalDefined: Object.keys(SCHEMA_DEFINITIONS).length,
      created: createdSheets,
      alreadyExisted: existingCount
    }, null, { message: 'Inisialisasi 22 sheet SDW UMROH berhasil.' });
  } catch (err) {
    return createResponse(false, null, err.message);
  }
}

/**
 * 2. TEST CONNECTION (Health Check)
 * Memverifikasi integritas koneksi Apps Script ke Google Spreadsheet
 */
function testConnection() {
  const startTime = new Date().getTime();
  try {
    const ss = getDatabase();
    const sheets = ss.getSheets().map(s => ({
      name: s.getName(),
      rows: s.getLastRow(),
      cols: s.getLastColumn()
    }));

    const executionTimeMs = new Date().getTime() - startTime;
    return createResponse(true, {
      status: 'HEALTHY',
      spreadsheetName: ss.getName(),
      spreadsheetId: ss.getId(),
      url: ss.getUrl(),
      totalSheets: sheets.length,
      sheets: sheets,
      latencyMs: executionTimeMs,
      serverTime: new Date().toISOString()
    }, null, { connection: 'ESTABLISHED' });
  } catch (err) {
    return createResponse(false, null, err.message, {
      latencyMs: new Date().getTime() - startTime,
      connection: 'FAILED'
    });
  }
}

/**
 * 3. GET DATABASE OVERVIEW
 * Memberikan inspeksi komparatif antara sheet yang ada dan master schema 00-19
 */
function getDatabaseOverview() {
  try {
    const ss = getDatabase();
    const existing = ss.getSheets().map(s => s.getName());
    const schemaStatus = {};

    for (const sheetName in SCHEMA_DEFINITIONS) {
      const isPresent = existing.indexOf(sheetName) !== -1;
      let rowCount = 0;
      if (isPresent) {
        rowCount = ss.getSheetByName(sheetName).getLastRow();
      }
      schemaStatus[sheetName] = {
        present: isPresent,
        expectedColumns: SCHEMA_DEFINITIONS[sheetName].length,
        columns: SCHEMA_DEFINITIONS[sheetName],
        rowCount: rowCount
      };
    }

    return createResponse(true, {
      totalRequired: Object.keys(SCHEMA_DEFINITIONS).length,
      sheets: schemaStatus
    });
  } catch (err) {
    return createResponse(false, null, err.message);
  }
}

/**
 * 4. PERFORM READ/WRITE TEST (Roundtrip verification)
 * Menulis record uji ke DB_Audit_Logs, membacanya kembali, dan memvalidasi integritas data
 */
function performReadWriteTest(actorName) {
  const startTime = new Date().getTime();
  const actor = actorName || 'PROTOTYPE_RUNNER';
  const testId = 'AUD-TEST-' + Math.floor(100000 + Math.random() * 900000);
  const nowStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

  try {
    const ss = getDatabase();
    let auditSheet = ss.getSheetByName('DB_Audit_Logs');

    if (!auditSheet) {
      // Otomatis bootstrap jika sheet belum ada
      initDatabase();
      auditSheet = ss.getSheetByName('DB_Audit_Logs');
    }

    const testPayload = [
      testId,
      nowStr,
      actor,
      'CONNECTION_READ_WRITE_VERIFICATION',
      'DIAGNOSTIC',
      'TEST-CORE',
      'STATE_INITIAL',
      'STATE_VERIFIED_SUCCESS',
      'Validasi roundtrip komunikasi index.html -> Code.gs -> Google Spreadsheet'
    ];

    // 1. Tulis (WRITE)
    auditSheet.appendRow(testPayload);
    const writeTime = new Date().getTime();

    // 2. Baca kembali baris terakhir (READ)
    const lastRow = auditSheet.getLastRow();
    const readValues = auditSheet.getRange(lastRow, 1, 1, testPayload.length).getValues()[0];
    const readTime = new Date().getTime();

    // 3. Verifikasi checksum ID
    const isIdMatching = (readValues[0] === testId);

    if (!isIdMatching) {
      throw new Error('Verifikasi Gagal: ID yang dibaca (' + readValues[0] + ') tidak cocok dengan yang ditulis (' + testId + ')');
    }

    return createResponse(true, {
      testId: testId,
      writtenRow: lastRow,
      verifiedRecord: {
        id: readValues[0],
        timestamp: readValues[1],
        actor: readValues[2],
        action: readValues[3],
        entity: readValues[4],
        entityId: readValues[5],
        before: readValues[6],
        after: readValues[7],
        reason: readValues[8]
      },
      timings: {
        writeLatencyMs: writeTime - startTime,
        readLatencyMs: readTime - writeTime,
        totalRoundtripMs: readTime - startTime
      },
      verificationStatus: 'PASSED'
    }, null, { message: 'Read/Write roundtrip valid dan terverifikasi.' });
  } catch (err) {
    return createResponse(false, null, err.message, {
      totalRoundtripMs: new Date().getTime() - startTime,
      verificationStatus: 'FAILED'
    });
  }
}

/**
 * 5. AUDIT LOG HELPER (Section 8 Blueprint)
 * Digunakan oleh seluruh domain backend services untuk mencatat mutasi
 */
function logAudit(actor, action, entity, entityId, beforeVal, afterVal, reason) {
  try {
    const ss = getDatabase();
    let auditSheet = ss.getSheetByName('DB_Audit_Logs');
    if (!auditSheet) return;

    const count = auditSheet.getLastRow();
    const auditId = 'AUD-' + ('000000' + count).slice(-6);
    const nowStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    auditSheet.appendRow([
      auditId,
      nowStr,
      actor || 'SYSTEM',
      action || 'UNKNOWN_ACTION',
      entity || 'GENERAL',
      entityId || '-',
      typeof beforeVal === 'object' ? JSON.stringify(beforeVal) : String(beforeVal || ''),
      typeof afterVal === 'object' ? JSON.stringify(afterVal) : String(afterVal || ''),
      reason || '-'
    ]);
  } catch (e) {
    Logger.log('Gagal mencatat audit log: ' + e.message);
  }
}