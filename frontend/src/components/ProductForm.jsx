import React, { useEffect, useState } from "react";
import { Stack, TextField, Button, MenuItem } from "@mui/material";
import MediaUploader from "./MediaUploader";
import CategoryCascader from "./CategoryCascader";

export default function ProductForm({ initial, onSubmit, svc }) {
  const [form, setForm] = useState(initial||{ name:"", price:"", category_id:"", brand_id:"", images:[], video:null });
  const [brands, setBrands] = useState([]);
  useEffect(() => { svc.listBrands().then(setBrands); }, []);

  const submit = () => onSubmit({ ...form, price: Number(form.price||0) });

  return (
    <Stack spacing={2}>
      <TextField label="Tên sản phẩm" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <TextField label="Giá" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
      <CategoryCascader value={form.category_id} onChange={(v)=>setForm({...form, category_id:v})} svc={svc} />
      <TextField select label="Brand" value={form.brand_id} onChange={e=>setForm({...form, brand_id:e.target.value})}>
        {brands.map(b=> <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
      </TextField>
      <MediaUploader images={form.images} setImages={(imgs)=>setForm({...form, images: imgs})}
                     video={form.video} setVideo={(v)=>setForm({...form, video: v})} svc={svc} />
      <Button variant="contained" onClick={submit}>Lưu</Button>
    </Stack>
  );
}
