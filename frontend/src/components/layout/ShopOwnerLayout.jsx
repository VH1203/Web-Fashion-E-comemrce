import React from "react";
import Sidebar from "../sidebar/Sidebar";
import HeaderShop from "./HeaderShop";
import { Outlet } from "react-router-dom";
import "../../assets/styles/ShopOwnerLayout.css";

const ShopOwnerLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>

      <div className="admin-main">
        <HeaderShop />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ShopOwnerLayout;