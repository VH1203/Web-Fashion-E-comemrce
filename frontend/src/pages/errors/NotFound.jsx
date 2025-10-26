import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>404</h1>
      <p>Không tìm thấy trang.</p>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}
