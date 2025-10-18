require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Category = require("../backend/src/models/Category");
const Product = require("../backend/src/models/Product");
const Brand = require("../backend/src/models/Brand");

(async () => {
  try {
    // ✅ Kết nối đúng DB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || "WDP",
      autoIndex: true,
    });

    console.log("✅ Connected to MongoDB");
    console.log("📂 Current DB:", mongoose.connection.name);

    // 🧹 Xóa dữ liệu cũ
    await Promise.all([
      Brand.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("🧹 Cleared brands, categories, and products collections");

    // 1️⃣ Tạo brand mẫu
   const brands = [
  {
    _id: `brand-${uuidv4()}`,
    name: "Nike",
    slug: "nike",
    country: "USA",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    description: "Thương hiệu thể thao toàn cầu nổi tiếng với thiết kế hiện đại và năng động.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Adidas",
    slug: "adidas",
    country: "Germany",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    description: "Hãng thể thao Đức nổi tiếng với ba sọc đặc trưng, phong cách trẻ trung và năng động.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Zara",
    slug: "zara",
    country: "Spain",
    gender: "women",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    description: "Thương hiệu thời trang nhanh hàng đầu thế giới, mang đến xu hướng mới nhất cho phái đẹp.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "H&M",
    slug: "hm",
    country: "Sweden",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    description: "H&M cung cấp thời trang phong phú, giá cả phải chăng cho cả nam, nữ và trẻ em.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Uniqlo",
    slug: "uniqlo",
    country: "Japan",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Uniqlo_logo_Japan.svg",
    description: "Thương hiệu Nhật Bản nổi tiếng với phong cách tối giản và chất lượng vượt trội.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Gucci",
    slug: "gucci",
    country: "Italy",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Gucci_Logo.svg",
    description: "Biểu tượng của thời trang xa xỉ Ý, kết hợp giữa cổ điển và hiện đại.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Levi’s",
    slug: "levis",
    country: "USA",
    gender: "men",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Levis_logo.svg",
    description: "Hãng quần jeans biểu tượng của Mỹ, phong cách bền bỉ và phóng khoáng.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Puma",
    slug: "puma",
    country: "Germany",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/en/f/fd/Puma_AG.svg",
    description: "Thương hiệu thể thao nổi tiếng với sự kết hợp giữa hiệu suất và thời trang.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Lacoste",
    slug: "lacoste",
    country: "France",
    gender: "men",
    logo_url: "https://upload.wikimedia.org/wikipedia/en/c/cd/Lacoste_logo.svg",
    description: "Thương hiệu Pháp mang phong cách thể thao thanh lịch với biểu tượng cá sấu đặc trưng.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Calvin Klein",
    slug: "calvin-klein",
    country: "USA",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Calvin_klein_logo.svg",
    description: "Thương hiệu tối giản và hiện đại, biểu tượng của phong cách gợi cảm và thanh lịch.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Tommy Hilfiger",
    slug: "tommy-hilfiger",
    country: "USA",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Tommy_Hilfiger_Logo.svg",
    description: "Mang đậm phong cách cổ điển Mỹ, pha chút trẻ trung và năng động.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Converse",
    slug: "converse",
    country: "USA",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Converse_logo.svg",
    description: "Biểu tượng thời trang đường phố, nổi tiếng với giày và trang phục casual.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Balenciaga",
    slug: "balenciaga",
    country: "Spain",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Balenciaga_logo.svg",
    description: "Thương hiệu cao cấp với phong cách avant-garde táo bạo và độc đáo.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Hermès",
    slug: "hermes",
    country: "France",
    gender: "women",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Hermes_logo.svg",
    description: "Thời trang xa xỉ, tinh tế với chất lượng đỉnh cao từ nước Pháp.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Chanel",
    slug: "chanel",
    country: "France",
    gender: "women",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Chanel_logo_interlocking_cs.svg",
    description: "Thương hiệu thời trang cao cấp, biểu tượng của sự thanh lịch và đẳng cấp.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Burberry",
    slug: "burberry",
    country: "UK",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Burberry_Logo.svg",
    description: "Thương hiệu Anh Quốc cổ điển với họa tiết kẻ caro đặc trưng.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Under Armour",
    slug: "under-armour",
    country: "USA",
    gender: "men",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Under_armour_logo.svg",
    description: "Thương hiệu thể thao Mỹ với công nghệ vải tiên tiến dành cho hiệu suất cao.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Off-White",
    slug: "off-white",
    country: "Italy",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Off-White_logo.svg",
    description: "Phong cách streetwear cao cấp kết hợp giữa thời trang và nghệ thuật đường phố.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "Dior",
    slug: "dior",
    country: "France",
    gender: "women",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Dior_Logo.svg",
    description: "Thương hiệu thời trang xa xỉ của Pháp, nổi tiếng với sự sang trọng và tinh tế.",
  },
  {
    _id: `brand-${uuidv4()}`,
    name: "The North Face",
    slug: "the-north-face",
    country: "USA",
    gender: "unisex",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/28/The_North_Face_logo.svg",
    description: "Thương hiệu thời trang outdoor chuyên về đồ leo núi và du lịch.",
  },
];

    await Brand.insertMany(brands);
    console.log(`✅ Inserted ${brands.length} brands`);

    // 2️⃣ Category tree nhiều cấp (Women + Men)
    // --- WOMEN ---
    const catWomen = `cat-${uuidv4()}`;
    const catWomenTop = `cat-${uuidv4()}`;
    const catWomenTopShirt = `cat-${uuidv4()}`;
    const catWomenTopTshirt = `cat-${uuidv4()}`;
    const catWomenDress = `cat-${uuidv4()}`;
    const catWomenDressMini = `cat-${uuidv4()}`;
    const catWomenDressMaxi = `cat-${uuidv4()}`;
    const catWomenAccessory = `cat-${uuidv4()}`;

    const womenCategories = [
      { _id: catWomen, name: "Nữ", slug: "women", level: 0 },
      { _id: catWomenTop, name: "Áo Nữ", slug: "women-top", parent_id: catWomen, level: 1 },
      { _id: catWomenTopShirt, name: "Áo sơ mi Nữ", slug: "women-top-shirt", parent_id: catWomenTop, level: 2 },
      { _id: catWomenTopTshirt, name: "Áo thun Nữ", slug: "women-top-tshirt", parent_id: catWomenTop, level: 2 },
      { _id: catWomenDress, name: "Váy Nữ", slug: "women-dress", parent_id: catWomen, level: 1 },
      { _id: catWomenDressMini, name: "Váy ngắn Nữ", slug: "women-dress-mini", parent_id: catWomenDress, level: 2 },
      { _id: catWomenDressMaxi, name: "Váy Maxi Nữ", slug: "women-dress-maxi", parent_id: catWomenDress, level: 2 },
      { _id: catWomenAccessory, name: "Phụ kiện Nữ", slug: "women-accessory", parent_id: catWomen, level: 1 },
    ];

    // --- MEN ---
    const catMen = `cat-${uuidv4()}`;
    const catMenTop = `cat-${uuidv4()}`;
    const catMenTopShirt = `cat-${uuidv4()}`;
    const catMenTopTshirt = `cat-${uuidv4()}`;
    const catMenBottom = `cat-${uuidv4()}`;
    const catMenBottomJeans = `cat-${uuidv4()}`;
    const catMenBottomShorts = `cat-${uuidv4()}`;
    const catMenAccessory = `cat-${uuidv4()}`;

    const menCategories = [
      { _id: catMen, name: "Nam", slug: "men", level: 0 },
      { _id: catMenTop, name: "Áo Nam", slug: "men-top", parent_id: catMen, level: 1 },
      { _id: catMenTopShirt, name: "Áo sơ mi Nam", slug: "men-top-shirt", parent_id: catMenTop, level: 2 },
      { _id: catMenTopTshirt, name: "Áo thun Nam", slug: "men-top-tshirt", parent_id: catMenTop, level: 2 },
      { _id: catMenBottom, name: "Quần Nam", slug: "men-bottom", parent_id: catMen, level: 1 },
      { _id: catMenBottomJeans, name: "Quần jeans Nam", slug: "men-bottom-jeans", parent_id: catMenBottom, level: 2 },
      { _id: catMenBottomShorts, name: "Quần short Nam", slug: "men-bottom-shorts", parent_id: catMenBottom, level: 2 },
      { _id: catMenAccessory, name: "Phụ kiện Nam", slug: "men-accessory", parent_id: catMen, level: 1 },
    ];

    const categories = [...womenCategories, ...menCategories];
    await Category.insertMany(categories);
    console.log(`✅ Inserted ${categories.length} categories`);

    // 3️⃣ Products (Women + Men)
    const womenProducts = [
      {
        _id: `prod-${uuidv4()}`,
        name: "Áo thun cotton nữ 1",
        base_price: 299000,
        category_id: catWomenTopTshirt,
        brand_id: brands[0]._id,
        images: ["https://via.placeholder.com/300x400.png?text=AoThunNu1"],
        sold_count: 28,
        tags: ["new", "women", "tshirt"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Áo sơ mi nữ 2",
        base_price: 329000,
        category_id: catWomenTopShirt,
        brand_id: brands[2]._id,
        images: ["https://via.placeholder.com/300x400.png?text=AoSoMiNu2"],
        sold_count: 20,
        tags: ["shirt", "women"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Váy maxi hoa nữ 3",
        base_price: 499000,
        category_id: catWomenDressMaxi,
        brand_id: brands[2]._id,
        images: ["https://via.placeholder.com/300x400.png?text=VayMaxiNu3"],
        sold_count: 31,
        tags: ["dress", "maxi", "women"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Váy ngắn nữ 4",
        base_price: 459000,
        category_id: catWomenDressMini,
        brand_id: brands[2]._id,
        images: ["https://via.placeholder.com/300x400.png?text=VayNganNu4"],
        sold_count: 25,
        tags: ["dress", "mini", "women"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Túi xách da nữ 5",
        base_price: 699000,
        category_id: catWomenAccessory,
        brand_id: brands[2]._id,
        images: ["https://via.placeholder.com/300x400.png?text=TuiXachNu5"],
        sold_count: 12,
        tags: ["bag", "accessory", "women"],
      },
    ];

    const menProducts = [
      {
        _id: `prod-${uuidv4()}`,
        name: "Áo thun cotton nam 1",
        base_price: 299000,
        category_id: catMenTopTshirt,
        brand_id: brands[0]._id,
        images: ["https://via.placeholder.com/300x400.png?text=AoThunNam1"],
        sold_count: 35,
        tags: ["men", "tshirt"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Áo sơ mi nam 2",
        base_price: 359000,
        category_id: catMenTopShirt,
        brand_id: brands[1]._id,
        images: ["https://via.placeholder.com/300x400.png?text=AoSoMiNam2"],
        sold_count: 18,
        tags: ["men", "shirt"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Quần jeans nam 3",
        base_price: 499000,
        category_id: catMenBottomJeans,
        brand_id: brands[0]._id,
        images: ["https://via.placeholder.com/300x400.png?text=QuanJeansNam3"],
        sold_count: 22,
        tags: ["men", "jeans"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Quần short nam 4",
        base_price: 329000,
        category_id: catMenBottomShorts,
        brand_id: brands[1]._id,
        images: ["https://via.placeholder.com/300x400.png?text=QuanShortNam4"],
        sold_count: 16,
        tags: ["men", "shorts"],
      },
      {
        _id: `prod-${uuidv4()}`,
        name: "Phụ kiện thể thao nam 5",
        base_price: 259000,
        category_id: catMenAccessory,
        brand_id: brands[0]._id,
        images: ["https://via.placeholder.com/300x400.png?text=PhuKienNam5"],
        sold_count: 10,
        tags: ["men", "accessory"],
      },
    ];

    const products = [...womenProducts, ...menProducts];
    await Product.insertMany(products);
    console.log(`✅ Inserted ${products.length} products`);

    console.log("🎉 Database seeding completed successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.connection.close();
  }
})();
