import React, { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import PersonalInfoForm from "../../components/PersonalInfoForm";
import AddressesManager from "../../components/AddressesManager";
import BankAccountsManager from "../../components/BankAccountsManager";
import ChangePasswordForm from "../../components/ChangePasswordForm";
import "../../assets/styles/Profile.css";

export default function ProfilePage() {
  const [me, setMe] = useState();
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { user } = await userService.get();
        setMe(user);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="pf-wrap">Đang tải…</div>;
  if (error) return <div className="pf-wrap error">{error}</div>;

  return (
    <div className="pf-wrap">
      <aside className="pf-sidebar">
        <div className="pf-sidebar-title">Tài khoản của tôi</div>
        <ul className="pf-menu1">
          <li className={activeTab==="personal" ? "active" : ""} onClick={()=>setActiveTab("personal")}>Thông tin cá nhân</li>
          <li className={activeTab==="addresses" ? "active" : ""} onClick={()=>setActiveTab("addresses")}>Địa chỉ nhận hàng</li>
          <li className={activeTab==="banks" ? "active" : ""} onClick={()=>setActiveTab("banks")}>Tài khoản ngân hàng</li>
          <li className={activeTab==="password" ? "active" : ""} onClick={()=>setActiveTab("password")}>Đổi mật khẩu</li>
        </ul>
      </aside>

      <section className="pf-content">
        <div className="pf-tabs pf-menu2">
          <button className={activeTab==="personal" ? "active" : ""} onClick={()=>setActiveTab("personal")}>Thông tin cá nhân</button>
          <button className={activeTab==="addresses" ? "active" : ""} onClick={()=>setActiveTab("addresses")}>Địa chỉ</button>
          <button className={activeTab==="banks" ? "active" : ""} onClick={()=>setActiveTab("banks")}>Ngân hàng</button>
          <button className={activeTab==="password" ? "active" : ""} onClick={()=>setActiveTab("password")}>Mật khẩu</button>
        </div>

        {activeTab==="personal" && <PersonalInfoForm me={me} onUpdated={setMe} />}
        {activeTab==="addresses" && <AddressesManager />}
        {activeTab==="banks" && <BankAccountsManager />}
        {activeTab==="password" && <ChangePasswordForm />}
      </section>
    </div>
  );
}
