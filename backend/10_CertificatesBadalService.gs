/**
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
