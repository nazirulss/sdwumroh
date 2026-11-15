const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve('backend');

// ---------------------------------------------------------------------------
// 07_RegistrationsPilgrims.gs
// ---------------------------------------------------------------------------
const file07 = `/**
 * ============================================================================
 * SDW UMROH — REGISTRATIONS, PILGRIM PASSPORT & VISA SERVICE
 * File: 07_RegistrationsPilgrims.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca daftar seluruh pendaftaran jamaah dengan relasi Customer & Paket
 */
function getRegistrations_(ss) {
  if (!ss) ss = getSpreadsheet();
  const regs = getSheetRowsAsObjects_(ss, "DB_Registrations");
  const customers = getSheetRowsAsObjects_(ss, "DB_Customers");
  const packages = getSheetRowsAsObjects_(ss, "DB_Packages");
  const departures = getSheetRowsAsObjects_(ss, "DB_Departures");

  const custMap = {};
  customers.forEach(function(c) { custMap[c.id] = c; });

  const pkgMap = {};
  packages.forEach(function(p) { pkgMap[p.id] = p; });

  const depMap = {};
  departures.forEach(function(d) { depMap[d.id] = d; });

  return regs.map(function(reg) {
    const cust = custMap[reg.customer_id] || {};
    const pkg = pkgMap[reg.package_id] || {};
    const dep = depMap[reg.departure_id] || {};

    return {
      id: reg.id,
      registrationNumber: reg.id,
      customerId: reg.customer_id,
      customerName: cust.full_name || reg.customer_id,
      nik: cust.nik || '-',
      gender: cust.gender || '-',
      phone: cust.phone || '-',
      email: cust.email || '-',
      packageId: reg.package_id,
      packageName: pkg.name || reg.package_id,
      departureId: reg.departure_id,
      departureDate: dep.departure_date ? formatDateSafe_(dep.departure_date) : '-',
      roomType: reg.room_type || 'QUAD',
      agreedPrice: Number(reg.agreed_price_snapshot) || 0,
      discount: Number(reg.discount_snapshot) || 0,
      finalPrice: Number(reg.final_price_snapshot) || 0,
      status: reg.status || 'DRAFT',
      salesId: reg.sales_id || '-',
      notes: reg.notes || '',
      createdAt: reg.created_at,
      updatedAt: reg.updated_at
    };
  });
}

/**
 * Cek status pendaftaran jamaah via NIK atau Nomor Pendaftaran
 */
function checkRegistration_(ss, query) {
  if (!ss) ss = getSpreadsheet();
  query = String(query || '').trim().toLowerCase();
  if (!query) return null;

  const regs = getRegistrations_(ss);
  return regs.find(function(r) {
    return String(r.id).toLowerCase() === query ||
           String(r.nik).toLowerCase() === query ||
           String(r.phone).replace(/[^0-9]/g, '').endsWith(query.replace(/[^0-9]/g, ''));
  }) || null;
}

/**
 * Konfirmasi pendaftaran jamaah & verifikasi booking DP
 */
function confirmRegistration_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const regSheet = ss.getSheetByName("DB_Registrations");
  if (!regSheet) throw new Error("Sheet DB_Registrations tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const regId = payload.registrationId || payload.id;
  const rows = regSheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  const updatedIdx = headers.indexOf('updated_at');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(regId).toUpperCase()) {
      const newStatus = payload.status || 'CONFIRMED';
      if (statusIdx !== -1) regSheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (updatedIdx !== -1) regSheet.getRange(i + 1, updatedIdx + 1).setValue(nowStr);

      logAudit_(actor, "CONFIRM_REGISTRATION", "DB_Registrations", regId, null, payload, "Pendaftaran jamaah dikonfirmasi ke status " + newStatus);
      return { id: regId, status: newStatus, message: "Pendaftaran berhasil dikonfirmasi" };
    }
  }
  return { id: regId, error: "Pendaftaran tidak ditemukan" };
}

/**
 * Membaca berkas dokumen persyaratan jamaah (Paspor, KTP, Buku Nikah, Vaksin)
 */
function getPilgrimDocuments_(ss, regId) {
  if (!ss) ss = getSpreadsheet();
  const docs = getSheetRowsAsObjects_(ss, "DB_Pilgrim_Documents");
  const reqs = getSheetRowsAsObjects_(ss, "DB_Document_Requirements");
  const reqMap = {};
  reqs.forEach(function(r) { reqMap[r.id] = r; });

  const filtered = regId ? docs.filter(function(d) { return d.registration_id === regId; }) : docs;
  return filtered.map(function(doc) {
    const r = reqMap[doc.requirement_id] || {};
    return {
      id: doc.id,
      registrationId: doc.registration_id,
      requirementId: doc.requirement_id,
      requirementCode: r.code || '-',
      requirementTitle: r.title || doc.requirement_id,
      isMandatory: r.is_mandatory !== undefined ? r.is_mandatory : true,
      fileName: doc.file_name || '-',
      fileUrl: doc.file_ref_mock || '-',
      status: doc.status || 'PENDING',
      reviewNotes: doc.review_notes || '',
      verifiedBy: doc.verified_by || '-',
      verifiedAt: doc.verified_at || '-',
      updatedAt: doc.updated_at
    };
  });
}

/**
 * Verifikasi berkas dokumen oleh staf operasional (APPROVED / REJECTED)
 */
function verifyDocument_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const docSheet = ss.getSheetByName("DB_Pilgrim_Documents");
  if (!docSheet) throw new Error("Sheet DB_Pilgrim_Documents tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const docId = payload.docId || payload.id;
  const newStatus = payload.status || 'VERIFIED';
  const notes = payload.notes || payload.reviewNotes || '';

  const rows = docSheet.getDataRange().getValues();
  const headers = rows[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  const notesIdx = headers.indexOf('review_notes');
  const verifiedByIdx = headers.indexOf('verified_by');
  const verifiedAtIdx = headers.indexOf('verified_at');
  const updatedIdx = headers.indexOf('updated_at');

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]).toUpperCase() === String(docId).toUpperCase()) {
      if (statusIdx !== -1) docSheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (notesIdx !== -1) docSheet.getRange(i + 1, notesIdx + 1).setValue(notes);
      if (verifiedByIdx !== -1) docSheet.getRange(i + 1, verifiedByIdx + 1).setValue(actor || 'OPS_STAFF');
      if (verifiedAtIdx !== -1) docSheet.getRange(i + 1, verifiedAtIdx + 1).setValue(nowStr);
      if (updatedIdx !== -1) docSheet.getRange(i + 1, updatedIdx + 1).setValue(nowStr);

      logAudit_(actor, "VERIFY_DOCUMENT", "DB_Pilgrim_Documents", docId, null, { status: newStatus, notes: notes }, "Dokumen diverifikasi: " + newStatus);
      return { id: docId, status: newStatus, message: "Dokumen berhasil diverifikasi" };
    }
  }
  return { id: docId, error: "Dokumen tidak ditemukan" };
}

/**
 * Upload Pasfoto Jamaah ke Google Drive
 */
function uploadPilgrimPhoto_(payload, actor) {
  if (!payload || !payload.base64Data) {
    throw new Error("Data gambar base64 tidak ditemukan dalam payload");
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
  const fileName = payload.fileName || ("Pasfoto_" + (payload.nik || payload.id || Utilities.getUuid().substring(0, 8)) + ".jpg");
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  const file = folder.createFile(blob);

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    Logger.log("Sharing permission warning: " + e.message);
  }

  const fileId = file.getId();
  const directLink = "https://lh3.googleusercontent.com/d/" + fileId + "=s0";

  logAudit_(actor, "UPLOAD_PILGRIM_PHOTO", "Drive_Pasfoto", fileId, null, { fileName: fileName }, "Pasfoto berhasil diunggah");

  return {
    success: true,
    fileId: fileId,
    url: directLink,
    fileName: fileName
  };
}
`;

fs.writeFileSync(path.join(BACKEND_DIR, '07_RegistrationsPilgrims.gs'), file07, 'utf8');
console.log('✅ Created 07_RegistrationsPilgrims.gs');

// ---------------------------------------------------------------------------
// 08_FinanceEscrowService.gs
// ---------------------------------------------------------------------------
const file08 = `/**
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
`;

fs.writeFileSync(path.join(BACKEND_DIR, '08_FinanceEscrowService.gs'), file08, 'utf8');
console.log('✅ Created 08_FinanceEscrowService.gs');

// ---------------------------------------------------------------------------
// 09_OperationsFieldService.gs
// ---------------------------------------------------------------------------
const file09 = `/**
 * ============================================================================
 * SDW UMROH — FIELD OPERATIONS, MANIFEST, BUS & ROOMING SERVICE
 * File: 09_OperationsFieldService.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca manifes keberangkatan kloter
 */
function getManifest_(ss, kloterId) {
  if (!ss) ss = getSpreadsheet();
  const members = getSheetRowsAsObjects_(ss, "DB_Trip_Members");
  const registrations = getSheetRowsAsObjects_(ss, "DB_Registrations");
  const customers = getSheetRowsAsObjects_(ss, "DB_Customers");

  const regMap = {};
  registrations.forEach(function(r) { regMap[r.id] = r; });

  const custMap = {};
  customers.forEach(function(c) { custMap[c.id] = c; });

  return members.map(function(m) {
    const reg = regMap[m.registration_id] || {};
    const cust = custMap[reg.customer_id] || {};

    return {
      id: m.id,
      tripId: m.trip_id,
      registrationId: m.registration_id,
      customerName: cust.full_name || '-',
      gender: cust.gender || '-',
      passportNumber: cust.passport_number || cust.nik || '-',
      busNumber: m.bus_number || 'Bus 1',
      makkahRoomNumber: m.makkah_room_number || '-',
      madinahRoomNumber: m.madinah_room_number || '-',
      specialAssistance: m.special_assistance || 'NONE'
    };
  });
}

/**
 * Membaca data destinasi ziarah suci
 */
function getZiarahPlaces_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Ziarah_Places");
}

function saveZiarahPlace_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Ziarah_Places");
  if (!sheet) throw new Error("Sheet DB_Ziarah_Places tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  let id = payload.id;
  let rowIndex = -1;

  if (id) {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  if (!id) {
    id = "ZRH-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    name: payload.name || 'Tempat Ziarah Baru',
    city: payload.city || 'Makkah',
    location_tag: payload.location_tag || 'Jabal Tsur',
    distance_text: payload.distance_text || '15 Menit dari Hotel',
    historical_summary: payload.historical_summary || '',
    sunnah_tips: payload.sunnah_tips || '',
    image_url: payload.image_url || 'assets/ziarah-default.webp',
    maps_url: payload.maps_url || '',
    order_index: Number(payload.order_index) || rows.length,
    status: payload.status || 'PUBLISHED',
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_ZIARAH" : "CREATE_ZIARAH", "DB_Ziarah_Places", id, null, payload, "Destinasi ziarah '" + rowObj.name + "' disimpan");
  return { id: id, name: rowObj.name, entity: "DB_Ziarah_Places" };
}

function deleteZiarahPlace_(ss, ziarahId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Ziarah_Places");
  if (!sheet) throw new Error("Sheet DB_Ziarah_Places tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(ziarahId).toUpperCase()) {
      sheet.getRange(i + 1, 11).setValue('DRAFT');
      logAudit_(actor, "ARCHIVE_ZIARAH", "DB_Ziarah_Places", ziarahId, null, null, "Destinasi ziarah diarsipkan");
      return { id: ziarahId, action: 'DRAFT', message: "Destinasi ziarah diarsipkan" };
    }
  }
  return { id: ziarahId, error: "Destinasi ziarah tidak ditemukan" };
}

function getPreparation_(ss, regId) {
  if (!ss) ss = getSpreadsheet();
  const prep = getSheetRowsAsObjects_(ss, "DB_Preparation");
  return regId ? prep.filter(function(p) { return p.registration_id === regId; }) : prep;
}

function updatePreparation_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Preparation");
  if (!sheet) throw new Error("Sheet DB_Preparation tidak ditemukan");
  const nowStr = formatDateSafe_(new Date());
  const id = payload.id;
  const status = payload.status || 'CHECKED';

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 4).setValue(status);
      sheet.getRange(i + 1, 6).setValue(nowStr);
      return { id: id, status: status, message: "Persiapan diperbarui" };
    }
  }
  return { id: id, error: "Item persiapan tidak ditemukan" };
}

function getManasik_(ss, depId) {
  if (!ss) ss = getSpreadsheet();
  const manasik = getSheetRowsAsObjects_(ss, "DB_Manasik");
  return depId ? manasik.filter(function(m) { return m.departure_id === depId; }) : manasik;
}

function updateManasik_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Manasik");
  if (!sheet) throw new Error("Sheet DB_Manasik tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'COMPLETED';

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 7).setValue(status);
      return { id: id, status: status, message: "Status manasik diperbarui" };
    }
  }
  return { id: id, error: "Sesi manasik tidak ditemukan" };
}
`;

fs.writeFileSync(path.join(BACKEND_DIR, '09_OperationsFieldService.gs'), file09, 'utf8');
console.log('✅ Created 09_OperationsFieldService.gs');

// ---------------------------------------------------------------------------
// 10_CertificatesBadalService.gs
// ---------------------------------------------------------------------------
const file10 = `/**
 * ============================================================================
 * SDW UMROH — CERTIFICATES & BADAL UMROH SERVICE
 * File: 10_CertificatesBadalService.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca daftar sertifikat badal umroh
 */
function getBadalCertificates_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Badal_Certificates");
}

/**
 * Menyimpan / memperbarui sertifikat badal umroh
 */
function saveBadalCertificate_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Badal_Certificates");
  if (!sheet) throw new Error("Sheet DB_Badal_Certificates tidak ditemukan");

  const nowStr = formatDateSafe_(new Date());
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  let id = payload.id;
  let rowIndex = -1;

  if (id) {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  if (!id) {
    id = "BDL-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd") + "-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    nomor_sertifikat: payload.nomor_sertifikat || payload.nomorSertifikat || ("SDW/BDL/" + new Date().getFullYear() + "/" + Utilities.formatString("%04d", rows.length)),
    nama_petugas_badal: payload.nama_petugas_badal || payload.namaPetugasBadal || "Ustadz Pembimbing",
    nama_yang_dibadalkan: payload.nama_yang_dibadalkan || payload.namaYangDibadalkan || "-",
    tempat_miqat: payload.tempat_miqat || payload.tempatMiqat || "Masjid Dzulhulaifah (Bir Ali)",
    tanggal_pelaksanaan: payload.tanggal_pelaksanaan || payload.tanggalPelaksanaan || nowStr,
    tempat_penerbitan: payload.tempat_penerbitan || payload.tempatPenerbitan || "Makkah Al-Mukarramah",
    tanggal_penerbitan: payload.tanggal_penerbitan || payload.tanggalPenerbitan || nowStr,
    keluarga_pemesan: payload.keluarga_pemesan || payload.keluargaPemesan || "-",
    status: payload.status || "PUBLISHED",
    ukuran_font_nama: payload.ukuran_font_nama || payload.ukuranFontNama || "42px",
    catatan: payload.catatan || "",
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr,
    updated_at: nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_BADAL_CERTIFICATE" : "CREATE_BADAL_CERTIFICATE", "DB_Badal_Certificates", id, null, payload, "Sertifikat badal umroh '" + rowObj.nama_yang_dibadalkan + "' berhasil disimpan");
  return { id: id, nomor_sertifikat: rowObj.nomor_sertifikat, nama_yang_dibadalkan: rowObj.nama_yang_dibadalkan, entity: "DB_Badal_Certificates" };
}

/**
 * Menghapus sertifikat badal umroh
 */
function deleteBadalCertificate_(ss, certId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Badal_Certificates");
  if (!sheet) throw new Error("Sheet DB_Badal_Certificates tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(certId).toUpperCase()) {
      sheet.deleteRow(i + 1);
      logAudit_(actor, "DELETE_BADAL_CERTIFICATE", "DB_Badal_Certificates", certId, null, null, "Sertifikat badal umroh dihapus");
      return { id: certId, success: true, message: "Sertifikat badal umroh berhasil dihapus" };
    }
  }
  return { id: certId, error: "Sertifikat tidak ditemukan" };
}
`;

fs.writeFileSync(path.join(BACKEND_DIR, '10_CertificatesBadalService.gs'), file10, 'utf8');
console.log('✅ Created 10_CertificatesBadalService.gs');
