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

### `DB_Packages`

* **Columns:** `id`, `name`, `slug`, `package_type`, `duration_days`, `status`, `description`, `published_at`, `created_at`

* **Canonical State:** `DRAFT`, `IN_REVIEW`, `PUBLISHED`, `PAUSED`, `ARCHIVED`

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