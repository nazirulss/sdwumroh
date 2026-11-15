/**
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
  const docs = getSheetRowsAsObjects_(ss, "DB_Pilgrim_Documents");

  const custMap = {};
  customers.forEach(function(c) { custMap[c.id] = c; });

  const pkgMap = {};
  packages.forEach(function(p) { pkgMap[p.id] = p; });

  const depMap = {};
  departures.forEach(function(d) { depMap[d.id] = d; });

  const docPhotoMap = {};
  docs.forEach(function(d) {
    if (d.registration_id && (d.requirement_id === 'DCR-000004' || (d.file_name && String(d.file_name).toLowerCase().includes('pasfoto')))) {
      const pUrl = d.file_ref_mock || d.file_url;
      if (pUrl && pUrl !== '-' && !docPhotoMap[d.registration_id]) {
        docPhotoMap[d.registration_id] = pUrl;
      }
    }
  });

  return regs.map(function(reg) {
    const cust = custMap[reg.customer_id] || {};
    const pkg = pkgMap[reg.package_id] || {};
    const dep = depMap[reg.departure_id] || {};
    const custFullName = cust.full_name || reg.customer_id;
    const cleanDepDate = dep.departure_date ? formatDateSafe_(dep.departure_date) : '-';
    const isCompleted = reg.status === 'COMPLETED' || reg.status === 'CONFIRMED';
    const photo = docPhotoMap[reg.id] || null;
    const certNumber = "SDW/CERT/2026/" + String(reg.id).replace(/\D/g, '').padStart(3, '0');

    return {
      id: reg.id,
      registrationNumber: reg.id,
      customerId: reg.customer_id,
      customer: custFullName,
      customerName: custFullName,
      name: custFullName,
      nik: cust.nik || '-',
      gender: cust.gender || '-',
      phone: cust.phone || '-',
      email: cust.email || '-',
      package: pkg.name || reg.package_id,
      packageId: reg.package_id,
      packageName: pkg.name || reg.package_id,
      departure: cleanDepDate,
      departureId: reg.departure_id,
      departureDate: cleanDepDate,
      photoUrl: photo,
      photo: photo,
      isIssued: isCompleted,
      certificateNo: certNumber,
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
