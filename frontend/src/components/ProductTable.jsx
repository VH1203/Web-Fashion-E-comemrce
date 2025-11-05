import React, { useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, TextField, Button, Pagination } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

export default function ProductTable({ svc, onEdit, onVariants }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const load = async (p=1) => {
    const r = await svc.list({ q, page: p, limit });
    setRows(r.items); setTotal(r.total); setPage(r.page);
  };
  useEffect(()=>{ load(); },[]);

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb:1 }}>
        <TextField placeholder="Tìm theo tên" size="small" value={q} onChange={e=>setQ(e.target.value)} />
        <Button variant="outlined" onClick={()=>load(1)}>Lọc</Button>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tên</TableCell>
            <TableCell>Giá</TableCell>
            <TableCell>Tồn</TableCell>
            <TableCell>Danh mục</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(p => (
            <TableRow key={p._id} hover>
              <TableCell>{p.name}</TableCell>
              <TableCell>{Number(p.price||0).toLocaleString("vi-VN")} ₫</TableCell>
              <TableCell>{p.stock_total||0}</TableCell>
              <TableCell>{p.category_name||"-"}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={()=>onVariants(p)}>Phiên bản</Button>
                  <IconButton color="primary" onClick={()=>onEdit(p)}><Edit/></IconButton>
                  <IconButton color="error" onClick={()=>svc.remove(p._id).then(()=>load(page))}><DeleteOutline/></IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack alignItems="center" sx={{ mt:1 }}>
        <Pagination count={Math.max(1, Math.ceil(total/limit))} page={page} onChange={(_,v)=>{ setPage(v); load(v); }} />
      </Stack>
    </>
  );
}
