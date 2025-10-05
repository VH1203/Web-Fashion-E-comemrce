import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router";
import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRouter />
      <Footer />
    </BrowserRouter>
  );
}
