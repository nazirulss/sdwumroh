# 🕋 SDW UMROH — Digital Umrah Travel & Workspace Platform
> **Philosophy:** *ONE JOURNEY, ONE PLATFORM*  
> **Architecture:** Multi-Platform Monorepo (Responsive Public Web, Pilgrim PWA, Operations Admin Portal, & Fail-Closed Google Cloud / Sheets 22-Master Backend).

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline_First-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Google Sheets](https://img.shields.io/badge/Google_Sheets-22_Master_Sheets-34A853?logo=google-sheets)](https://docs.google.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen)](#pengujian-otomatis)

---

## 📌 Daftar Isi
- [1. Gambaran Umum & Pilar Arsitektur](#1-gambaran-umum--pilar-arsitektur)
- [2. Struktur Direktori Proyek](#2-struktur-direktori-proyek)
- [3. Fitur Utama Sistem](#3-fitur-utama-sistem)
- [4. Modul Komponen Terpadu (Vanilla Modern)](#4-modul-komponen-terpadu-vanilla-modern)
- [5. Portal Operasional Admin (10 Domain Modular)](#5-portal-operasional-admin-10-domain-modular)
- [6. Integrasi Backend (Google Sheets & Apps Script)](#6-integrasi-backend-google-sheets--apps-script)
- [7. Panduan Memulai Cepat (Quick Start)](#7-panduan-memulai-cepat-quick-start)
- [8. Pengujian Otomatis (Test Suites)](#8-pengujian-otomatis-test-suites)
- [9. Standar Keamanan & RBAC](#9-standar-keamanan--rbac)

---

## 1. Gambaran Umum & Pilar Arsitektur

Platform **SDW UMROH** mengintegrasikan 3 pengalaman pengguna dalam satu basis kode tanpa overhead bundler yang berat:

1. **Website Publik Responsif:** 12 halaman landing page (Katalog Paket, Titik Hotel, Jadwal Kloter, Peta Ziarah, Kalkulator Estimasi, dll.) yang ditenagai komponen terpadu `js/components.js`.
2. **Aplikasi Jamaah (PWA):** Aplikasi offline-first dengan jadwal shalat presisi, kompas kiblat real-time, checklist koper bawaan, doa manasik audio/teks, dan pelacak berkas visa/paspor.
3. **Portal Operasional Admin & Backoffice:** Dashboard manajemen terpadu dengan 10 domain modular, RBAC (6 peran), enkripsi/masking NIK, kunci layar PIN darurat, dan mesin sinkronisasi offline-first.

---

## 2. Struktur Direktori Proyek

```text
SDW_UMROH/
├── assets/                  # Aset gambar terkompresi (WebP & PNG < 2.8 MB)
├── backend/                 # Google Apps Script API & Skema Database
│   ├── Code.gs              # Controller API v2.1.0 & Seed Engine
│   ├── Setup.gs             # 2-Phase Fail-Closed Schema Engine
│   └── appsscript.json      # Konfigurasi runtime Apps Script
├── css/                     # Sumber Tailwind CSS & styles.min.css
├── docs/                    # Dokumentasi arsitektur & panduan sistem
├── js/                      # JavaScript Client-Side
│   ├── admin/               # 10 Modul Domain Portal Admin
│   │   ├── admin-state.js         # State management & data store
│   │   ├── admin-nav.js           # Navigasi, modal & global search
│   │   ├── admin-crm.js           # Manajemen prospek (Leads)
│   │   ├── admin-docs.js          # Verifikasi berkas paspor & visa
│   │   ├── admin-registrations.js # Pendaftaran & masking NIK
│   │   ├── admin-finance.js       # Verifikasi pembayaran & refund
│   │   ├── admin-operations.js    # Manifest, bus boarding, manasik
│   │   ├── admin-security.js      # Audit log & lock screen PIN
│   │   ├── admin-sync.js          # Offline queue & live sync engine
│   │   └── admin-export.js        # Ekspor CSV & cetak manifest
│   ├── admin-core.js        # Facade orchestrator antarmuka admin
│   ├── components.js        # Shared components (Header, Footer, Dock)
│   ├── pwa.js               # Service worker controller & jam ibadah
│   ├── catalog.js           # Filter interaktif katalog paket
│   └── api.js               # Klien HTTP & sinkronisasi mutasi
├── scripts/                 # Utilitas optimasi aset & inspeksi
├── tests/                   # 6 Rangkaian Test Otomatis (Node.js)
├── admin.html               # Portal Operasional Admin
├── app.html                 # PWA Aplikasi Jamaah
├── index.html               # Halaman Beranda Utama
├── manifest.json            # PWA Web App Manifest
├── sw.js                    # Service Worker (Cache v31)
└── package.json             # Task runner & script manajemen
```

---

## 3. Fitur Utama Sistem

* **Dual Clock Ticker:** Jam live real-time WIB (Jakarta) dan AST (Makkah) tersinkronisasi.
* **Offline-First Mutasi Engine:** Setiap mutasi admin dicatat ke antrean offline `localStorage` dan otomatis disinkronkan (*flush batch*) ke Google Sheets saat koneksi internet pulih.
* **Append-Only Audit Trail:** Setiap pembacaan data sensitif (seperti unmask NIK), verifikasi berkas, atau mutasi finansial tercatat permanen di `DB_Audit_Logs`.
* **Zero Layout Shift:** Penggunaan WebP picture-fallback dan pre-fetching font & ikon memastikan Core Web Vitals optimal.

---

## 4. Modul Komponen Terpadu (Vanilla Modern)

Dikelola melalui `js/components.js` (v2.7.0). Halaman publik hanya memerlukan semantic mount points:

```html
<!-- Navigasi Utama Publik -->
<header id="app-header" data-active="paket"></header>

<!-- Konten Unik Halaman ... -->

<!-- Footer Resmi 4 Kolom -->
<footer id="app-footer"></footer>

<!-- Mobile Bottom Dock (5 Tombol) -->
<div id="app-bottom-bar" data-active="paket"></div>

<!-- Skrip Komponen -->
<script src="js/components.js?v=2.7.0"></script>
```

---

## 5. Portal Operasional Admin (10 Domain Modular)

Portal Admin (`admin.html`) mengadopsi pola **Facade Orchestrator**:

```javascript
// Mengakses fitur modular via namespace terpadu window.admin:
admin.setRole('FINANCE');                   // Ganti peran RBAC
admin.verifyPaymentAction('PAY-001', true); // Verifikasi bukti transfer
admin.batchBoarding(true);                  // Boarding bus serentak
admin.lockScreen();                         // Kunci layar darurat (PIN 1234)
```

---

## 6. Integrasi Backend (Google Sheets & Apps Script)

Backend menggunakan arsitektur **Fail-Closed 22-Sheet Master** di Google Sheets:

* **Endpoint API Live:** `https://script.google.com/macros/s/AKfycbyDWzKupH-vZ4FCmdknuloM7cSFPvJQXZgdHZExE6j6EUNZrx7A6ndkPrBvB5-ItKVs/exec`
* **Spreadsheet ID:** `1UTZ2uJ76rxAljWlfOLx3MpCzV2e4JLUG5IJ7o8SZn3Q`
* **Google Drive Folder ID:** `1Xz5QTa68fcipY9BN_vIXsdLklH6bws-J`

### 22 Sheet Master:
1. `DB_Users` 2. `DB_Customers` 3. `DB_Leads` 4. `DB_Sales_Activities` 5. `DB_Follow_Ups`  
6. `DB_Packages` 7. `DB_Package_Prices` 8. `DB_Departures` 9. `DB_Registrations`  
10. `DB_Document_Requirements` 11. `DB_Pilgrim_Documents` 12. `DB_Invoices`  
13. `DB_Payment_Schedules` 14. `DB_Payments` 15. `DB_Refunds` 16. `DB_Preparation`  
17. `DB_Manasik` 18. `DB_Trips` 19. `DB_Trip_Members` 20. `DB_Announcements`  
21. `DB_Notifications` 22. `DB_Audit_Logs`

---

## 7. Panduan Memulai Cepat (Quick Start)

### Prasyarat:
* Node.js v18+ (Rekomendasi v24.x)
* npm v9+

### Instalasi & Menjalankan Server Lokal:
```bash
# 1. Masuk ke direktori
cd SDW_UMROH

# 2. Instal dependensi
npm install

# 3. Jalankan server lokal
npm run dev
# Buka peramban di http://localhost:3000
```

### Membangun Aset Produksi:
```bash
# Kompilasi CSS & Optimasi gambar WebP otomatis
npm run build
```

---

## 8. Pengujian Otomatis (Test Suites)

Jalankan seluruh rangkaian uji end-to-end dengan satu perintah:

```bash
npm run test:all
```

Rincian cakupan uji otomatis:
* `npm test`: Logika operasional manasik dan logistik koper (Fase 5 & 6).
* `npm run test:fase4`: Mesin sinkronisasi offline & antrean batch mutasi.
* `npm run test:components`: Integritas komponen PWA & service worker disk audit.
* `npm run test:html-components`: Verifikasi 12 halaman publik & eliminasi duplikasi.
* `npm run test:admin-modules`: Verifikasi 10 modul domain backoffice.
* `npm run test:live`: Uji koneksi live HTTPS dua arah ke Google Apps Script & Sheets.

---

## 9. Standar Keamanan & RBAC

| Peran Pengguna | Hak Akses Utama |
| :--- | :--- |
| **SUPER_ADMIN / ADMIN** | Akses penuh, mutasi sistem, konfigurasi kloter, unmask data NIK. |
| **FINANCE** | Verifikasi pembayaran, penerbitan invoice, validasi refund. |
| **DOCUMENT_OFFICER** | Tinjau paspor, visa bio, buku kuning, sertifikat vaksin. |
| **OPERATIONS** | Logistik koper, absensi manasik, bus boarding, rooming hotel. |
| **TOUR_LEADER** | Daftar manifest kloter, status jamaah, panduan lapangan. |
| **MUTHAWWIF** | Jadwal manasik, agenda ziarah, panduan ibadah. |

---

*Hak Cipta &copy; 2026 PT Sahabat Dhuha Wisata (SDW UMROH). Berizin Resmi & Diawasi Kementerian Agama Republik Indonesia.*

