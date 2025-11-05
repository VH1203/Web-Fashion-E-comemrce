import React, { useEffect, useMemo, useState } from "react";
import { Stack, TextField, MenuItem } from "@mui/material";

export default function CategoryCascader({ value, onChange, svc }) {
  const [tree, setTree] = useState([]);
  const [lv1, setLv1] = useState(""); const [lv2, setLv2] = useState(""); const [lv3, setLv3] = useState("");

  useEffect(() => { svc.categoryTree().then(setTree); }, []);
  useEffect(() => { onChange?.(lv3 || lv2 || lv1 || ""); }, [lv1, lv2, lv3]);

  const L2 = useMemo(() => (tree.find(x=>x._id===lv1)?.children||[]), [tree, lv1]);
  const L3 = useMemo(() => (L2.find(x=>x._id===lv2)?.children||[]), [L2, lv2]);

  useEffect(() => { if (value) { setLv3(value); } }, [value]);

  return (
    <Stack direction={{ xs:"column", md:"row" }} spacing={1}>
      <TextField select label="Danh mục 1" value={lv1} onChange={e=>{ setLv1(e.target.value); setLv2(""); setLv3(""); }}>
        {tree.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
      </TextField>

      <TextField select label="Danh mục 2" value={lv2} onChange={e=>{ setLv2(e.target.value); setLv3(""); }} disabled={!lv1}>
        {L2.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
      </TextField>

      <TextField select label="Danh mục 3" value={lv3} onChange={e=>setLv3(e.target.value)} disabled={!lv2}>
        {L3.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
      </TextField>
    </Stack>
  );
}
