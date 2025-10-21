import React, { useEffect, useState } from "react";
import "../../assets/styles/Profile.css";
import Toast from "../../components/common/Toast";
import { Password } from "primereact/password";
import { userApi } from "../../services/userService";
import { bankApi } from "../../services/bankService";
import { addressApi } from "../../services/addressService";
import { locationApi } from "../../services/locationService";
import { authApi } from "../../services/authService";
import { isValidPassword } from "../../utils/validators";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  // Password form
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({});

  // Profile, Address, Bank
  const [profileForm, setProfileForm] = useState({});
  const [addressForm, setAddressForm] = useState({});
  const [banks, setBanks] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

 useEffect(() => {
  (async () => {
    try {
      const prov = await locationApi.getProvinces();
      setProvinces(prov);
    } catch (err) {
      console.error("⚠️ Không thể tải danh sách tỉnh:", err);
    }

    const res = await userApi.getProfile();
    setUser(res);
    setProfileForm(res);
    setBanks(res.banks || []);
    setAddresses(res.addresses || []);
  })();
}, []);


  // ---------------- PROFILE ----------------
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateProfile(profileForm);
      setToast({ type: "success", message: "Cập nhật hồ sơ thành công!" });
      const updated = await userApi.getProfile();
      setUser(updated);
    } catch {
      setToast({ type: "error", message: "Lỗi khi cập nhật hồ sơ!" });
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await userApi.uploadAvatar(file);
      setToast({
        type: "success",
        message: "Cập nhật ảnh đại diện thành công!",
      });
      const updated = await userApi.getProfile();
      setUser(updated);
    } catch {
      setToast({ type: "error", message: "Không thể cập nhật ảnh đại diện!" });
    }
  };

  // ---------------- BANK ----------------
  const handleAddBank = async () => {
    const bank_name = prompt("Tên ngân hàng:");
    const owner_name = prompt("Tên chủ tài khoản:");
    const account_number = prompt("Số tài khoản:");
    if (!bank_name || !owner_name || !account_number) return;
    try {
      await bankApi.add({ bank_name, owner_name, account_number });
      setToast({ type: "success", message: "Thêm ngân hàng thành công!" });
      const updated = await userApi.getProfile();
      setBanks(updated.banks);
    } catch {
      setToast({ type: "error", message: "Không thể thêm ngân hàng!" });
    }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm("Xóa tài khoản ngân hàng này?")) return;
    try {
      await bankApi.delete(id);
      setToast({ type: "success", message: "Đã xóa ngân hàng!" });
      const updated = await userApi.getProfile();
      setBanks(updated.banks);
    } catch {
      setToast({ type: "error", message: "Không thể xóa ngân hàng!" });
    }
  };

const handleProvinceChange = async (e) => {
  const provinceName = e.target.value;
  setAddressForm({ ...addressForm, city: provinceName, ward: "" });
  const w = await locationApi.getWards(provinceName);
  setWards(w);
};



  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressApi.add(addressForm);
      setToast({ type: "success", message: "Thêm địa chỉ thành công!" });
      const updated = await userApi.getProfile();
      setAddresses(updated.addresses);
    } catch {
      setToast({ type: "error", message: "Không thể thêm địa chỉ!" });
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await addressApi.delete(id);
      setToast({ type: "success", message: "Đã xóa địa chỉ!" });
      const updated = await userApi.getProfile();
      setAddresses(updated.addresses);
    } catch {
      setToast({ type: "error", message: "Không thể xóa địa chỉ!" });
    }
  };

  // ---------------- PASSWORD ----------------
  const handleRequestOTP = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) throw new Error("Chưa đăng nhập");

      if (user.provider === "google" || !user.password_hash) {
  await authApi.setPasswordRequest(user.email);
} else {
  await authApi.forgotRequest({ identifier: user.email });
}


      setOtpSent(true);
      setToast({ type: "success", message: "Đã gửi OTP xác thực!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "Không gửi được OTP!",
      });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await authApi.setPasswordVerify({ identifier: user.email, otp });
      setOtpVerified(true);
      setToast({ type: "success", message: "OTP xác thực thành công!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.message || "OTP không hợp lệ hoặc hết hạn!",
      });
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (user.password_hash && !form.oldPassword)
      errors.oldPassword = "Vui lòng nhập mật khẩu cũ.";
    if (!isValidPassword(form.newPassword))
      errors.newPassword = "Mật khẩu không hợp lệ.";
    if (form.newPassword !== form.confirmPassword)
      errors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
    setError(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (user.provider === "google" || !user.password_hash) {
        await authApi.setPasswordVerify({
          identifier: user.email,
          otp,
          newPassword: form.newPassword,
        });
      } else {
        await authApi.forgotVerify({
          identifier: user.email,
          otp,
          newPassword: form.newPassword,
        });
      }

      setToast({
        type: "success",
        message: !user.password_hash
          ? "Tạo mật khẩu thành công!"
          : "Đổi mật khẩu thành công!",
      });

      // Reset
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      const updated = await userApi.getProfile();
      setUser(updated);
    } catch (err) {
      console.error("❌ handleSubmitPassword error:", err);
      setToast({
        type: "error",
        message: err.message || "Không thể cập nhật mật khẩu!",
      });
    }
  };

  if (!user) return <p>Đang tải...</p>;

  // ---------------- RENDER ----------------
  return (
    <div className="account-container">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <aside className="account-sidebar">
        <h2>Tài khoản của tôi</h2>
        <ul>
          {["profile", "bank", "address", "password"].map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "profile"
                ? "Hồ sơ"
                : tab === "bank"
                ? "Ngân hàng"
                : tab === "address"
                ? "Địa chỉ"
                : "Bảo mật"}
            </li>
          ))}
        </ul>
      </aside>

      <div className="account-content">
        {/* Hồ sơ */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <h3>Hồ sơ cá nhân</h3>
            <form onSubmit={handleProfileSave} className="profile-form">
              <label>Tên đăng nhập</label>
              <input value={profileForm.username || ""} disabled />
              <label>Họ và tên</label>
              <input
                name="name"
                value={profileForm.name || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
              />
              <label>Email</label>
              <input value={profileForm.email || ""} disabled />
              <label>Số điện thoại</label>
              <input
                name="phone"
                value={profileForm.phone || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
              />
              <label>Giới tính</label>
              <select
                name="gender"
                value={profileForm.gender || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, gender: e.target.value })
                }
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              <label>Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={profileForm.dob?.split("T")[0] || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, dob: e.target.value })
                }
              />
              <label>Địa chỉ</label>
              <input
                name="address"
                value={profileForm.address || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, address: e.target.value })
                }
              />
              <label>Sở thích / Thời trang ưa thích</label>
              <textarea
                name="preferences"
                rows="3"
                value={profileForm.preferences || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    preferences: e.target.value,
                  })
                }
              />

              <button type="submit">Lưu thay đổi</button>
            </form>
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
          </div>
        )}

        {/* Ngân hàng */}
        {activeTab === "bank" && (
          <div className="tab-content">
            <h3>Tài khoản ngân hàng</h3>
            <button onClick={handleAddBank}>+ Thêm ngân hàng</button>
            <ul>
              {banks.map((b) => (
                <li key={b._id}>
                  {b.bank_name} - {b.account_number} ({b.owner_name})
                  <button onClick={() => handleDeleteBank(b._id)}>Xóa</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Địa chỉ */}
       {/* Địa chỉ */}
{activeTab === "address" && (
  <div className="tab-content">
    <h3>Địa chỉ nhận hàng</h3>
    <form onSubmit={handleAddAddress}>
      <input
        placeholder="Họ tên"
        value={addressForm.name || ""}
        onChange={(e) =>
          setAddressForm({ ...addressForm, name: e.target.value })
        }
      />
      <input
        placeholder="Số điện thoại"
        value={addressForm.phone || ""}
        onChange={(e) =>
          setAddressForm({ ...addressForm, phone: e.target.value })
        }
      />

      {/* Tỉnh/Thành */}
      <select value={addressForm.city || ""} onChange={handleProvinceChange}>
        <option value="">Chọn tỉnh</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Xã/Phường */}
      <select
  value={addressForm.ward || ""}
  onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
  disabled={wards.length === 0}
>
  <option value="">
    {wards.length === 0 ? "Chọn tỉnh trước" : "Chọn xã/phường"}
  </option>
  {wards.map((w) => (
    <option key={w.id} value={w.name}>
      {w.name}
    </option>
  ))}
</select>


      <input
        placeholder="Địa chỉ chi tiết"
        value={addressForm.street || ""}
        onChange={(e) =>
          setAddressForm({ ...addressForm, street: e.target.value })
        }
      />
      <button type="submit">Lưu địa chỉ</button>
    </form>

    <ul>
      {addresses.map((a) => (
        <li key={a._id}>
          {a.name} - {a.phone} - {a.street}
          <button onClick={() => handleDeleteAddress(a._id)}>Xóa</button>
        </li>
      ))}
    </ul>
  </div>
)}


        {/* Bảo mật */}
        {activeTab === "password" && (
          <div className="tab-content">
            <h3>Bảo mật tài khoản</h3>
            {!otpSent ? (
              <button onClick={handleRequestOTP}>Gửi OTP xác thực</button>
            ) : !otpVerified ? (
              <form onSubmit={handleVerifyOTP}>
                <label>Nhập mã OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="submit">Xác thực OTP</button>
              </form>
            ) : (
              <form onSubmit={handleSubmitPassword} className="password-form">
                {user.password_hash && (
                  <div className="form-group">
                    <label>Mật khẩu cũ</label>
                    <Password
                      value={form.oldPassword}
                      onChange={(e) =>
                        setForm({ ...form, oldPassword: e.target.value })
                      }
                      toggleMask
                      feedback={false}
                      inputStyle={{ width: "100%" }}
                    />
                    {error.oldPassword && (
                      <p className="error-text">{error.oldPassword}</p>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <Password
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                    toggleMask
                    feedback
                    inputStyle={{ width: "100%" }}
                  />
                  {!isValidPassword(form.newPassword) && form.newPassword && (
                    <p className="error-text">Mật khẩu không đủ mạnh.</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Nhập lại mật khẩu mới</label>
                  <Password
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    toggleMask
                    feedback={false}
                    inputStyle={{ width: "100%" }}
                  />
                  {form.confirmPassword &&
                    form.confirmPassword !== form.newPassword && (
                      <p className="error-text">
                        Mật khẩu xác nhận không trùng khớp.
                      </p>
                    )}
                </div>
                <button type="submit">
                  {user.password_hash ? "Đổi mật khẩu" : "Tạo mật khẩu mới"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
