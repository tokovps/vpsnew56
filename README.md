# VPSNEW56

Repository ini menyimpan revisi VPSNEW56 yang terkunci dan dapat direproduksi secara deterministik.

## Revisi

- Bahasa default user dan admin: Bahasa Indonesia.
- Deteksi bahasa otomatis dari `language_code` Telegram; user Indonesia mendapat Bahasa Indonesia dan locale non-Indonesia mendapat Bahasa Inggris.
- Pilihan bahasa manual tetap tersedia dan tidak ditimpa deteksi otomatis.
- Broadcast tetap bilingual, termasuk caption foto/video, dengan bahasa yang dipilih per user.
- Broadcast massal memakai batch paralel terkontrol dan proses pin/unpin terpisah agar pengiriman ke 500+ user tidak tertahan terlalu lama.
- Linux RDP dihapus dari seluruh menu, callback, dan alur pembelian user. Alur RDP user langsung memakai Windows.
- Kompatibilitas record Linux RDP lama dipertahankan hanya untuk recovery order historis agar data lama tidak menyebabkan crash.

## Materialisasi source

GitHub App yang digunakan untuk publikasi tidak memicu GitHub Actions. Karena itu repository menggunakan bootstrap deterministik:

1. Mengambil source dasar `tokovps/vpsnew55` pada commit tetap `56259e4ed3da7093c29ade0595784cf3396d6eec`.
2. Menggabungkan patch terkompresi di `.github/import/patch-xz.part-*`.
3. Memverifikasi SHA-256 patch terkompresi dan patch hasil ekstraksi.
4. Menjalankan `git apply --check` sebelum menerapkan perubahan.
5. Mengganti bootstrap dengan source VPSNEW56 lengkap.
6. Menjalankan `npm ci --ignore-scripts` dan `scripts/render-preflight.js`.

Perintah deployment normal tetap dapat digunakan:

```bash
npm install
npm start
```

`npm ci` juga didukung oleh lockfile bootstrap. Setelah materialisasi, `package.json` dan `package-lock.json` akan menjadi file final milik project VPSNEW56.

## Checksum revisi

- Source dasar: `tokovps/vpsnew55@56259e4ed3da7093c29ade0595784cf3396d6eec`
- Patch XZ SHA-256: `a5ef600b6d10ae981c1c5e2e2f0fa3c2ca41410b827029e18cf1ee0aaaaf0766`
- Patch SHA-256: `f251ec86b06b11ba0854b30fb1d7045797dc4718caf8e07b1b6522dca4bcc6a5`
- ZIP final SHA-256: `9a78430ea76447e94abcee11f4008a312bfc0612886ebf9e00ba247fe127b999`

## Status

Revisi telah dipublikasikan ke branch `main`. ZIP final, patch, bootstrap, dan checksum telah diverifikasi pada 22 Juli 2026.
