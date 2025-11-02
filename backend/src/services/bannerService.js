const Banner = require("../models/Banner");
const cloudinary = require("../config/cloudinary");

/**
 * Lấy banner theo ID
 */
exports.getById = async (id) => {
  const b = await Banner.findById(id).lean();
  if (!b) return null;
  return b;
};

/**
 * Lấy danh sách banner với phân trang và filter
 * filters có thể chứa: title, position, is_active
 */
exports.getAll = async ({ page = 1, limit = 10, filters = {} }) => {
  const query = {};

  if (filters.title) query.title = { $regex: filters.title, $options: "i" };
  if (filters.position) query.position = filters.position;
  if (filters.is_active !== undefined) query.is_active = filters.is_active;

  const total = await Banner.countDocuments(query);
  const banners = await Banner.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return { data: banners, page, limit, total };
};

/**
 * Cập nhật banner theo ID
 */
exports.updateById = async (id, payload) => {
  const allow = ["title", "position", "is_active", "link", "description"];
  const $set = {};
  for (const k of allow) {
    if (payload[k] !== undefined) $set[k] = payload[k];
  }
  const b = await Banner.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
  return b;
};

/**
 * Upload banner image từ buffer
 */
exports.uploadImageFromBuffer = (id, buf) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dfs/banners", resource_type: "image", overwrite: true },
      async (err, result) => {
        if (err) return reject(err);

        // Cập nhật banner với URL mới và public_id
        const banner = await Banner.findByIdAndUpdate(
          id,
          { $set: { image_url: result.secure_url, image_public_id: result.public_id } },
          { new: true }
        ).lean();

        if (!banner) return resolve(null);

        resolve({
          banner,
          upload: { url: result.secure_url, public_id: result.public_id },
        });
      }
    );

    // Gửi buffer trực tiếp
    stream.end(buf);
  });

/**
 * Tạo banner mới
 */
exports.create = async (data) => {
  const b = new Banner(data);
  await b.save();
  return b.toObject();
};

/**
 * Xóa banner
 */
exports.deleteById = async (id) => {
  const b = await Banner.findByIdAndDelete(id).lean();
  return b;
};
