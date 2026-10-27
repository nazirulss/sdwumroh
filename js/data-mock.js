/**
 * ============================================================================
 * SDW UMROH — AUTHORITATIVE CLIENT MOCK DATA
 * File: js/data-mock.js
 * Version: 1.0.0
 * Philosophy: ONE JOURNEY, ONE PLATFORM
 * ============================================================================
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MOCK_DATA = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    return {
        // Katalog Program Paket Umroh
        packages: [
            {
                id: 'PKG-000001',
                name: 'Umroh Reguler Syawal Barakah',
                slug: 'umroh-reguler-syawal',
                image: 'assets/pkg-reguler-syawal.png',
                package_type: 'REGULER',
                duration_days: 9,
                status: 'PUBLISHED',
                description: 'Perjalanan ibadah penuh kekhusyukan dengan bimbingan asatidz berpengalaman, hotel bintang 4 dekat pelataran masjid.',
                starting_price: 29500000,
                original_price: 32500000,
                discount_label: 'Hemat Rp 3 Jt',
                currency: 'IDR',
                hotel_makkah: 'Retaj Al Rayyan / Setaraf (350m)',
                hotel_madinah: 'Concorde Dar Al Khair (200m)',
                airline: 'Saudia Airlines (Direct SV)',
                rating: '4.9/5 (182 ulasan)',
                seats_left: 7,
                badge: 'Best Seller'
            },
            {
                id: 'PKG-000002',
                name: 'Umroh VIP Khidmat Akhir Tahun',
                slug: 'umroh-vip-akhir-tahun',
                image: 'assets/pkg-vip-khidmat.png',
                package_type: 'VIP',
                duration_days: 12,
                status: 'PUBLISHED',
                description: 'Akomodasi bintang 5 di pelataran Ka\'bah (Clock Tower), kereta cepat Haramain High Speed Rail Makkah–Madinah.',
                starting_price: 43500000,
                original_price: 46000000,
                discount_label: 'Hemat Rp 2,5 Jt',
                currency: 'IDR',
                hotel_makkah: 'Swissotel Makkah Clock Tower (0m)',
                hotel_madinah: 'Dar Al Taqwa Madinah (50m)',
                airline: 'Garuda Indonesia (GA980)',
                rating: '5.0/5 (94 ulasan)',
                seats_left: 0,
                badge: 'Hampir Penuh'
            },
            {
                id: 'PKG-000003',
                name: 'Umroh Plus Turki Musim Semi',
                slug: 'umroh-plus-turki-spring',
                image: 'assets/pkg-plus-turki.png',
                package_type: 'PLUS_TOUR',
                duration_days: 13,
                status: 'PUBLISHED',
                description: 'Ziarah jejak peradaban Utsmaniyah di Istanbul, Selat Bosphorus, dilanjutkan manasik intensif dan ibadah di dua Tanah Suci.',
                starting_price: 38900000,
                original_price: 41900000,
                discount_label: 'Hemat Rp 3 Jt',
                currency: 'IDR',
                hotel_makkah: 'Anjum Hotel Makkah',
                hotel_madinah: 'Rove Al Madinah',
                airline: 'Turkish Airlines',
                rating: '4.8/5 (65 ulasan)',
                seats_left: 18,
                badge: 'Favorit Keluarga'
            },
            {
                id: 'PKG-000004',
                name: 'Umroh Awal Ramadhan 1448H',
                slug: 'umroh-ramadhan-awal',
                image: 'assets/pkg-ramadhan.png',
                package_type: 'RAMADHAN',
                duration_days: 10,
                status: 'PUBLISHED',
                description: 'Meraih keutamaan pahala haji bersama Rasulullah dengan tarawih di Masjidil Haram pada fase awal bulan suci.',
                starting_price: 36500000,
                original_price: 39500000,
                discount_label: 'Hemat Rp 3 Jt',
                currency: 'IDR',
                hotel_makkah: 'Pullman Zamzam Makkah',
                hotel_madinah: 'Grand Plaza Madinah',
                airline: 'Saudia Airlines',
                rating: '4.9/5 (120 ulasan)',
                seats_left: 4,
                badge: 'Spesial Ramadhan'
            },
            {
                id: 'PKG-000005',
                name: 'Umroh Syariah Bintang Tiga Hemat',
                slug: 'umroh-hemat-syariah',
                image: 'assets/pkg-hemat.png',
                package_type: 'HEMAT',
                duration_days: 9,
                status: 'PUBLISHED',
                description: 'Program umroh ekonomis mengutamakan kenyamanan esensial, bus full AC dan bimbingan ibadah terstruktur.',
                starting_price: 26800000,
                original_price: 28500000,
                discount_label: 'Hemat Rp 1,7 Jt',
                currency: 'IDR',
                hotel_makkah: 'Olayan Ajyad (600m Shuttle)',
                hotel_madinah: 'Durrat Al Eiman',
                airline: 'Lion Air Umrah Direct',
                rating: '4.7/5 (210 ulasan)',
                seats_left: 36,
                badge: 'Paling Hemat'
            }
        ],

        // Asatidz & Pembimbing Ibadah (5W+1H WHO)
        asatidz: [
            {
                id: 'AST-01',
                name: 'Ustadz DR. H. Muhammad Salman, Lc., M.A.',
                role: 'Pembimbing Fiqih & Rukun Ibadah',
                sanad: 'Al-Azhar Kairo • Sanad Fiqih Manasik',
                experience: '14 Tahun Pengalaman',
                desc: 'Membimbing rukun ihram, thawaf, sai, dan tahallul dengan ketelitian dalil shahih dan kesabaran tinggi.'
            },
            {
                id: 'AST-02',
                name: 'Ustadz Ahmad Fauzi Ridwan, Lc.',
                role: 'Muthawwif & Tour Leader Utama',
                sanad: 'Universitas Islam Madinah (UIM)',
                experience: '10 Tahun Menetap di Haramain',
                desc: 'Pemandu ziarah napak tilas sejarah Perang Uhud, Masjid Quba, Jabal Tsur, dan sirah Nabawiyah.'
            },
            {
                id: 'AST-03',
                name: 'Ustadzah Hj. Fatimah Azzahra, Lc.',
                role: 'Pembimbing Ibadah Jamaah Wanita',
                sanad: 'Ummul Qura Makkah • Fiqih Nisa',
                experience: '8 Tahun Pendampingan Khusus',
                desc: 'Membimbing adab ibadah muslimah di Raudhah Syarifah, fiqih thaharah wanita, dan asistensi lansia.'
            }
        ],

        // Jadwal Keberangkatan (Kloter)
        departures: [
            {
                id: 'DEP-000001',
                package_id: 'PKG-000001',
                departure_date: '15 Jan 2027',
                return_date: '23 Jan 2027',
                airline: 'Saudia SV819',
                origin_airport: 'CGK (Jakarta)',
                capacity_total: 45,
                capacity_booked: 38,
                status: 'OPEN'
            },
            {
                id: 'DEP-000002',
                package_id: 'PKG-000002',
                departure_date: '28 Feb 2027',
                return_date: '11 Mar 2027',
                airline: 'Garuda GA980',
                origin_airport: 'CGK (Jakarta)',
                capacity_total: 35,
                capacity_booked: 35,
                status: 'FULL'
            },
            {
                id: 'DEP-000003',
                package_id: 'PKG-000003',
                departure_date: '18 Apr 2027',
                return_date: '30 Apr 2027',
                airline: 'Turkish TK57',
                origin_airport: 'SUB (Surabaya)',
                capacity_total: 40,
                capacity_booked: 22,
                status: 'OPEN'
            },
            {
                id: 'DEP-000004',
                package_id: 'PKG-000004',
                departure_date: '02 Mar 2027',
                return_date: '12 Mar 2027',
                airline: 'Saudia SV825',
                origin_airport: 'CGK (Jakarta)',
                capacity_total: 45,
                capacity_booked: 41,
                status: 'OPEN'
            },
            {
                id: 'DEP-000005',
                package_id: 'PKG-000005',
                departure_date: '20 Mei 2027',
                return_date: '28 Mei 2027',
                airline: 'Lion Air JT112',
                origin_airport: 'KNO (Medan)',
                capacity_total: 50,
                capacity_booked: 14,
                status: 'OPEN'
            }
        ],

        // Testimoni Terverifikasi
        testimonials: [
            {
                name: "H. Hendro Siswanto & Keluarga",
                city: "Surabaya",
                kloter: "Kloter Reguler Syawal 1447H",
                rating: 5,
                comment: "Alhamdulillah bimbingan ibadahnya sangat runtut dan menenangkan. Hotel dekat sekali dengan pelataran Masjidil Haram sehingga orang tua kami tidak kelelahan."
            },
            {
                name: "Hj. Ratna Wulandari",
                city: "Bandung",
                kloter: "Kloter VIP Khidmat 1447H",
                rating: 5,
                comment: "Akomodasi Clock Tower luar biasa nyaman, muthawwif sigap mendampingi saat kami membutuhkan kursi roda di Raudhah. Kuitansi dan jadwal termin sangat transparan."
            },
            {
                name: "Dr. Agus Priyadi",
                city: "Jakarta Selatan",
                kloter: "Kloter Plus Turki 1447H",
                rating: 5,
                comment: "Perpaduan ziarah sejarah di Istanbul dan ibadah di Haramain teratur rapi tanpa ada waktu yang terbuang. Informasi manasik via web sangat memudahkan."
            }
        ],

        // Demo Jamaah Terdaftar
        currentPilgrim: {
            id: 'CUS-DEMO-001',
            full_name: 'Ahmad Jamaah Teladan',
            phone: '0812-3456-7890',
            email: 'ahmad.jamaah@example.com',
            registration_id: 'REG-SDW-2701',
            package_name: 'Umroh Reguler Syawal Barakah',
            duration_days: 9,
            departure_date: '15 Januari 2027',
            flight_info: 'Saudia Airlines SV-819 (Direct CGK–JED)',
            room_type: 'Double (Berdua)',
            current_stage: 'Persiapan',
            registration_status: 'CONFIRMED',
            agreed_price_snapshot: 34500000,
            discount_snapshot: 1000000,
            final_price_snapshot: 33500000
        },

        // Berkas Dokumen Jamaah
        pilgrimDocuments: [
            {
                id: 'DOC-000001',
                code: 'PASSPORT',
                title: 'Paspor RI (Masa Berlaku Min. 7 Bulan)',
                is_mandatory: true,
                status: 'VERIFIED',
                file_name: 'paspor_ahmad_scan.pdf',
                review_notes: 'Paspor sah dan masa berlaku memenuhi syarat.',
                updated_at: '2 hari lalu'
            },
            {
                id: 'DOC-000002',
                code: 'KTP',
                title: 'Kartu Tanda Penduduk (e-KTP)',
                is_mandatory: true,
                status: 'VERIFIED',
                file_name: 'ktp_ahmad_clear.pdf',
                review_notes: 'KTP telah tervalidasi.',
                updated_at: 'Kemarin'
            },
            {
                id: 'DOC-000003',
                code: 'PHOTO',
                title: 'Pasfoto 4x6 Latar Belakang Putih',
                is_mandatory: true,
                status: 'UNDER_REVIEW',
                file_name: 'pasfoto_ahmad_white.jpg',
                review_notes: 'Sedang diverifikasi oleh petugas visa.',
                updated_at: 'Hari ini'
            },
            {
                id: 'DOC-000004',
                code: 'VAKSIN_MENINGITIS',
                title: 'Buku Kuning / Sertifikat Vaksin Meningitis',
                is_mandatory: true,
                status: 'NOT_UPLOADED',
                file_name: null,
                review_notes: 'Wajib diunggah maksimal H-14 keberangkatan.',
                updated_at: '-'
            }
        ],

        // Tagihan & Jadwal Termin Jamaah
        invoice: {
            id: 'INV-SDW-2701',
            registration_id: 'REG-SDW-2701',
            invoice_number: 'INV/2026/SDW-2701',
            total_amount: 33500000,
            due_date: '25 Desember 2026',
            status: 'PARTIAL',
            schedules: [
                { term: 1, title: 'Uang Muka (DP Booking Seat)', amount: 15000000, due_date: '01 Nov 2026', status: 'PAID' },
                { term: 2, title: 'Pelunasan Biaya Paket', amount: 18500000, due_date: '25 Des 2026', status: 'PENDING' }
            ],
            payments: [
                { id: 'PAY-SDW-001', amount: 15000000, method: 'Transfer Bank Syariah Mandiri/BSI', ref: 'BSI-TX990142', date: '01 Nov 2026', status: 'VERIFIED' }
            ]
        },

        // Manasik Terdekat
        nextManasik: {
            id: 'MAN-000001',
            session_title: 'Manasik Akbar: Tata Cara Ihram, Thawaf, & Doa Mustajab',
            scheduled_at: 'Ahad, 20 Desember 2026 • 08:30 - 12:00 WIB',
            location: 'Hotel Bintang Wisata Mandiri / Asrama Haji',
            muthawwif: 'Ustadz DR. H. Muhammad Salman, Lc., M.A.',
            status: 'SCHEDULED'
        },

        // Demo Leads CRM
        leads: [
            { id: 'LED-001', name: 'Bpk. H. Rahmat Hidayat', phone: '0812-8888-0101', package: 'Umroh VIP Akhir Tahun', urgency: 'HIGH', budget: 'Rp 45jt', status: 'PROPOSAL', owner: 'Sales A' },
            { id: 'LED-002', name: 'Ibu Hj. Siti Nurhaliza', phone: '0813-7777-0102', package: 'Umroh Reguler Syawal', urgency: 'MEDIUM', budget: 'Rp 30jt', status: 'CONSULTATION', owner: 'Sales B' },
            { id: 'LED-003', name: 'Keluarga Bpk. Hendra (3 Pax)', phone: '0856-9999-0103', package: 'Umroh Plus Turki', urgency: 'HIGH', budget: 'Rp 120jt', status: 'QUALIFIED', owner: 'Sales A' },
            { id: 'LED-004', name: 'Bpk. Ridwan Kamil', phone: '0818-5555-0104', package: 'Umroh Awal Ramadhan', urgency: 'LOW', budget: 'Rp 35jt', status: 'NEW', owner: 'Belum Ditugaskan' }
        ],

        // Demo Registrations Backoffice
        registrations: [
            { id: 'REG-SDW-2701', customer: 'Ahmad Jamaah Teladan', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'CONFIRMED', docs: '3/4', payment: 'Rp 15jt / 33.5jt' },
            { id: 'REG-SDW-2702', customer: 'Ibu Fatimah Zahra', package: 'Umroh Reguler 9H', departure: '15 Jan 2027', status: 'UNDER_REVIEW', docs: '2/4', payment: 'Rp 10jt / 29.5jt' },
            { id: 'REG-SDW-2703', customer: 'Bpk. Gunawan Wibisono', package: 'Umroh VIP 12H', departure: '28 Feb 2027', status: 'APPROVED', docs: '4/4', payment: 'LUNAS (Rp 43.5jt)' }
        ]
    };
});
