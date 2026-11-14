# SDW UMROH — PROTOTYPE DATABASE SCHEMA (Google Spreadsheet)

**Version:** 1.0.0 (Step 1 - Foundation)

**Philosophy:** One Journey, One Platform

**Standard:** Canonical Specification 00–19 (PRD, Domain Model, State Machines, Database Spec)

Dokumen ini mendefinisikan struktur 22 sheet Google Spreadsheet yang berfungsi sebagai *authoritative prototype data store*. Setiap sheet memiliki primary key berawalan kode domain unik, audit tracking terintegrasi, dan batasan state mesin sesuai master blueprint.

## 1. DAFTAR MASTER SHEET & ID CONVENTION

| **No** | **Sheet Name** | **Entity / Domain** | **Primary Key Format** | **Deskripsi** | 
| 1 | `DB_Users` | Identity & Access | `USR-000001` | Akun staf, sales, admin, mitra, dan muthawwif | 
| 2 | `DB_Customers` | Master Pelanggan | `CUS-000001` | Identitas legal dan kontak jamaah/wali | 
| 3 | `DB_Leads` | CRM Pipeline | `LED-000001` | Prospek jamaah dan status konversi | 
| 4 | `DB_Sales_Activities` | Aktivitas Sales | `ACT-000001` | Log interaksi sales (telepon, chat, tatap muka) | 
| 5 | `DB_Follow_Ups` | Penjadwalan Follow-up | `FLW-000001` | Pengingat dan jadwal tindak lanjut prospek | 
| 6 | `DB_Packages` | Katalog Paket Umroh | `PKG-000001` | Program paket umroh (Reguler, VIP, Ramadhan) | 
| 7 | `DB_Package_Prices` | Snapshot Harga Paket | `PRC-000001` | Tarif tipe kamar (Quad, Triple, Double) | 
| 8 | `DB_Departures` | Jadwal Keberangkatan | `DEP-000001` | Batch keberangkatan, tanggal & kuota | 
| 9 | `DB_Registrations` | Pendaftaran Jamaah | `REG-000001` | Transaksi booking jamaah & commercial snapshot | 
| 10 | `DB_Document_Requirements` | Master Persyaratan | `DCR-000001` | Jenis dokumen wajib (Paspor, KTP, Vaksin) | 
| 11 | `DB_Pilgrim_Documents` | Berkas Jamaah | `DOC-000001` | Referensi upload dan status verifikasi berkas | 
| 12 | `DB_Invoices` | Tagihan Finansial | `INV-000001` | Rekap tagihan pendaftaran | 
| 13 | `DB_Payment_Schedules` | Termin Pembayaran | `SCH-000001` | Jadwal termin DP dan pelunasan | 
| 14 | `DB_Payments` | Transaksi Pembayaran | `PAY-000001` | Bukti dan mutasi pembayaran diterima | 
| 15 | `DB_Refunds` | Rekonsiliasi Pengembalian | `REF-000001` | Pencatatan pengajuan refund/pembatalan | 
| 16 | `DB_Preparation` | Kesiapan Operasional | `PRP-000001` | Kesiapan perlengkapan & visa jamaah | 
| 17 | `DB_Manasik` | Agenda Bimbingan | `MAN-000001` | Jadwal & absensi manasik teori/praktek | 
| 18 | `DB_Trips` | Operasional Keberangkatan | `TRP-000001` | Kloter perjalanan di tanah suci & penugasan TL | 
| 19 | `DB_Trip_Members` | Manifest Kloter | `MBR-000001` | Manifest bus, kamar hotel, dan grup jamaah | 
| 20 | `DB_Announcements` | Siaran & Pengumuman | `ANN-000001` | Broadcast info untuk jamaah/staf | 
| 21 | `DB_Notifications` | Notifikasi Pengguna | `NTF-000001` | Notifikasi in-app / push alert | 
| 22 | `DB_Audit_Logs` | Jejak Audit Sistem | `AUD-000001` | Log jejak kepatuhan, mutasi, dan aktor | 
| 23 | `DB_Profile_Institution` | Profil Lembaga & Identitas | `PRF-INST-000001` | Metrik kredensial lembaga, visi, butir misi operasional, lini masa tonggak sejarah, dan dewan direksi | 
| 24 | `DB_Profile_Director` | Sambutan Pimpinan | `PRF-DIR-000001` | Identitas, foto resmi, headline, subheadline, kutipan emas, naskah sambutan lengkap, dan 4 pilar keunggulan | 
| 25 | `DB_Profile_Guides` | Dewan Pembimbing & Muthawwif | `GD-000001` | Pembimbing utama syariah, rasio pembimbing, katalog asatidz, muthawwif senior, dan tim medis kloter | 
| 26 | `DB_Profile_Legality` | Legalitas & MOU Kemitraan | `LEG-000001` | Izin operasional PPIU Kemenag, sertifikat akreditasi BAN-PPIU, SK Kemenkumham, MOU maskapai & bank syariah | 
| 27 | `DB_Profile_Mitra_Syiar` | Jaringan Mitra & Cabang | `MTR-000001` | Koordinator mitra syiar daerah, pondok pesantren, majelis ta'lim, dan perwakilan cabang resmi | 

## 2. DETAIL HEADER & ATRIBUT PER SHEET

### `DB_Users`

* **Columns:** `id`, `name`, `email`, `role`, `status`, `phone`, `created_at`, `updated_at`

* **Allowed Roles:** `VISITOR`, `PILGRIM`, `PARTNER`, `SALES`, `ADMIN`, `FINANCE`, `DOCUMENT_OFFICER`, `OPERATIONS`, `TOUR_LEADER`, `MUTHAWWIF`, `MANAGER`, `OWNER`

* **Status:** `ACTIVE`, `INACTIVE`, `SUSPENDED`

### `DB_Customers`

* **Columns:** `id`, `nik`, `full_name`, `gender`, `birth_date`, `birth_place`, `phone`, `email`, `address`, `city`, `province`, `created_at`, `updated_at`

### `DB_Leads`

* **Columns:** `id`, `customer_id`, `source`, `sales_owner_id`, `status`, `urgency`, `budget_range`, `notes`, `created_at`, `updated_at`

* **Canonical State:** `NEW`, `CONTACTED`, `QUALIFIED`, `CONSULTATION`, `PROPOSAL`, `FOLLOW_UP`, `REGISTRATION`, `CONVERTED`, `LOST`, `DORMANT`, `UNQUALIFIED`

### `DB_Sales_Activities`

* **Columns:** `id`, `lead_id`, `actor_id`, `activity_type`, `summary`, `outcome`, `timestamp`

* **Types:** `CALL`, `WHATSAPP`, `MEETING`, `SURVEY`, `PROPOSAL_SENT`

### `DB_Follow_Ups`

* **Columns:** `id`, `lead_id`, `sales_owner_id`, `scheduled_at`, `channel`, `notes`, `status`, `completed_at`

* **Status:** `PENDING`, `COMPLETED`, `RESCHEDULED`, `CANCELLED`

### `DB_Packages` (19 Kolom Lengkap)

* **Columns (Kolom A – S):**
  1. `id` (A) — Primary Key (contoh: `PKG-000001`)
  2. `name` (B) — Nama Program Paket (contoh: `Umroh Reguler Syawal Barakah`)
  3. `slug` (C) — Slug URL (contoh: `umroh-reguler-syawal`)
  4. `package_type` (D) — Kategori (`REGULER`, `VIP`, `RAMADHAN`, `PLUS_TOUR`, `HEMAT`)
  5. `duration_days` (E) — Durasi Hari (contoh: `9`, `12`, `13`)
  6. `status` (F) — Status (`PUBLISHED`, `DRAFT`, `ARCHIVED`)
  7. `description` (G) — Deskripsi & fasilitas program
  8. `hotel_makkah` (H) — Hotel Makkah & Jarak (contoh: `Retaj Al Rayyan / Setaraf (350m)`)
  9. `hotel_madinah` (I) — Hotel Madinah & Jarak (contoh: `Concorde Dar Al Khair (200m)`)
  10. `airline` (J) — Maskapai Penerbangan (contoh: `Saudia Airlines (Direct SV)`)
  11. `seats_left` (K) — Sisa Kursi / Seat (contoh: `15`)
  12. `badge` (L) — Badge visual (contoh: `Best Seller`, `Hampir Penuh`, `Favorit Keluarga`)
  13. `image_url` (M) — Path / URL banner (contoh: `assets/pkg-reguler-syawal.png`)
  14. `rating` (N) — Rating ulasan (contoh: `4.9/5 (182 ulasan)`)
  15. `starting_price` (O) — Harga acuan dasar Quad (contoh: `29500000`)
  16. `discount_label` (P) — Label potongan/promo (contoh: `Hemat Rp 3 Jt`)
  17. `published_at` (Q) — Timestamp publikasi
  18. `created_at` (R) — Timestamp pembuatan
  19. `updated_at` (S) — Timestamp pembaruan terakhir

* **Canonical State:** `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `PAUSED`, `ARCHIVED`

* **Cara Sinkronisasi Kolom ke Google Spreadsheet:**
  Buka Apps Script (`Extensions` -> `Apps Script`), pilih fungsi `setupPackagesCatalogSheet` di file `Setup.gs`, lalu klik **Run**. Fungsi ini secara aman akan menambahkan kolom H s/d S (`hotel_makkah`, `hotel_madinah`, `airline`, dst.) dan memigrasikan data paket yang ada tanpa menghapus data yang sudah tersimpan.

### `DB_Package_Prices`

* **Columns:** `id`, `package_id`, `currency`, `quad_price`, `triple_price`, `double_price`, `effective_start`, `effective_end`, `status`

* **Status:** `ACTIVE`, `SUPERSEDED`, `DRAFT`

### `DB_Departures`

* **Columns:** `id`, `package_id`, `departure_date`, `return_date`, `airline`, `origin_airport`, `capacity_total`, `capacity_booked`, `status`, `notes`

* **Canonical State:** `DRAFT`, `OPEN`, `FULL`, `CLOSED`, `DEPARTED`, `COMPLETED`, `CANCELLED`

### `DB_Registrations`

* **Columns:** `id`, `customer_id`, `departure_id`, `package_id`, `room_type`, `agreed_price_snapshot`, `discount_snapshot`, `final_price_snapshot`, `status`, `sales_id`, `notes`, `created_at`, `updated_at`

* **Canonical State:** `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `NEEDS_REVISION`, `APPROVED`, `CONFIRMED`, `CANCELLED`

* **Crucial Rule:** Harga kamar dan diskon harus dikunci secara permanen di snapshot (`agreed_price_snapshot`).

### `DB_Document_Requirements`

* **Columns:** `id`, `code`, `title`, `description`, `is_mandatory`, `applies_to_gender`, `max_expiry_months`

### `DB_Pilgrim_Documents`

* **Columns:** `id`, `registration_id`, `requirement_id`, `file_name`, `file_ref_mock`, `status`, `review_notes`, `verified_by`, `verified_at`, `updated_at`

* **Canonical State:** `NOT_UPLOADED`, `UPLOADED`, `UNDER_REVIEW`, `VERIFIED`, `REVISION_REQUIRED`, `EXPIRED`

### `DB_Invoices`

* **Columns:** `id`, `registration_id`, `invoice_number`, `total_amount`, `paid_amount`, `outstanding_amount`, `due_date`, `status`, `created_at`, `updated_at`

* **Status:** `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`

### `DB_Payment_Schedules`

* **Columns:** `id`, `invoice_id`, `term_number`, `title`, `amount`, `due_date`, `status`

* **Status:** `PENDING`, `BILLED`, `PAID`, `WAIVED`

### `DB_Payments`

* **Columns:** `id`, `invoice_id`, `schedule_id`, `amount`, `payment_method`, `reference_number`, `proof_ref_mock`, `status`, `submitted_at`, `verified_by`, `verified_at`, `notes`

* **Status:** `SUBMITTED`, `VERIFIED`, `REJECTED`

### `DB_Refunds`

* **Columns:** `id`, `registration_id`, `invoice_id`, `amount_requested`, `cancellation_fee`, `amount_approved`, `status`, `reason`, `requested_at`, `processed_at`

* **Status:** `REQUESTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `DISBURSED`

### `DB_Preparation`

* **Columns:** `id`, `registration_id`, `dimension`, `item_name`, `status`, `notes`, `updated_at`

* **Dimensions:** `EQUIPMENT`, `VISA`, `INSURANCE`, `AIRLINE_TICKET`, `HOTEL_VOUCHER`

* **Status:** `PENDING`, `IN_PROGRESS`, `READY`, `DELIVERED`, `ISSUE`

### `DB_Manasik`

* **Columns:** `id`, `departure_id`, `session_title`, `session_type`, `scheduled_at`, `location`, `muthawwif_id`, `status`

* **Status:** `SCHEDULED`, `COMPLETED`, `POSTPONED`, `CANCELLED`

### `DB_Trips`

* **Columns:** `id`, `departure_id`, `trip_code`, `lead_tour_leader_id`, `muthawwif_id`, `status`, `started_at`, `ended_at`

* **Status:** `PRE_DEPARTURE`, `IN_TRANSIT`, `MAKKAH_PHASE`, `MADINAH_PHASE`, `RETURNING`, `COMPLETED`

### `DB_Trip_Members`

* **Columns:** `id`, `trip_id`, `registration_id`, `bus_number`, `makkah_room_number`, `madinah_room_number`, `special_assistance`

### `DB_Announcements`

* **Columns:** `id`, `target_role`, `departure_id`, `title`, `body_content`, `priority`, `published_at`, `created_by`

### `DB_Notifications`

* **Columns:** `id`, `user_id`, `title`, `message`, `category`, `is_read`, `action_link`, `created_at`

### `DB_Audit_Logs`

* **Columns:** `id`, `timestamp`, `actor`, `action`, `entity`, `entity_id`, `before`, `after`, `reason`

* **Rule:** Log ini bersifat *append-only* (tidak boleh diedit/dihapus oleh operasi aplikasi).

### `DB_Profile_Institution`

* **Primary Key:** `PRF-INST-000001`
* **Columns (15 Kolom):**
  1. `id` — Primary Key (contoh: `PRF-INST-000001`)
  2. `ppiu_no` — Nomor Izin Resmi PPIU Kemenag (contoh: `U.123/2026`)
  3. `ppiu_year` — Tahun Lisensi PPIU (contoh: `2026`)
  4. `akreditasi_grade` — Peringkat Akreditasi (contoh: `Peringkat A (Unggul)`)
  5. `akreditasi_org` — Badan Penilai Akreditasi (contoh: `Lembaga Sertifikasi Umroh Mandiri`)
  6. `legal_name` — Nama Badan Hukum Perseroan (contoh: `PT Sahabat Dhuha Wisata`)
  7. `legal_sk` — Nomor SK Kemenkumham RI (contoh: `AHU-0012938.AH.01.01.TAHUN 2026`)
  8. `afiliasi_name` — Asosiasi & Afiliasi Resmi (contoh: `AMPHURI & IATA`)
  9. `afiliasi_detail` — Nomor ID Keanggotaan Asosiasi
  10. `visi` — Rumusan Teks Visi Resmi Lembaga
  11. `misi_json` — Array JSON Butir Misi Operasional Lembaga
  12. `timeline_json` — Array JSON Lini Masa Tonggak Sejarah (4 Fase)
  13. `direksi_json` — Array JSON Dewan Direksi & Manajemen Perseroan
  14. `updated_at` — Waktu Pembaruan Terakhir (ISO 8601)
  15. `updated_by` — Nama / Peran Aktor Pembaru

### `DB_Profile_Director`

* **Primary Key:** `PRF-DIR-000001`
* **Columns (12 Kolom):**
  1. `id` — Primary Key (contoh: `PRF-DIR-000001`)
  2. `name` — Nama Lengkap & Gelar Pimpinan (contoh: `H. Muhammad Syarif`)
  3. `role` — Jabatan Struktural Resmi (contoh: `Direktur Utama PT Sahabat Dhuha Wisata`)
  4. `license_badge` — Lencana Verifikasi Lisensi (contoh: `Badan Verifikasi Lisensi Resmi`)
  5. `photo_url` — URL / Path Foto Portrait Resmi Pimpinan
  6. `headline` — Judul / Headline Naskah Sambutan
  7. `subheadline` — Sub-headline Narasi Komitmen
  8. `quote` — Kutipan Emas (Gold Quote) Pimpinan
  9. `paragraphs_json` — Array JSON Paragraf Naskah Sambutan Lengkap
  10. `pillars_json` — Array JSON 4 Pilar Keunggulan Khidmat
  11. `show_on_home` — Boolean (TRUE / FALSE) Tampil di Halaman Beranda Utama
  12. `updated_at` — Waktu Pembaruan Terakhir

### `DB_Profile_Guides`

* **Primary Key:** `GD-000001`
* **Columns (12 Kolom):**
  1. `id` — Primary Key (contoh: `GD-000001`)
  2. `name` — Nama Lengkap & Gelar Keagamaan
  3. `role` — Peran / Penugasan Syariah
  4. `category` — Kategori Penugasan (`MAKKAH`, `MADINAH`, `MEDIS`, `MANASIK`)
  5. `alma_mater` — Almamater / Basis Keilmuan
  6. `experience` — Pengalaman Bertugas (contoh: `8 Tahun`)
  7. `status` — Status Keaktifan (`AKTIF`, `CUTI`, `INAKTIF`)
  8. `photo_url` — URL / Path Foto Profil Personil
  9. `order_index` — Urutan Tampil
  10. `lead_advisor_flag` — Boolean penanda Pembimbing Utama (Penasihat Syariah)
  11. `bio` — Biografi Khidmat Singkat
  12. `updated_at` — Waktu Pembaruan Terakhir

### `DB_Profile_Legality`

* **Primary Key:** `LEG-000001`
* **Columns (10 Kolom):**
  1. `id` — Primary Key (contoh: `LEG-000001`)
  2. `category` — Kategori (`LEGALITAS`, `MITRA_STRATEGIS`)
  3. `name` — Nama Dokumen / Kerjasama Mitra
  4. `issuer_partner` — Instansi Penerbit / Nama Mitra Korporat
  5. `doc_number` — Nomor Surat Keputusan / Nomor Kontrak MOU
  6. `validity_period` — Masa Berlaku Dokumen
  7. `status` — Status Dokumen (`AKTIF`, `DALAM_PEMBARUAN`, `BERAKHIR`)
  8. `file_url` — Tautan Berkas / Dokumen PDF atau Gambar
  9. `order_index` — Urutan Tampil
  10. `updated_at` — Waktu Pembaruan Terakhir

### `DB_Profile_Mitra_Syiar`

* **Primary Key:** `MTR-000001`
* **Columns (12 Kolom):**
  1. `id` — Primary Key (contoh: `MTR-000001`)
  2. `name` — Nama Koordinator / Tokoh Mitra Syiar
  3. `title_institution` — Nama Lembaga / Majelis / Cabang Daerah
  4. `role_label` — Label Jabatan (contoh: `Korda Surabaya`, `Cabang Makassar`)
  5. `region` — Wilayah Provinsi (`Jawa Timur`, `Jawa Barat`, `DKI Jakarta`, `Sulawesi Selatan`, `Jawa Tengah`, dll.)
  6. `city` — Kota / Kabupaten Operasional
  7. `sk_number` — Nomor Surat Keputusan Penugasan Resmi SDW
  8. `phone_wa` — Nomor Kontak WhatsApp Resmi
  9. `photo_url` — URL / Path Foto Mitra (Rasio 1:1 Persegi)
  10. `status` — Status Keaktifan (`AKTIF`, `INAKTIF`)
  11. `order_index` — Urutan Tampil pada Slider & Direktori
  12. `updated_at` — Waktu Pembaruan Terakhir

### `DB_Contact_Social`

* **Primary Key:** `CNT-000001`
* **Tujuan:** Mengelola konfigurasi terpusat alamat kantor pusat, nomor WhatsApp CS Khidmat, telepon/hotline, email resmi, serta 4 saluran media sosial (Instagram, Facebook, YouTube, TikTok) yang terhubung dinamis ke footer publik, floating WhatsApp widget, dan navigasi aplikasi.
* **Columns (22 Kolom Otoritatif):**
  1. `id` — Primary Key tunggal konfigurasi (contoh: `CNT-000001`)
  2. `company_name` — Nama Badan Hukum / Lembaga Perjalanan (contoh: `PT Sahabat Dhuha Wisata (SDW UMROH)`)
  3. `address_line` — Alamat Fisik Kantor (Jalan, Nomor, Kawasan/Gedung)
  4. `city_province_postal` — Kota, Kabupaten, Provinsi, dan Kode Pos
  5. `google_maps_url` — Tautan / URL Google Maps Navigasi Kantor
  6. `whatsapp_number` — Nomor WhatsApp Resmi berformat tampilan (contoh: `+62 812-3456-7890`)
  7. `whatsapp_clean` — Nomor WhatsApp numerik murni internasional tanpa simbol (contoh: `6281234567890`)
  8. `whatsapp_template` — Pesan pembuka otomatis saat jamaah menekan tombol WhatsApp
  9. `phone_office` — Nomor Telepon PSTN / Kantor Pusat (contoh: `(0291) 438-999`)
  10. `hotline_24h` — Nomor Telepon Darurat / Hotline Siaga 24 Jam
  11. `email_official` — Alamat Email Resmi Pelayanan & Korespondensi (contoh: `layanan@sdwumroh.co.id`)
  12. `operational_hours` — Hari & Jam Operasional Pelayanan Jamaah
  13. `instagram_url` — URL Tautan Profil Resmi Instagram
  14. `instagram_handle` — Username Akun Instagram (contoh: `@sdwumroh.official`)
  15. `facebook_url` — URL Tautan Halaman Resmi Facebook
  16. `facebook_name` — Nama Halaman / Fanpage Facebook
  17. `youtube_url` — URL Tautan Channel Resmi YouTube (Manasik & Edukasi)
  18. `youtube_name` — Nama Channel YouTube Resmi
  19. `tiktok_url` — URL Tautan Profil Resmi TikTok
  20. `tiktok_handle` — Username Akun TikTok (contoh: `@sdwumroh`)
  21. `updated_at` — Timestamp Pembaruan Terakhir (ISO-8601)
  22. `updated_by` — Identitas Administrator / Operator yang Melakukan Perubahan

