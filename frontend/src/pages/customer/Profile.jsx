import React, { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import PersonalInfoForm from "../../components/PersonalInfoForm";
import AddressesManager from "../../components/AddressesManager";
import BankAccountsManager from "../../components/BankAccountsManager";
import ChangePasswordForm from "../../components/ChangePasswordForm";
import "../../assets/styles/Profile.css";

// === Icons
import LocationOnSharpIcon from '@mui/icons-material/LocationOnSharp';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PasswordIcon from '@mui/icons-material/Password';


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
          <li
            className={activeTab==="personal" ? "active" : ""}
            onClick={()=>setActiveTab("personal")}
          >
            <AccountBoxIcon className="pf-menu-icon" />
            Thông tin cá nhân
          </li>

          <li
            className={activeTab==="addresses" ? "active" : ""}
            onClick={()=>setActiveTab("addresses")}
          >
            <LocationOnSharpIcon className="pf-menu-icon" />
            Địa chỉ nhận hàng
          </li>

          <li
            className={activeTab==="banks" ? "active" : ""}
            onClick={()=>setActiveTab("banks")}
          >
            <AccountBalanceWalletRoundedIcon className="pf-menu-icon" />
            Tài khoản ngân hàng
          </li>

          <li
            className={activeTab==="password" ? "active" : ""}
            onClick={()=>setActiveTab("password")}
          >
            <PasswordIcon className="pf-menu-icon" />
            Đổi mật khẩu
          </li>
        </ul>
      </aside>

      <section className="pf-content">
        {activeTab==="personal" && <PersonalInfoForm me={me} onUpdated={setMe} />}
        {activeTab==="addresses" && <AddressesManager />}
        {activeTab==="banks" && <BankAccountsManager />}
        {activeTab==="password" && <ChangePasswordForm />}
      </section>
    </div>
  );
}
