import React, { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import EditProductModal from "../../components/common/EditProductModal";
import { Button, Modal } from "react-bootstrap";

const ManageProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // 🔹 Load sản phẩm ban đầu
  useEffect(() => {
    fetchProducts();
  }, []);

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

  // 🔹 Tìm kiếm realtime
  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim() === "") {
      fetchProducts();
      return;
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(async () => {
      const data = await productService.searchProducts(value);
      setProducts(data);
    }, 400);
    setTypingTimeout(timeout);
  };

  //  Mở modal chỉnh sửa
  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setShowModal(true);
  };

  //  Lưu cập nhật
  const handleSave = async (updatedProduct) => {
    try {
      await productService.updateProduct(updatedProduct._id, updatedProduct);
      alert("✅ Cập nhật sản phẩm thành công!");
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("❌ Cập nhật thất bại!");
    }
  };

  const handleDelete = (product) => {
    setDeletingProduct({ ...product });
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(deletingProduct._id);
      alert(" Xóa sản phẩm thành công!");
      setShowDeleteModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert(" Xóa thất bại!");
    }
  };

  if (loading) return <p className="text-center mt-5">Đang tải sản phẩm...</p>;

  return (
    <div className="container py-4">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h1 className="h3 fw-bold text-dark mb-2">📦 Quản lý sản phẩm</h1>
          <p className="text-muted small mb-0">
            Xem, tìm kiếm và quản lý toàn bộ sản phẩm trong kho
          </p>
        </div>

        {/* 🔹 Thanh tìm kiếm */}
        <div className="position-relative" style={{ minWidth: "280px" }}>
          <input
            type="text"
            className="form-control shadow-sm rounded-pill ps-4 pe-5"
            placeholder=" Tìm kiếm sản phẩm..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
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

      {/* 🔹 Bảng sản phẩm */}
      {products.length === 0 ? (
        <p className="text-center text-muted mt-5">
          Không tìm thấy sản phẩm phù hợp
        </p>
      ) : (
        <div className="table-responsive shadow-sm rounded-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Ảnh</th>
                <th scope="col">Tên sản phẩm</th>
                <th scope="col">Giá</th>
                <th scope="col">Tồn kho</th>
                <th scope="col">Trạng thái</th>
                <th scope="col" className="text-end">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.images?.[0] || "/no-image.jpg"}
                      alt={product.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </td>

                  <td style={{ maxWidth: "250px" }}>
                    <div className="fw-semibold text-dark text-truncate">
                      {product.name}
                    </div>
                    <small className="text-muted text-truncate d-block">
                      {product.description || "Không có mô tả"}
                    </small>
                  </td>

                  <td className="fw-semibold text-primary">
                    {product.base_price.toLocaleString("vi-VN")}₫
                  </td>

                  <td>{product.stock_total}</td>

                  <td>
                    <span
                      className={`badge ${
                        product.status === "active"
                          ? "bg-success"
                          : product.status === "out_of_stock"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(product)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Modal chỉnh sửa (file riêng) */}
      {showModal && editingProduct && (
        <EditProductModal
          show={showModal}
          onHide={() => setShowModal(false)}
          product={editingProduct}
          onSave={handleSave}
        />
      )}

      {/*  Modal xóa */}
      <Modal show ={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn xóa sản phẩm "<strong>{deletingProduct?.name}</strong>" không?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ManageProducts;
