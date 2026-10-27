# SDW UMROH — BENCHMARK KOMPETITOR PUBLIC WEB (SAMIRA, JEJAK IMANI, JANNAH FIRDAUS)

**Tanggal Analisis:** 23 Oktober 2026
**Objek Analisis:** Halaman depan (landing page) dari tiga operator umroh Indonesia berkinerja digital kuat: `samiratravel.co.id`, `jejakimani.com`, `jannahfirdaus.com`.
**Metode:** Pengambilan konten halaman (fetch teks, bukan pengujian visual/interaktif) pada tanggal analisis; dekomposisi struktur section, elemen trust, pola konversi, dan presentasi data paket/keberangkatan.
**Relasi Dokumen:** Merupakan pendamping **`docs/21_PUBLIC_WEB_UI_AUDIT.md`** — setiap konsep yang diadopsi dipetakan ke kode temuan audit 21 (A/B/C) dan roadmap Grup 2/3 di dalamnya. Prinsip desain acuan: `08_UI_UX_DESIGN_SYSTEM.md` §12 (imagery), §37 (klaim berbasis bukti), §38 (trust design), §4 (brand TBD).

---

## 1. RINGKASAN EKSEKUTIF

Tiga kompetitor ini sepakat pada satu formula: **bukti legalitas tampil lebih dulu, jadwal keberangkatan transparan, dan konsultasi WhatsApp satu klik**. Hal-hal yang pada prototype SDW masih berstatus temuan audit (B3, B4, B9, B2) ternyata justru merupakan senjata utama pemimpin pasar:

1. **Nomor izin PPIU/PIHK bukan footnote** — Jejak Imani menuliskannya di teks hero; Jannah Firdaus mengangkatnya jadi kartu "Mengapa Memilih Kami" (Akreditasi A, ISO 9001:2015).
2. **Tabel jadwal keberangkatan publik** milik Jannah Firdaus (tanggal, maskapai, hotel Makkah/Madinah, harga per tipe kamar, status "Sisa 44 Seat" / "Full") adalah section paling informatif di antara ketiganya — persis arah yang direkomendasikan audit 21 pada B8/B9.
3. **WhatsApp adalah kanal konversi utama**, selalu dengan **pesan terisi otomatis** ("mohon informasi paket X") dan penanda CS "Online (Tersedia)" — bukan sekadar tombol kontak.
4. Semua operator **menjual mekanisme kepastian** ("booking pesawat & hotel sebelum paket diterbitkan"), bukan sekadar janji — selaras dengan aturan klaim `08` §37 yang kita pegang.

**Kesimpulan:** roadmap Grup 2/3 audit 21 tidak perlu diubah arahnya — benchmark ini justru mengonfirmasinya dan menambah dua konsep baru yang belum tercakup audit: **section cicilan syariah/tabungan umroh** dan **embarkasi per kota keberangkatan**.

---

## 2. PROFIL KOMPETITOR

| Kompetitor | Positioning | Pola kunci pembeda |
|---|---|---|
| **Samira Travel** (`samiratravel.co.id`) | "Sahabat Umrah Keluarga", operator besar nasional | Search widget (kategori/destinasi/durasi) di hero; kartu paket per kota keberangkatan (harga `/pax`, chip Penerbangan & Hotel); penghargaan terukur (Rekor Muri, Guinness World Records, APSI 2026); form "Kirim Testimoni" (testimoni dari pengguna); artikel fiqih umroh aktif (Miqat, Tawaf Wada, Badal Umroh) |
| **Jejak Imani** (`jejakimani.com`) | Travel haji/umroh + halal tour, kuat konten & kepercayaan | Nomor izin PIHK/PPIU **di teks hero** + kutipan hadits; strip logo akreditasi (Kemenag, AMPHURI, LSU); 6 kartu layanan termasuk **Tabungan Umroh** dan Badal Haji/Umroh; profil ustadz pembimbing; marquee 25+ logo mitra; locator 6 kantor cabang + Google Maps; artikel edukasi panjang (SEO) |
| **Jannah Firdaus** (`jannahfirdaus.com`) | Operator vertikal-integrasi (muassasah, provider visa, hotel sendiri), 23 tahun | Stat counter (23 thn, 60.000+ umroh, 98% kepuasan); **tabel jadwal keberangkatan lengkap dengan kursi tersisa**; filter canggih (jenis, 17 maskapai, 11 bandara, bulan); form booking → WhatsApp dengan pesan terisi; section **cicilan syariah "Bayar Kemudian"** (tenor 12–36 bln, DP 0%); embarkasi 5 hub regional; FAQ sangat operasional (perlengkapan, syarat dokumen, biaya batal) |

---

## 3. MATRIKS POLA LINTAS KOMPETITOR

| Pola | Samira | Jejak Imani | Jannah Firdaus | Diadopsi SDW? |
|---|:---:|:---:|:---:|---|
| Hero + 2 CTA + framing Arab/hadits | ✔ (karosel) | ✔ (video + hadits) | ✔ | ✔ (sudah — Grup 1/P0) |
| Nomor izin PPIU/PIHK tampil menonjol | ✔ (section) | ✔ **hero** | ✔ (kartu legalitas) | ✔ Adopsi Segera |
| Strip logo akreditasi/mitra/maskapai | — | ✔ | ✔ | ✔ Adopsi Segera (varian teks) |
| Stat counter terukur | ✔ (via penghargaan) | ✔ ("sejak 2012") | ✔ | ✔ Adopsi Berikutnya |
| Search/filter paket | ✔ (hero) | — | ✔ (canggih) | ✔ Adopsi Segera (ringan) |
| Tabel jadwal keberangkatan publik + sisa kursi | (brosur per kota) | — | ✔ **terlengkap** | ✔ Adopsi Segera |
| Kartu paket: harga mulai + durasi + maskapai + sisa kursi | ✔ | — | ✔ | ✔ Adopsi Segera |
| WhatsApp deep-link dengan pesan terisi + status CS | ✔ (hotline header) | ✔ (blok konsultasi) | ✔ **terlengkap** | ✔ Adopsi Segera |
| Section cicilan syariah / tabungan umroh | — | ✔ (Tabungan Umroh) | ✔ (Bayar Kemudian) | ✔ Adopsi Berikutnya |
| Embarkasi / kantor per kota | ✔ (paket per kota) | ✔ (6 cabang) | ✔ (5 hub) | ✔ Adopsi Berikutnya (sub-chip) |
| Artikel edukasi (fiqih umroh, tips) | ✔ | ✔ | ✔ | ✔ Adopsi Berikutnya |
| FAQ operasional rinci | — | ✔ (reschedule H-60) | ✔ **terlengkap** | ✔ Adopsi Berikutnya |
| Testimoni terverifikasi (nama + kloter + waktu) + form kirim | ✔ (form) | ✔ (video) | ✔ (foto + kloter) | ✔ Adopsi Berikutnya |
| Promo/voucher dengan periode jelas | — | — | ✔ | Pertimbangkan |
| Social-proof toast "baru mendaftar" | — | — | ✔ | ✘ Tidak diadopsi |
| Nomor rekening bank di homepage | ✔ | — | — | ✘ Tidak diadopsi |
| Wall SEO panjang di homepage | — | ✔ | ✔ | ✘ Pindah ke halaman Artikel |
| Rekrutmen agen/mitra di public web | — | — | ✔ | ✘ Milik surface PARTNER |

---

## 4. KONSEP YANG DIREKOMENDASIKAN UNTUK DIADOPSI

### 4.1 Adopsi Segera (menempel ke Grup 2 audit 21 — hitungan hari)

| # | Konsep (adaptasi untuk SDW) | Audit 21 | Sumber pola | Catatan implementasi |
|---|---|---|---|---|
| AS-1 | **Trust bar legalitas** — slot nomor izin PPIU/Kemenag + tautan "Cek izin di laman resmi Kemenag" di bawah hero dan footer | **B3** | Jejak Imani (di hero); JF (kartu legalitas); Samira (section) | Prototype: render **slot berlabel** (`PPIU No. [diisi saat rilis]`) — jangan mengarang nomor izin (patuh `08` §37). Nama badan hukum + alamat + S&K masuk footer |
| AS-2 | **WhatsApp float + deep-link pesan terisi** — tombol melayang global; pada tiap kartu paket, tautan WA dengan teks "Assalamualaikum, mohon informasi paket [nama paket]" | **B4, C2** | Jannah Firdaus (2 CS + prefilled + "Data aman, CS resmi"); Jejak Imani (blok "Masih ada pertanyaan?") | Nomor WA prototype pakai placeholder; jaga UX-003 (tetap 1 aksi primer) — WA float adalah kanal bantuan, bukan CTA konten |
| AS-3 | **Section "Jadwal Keberangkatan"** — tabel kloter dikelompokkan per bulan: tanggal, paket, maskapai, hotel (bila ada di data), durasi, harga mulai, badge `Sisa X kursi (simulasi)` / `Penuh` | **B9, B8** | Jannah Firdaus (tabel + "Lihat Seat" + status kursi) | Data dari MOCK_DATA kloter yang sudah ada; progress bar kursi eksisting dipertahankan (`08` §23); tabel menggantikan/melengkapi daftar keberangkatan datar |
| AS-4 | **Pengayaan kartu paket** — `Harga mulai dari Rp X`, chip durasi (`12 Hari`), chip maskapai, badge `Sisa X kursi`, ★ rating | **B2, B9** | Samira (harga `/pax` + chip Penerbangan/Hotel); JF ("Harga mulai", "Sisa Seat: 73", "+N Tanggal Lainnya") | Tambah field `durationDays`, `airlines`, `seatsLeft`, `nextDeparture` di MOCK_DATA → semua kartu data-driven. ★ rating sekaligus menutup bug #5 (field `rating` ada di data tapi belum dirender) |
| AS-5 | **Filter ringan katalog** — chip Kategori (eksisting) + Durasi + Bulan keberangkatan | **B2, B5** | Samira (search widget hero); JF (filter canggih) | Versi ringan cukup: grid kita hanya 5 paket; filter klien-side dari MOCK_DATA, dengan empty state yang sudah baik |
| AS-6 | **Sub-navigasi publik** — anchor: Paket, Jadwal, Estimasi, FAQ, Kontak + CTA konsultasi persisten | **B5, C1** | Ketiganya (nav konten terpisah dari switcher surface) | Pola `scroll-mt-28` sudah dipasang (Grup 1); tinggal menambahkan menu + state aktif |

### 4.2 Adopsi Berikutnya (menempel ke Grup 3 audit 21 — struktural)

| # | Konsep (adaptasi untuk SDW) | Audit 21 | Sumber pola | Catatan implementasi |
|---|---|---|---|---|
| AB-1 | **Section "Cicilan Syariah & Tabungan Umroh"** — skema DP/tenor/akad sebagai kartu informasi; terhubung ke estimasi biaya keluarga | Baru (memperkuat B1, selaras `16_FINANCIAL_MODEL.md`) | JF ("Bayar Kemudian": bebas riba, tenor 12–36 bln, DP 0%); Jejak Imani (layanan "Tabungan Umroh") | **Jangan menampilkan klaim OJK/mitra finansial** sebelum kerja sama nyata; frame sebagai "rencana pembayaran" (DP/Pelunasan — istilah yang sudah dipakai estimator) |
| AB-2 | **Teaser Artikel & Panduan** — 3 kartu (fiqih umroh, persiapan lansia, checklist dokumen) | **B6** | Ketiganya; Samira paling mirip (artikel miqat/badal/tawaf wada) | Prototype: 3 kartu statis berlabel; konten nyata jadi prasyarat rilis publik |
| AB-3 | **Perluasan FAQ operasional** — 8–10 butir berkelompok: perlengkapan yang diterima, syarat paspor/dokumen, kebijakan DP/pembatalan, prosedur luar kota | **B6** | JF (FAQ sangat operasional); Jejak Imani (reschedule H-60) | Jawaban kebijakan diberi label "kebijakan simulasi" selama prototype; `<details>` natif dipertahankan |
| AB-4 | **Embarkasi / kota keberangkatan** — chip "Berangkat dari: KNO/SUB/…" pada kartu keberangkatan + filter di estimator | **B8, B5** | JF (5 hub regional); Samira (paket per kota) | Cek kesesuaian model bisnis SDW (HQ + partner) sebelum mengangkat jadi section penuh; versi chip aman untuk sekarang |
| AB-5 | **Stat strip terukur** — tahun berdiri, jamaah terlayani, % kepuasan | **B3, A2** | JF (stat counter); Jejak Imani ("sejak 2012") | Angka harus berasal dari data bisnis nyata saat rilis; prototype menampilkan format dengan label SIMULASI |
| AB-6 | **Testimoni terverifikasi** — nama + kloter/group asal + waktu + badge "Terverifikasi"; antrean testimoni via form | **B2, B7** | Samira (form "Kirim Testimoni"); JF (kloter + waktu + foto) | Kultur pelabelan jujur dipertahankan: data tetap SIMULASI; **tanpa foto orang fiktif** (keputusan eksklusi P0) |

### 4.3 Dipertimbangkan (bersyarat)

| # | Konsep | Syarat | Sumber |
|---|---|---|---|
| AK-1 | Banner promo/voucher dengan periode jelas | Ada kampanye nyata; tampilkan periode + S&K persis seperti JF | JF (BSI Expo, kode voucher) |
| AK-2 | Strip media/liputan pers | Hanya bila ada liputan nyata (tvOne dsb.) — dilarang mengarang | JF (tvOne) |
| AK-3 | Profil ustadz pembimbing | Data asatidz nyata tersedia; foto orang fiktif tetap dilarang | Jejak Imani |
| AK-4 | Penjelasan mekanisme "kenapa jadwal kami pasti" (booking duluan) | Boleh sebagai **penjelasan mekanisme**, bukan janji "pasti berangkat" | Samira ("Pasti Jadwalnya") |

---

## 5. YANG TIDAK DIADOPSI (DAN ALASANNYA)

| Pola kompetitor | Alasan penolakan |
|---|---|
| **Social-proof toast live** ("Rizky baru mendaftar 2 menit lalu") | Manipulatif bila data tidak nyata — bertentangan dengan `08` §38 Trust Design dan kultur pelabelan jujur SDW |
| **Nomor rekening bank di homepage** (praktik Samira) | Pola rawan disalahgunakan untuk phishing; pembayaran SDW mengalir lewat alur in-app (`10_DATABASE_SPEC` Finance) yang lebih aman dan terjejak |
| **Klaim superlatif** ("harga terbaik se-Indonesia", "pasti berangkat") | Melanggar `08` §37 — klaim harus berbasis bukti yang bisa diverifikasi |
| **Wall SEO panjang di homepage** (Jejak Imani/JF) | Membunuh performa dan memecah fokus satu-halaman; konten edukasi panjang lebih tepat di halaman Artikel (`07` §6 item 8) |
| **Foto testimoni orang fiktif** | Konsisten dengan keputusan eksklusi P0 (tidak memalsukan wajah manusia); testimoni tetap teks + metadata kloter |
| **Rekrutmen agen di public web** | Bukan kebutuhan pengunjung publik; milik surface PARTNER |

---

## 6. URUTAN SECTION PUBLIC WEB HASIL ADOPSI

```
Header (sub-nav anchor + CTA konsultasi persisten)      ← AS-6
→ Hero foto + 2 CTA                                      (sudah selesai — P0)
→ Trust bar: izin PPIU • stat strip • mitra/maskapai     ← AS-1, AB-5
→ Katalog paket: filter + harga mulai + sisa kursi       ← AS-4, AS-5
→ Jadwal Keberangkatan (tabel kloter per bulan)          ← AS-3
→ WHERE destinasi (+ chip embarkasi)                     ← AB-4
→ Perjalanan & Estimasi Biaya Keluarga                   (eksisting — aset konversi terbaik)
→ Cicilan Syariah & Tabungan Umroh                       ← AB-1
→ Artikel teaser + FAQ diperluas                         ← AB-2, AB-3
→ Testimoni terverifikasi                                ← AB-6
→ Final CTA + Footer legal lengkap                       ← AS-1
+ WhatsApp float global (deep-link prefilled)            ← AS-2
```

---

## 7. ROADMAP TERPADU (AUDIT 21 × BENCHMARK)

Grup 1 (Quick Wins) **telah dieksekusi**; A1 (P0 imagery) **telah dieksekusi**. Grup 2/3 audit 21 kini diperkaya sumber pola kompetitor:

| Prioritas | Item | Audit 21 | Benchmark | Status |
|---|---|---|---|---|
| 1 | Trust bar + footer legal (izin, alamat, S&K, kontak) | B3 | AS-1 | Berikutnya |
| 2 | WhatsApp float + deep-link prefilled + bar CTA mobile sticky | B4, C2 | AS-2 | Berikutnya |
| 3 | Pengayaan kartu paket & keberangkatan (rating, harga mulai, durasi, maskapai, sisa kursi) | B2, B9 | AS-3, AS-4 | Berikutnya |
| 4 | Sub-navigasi publik anchor | B5 | AS-6 | Berikutnya |
| 5 | Filter ringan katalog | B2, B5 | AS-5 | Berikutnya |
| 6 | Tampilan detail paket (tab Ringkasan/Itinerary/Include-Exclude/Akomodasi/Pembayaran) | B1 | — (tak ada padanan publik yang baik di ketiganya; SDW bisa lebih baik) | Grup 3 |
| 7 | Estimator: pemilih keberangkatan + rincian itemized + chip embarkasi | B8 | AB-4 | Grup 3 |
| 8 | Artikel teaser + FAQ diperluas | B6 | AB-2, AB-3 | Grup 3 |
| 9 | Cicilan Syariah & Tabungan Umroh | — | AB-1 | Grup 3 |
| 10 | Stat strip + testimoni terverifikasi | B3, B2, B7 | AB-5, AB-6 | Grup 3 |
| 11 | Konsolidasi Prototype Toolbar + motif visual | A3, A6 | — (internal) | Grup 3 |

**Prasyarat tetap berlaku** (audit 21 §5 Catatan): palet pine/gold/sand dan tipografi berstatus usulan sampai aset brand resmi tersedia (`08` §4); semua nomor izin, angka statistik, dan kebijakan pada prototype wajib berlabel placeholder/SIMULASI sampai data resmi ada.

---

## 8. BATASAN ANALISIS

- Analisis berbasis **fetch teks halaman** pada 23 Oktober 2026 — bukan pengujian visual, performa, atau interaktif; tata letak persisnya (spacing, kualitas foto, kecepatan) tidak dinilai.
- Konten situs kompetitor dapat berubah sewaktu-waktu; kutipan struktur bersifat potret pada tanggal analisis.
- Ketiga kompetitor dipilih dari hasil pencarian "travel umroh terbaik/terpopuler Indonesia" sebagai perwakilan kelas atas; kompetitor lain (mis. Dream Tours) terdeteksi namun kontennya tak terambil lengkap sehingga tidak dianalisis.
- URL awal yang diminta pembanding (`mubarokah.my.id`) ternyata portal pondok pesantren tahfidz, bukan operator umroh — dikeluarkan dari cakupan berdasarkan konfirmasi pemilik tugas.
- Semua adaptasi di dokumen ini tunduk pada aturan klaim `08` §37/§38: pola kompetitor yang berbasis data tak terverifikasi **tidak** diadopsi apa adanya.
