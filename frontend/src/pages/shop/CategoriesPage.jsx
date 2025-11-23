import React, { useEffect, useState } from "react";
import { sellerCatalogService } from "../../../services/sellerCatalogService";
export default function CategoriesPage(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>setRows(await sellerCatalogService.listCategories()))(); },[]);
  return (
    <div>
      <h1>Danh mục</h1>
      <div className="card">
        <ul>{rows.map(r=> <li key={r._id}>{"—".repeat(r.level||0)} {r.name}</li>)}</ul>
      </div>
    </div>
  );
}
