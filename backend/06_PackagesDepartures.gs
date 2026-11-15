/**
 * ============================================================================
 * SDW UMROH — PACKAGES, DEPARTURES, HOTELS & FLIGHT LOGISTICS SERVICE
 * File: 06_PackagesDepartures.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Membaca katalog paket umroh lengkap dengan relasi hotel, maskapai, dan jadwal
 */
function getPackages_(ss) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Packages");
  if (!sheet || sheet.getLastRow() <= 1) return [];

  autoUpgradePackagesSheet_(sheet, ss);

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];

  const priceSheet = ss.getSheetByName("DB_Package_Prices");
  const priceMap = {};
  if (priceSheet && priceSheet.getLastRow() > 1) {
    const pRows = priceSheet.getDataRange().getValues();
    const pHeaders = pRows[0];
    pRows.slice(1).forEach(function(pRow) {
      const pObj = {};
      pHeaders.forEach(function(h, i) { pObj[h] = pRow[i]; });
      if (pObj.package_id) priceMap[pObj.package_id] = pObj;
    });
  }

  const depSheet = ss.getSheetByName("DB_Departures");
  const depMap = {};
  if (depSheet && depSheet.getLastRow() > 1) {
    const dRows = depSheet.getDataRange().getValues();
    const dHeaders = dRows[0];
    dRows.slice(1).forEach(function(dRow) {
      const dObj = {};
      dHeaders.forEach(function(h, i) { dObj[h] = dRow[i]; });
      if (dObj.package_id && !depMap[dObj.package_id]) {
        depMap[dObj.package_id] = dObj;
      }
    });
  }

  const hotels = getSheetRowsAsObjects_(ss, "DB_Hotels");
  const hotelMap = {};
  hotels.forEach(function(h) { hotelMap[h.id] = h; hotelMap[h.name] = h; });

  return rows.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      let val = row[i];
      if (val instanceof Date) val = formatDateSafe_(val);
      obj[h] = val;
    });

    const prices = priceMap[obj.id] || {};
    const dep = depMap[obj.id] || {};

    const makkahHotel = hotelMap[obj.hotel_makkah] || {};
    const madinahHotel = hotelMap[obj.hotel_madinah] || {};

    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug || '',
      package_type: obj.package_type || 'REGULER',
      duration_days: Number(obj.duration_days) || 9,
      status: obj.status || 'PUBLISHED',
      description: obj.description || '',
      badge: obj.badge || '',
      image_url: obj.image_url || '',
      rating: Number(obj.rating) || 4.9,
      starting_price: Number(obj.starting_price) || 28500000,
      discount_label: obj.discount_label || '',
      hotel_makkah: obj.hotel_makkah || 'Makkah Hotel Ring-1',
      hotel_makkah_distance: makkahHotel.distance_meters ? makkahHotel.distance_meters + 'm' : (obj.hotel_makkah_distance || '50m'),
      hotel_madinah: obj.hotel_madinah || 'Madinah Hotel Ring-1',
      hotel_madinah_distance: madinahHotel.distance_meters ? madinahHotel.distance_meters + 'm' : (obj.hotel_madinah_distance || '100m'),
      airline: obj.airline || dep.airline || 'Saudia Airlines Direct',
      seats_left: Number(obj.seats_left) || (dep.capacity_total ? (dep.capacity_total - (dep.capacity_booked || 0)) : 12),
      prices: {
        quad: Number(prices.quad_price) || Number(obj.starting_price) || 28500000,
        triple: Number(prices.triple_price) || (Number(obj.starting_price) ? Number(obj.starting_price) + 2000000 : 30500000),
        double: Number(prices.double_price) || (Number(obj.starting_price) ? Number(obj.starting_price) + 4000000 : 32500000)
      },
      next_departure: dep.departure_date ? formatDateSafe_(dep.departure_date) : 'Oktober 2026',
      published_at: obj.published_at || obj.created_at,
      created_at: obj.created_at,
      updated_at: obj.updated_at
    };
  });
}

/**
 * Menyimpan / memperbarui katalog paket umroh
 */
function savePackage_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Packages");
  if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");

  autoUpgradePackagesSheet_(sheet, ss);

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
    let maxNum = 0;
    for (let i = 1; i < rows.length; i++) {
      const rowId = String(rows[i][0] || '');
      const match = rowId.match(/PKG-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    id = "PKG-" + String(maxNum + 1).padStart(6, '0');
  }

  const name = payload.name || payload.title || "Paket Umroh Baru";
  const slug = payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const packageType = payload.package_type || payload.packageType || 'REGULER';
  const durationDays = Number(payload.duration_days || payload.durationDays) || 9;
  const status = payload.status || 'PUBLISHED';
  const description = payload.description || '';
  const hotelMakkah = payload.hotel_makkah || payload.hotelMakkah || 'Makkah Hotel Ring-1';
  const hotelMadinah = payload.hotel_madinah || payload.hotelMadinah || 'Madinah Hotel Ring-1';
  const airline = payload.airline || 'Saudia Airlines';
  const seatsLeft = Number(payload.seats_left || payload.seatsLeft) || 12;
  const badge = payload.badge || '';
  const imageUrl = payload.image_url || payload.imageUrl || 'assets/paket-umroh-default.webp';
  const rating = Number(payload.rating) || 4.9;
  const startingPrice = Number(payload.starting_price || payload.startingPrice) || 28500000;
  const discountLabel = payload.discount_label || payload.discountLabel || '';
  const publishedAt = payload.published_at || nowStr;
  const createdAt = (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr;
  const updatedAt = nowStr;

  const pkgObj = {
    id: id,
    name: name,
    slug: slug,
    package_type: packageType,
    duration_days: durationDays,
    status: status,
    description: description,
    hotel_makkah: hotelMakkah,
    hotel_madinah: hotelMadinah,
    airline: airline,
    seats_left: seatsLeft,
    badge: badge,
    image_url: imageUrl,
    rating: rating,
    starting_price: startingPrice,
    discount_label: discountLabel,
    published_at: publishedAt,
    created_at: createdAt,
    updated_at: updatedAt
  };

  const rowData = headers.map(function(h) { return pkgObj[h] !== undefined ? pkgObj[h] : ''; });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  // Update DB_Package_Prices jika ada informasi harga kamar
  if (payload.price_quad || payload.price_triple || payload.price_double) {
    const pSheet = ss.getSheetByName("DB_Package_Prices");
    if (pSheet) {
      const pRows = pSheet.getDataRange().getValues();
      let pRowIndex = -1;
      for (let i = 1; i < pRows.length; i++) {
        if (String(pRows[i][1]) === String(id)) {
          pRowIndex = i + 1;
          break;
        }
      }
      const pData = [
        "PRC-" + id.replace('PKG-', ''),
        id,
        "IDR",
        Number(payload.price_quad) || startingPrice,
        Number(payload.price_triple) || (startingPrice + 2000000),
        Number(payload.price_double) || (startingPrice + 4000000),
        nowStr,
        "-",
        "ACTIVE"
      ];
      if (pRowIndex > 0) {
        pSheet.getRange(pRowIndex, 1, 1, pData.length).setValues([pData]);
      } else {
        pSheet.appendRow(pData);
      }
    }
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_PACKAGE" : "CREATE_PACKAGE", "DB_Packages", id, null, payload, "Paket '" + name + "' berhasil disimpan");
  return { id: id, name: name, status: status, starting_price: startingPrice, entity: "DB_Packages" };
}

function setPackageStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Packages");
  if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'DRAFT';
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 6).setValue(status);
      sheet.getRange(i + 1, sheet.getLastColumn()).setValue(formatDateSafe_(new Date()));
      logAudit_(actor, "SET_PACKAGE_STATUS", "DB_Packages", id, null, { status: status }, "Status paket diubah ke " + status);
      return { id: id, status: status, message: "Status paket berhasil diperbarui" };
    }
  }
  return { id: id, error: "Paket tidak ditemukan" };
}

function deletePackage_(ss, pkgId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Packages");
  if (!sheet) throw new Error("Sheet DB_Packages tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(pkgId).toUpperCase()) {
      sheet.getRange(i + 1, 6).setValue('ARCHIVED');
      sheet.getRange(i + 1, sheet.getLastColumn()).setValue(formatDateSafe_(new Date()));
      logAudit_(actor, "ARCHIVE_PACKAGE", "DB_Packages", pkgId, null, null, "Paket diarsipkan");
      return { id: pkgId, action: 'ARCHIVED', message: "Paket berhasil diarsipkan" };
    }
  }
  return { id: pkgId, error: "Paket tidak ditemukan" };
}

function autoUpgradePackagesSheet_(sheet, ss) {
  if (!sheet) return;
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  const canonical = ["id", "name", "slug", "package_type", "duration_days", "status", "description", "hotel_makkah", "hotel_madinah", "airline", "seats_left", "badge", "image_url", "rating", "starting_price", "discount_label", "published_at", "created_at", "updated_at"];
  canonical.forEach(function(headerName) {
    if (curHeaders.indexOf(headerName) === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(headerName);
    }
  });
}

/**
 * Keberangkatan & Kloter
 */
function getDepartures_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Departures");
}

function saveDeparture_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Departures");
  if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");
  autoUpgradeDeparturesSheet_(sheet, ss);

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
    const depDateStr = (payload.departure_date || payload.departureDate || '').replace(/[^0-9]/g, '').substring(0, 8);
    id = "DEP-" + (depDateStr || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd"));
  }

  const rowObj = {
    id: id,
    package_id: payload.package_id || payload.packageId || 'PKG-000001',
    departure_date: payload.departure_date || payload.departureDate || '',
    return_date: payload.return_date || payload.returnDate || '',
    airline: payload.airline || 'Saudia Airlines',
    origin_airport: payload.origin_airport || payload.originAirport || 'SOC',
    capacity_total: Number(payload.capacity_total || payload.capacityTotal) || 45,
    capacity_booked: Number(payload.capacity_booked || payload.capacityBooked) || 0,
    status: payload.status || 'OPEN',
    notes: payload.notes || ''
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_DEPARTURE" : "CREATE_DEPARTURE", "DB_Departures", id, null, payload, "Kloter " + id + " berhasil disimpan");
  return { id: id, status: rowObj.status, entity: "DB_Departures" };
}

function setDepartureStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Departures");
  if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'OPEN';
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 9).setValue(status);
      logAudit_(actor, "SET_DEPARTURE_STATUS", "DB_Departures", id, null, { status: status }, "Status kloter diubah ke " + status);
      return { id: id, status: status, message: "Status keberangkatan berhasil diperbarui" };
    }
  }
  return { id: id, error: "Keberangkatan tidak ditemukan" };
}

function deleteDeparture_(ss, depId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Departures");
  if (!sheet) throw new Error("Sheet DB_Departures tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(depId).toUpperCase()) {
      sheet.getRange(i + 1, 9).setValue('CANCELLED');
      logAudit_(actor, "CANCEL_DEPARTURE", "DB_Departures", depId, null, null, "Keberangkatan dibatalkan");
      return { id: depId, action: 'CANCELLED', message: "Keberangkatan berhasil dibatalkan" };
    }
  }
  return { id: depId, error: "Keberangkatan tidak ditemukan" };
}

function autoUpgradeDeparturesSheet_(sheet, ss) {
  if (!sheet) return;
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  const canonical = ["id", "package_id", "departure_date", "return_date", "airline", "origin_airport", "capacity_total", "capacity_booked", "status", "notes"];
  canonical.forEach(function(headerName) {
    if (curHeaders.indexOf(headerName) === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(headerName);
    }
  });
}

/**
 * Fasilitas Hotel
 */
function getHotels_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Hotels");
}

function saveHotel_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Hotels");
  if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");
  autoUpgradeHotelsSheet_(sheet, ss);

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
    let maxNum = 0;
    for (let i = 1; i < rows.length; i++) {
      const rowId = String(rows[i][0] || '');
      const match = rowId.match(/HTL-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    id = "HTL-" + String(maxNum + 1).padStart(6, '0');
  }

  const rowObj = {
    id: id,
    name: payload.name || 'Hotel Bintang 5',
    city: payload.city || 'Makkah',
    star_rating: Number(payload.star_rating || payload.starRating) || 5,
    distance_meters: Number(payload.distance_meters || payload.distanceMeters) || 50,
    distance_text: payload.distance_text || payload.distanceText || 'Pelataran Masjidil Haram (Ring 1)',
    location_zone: payload.location_zone || payload.locationZone || 'Ring 1',
    gate_info: payload.gate_info || payload.gateInfo || 'Pintu King Abdul Aziz',
    image_url: payload.image_url || payload.imageUrl || 'assets/hotel-default.webp',
    description: payload.description || '',
    maps_url: payload.maps_url || payload.mapsUrl || '',
    facilities: payload.facilities || 'Free WiFi, Shuttle 24 Jam, Buffet Indonesia',
    status: payload.status || 'ACTIVE',
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr,
    updated_at: nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_HOTEL" : "CREATE_HOTEL", "DB_Hotels", id, null, payload, "Hotel '" + rowObj.name + "' berhasil disimpan");
  return { id: id, name: rowObj.name, status: rowObj.status, entity: "DB_Hotels" };
}

function setHotelStatus_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Hotels");
  if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");
  const id = payload.id;
  const status = payload.status || 'ACTIVE';
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(id).toUpperCase()) {
      sheet.getRange(i + 1, 13).setValue(status);
      sheet.getRange(i + 1, sheet.getLastColumn()).setValue(formatDateSafe_(new Date()));
      logAudit_(actor, "SET_HOTEL_STATUS", "DB_Hotels", id, null, { status: status }, "Status hotel diubah ke " + status);
      return { id: id, status: status, message: "Status hotel berhasil diperbarui" };
    }
  }
  return { id: id, error: "Hotel tidak ditemukan" };
}

function deleteHotel_(ss, hotelId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Hotels");
  if (!sheet) throw new Error("Sheet DB_Hotels tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(hotelId).toUpperCase()) {
      sheet.getRange(i + 1, 13).setValue('INACTIVE');
      sheet.getRange(i + 1, sheet.getLastColumn()).setValue(formatDateSafe_(new Date()));
      logAudit_(actor, "DEACTIVATE_HOTEL", "DB_Hotels", hotelId, null, null, "Hotel dinonaktifkan");
      return { id: hotelId, action: 'INACTIVE', message: "Hotel berhasil dinonaktifkan" };
    }
  }
  return { id: hotelId, error: "Hotel tidak ditemukan" };
}

function autoUpgradeHotelsSheet_(sheet, ss) {
  if (!sheet) return;
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  const canonical = ["id", "name", "city", "star_rating", "distance_meters", "distance_text", "location_zone", "gate_info", "image_url", "description", "maps_url", "facilities", "status", "created_at", "updated_at"];
  canonical.forEach(function(headerName) {
    if (curHeaders.indexOf(headerName) === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(headerName);
    }
  });
}

/**
 * Maskapai Penerbangan (Airlines) & Bandara (Airports)
 */
function getAirlines_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Airlines");
}

function saveAirline_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Airlines");
  if (!sheet) throw new Error("Sheet DB_Airlines tidak ditemukan");
  autoUpgradeAirlinesSheets_(ss);

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
    id = "AIR-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    code: payload.code || 'SV',
    name: payload.name || 'Saudia Airlines',
    flight_type: payload.flight_type || 'DIRECT',
    transit_hub: payload.transit_hub || '-',
    baggage_allowance: payload.baggage_allowance || '2x 23kg + 5L Zamzam',
    cabin_classes: payload.cabin_classes || 'Economy, Business',
    logo_url: payload.logo_url || 'assets/airline-saudia.webp',
    sort_order: Number(payload.sort_order) || rows.length,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    notes: payload.notes || '',
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_AIRLINE" : "CREATE_AIRLINE", "DB_Airlines", id, null, payload, "Maskapai '" + rowObj.name + "' berhasil disimpan");
  return { id: id, name: rowObj.name, entity: "DB_Airlines" };
}

function deleteAirline_(ss, airlineId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Airlines");
  if (!sheet) throw new Error("Sheet DB_Airlines tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(airlineId).toUpperCase()) {
      sheet.getRange(i + 1, 10).setValue(false);
      logAudit_(actor, "DEACTIVATE_AIRLINE", "DB_Airlines", airlineId, null, null, "Maskapai dinonaktifkan");
      return { id: airlineId, action: 'DEACTIVATED', message: "Maskapai berhasil dinonaktifkan" };
    }
  }
  return { id: airlineId, error: "Maskapai tidak ditemukan" };
}

function autoUpgradeAirlinesSheets_(ss) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Airlines");
  if (!sheet) return;
  const canonical = ["id", "code", "name", "flight_type", "transit_hub", "baggage_allowance", "cabin_classes", "logo_url", "sort_order", "is_active", "notes", "created_at"];
  const curHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(function(h) { return String(h).trim(); });
  canonical.forEach(function(h) {
    if (curHeaders.indexOf(h) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
    }
  });
}

function getAirports_(ss) {
  if (!ss) ss = getSpreadsheet();
  return getSheetRowsAsObjects_(ss, "DB_Airports");
}

function saveAirport_(ss, payload, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Airports");
  if (!sheet) throw new Error("Sheet DB_Airports tidak ditemukan");
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
    id = "APT-" + Utilities.formatString("%03d", rows.length);
  }

  const rowObj = {
    id: id,
    code: payload.code || 'SOC',
    name: payload.name || 'Adi Soemarmo Solo',
    city: payload.city || 'Solo',
    country: payload.country || 'Indonesia',
    role: payload.role || 'ORIGIN',
    terminal_info: payload.terminal_info || 'Terminal Internasional',
    sort_order: Number(payload.sort_order) || rows.length,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    created_at: (rowIndex > 0 && rows[rowIndex - 1][headers.indexOf('created_at')]) ? rows[rowIndex - 1][headers.indexOf('created_at')] : nowStr
  };

  const rowData = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ''; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  logAudit_(actor, rowIndex > 0 ? "UPDATE_AIRPORT" : "CREATE_AIRPORT", "DB_Airports", id, null, payload, "Bandara '" + rowObj.name + "' berhasil disimpan");
  return { id: id, name: rowObj.name, entity: "DB_Airports" };
}

function deleteAirport_(ss, airportId, actor) {
  if (!ss) ss = getSpreadsheet();
  const sheet = ss.getSheetByName("DB_Airports");
  if (!sheet) throw new Error("Sheet DB_Airports tidak ditemukan");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === String(airportId).toUpperCase()) {
      sheet.getRange(i + 1, 8).setValue(false);
      logAudit_(actor, "DEACTIVATE_AIRPORT", "DB_Airports", airportId, null, null, "Bandara dinonaktifkan");
      return { id: airportId, action: 'DEACTIVATED', message: "Bandara berhasil dinonaktifkan" };
    }
  }
  return { id: airportId, error: "Bandara tidak ditemukan" };
}
