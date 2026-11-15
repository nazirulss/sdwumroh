/**
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
