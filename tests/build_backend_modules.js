/**
 * tests/build_backend_modules.js
 * Modularizes backend/Code.gs and backend/Setup.gs into 14 clean Apps Script files.
 */
const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('backend');
const ARCHIVE_CODE = path.resolve('archive/backend_monolith/Code.gs');
const ARCHIVE_SETUP = path.resolve('archive/backend_monolith/Setup.gs');

const code = fs.readFileSync(ARCHIVE_CODE, 'utf8');
const setup = fs.readFileSync(ARCHIVE_SETUP, 'utf8');

console.log('Original Code.gs length:', code.length);
console.log('Original Setup.gs length:', setup.length);

// -------------------------------------------------------------
// 1. 00_Config.gs
// -------------------------------------------------------------
const file00 = `/**
 * ============================================================================
 * SDW UMROH — CONFIGURATION & CORE ENVIRONMENT
 * File: 00_Config.gs
 * Version: 2.5.0 (Pola Asnawiyyah Modular Architecture)
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

const CONFIG = {
  APP_NAME: 'SDW UMROH API',
  VERSION: '2.5.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  SPREADSHEET_ID: '1UTZ2uJ76rxAljWlfOLx3MpCzV2e4JLUG5IJ7o8SZn3Q',
  DRIVE_FOLDER_ID: '1Xz5QTa68fcipY9BN_vIXsdLklH6bws-J',
  PASFOTO_FOLDER_NAME: 'Pasfoto_Sertifikat',
  PROFILE_FOLDER_NAME: 'Foto_Profil_Lembaga',
  DEFAULT_SALT: 'SDW_UMROH_SECURE_SALT_2026_KHIDMAT',
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    DIRECTOR: 'DIRECTOR',
    FINANCE: 'FINANCE',
    OPERATIONS: 'OPERATIONS',
    SALES: 'SALES',
    MUTHAWWIF: 'MUTHAWWIF',
    PILGRIM: 'PILGRIM'
  }
};

/**
 * Mendapatkan referensi instance Spreadsheet aktif atau via SPREADSHEET_ID
 */
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
 * Helper: Mengambil atau membuat sub-folder Pasfoto_Sertifikat di Google Drive
 */
function getPasfotoFolder() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== '__SDW_CONFIG_PENDING__') {
    try {
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      if (parentFolder) {
        const subFolders = parentFolder.getFoldersByName(CONFIG.PASFOTO_FOLDER_NAME);
        if (subFolders.hasNext()) {
          return subFolders.next();
        }
        return parentFolder.createFolder(CONFIG.PASFOTO_FOLDER_NAME);
      }
    } catch (e) {
      Logger.log("getPasfotoFolder parent error: " + e.message);
    }
  }

  try {
    const folders = DriveApp.getFoldersByName(CONFIG.PASFOTO_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(CONFIG.PASFOTO_FOLDER_NAME);
  } catch (e) {
    Logger.log("getPasfotoFolder root error: " + e.message);
    throw new Error("Gagal mengakses folder Pasfoto_Sertifikat di Google Drive: " + e.message);
  }
}

/**
 * Helper: Mengambil atau membuat sub-folder Foto_Profil_Lembaga di Google Drive
 */
function getProfileFolder_() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== '__SDW_CONFIG_PENDING__') {
    try {
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      if (parentFolder) {
        const subFolders = parentFolder.getFoldersByName(CONFIG.PROFILE_FOLDER_NAME);
        if (subFolders.hasNext()) {
          return subFolders.next();
        }
        return parentFolder.createFolder(CONFIG.PROFILE_FOLDER_NAME);
      }
    } catch (e) {
      Logger.log("getProfileFolder_ error: " + e.message);
    }
  }
  try {
    const folders = DriveApp.getFoldersByName(CONFIG.PROFILE_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(CONFIG.PROFILE_FOLDER_NAME);
  } catch (e) {
    Logger.log("getProfileFolder_ fallback error: " + e.message);
    return null;
  }
}

/**
 * Jalankan fungsi ini 1x di editor untuk menyetujui izin Google Drive
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

/**
 * Diagnostic upload test
 */
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
`;

fs.writeFileSync(path.join(BACKEND_DIR, '00_Config.gs'), file00, 'utf8');
console.log('✅ Created 00_Config.gs');

// -------------------------------------------------------------
// 2. 01_Utils.gs
// -------------------------------------------------------------
const file01 = `/**
 * ============================================================================
 * SDW UMROH — UTILITIES & FORMATTING ENGINE
 * File: 01_Utils.gs
 * ============================================================================
 */

/**
 * Standar output response JSON API
 */
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

/**
 * Format tanggal aman ke Waktu Indonesia Barat (WIB)
 */
function formatDateSafe_(date) {
  if (!date) return '-';
  if (!(date instanceof Date)) {
    try {
      date = new Date(date);
    } catch (e) {
      return String(date);
    }
  }
  if (isNaN(date.getTime())) return '-';
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
    if (!ss) ss = getSpreadsheet();
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
 * Helper untuk membaca objek dari instance Sheet langsung dengan nomor baris
 */
function getSheetDataAsObjects(sh) {
  if (!sh) return [];
  const rows = sh.getDataRange().getValues();
  if (!rows || rows.length <= 1) return [];
  const headers = rows[0];
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && row[0] !== 0) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      let val = row[c];
      if (val instanceof Date) {
        val = formatDateSafe_(val);
      }
      obj[headers[c]] = val;
    }
    obj._rowIndex = i + 1;
    results.push(obj);
  }
  return results;
}

/**
 * Normalisasi nomor WhatsApp / telepon ke format internasional 62
 */
function normalizePhone_(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  } else if (clean.startsWith('8')) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Helper untuk auto-resize lebar kolom
 */
function autoResizeSheetColumns_(sheet) {
  try {
    const numCols = sheet.getLastColumn();
    if (numCols > 0) {
      sheet.autoResizeColumns(1, Math.min(numCols, 20));
    }
  } catch (e) {}
}
`;

fs.writeFileSync(path.join(BACKEND_DIR, '01_Utils.gs'), file01, 'utf8');
console.log('✅ Created 01_Utils.gs');

// -------------------------------------------------------------
// 3. 02_AuditLogger.gs
// -------------------------------------------------------------
const file02 = `/**
 * ============================================================================
 * SDW UMROH — FORENSIC AUDIT LOGGER
 * File: 02_AuditLogger.gs
 * ============================================================================
 */

/**
 * Audit Logging Helper (Append-Only ke DB_Audit_Logs)
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

/**
 * Query riwayat audit log dengan filter
 */
function queryAuditLogs_(ss, filters) {
  if (!ss) ss = getSpreadsheet();
  const rows = getSheetRowsAsObjects_(ss, "DB_Audit_Logs");
  if (!filters) return rows;

  return rows.filter(function(log) {
    if (filters.entity && log.entity !== filters.entity) return false;
    if (filters.actor && log.actor !== filters.actor) return false;
    if (filters.action && log.action !== filters.action) return false;
    return true;
  });
}
`;

fs.writeFileSync(path.join(BACKEND_DIR, '02_AuditLogger.gs'), file02, 'utf8');
console.log('✅ Created 02_AuditLogger.gs');
