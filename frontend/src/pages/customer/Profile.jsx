import React, { useEffect, useState } from "react";
import { userApi } from "../../services/userService";
import "../../assets/styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
  userApi
    .getProfile()
    .then((res) => {
      console.log("✅ Profile API Response:", res);
      setUser(res);
    })
    .catch((err) => {
      console.error("❌ Profile API Error:", err);
    });
}, []);


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await userApi.updateProfile(form);
    alert(res.message);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await userApi.uploadAvatar(file);
    alert("Cập nhật ảnh đại diện thành công!");
    window.location.reload();
  };

  if (!user) return <p>Đang tải...</p>;

  return (
    <div className="profile-container">
      <h1>Hồ sơ cá nhân</h1>

      <div className="profile-avatar">
        <img
          src={user.avatar_url || "https://via.placeholder.com/150"}
          alt="avatar"
          className="avatar"
        />
        <label className="upload-btn">
          Đổi ảnh
          <input type="file" onChange={handleAvatarChange} hidden />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <label>Họ tên</label>
        <input name="name" defaultValue={user.name} onChange={handleChange} />

        <label>Email</label>
        <input defaultValue={user.email} disabled />

        <label>Số điện thoại</label>
        <input name="phone" defaultValue={user.phone} onChange={handleChange} />

        <label>Giới tính</label>
        <select name="gender" defaultValue={user.gender} onChange={handleChange}>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>

        <label>Địa chỉ</label>
        <input name="address" defaultValue={user.address} onChange={handleChange} />

        <button type="submit">Lưu thay đổi</button>
      </form>
    </div>
  );
}
