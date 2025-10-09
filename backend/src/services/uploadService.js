const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

/**
 * uploadBufferToCloudinary
 * @param {Buffer} buffer
 * @param {Object} opts { folder, public_id, overwrite, resource_type }
 */
async function uploadBufferToCloudinary(buffer, opts = {}) {
  const { folder = 'dfs/misc', public_id, overwrite = true, resource_type = 'image' } = opts;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id, overwrite, resource_type, transformation: [] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    bufferToStream(buffer).pipe(uploadStream);
  });
}

async function deleteByPublicId(publicId) {
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}

module.exports = { uploadBufferToCloudinary, deleteByPublicId };
