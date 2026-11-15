/**
 * ============================================================================
 * SDW UMROH — CENTRAL API ROUTER & MUTATION DISPATCHER
 * File: 03_ApiRouter.gs
 * Version: 2.5.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

/**
 * Entrypoint GET: Read Endpoints & System Ping
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
    const ss = getSpreadsheet();

    // 1. Health check & Ping
    if (action === 'ping' || action === 'healthCheck') {
      return createResponse(true, {
        status: "ONLINE",
        version: CONFIG.VERSION,
        app: CONFIG.APP_NAME,
        timestamp: new Date().toISOString(),
        spreadsheetConnected: Boolean(ss)
      });
    }

    if (action === 'setupDatabase' || action === 'initDatabase') {
      const res = setupDatabase();
      return createResponse(true, res);
    }

    if (action === 'seedKloter27Okt') {
      seedKloter27Oktober2026(ss);
      return createResponse(true, { message: "Kloter 27 Oktober 2026 berhasil diseed" });
    }

    // 2. Katalog Paket & Logistik
    if (action === 'getPackages') return createResponse(true, getPackages_(ss));
    if (action === 'getDepartures') return createResponse(true, getDepartures_(ss));
    if (action === 'getHotels') return createResponse(true, getHotels_(ss));
    if (action === 'getAirlines') return createResponse(true, getAirlines_(ss));
    if (action === 'getAirports') return createResponse(true, getAirports_(ss));

    // 3. Konten, Galeri, FAQ, Helpdesk
    if (action === 'getGallery') return createResponse(true, getGallery_(ss));
    if (action === 'getTestimonials') return createResponse(true, getTestimonials_(ss));
    if (action === 'getArticles') return createResponse(true, getArticles_(ss));
    if (action === 'getZiarahPlaces') return createResponse(true, getZiarahPlaces_(ss));
    if (action === 'getFaq') return createResponse(true, getFaq_(ss));
    if (action === 'getHelpdeskContacts' || action === 'getHelpdesk') return createResponse(true, getHelpdeskContacts_(ss));

    // 4. Pengguna & RBAC
    if (action === 'getUsers') return createResponse(true, getUsers_(ss));
    if (action === 'getRolePermissions') return createResponse(true, getRolePermissions_(ss, e.parameter.role));
    if (action === 'adminLogin' || action === 'loginStaff') return createResponse(true, loginStaff_(ss, e.parameter, 'WEB_LOGIN'));

    // 5. CRM & Prospek
    if (action === 'getLeads') return createResponse(true, getLeads_(ss, e.parameter));
    if (action === 'getSalesActivities') return createResponse(true, getSalesActivities_(ss, e.parameter));

    // 6. Registrasi & Dokumen Jamaah
    if (action === 'getRegistrations') return createResponse(true, getRegistrations_(ss));
    if (action === 'checkRegistration') return createResponse(true, checkRegistration_(ss, e.parameter.query || e.parameter.id || e.parameter.nik));
    if (action === 'checkAccount' || action === 'loginPilgrim') return createResponse(true, loginPilgrim_(ss, e.parameter, 'WEB_QUERY'));
    if (action === 'getPilgrimDocuments') return createResponse(true, getPilgrimDocuments_(ss, e.parameter.registrationId));

    // 7. Keuangan & Escrow
    if (action === 'getPayments') return createResponse(true, getPayments_(ss));

    // 8. Operasional & Manifes
    if (action === 'getManifest' || action === 'getTrips') return createResponse(true, getManifest_(ss, e.parameter.departureId));
    if (action === 'getPreparation') return createResponse(true, getPreparation_(ss, e.parameter.registrationId));
    if (action === 'getManasik') return createResponse(true, getManasik_(ss, e.parameter.departureId));

    // 9. Sertifikat & Badal
    if (action === 'getBadalCertificates') return createResponse(true, getBadalCertificates_(ss));

    // 10. Audit Logs
    if (action === 'getAuditLogs') return createResponse(true, queryAuditLogs_(ss, e.parameter));

    // 11. Profil Lembaga & Mitra Syiar
    if (action === 'getProfileInstitution') return createResponse(true, getProfileInstitutionData_(ss));
    if (action === 'getProfileDirector') return createResponse(true, getProfileDirectorData_(ss));
    if (action === 'getProfileGuides') return createResponse(true, getProfileGuidesData_(ss));
    if (action === 'getProfileLegality') return createResponse(true, getProfileLegalityData_(ss));
    if (action === 'getProfileMitraSyiar') return createResponse(true, getProfileMitraSyiarData_(ss));
    if (action === 'getAllProfileData') return createResponse(true, getAllProfileData_(ss));

    // 12. Kontak & Media Sosial
    if (action === 'getContactSocial') return createResponse(true, getContactSocialData_(ss));

    return createResponse(false, null, "Aksi GET '" + action + "' tidak dikenali oleh sistem API SDW UMROH");
  } catch (err) {
    if (typeof Logger !== 'undefined') Logger.log("doGet fatal error: " + err.message);
    return createResponse(false, null, err.message);
  }
}

/**
 * Entrypoint POST: Mutasi Data, Batch Sync & File Upload
 */
function doPost(e) {
  try {
    let payload = {};
    let action = '';
    let actor = 'SYSTEM';

    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    action = payload.action || (e && e.parameter && e.parameter.action) || '';
    actor = payload.actor || (e && e.parameter && e.parameter.actor) || 'SYSTEM';

    const ss = getSpreadsheet();

    // 1. Direct File Upload Endpoints
    if (action === 'uploadPasfoto' || action === 'uploadCertificatePhoto') {
      const res = uploadPilgrimPhoto_(payload, actor);
      return createResponse(true, res);
    }
    if (action === 'uploadProfilePhoto') {
      const res = uploadProfilePhoto_(payload, actor);
      return createResponse(true, res);
    }
    if (action === 'uploadPaymentProof') {
      const res = uploadPaymentProof_(payload, actor);
      return createResponse(true, res);
    }

    // 2. Database Initialization
    if (action === 'setupDatabase' || action === 'initDatabase') {
      const res = setupDatabase();
      return createResponse(true, res);
    }
    if (action === 'seedKloter27Okt') {
      seedKloter27Oktober2026(ss);
      return createResponse(true, { message: "Kloter 27 Oktober 2026 berhasil diseed" });
    }

    // 3. Batch Synchronization (Offline-First Sync Engine)
    if (action === 'syncBatch' || (payload.mutations && Array.isArray(payload.mutations))) {
      const mutations = payload.mutations || [];
      const results = [];
      mutations.forEach(function(mut) {
        try {
          const mAct = mut.action;
          const mPay = mut.payload || {};
          const mRes = processSingleMutation_(ss, mAct, mPay, actor);
          results.push({ mutationId: mut.id || null, success: true, result: mRes });
        } catch (mErr) {
          results.push({ mutationId: mut.id || null, success: false, error: mErr.message });
        }
      });
      return createResponse(true, { processed: results.length, results: results });
    }

    // 4. Single Mutation
    const result = processSingleMutation_(ss, action, payload, actor);
    return createResponse(true, result);
  } catch (err) {
    if (typeof Logger !== 'undefined') Logger.log("doPost fatal error: " + err.message);
    return createResponse(false, null, err.message);
  }
}

/**
 * Dispatcher Pemrosesan Mutasi Tunggal
 */
function processSingleMutation_(ss, action, payload, actor) {
  if (!ss) ss = getSpreadsheet();

  // 1. Autentikasi & Akun Pengguna
  if (action === 'loginStaff' || action === 'adminLogin') return loginStaff_(ss, payload, actor);
  if (action === 'loginPilgrim' || action === 'checkAccount') return loginPilgrim_(ss, payload, actor);
  if (action === 'registerAccount' || action === 'registerPilgrimAccount' || action === 'registerPilgrim') {
    return registerPilgrim_(ss, payload, actor);
  }
  if (action === 'saveUser') return saveUser_(ss, payload, actor);
  if (action === 'deleteUser') return deleteUser_(ss, payload.id, actor);
  if (action === 'toggleUserStatus') return toggleUserStatus_(ss, payload.id, payload.status, actor);
  if (action === 'saveRoleMatrixPermission') return saveRoleMatrixPermission_(ss, payload, actor);
  if (action === 'batchUpdateRolePermissions') return batchUpdateRolePermissions_(ss, payload, actor);
  if (action === 'upgradeUsersSchema') {
    upgradeUsersSchema_(ss);
    return { success: true, message: "Skema DB_Users dan DB_Role_Permissions berhasil disinkronkan" };
  }

  // 2. CRM & Sales
  if (action === 'createLead') return createLead_(ss, payload, actor);
  if (action === 'updateLeadStatus') return updateLeadStatus_(ss, payload, actor);
  if (action === 'saveSalesActivity') return saveSalesActivity_(ss, payload, actor);

  // 3. Paket & Keberangkatan
  if (action === 'savePackage') return savePackage_(ss, payload, actor);
  if (action === 'setPackageStatus') return setPackageStatus_(ss, payload, actor);
  if (action === 'deletePackage') return deletePackage_(ss, payload.id, actor);
  if (action === 'saveDeparture') return saveDeparture_(ss, payload, actor);
  if (action === 'setDepartureStatus') return setDepartureStatus_(ss, payload, actor);
  if (action === 'deleteDeparture') return deleteDeparture_(ss, payload.id, actor);

  // 4. Hotel, Maskapai, Bandara
  if (action === 'saveHotel') return saveHotel_(ss, payload, actor);
  if (action === 'setHotelStatus') return setHotelStatus_(ss, payload, actor);
  if (action === 'deleteHotel') return deleteHotel_(ss, payload.id, actor);
  if (action === 'saveAirline') return saveAirline_(ss, payload, actor);
  if (action === 'deleteAirline') return deleteAirline_(ss, payload.id, actor);
  if (action === 'saveAirport') return saveAirport_(ss, payload, actor);
  if (action === 'deleteAirport') return deleteAirport_(ss, payload.id, actor);

  // 5. Registrasi & Dokumen
  if (action === 'confirmRegistration' || action === 'verifyBookingDP') return confirmRegistration_(ss, payload, actor);
  if (action === 'verifyDocument') return verifyDocument_(ss, payload, actor);

  // 6. Keuangan & Pembayaran
  if (action === 'createPayment') return createPayment_(ss, payload, actor);
  if (action === 'verifyPayment') return verifyPayment_(ss, payload, actor);

  // 7. Operasional & Lapangan
  if (action === 'saveZiarahPlace') return saveZiarahPlace_(ss, payload, actor);
  if (action === 'deleteZiarahPlace') return deleteZiarahPlace_(ss, payload.id, actor);
  if (action === 'updatePreparation') return updatePreparation_(ss, payload, actor);
  if (action === 'updateManasik') return updateManasik_(ss, payload, actor);

  // 8. Badal & Sertifikat
  if (action === 'saveBadalCertificate') return saveBadalCertificate_(ss, payload, actor);
  if (action === 'deleteBadalCertificate') return deleteBadalCertificate_(ss, payload.id, actor);

  // 9. FAQ & Bantuan
  if (action === 'saveFaq') return saveFaq_(ss, payload, actor);
  if (action === 'deleteFaq') return deleteFaq_(ss, payload.id, actor);
  if (action === 'saveHelpdeskContact') return saveHelpdeskContact_(ss, payload, actor);
  if (action === 'deleteHelpdeskContact') return deleteHelpdeskContact_(ss, payload.id, actor);

  // 10. Galeri, Testimoni & Artikel
  if (action === 'saveGalleryItem') return saveGalleryItem_(ss, payload, actor);
  if (action === 'setGalleryStatus') return setGalleryStatus_(ss, payload, actor);
  if (action === 'deleteGalleryItem') return deleteGalleryItem_(ss, payload.id, actor);
  if (action === 'saveTestimonial') return saveTestimonial_(ss, payload, actor);
  if (action === 'setTestimonialStatus') return setTestimonialStatus_(ss, payload, actor);
  if (action === 'deleteTestimonial') return deleteTestimonial_(ss, payload.id, actor);
  if (action === 'saveArticle') return saveArticle_(ss, payload, actor);
  if (action === 'deleteArticle') return deleteArticle_(ss, payload.id, actor);

  // 11. Profil Lembaga & Mitra Syiar
  if (action === 'saveProfileInstitution') return saveProfileInstitution_(ss, payload, actor);
  if (action === 'saveProfileDirector') return saveProfileDirector_(ss, payload, actor);
  if (action === 'saveProfileGuide') return saveProfileGuide_(ss, payload, actor);
  if (action === 'deleteProfileGuide') return deleteProfileGuide_(ss, payload.id, actor);
  if (action === 'saveProfileLegalityDoc') return saveProfileLegalityDoc_(ss, payload, actor);
  if (action === 'deleteProfileLegalityDoc') return deleteProfileLegalityDoc_(ss, payload.id, actor);
  if (action === 'saveProfileMitraSyiar') return saveProfileMitraSyiar_(ss, payload, actor);
  if (action === 'deleteProfileMitraSyiar') return deleteProfileMitraSyiar_(ss, payload.id, actor);
  if (action === 'saveAllProfileData') return saveAllProfileData_(ss, payload, actor);

  // 12. Kontak & Media Sosial
  if (action === 'saveContactSocial') return saveContactSocialData_(ss, payload, actor);

  throw new Error("Aksi mutasi '" + action + "' tidak didukung oleh backend API SDW UMROH");
}
