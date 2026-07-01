// src/data/seed.js
// Jalankan dengan: npm run seed (isi data) atau npm run seed:destroy (hapus semua)
//
// Data ~50 restoran tersebar di sekitar Politeknik Negeri Lampung (Jl. Soekarno
// Hatta, Rajabasa, Bandar Lampung — titik anchor kira-kira -5.3667, 105.2333),
// menjangkau kecamatan sekitar kampus: Rajabasa, Kedaton, Sukarame, Labuhan
// Ratu, Tanjung Karang, Way Halim, dan Teluk Betung.
//
// Foto memakai picsum.photos dengan seed unik per restoran/menu — layanan
// placeholder foto yang masih aktif (bukan Unsplash Source, yang sudah resmi
// dihentikan sejak 2021), sehingga foto stabil & tidak berubah tiap reload.
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Restaurant from '../models/Restaurant.js'
import MenuItem from '../models/MenuItem.js'
import Review from '../models/Review.js'
import Order from '../models/Order.js'

// --- Helper: foto placeholder stabil (picsum.photos dengan seed) ---
function photo(seed, w = 800, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// --- Helper: titik koordinat deterministik di sekitar anchor Polinela ---
const POLINELA = { lat: -5.3667, lng: 105.2333 }
function nearPolinela(seedNum) {
  // Sebaran ~±0.045 derajat (~5 km) dari kampus, deterministik dari seedNum
  // supaya tetap stabil tiap kali seed dijalankan ulang, bukan acak murni.
  const dLat = (((seedNum * 37) % 90) / 90 - 0.5) * 0.09
  const dLng = (((seedNum * 53) % 90) / 90 - 0.5) * 0.09
  return { lat: Number((POLINELA.lat + dLat).toFixed(4)), lng: Number((POLINELA.lng + dLng).toFixed(4)) }
}

// --- Template menu per kategori: [nama, harga, deskripsi, kategoriMenu] ---
// kategoriMenu eksplisit ('Makanan Utama' | 'Minuman' | 'Pembuka') supaya
// tidak perlu menebak dari teks deskripsi.
const MENU_TEMPLATES = {
  Padang: [
    ['Rendang Daging', 28000, 'Rendang sapi empuk bumbu rempah khas Padang, dimasak berjam-jam', 'Makanan Utama'],
    ['Ayam Pop', 22000, 'Ayam goreng khas Padang, gurih tidak pedas', 'Makanan Utama'],
    ['Gulai Tunjang', 20000, 'Gulai kikil sapi kuah santan kental', 'Makanan Utama'],
    ['Dendeng Balado', 25000, 'Dendeng sapi tipis, sambal balado merah menyala', 'Makanan Utama'],
    ['Sayur Nangka', 8000, 'Gulai nangka muda santan, pelengkap nasi padang', 'Pembuka'],
    ['Es Teh Manis', 5000, 'Teh manis dingin segar', 'Minuman'],
  ],
  Nusantara: [
    ['Gudeg Komplit', 22000, 'Gudeg nangka muda, ayam kampung, telur, krecek', 'Makanan Utama'],
    ['Sayur Lodeh', 12000, 'Sayur santan campur, khas Nusantara', 'Makanan Utama'],
    ['Tempe Bacem', 6000, 'Tempe manis gurih, dimasak bumbu kecap', 'Pembuka'],
    ['Ayam Goreng Kremes', 20000, 'Ayam goreng kering bertabur kremesan renyah', 'Makanan Utama'],
    ['Es Cendol', 9000, 'Cendol gula merah santan segar', 'Minuman'],
  ],
  Sunda: [
    ['Nasi Timbel Komplit', 24000, 'Nasi dibungkus daun pisang, ayam goreng, lalapan, sambal', 'Makanan Utama'],
    ['Pepes Ikan Mas', 23000, 'Ikan mas bumbu pepes dibungkus daun pisang', 'Makanan Utama'],
    ['Karedok', 13000, 'Sayuran mentah segar, bumbu kacang khas Sunda', 'Pembuka'],
    ['Sayur Asem', 9000, 'Sayur asam segar isi kacang panjang & jagung', 'Makanan Utama'],
    ['Es Kelapa Muda', 12000, 'Kelapa muda segar dengan sirup', 'Minuman'],
  ],
  Chinese: [
    ['Cap Cay Goreng', 20000, 'Tumisan sayuran segar campur bakso & udang', 'Makanan Utama'],
    ['Nasi Goreng Special', 22000, 'Nasi goreng telur, ayam, udang, acar', 'Makanan Utama'],
    ['Ayam Kung Pao', 27000, 'Ayam tumis pedas manis, kacang mete', 'Makanan Utama'],
    ['Fuyunghai', 18000, 'Telur dadar isi udang, saus asam manis', 'Makanan Utama'],
    ['Es Lemon Tea', 8000, 'Teh lemon dingin segar', 'Minuman'],
  ],
  Western: [
    ['Beef Steak Sirloin', 48000, 'Steak sirloin medium, kentang goreng, saus lada hitam', 'Makanan Utama'],
    ['Spaghetti Bolognese', 28000, 'Pasta saus daging cincang tomat', 'Makanan Utama'],
    ['Chicken Cordon Bleu', 32000, 'Dada ayam isi keju & smoked beef, telur tepung', 'Makanan Utama'],
    ['Caesar Salad', 22000, 'Salad ayam panggang, saus caesar, keju parmesan', 'Pembuka'],
    ['Soda Float', 15000, 'Soda dingin dengan es krim vanila', 'Minuman'],
  ],
  Seafood: [
    ['Kepiting Saus Padang', 85000, 'Kepiting segar ukuran besar, saus padang pedas manis', 'Makanan Utama'],
    ['Udang Bakar Madu', 65000, 'Udang segar bakar bumbu madu', 'Makanan Utama'],
    ['Cumi Goreng Tepung', 45000, 'Cumi renyah tepung crispy', 'Makanan Utama'],
    ['Ikan Bakar Kecap', 38000, 'Ikan kerapu bakar bumbu kecap manis', 'Makanan Utama'],
    ['Es Kelapa Muda', 12000, 'Kelapa muda segar dengan sirup', 'Minuman'],
  ],
  Minuman: [
    ['Es Kopi Susu Gula Aren', 18000, 'Kopi robusta lokal, gula aren asli', 'Minuman'],
    ['Thai Tea', 16000, 'Teh thai creamy dengan susu', 'Minuman'],
    ['Jus Alpukat', 15000, 'Jus alpukat kental dengan susu coklat', 'Minuman'],
    ['Matcha Latte', 19000, 'Matcha premium dengan susu segar', 'Minuman'],
    ['Air Mineral', 5000, 'Air mineral botol dingin', 'Minuman'],
  ],
  'Bakso & Mie': [
    ['Bakso Urat Spesial', 18000, 'Bakso urat besar isi 5, lengkap dengan mie & pangsit', 'Makanan Utama'],
    ['Mie Ayam Bakso', 17000, 'Mie ayam dengan tambahan bakso & pangsit', 'Makanan Utama'],
    ['Bakso Beranak', 22000, 'Bakso besar isi bakso-bakso kecil di dalamnya', 'Makanan Utama'],
    ['Pangsit Goreng', 10000, 'Pangsit goreng renyah isi ayam', 'Pembuka'],
    ['Es Jeruk', 6000, 'Jeruk peras segar dengan es', 'Minuman'],
  ],
  Sate: [
    ['Sate Ayam (10 tusuk)', 22000, 'Sate ayam bumbu kecap, bakar arang', 'Makanan Utama'],
    ['Sate Kambing (10 tusuk)', 35000, 'Sate kambing muda bumbu garam merica', 'Makanan Utama'],
    ['Sate Klathak', 30000, 'Sate kambing ditusuk jeruji besi, khas Jogja', 'Makanan Utama'],
    ['Gulai Kambing', 25000, 'Gulai kambing kuah santan rempah', 'Makanan Utama'],
    ['Teh Hangat', 4000, 'Teh tawar/manis hangat', 'Minuman'],
  ],
  Ayam: [
    ['Ayam Geprek Sambal Bawang', 18000, 'Ayam goreng tepung digeprek, sambal bawang pedas', 'Makanan Utama'],
    ['Ayam Bakar Madu', 22000, 'Ayam bakar bumbu madu manis gurih', 'Makanan Utama'],
    ['Ayam Penyet', 19000, 'Ayam goreng penyet, sambal terasi', 'Makanan Utama'],
    ['Tahu Tempe Penyet', 8000, 'Tahu tempe goreng penyet sambal', 'Pembuka'],
    ['Es Teh Manis', 5000, 'Teh manis dingin segar', 'Minuman'],
  ],
  'Sehat & Diet': [
    ['Caesar Salad Chicken', 38000, 'Salad ayam panggang, saus caesar rendah kalori', 'Makanan Utama'],
    ['Buddha Bowl', 42000, 'Quinoa, alpukat, telur rebus, sayuran panggang', 'Makanan Utama'],
    ['Smoothie Bowl Buah Naga', 28000, 'Smoothie bowl topping granola & buah segar', 'Makanan Utama'],
    ['Overnight Oats', 25000, 'Oat rendam susu almond, topping buah', 'Pembuka'],
    ['Green Smoothie', 22000, 'Smoothie sayuran hijau & buah', 'Minuman'],
  ],
  Pizza: [
    ['Pizza Margherita', 55000, 'Saus tomat, mozzarella, basil segar', 'Makanan Utama'],
    ['Pizza Pepperoni', 65000, 'Pizza topping pepperoni melimpah', 'Makanan Utama'],
    ['Pizza BBQ Chicken', 68000, 'Pizza ayam BBQ dengan saus barbeque', 'Makanan Utama'],
    ['Garlic Bread', 20000, 'Roti bawang putih panggang keju', 'Pembuka'],
    ['Soda Float', 15000, 'Soda dingin dengan es krim vanila', 'Minuman'],
  ],
  Dessert: [
    ['Cheesecake Slice', 25000, 'Cheesecake lembut topping berry', 'Makanan Utama'],
    ['Brownies Lava', 22000, 'Brownies coklat lumer di tengah', 'Makanan Utama'],
    ['Es Krim Sundae', 18000, 'Es krim dengan topping saus & kacang', 'Makanan Utama'],
    ['Pancake Madu', 20000, 'Pancake lembut dengan madu & butter', 'Makanan Utama'],
    ['Kopi Hitam', 10000, 'Kopi hitam tubruk lokal', 'Minuman'],
  ],
}

// --- Data dasar 50 restoran: [nama, kategori, area/kecamatan, priceLevel] ---
const RESTAURANT_SEEDS = [
  ['Warung Nasi Padang Sederhana', 'Padang', 'Rajabasa', 'sedang'],
  ['RM Padang Sari Bundo', 'Padang', 'Kedaton', 'sedang'],
  ['Nasi Padang Pak Datuk', 'Padang', 'Labuhan Ratu', 'murah'],
  ['RM Minang Jaya', 'Padang', 'Sukarame', 'sedang'],
  ['Gudeg Bu Slamet', 'Nusantara', 'Rajabasa', 'murah'],
  ['Warung Nusantara Mbok Darmi', 'Nusantara', 'Kedaton', 'murah'],
  ['Pawon Nusantara', 'Nusantara', 'Way Halim', 'sedang'],
  ['Nasi Timbel Kang Asep', 'Sunda', 'Labuhan Ratu', 'sedang'],
  ['Saung Sunda Asri', 'Sunda', 'Sukarame', 'sedang'],
  ['Pondok Sunda Geulis', 'Sunda', 'Rajabasa', 'sedang'],
  ['Chinese Food 168', 'Chinese', 'Tanjung Karang', 'sedang'],
  ['Restoran Dragon Phoenix', 'Chinese', 'Kedaton', 'mahal'],
  ['Bamboo Chinese Kitchen', 'Chinese', 'Way Halim', 'sedang'],
  ['Western Grill House', 'Western', 'Tanjung Karang', 'mahal'],
  ['Steak & Co.', 'Western', 'Kedaton', 'mahal'],
  ['The Daily Bistro', 'Western', 'Sukarame', 'mahal'],
  ['Seafood 99 Bandar Lampung', 'Seafood', 'Teluk Betung', 'mahal'],
  ['Pondok Seafood Pak De', 'Seafood', 'Rajabasa', 'sedang'],
  ['Seafood Nelayan Jaya', 'Seafood', 'Teluk Betung', 'mahal'],
  ['Cumi Bakar 88', 'Seafood', 'Sukarame', 'sedang'],
  ['Kedai Kopi Senja', 'Minuman', 'Rajabasa', 'murah'],
  ['Thai Tea House', 'Minuman', 'Labuhan Ratu', 'murah'],
  ['Jus Buah Segar Mbak Ning', 'Minuman', 'Kedaton', 'murah'],
  ['Kopi Kenangan Manis', 'Minuman', 'Sukarame', 'murah'],
  ['Bakso Pak Kumis', 'Bakso & Mie', 'Rajabasa', 'murah'],
  ['Bakso Granat Mas Joko', 'Bakso & Mie', 'Labuhan Ratu', 'murah'],
  ['Mie Ayam Jakarta', 'Bakso & Mie', 'Kedaton', 'murah'],
  ['Bakso Solo Samrat', 'Bakso & Mie', 'Sukarame', 'murah'],
  ['Mie Ayam Bangka Asli', 'Bakso & Mie', 'Way Halim', 'murah'],
  ['Sate Klathak Pak Bowo', 'Sate', 'Rajabasa', 'sedang'],
  ['Sate Madura Pak Slamet', 'Sate', 'Kedaton', 'murah'],
  ['Sate Padang Ajo Ramon', 'Sate', 'Labuhan Ratu', 'sedang'],
  ['Sate Kambing Pak Haji', 'Sate', 'Sukarame', 'sedang'],
  ['Ayam Geprek Bensu Junior', 'Ayam', 'Rajabasa', 'murah'],
  ['Ayam Geprek Mantul', 'Ayam', 'Labuhan Ratu', 'murah'],
  ['Ayam Bakar Wong Solo', 'Ayam', 'Kedaton', 'sedang'],
  ['Ayam Penyet Surabaya', 'Ayam', 'Sukarame', 'murah'],
  ['Ayam Geprek Juara', 'Ayam', 'Way Halim', 'murah'],
  ['Salad Bar Sehat', 'Sehat & Diet', 'Tanjung Karang', 'mahal'],
  ['Green Bowl Healthy Food', 'Sehat & Diet', 'Kedaton', 'mahal'],
  ['Fit Kitchen Lampung', 'Sehat & Diet', 'Sukarame', 'mahal'],
  ['Pizza Corner', 'Pizza', 'Tanjung Karang', 'sedang'],
  ['Pizza Lovers Lampung', 'Pizza', 'Kedaton', 'sedang'],
  ['Sweet Corner Dessert', 'Dessert', 'Rajabasa', 'sedang'],
  ['Cake & Coffee Lampung', 'Dessert', 'Labuhan Ratu', 'sedang'],
  ['Pancake House', 'Dessert', 'Kedaton', 'sedang'],
  ['Warung Nasi Uduk Betawi', 'Nusantara', 'Way Halim', 'murah'],
  ['RM Sederhana Rajabasa', 'Padang', 'Rajabasa', 'murah'],
  ['Soto Ayam Lamongan', 'Nusantara', 'Sukarame', 'murah'],
  ['Bebek Goreng Pak Ndut', 'Ayam', 'Kedaton', 'sedang'],
]

const OPENING_HOURS_BY_CATEGORY = {
  Minuman: '07:00 - 22:00',
  Dessert: '10:00 - 22:00',
  Sate: '16:00 - 22:00',
  default: '08:00 - 21:00',
}

function buildRestaurants() {
  return RESTAURANT_SEEDS.map(([name, category, area, priceLevel], idx) => {
    const template = MENU_TEMPLATES[category] || MENU_TEMPLATES.Nusantara
    const seedSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    return {
      name,
      description: `${name} menyajikan menu khas ${category.toLowerCase()} dengan cita rasa autentik, lokasi mudah dijangkau dari area ${area}, dekat Politeknik Negeri Lampung.`,
      address: `Jl. ${area} No. ${(idx % 40) + 1}`,
      city: 'Bandar Lampung',
      category,
      priceLevel,
      image: photo(seedSlug, 800, 600),
      openingHours: OPENING_HOURS_BY_CATEGORY[category] || OPENING_HOURS_BY_CATEGORY.default,
      location: nearPolinela(idx + 1),
      menu: template.map(([menuName, price, description, menuCategory]) => ({
        name: menuName,
        price,
        description,
        category: menuCategory,
        image: photo(`${seedSlug}-${menuName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 600, 450),
      })),
    }
  })
}

async function seed() {
  await connectDB()

  if (process.argv.includes('--destroy')) {
    await Promise.all([
      User.deleteMany(),
      Restaurant.deleteMany(),
      MenuItem.deleteMany(),
      Review.deleteMany(),
      Order.deleteMany(),
    ])
    console.log('🗑️  Semua data berhasil dihapus.')
    return mongoose.disconnect()
  }

  // Bersihkan dulu supaya seed bisa dijalankan berkali-kali tanpa duplikat.
  await Promise.all([
    User.deleteMany(),
    Restaurant.deleteMany(),
    MenuItem.deleteMany(),
    Review.deleteMany(),
    Order.deleteMany(),
  ])

  const demoUser = await User.create({
    name: 'Admin Demo',
    email: 'demo@carimakan.com',
    password: 'password123',
    role: 'admin',
  })

  // User biasa untuk testing perbedaan akses RBAC
  await User.create({
    name: 'Pengguna Biasa',
    email: 'user@carimakan.com',
    password: 'password123',
    role: 'user',
  })

  const reviewComments = [
    'Tempatnya nyaman, makanannya enak dan porsinya pas. Recommended!',
    'Rasanya autentik, harga juga ramah di kantong mahasiswa.',
    'Pelayanannya cepat, makanan masih hangat saat sampai.',
    'Favorit anak kosan! Porsinya besar dan murah.',
    'Bumbu meresap, pasti balik lagi ke sini.',
  ]

  const restaurants = buildRestaurants()
  let count = 0

  for (const r of restaurants) {
    const { menu, ...restaurantData } = r
    const restaurant = await Restaurant.create({ ...restaurantData, owner: demoUser._id })

    await MenuItem.insertMany(menu.map((item) => ({ ...item, restaurant: restaurant._id })))

    // Satu review contoh per restoran, supaya rating tidak kosong saat demo.
    await Review.create({
      restaurant: restaurant._id,
      user: demoUser._id,
      rating: 4 + Math.round(Math.random() * 10) / 10, // antara 4.0 - 5.0
      comment: reviewComments[count % reviewComments.length],
    })

    count += 1
  }

  console.log(`✅ Seed selesai: ${restaurants.length} restoran di sekitar Polinela, masing-masing dengan menu & 1 review.`)
  console.log(`   Login admin → email: demo@carimakan.com / password: password123`)
  console.log(`   Login user  → email: user@carimakan.com / password: password123`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('❌ Gagal seeding:', err)
  process.exit(1)
})
