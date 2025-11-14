import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        height: "calc(100vh - 80px - 340px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem" }}>404</h1>
      <p>Không tìm thấy trang.</p>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}
