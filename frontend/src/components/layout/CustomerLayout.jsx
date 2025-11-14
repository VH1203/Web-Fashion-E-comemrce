import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function CustomerLayout() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "calc(100vh - 80px - 340px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
