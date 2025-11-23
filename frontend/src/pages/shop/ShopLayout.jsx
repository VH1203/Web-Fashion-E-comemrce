import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./shop.css";

export default function ShopLayout() {
  const items = [
    { to: "/shop/dashboard", label: "Dashboard" },
    { to: "/shop/admin/products", label: "Sản phẩm" },
    { to: "/shop/admin/products/new", label: "Thêm sản phẩm" },
    { to: "/shop/inventory/low-stock", label: "Hết hàng" },
    { to: "/shop/catalog/categories", label: "Danh mục" },
    { to: "/shop/catalog/attributes", label: "Thuộc tính" },
    { to: "/shop/catalog/brands", label: "Thương hiệu" },
  ];
  return (
    <div className="shop-shell">
      <aside className="shop-side">
        <div className="shop-logo">DFS Seller</div>
        <nav>
          {items.map(it => (
            <NavLink key={it.to} to={it.to} className={({isActive}) => "nav-item" + (isActive ? " active":"")}>
              {it.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="shop-main">
        <Outlet />
      </main>
    </div>
  );
}
