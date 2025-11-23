import React, { useEffect, useState } from "react";
import { sellerCatalogService } from "../../../services/sellerCatalogService";
export default function AttributesPage(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>setRows(await sellerCatalogService.listAttributes()))(); },[]);
  return (
    <div>
      <h1>Thuộc tính</h1>
      <div className="card">
        <ul>{rows.map(r=> <li key={r._id}>{r.name}</li>)}</ul>
      </div>
    </div>
  );
}
