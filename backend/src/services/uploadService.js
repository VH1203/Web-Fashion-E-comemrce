const cloudinary = require("../config/cloudinary");

/**
 * Upload một file buffer lên Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Các tùy chọn cho Cloudinary, ví dụ: { folder: 'my-folder' }
 * @returns {Promise<object>} - Promise resolve với kết quả từ Cloudinary
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Xóa file trên Cloudinary bằng public_id
 * @param {string} public_id - Public ID của file cần xóa
 * @returns {Promise<object>} - Promise resolve với kết quả từ Cloudinary
 */
const deleteByPublicId = (public_id) => {
  return cloudinary.uploader.destroy(public_id);
};

module.exports = {
  uploadBufferToCloudinary,
  deleteByPublicId,
};
