import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Stack, TextField, Button, Alert, Typography
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useToast } from "./common/ToastProvider";

/* =================== Helpers & APIs =================== */
const prettyJoin = (parts = []) => {
  const cleaned = parts
    .map((x) => String(x || "").trim())
    .filter((x) => x && x !== "-" && x !== "—");
  const s = cleaned.join(", ");
  return s
    .replace(/\s*-\s*/g, "")
    .replace(/,\s*,/g, ", ")
    .replace(/^\s*,\s*|\s*,\s*$/g, "")
    .trim();
};
const strip = (s = "") =>
  s.normalize?.("NFD").replace(/\p{Diacritic}/gu, "").replace(/\./g, "").trim().toLowerCase() || s;
const rmPrefix = (s = "") =>
  s.replace(/^(tinh|thanh pho|tp|quan|huyen|thi xa|xa|phuong)\s+/i, "").trim();

async function fetchTinh() {
  const r = await fetch("https://esgoo.net/api-tinhthanh/1/0.htm");
  const j = await r.json();
  return j?.error === 0 ? j.data : [];
}
async function fetchQuan(tinhId) {
  if (!tinhId) return [];
  const r = await fetch(`https://esgoo.net/api-tinhthanh/2/${tinhId}.htm`);
  const j = await r.json();
  return j?.error === 0 ? j.data : [];
}
async function fetchPhuong(quanId) {
  if (!quanId) return [];
  const r = await fetch(`https://esgoo.net/api-tinhthanh/3/${quanId}.htm`);
  const j = await r.json();
  return j?.error === 0 ? j.data : [];
}
async function fetch34All() {
  const r = await fetch("https://cdn.jsdelivr.net/gh/giaodienblog/cdn@master/provinces-database.json");
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}

/* =================== Component =================== */
export default function AddressDialog({ open, onClose, initial, onSubmit }) {
  const toast = useToast();

  // 0 = 63 tỉnh (T-Q-P), 1 = 34 tỉnh (T-P)
  const [tab, setTab] = useState(0);

  // Common
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");

  // 63 tỉnh
  const [tinhList, setTinhList] = useState([]);
  const [quanList, setQuanList] = useState([]);
  const [phuongList, setPhuongList] = useState([]);
  const [tinhId, setTinhId] = useState("");
  const [quanId, setQuanId] = useState("");
  const [phuongId, setPhuongId] = useState("");

  // 34 tỉnh
  const [db34, setDb34] = useState([]);
  const [provCode, setProvCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setName(initial?.name || "");
    setPhone(initial?.phone || "");
    setStreet(initial?.street || "");

    (async () => {
      try {
        const [tinh] = await Promise.all([fetchTinh()]);
        setTinhList(tinh);
      } catch {}
      try {
        const data34 = await fetch34All();
        setDb34(data34);
      } catch {}
    })();

    setTinhId(""); setQuanId(""); setPhuongId("");
    setProvCode(""); setWardCode("");
  }, [open, initial]);

  // Prefill từ initial
  useEffect(() => {
    if (!open || !initial) return;

    (async () => {
      try {
        if (!tinhList.length && !db34.length) return;

        const cityName = rmPrefix(initial.city || "");
        const districtName = rmPrefix(initial.district || "");
        const wardName = rmPrefix(initial.ward || "");

        // Thử 63 tỉnh
        if (tinhList.length) {
          const foundTinh = tinhList.find(t => strip(rmPrefix(t.full_name)) === strip(cityName));
          if (foundTinh) {
            setTab(0);
            setTinhId(foundTinh.id);
            const quans = await fetchQuan(foundTinh.id);
            setQuanList(quans);
            const foundQuan = quans.find(q => strip(rmPrefix(q.full_name)) === strip(districtName));
            if (foundQuan) {
              setQuanId(foundQuan.id);
              const phuongs = await fetchPhuong(foundQuan.id);
              setPhuongList(phuongs);
              const foundPhuong = phuongs.find(p => strip(rmPrefix(p.full_name)) === strip(wardName));
              if (foundPhuong) setPhuongId(foundPhuong.id);
            }
            return;
          }
        }
        // Thử 34 tỉnh
        if (db34.length) {
          const foundProv = db34.find(p => strip(rmPrefix(p.FullName || p.Name || p.name)) === strip(cityName));
          if (foundProv) {
            setTab(1);
            const code = String(foundProv.Code || foundProv.code);
            setProvCode(code);
            const wards = foundProv.Wards || [];
            const foundWard = wards.find(w => strip(rmPrefix(w.FullName || w.Name || w.name)) === strip(wardName));
            if (foundWard) setWardCode(String(foundWard.Code || foundWard.code));
          }
        }
      } catch {}
    })();
  }, [open, initial, tinhList, db34]);

  // Cascade 63
  useEffect(() => {
    if (!tinhId) { setQuanList([]); setQuanId(""); setPhuongList([]); setPhuongId(""); return; }
    (async () => {
      const quans = await fetchQuan(tinhId);
      setQuanList(quans);
      setQuanId(""); setPhuongList([]); setPhuongId("");
    })();
  }, [tinhId]);

  useEffect(() => {
    if (!quanId) { setPhuongList([]); setPhuongId(""); return; }
    (async () => {
      const phuongs = await fetchPhuong(quanId);
      setPhuongList(phuongs);
      setPhuongId("");
    })();
  }, [quanId]);

  const wards34 = useMemo(() => {
    const p = db34.find(x => (x.Code || x.code || "") === provCode);
    return p?.Wards || [];
  }, [db34, provCode]);

  const handleSave = async () => {
    let city = "", district = "", ward = "";
    let province_code = "", ward_code = "";

    if (tab === 0) {
      const t = tinhList.find(x => x.id === tinhId);
      const q = quanList.find(x => x.id === quanId);
      const p = phuongList.find(x => x.id === phuongId);
      city = t?.full_name || "";
      district = q?.full_name || "";
      ward = p?.full_name || "";
    } else {
      const p = db34.find(x => (x.Code || x.code || "") === provCode);
      const w = wards34.find(x => (x.Code || x.code || "") === wardCode);
      const baseProv = p ? (p.FullName || p.Name || p.name) : "";
      const baseWard = w ? (w.FullName || w.Name || w.name) : "";
      const short = String(w?.AdministrativeUnitShortName || w?.AdministrativeUnitShort || "").trim();
      const wardText = short && baseWard.toLowerCase().startsWith(short.toLowerCase() + " ")
        ? baseWard
        : (short ? `${short} ${baseWard}` : baseWard);

      city = baseProv || "";
      district = ""; // ✅ không gán "-"
      ward = wardText || "";
      province_code = String(p?.Code || p?.code || "");
      ward_code = String(w?.Code || w?.code || "");
    }

    const clean = (s = "") =>
      String(s)
        .replace(/\s*-\s*/g, "")
        .replace(/\s+/g, " ")
        .replace(/,\s*,/g, ", ")
        .replace(/^\s*,\s*|\s*,\s*$/g, "")
        .trim();

    const payload = {
      name: clean(name),
      phone: clean(phone),
      city: clean(city),
      district: clean(district),
      ward: clean(ward),
      street: clean(street),
      province_code, ward_code, country: "VN",
    };

    if (!payload.name || !payload.phone || !payload.city || !payload.ward || !payload.street) {
      toast.error("Vui lòng nhập đủ Họ tên, SĐT, Tỉnh/TP, Phường/Xã và Địa chỉ chi tiết.");
      return;
    }

    try {
      await onSubmit?.(payload);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Lưu địa chỉ thất bại");
      return;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle> {initial ? "Sửa địa chỉ" : "Thêm địa chỉ"} </DialogTitle>
      <DialogContent
        dividers
        sx={(theme)=>({
          background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)",
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
        })}
      >
        <Stack spacing={1.25}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <TextField label="Họ tên" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
            <TextField label="SĐT" value={phone} onChange={(e)=>setPhone(e.target.value)} fullWidth />
          </Stack>

          <Tabs value={tab} onChange={(_, v)=>setTab(v)} sx={{ mt: .5 }}>
            <Tab label="63 Tỉnh/TP (Tỉnh → Quận → Phường)" />
            <Tab label="34 Tỉnh/TP (sau sáp nhập: Tỉnh → Phường)" />
          </Tabs>

          {tab === 0 && (
            <Stack direction={{ xs:"column", sm:"row" }} spacing={1.25}>
              <TextField select fullWidth label="Tỉnh/Thành phố" value={tinhId} onChange={(e)=>setTinhId(e.target.value)}>
                <option value="">— Chọn Tỉnh/TP —</option>
                {tinhList.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </TextField>
              <TextField select fullWidth label="Quận/Huyện" value={quanId} onChange={(e)=>setQuanId(e.target.value)} disabled={!tinhId}>
                <option value="">— Chọn Quận/Huyện —</option>
                {quanList.map(q => <option key={q.id} value={q.id}>{q.full_name}</option>)}
              </TextField>
              <TextField select fullWidth label="Phường/Xã" value={phuongId} onChange={(e)=>setPhuongId(e.target.value)} disabled={!quanId}>
                <option value="">— Chọn Phường/Xã —</option>
                {phuongList.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </TextField>
            </Stack>
          )}

          {tab === 1 && (
            <Stack direction={{ xs:"column", sm:"row" }} spacing={1.25}>
              <TextField select fullWidth label="Tỉnh/Thành phố" value={provCode} onChange={(e)=>setProvCode(e.target.value)}>
                <option value="">— Chọn Tỉnh/TP —</option>
                {db34.map(p=>{
                  const name = p.FullName || p.Name || p.name;
                  return <option key={p.Code || p.code} value={p.Code || p.code}>{name}</option>;
                })}
              </TextField>
              <TextField select fullWidth label="Phường/Xã" value={wardCode} onChange={(e)=>setWardCode(e.target.value)} disabled={!provCode}>
                <option value="">— Chọn Phường/Xã —</option>
                {(wards34||[]).map(w=>{
                  const base = String(w.FullName || w.Name || w.name || "").trim();
                  const short = String(w.AdministrativeUnitShortName || w.AdministrativeUnitShort || "").trim();
                  const already = short && base.toLowerCase().startsWith(short.toLowerCase() + " ");
                  const text = already ? base : (short ? `${short} ${base}` : base);
                  return <option key={w.Code || w.code} value={w.Code || w.code}>{text}</option>;
                })}
              </TextField>
            </Stack>
          )}

          <TextField label="Địa chỉ chi tiết" value={street} onChange={(e)=>setStreet(e.target.value)} fullWidth />

          {initial && (
            <Typography variant="caption" color="text.secondary">
              Địa chỉ hiện tại: {initial?.street ? `${initial.street}, ` : ""}{prettyJoin([initial?.ward, initial?.district, initial?.city])}
            </Typography>
          )}

          <Alert severity="info">
            Có thể chọn <b>1 trong 2 cách</b> để điền địa chỉ. Bộ 34 tỉnh không có Quận/Huyện – hệ thống đã tự bỏ dấu “-” và để trống field này.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSave}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}
