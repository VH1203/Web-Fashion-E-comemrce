const Banner = require("../models/Banner");
const Flashsale = require("../models/FlashSale");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// ----------------------
// Upload banner image helper
// ----------------------
exports.uploadBufferToCloudinary = (buf) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dfs/banners", resource_type: "image", overwrite: true },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buf);
  });
// ----------------------
// Lấy danh sách banners
// ----------------------
exports.getAllBanners = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, title, position, is_active } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { created_by: req.user._id };

    if (title) filter.title = { $regex: title, $options: "i" };
    if (position) filter.position = position;
    if (typeof is_active !== "undefined") filter.is_active = is_active === "true";

    const total = await Banner.countDocuments(filter);
    const banners = await Banner.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: banners,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ----------------------
// Lấy banner theo ID
// ----------------------
exports.getBannerById = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    if (banner.created_by.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Bạn không có quyền xem banner này" });

    res.json(banner);
  } catch (err) {
    next(err);
  }
};

// ----------------------
// Tạo banner
// ----------------------
exports.createBanner = async (req, res, next) => {
  try {
    const { title, link, position, start_date, end_date } = req.body;
    if (!title) return res.status(400).json({ message: "Thiếu tiêu đề banner" });

    let image_url = req.body.image_url || "";
    let image_public_id = req.body.image_public_id || null;

    if (req.file) {
      const uploadRes = await uploadBufferToCloudinary(req.file.buffer);
      image_url = uploadRes.url;
      image_public_id = uploadRes.public_id;
    }

    const now = new Date();
    const startDate = start_date ? new Date(start_date) : now;
    const endDate = end_date ? new Date(end_date) : null;
    if (endDate && endDate <= startDate)
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });

    const banner = new Banner({
      _id: `ban-${uuidv4()}`,
      title: title.trim(),
      image_url,
      image_public_id,
      link: link || "#",
      position: position || "homepage_top",
      is_active: true,
      start_date: startDate,
      end_date: endDate,
      created_by: req.user._id,
    });

    await banner.save();
    res.status(201).json({ message: "Tạo banner thành công", banner });
  } catch (err) {
    next(err);
  }
};

// ----------------------
// Cập nhật banner
// ----------------------
  exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    if (banner.created_by.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Bạn không có quyền sửa banner này" });

    const {
      title,
      link,
      position,
      is_active,
      start_date,
      end_date,
      image_url,
      image_public_id,
    } = req.body;

    let newImageUrl = banner.image_url;
    let imageChanged = false; // ✅ flag kiểm tra có đổi ảnh không

    // Nếu có file upload → xóa ảnh cũ, upload mới
    if (req.file) {
      if (banner.image_public_id) {
        await cloudinary.uploader.destroy(banner.image_public_id);
      }
      const uploadRes = await exports.uploadBufferToCloudinary(req.file.buffer);
      banner.image_url = uploadRes.url;
      banner.image_public_id = uploadRes.public_id;
      newImageUrl = uploadRes.url;
      imageChanged = true;
    } 
    // Nếu FE upload sẵn rồi gửi link mới
    else if (image_url && image_url !== banner.image_url) {
      if (banner.image_public_id) {
        await cloudinary.uploader.destroy(banner.image_public_id);
      }
      banner.image_url = image_url;
      banner.image_public_id = image_public_id || null;
      newImageUrl = image_url;
      imageChanged = true;
    }

    if (title) banner.title = title;
    if (link) banner.link = link;
    if (position) banner.position = position;
    if (typeof is_active !== "undefined") banner.is_active = is_active;
    if (start_date) banner.start_date = new Date(start_date);
    if (end_date) banner.end_date = new Date(end_date);

    if (banner.end_date && banner.end_date <= banner.start_date)
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });

    // ✅ Cập nhật flashsale NGAY TẠI ĐÂY
    if (imageChanged && newImageUrl) {
      const updateRes = await Flashsale.updateMany(
        { banner_id: banner._id },
        { $set: { banner_image: newImageUrl } }
      );
      console.log("✅ Flashsale updated:", updateRes.modifiedCount);
    }

    await banner.save();

    res.json({ message: "Cập nhật banner thành công", banner });
  } catch (err) {
    next(err);
  }
};

// ----------------------
// Xóa banner
// ----------------------
exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Không tìm thấy banner" });

    if (banner.created_by.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Bạn không có quyền xóa banner này" });

    if (banner.image_public_id) await cloudinary.uploader.destroy(banner.image_public_id);

    await banner.deleteOne();
    res.json({ message: "Xóa banner thành công" });
  } catch (err) {
    next(err);
  }
};

// ----------------------
// Middleware multer cho upload file
// ----------------------
exports.uploadBannerMiddleware = multer().single("image"); // field name: "image"
