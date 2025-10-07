import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
} from "lucide-react";
import { message } from "antd";
import { voucherApi } from "../../services/voucherService";
import "../../assets/styles/Voucher.css";

message.config({
  top: 80,
  duration: 2,
  maxCount: 1,
});

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const ManageVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [mode, setMode] = useState(null); // 'create' | 'edit' | 'detail'

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch list
  const fetchVouchers = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await voucherApi.getAll(page, 10, keyword);
      setVouchers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      } catch (error) {
        console.error("❌ Error fetching vouchers:", error);
        message.error(error.response?.data?.message || "Failed to load vouchers!");
      } finally {
      setLoading(false);
    }
  };

  // Fetch detail
  const fetchVoucherDetail = async (id) => {
    try {
      const res = await voucherApi.getDetail(id);
      setSelectedVoucher(res);
      setMode("detail");
      setShowDetail(true);
    } catch (err) {
      console.error("Error fetching voucher detail:", err);
      message.error(err.response?.data?.message || "Failed to load voucher details!");
    }
  };

  useEffect(() => {
    fetchVouchers(page, searchTerm);
  }, [page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedVoucher(null);
    setMode(null);
  };

  const handleSave = async () => {
    try {
      const currentUserId = "0e64fafe-6d8f-4859-b989-63c02f560329"; // giả ID người đăng nhập
      const now = new Date().toISOString();

      const payload = {
        ...selectedVoucher,
        created_by: selectedVoucher.created_by || currentUserId,
        created_at: selectedVoucher.created_at || now,
        updated_by: currentUserId,
        updated_at: now,
        conditions: {
          min_order_value: Number(selectedVoucher.conditions.min_order_value),
          applicable_products:
            selectedVoucher.conditions.applicable_products || [],
          applicable_users: selectedVoucher.conditions.applicable_users || [],
        },
      };

      if (mode === "create") {
        await voucherApi.create(payload);
        message.success("Voucher created successfully!");
      } else if (mode === "edit") {
        await voucherApi.update(selectedVoucher._id, payload);
        message.success("Voucher updated successfully!");
      }

      handleCloseDetail();
      fetchVouchers(page, searchTerm);
    } catch (err) {
      console.error("Error saving voucher:", err);
      message.error(err.response?.data?.message || "Failed to save voucher!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await voucherApi.delete(id);
      message.success("🗑️ Voucher deleted successfully!");
      fetchVouchers(page, searchTerm);
    } catch (err) {
      console.error("❌ Error deleting voucher:", err);
      message.error(err.response?.data?.message || "Failed to delete voucher!");
    }
  };

  if (loading) return <p>Loading vouchers...</p>;

  return (
    <div className="voucher-page">
      <div className="order-list-container">
        <header className="order-list-header">
          <h1>Voucher Management</h1>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="header-actions">
            <input
              type="search"
              placeholder="Search vouchers..."
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={18} style={{ marginRight: "6px" }} />
            </button>
            <button
              type="button"
              className="create-btn"
              onClick={() => {
                setSelectedVoucher({
                  code: "",
                  discount_percent: 0,
                  max_uses: 1,
                  valid_from: "",
                  valid_to: "",
                  conditions: {
                    min_order_value: 0,
                    applicable_products: [],
                    applicable_users: [],
                  },
                });
                setMode("create");
                setShowDetail(true);
              }}
            >
              <Plus size={18} />
            </button>
          </form>
        </header>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount (%)</th>
                <th>Max Uses</th>
                <th>Used</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length > 0 ? (
                vouchers.map((voucher) => (
                  <tr key={voucher._id}>
                    <td>{voucher.code}</td>
                    <td>{voucher.discount_percent}</td>
                    <td>{voucher.max_uses}</td>
                    <td>{voucher.used_count}</td>
                    <td>{formatDate(voucher.valid_from)}</td>
                    <td>{formatDate(voucher.valid_to)}</td>
                    <td className="action-cell">
                      <button
                        className="action-btn view"
                        onClick={() => fetchVoucherDetail(voucher._id)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setMode("edit");
                          setShowDetail(true);
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(voucher._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No vouchers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>

          <span>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showDetail && selectedVoucher && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div
            className="voucher-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={handleCloseDetail}>
              <X size={20} />
            </button>

            <h2>
              {mode === "create"
                ? "Create Voucher"
                : mode === "edit"
                ? "Edit Voucher"
                : "Voucher Detail"}
            </h2>

            {mode === "detail" ? (
              <div className="voucher-detail-content">
                <p>
                  <strong>Code:</strong> {selectedVoucher.code}
                </p>
                <p>
                  <strong>Discount:</strong> {selectedVoucher.discount_percent}%
                </p>
                <p>
                  <strong>Max Uses:</strong> {selectedVoucher.max_uses}
                </p>
                <p>
                  <strong>Used:</strong> {selectedVoucher.used_count}
                </p>
                <p>
                  <strong>Valid From:</strong>{" "}
                  {formatDate(selectedVoucher.valid_from)}
                </p>
                <p>
                  <strong>Valid To:</strong>{" "}
                  {formatDate(selectedVoucher.valid_to)}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {formatDate(selectedVoucher.created_at)}
                </p>

                {selectedVoucher.conditions && (
                  <>
                    <h3>Conditions</h3>
                    <p>
                      <strong>Min Order Value:</strong>{" "}
                      {selectedVoucher.conditions.min_order_value?.toLocaleString()}{" "}
                      VND
                    </p>
                    <p>
                      <strong>Applicable Products:</strong>{" "}
                      {selectedVoucher.conditions.applicable_products?.length > 0
                        ? selectedVoucher.conditions.applicable_products.join(", ")
                        : "All"}
                    </p>
                    <p>
                      <strong>Applicable Users:</strong>{" "}
                      {selectedVoucher.conditions.applicable_users?.length > 0
                        ? selectedVoucher.conditions.applicable_users.join(", ")
                        : "All"}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="voucher-detail-content form">
                <label>
                  Code:
                  <input
                    type="text"
                    value={selectedVoucher.code}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        code: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Discount Percent:
                  <input
                    type="number"
                    value={selectedVoucher.discount_percent}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        discount_percent: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Max Uses:
                  <input
                    type="number"
                    value={selectedVoucher.max_uses}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        max_uses: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Valid From:
                  <input
                    type="date"
                    value={selectedVoucher.valid_from?.split("T")[0] || ""}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        valid_from: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Valid To:
                  <input
                    type="date"
                    value={selectedVoucher.valid_to?.split("T")[0] || ""}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        valid_to: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Min Order Value:
                  <input
                    type="number"
                    value={selectedVoucher.conditions.min_order_value}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        conditions: {
                          ...selectedVoucher.conditions,
                          min_order_value: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Applicable Products (comma-separated):
                  <input
                    type="text"
                    value={selectedVoucher.conditions.applicable_products.join(
                      ", "
                    )}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        conditions: {
                          ...selectedVoucher.conditions,
                          applicable_products: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Applicable Users (comma-separated):
                  <input
                    type="text"
                    value={selectedVoucher.conditions.applicable_users.join(
                      ", "
                    )}
                    onChange={(e) =>
                      setSelectedVoucher({
                        ...selectedVoucher,
                        conditions: {
                          ...selectedVoucher.conditions,
                          applicable_users: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        },
                      })
                    }
                  />
                </label>

                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageVoucher;
