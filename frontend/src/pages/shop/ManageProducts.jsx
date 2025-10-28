import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";

const ManageProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  // 🔹 Load toàn bộ sản phẩm ban đầu
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Tìm kiếm realtime
  const handleSearch = (value) => {
    setQuery(value);

    // Nếu xoá hết -> load lại toàn bộ
    if (value.trim() === "") {
      productService.getAllProducts().then(setProducts);
      return;
    }

    // debounce tránh gọi API liên tục
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(async () => {
      const data = await productService.searchProducts(value);
      setProducts(data);
    }, 400);
    setTypingTimeout(timeout);
  };

  if (loading) return <p className="text-center mt-5">Đang tải sản phẩm...</p>;

  return (
    <div className="container py-4">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h1 className="h3 fw-bold text-dark mb-2">📦 Quản lý sản phẩm</h1>
          <p className="text-muted small mb-0">
            Xem và quản lý toàn bộ sản phẩm trong kho
          </p>
        </div>

        
        <div className="position-relative" style={{ minWidth: "280px" }}>
          <input
            type="text"
            className="form-control shadow-sm rounded-pill ps-4 pe-5"
            placeholder=" Tìm kiếm sản phẩm..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              border: "1px solid #dee2e6",
              transition: "all 0.2s ease",
            }}
          />
          {query && (
            <button
              className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted"
              onClick={() => handleSearch("")}
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Danh sách sản phẩm */}
      {products.length === 0 ? (
        <p className="text-center text-muted mt-5">
          Không tìm thấy sản phẩm phù hợp
        </p>
      ) : (
        <div className="row g-4">
          {products.map((product) => (
            <div key={product._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <div className="card shadow-sm border-0 h-100">
                {/* Ảnh */}
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
                      transition: "transform 0.3s ease",
                    }}
                    className="hover-zoom"
                  />
                </div>

                {/* Thông tin */}
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold text-dark mb-2 text-truncate">
                    {product.name}
                  </h5>
                  <p
                    className="text-muted small mb-3"
                    style={{ minHeight: "40px" }}
                  >
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
      )}
    </div>
  );
};

export default ManageProducts;
