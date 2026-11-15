/**
 * ============================================================================
 * SDW UMROH — FINANCE, INVOICES & ESCROW PAYMENT SERVICE
 * File: 08_FinanceEscrowService.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca seluruh data pembayaran jamaah dengan relasi invoice
 */
function getPayments_(ss) {
  if (!ss) ss = getSpreadsheet();
  const payments = getSheetRowsAsObjects_(ss, "DB_Payments");
  const invoices = getSheetRowsAsObjects_(ss, "DB_Invoices");
  const registrations = getSheetRowsAsObjects_(ss, "DB_Registrations");
  const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

  const invMap = {};
  invoices.forEach(function(i) { invMap[i.id] = i; });

  const regMap = {};
  registrations.forEach(function(r) { regMap[r.id] = r; });

  const custMap = {};
  customers.forEach(function(c) { custMap[c.id] = c; });

  return payments.map(function(pay) {
    const inv = invMap[pay.invoice_id] || {};
    const reg = regMap[inv.registration_id] || {};
    const cust = custMap[reg.customer_id] || {};

    return {
      id: pay.id,
      invoiceId: pay.invoice_id,
      registrationId: inv.registration_id || '-',
      customerName: cust.full_name || '-',
      amount: Number(pay.amount) || 0,
      paymentMethod: pay.payment_method || 'BANK_TRANSFER',
      referenceNumber: pay.reference_number || '-',
      proofUrl: pay.proof_ref_mock || '-',
      status: pay.status || 'PENDING',
      submittedAt: pay.submitted_at || '-',
      verifiedBy: pay.verified_by || '-',
      verifiedAt: pay.verified_at || '-',
      notes: pay.notes || ''
    };
  });
}

/**
 * Mencatat pembayaran baru jamaah (DP / Cicilan / Pelunasan)
 */
function createPayment_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Payments");
  if (!sheet) throw new Error("Sheet DB_Payments tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const newId = payload.id || ("PAY-" + String(sheet.getLastRow()).padStart(6, '0'));
  const row = [
    newId,
    payload.invoiceId || "INV-000001",
    payload.scheduleId || "-",
    Number(payload.amount) || 0,
    payload.paymentMethod || "TRANSFER_BSI",
    payload.referenceNumber || ("TRX-" + Utilities.getUuid().substring(0, 8).toUpperCase()),
    payload.proofUrl || "-",
    payload.status || "PENDING",
    nowStr,
    "-",
    "-",
    payload.notes || "Setoran pembayaran via Portal / PWA"
  ];

  sheet.appendRow(row);
  logAudit_(actor, "CREATE_PAYMENT", "DB_Payments", newId, null, payload, "Pembayaran baru sejumlah Rp " + payload.amount + " disubmit");
  return { id: newId, status: "SUBMITTED", entity: "DB_Payments" };
}

/**
 * Verifikasi bukti pembayaran oleh tim Finance
 */
function verifyPayment_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const paySheet = ss.getSheetByName("DB_Payments");
  if (!paySheet) throw new Error("Sheet DB_Payments tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const payId = payload.paymentId || payload.id;
  const newStatus = payload.status || 'VERIFIED';
  const notes = payload.notes || '';

  const rows = paySheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  const verifiedByIdx = headers.indexOf('verified_by');
  const verifiedAtIdx = headers.indexOf('verified_at');
  const notesIdx = headers.indexOf('notes');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(payId).toUpperCase()) {
      if (statusIdx !== -1) paySheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (verifiedByIdx !== -1) paySheet.getRange(i + 1, verifiedByIdx + 1).setValue(actor || 'FINANCE');
      if (verifiedAtIdx !== -1) paySheet.getRange(i + 1, verifiedAtIdx + 1).setValue(nowStr);
      if (notesIdx !== -1 && notes) paySheet.getRange(i + 1, notesIdx + 1).setValue(notes);

      logAudit_(actor, "VERIFY_PAYMENT", "DB_Payments", payId, null, { status: newStatus }, "Pembayaran diverifikasi oleh finance: " + newStatus);
      return { id: payId, status: newStatus, message: "Pembayaran berhasil diverifikasi" };
    }
  }
  return { id: payId, error: "Pembayaran tidak ditemukan" };
}

/**
 * Upload Bukti Transfer ke Google Drive
 */
function uploadPaymentProof_(payload, actor) {
  if (!payload || !payload.base64Data) {
    throw new Error("Data gambar bukti bayar base64 tidak ditemukan dalam payload");
  }

  const folder = getPasfotoFolder();
  let base64Clean = payload.base64Data;
  let mimeType = payload.mimeType || "image/jpeg";

  if (base64Clean.indexOf(",") !== -1) {
    const parts = base64Clean.split(",");
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
    base64Clean = parts[1];
  }

  const decodedBytes = Utilities.base64Decode(base64Clean);
  const fileName = "BuktiBayar_" + (payload.invoiceId || Utilities.getUuid().substring(0, 8)) + ".jpg";
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}

  const fileId = file.getId();
  const directLink = "https://lh3.googleusercontent.com/d/" + fileId + "=s0";

  logAudit_(actor, "UPLOAD_PAYMENT_PROOF", "Drive_Payments", fileId, null, { fileName: fileName }, "Bukti transfer diunggah");

  return {
    success: true,
    fileId: fileId,
    url: directLink,
    fileName: fileName
  };
}
