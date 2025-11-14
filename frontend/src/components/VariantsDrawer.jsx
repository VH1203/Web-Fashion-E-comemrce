import React, { useEffect, useState } from "react";
import { Drawer, Stack, TextField, Button, IconButton, Divider, Typography } from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import VariantMatrix from "./VariantMatrix";

export default function VariantsDrawer({ open, onClose, productId, svc }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ sku: "", price: "", stock: "", variant_attributes: { size: "", color: "" } });

  useEffect(() => { if (open && productId) svc.listVariants(productId).then(setRows); }, [open, productId]);

  const add = async () => {
    const payload = { ...form, price: Number(form.price||0), stock: Number(form.stock||0) };
    const r = await svc.createVariant(productId, payload);
    setRows([r, ...rows]); setForm({ sku:"", price:"", stock:"", variant_attributes:{ size:"", color:"" } });
  };
  const upd = async (id, patch) => {
    const r = await svc.updateVariant(id, patch);
    setRows(rows.map(x => x._id === id ? r : x));
  };
  const del = async (id) => {
    await svc.removeVariant(id); setRows(rows.filter(x => x._id !== id));
  };

  const generateBulk = async (bulkRows) => {
    await svc.createVariantsBulk(productId, bulkRows);
    setRows(await svc.listVariants(productId));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 480, p:2 } }}>
      <Typography variant="h6" sx={{ mb:1, fontWeight:700 }}>Phiên bản</Typography>

      {/* Ma trận biến thể 2 trục */}
      <VariantMatrix onGenerate={generateBulk} />
      <Divider sx={{ my:2 }}/>

      {/* Thêm nhanh 1 dòng */}
      <Stack spacing={1} sx={{ mb:1 }}>
        <TextField label="SKU" size="small" value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})}/>
        <TextField label="Giá" size="small" value={form.price} onChange={e=>setForm({...form, price:e.target.value})}/>
        <TextField label="Tồn" size="small" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/>
        <Stack direction="row" spacing={1}>
          <TextField label="Size" size="small" value={form.variant_attributes.size} onChange={e=>setForm({...form, variant_attributes:{...form.variant_attributes, size:e.target.value}})} />
          <TextField label="Màu" size="small" value={form.variant_attributes.color} onChange={e=>setForm({...form, variant_attributes:{...form.variant_attributes, color:e.target.value}})} />
        </Stack>
        <Button variant="outlined" onClick={add}>Thêm 1 biến thể</Button>
      </Stack>
      <Divider sx={{ my:2 }}/>

      {/* Danh sách hiện có */}
      <Stack spacing={1}>
        {rows.map(v => (
          <Stack key={v._id} direction="row" spacing={1} alignItems="center">
            <TextField label="SKU" size="small" value={v.sku} onChange={e=>upd(v._id,{ sku:e.target.value })} />
            <TextField label="Giá" size="small" value={v.price} onChange={e=>upd(v._id,{ price:Number(e.target.value||0) })} />
            <TextField label="Tồn" size="small" value={v.stock} onChange={e=>upd(v._id,{ stock:Number(e.target.value||0) })} />
            <IconButton color="error" onClick={()=>del(v._id)}><DeleteOutline/></IconButton>
          </Stack>
        ))}
      </Stack>
    </Drawer>
  );
}
