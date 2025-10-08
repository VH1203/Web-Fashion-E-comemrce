import React from "react";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
