import React, { useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import AnalyticsPage from "./AnalyticsPage";
import ChartPage from "./ChartPage";
import ForecastPage from "./ForecastPage";
import RevenuePage from "./RevenuePage";
import ManageProducts from "./ManageProducts";
import ManageVoucher from "./ManageVoucher";
import ManageBanner from "./ManageBanner";
import ManageFlashsale from "./ManageFlashsale.jsx";

const ShopOwner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("analytics");

  const renderPage = () => {
    switch (activeMenu) {
      case "analytics":
        return <AnalyticsPage />;
      case "chart":
        return <ChartPage />;
      case "forecast":
        return <ForecastPage />;
      case "revenue":
        return <RevenuePage />;
      case "manage_products":
        return<ManageProducts/>;
      case "manage_vouchers":
        return<ManageVoucher/>;
      case "manage_banners":
        return<ManageBanner/>;
      case "manage_flashsale":
        return<ManageFlashsale/>;
      default:
        return <AnalyticsPage />;
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="flex-grow-1 overflow-auto">
        <div className="p-4 p-md-5">{renderPage()}</div>
      </div>
    </div>
  );
};

export default ShopOwner;
