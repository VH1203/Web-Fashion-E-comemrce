import React from 'react';
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { icon: '⚙️', name: 'Dashboard', path: '/shop/dashboard' },
    { icon: '🎫', name: 'Voucher', path: '/shop/voucher' },
    { icon: '🖼️', name: 'Banner', path: '/shop/banner' },
    { icon: '🛍️', name: 'Products', path: '/shop/products' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">Menu | Shop</div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="icon">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
