import {
  Add,
  ArrowBack,
  DeleteOutline,
  ExpandMore,
  ImageNotSupported,
  Remove,
  ShoppingCartCheckout,
  WarningAmber,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { cartService } from "../../services/cartService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useCart } from "../../context/CartContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherApi } from "../../services/voucherService";
import { Snackbar } from "@mui/material";

/* ===== Variant helpers ===== */
const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase();

function groupVariantOptions(variants) {
  const map = {};
  for (const v of variants || []) {
    const attrs = v?.attributes || {};
    for (const [k, val] of Object.entries(attrs)) {
      if (!map[k]) map[k] = new Set();
      map[k].add(val);
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
  let best = null,
    bestScore = -1;
  for (const v of variants) {
    const attrs = v?.attributes || {};
    let score = 0;
    for (const [k, val] of Object.entries(selections || {})) {
      if (norm(attrs[k]) === norm(val)) score++;
    }
    if ((v.stock ?? 0) > 0) score += 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }
  return best;
}
function resolveOnPick(variants, current, key, value) {
  const list = (variants || []).filter(
    (v) => norm(v?.attributes?.[key]) === norm(value)
  );
  if (!list.length) return current;
  let best = null,
    bestScore = -1;
  for (const v of list) {
    const attrs = v.attributes || {};
    let s = 0;
    for (const [k2, val2] of Object.entries(current || {})) {
      if (k2 !== key && norm(attrs[k2]) === norm(val2)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.5;
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
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
  const theme = useTheme();
  const { cart: data, loading, error: err, fetchCart } = useCart();
  const queryClient = useQueryClient();

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const applyVoucherMutation = useMutation({
    mutationFn: ({ code, total }) => voucherApi.applyVoucher(code, total),
    onSuccess: (data) => {
      setAppliedVoucher(data);
      setToast({
        open: true,
        message: "Áp dụng voucher thành công!",
        severity: "success",
      });
    },
    onError: (error) => {
      setAppliedVoucher(null);
      const message =
        error.response?.data?.message || "Áp dụng voucher thất bại";
      setToast({ open: true, message, severity: "error" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, payload }) =>
      cartService.updateItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // chọn/bỏ chọn item để thanh toán
  const [checked, setChecked] = useState(new Set());

  // selections/selectedVar theo item
  const [pickState, setPickState] = useState({}); // { [itemId]: { selections, selectedVarId } }

  // Popover chọn biến thể
  const [vEditor, setVEditor] = useState({
    open: false,
    anchorEl: null,
    item: null, // full item
    temp: {}, // temp selections
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    content: "",
    onConfirm: null,
  });

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (data?.items) {
      const initialPickState = {};
      for (const item of data.items) {
        const bestVariant = findVariantById(
          item.available_variants,
          item.variant_id
        );
        initialPickState[item._id] = {
          selections: bestVariant?.attributes || {},
          selectedVarId: bestVariant?._id || null,
        };
      }
      setPickState(initialPickState);
    }
  }, [data]);

  const items = data?.items || [];
  const currency = "";

  const toggleAll = (on) =>
    setChecked(new Set(on ? items.map((it) => it._id) : []));
  const toggleOne = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQty = async (item, nextQty) => {
    const qty = Math.max(1, Number(nextQty) || 1);
    updateItemMutation.mutate({ itemId: item._id, payload: { quantity: qty } });
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
      updateItemMutation.mutate({
        itemId: item._id,
        payload: { variant_id: bestVariant._id },
      });
    }
  };

  // Mở / đóng popover
  const openVariantEditor = (evt, item) => {
    const pick = pickState[item._id] || { selections: {}, selectedVarId: null };
    setVEditor({
      open: true,
      anchorEl: evt.currentTarget,
      item,
      temp: { ...pick.selections },
    });
  };
  const closeVariantEditor = () =>
    setVEditor({ open: false, anchorEl: null, item: null, temp: {} });

  const pickTemp = (key, val) => {
    const next = resolveOnPick(
      vEditor.item.available_variants,
      vEditor.temp,
      key,
      val
    );
    setVEditor((p) => ({ ...p, temp: next }));
  };
  const confirmVariant = async () => {
    await applySelections(vEditor.item, vEditor.temp);
    closeVariantEditor();
  };

  const removeItem = async (item) => {
    setConfirmDialog({
      open: true,
      title: "Xác nhận xoá",
      content: "Xoá sản phẩm này khỏi giỏ?",
      onConfirm: async () => {
        try {
          await cartService.removeItem(item._id);
          fetchCart();
          closeConfirmDialog();
        } catch (e) {
          console.error("Lỗi xoá item:", e);
          closeConfirmDialog();
        }
      },
    });
  };

  const removeSelected = async () => {
    if (!checked.size) return;
    setConfirmDialog({
      open: true,
      title: "Xác nhận xoá",
      content: `Xoá ${checked.size} sản phẩm đã chọn khỏi giỏ?`,
      onConfirm: async () => {
        try {
          await cartService.removeItems(Array.from(checked));
          fetchCart();
          setChecked(new Set());
          closeConfirmDialog();
        } catch (e) {
          console.error("Lỗi xoá items:", e);
          closeConfirmDialog();
        }
      },
    });
  };

  const clearCart = async () => {
    setConfirmDialog({
      open: true,
      title: "Xoá tất cả?",
      content: "Xoá toàn bộ sản phẩm trong giỏ?",
      onConfirm: async () => {
        try {
          await cartService.clear();
          fetchCart();
          closeConfirmDialog();
        } catch (e) {
          console.error("Lỗi xoá giỏ hàng:", e);
          closeConfirmDialog();
        }
      },
    });
  };

  // tổng theo item đã chọn (và hợp lệ tồn kho)
  const selectedSummary = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const it of items) {
      if (!checked.has(it._id)) continue;
      const pick = pickState[it._id] || {};
      const v =
        findVariantById(it.available_variants, pick.selectedVarId) ||
        findVariantById(it.available_variants, it.variant_id);
      if ((v?.stock ?? 0) <= 0) continue;
      if (it.qty > (v?.stock ?? 0)) continue;
      total += it.total || it.price * it.qty;
      count++;
    }
    return { total, count };
  }, [items, checked, pickState]);

  const finalTotal = useMemo(() => {
    if (appliedVoucher) {
      return Math.max(0, selectedSummary.total - appliedVoucher.discountAmount);
    }
    return selectedSummary.total;
  }, [selectedSummary.total, appliedVoucher]);

  const canCheckout = selectedSummary.count > 0;

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setToast({
        open: true,
        message: "Vui lòng nhập mã voucher",
        severity: "warning",
      });
      return;
    }
    applyVoucherMutation.mutate({
      code: voucherCode,
      total: selectedSummary.total,
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper elevation={0} sx={{ p: 2 }}>
          <LinearProgress />
          <Typography variant="body2" mt={2}>
            Đang tải giỏ hàng…
          </Typography>
        </Paper>
      </Box>
    );
  }
  if (err) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{err}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* spacing lớn không ảnh hưởng, nhưng để mặc định cho gọn */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ flex: 1, alignItems: "center" }}
        >
          <Grid item xs={12} lg={11} xl={10}>
            {/* QUAN TRỌNG: thêm class card-soft (đã override overflow trong CSS) */}
            <Card
              sx={{
                overflow: "visible",
                boxShadow: "none",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, md: 3 },
                  overflow: "visible",
                }}
              >
                <Grid
                  container
                  spacing={3}
                  alignItems="flex-start"
                  sx={{ overflow: "visible" }}
                >
                  {/* LEFT: Items */}
                  <Grid item xs={12} lg={7} sx={{ overflow: "visible" }}>
                    {/* header */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1.5}
                    >
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
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          mb={0.25}
                        >
                          Giỏ hàng
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bạn có {items.length} sản phẩm trong giỏ
                        </Typography>
                      </Box>
                      <Box>
                        <Checkbox
                          color="primary"
                          checked={
                            checked.size === items.length && items.length > 0
                          }
                          indeterminate={
                            checked.size > 0 && checked.size < items.length
                          }
                          onChange={(e) => toggleAll(e.target.checked)}
                          sx={{ mr: 0.5 }}
                        />
                        <Typography variant="body2" display="inline">
                          Chọn tất cả
                        </Typography>
                      </Box>
                    </Stack>

                    {/* items list */}
                    <Stack spacing={1.5}>
                      {items.map((it) => {
                        const pick = pickState[it._id] || {
                          selections: {},
                          selectedVarId: it.variant_id,
                        };
                        const selectedVar =
                          findVariantById(
                            it.available_variants,
                            pick.selectedVarId
                          ) ||
                          findVariantById(it.available_variants, it.variant_id);
                        const { orderedKeys } = groupVariantOptions(
                          it.available_variants
                        );
                        const productHref = it.product?.slug
                          ? `/product/${it.product.slug}`
                          : `/product/${it.product_id}`;
                        const price = it.price || 0;
                        const subTotal = it.total || price * it.qty;

                        const outOfStock = (selectedVar?.stock ?? 0) <= 0;
                        const overStock =
                          !outOfStock && it.qty > (selectedVar?.stock ?? 0);

                        const summary = orderedKeys
                          .map((k) => pick.selections?.[k])
                          .filter(Boolean)
                          .join(", ");

                        return (
                          <Paper
                            key={it._id}
                            variant="outlined"
                            sx={{
                              borderRadius: "14px",
                              overflow: "hidden",
                              borderColor: "primary.light",
                              background: "#fff",
                            }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr",
                                  md: "1fr auto",
                                },
                                gap: 1.5,
                                alignItems: "stretch",
                                p: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "auto 88px 1fr",
                                  alignItems: "center",
                                  gap: 1.25,
                                }}
                              >
                                <Checkbox
                                  color="primary"
                                  checked={checked.has(it._id)}
                                  onChange={() => toggleOne(it._id)}
                                  sx={{ mr: 1 }}
                                />
                                <Box
                                  sx={{
                                    width: 88,
                                    height: 88,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "primary.50",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {it.image ? (
                                    <Box
                                      component="img"
                                      src={it.image}
                                      alt={it.name}
                                      sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        color: "text.secondary",
                                      }}
                                    >
                                      <ImageNotSupported fontSize="small" />
                                    </Box>
                                  )}
                                </Box>
                                <Box>
                                  <Typography
                                    component={RouterLink}
                                    to={productHref}
                                    fontWeight={600}
                                    sx={{
                                      color: "inherit",
                                      textDecoration: "none",
                                      "&:hover": {
                                        color: "primary.dark",
                                        textDecoration: "underline",
                                      },
                                    }}
                                  >
                                    {it.name}
                                  </Typography>
                                  {(outOfStock || overStock) && (
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={0.5}
                                      mt={0.5}
                                    >
                                      <WarningAmber
                                        color="warning"
                                        fontSize="small"
                                      />
                                      <Typography
                                        variant="caption"
                                        color="warning.main"
                                      >
                                        {outOfStock
                                          ? "Biến thể đã hết hàng"
                                          : "Vượt quá tồn kho"}
                                      </Typography>
                                    </Stack>
                                  )}

                                  {/* Variant summary & change button */}
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                    mt={0.75}
                                    flexWrap="wrap"
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Phân loại:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {summary || "—"}
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      endIcon={<ExpandMore />}
                                      onClick={(e) => openVariantEditor(e, it)}
                                      sx={{
                                        borderRadius: "12px",
                                        borderColor: "primary.light",
                                      }}
                                    >
                                      Thay đổi
                                    </Button>
                                  </Stack>
                                </Box>
                              </Box>

                              <Box
                                sx={{
                                  justifyContent: {
                                    xs: "space-between",
                                    md: "flex-end",
                                  },
                                }}
                              >
                                {/* Qty + Price + Remove */}
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1.25}
                                  alignItems={{ sm: "center" }}
                                  justifyContent="flex-end"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                  >
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() =>
                                        handleQty(it, Math.max(1, it.qty - 1))
                                      }
                                      disabled={it.qty <= 1}
                                      sx={{ borderRadius: "10px" }}
                                    >
                                      <Remove />
                                    </IconButton>
                                    <TextField
                                      size="small"
                                      type="number"
                                      value={it.qty}
                                      inputProps={{
                                        min: 1,
                                        style: {
                                          textAlign: "center",
                                          width: 64,
                                        },
                                      }}
                                      onChange={(e) =>
                                        handleQty(
                                          it,
                                          Math.max(
                                            1,
                                            Number(e.target.value) || 1
                                          )
                                        )
                                      }
                                      sx={{
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: "12px",
                                        },
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleQty(it, it.qty + 1)}
                                      sx={{ borderRadius: "10px" }}
                                    >
                                      <Add />
                                    </IconButton>
                                  </Stack>

                                  <Box textAlign="right" minWidth={160}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Đơn giá
                                    </Typography>
                                    <Typography fontWeight={700}>
                                      {formatCurrency(price)} {currency}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mt: 0.5 }}
                                    >
                                      Tạm tính
                                    </Typography>
                                    <Typography fontWeight={800}>
                                      {formatCurrency(subTotal)} {currency}
                                    </Typography>
                                  </Box>

                                  <Tooltip title="Xoá khỏi giỏ">
                                    <IconButton
                                      color="error"
                                      onClick={() => removeItem(it)}
                                      sx={{ borderRadius: "10px" }}
                                    >
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
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutline />}
                        onClick={removeSelected}
                        disabled={!checked.size}
                        sx={{ borderRadius: "12px" }}
                      >
                        Xoá đã chọn
                      </Button>
                      <Stack direction="row" spacing={1.5}>
                        {/* <Button component={RouterLink} to="/" variant="outlined" color="inherit">
                          ← Tiếp tục mua sắm
                        </Button> */}
                        <Button
                          variant="text"
                          color="inherit"
                          onClick={clearCart}
                          sx={{ borderRadius: "12px" }}
                        >
                          Xoá toàn bộ
                        </Button>
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* RIGHT: Summary */}
                  <Grid item xs={12} lg={5}>
                    <Box
                      sx={{
                        position: { lg: "sticky" },
                        top: { lg: "85px" },
                        height: "max-content",
                        alignSelf: "flex-start",
                        zIndex: 5,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          maxHeight: {
                            lg: "calc(100vh - 85px - 16px)",
                          },
                          overflow: { lg: "auto" },
                        }}
                      >
                        <Box
                          sx={{
                            background: "#fff",
                            border: "1px solid",
                            borderColor: "primary.light",
                            borderRadius: "14px",
                            p: 2,
                            mb: 1.5,
                          }}
                        >
                          <Typography variant="h6" fontWeight={700} mb={1}>
                            Thông tin đơn hàng
                          </Typography>
                          <Stack spacing={1.1}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography color="text.secondary">
                                Số sản phẩm đã chọn
                              </Typography>
                              <Typography fontWeight={600}>
                                {selectedSummary.count}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography color="text.secondary">
                                Tạm tính
                              </Typography>
                              <Typography fontWeight={700}>
                                {formatCurrency(selectedSummary.total)}{" "}
                                {currency}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" spacing={1}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Nhập mã voucher"
                                inputProps={{ maxLength: 32 }}
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                  },
                                }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                sx={{ borderRadius: "12px" }}
                                onClick={handleApplyVoucher}
                                disabled={applyVoucherMutation.isPending}
                              >
                                {applyVoucherMutation.isPending
                                  ? "Đang áp dụng..."
                                  : "ÁP DỤNG"}
                              </Button>
                            </Stack>
                            {appliedVoucher && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ color: "success.main" }}
                              >
                                <Typography variant="body2">
                                  Giảm giá (
                                  <Chip
                                    label={appliedVoucher.voucherCode}
                                    size="small"
                                    onDelete={() => {
                                      setAppliedVoucher(null);
                                      setVoucherCode("");
                                    }}
                                  />
                                  )
                                </Typography>
                                <Typography fontWeight={600}>
                                  -{" "}
                                  {formatCurrency(
                                    appliedVoucher.discountAmount
                                  )}
                                </Typography>
                              </Stack>
                            )}
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography color="text.secondary">
                                Phí vận chuyển
                              </Typography>
                              <Typography>0</Typography>
                            </Stack>
                          </Stack>
                        </Box>

                        <Box
                          sx={{
                            background: "#fff",
                            border: "1px solid",
                            borderColor: "primary.light",
                            borderRadius: "14px",
                            p: 2,
                            mb: 1.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Typography fontWeight={700}>
                              Tổng thanh toán
                            </Typography>
                            <Typography fontWeight={900} fontSize={18}>
                              {formatCurrency(finalTotal)} {currency}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Đã bao gồm VAT (nếu có)
                          </Typography>
                          <Button
                            fullWidth
                            size="large"
                            sx={{ mt: 1.5, borderRadius: "14px" }}
                            variant="contained"
                            color="primary"
                            startIcon={<ShoppingCartCheckout />}
                            disabled={!canCheckout}
                            onClick={() => {
                              const selectedIds = Array.from(checked);
                              navigate("/checkout", {
                                state: { selected_item_ids: selectedIds },
                              });
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
        PaperProps={{
          sx: {
            p: 2,
            width: 320,
            boxShadow: theme.shadows[3],
            border: "1px solid",
            borderColor: "grey.200",
          },
        }}
      >
        {vEditor.item &&
          (() => {
            const { optionGroups, orderedKeys } = groupVariantOptions(
              vEditor.item.available_variants
            );
            const currentSelections = vEditor.temp;
            return (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Chọn phân loại
                </Typography>
                <Stack spacing={1.5}>
                  {orderedKeys.map((key) => {
                    const values = optionGroups[key] || [];
                    const disabledMap = buildDisabledMap(
                      vEditor.item.available_variants,
                      key,
                      values
                    );
                    return (
                      <Box key={key}>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          mb={0.5}
                        >
                          {titleize(key)}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {values.map((val) => (
                            <Chip
                              key={val}
                              label={val}
                              size="small"
                              variant={
                                norm(currentSelections[key]) === norm(val)
                                  ? "filled"
                                  : "outlined"
                              }
                              color={
                                norm(currentSelections[key]) === norm(val)
                                  ? "primary"
                                  : "default"
                              }
                              onClick={() => pickTemp(key, val)}
                              disabled={disabledMap.get(val)}
                              sx={{ borderRadius: "9999px" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={closeVariantEditor}
                    sx={{ borderRadius: "12px" }}
                  >
                    Huỷ
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={confirmVariant}
                    sx={{ borderRadius: "12px" }}
                  >
                    Xác nhận
                  </Button>
                </Stack>
              </Box>
            );
          })()}
      </Popover>

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Huỷ</Button>
          <Button onClick={confirmDialog.onConfirm} color="primary" autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
