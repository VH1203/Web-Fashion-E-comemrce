import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import Sidebar from "../sidebar/SidebarShopOwner";
import '../../assets/styles/ShopOwnerLayout.css';

export default function ShopLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>
      <div className="admin-main">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
