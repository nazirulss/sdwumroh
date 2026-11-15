/**
 * ============================================================================
 * SDW UMROH — INSTITUTIONAL PROFILE, DIRECTOR, ASATIDZ & MITRA SYIAR SERVICE
 * File: 11_ProfileInstitutional.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

function uploadProfilePhoto_(payload, actor) {
  const p = (payload && payload.payload && typeof payload.payload === 'object')
    ? Object.assign({}, payload, payload.payload)
    : (payload || {});

  if (!p || !p.photoBase64) {
    throw new Error("Data foto base64 wajib disertakan");
  }

  try {
    const folder = getProfileFolder_();
    if (!folder) {
      return {
        url: p.photoBase64,
        simulated: true,
        message: "Drive folder tidak tersedia, menggunakan data URL lokal"
      };
    }

    const base64Parts = p.photoBase64.split(",");
    const rawData = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    const mimeMatch = p.photoBase64.match(/data:([^;]+);/);
    const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bytes = Utilities.base64Decode(rawData);
    const ext = contentType.indexOf("png") !== -1 ? ".png" : (contentType.indexOf("webp") !== -1 ? ".webp" : ".jpg");
    const fileName = (p.fileName || ("PROFILE_PHOTO_" + Date.now())).replace(/\.[^/.]+$/, "") + ext;

    const blob = Utilities.newBlob(bytes, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const driveUrl = "https://lh3.googleusercontent.com/d/" + fileId + "=s0";
    const viewUrl = file.getUrl();

    if (actor) {
      logAudit_(actor, "UPLOAD_PROFILE_PHOTO", "Drive", fileId, null, { fileName: fileName, size: bytes.length }, "Unggah foto profil lembaga / mitra ke Google Drive");
    }

    return {
      fileId: fileId,
      url: driveUrl,
      viewUrl: viewUrl,
      fileName: fileName
    };
  } catch (err) {
    Logger.log("uploadProfilePhoto_ error: " + err.message);
    return {
      url: p.photoBase64,
      error: err.message
    };
  }
}

function getProfileInstitutionData_(ss) {
  let sh = ss.getSheetByName("DB_Profile_Institution");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Institution");
  }
  if (!sh || sh.getLastRow() <= 1) {
    return {
      kpi: {
        ppiu_no: "U.123/2026",
        ppiu_year: "2026",
        akreditasi_grade: "Peringkat A (Unggul)",
        akreditasi_org: "Lembaga Sertifikasi Umroh Mandiri",
        legal_name: "PT Sahabat Dhuha Wisata",
        legal_sk: "AHU-0012938.AH.01.01.TAHUN 2026",
        afiliasi_name: "AMPHURI & IATA",
        afiliasi_detail: "ID: 15-4-9981 / Asosiasi PPIU Resmi"
      },
      visi: "Menjadi biro perjalanan ibadah umroh dan haji khusus terdepan di Indonesia yang amanah, profesional, dan berkhidmat melayani jamaah dengan standar kenyamanan hotel pelataran ring-1 serta bimbingan ibadah bersanad yang menenteramkan kalbu.",
      misi: [
        "Menyelenggarakan perjalanan umroh dengan kepastian seat pesawat, kepastian jadwal, dan kepastian hotel bintang 5.",
        "Menyediakan akomodasi hotel bintang 5 di pelataran utama Masjidil Haram dan Masjid Nabawi.",
        "Memberikan bimbingan manasik komprehensif, bersanad, dan intensif oleh asatidz alumni Timur Tengah.",
        "Menerapkan transparansi finansial dan perlindungan jamaah tanpa biaya tersembunyi melalui rekening escrow BSI.",
        "Memanfaatkan ekosistem teknologi modern (One Journey, One Platform) untuk memonitor jadwal dan panduan ibadah."
      ],
      timeline: [],
      direksi: []
    };
  }

  const values = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = {
    id: values[0],
    ppiu_no: values[1],
    ppiu_year: values[2],
    akreditasi_grade: values[3],
    akreditasi_org: values[4],
    legal_name: values[5],
    legal_sk: values[6],
    afiliasi_name: values[7],
    afiliasi_detail: values[8],
    visi: values[9],
    misi_json: values[10],
    timeline_json: values[11],
    direksi_json: values[12],
    updated_at: values[13],
    updated_by: values[14]
  };

  let parsedMisi = [];
  try { parsedMisi = JSON.parse(row.misi_json); } catch(_) {}
  let parsedTimeline = [];
  try { parsedTimeline = JSON.parse(row.timeline_json); } catch(_) {}
  let parsedDireksi = [];
  try { parsedDireksi = JSON.parse(row.direksi_json); } catch(_) {}

  return {
    id: row.id,
    kpi: {
      ppiu_no: row.ppiu_no || "U.123/2026",
      ppiu_year: row.ppiu_year || "2026",
      akreditasi_grade: row.akreditasi_grade || "Peringkat A (Unggul)",
      akreditasi_org: row.akreditasi_org || "Lembaga Sertifikasi Umroh Mandiri",
      legal_name: row.legal_name || "PT Sahabat Dhuha Wisata",
      legal_sk: row.legal_sk || "AHU-0012938.AH.01.01.TAHUN 2026",
      afiliasi_name: row.afiliasi_name || "AMPHURI & IATA",
      afiliasi_detail: row.afiliasi_detail || "ID: 15-4-9981 / Asosiasi PPIU Resmi"
    },
    visi: row.visi || "",
    misi: parsedMisi,
    timeline: parsedTimeline,
    direksi: parsedDireksi,
    updated_at: row.updated_at,
    updated_by: row.updated_by
  };
}

function getProfileDirectorData_(ss) {
  let sh = ss.getSheetByName("DB_Profile_Director");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Director");
  }
  if (!sh || sh.getLastRow() <= 1) {
    return {
      name: "H. Muhammad Syarif",
      role: "Direktur Utama PT Sahabat Dhuha Wisata",
      license_badge: "Badan Verifikasi Lisensi Resmi",
      photo: "assets/direktur-utama.jpg",
      headline: "Melayani Setiap Langkah Jamaah Sebagai Tamu Allah yang Mulia",
      subheadline: "Komitmen Pimpinan PT Sahabat Dhuha Wisata untuk Perjalanan Ibadah yang Amanah, Khidmat & Menenteramkan.",
      quote: "Di SDW UMROH, kami memandang perjalanan ke Baitullah bukan sekadar perniagaan tiket dan hotel, melainkan sebuah amanah suci yang agung.",
      paragraphs: [],
      pillars: [],
      show_on_home: true
    };
  }

  const values = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0];
  const row = {
    id: values[0],
    name: values[1],
    role: values[2],
    license_badge: values[3],
    photo_url: values[4],
    headline: values[5],
    subheadline: values[6],
    quote: values[7],
    paragraphs_json: values[8],
    pillars_json: values[9],
    show_on_home: Boolean(values[10]),
    updated_at: values[11],
    updated_by: values[12]
  };

  let parsedParagraphs = [];
  try { parsedParagraphs = JSON.parse(row.paragraphs_json); } catch(_) {}
  let parsedPillars = [];
  try { parsedPillars = JSON.parse(row.pillars_json); } catch(_) {}

  return {
    id: row.id,
    name: row.name,
    role: row.role,
    license_badge: row.license_badge,
    photo: row.photo_url,
    headline: row.headline,
    subheadline: row.subheadline,
    quote: row.quote,
    paragraphs: parsedParagraphs,
    pillars: parsedPillars,
    show_on_home: row.show_on_home,
    updated_at: row.updated_at,
    updated_by: row.updated_by
  };
}

function getProfileGuidesData_(ss) {
  let sh = ss.getSheetByName("DB_Profile_Guides");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Guides");
  }
  if (!sh || sh.getLastRow() <= 1) {
    return {
      ratio_pilgrim: 35,
      lead_advisor: {
        name: "Ust. H. Ahmad Fauzan, Lc., M.Ag.",
        role: "Ketua Dewan Pembimbing Syariah & Muthawwif Utama",
        credentials: "Alumni Universitas Islam Madinah (Fakultas Syariah)",
        bio: "Berpengalaman membimbing ribuan jamaah umroh dan haji khusus sejak tahun 2014.",
        photo: "assets/hero-muthawwif.png"
      },
      guides: []
    };
  }

  const data = getSheetDataAsObjects(sh);
  let lead = {
    name: "Ust. H. Ahmad Fauzan, Lc., M.Ag.",
    role: "Ketua Dewan Pembimbing Syariah & Muthawwif Utama",
    credentials: "Alumni Universitas Islam Madinah (Fakultas Syariah)",
    bio: "Berpengalaman membimbing ribuan jamaah umroh dan haji khusus sejak tahun 2014.",
    photo: "assets/hero-muthawwif.png"
  };
  const guidesList = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const isLead = Boolean(item.lead_advisor_flag === true || String(item.lead_advisor_flag).toUpperCase() === 'TRUE');
    if (isLead) {
      lead = {
        id: item.id,
        name: item.name,
        role: item.role,
        credentials: item.alma_mater,
        bio: item.bio || "",
        photo: item.photo_url || "assets/hero-muthawwif.png"
      };
    } else {
      guidesList.push({
        id: item.id,
        name: item.name,
        role: item.role,
        category: item.category || "MAKKAH",
        almaMater: item.alma_mater,
        experience: item.experience,
        status: item.status || "AKTIF",
        photo: item.photo_url || "assets/hero-muthawwif.png",
        orderIndex: Number(item.order_index) || 0,
        bio: item.bio || ""
      });
    }
  }

  return {
    ratio_pilgrim: 35,
    lead_advisor: lead,
    guides: guidesList
  };
}

function getProfileLegalityData_(ss) {
  let legSh = ss.getSheetByName("DB_Profile_Legality");
  let mtrSh = ss.getSheetByName("DB_Profile_Mitra_Syiar");
  if (!legSh || !mtrSh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    legSh = ss.getSheetByName("DB_Profile_Legality");
    mtrSh = ss.getSheetByName("DB_Profile_Mitra_Syiar");
  }

  const legalityDocs = [];
  const strategicPartners = [];
  if (legSh && legSh.getLastRow() > 1) {
    const legData = getSheetDataAsObjects(legSh);
    for (let i = 0; i < legData.length; i++) {
      const d = legData[i];
      const obj = {
        id: d.id,
        category: d.category,
        name: d.name,
        issuer: d.issuer_partner,
        partner: d.issuer_partner,
        doc_number: d.doc_number,
        contract_number: d.doc_number,
        validity: d.validity_period,
        status: d.status || "AKTIF",
        file: d.file_url,
        orderIndex: Number(d.order_index) || 0
      };
      if (d.category === 'MITRA_STRATEGIS') {
        strategicPartners.push(obj);
      } else {
        legalityDocs.push(obj);
      }
    }
  }

  const mitraList = [];
  if (mtrSh && mtrSh.getLastRow() > 1) {
    const mtrData = getSheetDataAsObjects(mtrSh);
    for (let j = 0; j < mtrData.length; j++) {
      const m = mtrData[j];
      mitraList.push({
        id: m.id,
        name: m.name,
        title: m.title_institution,
        role: m.role_label,
        region: m.region,
        city: m.city,
        sk_number: m.sk_number,
        phone: m.phone_wa,
        photo: m.photo_url || "assets/direktur-utama.jpg",
        status: m.status || "AKTIF",
        orderIndex: Number(m.order_index) || 0
      });
    }
  }

  return {
    documents: legalityDocs,
    partners: strategicPartners,
    mitra_syiar: mitraList
  };
}

function getProfileMitraSyiarData_(ss) {
  const legData = getProfileLegalityData_(ss);
  return legData.mitra_syiar || [];
}

function getAllProfileData_(ss) {
  return {
    institution: getProfileInstitutionData_(ss),
    director: getProfileDirectorData_(ss),
    guides: getProfileGuidesData_(ss),
    legality: getProfileLegalityData_(ss),
    mitra_syiar: getProfileMitraSyiarData_(ss),
    fetched_at: new Date().toISOString()
  };
}

function saveProfileInstitution_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Profile_Institution");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Institution");
  }
  const nowStr = formatDateSafe_(new Date());
  const kpi = payload.kpi || {};
  const misiJson = typeof payload.misi === 'string' ? payload.misi : JSON.stringify(payload.misi || []);
  const timelineJson = typeof payload.timeline === 'string' ? payload.timeline : JSON.stringify(payload.timeline || []);
  const direksiJson = typeof payload.direksi === 'string' ? payload.direksi : JSON.stringify(payload.direksi || []);

  const rowData = [
    payload.id || "PRF-INST-000001",
    kpi.ppiu_no || "U.123/2026",
    kpi.ppiu_year || "2026",
    kpi.akreditasi_grade || "Peringkat A (Unggul)",
    kpi.akreditasi_org || "Lembaga Sertifikasi Umroh Mandiri",
    kpi.legal_name || "PT Sahabat Dhuha Wisata",
    kpi.legal_sk || "AHU-0012938.AH.01.01.TAHUN 2026",
    kpi.afiliasi_name || "AMPHURI & IATA",
    kpi.afiliasi_detail || "ID: 15-4-9981 / Asosiasi PPIU Resmi",
    payload.visi || "",
    misiJson,
    timelineJson,
    direksiJson,
    nowStr,
    actor || "ADMIN"
  ];

  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }

  logAudit_(actor || "ADMIN", "UPDATE_PROFILE_INSTITUTION", "DB_Profile_Institution", "PRF-INST-000001", null, { visi: payload.visi }, "Memperbarui profil lembaga & metrik kredensial");
  return { success: true, message: "Profil lembaga berhasil disimpan", data: payload };
}

function saveProfileDirector_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Profile_Director");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Director");
  }
  const nowStr = formatDateSafe_(new Date());
  const paragraphsJson = typeof payload.paragraphs === 'string' ? payload.paragraphs : JSON.stringify(payload.paragraphs || []);
  const pillarsJson = typeof payload.pillars === 'string' ? payload.pillars : JSON.stringify(payload.pillars || []);

  const rowData = [
    payload.id || "PRF-DIR-000001",
    payload.name || "H. Muhammad Syarif",
    payload.role || "Direktur Utama PT Sahabat Dhuha Wisata",
    payload.license_badge || "Badan Verifikasi Lisensi Resmi",
    payload.photo || payload.photo_url || "assets/direktur-utama.jpg",
    payload.headline || "Melayani Setiap Langkah Jamaah Sebagai Tamu Allah yang Mulia",
    payload.subheadline || "Komitmen Pimpinan PT Sahabat Dhuha Wisata untuk Perjalanan Ibadah yang Amanah, Khidmat & Menenteramkan.",
    payload.quote || "",
    paragraphsJson,
    pillarsJson,
    payload.show_on_home !== false,
    nowStr,
    actor || "ADMIN"
  ];

  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sh.appendRow(rowData);
  }

  logAudit_(actor || "ADMIN", "UPDATE_PROFILE_DIRECTOR", "DB_Profile_Director", "PRF-DIR-000001", null, { name: payload.name, headline: payload.headline }, "Memperbarui sambutan Direktur Utama");
  return { success: true, message: "Sambutan pimpinan berhasil disimpan", data: payload };
}

function saveProfileGuide_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Profile_Guides");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Guides");
  }
  const nowStr = formatDateSafe_(new Date());
  const id = payload.id || ("GD-" + String(Math.max(1, sh.getLastRow())).padStart(6, '0'));

  const rowData = [
    id,
    payload.name || "",
    payload.role || "",
    payload.category || "MAKKAH",
    payload.almaMater || payload.alma_mater || "",
    payload.experience || "",
    payload.status || "AKTIF",
    payload.photo || payload.photo_url || "assets/hero-muthawwif.png",
    Number(payload.orderIndex || payload.order_index) || 0,
    Boolean(payload.lead_advisor_flag || payload.isLead),
    payload.bio || "",
    nowStr,
    nowStr
  ];

  const data = getSheetDataAsObjects(sh);
  let foundRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(id).trim()) {
      foundRowIdx = i + 2;
      break;
    }
  }

  if (foundRowIdx !== -1) {
    rowData[11] = data[foundRowIdx - 2].created_at || nowStr;
    rowData[12] = nowStr;
    sh.getRange(foundRowIdx, 1, 1, rowData.length).setValues([rowData]);
    logAudit_(actor || "ADMIN", "UPDATE_GUIDE", "DB_Profile_Guides", id, null, { name: payload.name, role: payload.role }, "Memperbarui data personil pembimbing");
  } else {
    sh.appendRow(rowData);
    logAudit_(actor || "ADMIN", "CREATE_GUIDE", "DB_Profile_Guides", id, null, { name: payload.name, role: payload.role }, "Menambahkan personil pembimbing baru");
  }

  return { success: true, id: id, message: "Personil pembimbing berhasil disimpan" };
}

function deleteProfileGuide_(ss, guideId, actor) {
  let sh = ss.getSheetByName("DB_Profile_Guides");
  if (!sh) throw new Error("Sheet DB_Profile_Guides tidak ditemukan");

  const data = getSheetDataAsObjects(sh);
  let targetRow = -1;
  let guideName = "";
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(guideId).trim()) {
      targetRow = i + 2;
      guideName = data[i].name || "";
      break;
    }
  }

  if (targetRow === -1) throw new Error("Personil pembimbing dengan ID " + guideId + " tidak ditemukan");
  sh.deleteRow(targetRow);
  logAudit_(actor || "ADMIN", "DELETE_GUIDE", "DB_Profile_Guides", guideId, { name: guideName }, null, "Menghapus personil pembimbing");
  return { success: true, id: guideId, message: "Personil pembimbing berhasil dihapus" };
}

function saveProfileLegalityDoc_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Profile_Legality");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Legality");
  }
  const nowStr = formatDateSafe_(new Date());
  const id = payload.id || ("LEG-" + String(Math.max(1, sh.getLastRow())).padStart(6, '0'));

  const rowData = [
    id,
    payload.category || "LEGALITAS",
    payload.name || "",
    payload.issuer || payload.partner || payload.issuer_partner || "",
    payload.doc_number || payload.contract_number || "",
    payload.validity || payload.validity_period || "Berlaku Aktif",
    payload.status || "AKTIF",
    payload.file || payload.file_url || "",
    Number(payload.orderIndex || payload.order_index) || 0,
    nowStr,
    nowStr
  ];

  const data = getSheetDataAsObjects(sh);
  let foundRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(id).trim()) {
      foundRowIdx = i + 2;
      break;
    }
  }

  if (foundRowIdx !== -1) {
    rowData[9] = data[foundRowIdx - 2].created_at || nowStr;
    rowData[10] = nowStr;
    sh.getRange(foundRowIdx, 1, 1, rowData.length).setValues([rowData]);
    logAudit_(actor || "ADMIN", "UPDATE_LEGALITY_DOC", "DB_Profile_Legality", id, null, { name: payload.name }, "Memperbarui dokumen legalitas / MOU");
  } else {
    sh.appendRow(rowData);
    logAudit_(actor || "ADMIN", "CREATE_LEGALITY_DOC", "DB_Profile_Legality", id, null, { name: payload.name }, "Menambahkan dokumen legalitas / MOU baru");
  }

  return { success: true, id: id, message: "Dokumen legalitas berhasil disimpan" };
}

function deleteProfileLegalityDoc_(ss, docId, actor) {
  let sh = ss.getSheetByName("DB_Profile_Legality");
  if (!sh) throw new Error("Sheet DB_Profile_Legality tidak ditemukan");

  const data = getSheetDataAsObjects(sh);
  let targetRow = -1;
  let docName = "";
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(docId).trim()) {
      targetRow = i + 2;
      docName = data[i].name || "";
      break;
    }
  }

  if (targetRow === -1) throw new Error("Dokumen dengan ID " + docId + " tidak ditemukan");
  sh.deleteRow(targetRow);
  logAudit_(actor || "ADMIN", "DELETE_LEGALITY_DOC", "DB_Profile_Legality", docId, { name: docName }, null, "Menghapus dokumen legalitas / MOU");
  return { success: true, id: docId, message: "Dokumen legalitas berhasil dihapus" };
}

function saveProfileMitraSyiar_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Profile_Mitra_Syiar");
  if (!sh) {
    if (typeof setupProfileSheets === 'function') setupProfileSheets();
    sh = ss.getSheetByName("DB_Profile_Mitra_Syiar");
  }
  const nowStr = formatDateSafe_(new Date());
  const id = payload.id || ("MTR-" + String(Math.max(1, sh.getLastRow())).padStart(6, '0'));

  const rowData = [
    id,
    payload.name || "",
    payload.title || payload.title_institution || "",
    payload.role || payload.role_label || "Mitra Syiar",
    payload.region || "Jawa Timur",
    payload.city || "",
    payload.sk_number || "SK-RESMI-SDW",
    payload.phone || payload.phone_wa || "",
    payload.photo || payload.photo_url || "assets/direktur-utama.jpg",
    payload.status || "AKTIF",
    Number(payload.orderIndex || payload.order_index) || 0,
    nowStr,
    nowStr
  ];

  const data = getSheetDataAsObjects(sh);
  let foundRowIdx = -1;
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(id).trim()) {
      foundRowIdx = i + 2;
      break;
    }
  }

  if (foundRowIdx !== -1) {
    rowData[11] = data[foundRowIdx - 2].created_at || nowStr;
    rowData[12] = nowStr;
    sh.getRange(foundRowIdx, 1, 1, rowData.length).setValues([rowData]);
    logAudit_(actor || "ADMIN", "UPDATE_MITRA_SYIAR", "DB_Profile_Mitra_Syiar", id, null, { name: payload.name, region: payload.region }, "Memperbarui data Mitra Syiar / Cabang");
  } else {
    sh.appendRow(rowData);
    logAudit_(actor || "ADMIN", "CREATE_MITRA_SYIAR", "DB_Profile_Mitra_Syiar", id, null, { name: payload.name, region: payload.region }, "Menambahkan Mitra Syiar / Cabang baru");
  }

  return { success: true, id: id, message: "Data Mitra Syiar berhasil disimpan" };
}

function deleteProfileMitraSyiar_(ss, mitraId, actor) {
  let sh = ss.getSheetByName("DB_Profile_Mitra_Syiar");
  if (!sh) throw new Error("Sheet DB_Profile_Mitra_Syiar tidak ditemukan");

  const data = getSheetDataAsObjects(sh);
  let targetRow = -1;
  let mitraName = "";
  for (let i = 0; i < data.length; i++) {
    if (String(data[i].id).trim() === String(mitraId).trim()) {
      targetRow = i + 2;
      mitraName = data[i].name || "";
      break;
    }
  }

  if (targetRow === -1) throw new Error("Mitra Syiar dengan ID " + mitraId + " tidak ditemukan");
  sh.deleteRow(targetRow);
  logAudit_(actor || "ADMIN", "DELETE_MITRA_SYIAR", "DB_Profile_Mitra_Syiar", mitraId, { name: mitraName }, null, "Menghapus Mitra Syiar / Cabang");
  return { success: true, id: mitraId, message: "Data Mitra Syiar berhasil dihapus" };
}

function saveAllProfileData_(ss, payload, actor) {
  if (payload.institution) {
    saveProfileInstitution_(ss, payload.institution, actor);
  }
  if (payload.director) {
    saveProfileDirector_(ss, payload.director, actor);
  }
  if (payload.guides) {
    if (payload.guides.lead_advisor) {
      saveProfileGuide_(ss, {
        id: payload.guides.lead_advisor.id || "GD-000001",
        name: payload.guides.lead_advisor.name,
        role: payload.guides.lead_advisor.role,
        category: "MANASIK",
        almaMater: payload.guides.lead_advisor.credentials,
        bio: payload.guides.lead_advisor.bio,
        photo: payload.guides.lead_advisor.photo,
        lead_advisor_flag: true
      }, actor);
    }
    if (Array.isArray(payload.guides.guides)) {
      for (let g = 0; g < payload.guides.guides.length; g++) {
        saveProfileGuide_(ss, payload.guides.guides[g], actor);
      }
    }
  }
  if (payload.legality) {
    if (Array.isArray(payload.legality.documents)) {
      for (let d = 0; d < payload.legality.documents.length; d++) {
        saveProfileLegalityDoc_(ss, payload.legality.documents[d], actor);
      }
    }
    if (Array.isArray(payload.legality.partners)) {
      for (let p = 0; p < payload.legality.partners.length; p++) {
        saveProfileLegalityDoc_(ss, payload.legality.partners[p], actor);
      }
    }
    if (Array.isArray(payload.legality.mitra_syiar)) {
      for (let m = 0; m < payload.legality.mitra_syiar.length; m++) {
        saveProfileMitraSyiar_(ss, payload.legality.mitra_syiar[m], actor);
      }
    }
  }

  logAudit_(actor || "ADMIN", "SAVE_ALL_PROFILE", "DB_Profile_Institution", "PRF-ALL", null, null, "Menyimpan seluruh konfigurasi 4 subtab profil lembaga");
  return {
    success: true,
    message: "Seluruh konfigurasi profil lembaga & mitra syiar berhasil disimpan ke cloud database"
  };
}

/**
 * ============================================================================
 * CONTACT & SOCIAL MEDIA HELPERS (DB_Contact_Social)
 * ============================================================================
 */