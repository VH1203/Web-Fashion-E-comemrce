// ManageProducts.jsx 
import React from "react";
import { useState, useEffect } from "react";
import {  productApi } from "../../services/productService";
const ManageProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
   useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productApi.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  if (loading) return <p className="text-center mt-5">Đang tải sản phẩm...</p>;
  return (
     <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-2">Quản lý sản phẩm </h1>
        <p className="text-muted small">
          Xem và quản lý toàn bộ sản phẩm trong kho
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="row g-4">
        {products.map((product) => (
          <div key={product._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
            <div className="card shadow-sm border-0 h-100">
              {/* Ảnh sản phẩm */}
              <div
                className="bg-light"
                style={{
                  height: "180px",
                  borderTopLeftRadius: "0.5rem",
                  borderTopRightRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.images?.[0] || "/no-image.jpg"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Thông tin sản phẩm */}
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold text-dark mb-2 text-truncate">
                  {product.name}
                </h5>
                <p className="text-muted small mb-3" style={{ minHeight: "40px" }}>
                  {product.description || "Không có mô tả"}
                </p>

                <div className="mt-auto">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Tồn kho</span>
                    <span className="fw-semibold text-dark">
                      {product.stock_total}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-primary">
                      {product.base_price.toLocaleString("vi-VN")}₫
                    </span>
                    <span
                      className={`badge ${
                        product.status === "active"
                          ? "bg-success-subtle text-success"
                          : product.status === "out_of_stock"
                          ? "bg-warning-subtle text-warning"
                          : "bg-secondary-subtle text-secondary"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
export default ManageProducts;      