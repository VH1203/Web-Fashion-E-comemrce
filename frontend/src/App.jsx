import React from "react";
import AppRouter from "./router";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, logout } = useAuth();

  const handleSearch = (q) => {
    console.log("search:", q);
  };

  return (
    <div className="app-container">
      <Header
        user={user}
        cartCount={3}
        notifyCount={5}
        onLogout={logout}
        onSearch={handleSearch}
      />
      <AppRouter />
      <Footer />
    </div>
  );
}
