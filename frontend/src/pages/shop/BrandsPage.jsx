import React, { useEffect, useState } from "react";
import { sellerCatalogService } from "../../../services/sellerCatalogService";
export default function BrandsPage(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>setRows(await sellerCatalogService.listBrands()))(); },[]);
  return (
    <div>
      <h1>Thương hiệu</h1>
      <div className="card">
        <ul>{rows.map(r=> <li key={r._id}>{r.name}</li>)}</ul>
      </div>
    </div>
  );
}
