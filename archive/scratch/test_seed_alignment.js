/**
 * Verifikasi Keselarasan Kolom Header dan Nilai Seed Data
 */

const SCHEMA_22_SHEETS = {
  DB_Users: ['id', 'name', 'email', 'role', 'status', 'phone', 'created_at', 'updated_at'],
  DB_Customers: ['id', 'nik', 'full_name', 'gender', 'birth_date', 'birth_place', 'phone', 'email', 'address', 'city', 'province', 'created_at', 'updated_at'],
  DB_Leads: ['id', 'customer_id', 'source', 'sales_owner_id', 'status', 'urgency', 'budget_range', 'notes', 'created_at', 'updated_at'],
  DB_Sales_Activities: ['id', 'lead_id', 'actor_id', 'activity_type', 'summary', 'outcome', 'timestamp'],
  DB_Follow_Ups: ['id', 'lead_id', 'sales_owner_id', 'scheduled_at', 'channel', 'notes', 'status', 'completed_at'],
  DB_Packages: ['id', 'name', 'slug', 'package_type', 'duration_days', 'status', 'description', 'published_at', 'created_at'],
  DB_Package_Prices: ['id', 'package_id', 'currency', 'quad_price', 'triple_price', 'double_price', 'effective_start', 'effective_end', 'status'],
  DB_Departures: ['id', 'package_id', 'departure_date', 'return_date', 'airline', 'origin_airport', 'capacity_total', 'capacity_booked', 'status', 'notes'],
  DB_Registrations: ['id', 'customer_id', 'departure_id', 'package_id', 'room_type', 'agreed_price_snapshot', 'discount_snapshot', 'final_price_snapshot', 'status', 'sales_id', 'notes', 'created_at', 'updated_at'],
  DB_Document_Requirements: ['id', 'code', 'title', 'description', 'is_mandatory', 'applies_to_gender', 'max_expiry_months'],
  DB_Pilgrim_Documents: ['id', 'registration_id', 'requirement_id', 'file_name', 'file_ref_mock', 'status', 'review_notes', 'verified_by', 'verified_at', 'updated_at'],
  DB_Invoices: ['id', 'registration_id', 'invoice_number', 'total_amount', 'paid_amount', 'outstanding_amount', 'due_date', 'status', 'created_at', 'updated_at'],
  DB_Payment_Schedules: ['id', 'invoice_id', 'term_number', 'title', 'amount', 'due_date', 'status'],
  DB_Payments: ['id', 'invoice_id', 'schedule_id', 'amount', 'payment_method', 'reference_number', 'proof_ref_mock', 'status', 'submitted_at', 'verified_by', 'verified_at', 'notes'],
  DB_Refunds: ['id', 'registration_id', 'invoice_id', 'amount_requested', 'cancellation_fee', 'amount_approved', 'status', 'reason', 'requested_at', 'processed_at'],
  DB_Preparation: ['id', 'registration_id', 'dimension', 'item_name', 'status', 'notes', 'updated_at'],
  DB_Manasik: ['id', 'departure_id', 'session_title', 'session_type', 'scheduled_at', 'location', 'muthawwif_id', 'status'],
  DB_Trips: ['id', 'departure_id', 'trip_code', 'lead_tour_leader_id', 'muthawwif_id', 'status', 'started_at', 'ended_at'],
  DB_Trip_Members: ['id', 'trip_id', 'registration_id', 'bus_number', 'makkah_room_number', 'madinah_room_number', 'special_assistance'],
  DB_Announcements: ['id', 'target_role', 'departure_id', 'title', 'body_content', 'priority', 'published_at', 'created_by'],
  DB_Notifications: ['id', 'user_id', 'title', 'message', 'category', 'is_read', 'action_link', 'created_at'],
  DB_Audit_Logs: ['id', 'timestamp', 'actor', 'action', 'entity', 'entity_id', 'before', 'after', 'reason']
};

const nowStr = '2026-11-05 02:25:00';

const seedData = {
  DB_Users: [
    ['USR-000001', 'Staf Operasional', 'ops@sdwumroh.com', 'OPERATIONS', 'ACTIVE', '+6281234567890', nowStr, nowStr],
    ['USR-000002', 'Finance Officer', 'finance@sdwumroh.com', 'FINANCE', 'ACTIVE', '+6281234567891', nowStr, nowStr],
    ['USR-000003', 'Document Officer', 'docs@sdwumroh.com', 'DOCUMENT_OFFICER', 'ACTIVE', '+6281234567892', nowStr, nowStr],
    ['USR-000004', 'Ust. Ahmad Fauzi Ridwan, Lc.', 'fauzi@sdwumroh.com', 'TOUR_LEADER', 'ACTIVE', '+6281234567893', nowStr, nowStr],
    ['USR-000005', 'Ust. DR. H. Salman, Lc.', 'salman@sdwumroh.com', 'MUTHAWWIF', 'ACTIVE', '+6281234567894', nowStr, nowStr],
    ['USR-000006', 'Admin Sistem', 'admin@sdwumroh.com', 'ADMIN', 'ACTIVE', '+6281234567895', nowStr, nowStr]
  ],
  DB_Customers: [
    ['CUS-000001', '3276011205800001', 'Ahmad Jamaah Teladan', 'L', '1980-05-12', 'Jakarta', '081298765432', 'ahmad.jamaah@gmail.com', 'Jl. Melati No. 12', 'Jakarta Selatan', 'DKI Jakarta', nowStr, nowStr],
    ['CUS-000002', '3276015508820002', 'Ibu Siti Fatimah', 'P', '1982-08-15', 'Bandung', '081387654321', 'siti.fatimah@gmail.com', 'Jl. Dago Asri No. 45', 'Bandung', 'Jawa Barat', nowStr, nowStr],
    ['CUS-000003', '3174021004750003', 'Bpk. Gunawan Wibisono', 'L', '1975-04-10', 'Surabaya', '081123456789', 'gunawan.wibisono@gmail.com', 'Jl. Rungkut Madya No. 8', 'Surabaya', 'Jawa Timur', nowStr, nowStr],
    ['CUS-000004', '3171036811850004', 'Hj. Nurul Hidayah', 'P', '1985-11-28', 'Yogyakarta', '081567891234', 'nurul.hidayah@gmail.com', 'Jl. Malioboro No. 20', 'Yogyakarta', 'DI Yogyakarta', nowStr, nowStr]
  ],
  DB_Packages: [
    ['PKG-000001', 'Umroh Reguler 9 Hari', 'umroh-reguler-9h', 'REGULAR', 9, 'PUBLISHED', 'Paket favorit ibadah khusyuk. Hotel Retaj Al Rayyan Makkah & Concorde Dar Al Khair Madinah.', nowStr, nowStr],
    ['PKG-000002', 'Umroh VIP Bintang 5', 'umroh-vip-bintang-5', 'VIP', 9, 'PUBLISHED', 'Akomodasi mewah premium bintang 5 pelataran masjid. Swissotel Makkah & Dar Al Taqwa Madinah.', nowStr, nowStr],
    ['PKG-000003', 'Umroh Plus Turki 12 Hari', 'umroh-plus-turki-12h', 'PLUS_TURKEY', 12, 'PUBLISHED', 'Ibadah umroh lengkap dengan napak tilas sejarah peradaban Islam di Istanbul & Bursa.', nowStr, nowStr]
  ],
  DB_Package_Prices: [
    ['PRC-000001', 'PKG-000001', 'IDR', 32500000, 34500000, 37500000, '2026-01-01', '2027-12-31', 'ACTIVE'],
    ['PRC-000002', 'PKG-000002', 'IDR', 42500000, 45500000, 49500000, '2026-01-01', '2027-12-31', 'ACTIVE'],
    ['PRC-000003', 'PKG-000003', 'IDR', 38500000, 41500000, 45500000, '2026-01-01', '2027-12-31', 'ACTIVE']
  ],
  DB_Departures: [
    ['DEP-000001', 'PKG-000001', '2027-01-15', '2027-01-23', 'Saudia Airlines (SV-819)', 'CGK', 45, 45, 'FULL', 'Kloter Utama Awal Musim'],
    ['DEP-000002', 'PKG-000002', '2027-02-28', '2027-03-08', 'Garuda Indonesia (GA-980)', 'CGK', 45, 38, 'OPEN', 'Kloter VIP Syaban'],
    ['DEP-000003', 'PKG-000003', '2027-04-18', '2027-04-29', 'Turkish Airlines (TK-57)', 'CGK', 40, 22, 'OPEN', 'Kloter Plus Turki Syawal']
  ],
  DB_Registrations: [
    ['REG-SDW-2701', 'CUS-000001', 'DEP-000001', 'PKG-000001', 'QUAD', 34500000, 1000000, 33500000, 'CONFIRMED', 'USR-000001', 'Booking terkonfirmasi DP lunas', nowStr, nowStr],
    ['REG-SDW-2702', 'CUS-000002', 'DEP-000001', 'PKG-000001', 'DOUBLE', 37500000, 0, 37500000, 'CONFIRMED', 'USR-000001', 'Kamar double bersama suami', nowStr, nowStr],
    ['REG-SDW-2703', 'CUS-000003', 'DEP-000001', 'PKG-000001', 'TRIPLE', 35500000, 500000, 35000000, 'CONFIRMED', 'USR-000001', 'Kamar triple', nowStr, nowStr]
  ],
  DB_Document_Requirements: [
    ['DCR-000001', 'PASSPORT', 'Paspor Asli RI (Min 48 Halaman)', 'Masa berlaku minimal 7 bulan', true, 'ALL', 7],
    ['DCR-000002', 'KTP', 'Scan KTP Elektronik', 'KTP elektronik asli masih berlaku', true, 'ALL', 0],
    ['DCR-000003', 'VACCINE', 'Buku Kuning / Sertifikat Vaksin', 'Sertifikat resmi Kemenkes', true, 'ALL', 24],
    ['DCR-000004', 'PASPHOTO', 'Pasfoto 4x6 Latar Putih', 'Fokus wajah 80%', true, 'ALL', 6]
  ],
  DB_Pilgrim_Documents: [
    ['DOC-000001', 'REG-SDW-2701', 'DCR-000001', 'paspor_ahmad.pdf', 'mock_drive_paspor_01.pdf', 'VERIFIED', 'Masa berlaku s/d 2032', 'Document Officer', nowStr, nowStr],
    ['DOC-000002', 'REG-SDW-2701', 'DCR-000003', 'vaksin_ahmad.pdf', 'mock_drive_vaksin_01.pdf', 'VERIFIED', 'Vaksin aktif', 'Document Officer', nowStr, nowStr],
    ['DOC-000003', 'REG-SDW-2702', 'DCR-000001', 'paspor_fatimah.pdf', 'mock_drive_paspor_02.pdf', 'UNDER_REVIEW', 'Menunggu verifikasi fisik', null, null, nowStr]
  ],
  DB_Invoices: [
    ['INV-000001', 'REG-SDW-2701', 'INV/2026/11/001', 33500000, 15000000, 18500000, '2026-12-15', 'PARTIAL', nowStr, nowStr],
    ['INV-000002', 'REG-SDW-2702', 'INV/2026/11/002', 37500000, 20000000, 17500000, '2026-12-15', 'PARTIAL', nowStr, nowStr],
    ['INV-000003', 'REG-SDW-2703', 'INV/2026/11/003', 35000000, 15000000, 20000000, '2026-12-15', 'PARTIAL', nowStr, nowStr]
  ],
  DB_Payment_Schedules: [
    ['SCH-000001', 'INV-000001', 1, 'Uang Muka (DP)', 15000000, '2026-11-01', 'PAID'],
    ['SCH-000002', 'INV-000001', 2, 'Pelunasan Akhir', 18500000, '2026-12-15', 'PENDING'],
    ['SCH-000003', 'INV-000002', 1, 'Uang Muka (DP)', 20000000, '2026-11-01', 'PAID']
  ],
  DB_Payments: [
    ['PAY-SDW-001', 'INV-000001', 'SCH-000001', 15000000, 'Transfer Bank Syariah (BSI)', 'BSI-TX98231', 'proof_ahmad_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah'],
    ['PAY-SDW-002', 'INV-000002', 'SCH-000003', 20000000, 'Transfer Bank Syariah (Muamalat)', 'MUA-77182', 'proof_fatimah_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah'],
    ['PAY-SDW-003', 'INV-000003', 'SCH-000001', 15000000, 'Transfer Bank Mandiri', 'MDR-65412', 'proof_gunawan_dp.jpg', 'VERIFIED', nowStr, 'Finance Officer', nowStr, 'DP Terverifikasi Sah']
  ],
  DB_Leads: [
    ['LED-000001', 'CUS-000001', 'WEBSITE_DIRECT', 'USR-000001', 'QUALIFIED', 'HIGH', 'Rp 35jt - Rp 45jt', 'Rencana berangkat 4 orang', nowStr, nowStr],
    ['LED-000002', 'CUS-000002', 'WHATSAPP_CAMPAIGN', 'USR-000001', 'CONSULTATION', 'HIGH', 'Rp 40jt - Rp 50jt', 'Hotel bintang 5 ramah lansia', nowStr, nowStr],
    ['LED-000003', 'CUS-000003', 'INSTAGRAM_ADS', 'USR-000001', 'PROPOSAL', 'MEDIUM', 'Rp 30jt - Rp 35jt', 'Cicilan termin BSI', nowStr, nowStr],
    ['LED-000004', 'CUS-000004', 'ALUMNI_REFERRAL', 'USR-000001', 'NEW', 'LOW', 'Rp 35jt', 'Rekomendasi alumni', nowStr, nowStr]
  ],
  DB_Trips: [
    ['TRP-2701', 'DEP-000001', 'SDW-JAN27-01', 'USR-000004', 'USR-000005', 'PRE_DEPARTURE', '2027-01-15 08:00:00', '2027-01-23 20:00:00'],
    ['TRP-2702', 'DEP-000002', 'SDW-FEB27-02', 'USR-000004', 'USR-000005', 'PRE_DEPARTURE', '2027-02-28 08:00:00', '2027-03-08 20:00:00']
  ],
  DB_Trip_Members: [
    ['MBR-000001', 'TRP-2701', 'REG-SDW-2701', 'BUS-01', 'RM-MAK-401', 'RM-MAD-201', 'None'],
    ['MBR-000002', 'TRP-2701', 'REG-SDW-2702', 'BUS-01', 'RM-MAK-301', 'RM-MAD-101', 'Kursi Roda / Lansia'],
    ['MBR-000003', 'TRP-2701', 'REG-SDW-2703', 'BUS-02', 'RM-MAK-201', 'RM-MAD-301', 'None']
  ],
  DB_Audit_Logs: [
    ['AUD-BOOTSTRAP', nowStr, 'SYSTEM', 'INIT_DATABASE', 'DATABASE', 'SDW_UMROH_DB', null, '22_SHEETS_CREATED', 'Inisialisasi otomatis arsitektur 22 sheet Google Spreadsheet SDW UMROH.']
  ]
};

let errors = 0;
Object.keys(seedData).forEach(sheetName => {
  const headers = SCHEMA_22_SHEETS[sheetName];
  if (!headers) {
    console.error('Sheet not in schema:', sheetName);
    errors++;
    return;
  }
  const rows = seedData[sheetName];
  rows.forEach((row, rIdx) => {
    if (row.length !== headers.length) {
      console.error(`Mismatch in ${sheetName} row ${rIdx}: Header has ${headers.length} cols, row has ${row.length} cols`);
      console.error('Headers:', headers);
      console.error('Row:', row);
      errors++;
    }
  });
});

if (errors === 0) {
  console.log('ALL SEED DATA ROWS EXACTLY MATCH SCHEMA HEADERS 100%!');
} else {
  console.error(`Found ${errors} column alignment errors`);
  process.exit(1);
}

