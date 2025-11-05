import React, { useState } from "react";
import { Box, Stack, Button, Paper, Typography } from "@mui/material";
import ProductTable from "../../components/ProductTable";
import ProductForm from "../../components/ProductForm";
import ImportDialog from "../../components/ImportDialog";
import VariantsDrawer from "../../components/VariantsDrawer";
import SellerSideNav from "../../components/layout/SellerRightPanel";
import { productAdminService as svc } from "../../services/productAdminService";

export default function ManageProducts() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPid, setDrawerPid] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

  const onEdit = (p) => { setEditing(p); setShowForm(true); };
  const onVariants = (p) => { setDrawerPid(p._id); setDrawerOpen(true); };

  const submit = async (data) => {
    if (editing) await svc.update(editing._id, data); else await svc.create(data);
    setShowForm(false); setEditing(null);
    window.location.reload();
  };

  return (
    <Box sx={{ p:2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
        <Typography variant="h5" fontWeight={800}>Quản lý sản phẩm</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={()=>setImportOpen(true)}>Import Excel</Button>
          <Button variant="contained" onClick={()=>{ setShowForm(true); setEditing(null); }}>Thêm sản phẩm</Button>
          <Button onClick={()=>setSideOpen(true)}>Menu bên trái</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p:2, borderRadius:3, boxShadow:2 }}>
        {!showForm ? <ProductTable svc={svc} onEdit={onEdit} onVariants={onVariants} />
                   : <ProductForm initial={editing} onSubmit={submit} svc={svc} />}
      </Paper>

      <ImportDialog open={importOpen} onClose={()=>setImportOpen(false)} svc={svc} onImported={()=>window.location.reload()} />
      <VariantsDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} productId={drawerPid} svc={svc} />
      <SellerSideNav open={sideOpen} onClose={()=>setSideOpen(false)} />
    </Box>
  );
}
