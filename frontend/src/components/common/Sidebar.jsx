import React from "react";
import {
  BarChart2,
  Activity,
  TrendingDown,
  DollarSign,
  Menu,
  X,
  ShoppingCart
} from "lucide-react";

const Sidebar = ({
  activeMenu,
  setActiveMenu,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const menuItems = [
    { id: "analytics", name: "Analytics", icon: BarChart2 },
    { id: "chart", name: "Chart", icon: Activity },
    { id: "forecast", name: "Forecast", icon: TrendingDown },
    { id: "revenue", name: "Revenue", icon: DollarSign },
   { id: "manage_products", name: "Manage Products", icon: ShoppingCart },
  ];

  return (
    <div
      className={`d-flex flex-column bg-white shadow ${
        sidebarOpen ? "p-3" : "p-2"
      }`}
      style={{
        width: sidebarOpen ? "16rem" : "5rem",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
        <div
          className={`d-flex align-items-center ${
            !sidebarOpen ? "justify-content-center w-100" : ""
          }`}
        >
          <div
            className="d-flex align-items-center justify-content-center text-white fw-bold fs-4 rounded"
            style={{
              width: "40px",
              height: "40px",
              background:
                "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(147,51,234,1) 100%)",
            }}
          >
            A
          </div>
          {sidebarOpen && (
            <span className="ms-3 fw-bold fs-5 text-dark">Shop</span>
          )}
        </div>

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-light btn-sm border-0"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="mb-4">
        <div className="d-flex align-items-center bg-light rounded px-2 py-2">
          <img
            src="https://ui-avatars.com/api/?name=Jaydon+Frankie&background=random"
            alt="User"
            className="rounded-circle"
            style={{ width: "40px", height: "40px" }}
          />
          {sidebarOpen && (
            <div className="ms-2">
              <p className="mb-0 fw-semibold text-dark small">Jaydon Frankie</p>
              <p className="mb-0 text-muted small">Hi, Welcome back</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-grow-1">
        <div className="d-flex flex-column gap-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`btn d-flex align-items-center text-start ${
                activeMenu === item.id
                  ? "btn-primary text-white"
                  : "btn-light text-secondary"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <span className="ms-3 fw-medium">{item.name}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Toggle button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn btn-light mt-auto"
        >
          <Menu size={20} />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
