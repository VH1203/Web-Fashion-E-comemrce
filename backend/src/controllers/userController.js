const User = require("../models/User");
const { comparePassword, hashPassword } = require("../utils/hash");
const { uploadBufferToCloudinary, deleteByPublicId } = require("../services/uploadService");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, gender, dob, address, preferences } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    Object.assign(user, { name, phone, gender, dob, address, preferences });
    await user.save();

    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    next(err);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh" });
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (user.avatar_public_id) await deleteByPublicId(user.avatar_public_id);

    const result = await uploadBufferToCloudinary(req.file.buffer, { folder: "dfs/avatars" });
    user.avatar_url = result.secure_url;
    user.avatar_public_id = result.public_id;
    await user.save();

    res.json({ message: "Cập nhật ảnh thành công", avatar_url: user.avatar_url });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (!user.password_hash)
      return res.status(400).json({ message: "Tài khoản Google chưa có mật khẩu" });

    const valid = await comparePassword(oldPassword, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    user.password_hash = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    next(err);
  }
};
