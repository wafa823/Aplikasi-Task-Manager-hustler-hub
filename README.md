# The Hustler's Hub 🚀

Satu tempat untuk mengatur semua peranmu! The Hustler's Hub adalah aplikasi produktivitas yang dirancang khusus untuk orang-ster yang sibuk dengan berbagai peran: mahasiswa, freelancer, anggota komunitas, dll.

## ✨ Fitur Utama

- **Autentikasi**: Login menggunakan Email/Password atau masuk tanpa akun (Mode Demo) menggunakan Firebase Authentication.
- **Hub Kategori**: Pisahkan tugasmu berdasarkan peran (Kampus & Akademik, Event & Komunitas, Kerja Sampingan).
- **Manajemen Tugas**: Tambah, ubah, hapus, dan tandai tugas selesai (CRUD).
- **Statistik & Progress**: Lacak progress harianmu dengan progress ring yang cantik.
- **Dark Mode UI**: Desain antarmuka premium dengan warna yang menenangkan.
- **Cross-Platform**: Dibangun menggunakan React Native & Expo (mendukung Web, Android, dan iOS).

## 🛠️ Teknologi yang Digunakan

- [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/) (Auth & Cloud Firestore)
- [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- [Feather Icons](https://feathericons.com/) (melalui `@expo/vector-icons`)
- TypeScript

## 🚀 Cara Menjalankan Project

### Persiapan Lingkungan
Pastikan Anda sudah menginstal Node.js dan npm/yarn di komputer Anda.

1. **Clone repository ini**
   ```bash
   git clone <url-repository-anda>
   cd hustlers-hub/hustlers-hub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Buat file `.env` di root direktori project (`hustlers-hub/hustlers-hub/.env`)
   - Masukkan konfigurasi Firebase Anda seperti ini:
     ```env
     EXPO_PUBLIC_FIREBASE_API_KEY=api_key_anda
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=domain_anda
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=project_id_anda
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=bucket_anda
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
     EXPO_PUBLIC_FIREBASE_APP_ID=app_id_anda
     EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=measurement_id_anda
     ```

4. **Jalankan Aplikasi**
   ```bash
   npx expo start
   ```

   - Tekan `w` untuk membuka di Web.
   - Atau scan QR code menggunakan aplikasi Expo Go di smartphone Anda.

## 📦 Deployment ke Vercel

Aplikasi ini sudah dikonfigurasi untuk dapat di-deploy ke Vercel sebagai aplikasi web statis.

1. Pastikan Anda sudah menginstal Vercel CLI (`npm i -g vercel`).
2. Jalankan perintah deploy:
   ```bash
   npm run deploy
   ```
Atau Anda bisa langsung mengkoneksikan repository GitHub ini ke Vercel Dashboard, dan Vercel akan secara otomatis membangun aplikasi menggunakan konfigurasi di `vercel.json`.

---
*Dibuat dengan ❤️ untuk para Hustlers.*
