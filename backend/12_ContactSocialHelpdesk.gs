/**
 * ============================================================================
 * SDW UMROH — CONTACT, SOCIAL MEDIA, FAQ, HELPDESK & ARTICLES SERVICE
 * File: 12_ContactSocialHelpdesk.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

function getContactSocialData_(ss) {
  let sh = ss.getSheetByName("DB_Contact_Social");
  if (!sh) {
    if (typeof setupContactSocialSheet === 'function') setupContactSocialSheet();
    sh = ss.getSheetByName("DB_Contact_Social");
  }
  if (!sh) {
    return {
      id: "CNT-000001",
      company_name: "PT Sahabat Dhuha Wisata (SDW UMROH)",
      address_line: "Jl. Raya Kudus - Jepara KM 5",
      city_province_postal: "Kabupaten Kudus, Jawa Tengah 59333",
      google_maps_url: "https://maps.google.com/?q=SDW+Umroh+Kudus",
      whatsapp_number: "+62 812-3456-7890",
      whatsapp_clean: "6281234567890",
      whatsapp_template: "Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.",
      phone_office: "(0291) 438-999",
      hotline_24h: "+62 812-3456-7890",
      email_official: "layanan@sdwumroh.co.id",
      operational_hours: "Senin – Jumat: 08:30 – 17:00 WIB | Sabtu: 08:30 – 14:00 WIB",
      instagram_url: "https://instagram.com/sdwumroh.official",
      instagram_handle: "@sdwumroh.official",
      facebook_url: "https://facebook.com/sdwumrohofficial",
      facebook_name: "SDW Umroh Official",
      youtube_url: "https://youtube.com/@sdwumroh",
      youtube_name: "SDW Umroh TV & Manasik",
      tiktok_url: "https://tiktok.com/@sdwumroh",
      tiktok_handle: "@sdwumroh"
    };
  }

  const data = getSheetDataAsObjects(sh);
  if (!data || data.length === 0) {
    return {
      id: "CNT-000001",
      company_name: "PT Sahabat Dhuha Wisata (SDW UMROH)",
      address_line: "Jl. Raya Kudus - Jepara KM 5",
      city_province_postal: "Kabupaten Kudus, Jawa Tengah 59333",
      google_maps_url: "https://maps.google.com/?q=SDW+Umroh+Kudus",
      whatsapp_number: "+62 812-3456-7890",
      whatsapp_clean: "6281234567890",
      whatsapp_template: "Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.",
      phone_office: "(0291) 438-999",
      hotline_24h: "+62 812-3456-7890",
      email_official: "layanan@sdwumroh.co.id",
      operational_hours: "Senin – Jumat: 08:30 – 17:00 WIB | Sabtu: 08:30 – 14:00 WIB",
      instagram_url: "https://instagram.com/sdwumroh.official",
      instagram_handle: "@sdwumroh.official",
      facebook_url: "https://facebook.com/sdwumrohofficial",
      facebook_name: "SDW Umroh Official",
      youtube_url: "https://youtube.com/@sdwumroh",
      youtube_name: "SDW Umroh TV & Manasik",
      tiktok_url: "https://tiktok.com/@sdwumroh",
      tiktok_handle: "@sdwumroh"
    };
  }

  const row = data[0];
  return {
    id: row.id || "CNT-000001",
    company_name: row.company_name || "PT Sahabat Dhuha Wisata (SDW UMROH)",
    address_line: row.address_line || "",
    city_province_postal: row.city_province_postal || "",
    google_maps_url: row.google_maps_url || "",
    whatsapp_number: row.whatsapp_number || "",
    whatsapp_clean: row.whatsapp_clean || (row.whatsapp_number ? String(row.whatsapp_number).replace(/[^0-9]/g, '') : "6281234567890"),
    whatsapp_template: row.whatsapp_template || "Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.",
    phone_office: row.phone_office || "",
    hotline_24h: row.hotline_24h || "",
    email_official: row.email_official || "",
    operational_hours: row.operational_hours || "",
    instagram_url: row.instagram_url || "",
    instagram_handle: row.instagram_handle || "",
    facebook_url: row.facebook_url || "",
    facebook_name: row.facebook_name || "",
    youtube_url: row.youtube_url || "",
    youtube_name: row.youtube_name || "",
    tiktok_url: row.tiktok_url || "",
    tiktok_handle: row.tiktok_handle || "",
    updated_at: row.updated_at || ""
  };
}

function saveContactSocialData_(ss, payload, actor) {
  let sh = ss.getSheetByName("DB_Contact_Social");
  if (!sh) {
    if (typeof setupContactSocialSheet === 'function') setupContactSocialSheet();
    sh = ss.getSheetByName("DB_Contact_Social");
  }
  if (!sh) throw new Error("Sheet DB_Contact_Social tidak dapat diakses.");

  const p = payload || {};
  const nowStr = new Date().toISOString();
  const canonical = AUTHORITATIVE_SCHEMAS_["DB_Contact_Social"];

  const id = p.id || "CNT-000001";
  const companyName = p.company_name || "PT Sahabat Dhuha Wisata (SDW UMROH)";
  const addressLine = p.address_line || "";
  const cityProvincePostal = p.city_province_postal || "";
  const googleMapsUrl = p.google_maps_url || "";
  const waNumber = p.whatsapp_number || "";
  const waClean = p.whatsapp_clean || (waNumber ? String(waNumber).replace(/[^0-9]/g, '') : "6281234567890");
  const waTemplate = p.whatsapp_template || "Assalamualaikum CS SDW UMROH, saya ingin konsultasi pendaftaran umroh.";
  const phoneOffice = p.phone_office || "";
  const hotline24h = p.hotline_24h || "";
  const emailOfficial = p.email_official || "";
  const operationalHours = p.operational_hours || "";
  const igUrl = p.instagram_url || "";
  const igHandle = p.instagram_handle || "";
  const fbUrl = p.facebook_url || "";
  const fbName = p.facebook_name || "";
  const ytUrl = p.youtube_url || "";
  const ytName = p.youtube_name || "";
  const ttUrl = p.tiktok_url || "";
  const ttHandle = p.tiktok_handle || "";

  const rowData = [
    id,
    companyName,
    addressLine,
    cityProvincePostal,
    googleMapsUrl,
    waNumber,
    waClean,
    waTemplate,
    phoneOffice,
    hotline24h,
    emailOfficial,
    operationalHours,
    igUrl,
    igHandle,
    fbUrl,
    fbName,
    ytUrl,
    ytName,
    ttUrl,
    ttHandle,
    nowStr,
    nowStr
  ];

  if (sh.getLastRow() <= 1) {
    sh.appendRow(rowData);
  } else {
    sh.getRange(2, 1, 1, rowData.length).setValues([rowData]);
  }

  logAudit_(actor || "ADMIN", "UPDATE_CONTACT_SOCIAL", "DB_Contact_Social", id, null, {
    address: addressLine + ", " + cityProvincePostal,
    whatsapp: waNumber,
    instagram: igHandle,
    facebook: fbName,
    youtube: ytName,
    tiktok: ttHandle
  }, "Memperbarui informasi kontak kantor, WhatsApp & 4 media sosial");

  return {
    success: true,
    message: "Informasi kontak, WhatsApp & 4 media sosial berhasil disimpan ke DB_Contact_Social.",
    data: {
      id: id,
      company_name: companyName,
      address_line: addressLine,
      city_province_postal: cityProvincePostal,
      google_maps_url: googleMapsUrl,
      whatsapp_number: waNumber,
      whatsapp_clean: waClean,
      whatsapp_template: waTemplate,
      phone_office: phoneOffice,
      hotline_24h: hotline24h,
      email_official: emailOfficial,
      operational_hours: operationalHours,
      instagram_url: igUrl,
      instagram_handle: igHandle,
      facebook_url: fbUrl,
      facebook_name: fbName,
      youtube_url: ytUrl,
      youtube_name: ytName,
      tiktok_url: ttUrl,
      tiktok_handle: ttHandle,
      updated_at: nowStr
    }
  };
}


/**
 * Membaca daftar FAQ
 */
function getFaq_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Faq");
}

function saveFaq_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Faq");
  if (!sheet) throw new Error("Sheet DB_Faq tidak ditemukan");
  autoUpgradeFaqSheets_(ss);

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nowStr = formatDateSafe_(new Date());
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
    id = "FAQ-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    category: payload.category || 'UMUM',
    question: payload.question || 'Pertanyaan Baru',
    answer: payload.answer || 'Jawaban',
    icon: payload.icon || 'help-circle',
    sort_order: Number(payload.sort_order) || rows.length,
    is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
    status: payload.status || 'PUBLISHED',
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_FAQ" : "CREATE_FAQ", "DB_Faq", id, null, payload, "FAQ '" + rowObj.question + "' disimpan");
  return { id: id, question: rowObj.question, entity: "DB_Faq" };
}

function deleteFaq_(ss, faqId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Faq");
  if (!sheet) throw new Error("Sheet DB_Faq tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(faqId).toUpperCase()) {
      sheet.getRange(i + 1, 8).setValue('ARCHIVED');
      logAudit_(actor, "ARCHIVE_FAQ", "DB_Faq", faqId, null, null, "FAQ diarsipkan");
      return { id: faqId, action: 'ARCHIVED', message: "FAQ berhasil diarsipkan" };
    }
  }
  return { id: faqId, error: "FAQ tidak ditemukan" };
}

function autoUpgradeFaqSheets_(ss) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Faq");
  if (!sheet) return;
  const canonical = ["id", "category", "question", "answer", "icon", "sort_order", "is_featured", "status", "created_at"];
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  canonical.forEach(function(h) {
    if (curHeaders.indexOf(h) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
  });
}

/**
 * Helpdesk Contacts
 */
function getHelpdeskContacts_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Helpdesk_Contacts");
}

function saveHelpdeskContact_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Helpdesk_Contacts");
  if (!sheet) throw new Error("Sheet DB_Helpdesk_Contacts tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nowStr = formatDateSafe_(new Date());
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
    id = "HDC-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    title: payload.title || 'Customer Service',
    channel: payload.channel || 'WHATSAPP',
    contact_number: normalizePhone_(payload.contact_number || payload.phone || ''),
    greeting_message: payload.greeting_message || "Assalamu'alaikum, ada yang bisa kami bantu?",
    operating_hours: payload.operating_hours || '24 Jam',
    is_primary: payload.is_primary !== undefined ? payload.is_primary : true,
    sort_order: Number(payload.sort_order) || rows.length,
    status: payload.status || 'ACTIVE',
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_HELPDESK" : "CREATE_HELPDESK", "DB_Helpdesk_Contacts", id, null, payload, "Kontak bantuan '" + rowObj.title + "' disimpan");
  return { id: id, title: rowObj.title, entity: "DB_Helpdesk_Contacts" };
}

function deleteHelpdeskContact_(ss, helpdeskId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Helpdesk_Contacts");
  if (!sheet) throw new Error("Sheet DB_Helpdesk_Contacts tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(helpdeskId).toUpperCase()) {
      sheet.getRange(i + 1, 9).setValue('INACTIVE');
      logAudit_(actor, "DEACTIVATE_HELPDESK", "DB_Helpdesk_Contacts", helpdeskId, null, null, "Kontak bantuan dinonaktifkan");
      return { id: helpdeskId, action: 'INACTIVE', message: "Kontak bantuan berhasil dinonaktifkan" };
    }
  }
  return { id: helpdeskId, error: "Kontak bantuan tidak ditemukan" };
}

/**
 * Galeri & Testimoni
 */
function getGallery_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Gallery");
}

function saveGalleryItem_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Gallery");
  if (!sheet) throw new Error("Sheet DB_Gallery tidak ditemukan");
  autoUpgradeGallerySheets_(ss);

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nowStr = formatDateSafe_(new Date());
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
    id = "GAL-" + Utilities.formatString("%04d", rows.length);
  }

  const rowObj = {
    id: id,
    title: payload.title || 'Dokumentasi Jamaah',
    category: payload.category || 'HARAMAIN',
    media_type: payload.media_type || 'IMAGE',
    media_url: payload.media_url || 'assets/hero-haram.webp',
    thumbnail_url: payload.thumbnail_url || payload.media_url || 'assets/hero-haram.webp',
    caption: payload.caption || '',
    kloter_tag: payload.kloter_tag || 'KLOTER-ALL',
    activity_date: payload.activity_date || nowStr,
    status: payload.status || 'PUBLISHED',
    is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_GALLERY" : "CREATE_GALLERY", "DB_Gallery", id, null, payload, "Galeri '" + rowObj.title + "' disimpan");
  return { id: id, title: rowObj.title, entity: "DB_Gallery" };
}

function setGalleryStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Gallery");
  if (!sheet) throw new Error("Sheet DB_Gallery tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'PUBLISHED';
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 10).setValue(status);
      return { id: id, status: status, message: "Status galeri diperbarui" };
    }
  }
  return { id: id, error: "Galeri tidak ditemukan" };
}

function deleteGalleryItem_(ss, galleryId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Gallery");
  if (!sheet) throw new Error("Sheet DB_Gallery tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(galleryId).toUpperCase()) {
      sheet.getRange(i + 1, 10).setValue('ARCHIVED');
      return { id: galleryId, action: 'ARCHIVED', message: "Galeri diarsipkan" };
    }
  }
  return { id: galleryId, error: "Galeri tidak ditemukan" };
}

function autoUpgradeGallerySheets_(ss) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Gallery");
  if (!sheet) return;
  const canonical = ["id", "title", "category", "media_type", "media_url", "thumbnail_url", "caption", "kloter_tag", "activity_date", "status", "is_featured", "created_at"];
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  canonical.forEach(function(h) {
    if (curHeaders.indexOf(h) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
  });
}

function getTestimonials_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Testimonials");
}

function saveTestimonial_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Testimonials");
  if (!sheet) throw new Error("Sheet DB_Testimonials tidak ditemukan");

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nowStr = formatDateSafe_(new Date());
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
    id = "TSM-" + Utilities.formatString("%04d", rows.length);
  }

  const rowObj = {
    id: id,
    customer_name: payload.customer_name || 'Jamaah Alumni',
    customer_city: payload.customer_city || 'Kudus',
    customer_photo: payload.customer_photo || 'assets/default-avatar.webp',
    package_name: payload.package_name || 'Paket VIP Khidmat',
    rating: Number(payload.rating) || 5,
    review_text: payload.review_text || '',
    video_url: payload.video_url || '',
    departure_year: Number(payload.departure_year) || 2026,
    status: payload.status || 'PUBLISHED',
    is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_TESTIMONIAL" : "CREATE_TESTIMONIAL", "DB_Testimonials", id, null, payload, "Testimoni '" + rowObj.customer_name + "' disimpan");
  return { id: id, customer_name: rowObj.customer_name, entity: "DB_Testimonials" };
}

function setTestimonialStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Testimonials");
  if (!sheet) throw new Error("Sheet DB_Testimonials tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'PUBLISHED';
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 10).setValue(status);
      return { id: id, status: status, message: "Status testimoni diperbarui" };
    }
  }
  return { id: id, error: "Testimoni tidak ditemukan" };
}

function deleteTestimonial_(ss, testimonialId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Testimonials");
  if (!sheet) throw new Error("Sheet DB_Testimonials tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(testimonialId).toUpperCase()) {
      sheet.getRange(i + 1, 10).setValue('ARCHIVED');
      return { id: testimonialId, action: 'ARCHIVED', message: "Testimoni diarsipkan" };
    }
  }
  return { id: testimonialId, error: "Testimoni tidak ditemukan" };
}

/**
 * Artikel & Panduan Manasik
 */
function getArticles_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Articles");
}

function saveArticle_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Articles");
  if (!sheet) throw new Error("Sheet DB_Articles tidak ditemukan");
  autoUpgradeArticlesSheets_(ss);

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const nowStr = formatDateSafe_(new Date());
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
    id = "ART-" + Utilities.formatString("%04d", rows.length);
  }

  const title = payload.title || 'Artikel Panduan Baru';
  const slug = payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const rowObj = {
    id: id,
    title: title,
    slug: slug,
    category: payload.category || 'PANDUAN_MANASIK',
    author: payload.author || 'Dewan Pembimbing Ibadah',
    image_url: payload.image_url || 'assets/hero-haram.webp',
    summary: payload.summary || '',
    content: payload.content || '',
    read_time_minutes: Number(payload.read_time_minutes) || 5,
    is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
    status: payload.status || 'PUBLISHED',
    published_at: payload.published_at || nowStr,
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_ARTICLE" : "CREATE_ARTICLE", "DB_Articles", id, null, payload, "Artikel '" + rowObj.title + "' disimpan");
  return { id: id, title: rowObj.title, entity: "DB_Articles" };
}

function deleteArticle_(ss, articleId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Articles");
  if (!sheet) throw new Error("Sheet DB_Articles tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(articleId).toUpperCase()) {
      sheet.getRange(i + 1, 11).setValue('ARCHIVED');
      return { id: articleId, action: 'ARCHIVED', message: "Artikel diarsipkan" };
    }
  }
  return { id: articleId, error: "Artikel tidak ditemukan" };
}

function autoUpgradeArticlesSheets_(ss) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Articles");
  if (!sheet) return;
  const canonical = ["id", "title", "slug", "category", "author", "image_url", "summary", "content", "read_time_minutes", "is_featured", "status", "published_at", "created_at"];
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  canonical.forEach(function(h) {
    if (curHeaders.indexOf(h) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
  });
}
