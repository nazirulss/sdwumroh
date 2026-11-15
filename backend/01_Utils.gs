/**
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
