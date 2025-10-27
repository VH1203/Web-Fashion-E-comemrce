const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

exports.getById = async (id) => {
  const u = await User.findById(id).lean();
  if (!u) return null;
  delete u.password_hash; delete u.refresh_token;
  return u;
};

exports.updateById = async (id, payload) => {
  if (payload.username !== undefined) {
    const e = new Error("username is immutable"); e.status = 400; throw e;
  }
  const allow = [
    "name","email","phone","gender","dob","avatar_url",
    "preferences.height","preferences.weight","preferences.size_top","preferences.size_bottom",
  ];
  const $set = {};
  for (const k of allow) {
    const p = k.split(".");
    if (p.length === 1 && payload[k] !== undefined) $set[k] = payload[k];
    if (p.length === 2 && payload[p[0]]?.[p[1]] !== undefined) $set[k] = payload[p[0]][p[1]];
  }
  const u = await User.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
  if (!u) return null;
  delete u.password_hash; delete u.refresh_token;
  return u;
};

exports.changePassword = async (id, current_password, new_password) => {
  if (!current_password || !new_password || new_password.length < 8) {
    const e = new Error("Invalid password payload"); e.status = 400; throw e;
  }
  const u = await User.findById(id);
  if (!u) return null;
  const ok = u.password_hash ? await bcrypt.compare(current_password, u.password_hash) : false;
  if (!ok) { const e = new Error("Current password is incorrect"); e.status = 400; throw e; }
  const salt = await bcrypt.genSalt(10);
  u.password_hash = await bcrypt.hash(new_password, salt);
  await u.save();
  return true;
};

exports.uploadAvatarFromBuffer = (id, buf) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: "dfs/users", resource_type: "image", overwrite: true },
    async (err, result) => {
      if (err) return reject(err);
      const u = await User.findByIdAndUpdate(id, { $set: { avatar_url: result.secure_url } }, { new: true }).lean();
      if (!u) return resolve(null);
      delete u.password_hash; delete u.refresh_token;
      resolve({ user: u, upload: { url: result.secure_url, public_id: result.public_id } });
    }
  );
  stream.end(buf);
});
