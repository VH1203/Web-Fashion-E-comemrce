const User = require("../models/User");
const { comparePassword, hashPassword } = require("../utils/hash");
const { uploadBufferToCloudinary, deleteByPublicId } = require("../services/uploadService");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.has_password = !!user.password_hash;
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

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.address = address || user.address;
    user.preferences = preferences || user.preferences;

    await user.save();
    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    next(err);
  }
};

exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Không có file ảnh" });

    const user = await User.findById(req.user.sub); // ✅ Sửa chỗ này
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Xóa ảnh cũ nếu có
    if (user.avatar_public_id) await deleteByPublicId(user.avatar_public_id);

    // Upload ảnh mới
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "dfs/avatars",
    });

    user.avatar_url = result.secure_url;
    user.avatar_public_id = result.public_id;
    await user.save();

    res.json({ message: "Cập nhật ảnh đại diện thành công", avatar_url: user.avatar_url });
  } catch (err) {
    next(err);
  }
};
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (!user.password_hash) {
      return res.status(400).json({ message: "Tài khoản Google chưa có mật khẩu. Vui lòng đặt mật khẩu trước." });
    }

    const ok = await comparePassword(oldPassword, user.password_hash);
    if (!ok) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    user.password_hash = await hashPassword(newPassword);
    user.updated_at = new Date();
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    next(err);
  }
};
