import React, { useMemo, useState } from "react";
import { Box, Stack, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

export default function VariantMatrix({ onGenerate }) {
  const [opt1Name, setOpt1Name] = useState("Màu sắc");
  const [opt1Values, setOpt1Values] = useState("Cam,Đỏ");     // CSV
  const [opt2Name, setOpt2Name] = useState("Size (Quốc tế)");
  const [opt2Values, setOpt2Values] = useState("S,M,L");
  const [apply, setApply] = useState({ price: "", stock: "" });

  const o1 = useMemo(() => opt1Values.split(",").map(s=>s.trim()).filter(Boolean), [opt1Values]);
  const o2 = useMemo(() => opt2Values.split(",").map(s=>s.trim()).filter(Boolean), [opt2Values]);

  const grid = useMemo(() => {
    const rows = [];
    for (const v1 of o1) for (const v2 of o2) rows.push({
      attrs: { [opt1Name]: v1, [opt2Name]: v2 },
      sku: "", price: apply.price || "", stock: apply.stock || "",
    });
    return rows;
  }, [o1, o2, opt1Name, opt2Name, apply]);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 1 }}>
        <Stack direction={{ xs:"column", md:"row" }} spacing={1}>
          <TextField label="Phân loại 1" value={opt1Name} onChange={e=>setOpt1Name(e.target.value)} />
          <TextField label="Tùy chọn (phân tách bởi dấu ,)" value={opt1Values} onChange={e=>setOpt1Values(e.target.value)} />
        </Stack>
        <Stack direction={{ xs:"column", md:"row" }} spacing={1}>
          <TextField label="Phân loại 2" value={opt2Name} onChange={e=>setOpt2Name(e.target.value)} />
          <TextField label="Tùy chọn (phân tách bởi dấu ,)" value={opt2Values} onChange={e=>setOpt2Values(e.target.value)} />
        </Stack>
        <Stack direction={{ xs:"column", md:"row" }} spacing={1}>
          <TextField label="Áp dụng Giá cho tất cả" value={apply.price} onChange={e=>setApply(a=>({ ...a, price: e.target.value }))} />
          <TextField label="Áp dụng Tồn kho cho tất cả" value={apply.stock} onChange={e=>setApply(a=>({ ...a, stock: e.target.value }))} />
          <Button variant="contained" onClick={() => onGenerate?.(grid.map(r => ({
            sku: r.sku,
            price: Number(r.price||0),
            stock: Number(r.stock||0),
            variant_attributes: r.attrs
          })))}>Tạo biến thể</Button>
        </Stack>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{opt1Name}</TableCell>
            <TableCell>{opt2Name}</TableCell>
            <TableCell>* Giá</TableCell>
            <TableCell>* Tồn kho</TableCell>
            <TableCell>SKU</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grid.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.attrs[opt1Name]}</TableCell>
              <TableCell>{r.attrs[opt2Name]}</TableCell>
              <TableCell>{apply.price || "-"}</TableCell>
              <TableCell>{apply.stock || "-"}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
