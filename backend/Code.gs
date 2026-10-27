/**
 * ============================================================================
 * SDW UMROH — BACKEND WEB APP API CONTROLLER
 * File: Code.gs
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

const CONFIG = {
  APP_NAME: 'SDW UMROH API',
  VERSION: '1.0.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss'
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

  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Audit Logging Helper (Append-Only)
 */
function logAudit_(actor, action, entity, entityId, beforeState, afterState, reason) {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName("DB_Audit_Logs");
    if (!sheet) return;

    const id = "AUD-" + Utilities.getUuid().substring(0, 8).toUpperCase();
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", CONFIG.DATE_FORMAT);

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
    Logger.log("Audit log failed: " + err.message);
  }
}

/**
 * HTTP GET Router
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'ping';

    if (action === 'ping') {
      return createResponse(true, { status: "ONLINE", timestamp: new Date().toISOString() });
    }

    const ss = getSpreadsheet();

    if (action === 'getPackages') {
      const sheet = ss.getSheetByName("DB_Packages");
      if (!sheet) return createResponse(false, null, "Sheet DB_Packages tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      return createResponse(true, items);
    }

    if (action === 'getDepartures') {
      const sheet = ss.getSheetByName("DB_Departures");
      if (!sheet) return createResponse(false, null, "Sheet DB_Departures tidak ditemukan");
      const rows = sheet.getDataRange().getValues();
      const headers = rows[0];
      const items = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
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
      const foundRow = rows.slice(1).find(r => String(r[0]).toUpperCase() === String(regId).toUpperCase());

      if (!foundRow) {
        return createResponse(false, null, "Nomor Pendaftaran tidak ditemukan: " + regId);
      }

      const reg = {};
      headers.forEach((h, i) => reg[h] = foundRow[i]);
      return createResponse(true, reg);
    }

    return createResponse(false, null, "Aksi GET tidak dikenali: " + action);
  } catch (err) {
    return createResponse(false, null, err.message);
  }
}

/**
 * HTTP POST Router (Non-preflight compatible)
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

    const ss = getSpreadsheet();

    // 1. Submit Lead / Prospek Baru
    if (action === 'submitLead') {
      const leadSheet = ss.getSheetByName("DB_Leads");
      const custSheet = ss.getSheetByName("DB_Customers");
      if (!leadSheet || !custSheet) return createResponse(false, null, "Database sheet belum siap");

      const custId = "CUS-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const leadId = "LED-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const now = Utilities.formatDate(new Date(), "Asia/Jakarta", CONFIG.DATE_FORMAT);

      // Simpan Pelanggan / Customer
      custSheet.appendRow([
        custId,
        payload.nik || "-",
        payload.fullName || "Anonim",
        payload.gender || "L",
        payload.birthDate || "-",
        payload.birthPlace || "-",
        payload.phone || "-",
        payload.email || "-",
        payload.address || "-",
        payload.city || "-",
        payload.province || "-",
        now,
        now
      ]);

      // Simpan Lead
      leadSheet.appendRow([
        leadId,
        custId,
        payload.source || "WEBSITE",
        payload.salesOwnerId || "AUTO_ROUTED",
        "NEW",
        payload.urgency || "NORMAL",
        payload.budgetRange || "-",
        payload.notes || "Pendaftaran via Landing Page",
        now,
        now
      ]);

      logAudit_(payload.fullName, "SUBMIT_LEAD", "DB_Leads", leadId, null, { leadId, custId }, "Prospek baru landing page");
      return createResponse(true, { leadId, custId, message: "Prospek berhasil dicatat" });
    }

    // 2. Submit Pendaftaran Jamaah (Booking Paket)
    if (action === 'registerPilgrim') {
      const regSheet = ss.getSheetByName("DB_Registrations");
      const invSheet = ss.getSheetByName("DB_Invoices");
      if (!regSheet || !invSheet) return createResponse(false, null, "Database sheet pendaftaran belum siap");

      const regId = "REG-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const invId = "INV-" + Utilities.getUuid().substring(0, 8).toUpperCase();
      const now = Utilities.formatDate(new Date(), "Asia/Jakarta", CONFIG.DATE_FORMAT);

      const agreedPrice = Number(payload.agreedPrice || 0);
      const discount = Number(payload.discount || 0);
      const finalPrice = Math.max(0, agreedPrice - discount);

      // Simpan Registrasi dengan Commercial Snapshot permanen
      regSheet.appendRow([
        regId,
        payload.customerId || "-",
        payload.departureId || "-",
        payload.packageId || "-",
        payload.roomType || "QUAD",
        agreedPrice,
        discount,
        finalPrice,
        "SUBMITTED",
        payload.salesId || "-",
        payload.notes || "-",
        now,
        now
      ]);

      // Simpan Invoice Awal
      invSheet.appendRow([
        invId,
        regId,
        "INV/SDW/" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMM") + "/" + regId.substring(4),
        finalPrice,
        0,
        finalPrice,
        payload.dueDate || "-",
        "UNPAID",
        now,
        now
      ]);

      logAudit_(payload.actor || "PILGRIM", "REGISTER", "DB_Registrations", regId, null, { regId, finalPrice }, "Pendaftaran paket umroh");
      return createResponse(true, { regId, invId, finalPrice, message: "Pendaftaran berhasil disubmit" });
    }

    return createResponse(false, null, "Aksi POST tidak dikenali: " + action);
  } catch (err) {
    return createResponse(false, null, err.message);
  }
}
