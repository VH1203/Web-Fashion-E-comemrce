import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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
import Slide from "@mui/material/Slide";
import { useToast } from "./common/Toast";
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
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
// 34 tỉnh/TP (Tỉnh → Phường)
async function fetch34All() {
  const r = await fetch(
    "https://cdn.jsdelivr.net/gh/giaodienblog/cdn@master/provinces-database.json"
  );
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}

/* ===== helpers ===== */
const norm = (s = "") =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const resolveSchemaTab = (initial) => {
  const s = String(initial?.schema || initial?.source || "").toUpperCase();
  if (s === "VN34" || s === "34") return 1;
  if (s === "VN63" || s === "63") return 0;
  // nếu không có district mà có city/ward -> khả năng là 34
  if (!initial?.district && (initial?.ward || initial?.city)) return 1;
  return 0;
};

export default function AddressDialog({ open, onClose, initial, onSubmit }) {
  const toast = useToast();
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

  // 34 tỉnh (không có Quận)
  const [db34, setDb34] = useState([]);
  const [provCode, setProvCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  // guard để không bị useEffect reset trong lúc prefill
  const hydratingRef = useRef(false);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!open) return;

    setName(initial?.name || "");
    setPhone(initial?.phone || "");
    setStreet(initial?.street || "");

    // reset selections
    setTinhId("");
    setQuanId("");
    setPhuongId("");
    setProvCode("");
    setWardCode("");

    (async () => {
      hydratingRef.current = true;

      const [tinh, db34All] = await Promise.all([
        fetchTinh().catch(() => []),
        fetch34All().catch(() => []),
      ]);
      setTinhList(tinh);
      setDb34(db34All);

      const gtab = resolveSchemaTab(initial);
      setTab(gtab);

      // Prefill theo initial
      if (initial) {
        if (gtab === 1) {
          await prefill34(initial, db34All);
        } else {
          await prefill63(initial, tinh);
        }
      }

      hydratingRef.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  /* ============ Load dependent lists (63) ============ */
  useEffect(() => {
    if (hydratingRef.current) return;
    if (!tinhId) {
      setQuanList([]);
      setQuanId("");
      setPhuongList([]);
      setPhuongId("");
      return;
    }
    (async () => {
      const q = await fetchQuan(tinhId);
      setQuanList(q);
      setQuanId("");
      setPhuongList([]);
      setPhuongId("");
    })();
  }, [tinhId]);

  useEffect(() => {
    if (hydratingRef.current) return;
    if (!quanId) {
      setPhuongList([]);
      setPhuongId("");
      return;
    }
    (async () => {
      const p = await fetchPhuong(quanId);
      setPhuongList(p);
      setPhuongId("");
    })();
  }, [quanId]);

  /* ================= Prefill helpers ================= */
  async function prefill63(init, tinh) {
    // 1) Tỉnh theo code → fallback theo tên
    let foundTinh =
      init.province_code &&
      tinh.find((t) => String(t.id) === String(init.province_code));
    if (!foundTinh && init.city) {
      const target = norm(init.city);
      foundTinh = tinh.find((t) => norm(t.full_name) === target);
    }
    if (!foundTinh) return; // không xác định được tỉnh
    setTinhId(foundTinh.id);

    // 2) Quận
    const qList = await fetchQuan(foundTinh.id);
    setQuanList(qList);
    let foundQuan =
      init.district_code &&
      qList.find((q) => String(q.id) === String(init.district_code));
    if (!foundQuan && init.district) {
      const target = norm(init.district);
      foundQuan = qList.find((q) => norm(q.full_name) === target);
    }
    if (!foundQuan) {
      setQuanId("");
      setPhuongList([]);
      setPhuongId("");
      return;
    }
    setQuanId(foundQuan.id);

    // 3) Phường
    const pList = await fetchPhuong(foundQuan.id);
    setPhuongList(pList);
    let foundPhuong =
      init.ward_code &&
      pList.find((p) => String(p.id) === String(init.ward_code));
    if (!foundPhuong && init.ward) {
      const target = norm(init.ward);
      foundPhuong = pList.find((p) => norm(p.full_name) === target);
    }
    if (foundPhuong) setPhuongId(foundPhuong.id);
  }

  async function prefill34(init, db34All) {
    // 1) Tỉnh 34
    let province = null;
    if (init.province_code) {
      province = db34All.find(
        (p) => String(p.Code || p.code) === String(init.province_code)
      );
    }
    if (!province && init.city) {
      const target = norm(init.city);
      province = db34All.find((p) =>
        [p.FullName, p.Name, p.name].some((n) => n && norm(n) === target)
      );
    }
    if (!province) return;
    const pCode = String(province.Code || province.code);
    setProvCode(pCode);

    // 2) Phường 34
    const wards = province.Wards || [];
    let ward = null;
    if (init.ward_code) {
      ward = wards.find(
        (w) => String(w.Code || w.code) === String(init.ward_code)
      );
    }
    if (!ward && init.ward) {
      const target = norm(init.ward);
      ward = wards.find((w) => {
        const base = String(w.FullName || w.Name || w.name || "").trim();
        const short = String(
          w.AdministrativeUnitShortName || w.AdministrativeUnitShort || ""
        ).trim();
        const text =
          short && base.toLowerCase().startsWith(short.toLowerCase() + " ")
            ? base
            : short
            ? `${short} ${base}`
            : base;
        return norm(text) === target || norm(base) === target;
      });
    }
    if (ward) setWardCode(String(ward.Code || ward.code));
  }

  /* ================= derived ================= */
  const wards34 = useMemo(() => {
    const p = db34.find((x) => (x.Code || x.code || "") === provCode);
    return p?.Wards || [];
  }, [db34, provCode]);

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
  const previewDist = tab === 0 ? dist63 : ""; // 34 không có quận
  const mode = tab === 0 ? "63" : "34";

  /* ================= save ================= */
  const handleSave = () => {
    let city = "",
      district = "",
      ward = "",
      schema = "VN63";
    let province_code = "",
      district_code = "",
      ward_code = "";

    if (tab === 0) {
      city = city63;
      district = dist63;
      ward = ward63;
      schema = "VN63";
      province_code = tinhId || "";
      district_code = quanId || "";
      ward_code = phuongId || "";
    } else {
      city = city34 || "";
      district = "";
      ward = ward34 || "";
      schema = "VN34";
      province_code = provCode || "";
      district_code = null; // 34 không có quận
      ward_code = wardCode || "";
    }

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city,
      district: mode === "63" ? district : "",
      ward,
      schema, // "VN63" | "VN34"
      province_code,
      district_code,
      ward_code,
    };

    if (
      !payload.name ||
      !payload.phone ||
      !payload.street ||
      !payload.city ||
      !payload.ward
    ) {
      toast.error("Vui lòng nhập đủ Họ tên, SĐT, Tỉnh/TP, Phường/Xã và Địa chỉ chi tiết.");
      return;
    }
    onSubmit?.(payload);
  };

  const disabledSave =
    !name.trim() ||
    !phone.trim() ||
    !street.trim() ||
    !(mode === "63" ? city63 && ward63 : city34 && ward34);

  /* ============== UI ============== */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      TransitionComponent={Transition}
    >
      <DialogTitle>{initial ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
      <DialogContent dividers>
        {/* preview */}
        <Paper
          variant="outlined"
          className="soft-item"
          sx={{ p: 1.25, mb: 2, borderRadius: 2, bgcolor: "grey.50" }}
        >
          <Stack spacing={0.5}>
            <Typography
              component="div"
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <TextField
              label="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              className="soft-input"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className="soft-input"
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

          {/* 63 */}
          {tab === 0 && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                className="soft-input"
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
                className="soft-input"
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
                className="soft-input"
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

          {/* 34 */}
          {tab === 1 && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
              className="soft-input"
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
              className="soft-input"
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
                  const text =
                    short &&
                    base.toLowerCase().startsWith(short.toLowerCase() + " ")
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
          className="soft-input"
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
            Luôn lưu vào hệ thống. Bạn có thể chọn <b>1 trong 2</b> bộ dữ liệu:
            “63 tỉnh (có Quận/Huyện)” hoặc “34 tỉnh (không có Quận)”.
          </Alert>

          {initial && (
            <Typography variant="caption" color="text.secondary">
              Đang chỉnh: {initial?.street ? `${initial.street}, ` : ""}
              {[initial?.ward, initial?.district, initial?.city]
                .filter(Boolean)
                .join(", ")}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={disabledSave}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
