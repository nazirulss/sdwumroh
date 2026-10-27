# SDW UMROH — LAPORAN AUDIT TAMPILAN PUBLIC WEB (UI/UX)

**Tanggal Audit:** 23 Oktober 2026
**Cakupan:** Surface 1 "PUBLIC WEBSITE" pada `sdw_umroh_prototype_foundation.html` (baris 1160–1864), komponen pendukungnya (`renderPackageCard`, `renderDepartureCard`, kalkulator estimasi, modal), app shell, serta footer global.
**Metode:** Pemeriksaan statis kode + verifikasi silang terhadap `docs/08_UI_UX_DESIGN_SYSTEM.md` dan `docs/07_INFORMATION_ARCHITECTURE.md`.
**Relasi Dokumen:** Melengkapi `docs/20_AUDIT_REPORT.md` §4 (audit UI/UX tingkat proyek). Metrik aksesibilitas terukur (kontras, ukuran font, tap target, ARIA) tidak diulang di sini — dirujuk saja, agar tidak duplikasi.

---

## 1. RINGKASAN EKSEKUTIF

Struktur naratif 5W+1H (What → Why → Who → Where → When → How) pada Public web **sudah benar dan selaras dengan spesifikasi IA** (`07` §6), dan palet pine/gold/sand memang tepat untuk domain umroh. Namun secara tampilan, halaman ini saat ini terasa seperti **wireframe yang rapi, bukan landing page yang jadi**:

- **Nol citra** di seluruh halaman — tidak ada foto hero, foto paket, maupun visual destinasi.
- **Tidak ada pengalaman detail paket** — "Lihat Detail" hanya membuka modal 5 baris, jauh dari struktur `/packages/[slug]` pada `07` §7.
- **Chrome prototype mendominasi** — badge "Step 1A.1 Hardened", role selector, pill DEMO, dan tombol simulasi PWA tampil di pengalaman publik.
- Beberapa cacat teknis kecil: scroll anchor tertutup header sticky, kelas `no-scrollbar` tidak terdefinisi, modal bisa terpotong di layar pendek.

**Skor tampilan Public web:**

| Aspek | Skor | Ringkasan |
|---|---|---|
| Menarik (attractiveness) | **3 / 10** | Palet tepat, tapi nol fotografi, ikon campur, CTA hero terlalu banyak |
| Informatif (informativeness) | **4 / 10** | Narasi bagus, tapi detail paket dangkal, rating tidak dirender, nol info legal |
| Responsif (responsiveness) | **6 / 10** | Grid sudah runtuh dengan baik, tapi ada cacat scroll/modal/layar kecil |

**Prioritas tertinggi:** fotografi otentik, halaman detail paket, blok trust/legal (PPIU, alamat, S&K), dan CTA mobile sticky.

---

## 2. YANG SUDAH BAIK (LAYAK DIPERTAHANKAN)

- **Alur cerita 5W+1H** — setiap section menjawab satu pertanyaan pengunjung; sesuai `07` §6.
- **Kalkulator Estimasi Biaya Keluarga** — aset konversi terbaik di halaman: transparan, interaktif, menampilkan DP/pelunasan.
- **Progress bar kapasitas kursi** — merepresentasikan data nyata (`booked/total`), patuh `08` §23.
- **Filter kategori dengan empty state** — pesan "Tidak ada paket dalam kategori ini" + aksi reset.
- **FAQ memakai `<details>` natif** — semantik dan ringan.
- **Modal dapat ditutup via Escape dan klik backdrop**; `lang="id"` dan landmark `header/main/footer` lengkap.
- **Pelabelan SIMULASI yang jujur** pada testimoni dan data demo.

---

## 3. TEMUAN & REKOMENDASI

### 3.1 MENARIK (ATTRACTIVENESS)

| # | Temuan | Bukti | Rekomendasi |
|---|---|---|---|
| A1 | **Nol citra di seluruh situs.** Tidak ada foto hero, foto paket, galeri, atau visual destinasi — penyumbang terbesar kesan "wireframe" | `querySelectorAll('img').length === 0`; hero hanya blob gradien blur (baris 1381) | Tambahkan foto hero (Ka'bah/jamaah, otentik sesuai `08` §12) dengan overlay gradien pine; beri slot gambar 16:9 pada setiap kartu paket + badge (Best Seller / Hampir Penuh); galeri 3–6 foto di section "Where". Placeholder boleh selama aset brand belum ada |
| A2 | **4 CTA bersaing di hero** — melanggar UX-003 "One Primary Action"; termasuk artefak dev "Simulasi Dashboard Jamaah →" | Baris 1428–1443 | Sisakan 1 CTA primer (Daftar/Konsultasi via WhatsApp) + 1 sekunder (Lihat Paket). Pindahkan tautan simulasi PWA ke toolbar prototype, keluar dari body halaman |
| A3 | **Chrome prototype mencemari pengalaman publik** — badge "Step 1A.1 Hardened", role selector, pill DEMO, tester state | Header, baris 73–147 | Satukan semua tooling demo ke dalam drawer "Prototype Toolbar" yang bisa disembunyikan, agar stakeholder melihat tampilan yang benar-benar dilihat pengunjung |
| A4 | **Gaya ikon campur** — 15 SVG outline bercampur emoji/Unicode (🔍 🧾 ✈ ★ 👤) | Baris 1568, 1435, 1648 | Pakai satu sistem (set SVG) di semua tempat; bungkus ikon dengan `aria-hidden` |
| A5 | **Tipografi Arab tidak konsisten** — Amiri dimuat tapi Bismillah di hero memakai `font-serif` generik; hanya sapaan PWA yang memakai `font-arabic` | Baris 1385 vs 1894 | Gunakan `font-arabic` untuk semua blok Arab + `lang="ar" dir="rtl"`; atau hapus payload Amiri bila tak dipakai |
| A6 | **Monotoni visual** — semua section berupa kartu putih `rounded-2xl` di atas sand; tanpa ritme, tanpa tekstur | Seluruh surface | Kenalkan 1 motif berulang (pola geometris Islami halus, opasitas 4–6% di header section), selang-seling latar section (putih / goldLight / pine), dan pembedaan kartu "Why" dengan ikon + kode warna |

### 3.2 INFORMATIF (INFORMATIVENESS)

| # | Temuan | Bukti | Rekomendasi |
|---|---|---|---|
| B1 | **Tidak ada pengalaman detail paket.** IA `07` §7 mensyaratkan itinerary, include/exclude, penerbangan/hotel, syarat pembayaran, FAQ per paket; "Lihat Detail" kini hanya modal 5 baris | `openPackageDetailModal` (baris 2613–2639) | Bangun tampilan detail paket (rute/section sesuai `/packages/[slug]`) dengan tab: Ringkasan → Itinerary harian → Include/Exclude → Akomodasi & Maskapai → Syarat Pembayaran. Ini investasi informatif bernilai tertinggi |
| B2 | **Rating paket ada di data tapi tidak pernah dirender**; kartu paket juga tidak menampilkan tanggal keberangkatan terdekat | Field `rating` di 5 paket (baris 238–298); `renderPackageCard` mengabaikannya | Render ★ rating di kartu; tambahkan tanggal keberangkatan terdekat + chip "Sisa X kursi" agar kartu ↔ jadwal terhubung |
| B3 | **Tidak ada jangkar trust/legal** — nomor izin PPIU/Kemenag, alamat kantor, dan S&K tidak ada di mana pun; footer masih footer prototype | Footer, baris 174–186 | Footer publik yang sesungguhnya: nomor izin, alamat, telepon/WhatsApp, tautan cepat, sosial media. Untuk pasar umroh ini prasyarat konversi (`08` §38) |
| B4 | **Tidak ada kanal bantuan manusia yang terlihat di halaman** — kontak hanya via modal; tidak ada tombol WhatsApp mengambang, tidak ada nomor telepon | Hanya `openConsultationModal` | Tombol WhatsApp mengambang sticky + nomor telepon di header/footer (UX-005) |
| B5 | **Tidak ada navigasi publik** — header adalah surface switcher, bukan menu situs; pengunjung tidak bisa lompat ke Paket/Jadwal/FAQ/Kontak | Header, baris 67–148 | Tambahkan sub-navigasi publik berbasis anchor + CTA "Konsultasi" yang persisten |
| B6 | **Section hilang dari hierarki homepage IA:** tidak ada teaser konten edukasi/Artikel (item 8 di `07` §6); FAQ hanya 4 butir tanpa CTA "masih ada pertanyaan?" | Surface berakhir di FAQ → CTA | Tambahkan baris teaser Artikel/Edukasi 3 kartu; perluas FAQ menjadi 8–10 butir yang dikelompokkan |
| B7 | **Klaim absolut tanpa dukungan** — "100% Bimbingan Sunnah Sahih", "Pasti Terbang", "0% Hidden Cost" (dilarang `08` §37/§38), sementara badge testimoni justru jujur berlabel SIMULASI | Trust bar, baris 1450–1471 | Tulis ulang berbasis bukti: "Bersanad Al-Azhar/UIM", "Blok kursi Garuda & Saudia", "Harga terkunci saat booking"; "Pembaruan Kuota Realtime" → "Kuota terkini" selama data masih statis |
| B8 | **Estimator tidak bisa dikaitkan ke keberangkatan**; tidak ada rincian biaya (visa/tiket/hotel/kit) | Estimator, baris 1198–1357 | Tambahkan pemilih tanggal keberangkatan + rincian "Apa saja yang termasuk?" yang bisa dibuka; tampilkan hitungan mundur keberangkatan |
| B9 | **Kartu keberangkatan tidak menampilkan harga/durasi** — pengunjung harus mencocokkan manual | `renderDepartureCard` (baris 634–673) | Tampilkan harga + durasi paket inline; kelompokkan per bulan; tambah hitungan "Berangkat dalam X hari" |

### 3.3 RESPONSIF (RESPONSIVENESS)

| # | Temuan | Bukti | Rekomendasi |
|---|---|---|---|
| C1 | **Scroll anchor menutupi judul section** — `scrollIntoView` tanpa `scroll-margin`, sementara header sticky setinggi 64px + strip 36px | `scrollToSection` (baris 2954–2957); tidak ada `scroll-mt-*` di seluruh file | Tambahkan `scroll-mt-28` pada `#katalogPaket`, `#journeyDanEstimator`, dan semua target anchor |
| C2 | **Tidak ada CTA mobile sticky** — aksi konversi utama keluar dari jangkauan jempol di halaman mobile yang panjang (`08` §34 "sticky primary action") | Seluruh surface | Bar bawah tetap pada <md: "Konsultasi WhatsApp" + "Lihat Paket"; beri padding bawah agar tidak menutupi konten |
| C3 | **Kelas `no-scrollbar` dipakai tapi tidak pernah didefinisikan** — scrollbar terlihat pada strip navigasi mobile | Baris 141 | Definisikan utilitasnya (`.no-scrollbar::-webkit-scrollbar{display:none}`) atau hapus pemakaiannya |
| C4 | **Modal bisa terpotong di layar pendek** — panel tanpa `max-h`/`overflow-y-auto`; form booking yang panjang tak terjangkau di ponsel landscape kecil | Baris 159 | `max-h-[90vh] overflow-y-auto` pada panel modal; tombol footer modal tetap sticky di dalamnya |
| C5 | **Pemilih tipe kamar sesak di ≤360px** — 3 kolom berisi "Triple (Sekamar 3)" terpotong | Baris 1261–1273 | `grid-cols-1 sm:grid-cols-3` atau chip horizontal scroll-snap di mobile |
| C6 | **Animasi mengabaikan `prefers-reduced-motion`**; pulse berjalan tanpa syarat | Style, baris 54–62 | Bungkus animasi dalam `@media (prefers-reduced-motion: no-preference)` |
| C7 | **Tap target < 44px** (31 dari 52 terukur) dan strip mobile `min-h-[36px]` | `20_AUDIT_REPORT` §4.2/§4.3 | Naikkan min-height elemen interaktif ke 44px, termasuk strip nav mobile |
| C8 | **Tailwind CDN** = warning console + risiko FOUC di jaringan lambat | Baris 14 | Untuk prototype masih bisa diterima; pre-build CSS sebelum deploy ke stakeholder |

---

## 4. BUG TEKNIS (DAFTAR CEPAT)

| # | Bug | Lokasi | Dampak | Perbaikan |
|---|---|---|---|---|
| 1 | Anchor scroll tertutup header sticky (tanpa `scroll-margin`) | Baris 2954–2957; semua target anchor | Judul section tersembunyi setelah klik CTA "Lihat Pilihan Paket" | `scroll-mt-28` pada semua section ber-id |
| 2 | Kelas `no-scrollbar` tidak terdefinisi | Baris 141 | Scrollbar memanjang di strip nav mobile | Definisikan utilitas atau hapus kelas |
| 3 | Panel modal tanpa batas tinggi | Baris 158–159 | Konten booking panjang tak terjangkau di layar pendek | `max-h-[90vh] overflow-y-auto` |
| 4 | Hero Arab memakai `font-serif`, bukan `font-arabic` (Amiri) | Baris 1385 | Font dimuat sia-sia + tampilan Arab tidak konsisten antar section | Ganti ke `font-arabic` + `lang="ar" dir="rtl"` |
| 5 | Field `rating` di MOCK_DATA tidak pernah dirender | Baris 238–298 vs `renderPackageCard` | Data social proof hilang dari kartu paket | Render ★ rating pada kartu |
| 6 | Animasi tanpa hormat `prefers-reduced-motion` | Baris 54–62 | Aksesibilitas motion-sensitive | Bungkus dengan media query |
| 7 | Klaim "Realtime" pada data statis | Baris 1697–1702 | Janji tidak terdukung (pelanggaran `08` §37) | Ubah label menjadi "Kuota terkini (simulasi)" |
| 8 | Tailwind CDN + FOUC pada jaringan lambat | Baris 14 | Warning console; kilat tanpa gaya | Pre-build CSS sebelum deploy eksternal |

---

## 5. ROADMAP PRIORITAS

### Grup 1 — Quick Wins (hitungan jam)

Perbaikan murah dengan dampak langsung; bisa dieksekusi sekarang tanpa keputusan desain baru:

1. **C1** — `scroll-mt-28` pada semua anchor target.
2. **C3** — definisikan `no-scrollbar` (atau hapus).
3. **C4** — `max-h-[90vh] overflow-y-auto` pada panel modal.
4. **A5** — `font-arabic` + `lang="ar" dir="rtl"` untuk semua blok Arab.
5. **A2** — kurangi hero menjadi 1 CTA primer + 1 sekunder; pindahkan tombol simulasi ke toolbar.
6. **B7** — tulis ulang klaim absolut menjadi klaim berbasis bukti.
7. **C6** — `prefers-reduced-motion`.

### Grup 2 — Konversi Berdampak Tinggi (hitungan hari)

1. **A1** — paket fotografi: hero, kartu paket, galeri "Where" (placeholder diperbolehkan).
2. **B3** — footer publik + blok trust: izin PPIU, alamat, telepon, S&K, sosial media.
3. **B4 + C2** — tombol WhatsApp mengambang + bar CTA mobile sticky.
4. **B5** — sub-navigasi publik berbasis anchor dengan CTA persisten.
5. **B2 + B9** — render rating, tanggal keberangkatan terdekat, harga/durasi pada kartu paket & keberangkatan.

### Grup 3 — Struktural (1–2 minggu)

1. **B1** — tampilan detail paket lengkap (tab: Ringkasan, Itinerary, Include/Exclude, Akomodasi, Pembayaran).
2. **B8** — estimator: pemilih tanggal keberangkatan + rincian biaya itemized.
3. **B6** — teaser Artikel/Edukasi + perluasan FAQ berkelompok.
4. **A3** — konsolidasi tooling demo ke "Prototype Toolbar" yang bisa disembunyikan.
5. **A6** — motif visual berulang + ritme latar section.

### Catatan Prasyarat

`08` §4 menyatakan warna/typografi brand final masih **TBD** sampai aset brand resmi tersedia. Palet pine/gold/sand berstatus **usulan yang belum diratifikasi** — konfirmasikan ke pemilik brand sebelum berinvestasi pada fotografi dan aset visual yang harus mengikuti identitas final.

---

## 6. BATASAN AUDIT

- Audit ini murni pada **tampilan** Public web (menarik, informatif, responsif). Masalah keamanan, RBAC, backend, dan model data tercakup di `20_AUDIT_REPORT.md` §5–§6 dan tidak diulang.
- Metrik aksesibilitas terukur (74 kegagalan kontras dari 352 node teks, 140 elemen <12px, 0 skip link, 0 ARIA tab, dll.) dirujuk dari `20_AUDIT_REPORT.md` §4.2 tanpa diukur ulang.
- Semua angka kapasitas, rating, dan testimoni pada prototype adalah **data simulasi** berlabel SIMULASI/DEMO — direkomendasikan untuk dipertahankan selagi jujur dilabeli.
