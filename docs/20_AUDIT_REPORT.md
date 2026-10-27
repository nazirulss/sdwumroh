# SDW UMROH — Laporan Audit Proyek Menyeluruh

**Tanggal Audit:** 23 Oktober 2026
**Cakupan:** `docs/` (20 dokumen spesifikasi), `sdw_umroh_prototype_foundation.html`, `sdw_umroh_apps_script_backend.js`, `sdw_umroh_spreadsheet_schema.md`
**Metode:** Pembacaan penuh seluruh artefak + pengujian runtime terprogram di browser (bukan sekadar inspeksi statis)
**Status:** Temuan terverifikasi dengan bukti terukur

---

## 1. RINGKASAN EKSEKUTIF

Proyek ini memiliki **kesenjangan yang sangat lebar antara kualitas dokumentasi dan kualitas implementasi**.

Dokumentasinya luar biasa matang — 20 dokumen yang saling merujuk, sadar akan batasannya sendiri (menandai "TBD" secara eksplisit), dan mencakup domain, state machine, RBAC, keamanan, serta jejak audit. Ini aset bernilai tinggi dan jarang ditemui pada tahap awal proyek.

Implementasinya adalah **satu file HTML mockup visual** yang belum menjadi fondasi produk. Yang lebih serius: implementasi ini **menyimpang dari arsitektur yang sudah berstatus ACCEPTED/LOCKED di dokumentasinya sendiri**. Spesifikasi menetapkan Next.js + TypeScript + Supabase + PostgreSQL + RLS (ADR-002, ADR-003, ADR-004, ADR-023), dengan larangan eksplisit mengganti stack tanpa persetujuan (`13_AI_BUILD_INSTRUCTIONS.md` §60–61). Yang dibangun adalah Google Apps Script + Spreadsheet — stack yang **tidak pernah disebut satu kali pun sebagai opsi yang disetujui** di seluruh dokumen. Satu-satunya kemunculan kata "spreadsheet" justru sebagai contoh sumber data terfragmentasi yang harus ditinggalkan (`01_PRD.md` §2; `09_TECHNICAL_ARCHITECTURE.md` §8).

Ini bukan soal "salah teknologi". Google Spreadsheet bisa saja pilihan pragmatis yang sah untuk MVP. Masalahnya adalah **penyimpangan ini tidak tercatat sebagai keputusan**. Tidak ada ADR yang merevisi ADR-002/003/004. Artinya proyek ini sekarang memiliki dua arah arsitektur yang saling bertentangan, dan dokumen `00_PROJECT_CONTEXT.md` §13 menetapkan bahwa konflik seperti ini harus diselesaikan secara eksplisit — belum terjadi.

**Putusan keseluruhan: prototipe ini berhasil sebagai alat validasi visual dan alur, tetapi belum sah disebut fondasi produk.**

### Skor Kematangan per Area

| Area | Skor | Catatan |
|---|---|---|
| Dokumentasi & spesifikasi | **4.5 / 5** | Aset terbaik proyek. Komprehensif, terstruktur, sadar diri |
| Desain visual & arah estetika | **3.0 / 5** | Palet pine/gold/sand koheren dan pantas untuk domain umroh |
| Cakupan fungsional frontend | **1.5 / 5** | ±20–38% layar per surface; nol halaman detail; nol CRUD lengkap |
| Kualitas kode frontend | **1.5 / 5** | 3.141 baris satu file, tanpa build, modul, tipe, atau test |
| Aksesibilitas | **1.0 / 5** | 74 kegagalan kontras terukur; tab & modal tanpa ARIA |
| Responsivitas mobile | **2.0 / 5** | Tidak overflow, tetapi tabel 1.156px dalam wadah 504px |
| Backend | **1.0 / 5** | 9 fungsi, **nol fungsi domain**, nol validasi |
| Keamanan | **0.5 / 5** | Nol autentikasi, nol otorisasi, endpoint tulis anonim |
| Konsistensi model data | **2.0 / 5** | Tiga sumber enumerasi status yang saling bertentangan |
| Testing & QA | **0 / 5** | Tidak ada satu pun test |
| Version control & DevOps | **0 / 5** | **Bukan repository git.** Tidak ada riwayat, branch, atau CI |

**Skor agregat fondasi produk: ±1.5 / 5**

---

## 2. TEMUAN KRITIS (harus diputuskan sebelum melanjutkan)

### P0-1 — Proyek tidak berada di bawah version control

`git rev-parse` mengembalikan `fatal: not a git repository`. Tidak ada `.git`, tidak ada `.github`, tidak ada `package.json`, `tsconfig`, `.eslintrc`, atau konfigurasi test apa pun.

Seluruh pekerjaan — termasuk 20 dokumen spesifikasi yang merupakan aset paling berharga — **tidak memiliki riwayat, tidak bisa di-diff, tidak bisa di-rollback, dan tidak punya cadangan**. Satu kesalahan simpan file akan menghapus pekerjaan tanpa pemulihan. Spesifikasi sendiri mensyaratkan GitHub + CI/CD (`09_TECHNICAL_ARCHITECTURE.md` §4).

### P0-2 — Stack implementasi bertentangan dengan keputusan arsitektur LOCKED

Terperinci di Ringkasan Eksekutif. Keputusan yang dilanggar: ADR-002 (Next.js + TypeScript), ADR-003 (PostgreSQL via Supabase), ADR-004 (PostgreSQL sebagai source of truth), ADR-023 (No Second Source of Truth — LOCKED).

Perlu keputusan eksplisit: **(a)** kembali ke stack terspesifikasi, atau **(b)** tulis ADR baru yang merevisi keputusan tersebut beserta justifikasi dan trade-off-nya. Mengambang di antara keduanya adalah kondisi terburuk.

### P0-3 — Backend tidak punya autentikasi maupun otorisasi, dan endpoint mutasi terbuka anonim

Diverifikasi dengan grep: `SessionApp.getActiveUser()` **tidak pernah dipanggil**. Tidak ada satu pun pemeriksaan role atau permission di 356 baris backend.

`doPost` menerima `action: 'initDatabase'` dari pemanggil mana pun. `doGet?api=true&action=readWriteTest` menulis baris ke audit log tanpa autentikasi. Jika web app di-deploy dengan akses "Anyone", **setiap orang di internet dapat merestrukturisasi spreadsheet dan mencemari jejak audit**.

Ini melanggar prinsip paling dasar di `12_SECURITY_AND_AUDIT.md` §2 ("Never trust the client") dan §5–9 (otorisasi server-side wajib untuk setiap mutasi sensitif).

Ditambah: `doGet` menyetel `XFrameOptionsMode.ALLOWALL` (baris 109) — mengizinkan halaman di-frame situs mana pun, membuka celah clickjacking.

### P0-4 — Otorisasi berbasis role tidak diimplementasikan sama sekali; Visitor dapat menyetujui dokumen

**Terbukti lewat pengujian runtime.** Role selector di header menyediakan 8 role, tetapi `appState.role` hanya dipakai untuk (a) ditampilkan sebagai teks badge dan (b) memilih tab awal. Tidak pernah dipakai untuk menyaring apa pun.

Hasil uji: dengan role disetel ke `VISITOR`, surface Backoffice menampilkan **4 tab penuh** dan **10 tombol "Verifikasi Sah" / "Tolak (Revisi)"**. Klik "Verifikasi Sah" berhasil mengubah status dokumen dari `REVISION_REQUIRED` → `VERIFIED`, **tanpa dialog konfirmasi dan tanpa jejak audit**.

Nomor telepon prospek (`0812-0000-0101`) terlihat di DOM untuk **kedelapan role**, termasuk VISITOR dan PILGRIM.

Melanggar: `03_USER_ROLES_AND_PERMISSIONS.md` §24 ("Hidden UI is NOT authorization"), §3.1 (least privilege), §3.3 (ownership boundary); `06_BUSINESS_RULES.md` BR-DOC-002, BR-DOC-004, BR-DOC-005, BR-PAY-006.

### P0-5 — Aturan bisnis finansial dan kapasitas dilanggar secara diam-diam

Tiga pelanggaran terkonfirmasi lewat pengujian:

**(a) Overbooking departure yang sudah FULL.** `DEP-000002` berstatus `FULL` (35/35 kursi). Tombol "Booking Seat" **tetap dirender**. Memesan 5 pax pada departure itu **berhasil tanpa peringatan apa pun**, lalu `Math.min(capacity_total, capacity_booked + paxCount)` (baris 2832) **menyembunyikan kelebihan pemesanan** dengan memotong angka ke kapasitas maksimum. Pelanggaran `BR-DEP-001`: "The system should prevent registrations exceeding approved capacity unless an authorized override exists."

**(b) Registrasi langsung CONFIRMED.** `confirmBookingRegistration` menyetel `registration_status: 'CONFIRMED'` seketika, melompati `DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED`. Melanggar `BR-REG-003` ("A registration must not become confirmed merely because a registration form was submitted") dan `14_STATE_MACHINES.md` §5 yang secara eksplisit melarang transisi `DRAFT → CONFIRMED`.

**(c) Pembayaran lahir sebagai VERIFIED.** Invoice yang dibuat menyetel pembayaran DP langsung `status: 'VERIFIED'` tanpa proses review. Melanggar `BR-PAY-004` ("the payment should remain unverified until an authorized process confirms it") dan `12_SECURITY_AND_AUDIT.md` §17–18 (Maker → Reviewer → Approval → Execution; "Payment Submitted ≠ Payment Verified").

---

## 3. AUDIT FRONTEND — KEMATANGAN TEKNIS

### 3.1 Struktur & Arsitektur Kode

Seluruh aplikasi adalah **satu file HTML 3.141 baris (174 KB)** berisi lima blok `<script>` terpisah. Tidak ada build step, tidak ada modul ES, tidak ada TypeScript, tidak ada komponen, tidak ada state library.

Implikasi konkret:

- **Tailwind CSS via CDN** (`cdn.tailwindcss.com`). Konsol browser memunculkan peringatan resmi: *"cdn.tailwindcss.com should not be used in production"*. Ini JIT compiler yang berjalan di browser pengguna — ukuran besar, FOUC, dan tidak bisa di-purge.
- **50 handler `onclick` inline** tersebar di string HTML. Tidak kompatibel dengan Content-Security-Policy yang wajar, tidak bisa di-unit-test, dan mencampur logika ke markup.
- **41 dari 46 tombol tidak memiliki atribut `type`** — di dalam `<form>` akan default ke `submit`.
- **`MOCK_DATA` berperan ganda** sebagai fixture demo sekaligus store aplikasi, dan **dimutasi langsung oleh handler UI** (`handleVerifyDocument` menulis ke dalamnya). Tidak ada pemisahan data/aksi, tidak ada jejak audit sisi klien.
- **Re-render penuh via `innerHTML`** untuk setiap perubahan state. Terukur: 6,5 ms per render penuh surface Public — secara performa *cukup baik*, tetapi **kehilangan fokus terbukti**: setelah `updateCostEstimator`, `document.activeElement` berpindah dari `SELECT` ke `BODY`. Pengguna keyboard dan screen reader kehilangan posisinya setiap kali menekan +/− pada estimator.

### 3.2 Tidak Ada Routing, Tidak Ada Persistensi

Terukur: `window.location.hash` tetap kosong setelah navigasi; `localStorage` dan `sessionStorage` **kosong (0 key)**; tidak ada pemanggilan History API untuk navigasi.

Akibatnya:
- Tidak ada deep link. Setiap layar tidak punya URL yang bisa dibagikan atau di-bookmark.
- **Refresh menghapus seluruh state.** Booking yang sudah "berhasil" hilang total.
- Tombol back browser keluar dari aplikasi, bukan kembali satu layar.

Untuk aplikasi yang surface utamanya bernama **"Jamaah (PWA)"**, ini gap mendasar.

### 3.3 Nol Kapabilitas PWA

Permukaan kedua secara eksplisit dinamai PWA, dan `00_PROJECT_CONTEXT.md` §7.2 menetapkan "The PWA must be mobile-first" serta §34 mensyaratkan "installable experience".

Terukur: `link[rel="manifest"]` **tidak ada**, service worker **tidak terdaftar**, `meta[name="theme-color"]` **tidak ada**, `apple-touch-icon` **tidak ada**. Tidak ada perilaku offline. **Nol dari persyaratan PWA terpenuhi.**

### 3.4 Cakupan Fungsional terhadap Spesifikasi

Dibandingkan `07_INFORMATION_ARCHITECTURE.md` dan `01_PRD.md` §5–8:

| Surface | Layar/Modul Wajib | Terimplementasi | Cakupan |
|---|---|---|---|
| Public Website | 11 jenis halaman | 1 landing page panjang (hero, katalog, asatidz, destinasi, jadwal, stepper, estimator, testimoni, FAQ, CTA) | ±50% konten, **0% sebagai situs multi-halaman** |
| Jamaah PWA | 13 layar | 5 tab (Ringkasan, Dokumen, Pembayaran, Persiapan, Manasik) | ±38% |
| Partner Portal | 9 layar | 1 dashboard (4 KPI + 1 tabel) | ±20% |
| Backoffice | 17 modul | 4 tab (Leads, Registrasi, Dokumen, Kloter) | ±18% |

Yang **tidak ada sama sekali**: halaman About, artikel/blog, halaman kontak, halaman detail paket (hanya modal), halaman detail apa pun, alur registrasi multi-step (`08` §21), dashboard Backoffice dengan metrik, modul Finance (invoice/payment/refund/void), modul Operations/Trips, Itinerary, Manasik management, Communications, Alumni, Reports, Settings, Users & Roles, penampil Audit Log, manajemen Packages, Announcements, Notifications (skema `DB_Notifications` ada, UI-nya nol).

**Nol halaman detail.** Ini penting karena `08_UI_UX_DESIGN_SYSTEM.md` §27 menetapkan pola detail page (Header → Status → Primary Info → Primary Action → Tabs → Related → History) sebagai pola wajib. Setiap tombol "Kelola →", "Review →", dan "Detail" hanya memicu toast. Tidak ada satu pun entitas yang bisa dibuka.

**CRUD tidak lengkap.** Hanya Create (booking). Tidak ada Read-detail, Update, atau Delete di mana pun.

### 3.5 Bug Fungsional Terkonfirmasi

**(a) `escapeHtml` tidak meng-escape kutip tunggal → handler mati senyap.**

```js
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                   .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

Fungsi ini dipakai di dalam konteks string JavaScript berkutip tunggal pada atribut `onclick`. Uji runtime: nama item persiapan disetel ke `Koper Jamaah's Bag`, atribut yang dirender menjadi

```
showToast('Catatan persiapan diperbarui: Koper Jamaah's Bag')
```

— JavaScript rusak. Klik tombol **tidak melempar error ke pemanggil dan toast tidak pernah muncul**. Tombol mati tanpa tanda apa pun.

Saat ini data yang melewati jalur tersebut masih statis, jadi **ini belum bisa dieksploitasi sebagai XSS** (diuji: payload `x'); window.__xssFired=true; ('` melalui form booking **tidak** mengeksekusi kode, karena mendarat di konteks teks HTML yang sudah di-escape). Namun begitu field-field ini menjadi dapat diedit admin — yang memang direncanakan — pola ini langsung menjadi lubang injeksi. Klasifikasi: **cacat fungsional aktif + risiko keamanan laten.** Perbaikan: escape `'` menjadi `&#39;`, dan lebih baik hentikan penyusunan handler lewat string.

**(b) `renderStatusBadge` tidak mencakup mayoritas status kanonik.**

Diperiksa terhadap `14_STATE_MACHINES.md`: status Lead `CONTACTED`, `FOLLOW_UP`, `REGISTRATION`, `CONVERTED`, `LOST`, `DORMANT`, `UNQUALIFIED` tidak punya cabang → jatuh ke default abu-abu dengan **label mentah berbahasa Inggris**. Sama untuk sebagian status Registration, Trip, Refund, dan Notification.

Bug label spesifik: `case 'FULL': case 'CLOSED': label = 'PENUH'` — departure berstatus `CLOSED` akan ditampilkan sebagai "PENUH", yang secara semantik salah. Dan `renderPaymentSummary` memanggil `renderStatusBadge('UNPAID')` yang tidak punya cabang → menampilkan "UNPAID" mentah di tengah antarmuka berbahasa Indonesia.

**(c) Dokumen tidak terhubung ke registrasi.** `pilgrimDocuments` adalah daftar global tanpa `registration_id`, padahal skema `DB_Pilgrim_Documents` mensyaratkannya. Akibatnya antrean "Verifikasi Dokumen" di Backoffice selalu menampilkan dokumen jamaah yang sama, apa pun registrasi yang dipilih — dan Backoffice punya 4 registrasi demo.

**(d) Dua sumber kebenaran untuk kelengkapan dokumen.** Tabel registrasi menyimpan string `docs: '4/5'` yang ditulis manual, terpisah dari data dokumen sebenarnya. Setelah booking baru, baris yang dihasilkan menulis format berbeda: `'1/5 Berkas'`. Dua format dalam satu kolom, dan keduanya bisa menyimpang dari kenyataan.

**(e) Pagination dan sorting palsu.** Footer tabel merender "Halaman 1 dari 1" dengan tombol Prev/Next **hardcoded `disabled`**. Terukur: nol mekanisme sorting. `08` §26 mensyaratkan "sorting where useful, filtering, pagination".

Yang **sudah benar** dan perlu diapresiasi: filter pencarian tabel berfungsi nyata (diuji: query "Demo 01" → 1 dari 4 baris, penghitung ikut memperbarui), dan empty-state hasil pencarian ditangani dengan pesan yang menyebut kata kuncinya.

---

## 4. AUDIT UI/UX

### 4.1 Yang Sudah Baik

Perlu dicatat lebih dulu, karena ini fondasi yang layak dipertahankan:

- **Arah visual koheren dan tepat domain.** Palet pine green (`#0F3D2E`) + gold (`#C5A059`) + sand (`#F8F7F4`) terasa tenang, premium, dan islami tanpa berlebihan — persis seperti yang diminta `00_PROJECT_CONTEXT.md` §5 ("Islamic without becoming visually excessive", "Premium without becoming intimidating").
- **Next Action Engine berbasis data** (`getNextAction()`) adalah fitur UX terbaik di prototipe ini. Prioritasnya diturunkan dari kondisi nyata: dokumen perlu revisi → sisa tagihan → persiapan aktif → siap. Ini implementasi langsung `08` §35 dan prinsip "Journey First".
- **Perhitungan finansial diturunkan, bukan disimpan.** `calculateInvoiceFinance()` menghitung `paid = SUM(payments VERIFIED)` dan `outstanding = total − paid`. Ini **sesuai** ADR-015 dan `BR-PAY-003`, dan secara konsep lebih benar daripada skema backend-nya sendiri (lihat §6).
- **Progress bar kapasitas kursi merepresentasikan data nyata** (`booked/total`), mematuhi `08` §23 ("Never display an arbitrary percentage").
- **Pelabelan data simulasi jujur dan konsisten.** Badge "SIMULASI", "DATA SIMULASI", "TESTIMONI SIMULASI", "REKENING DEMO", plus peringatan "Jangan mengirim uang ke nomor rekening uji coba ini". Ini praktik yang sangat baik — memenuhi `08` §38 ("Do not create artificial trust badges").
- **Toast menggantikan `alert()`**, dengan pembatasan antrean maksimum 2 dan auto-dismiss.
- Modal punya `role="dialog"`, `aria-modal`, `aria-labelledby`, tutup via Escape, dan tutup via klik backdrop.
- Tidak ada overflow horizontal pada viewport 510px (terukur).

### 4.2 Aksesibilitas — Temuan Terukur

Diukur pada 352 node teks daun di surface Public:

| Metrik | Hasil | Standar | Status |
|---|---|---|---|
| Kegagalan kontras warna | **74 dari 352** node teks (21%) | WCAG AA 4.5:1 | **GAGAL** |
| Elemen berfont < 12px | **140** (67 @10px, 69 @11px, **4 @9px**) | `08` §39 "readable text" | **GAGAL** |
| Target sentuh < 44×44px | **31 dari 52** elemen interaktif | `08` §34 | **GAGAL** |
| Skip link | **0** | WCAG 2.4.1 | **GAGAL** |
| ARIA tab (`tablist`/`tab`/`tabpanel`/`aria-selected`) | **0 semuanya** | WAI-ARIA Tabs | **GAGAL** |
| `aria-live` untuk toast | **0** | WCAG 4.1.3 | **GAGAL** |
| SVG dengan `aria-hidden` | **0 dari 15** | WCAG 1.1.1 | **GAGAL** |
| Input dengan label terhubung (`for`/`id`) | **0 dari 2** | `08` §39 "form labels" | **GAGAL** |
| `<th scope>` / `<caption>` tabel | **0** | WCAG 1.3.1 | **GAGAL** |
| `lang="id"` pada `<html>` | Ada | — | LULUS |
| Landmark `header`/`nav`/`main`/`footer` | Masing-masing 1, tepat | — | LULUS |
| Urutan heading (1× H1, tidak lompat liar) | Wajar | — | LULUS |
| Fokus awal dipindah ke modal | **Tidak** (tetap di `BODY`) | WCAG 2.4.3 | **GAGAL** |
| Focus trap di modal | **Tidak ada** | Praktik wajib dialog | **GAGAL** |
| Fokus dikembalikan setelah modal tutup | **Tidak** | Praktik wajib dialog | **GAGAL** |
| Latar di-`aria-hidden` saat modal terbuka | **Tidak** | Praktik wajib dialog | **GAGAL** |
| `focus:outline-none` tanpa pengganti | 3 elemen, termasuk `<select>` role di header | WCAG 2.4.7 | **GAGAL** |

Contoh kontras terukur terburuk: opsi pada role selector 10px dengan rasio **1.47:1**; label "✓" 12px **2.35:1**; teks bantu slate-400 **4.44:1** (gagal tipis). Pola `text-[10px] text-slate-400` dipakai sangat luas di seluruh aplikasi.

**Dukungan Arab/RTL (`08` §40) tidak dipenuhi.** Dokumen `lang="id"` tanpa `dir`, dan blok teks Arab (بسم الله، لبيك اللهم عمرة) **tidak diberi `lang="ar"` maupun `dir="rtl"`** — screen reader akan membacanya dengan fonetik Indonesia. Font Amiri dimuat dari Google Fonts tetapi hanya dipakai di **satu** tempat (sapaan Jamaah); dua blok Arab lainnya memakai `font-serif` generik. Beban font terbuang + inkonsistensi.

**Ikonografi melanggar `08` §11** ("Do not mix unrelated icon styles"). Aplikasi mencampur **15 SVG outline** dengan **entitas emoji/Unicode** sebagai ikon: 📅 📍 👤 🔍 📄 📷 ⚠ ℹ ⓘ 📦 🔗 ⚒. Emoji dirender berbeda antar platform, tidak bisa diberi warna secara andal, dan karena tidak `aria-hidden` akan dibacakan screen reader sebagai nama emoji.

### 4.3 Responsivitas — Masalah Terpadat

`08` §17 menyatakan: *"Do not merely scale desktop layouts down to mobile."* §26 menyatakan: *"On mobile, dense tables should transform into cards/list views where appropriate."*

Terukur pada viewport 510px: tabel Pipeline Leads punya **9 kolom**, lebar tabel **1.156px** di dalam wadah **504px** — butuh scroll horizontal 2,3× lebar layar. **Tidak ada transformasi ke card view**, tidak ada alternatif mobile (`hasCardAlternative: false`). Strip navigasi mobile memakai `min-h-[36px]`, di bawah minimum 44px.

Surface Jamaah lebih baik (max-width 4xl, grid yang runtuh), tetapi tetap menampilkan bar tester developer "Uji Tampilan State: Normal / Empty / Error / Loading" **di dalam UI produk** — alat QA yang bocor ke pengalaman jamaah.

### 4.4 Kepatuhan Design System

`08_UI_UX_DESIGN_SYSTEM.md` §4 menyatakan tegas: *"Final SDW brand colors and typography are TBD... The design system must not invent a final corporate identity and present it as approved."*

Prototipe ini **menciptakan identitas brand lengkap** — palet bernama `sdw.pine/emerald/gold/sand`, font Plus Jakarta Sans + Amiri, shadow kustom — dan menyajikannya sebagai arah final. Ini bisa saja keputusan yang baik secara desain (paletnya memang cocok), tetapi **prosesnya melanggar aturan yang dokumen itu tetapkan sendiri**. Perlu ratifikasi eksplisit dari pemilik brand, atau penandaan jelas sebagai usulan.

Selanjutnya, §41 dan AI Design Rules §44.4–44.6 mewajibkan **token semantik** (`--color-text-secondary`, `--space-3`, `--radius-md`) dan melarang "arbitrary colors / typography / inconsistent spacing". Implementasi memakai **kelas utilitas Tailwind mentah** di seluruh tempat: `slate-400`, `amber-50`, `emerald-50`, `red-50`, `blue-50` bercampur dengan token `sdw-*`. Tidak ada satu pun CSS custom property. Tidak ada skala radius (campuran `rounded-lg`/`xl`/`2xl`/`3xl`/`full` tanpa aturan, melanggar §9). Tidak ada hierarki tipografi semantik — yang ada adalah nilai ad-hoc `text-[9px]`, `text-[10px]`, `text-[11px]` (melanggar §7).

Artinya: **mengganti brand color nanti berarti menyentuh ratusan baris di satu file**, bukan mengubah satu token.

Status komponen (§42) tidak lengkap: tombol punya hover dan kadang disabled, tetapi **tidak ada state loading pada tombol mana pun**, dan **input tidak punya state error sama sekali**.

§31 (Loading UX) mensyaratkan skeleton — yang ada hanya satu spinner. §33 (File Upload UX) mensyaratkan format diterima, batas ukuran, progress upload, preview, status verifikasi — yang ada adalah **kotak putus-putus statis tanpa `<input type="file">` nyata**, tanpa progress, tanpa preview.

§32 (Confirmation UX) mensyaratkan konfirmasi untuk aksi berdampak tinggi. **Tidak ada konfirmasi untuk "Verifikasi Sah", "Tolak (Revisi)", maupun "Konfirmasi Booking"** — semuanya langsung dieksekusi.

§30 (Error UX) mensyaratkan pesan yang menjawab "apa yang terjadi / apa yang bisa saya lakukan / apakah data saya tersimpan". `renderErrorState` hanya menyediakan judul + deskripsi statis + tombol "Coba Ulangi" yang memanggil `location.reload()` — **pada aplikasi tanpa persistensi, ini menghapus semua data pengguna.**

**Nol citra.** Terukur `document.querySelectorAll('img').length === 0`. §12 (Imagery) dan §38 (Trust Design) mengharapkan fotografi otentik. Landing page travel tanpa satu pun foto Ka'bah, hotel, atau jamaah terasa seperti wireframe — dan ini penyumbang terbesar kesan "belum jadi" pada surface Public.

§38 juga mengharapkan "legal/official information where applicable". Untuk platform travel umroh Indonesia, **nomor izin PPIU Kemenag, alamat kantor, dan syarat & ketentuan adalah elemen kepercayaan utama** — tidak ada satu pun. Footer hanya berisi tagline dan tautan diagnostik.

**Klaim berlebihan.** §37 melarang "exaggerated claims" dan "unsupported promises". Bar trust stats menampilkan **"100% Bimbingan Sunnah Sahih"**, **"Pasti Terbang"**, **"0% Hidden Cost"**, **"Tanpa Biaya Siluman"** — persis pola "artificial trust badges" yang §38 larang. Menariknya, testimoni justru dilabeli jujur sebagai simulasi. Inkonsisten.

### 4.5 Validasi Form — Nol dari Tiga

Diuji langsung pada modal Konsultasi:

- 2 input, **0 atribut `required`**, keduanya `type="text"` (nomor WhatsApp seharusnya `type="tel"` dengan pattern), **0 label terhubung**, tidak ada slot pesan error.
- **Submit dalam keadaan kosong diterima** dan menampilkan toast sukses: *"Permintaan konsultasi diterima (Simulasi Lead Baru Dibuat)"*.
- Modal Booking menerima NIK **terisi otomatis dengan angka mirip NIK asli** (`3271020000000001`) tanpa validasi panjang/format.

Melanggar `08` §20 seluruhnya: "validate input, show errors near the relevant field, preserve user input, provide clear submission feedback".

---

## 5. AUDIT BACKEND & DATA

### 5.1 Backend Bukan Backend, Melainkan Harness Konektivitas

Inventaris lengkap 9 fungsi di `sdw_umroh_apps_script_backend.js`:

| Fungsi | Jenis |
|---|---|
| `createResponse` | Utilitas envelope |
| `getDatabase` | Utilitas koneksi |
| `logAudit` | Utilitas audit |
| `doGet` / `doPost` | Entry point web app |
| `initDatabase` | Bootstrap 22 sheet |
| `testConnection` | Health check |
| `getDatabaseOverview` | Inspeksi skema |
| `performReadWriteTest` | Uji roundtrip |

**Nol fungsi domain.** Tidak ada `createLead`, `submitDocument`, `verifyDocument`, `recordPayment`, `verifyPayment`, `approveRegistration`, `cancelRegistration`, `refundPayment`, `publishPackage`, atau `createDeparture`.

Dibandingkan `11_API_CONTRACT.md` §13–22 yang menjanjikan ±60 endpoint di 10 grup API (Lead, Registration, Document, Payment, Invoice, Package, Departure, Pilgrim `/me/*`, Partner, Admin): **0% terimplementasi.**

Tidak ada validasi input (spesifikasi menetapkan Zod, `09` §4). Tidak ada `LockService` — diverifikasi dengan grep, nol kemunculan — sehingga **tidak ada kontrol konkurensi**; dua booking bersamaan pada kursi terakhir akan sama-sama lolos.

### 5.2 Cacat Implementasi Backend

- **Nama file tidak cocok.** `doGet` memanggil `HtmlService.createHtmlOutputFromFile('index')` (baris 107), tetapi file HTML bernama `sdw_umroh_prototype_foundation.html`. Deploy akan gagal kecuali file diubah namanya.
- **`initDatabase` menimpa header tanpa migrasi.** Setiap pemanggilan menjalankan `range.setValues([headers])` pada baris 1 semua sheet yang sudah ada. Jika urutan kolom pernah berubah, **data di bawahnya akan salah kolom secara senyap**. `10_DATABASE_SPEC.md` §55 mensyaratkan migrasi berversi; tidak ada mekanisme versi.
- **ID audit log tidak unik.** `logAudit` menghasilkan `'AUD-' + ('000000' + count).slice(-6)` dari jumlah baris. Menghapus baris apa pun akan **menghasilkan ID duplikat**.
- **Audit log bisa hilang senyap.** `logAudit` langsung `return` jika sheet belum ada, dan seluruh badannya dibungkus `try/catch` yang hanya menulis ke `Logger.log`. Kegagalan audit tidak pernah dilaporkan ke pemanggil.
- **Data uji mencemari jejak audit.** `performReadWriteTest` menulis ke `DB_Audit_Logs` yang sesungguhnya. `12_SECURITY` §26–30 mensyaratkan audit log imutabel dengan akses terbatas — mencampurnya dengan record diagnostik merusak nilai buktinya.
- **Waktu tidak timezone-safe.** `Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')` menyimpan string lokal. `10_DATABASE_SPEC.md` §48 mensyaratkan `timestamptz`.
- **Uang sebagai angka spreadsheet.** `10_DATABASE_SPEC.md` §47 mensyaratkan NUMERIC dan melarang floating-point.

### 5.3 Cakupan Skema

`sdw_umroh_spreadsheet_schema.md` mendefinisikan **22 sheet**. `10_DATABASE_SPEC.md` menetapkan **±45+ tabel**.

Domain yang **tidak tercakup sama sekali** dalam 22 sheet: `itineraries` / `itinerary_items`, `hotels`, `transport_resources` / `transport_assignments`, `tour_leaders`, `muthawwifs`, `preparation_templates`, `manasik_contents` / `manasik_participants` / `manasik_progress`, `notification_deliveries`, `partners`, `partner_referrals` / `partner_commissions`, `alumni_profiles`, `contents`, `testimonials`, `organizations`, `roles` / `permissions` / `user_roles` / `role_permissions`.

Yang terakhir ini penting: **tanpa tabel role/permission, model RBAC + Scope (`03` §22) secara struktural tidak mungkin ditegakkan** — `DB_Users.role` hanya sebuah kolom string.

### 5.4 `DB_Invoices` Menyimpan Field yang Dilarang Spesifikasi

Skema spreadsheet (baris 107) dan `SCHEMA_DEFINITIONS` backend sama-sama mendefinisikan kolom `paid_amount` **dan** `outstanding_amount` pada `DB_Invoices`.

Ini bertentangan langsung dengan `10_DATABASE_SPEC.md` §50 dan ADR-015: outstanding harus **derived** (`Outstanding = Invoice Obligation − Verified Payments + Adjustments`), dan "dilarang field `outstanding_amount` yang bisa diedit bebas". `BR-PAY-003` mengulangi: "It must not be manually overwritten as the source of truth."

Ironisnya, **frontend sudah melakukannya dengan benar** — `calculateInvoiceFinance()` menurunkan kedua nilai dari daftar pembayaran. Skema backend-lah yang melanggar ADR LOCKED. Ini akan menciptakan dua sumber kebenaran finansial begitu keduanya dihubungkan.

---

## 6. MASALAH PILAR: TIGA SUMBER KEBENARAN YANG SALING BERTENTANGAN

`00_PROJECT_CONTEXT.md` §13 menetapkan hierarki source-of-truth: dokumen tingkat lebih tinggi menang saat konflik. Saat ini ada **tiga artefak yang mendefinisikan enumerasi status berbeda untuk entitas yang sama**, dan tidak ada yang ditandai sebagai yang menang.

| Entitas | `14_STATE_MACHINES.md` (REVIEW) | `spreadsheet_schema.md` | Dipakai HTML |
|---|---|---|---|
| **Invoice** | DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, VOID, CANCELLED | UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED | `PARTIAL` |
| **Preparation** | NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED, NOT_APPLICABLE | PENDING, IN_PROGRESS, READY, DELIVERED, ISSUE | `NOT_STARTED` / `IN_PROGRESS` / `COMPLETED` |
| **Trip** | PLANNING, READY, ACTIVE, COMPLETED, CANCELLED | PRE_DEPARTURE, IN_TRANSIT, MAKKAH_PHASE, MADINAH_PHASE, RETURNING, COMPLETED | tidak dipakai |
| **Manasik** | DRAFT, SCHEDULED, OPEN, IN_PROGRESS, COMPLETED, CANCELLED | SCHEDULED, COMPLETED, POSTPONED, CANCELLED | `SCHEDULED` |
| **Refund** | REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED, CANCELLED | REQUESTED, UNDER_REVIEW, APPROVED, REJECTED, **DISBURSED** | tidak dipakai |
| **Payment** | PENDING, SUBMITTED, VERIFIED, FAILED, REJECTED, CANCELLED | SUBMITTED, VERIFIED, REJECTED | `VERIFIED` |
| **Role** | 12 kanonik (`12_SECURITY` §6): OWNER, MANAGER, SALES, CUSTOMER_SERVICE, FINANCE, DOCUMENT_OFFICER, OPERATIONS, TOUR_LEADER, MUTHAWWIF, PARTNER, PILGRIM, ALUMNI | 12 berbeda: menambah **VISITOR** & **ADMIN**, menghapus CUSTOMER_SERVICE & ALUMNI | **8** saja: VISITOR, PILGRIM, PARTNER, SALES, DOCUMENT_OFFICER, FINANCE, OPERATIONS, ADMIN |

Perhatikan baris Preparation: **HTML mengikuti `14_STATE_MACHINES`, sementara spreadsheet schema mendefinisikan himpunan yang sama sekali berbeda.** Jadi frontend dan backend yang seharusnya berpasangan sudah tidak cocok sebelum dihubungkan.

Perhatikan baris Role: **`VISITOR` dan `ADMIN` bukan role kanonik.** `ADMIN` khususnya berbahaya — sebuah role "Administrator" tunggal bertentangan dengan prinsip least privilege dan pemisahan tugas (`12_SECURITY` §17) yang justru memecah wewenang ke FINANCE, DOCUMENT_OFFICER, OPERATIONS, dst. Sementara `TOUR_LEADER` dan `MUTHAWWIF` — dua aktor operasional lapangan yang disebut di seluruh dokumen — tidak punya representasi di UI sama sekali.

Ini persis kondisi yang `14_STATE_MACHINES.md` §27 peringatkan: *"State is business truth"* — status harus diturunkan dari domain, bukan diciptakan sendiri oleh tiap lapisan.

---

## 7. ROADMAP REKOMENDASI

### Tahap 0 — Hentikan Pendarahan (1–2 hari, wajib sebelum apa pun)

1. **`git init`**, commit seluruh pekerjaan saat ini sebagai baseline, lalu push ke remote privat. Ini mitigasi risiko termurah dan terbesar di seluruh daftar.
2. **Putuskan arsitektur secara resmi.** Tulis ADR baru yang salah satu dari: (a) meratifikasi Apps Script + Spreadsheet sebagai stack MVP dengan justifikasi, trade-off, dan rencana migrasi; atau (b) menegaskan kembali Next.js + Supabase dan menjadwalkan rebuild. Tandai ADR-002/003/004/023 sebagai SUPERSEDED bila memilih (a).
3. **Kunci endpoint backend.** Tambahkan autentikasi (`SessionApp.getActiveUser()` + whitelist email), hapus `initDatabase` dan `performReadWriteTest` dari `doPost`/`doGet` publik, dan ganti `XFrameOptionsMode.ALLOWALL` dengan `DEFAULT`.
4. **Perbaiki `escapeHtml`** agar meng-escape `'` → `&#39;`. Satu baris, menghilangkan bug handler mati senyap.
5. **Perbaiki nama file** agar `createHtmlOutputFromFile('index')` cocok, atau ubah pemanggilnya.

### Tahap 1 — Rapikan Kebenaran (3–5 hari)

6. **Rekonsiliasi enumerasi status.** Pilih satu sumber kanonik (`14_STATE_MACHINES.md` adalah kandidat terkuat), lalu perbarui `spreadsheet_schema.md`, `SCHEMA_DEFINITIONS` di backend, `renderStatusBadge`, dan daftar role agar identik. Tambahkan `CUSTOMER_SERVICE`, `TOUR_LEADER`, `MUTHAWWIF`, `ALUMNI`; hapus atau petakan `VISITOR`/`ADMIN` dengan sengaja.
7. **Hapus `outstanding_amount`** dari `DB_Invoices` dan jadikan derived, sesuai ADR-015. Frontend sudah benar — samakan backend.
8. **Ekstrak token desain.** Pindahkan palet, skala spacing, radius, dan tipografi ke CSS custom properties semantik (`--color-text-secondary`, dst.) sesuai `08` §41. Sekaligus ratifikasi atau tandai palet saat ini sebagai usulan, sesuai §4.
9. **Tambahkan guard kapasitas.** Tolak booking yang melebihi `capacity_total` dengan pesan jelas (`BR-DEP-001`), alih-alih memotong dengan `Math.min`. Sembunyikan/nonaktifkan tombol booking untuk departure `FULL`/`CLOSED`.
10. **Tambahkan dialog konfirmasi** untuk verifikasi dokumen, penolakan dokumen, dan konfirmasi booking (`08` §32).

### Tahap 2 — Fondasi Frontend yang Sebenarnya (2–4 minggu)

11. **Pecah single-file menjadi proyek ber-build.** Sesuai arah spesifikasi: Next.js + TypeScript, komponen terpisah, state terkelola, routing nyata dengan URL per layar, dan persistensi.
12. **Bangun lapisan otorisasi tiga lapis** (`03` §24): gate UI berdasar role, enforcement server-side per aksi, dan RLS di database. Mulai dari matriks di `15_PERMISSION_RLS_MATRIX.md`.
13. **Implementasikan state machine di server**, dengan validasi transisi (`14` §3 SM-002) dan penolakan transisi ilegal. Registrasi harus lahir sebagai `DRAFT`/`SUBMITTED`, bukan `CONFIRMED`. Pembayaran harus lahir sebagai `SUBMITTED`, dan hanya naik ke `VERIFIED` lewat aksi terpisah oleh role Finance (`BR-PAY-004`).
14. **Tulis audit log untuk setiap mutasi** dengan struktur `12_SECURITY` §26 (actor, action, resource, before, after, timestamp, reason), di jalur yang tidak bisa gagal senyap.
15. **Remediasi aksesibilitas** memakai tabel §4.2 sebagai daftar periksa: token kontras yang lulus AA, floor ukuran font 12px, target sentuh 44px, skip link, pola ARIA Tabs yang benar, `aria-live` pada toast, `aria-hidden` pada SVG ikon, label form terhubung, manajemen fokus modal (fokus awal + trap + restore + `aria-hidden` latar), `lang="ar"` `dir="rtl"` pada blok Arab.
16. **Ganti emoji dengan satu set ikon SVG** yang konsisten (`08` §11).
17. **Bangun halaman detail** sebagai pola pertama (`08` §27), lalu terapkan ke Lead, Registration, Document, dan Departure. Ini membuka jalan bagi CRUD nyata.
18. **Implementasikan responsivitas tabel** — transformasi ke card view di bawah breakpoint (`08` §26), plus sorting dan pagination fungsional.

### Tahap 3 — Kelayakan Produksi

19. **Testing.** Belum ada satu pun test. Prioritaskan alur kritis sesuai `13` §51–52: state machine, perhitungan finansial, dan jalur otorisasi — termasuk negative testing (`12_SECURITY` §37–38).
20. **Konten kepercayaan legal**: nomor izin PPIU Kemenag, alamat kantor, syarat & ketentuan, kebijakan privasi. Ganti klaim "100%" / "Pasti Terbang" / "0% Hidden Cost" dengan bukti yang dapat dipertanggungjawabkan (`08` §37–38).
21. **Fotografi nyata** untuk surface Public (`08` §12).
22. **Kapabilitas PWA nyata** untuk surface Jamaah: manifest, service worker, theme-color, strategi offline yang didefinisikan eksplisit sebelum dijanjikan (`08` §34).
23. **Hapus alat developer dari UI produk** (bar "Uji Tampilan State"), pindahkan ke harness diagnostik terpisah.

---

## 8. CATATAN METODE & BATASAN

**Yang diverifikasi secara runtime** (bukan inferensi statis): kegagalan kontras (74/352), ukuran font (140 elemen < 12px), target sentuh (31/52), absennya ARIA tab, absennya `aria-live`, absennya skip link, 15 SVG tanpa `aria-hidden`, 0 `<img>`, 50 handler inline, 41/46 tombol tanpa `type`, kehilangan fokus saat re-render (SELECT → BODY), 6,5 ms per render penuh, ketiadaan persistensi (0 key localStorage/session, hash kosong), ketiadaan PWA (0 manifest/SW/theme-color), overflow tabel mobile (1.156px dalam 504px, 9 kolom), filter pencarian berfungsi (1/4 baris), pagination hardcoded disabled, Visitor dapat menyetujui dokumen (10 tombol, mutasi `REVISION_REQUIRED` → `VERIFIED` berhasil), overbooking departure FULL berhasil senyap (35/35 → clamp), form konsultasi menerima submit kosong, modal tidak memindahkan fokus, peringatan Tailwind CDN di konsol.

**Yang diuji dan TIDAK terbukti:** XSS melalui form booking. Payload `x'); window.__xssFired=true; ('` **tidak** mengeksekusi kode — ia mendarat di konteks teks HTML yang sudah di-escape. Risiko injeksi kutip-tunggal saya klasifikasikan sebagai **laten**, bukan aktif.

**Batasan audit:**
- Browser tidak menyediakan viewport visual, jadi **tidak ada penilaian estetika berbasis screenshot**. Penilaian visual didasarkan pada pembacaan kode dan nilai terhitung (warna, ukuran, spacing), bukan rendering yang dilihat mata. Layar belum diperiksa pada breakpoint 320px, 768px, 1024px, dan 1440px secara terpisah — hanya 510px.
- Backend **tidak dieksekusi**. Temuan backend berasal dari pembacaan kode penuh, bukan dari menjalankan Apps Script terhadap spreadsheet nyata. Perilaku deploy aktual belum terverifikasi.
- Dokumen yang dibaca penuh oleh auditor utama: `00`, `06` (bagian relevan), `08`. Dokumen `01`, `02`, `03`, `07`, `09`, `10`, `11`, `12`, `13`, `14`, `18`, `19` dianalisis melalui agen riset.
- **Klaim paling menentukan telah diverifikasi ulang secara independen terhadap file sumber**, bukan hanya dari ringkasan agen:
  - ADR-002 (Next.js) — `**Status:** ACCEPTED`, baris 91 ✓
  - ADR-003 (Supabase/PostgreSQL) — `**Status:** ACCEPTED`, baris 116 ✓
  - ADR-004 (PostgreSQL as Source of Truth) — `**Status:** ACCEPTED`, baris 141 ✓
  - ADR-023 (No Second Source of Truth) — `**Status:** LOCKED`, baris 519 ✓
  - `14_STATE_MACHINES.md` §13 Preparation: `NOT_STARTED / IN_PROGRESS / COMPLETED / BLOCKED / NOT_APPLICABLE`, baris 559–563 ✓ (bertentangan dengan `spreadsheet_schema.md` baris 135)
  - `14_STATE_MACHINES.md` §9 Invoice: `DRAFT / ISSUED / PARTIALLY_PAID / PAID / OVERDUE / VOID / CANCELLED`, baris 423–429 ✓ (bertentangan dengan `spreadsheet_schema.md` baris 109)
  - `12_SECURITY_AND_AUDIT.md` §6 daftar 12 role kanonik, baris 119–130 ✓ — **tidak memuat `VISITOR` maupun `ADMIN`**, dan diikuti pernyataan "Roles are not sufficient by themselves. Scope must also be evaluated."
  
  Jadi temuan P0-2 (stack menyimpang dari keputusan LOCKED) dan §6 (tiga sumber kebenaran) **berdiri di atas bukti yang sudah diverifikasi langsung**.
- Sisa rincian dari `01`, `02`, `03`, `07`, `09`, `10`, `11`, `13`, `18` (jumlah endpoint API, daftar ±45 tabel, rincian MVP A–E) berasal dari ringkasan agen dan belum diverifikasi baris demi baris. Angka-angka tersebut bersifat indikatif, meski orde besarnya konsisten dengan yang saya baca langsung di `06`, `08`, `12`, `14`, dan `19`.
- Dokumen `04`, `05`, `15`, `16`, `17` tidak dianalisis mendalam.
