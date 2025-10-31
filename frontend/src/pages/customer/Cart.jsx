import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box, Grid, Paper, Typography, Checkbox, IconButton, Button, Divider,
  TextField, Stack, Chip, Tooltip, Alert, LinearProgress, Card, CardContent,
  Popover
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import ShoppingCartCheckout from "@mui/icons-material/ShoppingCartCheckout";
import ArrowBack from "@mui/icons-material/ArrowBack";
import WarningAmber from "@mui/icons-material/WarningAmber";
import ImageNotSupported from "@mui/icons-material/ImageNotSupported";
import Check from "@mui/icons-material/Check";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { cartService } from "../../services/cartService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../assets/styles/Cart.css";

/* ===== Variant helpers ===== */
const norm = (s) => String(s ?? "").trim().toLowerCase();

function groupVariantOptions(variants) {
  const map = {};
  for (const v of variants || []) {
    const attrs = v?.attributes || {};
    for (const [k, val] of Object.entries(attrs)) {
      if (val == null || val === "") continue;
      if (!map[k]) map[k] = new Set();
      map[k].add(String(val));
    }
  }
  const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
  const optionGroups = {};
  for (const k of keys) optionGroups[k] = Array.from(map[k]);
  return { optionGroups, orderedKeys: keys };
}
function findVariantById(variants, id) {
  return (variants || []).find((v) => v._id === id) || null;
}
function findBestVariant(variants, selections) {
  if (!variants?.length) return null;
  let best = null, bestScore = -1;
  for (const v of variants) {
    const attrs = v?.attributes || {};
    let score = 0;
    for (const [k, val] of Object.entries(selections || {})) {
      if (!val) continue;
      if (norm(attrs[k]) === norm(val)) score++;
    }
    if ((v.stock ?? 0) > 0) score += 0.25;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}
function resolveOnPick(variants, current, key, value) {
  const list = (variants || []).filter(
    (v) => norm(v?.attributes?.[key]) === norm(value)
  );
  if (!list.length) return current;
  let best = null, bestScore = -1;
  for (const v of list) {
    const attrs = v.attributes || {};
    let s = 0;
    for (const [k2, val2] of Object.entries(current || {})) {
      if (k2 === key || !val2) continue;
      if (norm(attrs[k2]) === norm(val2)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.25;
    if (s > bestScore) { best = v; bestScore = s; }
  }
  const next = { ...(current || {}), [key]: value };
  if (best?.attributes) {
    for (const [k, v] of Object.entries(best.attributes)) next[k] = v;
  }
  return next;
}
function buildDisabledMap(variants, key, values) {
  const map = new Map();
  for (const val of values) {
    const list = (variants || []).filter(
      (v) => norm(v?.attributes?.[key]) === norm(val)
    );
    const hasAny = list.length > 0;
    const hasStock = list.some((v) => (v.stock ?? 0) > 0);
    map.set(val, !(hasAny && hasStock));
  }
  return map;
}
const titleize = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ===== Card-style Cart ===== */
export default function CartCard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // chọn/bỏ chọn item để thanh toán
  const [checked, setChecked] = useState(new Set());

  // selections/selectedVar theo item
  const [pickState, setPickState] = useState({}); // { [itemId]: { selections, selectedVarId } }

  // Popover chọn biến thể
  const [vEditor, setVEditor] = useState({
    open: false,
    anchorEl: null,
    item: null,          // full item
    temp: {}             // temp selections
  });

  const fetchCart = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await cartService.get();
      setData(res);

      // init pickState theo variant hiện tại
      const next = {};
      for (const it of res.items || []) {
        const v = findVariantById(it.available_variants, it.variant_id);
        next[it._id] = {
          selections: v?.attributes ? { ...v.attributes } : {},
          selectedVarId: v?._id || it.variant_id || null,
        };
      }
      setPickState(next);

      // mặc định chọn hết
      setChecked(new Set((res.items || []).map((it) => it._id)));
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Không tải được giỏ hàng");
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        const returnUrl = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        navigate(`/login?returnUrl=${returnUrl}`);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); /* eslint-disable-next-line */ }, []);

  const items = data?.items || [];
  const currency =  "";

  const toggleAll = (on) => setChecked(new Set(on ? items.map((it) => it._id) : []));
  const toggleOne = (id) => {
    setChecked((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleQty = async (item, nextQty) => {
    const qty = Math.max(1, Number(nextQty) || 1);
    try {
      const res = await cartService.updateItem(item._id, { qty });
      setData(res);
    } catch (e) { alert(e?.response?.data?.message || e.message); }
  };

  // Áp selections vào state + gọi BE nếu đổi variant
  const applySelections = async (item, selections) => {
    const bestVariant = findBestVariant(item.available_variants, selections);
    // FE
    setPickState((ps) => ({
      ...ps,
      [item._id]: {
        selections,
        selectedVarId: bestVariant?._id || null,
      },
    }));
    // BE
    if (bestVariant?._id && bestVariant._id !== item.variant_id) {
      try {
        const res = await cartService.updateItem(item._id, {
          variant_id: bestVariant._id,
        });
        setData(res);
      } catch (e) {
        alert(e?.response?.data?.message || e.message);
        fetchCart(); // rollback đơn giản
      }
    }
  };

  // Mở / đóng popover
  const openVariantEditor = (evt, item) => {
    const pick = pickState[item._id] || { selections: {}, selectedVarId: null };
    setVEditor({
      open: true,
      anchorEl: evt.currentTarget,
      item,
      temp: { ...pick.selections }
    });
  };
  const closeVariantEditor = () => setVEditor({ open: false, anchorEl: null, item: null, temp: {} });

  const pickTemp = (key, val) => {
    const next = resolveOnPick(vEditor.item.available_variants, vEditor.temp, key, val);
    setVEditor((p) => ({ ...p, temp: next }));
  };
  const confirmVariant = async () => {
    await applySelections(vEditor.item, vEditor.temp);
    closeVariantEditor();
  };

  const removeItem = async (item) => {
    if (!confirm("Xoá sản phẩm này khỏi giỏ?")) return;
    try {
      const res = await cartService.removeItem(item._id);
      setData(res);
      setChecked((prev) => { const s = new Set(prev); s.delete(item._id); return s; });
    } catch (e) { alert(e?.response?.data?.message || e.message); }
  };

  const removeSelected = async () => {
    if (!checked.size) return;
    if (!confirm(`Xoá ${checked.size} sản phẩm đã chọn?`)) return;
    try {
      let res = null;
      for (const id of checked) res = await cartService.removeItem(id);
      if (res) setData(res);
      setChecked(new Set());
    } catch (e) { alert(e?.response?.data?.message || e.message); }
  };

  const clearCart = async () => {
    if (!confirm("Xoá toàn bộ giỏ hàng?")) return;
    try {
      const res = await cartService.clear();
      setData(res);
      setChecked(new Set());
    } catch (e) { alert(e?.response?.data?.message || e.message); }
  };

  // tổng theo item đã chọn (và hợp lệ tồn kho)
  const selectedSummary = useMemo(() => {
    let total = 0; let count = 0;
    for (const it of items) {
      if (!checked.has(it._id)) continue;
      const price = it.price || 0;
      const sub = it.total || price * it.qty;
      const variant =
        findVariantById(
          it.available_variants,
          (pickState[it._id]?.selectedVarId) || it.variant_id
        ) || null;
      if ((variant?.stock ?? 0) > 0 && it.qty <= (variant?.stock ?? 0)) {
        total += sub; count++;
      }
    }
    return { total, count };
  }, [items, checked, pickState]);

  const canCheckout = selectedSummary.count > 0;

  if (loading) {
    return (
      <Box className="cart-wrap">
        <Paper elevation={0} className="card-soft">
          <LinearProgress />
          <Typography variant="body2" mt={2}>Đang tải giỏ hàng…</Typography>
        </Paper>
      </Box>
    );
  }
  if (err) {
    return (
      <Box className="cart-wrap">
        <Alert severity="error">{err}</Alert>
      </Box>
    );
  }

    return (
    <Box className="cart-page">
      <Box className="cart-shell">
        {/* spacing lớn không ảnh hưởng, nhưng để mặc định cho gọn */}
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={11} xl={10}>
            {/* QUAN TRỌNG: thêm class card-soft (đã override overflow trong CSS) */}
            <Card className="card-soft">
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={3} alignItems="flex-start" className="cart-grid">
                  {/* LEFT: Items */}
                  <Grid item xs={12} lg={7}>
                    {/* header */}
                    <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                      <Button
                        component={RouterLink}
                        to="/"
                        variant="text"
                        color="inherit"
                        size="small"
                        startIcon={<ArrowBack />}
                        sx={{ textTransform: "none" }}
                      >
                        Tiếp tục mua sắm
                      </Button>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      flexWrap="wrap"
                      rowGap={1}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600} mb={0.25}>
                          Giỏ hàng
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bạn có {items.length} sản phẩm trong giỏ
                        </Typography>
                      </Box>
                      <Box>
                        <Checkbox
                        color="primary"
                          checked={checked.size === items.length && items.length > 0}
                          indeterminate={checked.size > 0 && checked.size < items.length}
                          onChange={(e) => toggleAll(e.target.checked)}
                          sx={{ mr: 0.5 }}
                        />
                        <Typography variant="body2" display="inline">Chọn tất cả</Typography>
                      </Box>
                    </Stack>

                    {/* items list */}
                    <Stack spacing={1.5}>
                      {items.map((it) => {
                        const pick = pickState[it._id] || { selections: {}, selectedVarId: it.variant_id };
                        const selectedVar =
                          findVariantById(it.available_variants, pick.selectedVarId) ||
                          findVariantById(it.available_variants, it.variant_id);
                        const { orderedKeys } = groupVariantOptions(it.available_variants);
                        const productHref = it.product?.slug ? `/product/${it.product.slug}` : `/product/${it.product_id}`;
                        const price = it.price || 0;
                        const subTotal = it.total || price * it.qty;

                        const outOfStock = (selectedVar?.stock ?? 0) <= 0;
                        const overStock = !outOfStock && it.qty > (selectedVar?.stock ?? 0);

                        const summary =
                          orderedKeys
                            .map((k) => pick.selections?.[k])
                            .filter(Boolean)
                            .join(", ");

                        return (
                          <Paper key={it._id} className="item-card" variant="outlined">
                            <Box className="item-row">
                              <Box className="left">
                                <Checkbox
                                color="primary"
                                  checked={checked.has(it._id)}
                                  onChange={() => toggleOne(it._id)}
                                  sx={{ mr: 1 }}
                                />
                                <Box className="thumb">
                                  {it.image ? (
                                    <img src={it.image} alt={it.name} />
                                  ) : (
                                    <Box className="thumb noimg">
                                      <ImageNotSupported fontSize="small" />
                                    </Box>
                                  )}
                                </Box>
                                <Box className="meta">
                                  <Typography
                                    component={RouterLink}
                                    to={productHref}
                                    className="link-unstyled"
                                    fontWeight={600}
                                  >
                                    {it.name}
                                  </Typography>
                                  {(outOfStock || overStock) && (
                                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                                      <WarningAmber color="warning" fontSize="small" />
                                      <Typography variant="caption" color="warning.main">
                                        {outOfStock ? "Biến thể đã hết hàng" : "Vượt quá tồn kho"}
                                      </Typography>
                                    </Stack>
                                  )}

                                  {/* Phân loại (thu gọn) */}
                                  <Stack direction="row" alignItems="center" spacing={1} mt={0.75} flexWrap="wrap">
                                    <Typography variant="caption" color="text.secondary">Phân loại:</Typography>
                                    <Typography variant="body2" fontWeight={600}>{summary || "—"}</Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      endIcon={<ExpandMore />}
                                      className="btn-soft"
                                      onClick={(e) => openVariantEditor(e, it)}
                                    >
                                      Thay đổi
                                    </Button>
                                  </Stack>
                                </Box>
                              </Box>

                              <Box className="right">
                                {/* Qty & price */}
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1.25}
                                  alignItems={{ sm: "center" }}
                                  justifyContent="flex-end"
                                  className="qty-price"
                                >
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <IconButton size="small" color="primary" onClick={() => handleQty(it, Math.max(1, it.qty - 1))} disabled={it.qty <= 1}>
                                      <Remove />
                                    </IconButton>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={it.qty}
                                      inputProps={{ min: 1, style: { textAlign: "center", width: 64 } }}
                                      onChange={(e) => handleQty(it, Math.max(1, Number(e.target.value) || 1))}
                                    />
                                    <IconButton size="small" color="primary" onClick={() => handleQty(it, it.qty + 1)}>
                                      <Add />
                                    </IconButton>
                                  </Stack>

                                  <Box textAlign="right" minWidth={160}>
                                    <Typography variant="body2" color="text.secondary">Đơn giá</Typography>
                                    <Typography fontWeight={700}>{formatCurrency(price)} {currency}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Tạm tính</Typography>
                                    <Typography fontWeight={800}>{formatCurrency(subTotal)} {currency}</Typography>
                                  </Box>

                                  <Tooltip title="Xoá khỏi giỏ">
                                    <IconButton color="error" onClick={() => removeItem(it)}>
                                      <DeleteOutline />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Box>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>

                    {/* list actions */}
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Button variant="outlined" color="error" startIcon={<DeleteOutline />} onClick={removeSelected} disabled={!checked.size}>
                        Xoá đã chọn
                      </Button>
                      <Stack direction="row" spacing={1.5}>
                        {/* <Button component={RouterLink} to="/" variant="outlined" color="inherit">
                          ← Tiếp tục mua sắm
                        </Button> */}
                        <Button variant="text" color="inherit" onClick={clearCart}>
                          Xoá toàn bộ
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* RIGHT: Summary */}
<Grid item xs={12} lg={5}>
                    <Box className="summary-sticky">
                      <Paper elevation={0} className="summary-scroll">
                        <Box className="summary-section">
                          <Typography variant="h6" fontWeight={700} mb={1}>Thông tin đơn hàng</Typography>
                          <Stack spacing={1.1}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography color="text.secondary">Số sản phẩm đã chọn</Typography>
                              <Typography fontWeight={600}>{selectedSummary.count}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography color="text.secondary">Tạm tính</Typography>
                              <Typography fontWeight={700}>
                                {formatCurrency(selectedSummary.total)} {currency}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" spacing={1}>
                              <TextField fullWidth size="small" placeholder="Nhập mã voucher" inputProps={{ maxLength: 32 }} />
                              <Button variant="contained" color="primary">ÁP DỤNG</Button>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography color="text.secondary">Phí vận chuyển</Typography>
                              <Typography>0</Typography>
                            </Stack>
                          </Stack>
                        </Box>

                        <Box className="summary-section">
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography fontWeight={700}>Tổng thanh toán</Typography>
                            <Typography fontWeight={900} fontSize={18}>
                              {formatCurrency(selectedSummary.total)} {currency}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">Đã bao gồm VAT (nếu có)</Typography>
                          <Button
                            fullWidth size="large" sx={{ mt: 1.5 }}
                            variant="contained" color="primary"
                            startIcon={<ShoppingCartCheckout />}
                            disabled={!canCheckout}
                            onClick={() => {
                              const selectedIds = Array.from(checked);
                              navigate("/checkout", { state: { selected_item_ids: selectedIds } });
                            }}
                          >
                            THANH TOÁN ({selectedSummary.count})
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>

                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ===== Popover thay đổi biến thể ===== */}
      <Popover
        open={vEditor.open}
        anchorEl={vEditor.anchorEl}
        onClose={closeVariantEditor}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ className: "variant-popover" }}
      >
        {vEditor.item && (() => {
          const { optionGroups, orderedKeys } = groupVariantOptions(vEditor.item.available_variants);
          return (
            <Box p={2} sx={{ minWidth: 320, maxWidth: 420 }}>
              {orderedKeys.map((key) => {
                const values = optionGroups[key] || [];
                const cur = vEditor.temp?.[key] ?? "";
                const disabledMap = buildDisabledMap(vEditor.item.available_variants, key, values);
                return (
                  <Box key={key} mb={1.25}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                      {titleize(key)}:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {values.map((val) => {
                        const active = norm(val) === norm(cur);
                        const disabled = disabledMap.get(val) === true;
                        return (
                          <Chip
                            key={val}
                            size="small"
                            label={String(val)}
                            color={active ? "primary" : "default"}
                            variant={active ? "filled" : "outlined"}
                            onClick={() => pickTemp(key, val)}
                            disabled={disabled}
                            icon={active ? <Check fontSize="small" /> : null}
                            className="chip-choice"
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
              <Stack direction="row" spacing={1.25} justifyContent="space-between" mt={1.5}>
                <Button variant="outlined" color="primary" onClick={closeVariantEditor}>TRỞ LẠI</Button>
                <Button variant="contained" color="primary" onClick={confirmVariant}>XÁC NHẬN</Button>
              </Stack>
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
}
