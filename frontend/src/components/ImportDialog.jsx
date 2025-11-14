import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from "@mui/material";

export default function ImportDialog({ open, onClose, svc, onImported }) {
  const [file, setFile] = useState();
  const [busy, setBusy] = useState(false);

  const doImport = async () => {
    if (!file) return;
    setBusy(true);
    const res = await svc.importExcel(file);
    setBusy(false);
    onImported?.(res);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import sản phẩm từ Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant="body2">Cột bắt buộc: name, sku, price, stock. Tuỳ chọn: category, brand, images, attrs(json)</Typography>
          <Button component="label" variant="outlined">Chọn file Excel
            <input type="file" hidden accept=".xlsx,.xls" onChange={e=>setFile(e.target.files?.[0])}/>
          </Button>
          {file && <Typography variant="caption">{file.name}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={doImport} variant="contained" disabled={!file||busy}>{busy?"Đang import…":"Import"}</Button>
      </DialogActions>
    </Dialog>
  );
}
