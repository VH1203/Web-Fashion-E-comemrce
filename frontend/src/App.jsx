import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRouter from "./router";

export default function App() {
  return (
    <>
      <Header />
      <AppRouter />
      <Footer />
    </>
  );
}
