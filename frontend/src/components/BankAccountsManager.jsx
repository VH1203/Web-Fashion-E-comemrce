import React, { useEffect, useState } from "react";
import { bankService } from "../services/bankService";

export default function BankAccountsManager() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    owner_name: "",
    branch: "",
    logo_url: "",
  });
  const [errors, setErrors] = useState({});

  const load = async () => {
    const { items } = await bankService.list();
    setItems(items || []);
  };
  useEffect(() => { load(); }, []);

  const maskAcc = (acc = "") => (acc ? `* ${acc.slice(-4)}` : "");

  const validate = (p) => {
    const e = {};
    if (!p.bank_name?.trim()) e.bank_name = "Vui lòng nhập tên ngân hàng.";
    if (!p.account_number?.trim()) e.account_number = "Vui lòng nhập số tài khoản.";
    if (!p.owner_name?.trim()) e.owner_name = "Vui lòng nhập họ và tên chủ tài khoản.";
    if (!p.branch?.trim()) e.branch = "Vui lòng nhập chi nhánh ngân hàng.";
    return e;
  };

  const onChange = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((s) => ({ ...s, [k]: undefined }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      await bankService.create(form);
      setMsg("Đã thêm tài khoản ngân hàng");
      setTimeout(() => setMsg(""), 1500);
      setForm({ bank_name: "", account_number: "", owner_name: "", branch: "", logo_url: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setMsg(err.message || "Có lỗi xảy ra");
    }
  };

  const onDelete = async (id) => {
    if (confirm("Xóa tài khoản này?")) { await bankService.remove(id); load(); }
  };

  const onSetDefault = async (id) => {
    if (typeof bankService.setDefault !== "function") return alert("Chưa có API setDefault.");
    await bankService.setDefault(id);
    await load();
  };

  return (
    <div className="pf-card bank-card">
      {/* Header */}
      <div className="bank-header">
        <h3 className="pf-card-title">Tài Khoản Ngân Hàng Của Tôi</h3>
        <button
          className="MuiButton-root MuiButton-contained bank-add-btn"
          onClick={() => setShowForm(true)}
        >
          + Thêm Ngân Hàng Liên Kết
        </button>
      </div>

      {/* List */}
      <ul className="bank-list">
        {items.map((it) => (
          <li key={it._id} className="bank-row">
            <div className="bank-left">
              <div className="bank-logo">
                {it.logo_url ? (
                  <img src={it.logo_url} alt={it.bank_name} />
                ) : (
                  <div className="bank-logo-fallback">{(it.bank_name || "?").slice(0, 1)}</div>
                )}
              </div>
              <div className="bank-info">
                <div className="bank-title">
                  <span className="bank-name">{it.bank_name}</span>
                  {it.verified && <span className="bank-verified">Đã kiểm tra</span>}
                  {it.is_default && <span className="bank-badge-default">MẶC ĐỊNH</span>}
                </div>
                <div className="bank-sub">
                  <div>Họ và Tên: <b>{it.owner_name}</b></div>
                  {it.branch && <div>Chi nhánh: <b>{it.branch}</b></div>}
                </div>
              </div>
            </div>

            <div className="bank-mid">
              <span className="bank-acc">{maskAcc(it.account_number)}</span>
            </div>

            {/* Actions: chỉ Xóa & Thiết lập mặc định, dạt lề phải */}
            <div className="bank-actions">
              <button className="chip danger" onClick={() => onDelete(it._id)}>Xóa</button>
              <button
                className="chip outline"
                disabled={!!it.is_default}
                onClick={() => onSetDefault(it._id)}
                title={it.is_default ? "Đã là mặc định" : "Thiết lập mặc định"}
              >
                Thiết Lập Mặc Định
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Popup thêm mới */}
      {showForm && (
        <div className="pf-modal" role="dialog" aria-modal="true">
          <div className="pf-dialog">
            <div className="pf-dialog-header">
              <div className="pf-dialog-title">Thêm Ngân Hàng Liên Kết</div>
              <button className="pf-dialog-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form className="bank-form" onSubmit={onSubmit} noValidate>
              <div className="bank-form-grid">
                <label>
                  Ngân hàng
                  <input
                    value={form.bank_name}
                    onChange={(e) => onChange("bank_name", e.target.value)}
                    aria-invalid={!!errors.bank_name}
                    autoFocus
                  />
                  {errors.bank_name && <span className="field-error">{errors.bank_name}</span>}
                </label>
                <label>
                  Số tài khoản
                  <input
                    value={form.account_number}
                    onChange={(e) => onChange("account_number", e.target.value)}
                    aria-invalid={!!errors.account_number}
                  />
                  {errors.account_number && <span className="field-error">{errors.account_number}</span>}
                </label>
                <label>
                  Họ và tên chủ TK
                  <input
                    value={form.owner_name}
                    onChange={(e) => onChange("owner_name", e.target.value)}
                    aria-invalid={!!errors.owner_name}
                  />
                  {errors.owner_name && <span className="field-error">{errors.owner_name}</span>}
                </label>
                <label>
                  Chi nhánh
                  <input
                    value={form.branch}
                    onChange={(e) => onChange("branch", e.target.value)}
                    aria-invalid={!!errors.branch}
                  />
                  {errors.branch && <span className="field-error">{errors.branch}</span>}
                </label>
                <label>
                  Logo URL (tuỳ chọn)
                  <input
                    value={form.logo_url}
                    onChange={(e) => onChange("logo_url", e.target.value)}
                  />
                </label>
              </div>

              <div className="pf-actions form-actions">
                <button className="MuiButton-root MuiButton-contained btn-primary" type="submit">
                  Thêm mới
                </button>
                <button
                  type="button"
                  className="MuiButton-root MuiButton-outlined btn-ghost"
                  onClick={() => { setShowForm(false); setErrors({}); }}
                >
                  Hủy
                </button>
                <span className="pf-msg">{msg}</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
