const mongoose = require("mongoose");
require("dotenv").config();

const Brand = require("./src/models/Brand");
const Category = require("./src/models/Category");
const Banner = require("./src/models/Banner");
const Product = require("./src/models/Product");
const User = require("./src/models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Thêm field logo_url, logo_public_id cho brands
    await Brand.updateMany(
      { $or: [{ logo_url: { $exists: false } }, { logo_public_id: { $exists: false } }] },
      { $set: { logo_url: "", logo_public_id: "" } }
    );

    // Thêm image_url, image_public_id cho categories
    await Category.updateMany(
      { $or: [{ image_url: { $exists: false } }, { image_public_id: { $exists: false } }] },
      { $set: { image_url: "", image_public_id: "" } }
    );

    // Thêm image_url, image_public_id cho banners
    await Banner.updateMany(
      { $or: [{ image_url: { $exists: false } }, { image_public_id: { $exists: false } }] },
      { $set: { image_url: "", image_public_id: "" } }
    );

    // Thêm images[] và image_public_ids[] cho products
    await Product.updateMany(
      { $or: [{ images: { $exists: false } }, { image_public_ids: { $exists: false } }] },
      { $set: { images: [], image_public_ids: [] } }
    );

    // Thêm avatar_url, avatar_public_id cho users
    await User.updateMany(
      { $or: [{ avatar_url: { $exists: false } }, { avatar_public_id: { $exists: false } }, { dob: { $exists: false } }] },
      { $set: { avatar_url: "", avatar_public_id: "", dob: null } }

    );

    console.log("✅ All collections updated with new image fields");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error updating schema:", err);
    process.exit(1);
  }
})();
