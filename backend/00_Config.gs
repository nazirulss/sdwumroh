/**
 * ============================================================================
 * SDW UMROH — CONFIGURATION & CORE ENVIRONMENT
 * File: 00_Config.gs
 * Version: 2.5.0 (Pola Asnawiyyah Modular Architecture)
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

const CONFIG = {
  APP_NAME: 'SDW UMROH API',
  VERSION: '2.5.0',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  SPREADSHEET_ID: '1UTZ2uJ76rxAljWlfOLx3MpCzV2e4JLUG5IJ7o8SZn3Q',
  DRIVE_FOLDER_ID: '1Xz5QTa68fcipY9BN_vIXsdLklH6bws-J',
  PASFOTO_FOLDER_NAME: 'Pasfoto_Sertifikat',
  PROFILE_FOLDER_NAME: 'Foto_Profil_Lembaga',
  DEFAULT_SALT: 'SDW_UMROH_SECURE_SALT_2026_KHIDMAT',
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    DIRECTOR: 'DIRECTOR',
    FINANCE: 'FINANCE',
    OPERATIONS: 'OPERATIONS',
    SALES: 'SALES',
    MUTHAWWIF: 'MUTHAWWIF',
    PILGRIM: 'PILGRIM'
  }
};

/**
 * Mendapatkan referensi instance Spreadsheet aktif atau via SPREADSHEET_ID
 */
function getSpreadsheet() {
  try {
    if (typeof SpreadsheetApp !== 'undefined') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) return ss;
    }
  } catch (e) {
    // Standalone script
  }
  let propId = null;
  try {
    if (typeof PropertiesService !== 'undefined') {
      propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    }
  } catch (e) {}

  const targetId = propId || CONFIG.SPREADSHEET_ID;
  if (targetId && typeof SpreadsheetApp !== 'undefined') {
    return SpreadsheetApp.openById(targetId);
  }
  return null;
}

/**
 * Helper: Mengambil atau membuat sub-folder Pasfoto_Sertifikat di Google Drive
 */
function getPasfotoFolder() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== '__SDW_CONFIG_PENDING__') {
    try {
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      if (parentFolder) {
        const subFolders = parentFolder.getFoldersByName(CONFIG.PASFOTO_FOLDER_NAME);
        if (subFolders.hasNext()) {
          return subFolders.next();
        }
        return parentFolder.createFolder(CONFIG.PASFOTO_FOLDER_NAME);
      }
    } catch (e) {
      Logger.log("getPasfotoFolder parent error: " + e.message);
    }
  }

  try {
    const folders = DriveApp.getFoldersByName(CONFIG.PASFOTO_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(CONFIG.PASFOTO_FOLDER_NAME);
  } catch (e) {
    Logger.log("getPasfotoFolder root error: " + e.message);
    throw new Error("Gagal mengakses folder Pasfoto_Sertifikat di Google Drive: " + e.message);
  }
}

/**
 * Helper: Mengambil atau membuat sub-folder Foto_Profil_Lembaga di Google Drive
 */
function getProfileFolder_() {
  if (CONFIG.DRIVE_FOLDER_ID && CONFIG.DRIVE_FOLDER_ID !== '__SDW_CONFIG_PENDING__') {
    try {
      const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      if (parentFolder) {
        const subFolders = parentFolder.getFoldersByName(CONFIG.PROFILE_FOLDER_NAME);
        if (subFolders.hasNext()) {
          return subFolders.next();
        }
        return parentFolder.createFolder(CONFIG.PROFILE_FOLDER_NAME);
      }
    } catch (e) {
      Logger.log("getProfileFolder_ error: " + e.message);
    }
  }
  try {
    const folders = DriveApp.getFoldersByName(CONFIG.PROFILE_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return DriveApp.createFolder(CONFIG.PROFILE_FOLDER_NAME);
  } catch (e) {
    Logger.log("getProfileFolder_ fallback error: " + e.message);
    return null;
  }
}

/**
 * Jalankan fungsi ini 1x di editor untuk menyetujui izin Google Drive
 */
function authorizeDriveAccess() {
  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  Logger.log("✅ Izin Google Drive BERHASIL! Folder Utama: " + folder.getName());
  const target = getPasfotoFolder();
  Logger.log("✅ Sub-Folder Pasfoto_Sertifikat SIAP! ID: " + target.getId() + " URL: " + target.getUrl());
  return {
    success: true,
    folderName: folder.getName(),
    subfolderName: target.getName(),
    subfolderId: target.getId(),
    subfolderUrl: target.getUrl()
  };
}

/**
 * Diagnostic upload test
 */
function testDriveUpload() {
  const folder = getPasfotoFolder();
  const blob = Utilities.newBlob("Test file pasfoto pada " + new Date().toISOString(), "text/plain", "test_diagnostic.txt");
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  Logger.log("✅ Berhasil upload test ke Drive! ID: " + file.getId() + " - URL: " + file.getUrl());
  return {
    success: true,
    fileId: file.getId(),
    url: file.getUrl(),
    folderName: folder.getName(),
    folderId: folder.getId()
  };
}
