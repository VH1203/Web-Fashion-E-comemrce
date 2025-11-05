const cloudinary = require("../config/cloudinary");

function uploadBuffer(buffer, { folder, resource_type = "image", filename } = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      folder,
      resource_type,
      use_filename: !!filename,
      unique_filename: !filename,
      overwrite: false,
    };
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

exports.uploadImages = async (files = [], shopId = "common") => {
  const outs = [];
  for (const f of files) {
    const r = await uploadBuffer(f.buffer, { folder: `dfs/${shopId}/products`, resource_type: "image" });
    outs.push({ url: r.secure_url, public_id: r.public_id });
  }
  return outs;
};

exports.uploadVideo = async (file, shopId = "common") => {
  const r = await uploadBuffer(file.buffer, { folder: `dfs/${shopId}/products`, resource_type: "video" });
  return { url: r.secure_url, public_id: r.public_id, duration: r.duration };
};

exports.uploadBuffer = uploadBuffer;
