import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  TextField,
  Button,
  MenuItem,
  Alert,
  Typography,
  InputAdornment,
  Paper,
  Chip,
} from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import PhoneIphone from "@mui/icons-material/PhoneIphone";
import FmdGood from "@mui/icons-material/FmdGood";
import Public from "@mui/icons-material/Public";
import Map from "@mui/icons-material/Map";
import Apartment from "@mui/icons-material/Apartment";
import MapsHomeWork from "@mui/icons-material/MapsHomeWork";

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

// 34 Tỉnh/TP (mới sau sáp nhập) – JSON
async function fetch34All() {
  const r = await fetch(
    "https://cdn.jsdelivr.net/gh/giaodienblog/cdn@master/provinces-database.json"
  );
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}

export default function AddressDialog({ open, onClose, initial, onSubmit }) {
  const [tab, setTab] = useState(0);
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
        setTinhList(await fetchTinh());
      } catch {}
      try {
        setDb34(await fetch34All());
      } catch {}
    })();
    setTinhId("");
    setQuanId("");
    setPhuongId("");
    setProvCode("");
    setWardCode("");
  }, [open, initial]);

  useEffect(() => {
    if (!tinhId) {
      setQuanList([]);
      setQuanId("");
      setPhuongList([]);
      setPhuongId("");
      return;
    }
    (async () => {
      setQuanList(await fetchQuan(tinhId));
      setQuanId("");
      setPhuongList([]);
      setPhuongId("");
    })();
  }, [tinhId]);

  useEffect(() => {
    if (!quanId) {
      setPhuongList([]);
      setPhuongId("");
      return;
    }
    (async () => {
      setPhuongList(await fetchPhuong(quanId));
      setPhuongId("");
    })();
  }, [quanId]);

  const wards34 = useMemo(() => {
    const p = db34.find((x) => (x.Code || x.code || "") === provCode);
    return p?.Wards || [];
  }, [db34, provCode]);

  // ==== Live preview text
  const city63 = tinhList.find((x) => x.id === tinhId)?.full_name || "";
  const dist63 = quanList.find((x) => x.id === quanId)?.full_name || "";
  const ward63 = phuongList.find((x) => x.id === phuongId)?.full_name || "";
  const city34 =
    db34.find((x) => (x.Code || x.code) === provCode)?.FullName ||
    db34.find((x) => (x.Code || x.code) === provCode)?.Name ||
    "";
  const ward34o = wards34.find((x) => (x.Code || x.code) === wardCode);
  const ward34 = ward34o
    ? (() => {
        const base = String(
          ward34o.FullName || ward34o.Name || ward34o.name || ""
        ).trim();
        const short = String(
          ward34o.AdministrativeUnitShortName ||
            ward34o.AdministrativeUnitShort ||
            ""
        ).trim();
        return short && base.toLowerCase().startsWith(short.toLowerCase() + " ")
          ? base
          : short
          ? `${short} ${base}`
          : base;
      })()
    : "";

  const previewCity = tab === 0 ? city63 : city34;
  const previewWard = tab === 0 ? ward63 : ward34;
  const previewDist = tab === 0 ? dist63 : ""; // 34: không có quận

  const handleSave = () => {
    let city = "",
      district = "",
      ward = "";
    if (tab === 0) {
      city = city63;
      district = dist63;
      ward = ward63;
    } else {
      city = city34 || "";
      district = "";
      ward = ward34 || "";
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      city,
      district,
      ward,
      street: street.trim(),
    };
    if (
      !payload.name ||
      !payload.phone ||
      !payload.city ||
      !payload.ward ||
      !payload.street
    ) {
      alert(
        "Vui lòng nhập đủ Họ tên, SĐT, Tỉnh/TP, Phường/Xã và Địa chỉ chi tiết."
      );
      return;
    }
    onSubmit?.(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle> {initial ? "Sửa địa chỉ" : "Thêm địa chỉ"} </DialogTitle>
      <DialogContent dividers>
        {/* ==== PREVIEW ADDRESS CARD */}
        <Paper
          variant="outlined"
          sx={{ p: 1.25, mb: 2, borderRadius: 2, bgcolor: "grey.50" }}
        >
          <Stack spacing={0.5}>
            <Typography component="div"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <PersonOutline fontSize="small" /> <b>{name || "Họ tên"}</b>
              <Chip
                size="small"
                variant="outlined"
                label={phone || "SĐT"}
                sx={{ ml: 0.5 }}
              />
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
            >
              <FmdGood fontSize="small" />
              {[
                street || "Địa chỉ chi tiết",
                previewWard,
                previewDist,
                previewCity,
              ]
                .filter(Boolean)
                .join(", ")}
            </Typography>
          </Stack>
        </Paper>

        <Stack spacing={1.25}>
          {/* Name + phone with icons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <TextField
              label="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="SĐT"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphone fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0.5 }}>
            <Tab
              icon={<Map fontSize="small" />}
              iconPosition="start"
              label="63 Tỉnh/TP (Tỉnh → Quận → Phường)"
            />
            <Tab
              icon={<Public fontSize="small" />}
              iconPosition="start"
              label="34 Tỉnh/TP (Tỉnh → Phường)"
            />
          </Tabs>

          {/* ====== 63 tỉnh ====== */}
          {tab === 0 && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                select
                fullWidth
                label="Tỉnh/Thành phố"
                value={tinhId}
                onChange={(e) => setTinhId(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">— Chọn Tỉnh/TP —</MenuItem>
                {tinhList.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.full_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Quận/Huyện"
                value={quanId}
                onChange={(e) => setQuanId(e.target.value)}
                disabled={!tinhId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Apartment fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">— Chọn Quận/Huyện —</MenuItem>
                {quanList.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {q.full_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Phường/Xã"
                value={phuongId}
                onChange={(e) => setPhuongId(e.target.value)}
                disabled={!quanId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapsHomeWork fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">— Chọn Phường/Xã —</MenuItem>
                {phuongList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.full_name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}

          {/* ====== 34 tỉnh ====== */}
          {tab === 1 && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                select
                fullWidth
                label="Tỉnh/Thành phố"
                value={provCode}
                onChange={(e) => setProvCode(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">— Chọn Tỉnh/TP —</MenuItem>
                {db34.map((p) => {
                  const name = p.FullName || p.Name || p.name;
                  return (
                    <MenuItem key={p.Code || p.code} value={p.Code || p.code}>
                      {name}
                    </MenuItem>
                  );
                })}
              </TextField>

              <TextField
                select
                fullWidth
                label="Phường/Xã"
                value={wardCode}
                onChange={(e) => setWardCode(e.target.value)}
                disabled={!provCode}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapsHomeWork fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="">— Chọn Phường/Xã —</MenuItem>
                {wards34.map((w) => {
                  const base = String(
                    w.FullName || w.Name || w.name || ""
                  ).trim();
                  const short = String(
                    w.AdministrativeUnitShortName ||
                      w.AdministrativeUnitShort ||
                      ""
                  ).trim();
                  const prefixed =
                    short &&
                    base.toLowerCase().startsWith(short.toLowerCase() + " ");
                  const text = prefixed
                    ? base
                    : short
                    ? `${short} ${base}`
                    : base;
                  return (
                    <MenuItem key={w.Code || w.code} value={w.Code || w.code}>
                      {text}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Stack>
          )}

          <TextField
            label="Địa chỉ chi tiết"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            fullWidth
            placeholder="Số nhà, ngõ/ngách, tên đường…"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FmdGood fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Alert severity="info">
            Bạn có thể chọn <b>1 trong 2 cách</b> để điền địa chỉ. Bộ 34 tỉnh là
            dữ liệu mới (không có Quận/Huyện).
          </Alert>

          {initial && (
            <Typography variant="caption" color="text.secondary">
              Địa chỉ hiện tại: {initial?.street ? `${initial.street}, ` : ""}
              {[initial?.ward, initial?.district, initial?.city]
                .filter(Boolean)
                .join(", ")}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="contained" onClick={handleSave}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
