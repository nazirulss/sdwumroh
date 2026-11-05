---
name: multiplatform-pwa-architect
description: Guides the design, architecture, and development of multi-platform web applications in a monorepo setup, integrating public responsive websites (desktop/mobile/tablet), role-based admin portals (RBAC & complex data grids), and installable offline-first Progressive Web Apps (PWA). Activate this skill when building or refactoring cross-device layouts, configuring Service Worker caching strategies, designing admin backoffices with sensitive data protections, or structuring scalable monorepo codebases.
---

# Multiplatform PWA Architect Skill

> **Filosofi Arsitektur:** *"One Codebase, Universal Experience, Resilient Offline-First UX."*  
> Skill ini menetapkan standar arsitektural dan teknis untuk membangun ekosistem aplikasi web modern yang menggabungkan situs publik responsif, portal admin backoffice enterprise, dan kapabilitas aplikasi native melalui Progressive Web App (PWA).

---

## 1. Arsitektur Monorepo & Pembagian Direktori

Untuk mencegah duplikasi kode (*DRY - Don't Repeat Yourself*) dan menjaga pemisahan tanggung jawab (*Separation of Concerns*), gunakan struktur monorepo terstandarisasi berikut:

```text
<project-root>/
├── apps/
│   ├── web/                    # [App 1] Website Publik Responsif
│   │   ├── src/
│   │   │   ├── pages/          # Landing page, katalog, artikel, alur booking publik
│   │   │   ├── components/     # Komponen spesifik alur publik (hero, filter paket, wizard)
│   │   │   └── main.ts         # Entry point aplikasi publik
│   │   └── public/
│   │       ├── favicon.ico
│   │       └── robots.txt
│   │
│   └── admin/                  # [App 2] Portal Admin & Backoffice Hub
│       ├── src/
│       │   ├── modules/        # CRM, Registrasi, Keuangan, Operasional, Audit Log
│       │   ├── components/     # Data tables, drawer detail, PIN pad modal, export bar
│       │   ├── guards/         # RBAC route guard & permission interceptors
│       │   └── main.ts         # Entry point portal admin
│       └── public/
│           └── admin-assets/
│
├── packages/
│   ├── shared-ui/              # [Package] Desain Sistem & Komponen Antarmuka Bersama
│   │   ├── src/
│   │   │   ├── buttons/        # Primary, secondary, outline, icon-button
│   │   │   ├── inputs/         # Text, select, datepicker, searchbar
│   │   │   ├── feedback/       # Toast, alert banner, skeleton loader, modal
│   │   │   ├── layout/         # Header, bottom navigation, sidebar drawer
│   │   │   └── theme/          # Token warna, tipografi, elevation/shadow
│   │   └── package.json
│   │
│   ├── shared-core/            # [Package] Logika Bisnis & Utilitas Bersama
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces/types (User, Booking, Payment, Audit)
│   │   │   ├── formatters/     # Format mata uang (IDR/SAR), tanggal hijriah/masehi, telepon
│   │   │   ├── validators/     # Skema validasi formulir (NIK, paspor, email, kuota)
│   │   │   └── constants/      # Status enum, role enum, config defaults
│   │   └── package.json
│   │
│   ├── api-client/             # [Package] Abstraksi Komunikasi Backend & Offline Engine
│   │   ├── src/
│   │   │   ├── http/           # Axios/Fetch wrapper dengan retry & interceptors
│   │   │   ├── offline-sync/   # IndexedDB queue engine, background sync manager
│   │   │   └── endpoints/      # API definitions untuk setiap modul bisnis
│   │   └── package.json
│   │
│   └── pwa-service/            # [Package] Service Worker, Cache Strategies & Manifest
│       ├── src/
│       │   ├── sw-register.ts  # Script inisialisasi & update prompt PWA
│       │   ├── sw.ts           # Service Worker core: install, activate, fetch
│       │   └── strategies/     # Cache-First, Network-First, Stale-While-Revalidate
│       └── manifest.json       # Konfigurasi PWA App Manifest global
│
├── .agents/skills/             # Local Antigravity Custom Skills
├── docs/                       # Dokumentasi arsitektur, peran pengguna, ERD database
└── package.json                # Root workspace configuration (pnpm / npm / yarn / bun)
```

### Aturan Ketergantungan Antar-Paket (*Dependency Boundary Rules*):
1. **Aplikasi (`apps/*`)** boleh mengimpor dari semua paket di `packages/*`.
2. **Paket UI (`packages/shared-ui`)** HANYA boleh mengimpor dari `packages/shared-core`, dilarang mengimpor dari `apps/*` atau `packages/api-client`.
3. **Paket Core (`packages/shared-core`)** bersifat murni (*pure logic*), tidak boleh bergantung pada DOM browser atau framework UI tertentu.
4. **Hindari *Circular Dependency*** secara mutlak antar paket.

---

## 2. Standar Desain & Responsivitas (Mobile-First)

Pengembangan antarmuka harus menggunakan paradigma **Mobile-First** untuk memastikan kenyamanan pengguna di smartphone Android/iOS, tablet, hingga layar desktop ultrawide.

### A. Breakpoint Standar Tailwind / CSS
```css
/* Mobile First Base: < 640px (Default untuk Smartphone layar kecil & standar) */
sm:  640px   /* Smartphone orientasi lanskap / phablet */
md:  768px   /* Tablet vertikal (iPad, Galaxy Tab) */
lg:  1024px  /* Tablet lanskap / Laptop standar */
xl:  1280px  /* Desktop HD monitor */
2xl: 1536px  /* Desktop layar lebar / iMac / TV */
```

### B. Aturan Ergonomi Sentuh & Area Aman (*Touch & Safe Areas*)
- **Target Sentuh Minimum:** Setiap tombol, tautan, atau elemen klik interaktif wajib berukuran minimal **`44px x 44px`** (atau `48px x 48px` untuk tombol aksi utama).
- **Safe Area Insets:** Wajib memperhitungkan notch kamera dan bar gestur navigasi mobile:
  ```css
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  ```
- **Pencegahan Auto-Zoom pada iOS Safari:** Input formulir teks pada mobile harus memiliki ukuran font minimal `16px` (`text-base` atau `text-sm` dengan scale pencegah zoom) agar browser tidak memperbesar layar otomatis saat keyboard virtual muncul.

### C. Pola Responsif Antarmuka

| Pola Antarmuka | Layar Mobile (< 768px) | Layar Desktop (≥ 1024px) |
| :--- | :--- | :--- |
| **Navigasi Utama** | Bottom Navigation Bar (4-5 tab) + Hamburger Drawer | Sidebar tetap (*fixed sidebar*) dengan menu bertingkat |
| **Data Kompleks** | Kartu Ringkas (*Collapsible Cards*) / Swipe list | Tabel multi-kolom dengan sticky header & horizontal scroll |
| **Formulir Input** | 1 Kolom vertikal penuh (*single column stack*) | 2 atau 3 Kolom grid terstruktur |
| **Aksi Konfirmasi** | Bottom Sheet Modal (*slide up from bottom*) | Dialog Modal di tengah layar (*centered pop-up*) |
| **Filter & Urutan** | Tombol pemicu Drawer Filter layar penuh | Barisan filter horizontal langsung terlihat (*inline bar*) |

---

## 3. Aturan Khusus PWA (Progressive Web App)

PWA harus memberikan pengalaman setara aplikasi native: dapat diinstal ke layar beranda (*Add to Home Screen*), cepat dimuat, dan tetap dapat menyajikan data esensial saat offline.

### A. Konfigurasi `manifest.json` Standar
```json
{
  "name": "SDW UMROH - Solusi Digital Terpadu",
  "short_name": "SDW Umroh",
  "description": "Platform Manajemen & Layanan Ibadah Umroh Satu Pintu",
  "start_url": "/",
  "id": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#240833",
  "theme_color": "#240833",
  "lang": "id-ID",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### B. Matriks Strategi Cache Service Worker

| Kategori Aset | Strategi Cache | Alasan Teknis |
| :--- | :--- | :--- |
| **Aset Statis Inti** (`.html`, `.css`, `.js`, font lokal) | **Cache-First** (dengan versi cache terikat rilis) | Menjamin kecepatan instan saat buka aplikasi (*sub-second load*). |
| **Gambar & Media Banner** (`.png`, `.jpg`, `.webp`, `.svg`) | **Stale-While-Revalidate** (dengan limit entri cache) | Menampilkan gambar tersimpan lebih dulu sambil memperbarui di latar belakang. |
| **API Data Transaksional** (Jadwal, seat, invoice, data jamaah) | **Network-First dengan Offline Cache Fallback** | Selalu utamakan data paling mutakhir dari server; tampilkan data cache jika koneksi putus. |
| **Mutasi Data** (Pemesanan, checklist logistik, absensi) | **Network-Only + Background Sync Queue** | Simpan mutasi ke antrean lokal (IndexedDB) jika offline, otomatis kirim saat online kembali. |

### C. Siklus Hidup Service Worker (*Service Worker Lifecycle*)
1. **Cache Buster Versioning:** Nama cache wajib memiliki nomor versi eksplisit (misal: `sdw-umroh-v30`).
2. **Pembersihan Cache Usang (*Garbage Collection*):** Event `activate` wajib menghapus seluruh cache versi lama yang tidak lagi cocok dengan versi aktif saat ini.
3. **Indikator Offline-First:** Tampilkan pill/banner status koneksi:
   - 🟢 `Online` (Sinkronisasi aktif)
   - 🟡 `Tersimpan Lokal` (Menunggu koneksi untuk mengirim antrean mutasi)
   - 🔴 `Mode Offline` (Menggunakan data tersimpan di perangkat)

---

## 4. Keamanan Portal Admin & Kontrol Akses (RBAC)

Portal admin backoffice menyimpan informasi jamaah yang sensitif (data identitas, keuangan, dokumen resmi). Keamanan wajib ditegakkan secara berlapis (*defense-in-depth*).

### A. Kontrol Akses Berbasis Peran (*Role-Based Access Control / RBAC*)
Terapkan hierarki hak akses yang ketat:
- **`OWNER` / `DIRECTOR`**: Akses penuh ke seluruh modul, rekap keuangan global, dan pengaturan sistem tingkat tinggi.
- **`MANAGER` / `ADMIN`**: Manajemen pendaftaran, konfigurasi kloter, penugasan armada, dan ekspor laporan.
- **`FINANCE`**: Verifikasi mutasi bank, penerbitan invoice, persetujuan pembayaran, dan pembukuan kas.
- **`DOCUMENT_OFFICER`**: Validasi paspor, verifikasi buku vaksin, pengajuan visa, dan kelengkapan berkas.
- **`OPERATIONS`**: Manajemen boarding bus, rooming hotel, distribusi logistik koper, dan presensi manasik.
- **`SALES`**: Manajemen prospek (*leads CRM*), estimasi biaya, dan pendampingan registrasi baru.

> [!CRITICAL]
> **Prinsip Validasi Ganda:** Pembatasan tampilan antarmuka (menyembunyikan tombol/menu) **BUKAN** fitur keamanan utama. Setiap permintaan API mutasi data wajib memvalidasi hak akses token peran di sisi backend secara independen.

### B. Proteksi Data Sensitif (Kepatuhan UU Perlindungan Data Pribadi)
1. **Masking Default:** Kolom sensitif seperti NIK, nomor rekening bank, dan nomor paspor wajib dimasking secara default (misal: `3276••••••••0001`).
2. **Akses Unmask Terbatas:** Tombol unmask (👁️) hanya dapat diaktifkan oleh peran tertentu (`ADMIN`, `FINANCE`, `MANAGER`, `OWNER`).
3. **Jejak Audit Forensik (*Immutable Audit Trail*):**
   - Setiap tindakan pembukaan sensor (*unmasking*) wajib otomatis dicatat sebagai event audit berkategori **`CRITICAL`**.
   - Setiap mutasi data kritis (penolakan berkas, persetujuan setoran uang, pembatalan seat) wajib menyimpan ID Aktor, Waktu, IP/Device, dan Uraian Mutasi yang tidak dapat diubah (*tamper-proof*).

### C. Layar Kunci Otomatis (*Session Inactivity Auto-Lock*)
- **Inactivity Timer:** Sistem wajib mengunci layar jika tidak ada interaksi mouse, keyboard, touch, atau scroll selama **15 menit**.
- **Tombol Kunci Manual:** Sediakan tombol gembok 1-klik di header navigasi admin.
- **PIN Pad Modal:** Layar kunci harus menutupi layar dengan overlay backdrop blur tinggi (`z-[100]`), meminta PIN verifikasi staf tanpa me-reload halaman atau menghilangkan input formulir yang sedang dikerjakan.
- **Pencatatan Insiden:** Percobaan membuka kunci dengan PIN yang salah dicatat sebagai insiden `WARNING` pada Jejak Audit.

---

## 5. Workflow & Checklist Verifikasi Agen

Setiap kali agen membuat, mengedit, atau merefaktor kode dalam proyek ini, jalankan protokol verifikasi berikut secara berurutan:

### Checklist 1: Desain & Responsivitas Mobile
- [ ] Apakah tombol aksi utama memiliki ukuran sentuh minimal `44px x 44px`?
- [ ] Apakah tampilan telah diuji pada viewport mobile (`375px` - `414px`) dan desktop (`1280px`+)?
- [ ] Apakah tabel data horizontal pada mobile memiliki kontainer `overflow-x-auto` atau bertransformasi menjadi kartu?
- [ ] Apakah elemen sticky bar atau navigasi bawah tidak menutupi konten penting (*padding bottom compensation*)?

### Checklist 2: PWA & Kemampuan Offline
- [ ] Apakah berkas `manifest.json` valid dan memiliki link referensi di `<head>` dokumen HTML?
- [ ] Jika ada penambahan aset statis atau perubahan logika script, apakah versi `CACHE_NAME` di `sw.js` telah dinaikkan (*version bump*)?
- [ ] Apakah panggilan mutasi data baru telah menggunakan antrean sinkronisasi (*offline mutation queue*) agar tidak hilang saat jaringan offline?
- [ ] Apakah aplikasi menampilkan pesan error yang ramah dan data cache cadangan saat simulasi *offline mode*?

### Checklist 3: Keamanan Portal Admin & RBAC
- [ ] Apakah tombol/menu fitur baru telah diberi filter visibilitas sesuai matriks peran staf (`ADMIN_PERMISSIONS`)?
- [ ] Apakah NIK, nomor paspor, dan rekening bank menggunakan format masking default?
- [ ] Apakah aksi mutasi baru telah memanggil fungsi audit logger (`logAdminAudit`) dengan tingkat keparahan yang sesuai (`CRITICAL`, `WARNING`, atau `INFO`)?
- [ ] Apakah endpoint backend API memvalidasi otorisasi peran sebelum menjalankan modifikasi database?

### Checklist 4: Kualitas & Integritas Kode
- [ ] Tidak ada syntax error (jalankan `node -c <file.js>` atau linting TypeScript).
- [ ] Tidak ada perubahan gaya desain atau warna yang merusak token palet resmi proyek.
- [ ] Tidak ada penimpaan file konfigurasi rahasia (*credentials / API keys*).

---

## 6. Contoh Implementasi Referensi Singkat

### A. Pola Responsive Card-Table Hybrid
```html
<!-- Wrapper Data: Tabel di Desktop, Kartu di Mobile -->
<div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
  <table class="w-full text-left text-xs">
    <!-- Header & Rows Desktop -->
  </table>
</div>

<div class="grid grid-cols-1 gap-3 md:hidden">
  <!-- Iterasi Kartu Sentuh Mobile -->
  <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
    <!-- Detail Item & Tombol Aksi Sentuh 48px -->
  </div>
</div>
```

### B. Pola Safe Area & Bottom Nav Bar
```html
<nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden">
  <div class="flex items-center justify-around h-16">
    <!-- Nav Items dengan tap target minimal 44x44px -->
  </div>
</nav>
```

### C. Pola Two-Way Sync Queue untuk PWA
```javascript
function enqueueMutation(action, payload, entity, refId) {
  const mutation = {
    id: `MUT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    action: action,
    payload: payload,
    entity: entity,
    refId: refId,
    timestamp: new Date().toISOString(),
    retryCount: 0
  };

  const queue = JSON.parse(localStorage.getItem('app_mutation_queue') || '[]');
  queue.push(mutation);
  localStorage.setItem('app_mutation_queue', JSON.stringify(queue));

  if (navigator.onLine) {
    flushMutationQueue();
  }
}
```

