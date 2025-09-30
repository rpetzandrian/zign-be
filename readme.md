# Zign 🖋️

Zign adalah sebuah aplikasi modern yang dirancang untuk memudahkan proses penandatanganan dokumen secara elektronik. Dilengkapi dengan teknologi canggih seperti **OCR (Optical Character Recognition)** dan **Face Recognition**, Zign tidak hanya menyederhanakan alur kerja Anda tetapi juga menambahkan lapisan keamanan ekstra untuk memastikan validitas dan integritas setiap tanda tangan.

![Digital Signature](https://via.placeholder.com/600x300.png?text=Zign+E-Signature+App)

## ✨ Fitur Utama

- **Tanda Tangan Elektronik**: Buat dan bubuhkan tanda tangan digital pada dokumen PDF dengan mudah.
- **Verifikasi Wajah (Face Recognition)**: Pastikan identitas penanda tangan melalui verifikasi wajah biometrik sebelum menandatangani.
- **Ekstraksi Data (OCR)**: Ekstrak teks dan data penting dari dokumen secara otomatis untuk pengisian formulir yang lebih cepat.
- **Aman & Terpercaya**: Setiap dokumen dan tanda tangan diamankan untuk menjaga kerahasiaan dan keasliannya.

---

## 🚀 Cara Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan pengembangan lokal Anda, ikuti langkah-langkah berikut:

### 1. Jalankan Environment Aplikasi

Proyek ini memerlukan _environment_ yang sudah disiapkan dalam repositori terpisah.

```bash
# 1. Clone repositori dev-container
git clone [https://github.com/rpetzandrian/dev-container](https://github.com/rpetzandrian/dev-container)

# 2. Masuk ke direktori dan jalankan Docker Compose
cd dev-container
docker-compose up -d
```

### 2. Jalankan Aplikasi Zign (Backend)

Setelah environment berjalan, Anda bisa menyiapkan dan menjalankan aplikasi backend Zign.

```bash
# 3. Clone repositori zign-be
# Ganti [URL_REPO_ZIGN_ANDA] dengan URL Git repository Anda
git clone [URL_REPO_ZIGN_ANDA]
cd zign-be

# 4. Salin dan konfigurasi file .env
cp .env-example .env

# 5. Instal semua dependensi proyek
npm run clean-install

# 6. Sinkronisasi skema database dengan Prisma
npx prisma db push

# 7. Jalankan aplikasi
npm run start
```
