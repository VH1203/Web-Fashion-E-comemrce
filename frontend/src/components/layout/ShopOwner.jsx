import { useState } from "react";
import Sidebar from "../common/Sidebar";
import { Box } from "@mui/material";
import Footer from "./Footer";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const ShopOwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("analytics");

  return (
    <>
      <Header />
      <Box sx={{ display: "flex", bgcolor: "grey.100" }}>
        {/* Sidebar */}
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main content */}
        <Box
          sx={{ flexGrow: 1, overflow: "auto", height: "calc(100vh - 81px)" }}
        >
          <Box
            sx={{
              minHeight: "calc(100vh - 80px - 340px)",
              p: { xs: 2, md: 4 },
            }}
          >
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
};

export default ShopOwnerLayout;
