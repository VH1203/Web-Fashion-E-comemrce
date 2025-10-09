const Brand = require("./models/Brand");
const { uploadBufferToCloudinary } = require("./services/uploadService");
const fs = require("fs");
const path = require("path");

// ✅ Seed thương hiệu UNIQLO có logo
async function seedBrand() {
  try {
    // kiểm tra xem brand đã có chưa
    const existing = await Brand.findOne({ slug: "uniqlo" });
    if (existing) {
      console.log("⚙️ Brand Uniqlo đã tồn tại, bỏ qua seed");
      return;
    }

    // đọc file ảnh mẫu logo từ local (ví dụ: backend/src/assets/uniqlo-logo.png)
    const filePath = path.join(__dirname, "assets", "uniqlo-logo.png");
    const buffer = fs.readFileSync(filePath);

    // upload lên Cloudinary
    const result = await uploadBufferToCloudinary(buffer, {
      folder: "dfs/brands",
      public_id: "uniqlo-logo",
    });

    // tạo bản ghi brand trong DB
    await Brand.create({
      _id: "brand-uniqlo",
      name: "Uniqlo",
      slug: "uniqlo",
      country: "Japan",
      gender: "unisex",
      logo_url: result.secure_url,
      logo_public_id: result.public_id,
      created_at: new Date("2025-10-03T13:13:32.654Z"),
    });

    console.log("✅ Seed brand Uniqlo + logo thành công!");
  } catch (err) {
    console.error("❌ Lỗi seed brand Uniqlo:", err);
  }
}

module.exports = { seedBrand };
