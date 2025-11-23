import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { variantService } from "../../services/variantService";
import { productService } from "../../services/productService";

export default function VariantsPage() {
  const { id } = useParams(); // product id
  const [product, setProduct] = useState();
  const [rows, setRows] = useState([]);
  const [color, setColor] = useState("Đen,Trắng,Xanh");
  const [size, setSize] = useState("S,M,L,XL");

  async function load() {
    const p = await productService.get(id);
    setProduct(p);
    const v = await variantService.list(id);
    setRows(v);
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[id]);

  const onBulkCreate = async () => {
    const colors = color.split(",").map(s=>s.trim()).filter(Boolean);
    const sizes = size.split(",").map(s=>s.trim()).filter(Boolean);
    const rows = [];
    for (const c of colors) for (const s of sizes) {
      rows.push({
        sku: genSku(product?.slug, c, s),
        price: product?.base_price || 0,
        stock: 0,
        variant_attributes: { color: c, size: s }
      });
    }
    await variantService.bulk(id, rows);
    await load();
  };

  return (
    <div>
      <h1>Biến thể: {product?.name}</h1>

      <div className="card" style={{marginBottom:12}}>
        <div style={{display:"flex", gap:8}}>
          <input value={color} onChange={e=>setColor(e.target.value)} placeholder="Màu, cách nhau bằng dấu phẩy"/>
          <input value={size} onChange={e=>setSize(e.target.value)} placeholder="Size, cách nhau bằng dấu phẩy"/>
          <button onClick={onBulkCreate}>Tạo ma trận</button>
        </div>
      </div>

      <div className="card">
        <table width="100%">
          <thead><tr><th>SKU</th><th>Màu</th><th>Size</th><th>Giá</th><th>Tồn</th><th></th></tr></thead>
        <tbody>
          {rows.map(v => {
            const va = Object.fromEntries(Object.entries(v.variant_attributes||{}));
            return (
              <tr key={v._id}>
                <td>{v.sku}</td>
                <td>{va.color || "-"}</td>
                <td>{va.size || "-"}</td>
                <td>{fmt(v.price)}</td>
                <td>{v.stock}</td>
                <td><a className="btn" href="#" onClick={async(e)=>{e.preventDefault(); await variantService.remove(v._id); await load();}}>Xoá</a></td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
}
function genSku(slug, c, s){
  const a = (slug||"PROD").slice(0,6).toUpperCase();
  return `${a}-${(c||"").slice(0,1)}${(s||"").slice(0,2)}`.replace(/\s/g,"");
}
function fmt(n){ return Number(n||0).toLocaleString("vi-VN")+" ₫"; }
