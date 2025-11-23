import React, { useEffect, useState } from "react";
import { productService } from "../../../services/productService";

export default function LowStockPage(){
  const [rows, setRows] = useState([]);
  const [th, setTh] = useState(5);
  useEffect(()=>{ (async()=>setRows(await productService.lowStock(th)))(); },[th]);
  return (
    <div>
      <h1>Tồn kho thấp</h1>
      <div style={{marginBottom:8}}>
        Ngưỡng: <input type="number" value={th} onChange={e=>setTh(Number(e.target.value||5))} style={{width:80}}/>
      </div>
      <div className="card">
        <table width="100%">
          <thead><tr><th>SKU</th><th>Thuộc tính</th><th>Tồn</th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r._id}>
              <td>{r.sku}</td>
              <td>{Object.entries(r.variant_attributes||{}).map(([k,v])=>`${k}:${v}`).join(", ")}</td>
              <td>{r.stock}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
