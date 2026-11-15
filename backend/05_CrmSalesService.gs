/**
 * ============================================================================
 * SDW UMROH — CRM & SALES MANAGEMENT SERVICE
 * File: 05_CrmSalesService.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca data prospek (Leads) dengan relasi customer
 */
function getLeads_(ss, filters) {
  if (!ss) ss = getSpreadsheet();
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

  if (!filters) return mapped;
  return mapped.filter(function(item) {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.owner && item.owner !== filters.owner) return false;
    return true;
  });
}

/**
 * Menambahkan Prospek Baru (Lead)
 */
function createLead_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Leads");
  if (!sheet) throw new Error("Sheet DB_Leads tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
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

/**
 * Memperbarui status prospek (Leads)
 */
function updateLeadStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Leads");
  if (!sheet) throw new Error("Sheet DB_Leads tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  const ownerIdx = headers.indexOf('sales_owner_id');
  const updatedIdx = headers.indexOf('updated_at');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(payload.id).toUpperCase()) {
      if (statusIdx !== -1 && payload.status) {
        sheet.getRange(i + 1, statusIdx + 1).setValue(payload.status);
      }
      if (ownerIdx !== -1 && payload.owner) {
        sheet.getRange(i + 1, ownerIdx + 1).setValue(payload.owner);
      }
      if (updatedIdx !== -1) {
        sheet.getRange(i + 1, updatedIdx + 1).setValue(nowStr);
      }
      logAudit_(actor, "UPDATE_LEAD_STATUS", "DB_Leads", payload.id, null, payload, "Status lead diubah ke " + payload.status);
      return { id: payload.id, status: payload.status, entity: "DB_Leads" };
    }
  }
  return { id: payload.id, error: "Lead tidak ditemukan" };
}

/**
 * Membaca riwayat aktivitas sales
 */
function getSalesActivities_(ss, filters) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Sales_Activities");
}

/**
 * Mencatat aktivitas sales baru
 */
function saveSalesActivity_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Sales_Activities");
  if (!sheet) throw new Error("Sheet DB_Sales_Activities tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const newId = payload.id || ("ACT-" + String(sheet.getLastRow()).padStart(6, '0'));
  const row = [
    newId,
    payload.leadId || "-",
    actor || payload.actorId || "SALES",
    payload.activityType || "CALL",
    payload.summary || "-",
    payload.outcome || "INTERESTED",
    nowStr
  ];
  sheet.appendRow(row);
  return { id: newId, status: "SAVED", entity: "DB_Sales_Activities" };
}
