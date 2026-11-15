/**
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
