# PlantUML Studio

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![CodeMirror](https://img.shields.io/badge/CodeMirror-6.x-E95420?logo=codemirror&logoColor=white)](https://codemirror.net/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PlantUML Studio** adalah aplikasi web untuk merancang, mengedit, dan memvisualisasikan diagram dengan code PlantUML

---

## Fitur Utama

1. **Editor Kode Canggih**
   - Ditenagai oleh **CodeMirror 6** dengan penomoran baris (*line numbers*), pelipatan kode, dan *syntax highlighting* PlantUML.
   - **Auto-render** otomatis dengan *debounce* 600 ms setelah pengguna berhenti mengetik.
   - Tombol manual **Render** dan pintasan keyboard **`Ctrl + Enter`** / **`Cmd + Enter`**.
   - Penghitung jumlah baris dan karakter secara *real-time*.

2. **Pratinjau Diagram Interaktif**
   - **Render Aman via Server Route Nitro (`/api/render`)**: Meneruskan kode yang di-encode ke server PlantUML tanpa eksekusi kode sembarangan di server.
   - Mendukung format keluaran: **SVG (vektor)** dan **PNG (gambar raster)** dengan tombol toggle instan.
   - **Kontrol Zoom & Pan**:
     - Tombol Zoom In (`+`), Zoom Out (`-`), dan Reset Zoom (`100%`).
     - **Fit to Screen**: Menyesuaikan skala diagram secara otomatis ke ukuran jendela.
     - **Pan**: Geser kanvas bebas dengan *drag* tombol mouse kiri.
     - **Mouse Wheel**: Zoom in/out halus menggunakan roda mouse.
   - **Indikator Loading & Penanganan Error**: Menampilkan pesan kesalahan sintaks yang informatif dan jelas jika terjadi kesalahan kode diagram.

3. **Template & Contoh Lengkap**
   - Pilihan template siap pakai dari menu dropdown:
     - **Sequence Diagram** (Alur autentikasi token JWT)
     - **Class Diagram** (Struktur domain e-commerce)
     - **Use Case Diagram** (Sistem perpustakaan digital)
     - **Activity Diagram** (Alur checkout & pembayaran)
     - **ER Diagram** (Relasi entitas e-commerce dengan crow's foot notation)
     - **LRS (Logical Record Structure)** (Skema basis data akademik)

4. **Ekspor & Berbagi**
   - **Unduh File**: SVG (`.svg`), PNG (`.png`), dan berkas sumber PlantUML (`.puml`).
   - **Salin Kode**: Salin seluruh teks editor ke papan klip (*clipboard*).
   - **Salin URL Gambar**: Tautan gambar langsung dari server PlantUML.
   - **Salin Link Berbagi**: Tautan URL dengan kode diagram terkompresi pada *URL hash* (`#code=...`) yang dapat dibuka oleh siapa saja tanpa basis data backend.

5. **Penyimpanan Lokal & Autosave**
   - Manajemen proyek berbasis `localStorage`:
     - Buat proyek baru (*New Project*).
     - Ganti nama proyek (*Rename*).
     - Duplikat proyek (*Duplicate*).
     - Hapus proyek (*Delete* dengan konfirmasi).
   - **Autosave**: Setiap perubahan kode otomatis tersimpan ke draft proyek yang sedang aktif.

6. **UI/UX Modern & Responsif**
   - **Resizable Split Pane**: Batas pemisah editor dan pratinjau pada layar desktop dapat digeser secara fleksibel (klik ganda untuk kembali ke 50/50).
   - **Tampilan Mobile Adaptif**: Di layar smartphone/tablet, otomatis beralih menjadi sistem Tab (*Editor* | *Preview*).
   - **Dark Mode & Light Mode**: Toggle tema gelap dan terang dengan integrasi tema CodeMirror One Dark.
   - **Bahasa Antarmuka**: Seluruh teks antarmuka berbahasa Indonesia yang ramah dan konsisten.
   - **Aksesibilitas (A11y)**: Dilengkapi dengan atribut ARIA dan navigasi fokus keyboard.

7. **Keamanan (Security)**
   - **Sanitasi SVG**: Memanfaatkan **DOMPurify** di sisi klien untuk membersihkan elemen SVG sebelum dimasukkan ke dalam DOM, mencegah celah keamanan XSS.
   - **Batas Ukuran Request**: Validasi batas muatan kode PlantUML maksimum 50 KB pada API render.
   - **In-Memory Rate Limiting**: Pembatasan laju permintaan (maksimal 60 request per menit per alamat IP) untuk mencegah *abuse* dan pembebanan berlebih ke server PlantUML.

---

## Struktur Teknis Proyek

```plaintext
plantuml/
├── assets/
│   └── css/
│       └── tailwind.css         # Direktif Tailwind CSS & scrollbar kustom
├── components/
│   ├── CodeEditor.vue           # Editor CodeMirror 6 dengan highlight PlantUML
│   ├── DiagramPreview.vue       # Kanvas pratinjau diagram (Pan, Zoom, SVG/PNG)
│   ├── ProjectSidebar.vue       # Laci manajemen proyek lokal (localStorage)
│   ├── TemplateSelect.vue       # Dropdown pilihan template diagram
│   └── Toolbar.vue              # Bilah navigasi atas (unduh, bagikan, tema)
├── composables/
│   ├── usePlantUml.ts           # Logika encode, render API, debounce, ekspor
│   ├── useProjects.ts           # Manajemen proyek CRUD & autosave di localStorage
│   └── useTheme.ts              # Pengatur tema Dark/Light mode
├── pages/
│   └── index.vue                # Halaman utama dengan layout resizable split-pane
├── server/
│   └── api/
│       └── render.post.ts       # Proxy API Nitro, rate-limit, validasi & timeout
├── utils/
│   └── templates.ts             # Definisi 6 koleksi template diagram contoh
├── app.vue                      # Root wrapper aplikasi Nuxt
├── nuxt.config.ts               # Konfigurasi Nuxt, Tailwind, dan runtime env
├── tailwind.config.js           # Konfigurasi palet warna & varian tema Tailwind
├── Dockerfile                   # Multi-stage Docker build untuk produksi
├── docker-compose.yml           # Orkestrasi container Nuxt + PlantUML Server lokal
├── .env.example                 # Contoh variabel lingkungan
└── README.md                    # Dokumentasi lengkap proyek
```

---

## Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- **Node.js**: v20.x atau v22.x+ (rekomendasi LTS)
- **NPM** atau package manager pilihan Anda

### Langkah 1: Kloning & Instal Dependensi
```bash
git clone <url-repositori-anda>
cd plantuml
npm install
```

### Langkah 2: Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi berkas `.env`:
```env
# URL server PlantUML (bisa menggunakan publik atau instance lokal Docker)
PLANTUML_SERVER_URL=https://www.plantuml.com/plantuml
PORT=3000
HOST=0.0.0.0
```

### Langkah 3: Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka peramban Anda di `http://localhost:3000`.

### Langkah 4: Build Produksi
```bash
npm run build
npm run preview
```
Atau jalankan langsung hasil build:
```bash
node .output/server/index.mjs
```

---

## Menjalankan dengan Docker & Docker Compose

Proyek ini telah dilengkapi dengan konfigurasi **Docker Compose** lengkap yang mencakup:
1. `plantuml-server`: Instance server resmi PlantUML (`plantuml/plantuml-server:jetty`) yang berjalan offline di port `8080`.
2. `plantuml-studio`: Aplikasi web Nuxt 3/4 yang otomatis terhubung ke `http://plantuml-server:8080`.

### Menjalankan Seluruh Layanan (Offline / Self-Hosted):
```bash
docker compose up -d --build
```

Setelah container berjalan:
- **Aplikasi PlantUML Studio**: Buka `http://localhost:3000`
- **PlantUML Backend Server**: Buka `http://localhost:8080`

### Menghentikan Layanan:
```bash
docker compose down
```

---

## Pintasan Keyboard (Shortcuts)

| Pintasan | Aksi |
| :--- | :--- |
| `Ctrl + Enter` / `Cmd + Enter` | Merender diagram secara manual |
| `Roda Mouse (Scroll)` | Zoom In / Zoom Out kanvas diagram |
| `Klik Kiri Tahan + Geser` | Menggeser (*Pan*) kanvas diagram |
| `Klik Ganda Pembatas Split` | Reset ukuran panel Editor & Preview ke 50/50 |

---

## Lisensi & Penghargaan
- Dibuat menggunakan [Nuxt 3 / Nuxt 4](https://nuxt.com/) & [Vue 3](https://vuejs.org/)
- Desain antarmuka dengan [Tailwind CSS](https://tailwindcss.com/)
- Komponen editor didukung oleh [CodeMirror 6](https://codemirror.net/)
- Render diagram didukung oleh [PlantUML](https://plantuml.com/)
