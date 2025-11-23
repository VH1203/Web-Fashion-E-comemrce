import React, { useEffect, useState, useRef } from "react";
import { productService } from "../../services/productService"; // anh đã có
import { sellerCatalogService } from "../../services/sellerCatalogService";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function ManageProducts() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef(null);
  const [cats, setCats] = useState([]);

  async function load() {
    const r = await productService.list({ q, status, category_id: cat, page, limit: 20 });
    setRows(r.items || []);
    setTotal(r.total || 0);
  }
  useEffect(() => { (async()=>setCats(await sellerCatalogService.listCategories()))(); }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q,status,cat,page]);

  const onImport = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // gửi lên API importExcel (đã có ở BE)
    const form = new FormData();
    form.append("file", f);
    await productService.importExcel(form);
    await load();
  };

  const exportTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["name","slug","category_id","brand_id","base_price","status","tags","images"],
      ["Áo thun ", "ao-thun", "<cat-id>", "<brand-id>", 199000, "active", "thun,nam", "https://...;https://..."]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const buf = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    saveAs(new Blob([buf]), "dfs_product_template.xlsx");
  };

  return (
    <div>
      <h1>Quản lý sản phẩm</h1>

      <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:8}}>
        <input placeholder="Tìm theo tên..." value={q} onChange={e=>setQ(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="">-- Danh mục --</option>
          {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <a className="btn" href="/shop/admin/products/new">+ Thêm sản phẩm</a>

        <button onClick={exportTemplate}>Tải template Excel</button>
        <button onClick={()=>fileRef.current?.click()}>Import Excel</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={onImport} style={{display:"none"}} />
      </div>

      <div className="card">
        <table width="100%">
          <thead>
            <tr><th>Ảnh</th><th>Tên</th><th>Danh mục</th><th>Giá</th><th>Tồn</th><th>Trạng thái</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id}>
                <td style={{width:60}}>{r.images?.[0] ? <img alt="" src={r.images[0]} style={{width:48,height:48,objectFit:"cover",borderRadius:8}}/> : "-"}</td>
                <td>{r.name}</td>
                <td>{r.category_name || "-"}</td>
                <td>{fmt(r.base_price)}</td>
                <td>{r.stock_total}</td>
                <td>{r.status}</td>
                <td>
                  <a className="btn" href={`/shop/admin/products/${r._id}/edit`}>Sửa</a>{" "}
                  <a className="btn" href={`/shop/admin/products/${r._id}/variants`}>Biến thể</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{marginTop:8}}>
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <span style={{margin:"0 8px"}}>Trang {page}</span>
          <button disabled={rows.length<20} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      {/* Gợi ý thêm:
        - Bulk edit (trạng thái/giá/tồn)
        - Duplicate product
        - Bộ lọc theo brand/price range
        - Export list to Excel */}
    </div>
  );
}
function fmt(n){ return Number(n||0).toLocaleString("vi-VN")+" ₫"; }
