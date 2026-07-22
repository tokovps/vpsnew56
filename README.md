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
- Setelah user memilih region RDP, bot memeriksa seluruh versi Windows sebelum menampilkan menu OS.
- Pemeriksaan mencakup token/provider DigitalOcean aktif, dukungan region dan size, mapping installer, serta keterjangkauan sumber ISO.
- Hanya versi Windows bertanda ✅ yang dapat dipilih. Versi gagal tetap ditampilkan dan tidak diberi tombol order.
- Pre-check sekarang menggunakan progres hidup pada pesan yang sama: token, region/size, dan setiap OS berubah dari menunggu → diperiksa → siap/gagal berdasarkan event nyata.
- Pemeriksaan OS tetap berjalan paralel agar cepat, sedangkan edit caption dibatasi sekitar satu kali per 900 ms agar aman dari flood limit Telegram.
- Spinner terus bergerak ketika request provider atau sumber ISO sedang menunggu.
- Banyak user dengan region/spec yang sama berbagi satu pemeriksaan provider/ISO, tetapi masing-masing menerima progres pada panel Telegram miliknya.
- User yang membatalkan atau mengganti region tidak akan ditimpa hasil pemeriksaan lama.
- Kegagalan edit caption sementara tidak membatalkan pemeriksaan dan tidak membuat pesan duplikat.
- Tombol `CEK ULANG SEMUA OS` tersedia untuk memaksa pemeriksaan terbaru sebelum user melanjutkan.
- Pre-check mengurangi kegagalan yang dapat diketahui sebelumnya, sedangkan final provisioning preflight tetap dijalankan kembali sebelum invoice/provisioning.

## Materialisasi source

GitHub App yang digunakan untuk publikasi tidak memicu GitHub Actions. Karena itu repository menggunakan bootstrap deterministik:

1. Mengambil source dasar `tokovps/vpsnew55` pada commit tetap `56259e4ed3da7093c29ade0595784cf3396d6eec`.
2. Menggabungkan dan memverifikasi patch dasar VPSNEW56 di `.github/import/patch-xz.part-*`.
3. Menjalankan `git apply --check`, lalu menerapkan patch dasar.
4. Menggabungkan dan memverifikasi patch pre-check OS RDP di `.github/import/patch2-xz.part-*`.
5. Menjalankan `git apply --check`, lalu menerapkan patch pre-check OS.
6. Menggabungkan dan memverifikasi patch live progress di `.github/import/patch3-xz.part-*`.
7. Menjalankan `git apply --check`, lalu menerapkan patch live progress.
8. Mengganti bootstrap dengan source VPSNEW56 lengkap.
9. Menjalankan `npm ci --ignore-scripts` dan `scripts/render-preflight.js`.

Perintah deployment normal tetap dapat digunakan:

```bash
npm install
npm start
```

`npm ci` juga didukung oleh lockfile bootstrap. Setelah materialisasi, `package.json` dan `package-lock.json` akan menjadi file final milik project VPSNEW56.

## Checksum revisi

### Source dan patch dasar VPSNEW56

- Source dasar: `tokovps/vpsnew55@56259e4ed3da7093c29ade0595784cf3396d6eec`
- Patch XZ SHA-256: `a5ef600b6d10ae981c1c5e2e2f0fa3c2ca41410b827029e18cf1ee0aaaaf0766`
- Patch SHA-256: `f251ec86b06b11ba0854b30fb1d7045797dc4718caf8e07b1b6522dca4bcc6a5`

### Patch RDP all-OS pre-check

- Patch XZ SHA-256: `d8b1815ef348bd2cafd0ecd0b92f0423f0bf84dfe7e89e6d25333c1a061bf577`
- Patch SHA-256: `dbf97f64408b984700b9b36a56aa070f97ba4691de87ecdc839c374d3ef7b2cf`

### Patch RDP live pre-check

- Patch XZ SHA-256: `c63cf4f7e8b23264a856ddf415a4ed36e7c3565f9e3e29a7989cfa3dc4338a40`
- Patch SHA-256: `c693082acbf8fcfd289ef859c46b81fad2886222155a1f7e324724bc3aef2cbf`
- ZIP final SHA-256: `b1a84b11e884aa0b7513c37d04dacfb3bf9a658c9f5af1f43147deb91fb6dcd9`

## Pengaturan opsional

- `RDP_LIVE_EDIT_MS`: interval minimum edit caption, default 900 ms dan minimum 700 ms.
- `RDP_LIVE_SPINNER_MS`: interval spinner, default 1100 ms dan minimum 800 ms.
- Pengaturan TTL, timeout, cache, dan concurrency all-OS pre-check lama tetap berlaku.

## Status

Revisi live progress pemeriksaan seluruh OS Windows RDP telah dipublikasikan ke branch `main`. Patch, bootstrap, ZIP, checksum, caption Indonesia/Inggris, dan regression test telah diverifikasi pada 23 Juli 2026.
