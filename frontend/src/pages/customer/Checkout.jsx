// src/pages/customer/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Paper,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBack from "@mui/icons-material/ArrowBack";
import PersonOutline from "@mui/icons-material/PersonOutline";
import FmdGood from "@mui/icons-material/FmdGood";
import Star from "@mui/icons-material/Star";
import LocalShipping from "@mui/icons-material/LocalShipping";
import HomeIcon from '@mui/icons-material/Home';

import { addressService } from "../../services/addressService";
import { checkoutService } from "../../services/checkoutService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/ToastProvider";

import AddressDialog from "../../components/AddressDialog";
import AddressPickerDialog from "../../components/AddressDialogPicker";

export default function Checkout() {
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const selectedIds = loc.state?.selected_item_ids || [];

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

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [openPicker, setOpenPicker] = useState(false);

  // Create/Update address (mở form riêng)
  const [openAddrForm, setOpenAddrForm] = useState(false);
  const [editAddr, setEditAddr] = useState(null);

  // Checkout states
  const [shipper, setShipper] = useState("GHN");
  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("COD"); // COD|VNPAY|MOMO|CARD|WALLET

  // Preview
  const [preview, setPreview] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load address list
  const loadAddresses = async () => {
    try {
      const list = await addressService.list();
      const arr = Array.isArray(list)
        ? list
        : list?.items || list?.addresses || list?.data || [];
      setAddresses(arr);
      if (!addressId) {
        const d = arr.find((x) => x.is_default) || arr[0];
        setAddressId(d?._id || "");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Không tải được địa chỉ");
    }
  };

  // Preview order
  const runPreview = async () => {
    if (!selectedIds?.length) {
      setPreview(null);
      return;
    }
    if (!addressId) return;
    try {
      setLoadingPreview(true);
      const p = await checkoutService.preview({
        selected_item_ids: selectedIds,
        address_id: addressId,
        shipping_provider: shipper,
        voucher_code: voucherCode || undefined,
      });
      setPreview(p);
    } catch (e) {
      setPreview(null);
      toast.error(e?.response?.data?.message || e.message || "Không tính được tạm tính");
    } finally {
      setLoadingPreview(false);
    }
  };

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run preview khi đổi các tham số
  useEffect(() => {
    if (addressId) runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId, shipper, voucherCode]);

  // Thanh toán / Tạo đơn
  const onPay = async () => {
    if (!addressId) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng");
      return;
    }
    if (!preview) {
      toast.error("Chưa có tạm tính. Vui lòng thử lại.");
      return;
    }
    setLoadingPay(true);
    try {
      const data = await checkoutService.confirm({
        selected_item_ids: selectedIds,
        address_id: addressId,
        note,
        shipping_provider: shipper,
        voucher_code: voucherCode || undefined,
        payment_method: method, // COD|VNPAY|MOMO|WALLET|CARD
        return_urls: {
          success: `${window.location.origin}/payment/return?status=success`,
          vnpay: `${window.location.origin}/payment/return?vnpay=1`,
          momo: `${window.location.origin}/payment/return?momo=1`,
        },
      });

      if (data?.pay_url) {
        window.location.href = data.pay_url;
      } else {
        toast.success("Đặt hàng thành công");
        nav("/orders");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Thanh toán thất bại");
    } finally {
      setLoadingPay(false);
    }
  };

  // Tính text cho nút thanh toán
  const payBtnText =
    method === "COD"
      ? "Đặt hàng (COD)"
      : `Thanh toán ${formatCurrency(preview?.total || 0)} VND`;

  const currentAddr = addresses.find((a) => a._id === addressId);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        py: 4,
        background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)",
        "@keyframes float": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
          "100%": { transform: "translateY(0)" },
        },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={800}>
            Thanh toán
          </Typography>
          <Button
            component={RouterLink}
            to="/cart"
            variant="outlined"
            size="small"
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Quay lại giỏ hàng
          </Button>
        </Stack>

        {/* Địa chỉ nhận hàng */}
        <Card
          sx={(theme) => ({
            borderRadius: 3,
            mb: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.18),
            boxShadow: "0 6px 20px rgba(0, 92, 184, 0.06)",
          })}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography fontWeight={700}><HomeIcon fontSize="small" sx={{ color: "blue", mr: 0.5, animation: "float 3s ease-in-out infinite" }} />Địa chỉ nhận hàng</Typography>
              <Button size="small" onClick={() => setOpenPicker(true)}>
                Thay đổi
              </Button>
            </Stack>

            {currentAddr ? (
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: alpha(theme.palette.primary.main, 0.18),
                })}
              >
                <Stack spacing={0.5}>
                  <Typography component="div" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <PersonOutline fontSize="small" />
                    <b>{currentAddr.name}</b>
                    <Chip size="small" variant="outlined" label={currentAddr.phone} />
                    {currentAddr.is_default && (
                      <Chip
                        size="small"
                        color="warning"
                        icon={<Star sx={{ fontSize: 16 }} />}
                        label="Mặc định"
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <FmdGood fontSize="small" sx={{ animation: "float 3s ease-in-out infinite" }} />
                    {prettyJoin([currentAddr.street, currentAddr.ward, currentAddr.district, currentAddr.city])}
                  </Typography>
                </Stack>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có địa chỉ. Nhấn <b>Thay đổi</b> để thêm mới.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Sản phẩm đã chọn */}
        <Card
          sx={(theme) => ({
            borderRadius: 3,
            mb: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.18),
            boxShadow: "0 6px 20px rgba(0, 92, 184, 0.06)",
          })}
        >
          <CardContent>
            <Typography fontWeight={700} mb={1}>
              Sản phẩm đã chọn
            </Typography>
            {!preview?.items?.length ? (
              <Typography variant="body2" color="text.secondary">
                {loadingPreview ? "Đang tải tạm tính…" : "Chưa có dữ liệu. Hãy chọn địa chỉ để tải tạm tính."}
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {preview.items.map((it) => (
                  <Stack
                    key={`${it.product_id}-${it.variant_id}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 10,
                          overflow: "hidden",
                          background: "#f3f5f8",
                          flexShrink: 0,
                        }}
                      >
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt={it.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : null}
                      </div>
                      <Stack>
                        <Typography fontWeight={600}>{it.name}</Typography>
                        {!!it.variant_text && (
                          <Typography variant="caption" color="text.secondary">
                            {it.variant_text}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">SL: {it.qty}</Typography>
                      </Stack>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography variant="body2" color="text.secondary">Đơn giá</Typography>
                      <Typography fontWeight={700}>{formatCurrency(it.price)} VND</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Thành tiền</Typography>
                      <Typography fontWeight={800}>{formatCurrency(it.total)} VND</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Đơn vị vận chuyển + Voucher + Ghi chú */}
        <Card
          sx={(theme) => ({
            borderRadius: 3,
            mb: 2,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.18),
            boxShadow: "0 6px 20px rgba(0, 92, 184, 0.06)",
          })}
        >
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              {/* Shipper */}
              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>
                  <LocalShipping fontSize="small" sx={{ mr: 0.5, animation: "float 3s ease-in-out infinite" }} /> Đơn
                  vị vận chuyển
                </Typography>
                <RadioGroup row value={shipper} onChange={(e) => setShipper(e.target.value)}>
                  <FormControlLabel value="GHN" control={<Radio />} label="GHN" />
                  <FormControlLabel value="GHTK" control={<Radio />} label="GHTK" />
                </RadioGroup>
                <Typography variant="body2" color="text.secondary">
                  Phí ship dự kiến: {preview ? `${formatCurrency(preview.shipping_fee)} VND` : "—"}
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

              {/* Voucher */}
              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>Voucher</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Nhập mã voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") runPreview(); }}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={runPreview} disabled={loadingPreview}>Áp dụng</Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Giảm: {preview ? `${formatCurrency(preview.discount)} VND` : "—"}
                </Typography>
              </Stack>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

              {/* Note */}
              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>Lời nhắn cho shop</Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Ví dụ: Giao giờ hành chính…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Payment methods + Summary */}
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="flex-start">
          {/* Payment methods */}
          <Card
            sx={(theme) => ({
              borderRadius: 3,
              mb: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.18),
              boxShadow: "0 6px 20px rgba(0, 92, 184, 0.06)",
              flex: 1,
            })}
          >
            <CardContent>
              <Typography fontWeight={700} mb={1}>Phương thức thanh toán</Typography>
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
                <FormControlLabel value="VNPAY" control={<Radio />} label="VNPay (QR/Thẻ)" />
                <FormControlLabel value="MOMO" control={<Radio />} label="MoMo" />
                <FormControlLabel value="CARD" control={<Radio />} label="Thẻ tín dụng/ghi nợ (qua VNPay)" />
                <FormControlLabel value="WALLET" control={<Radio />} label="Ví nền tảng" />
              </RadioGroup>

              <PaymentMethodPanel
                method={method}
                onExtraChange={(extra) => setPaymentExtra(extra)}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card
            sx={(theme) => ({
              borderRadius: 3,
              mb: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.18),
              boxShadow: "0 6px 20px rgba(0, 92, 184, 0.06)",
              width: { lg: 380 },
            })}
          >
            <CardContent>
              <Typography fontWeight={800} mb={1}>Tóm tắt</Typography>
              <Stack spacing={0.75}>
                <Row label="Tạm tính" value={preview ? `${formatCurrency(preview.subtotal)} VND` : "—"} />
                <Row label="Phí vận chuyển" value={preview ? `${formatCurrency(preview.shipping_fee)} VND` : "—"} />
                <Row label="Giảm giá" value={preview ? `- ${formatCurrency(preview.discount)} VND` : "—"} />
                <Divider sx={{ my: 1 }} />
                <Row big label="Tổng" value={preview ? `${formatCurrency(preview.total)} VND` : "—"} />
              </Stack>
              <Button
                fullWidth
                sx={{ mt: 2 }}
                disabled={loadingPay || loadingPreview || !preview || !addressId}
                variant="contained"
                onClick={onPay}
              >
                {payBtnText}
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                * COD: ghi nhận đơn ngay. * Online: chuyển đến cổng thanh toán để xác nhận.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Form thêm/sửa địa chỉ (mở từ popup Thay đổi) */}
      <AddressDialog
        open={openAddrForm}
        initial={editAddr}
        onClose={() => setOpenAddrForm(false)}
        onSubmit={async (payload) => {
          try {
            let res;
            if (editAddr) {
              res = await addressService.update(editAddr._id, payload);
              toast.success("Đã cập nhật địa chỉ");
            } else {
              res = await addressService.create(payload);
              toast.success("Đã thêm địa chỉ");
            }
            const newId = res?._id || res?.data?._id || res?.address?._id;
            await loadAddresses();
            if (newId) {
              setAddressId(newId);
              setOpenPicker(false);
              await runPreview();
            }
            setOpenAddrForm(false);
            setEditAddr(null);
          } catch (e) {
            toast.error(e?.response?.data?.message || e.message || "Lưu địa chỉ thất bại");
          }
        }}
      />

      {/* Popup Thay đổi địa chỉ */}
      <AddressPickerDialog
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        addresses={addresses}
        selectedId={addressId}
        onSelect={(id) => {
          setAddressId(id);
          toast.success("Đã chọn địa chỉ");
        }}
        onAddNew={() => {
          setOpenPicker(false);
          setEditAddr(null);
          setOpenAddrForm(true);
        }}
        onEdit={(a) => {
          setOpenPicker(false);
          setEditAddr(a);
          setOpenAddrForm(true);
        }}
        onSetDefault={async (id) => {
          try {
            await addressService.setDefault(id);
            await loadAddresses();
            setAddressId(id);
            toast.success("Đã đặt làm mặc định");
          } catch (e) {
            toast.error(e?.response?.data?.message || e.message || "Thiết lập mặc định thất bại");
          }
        }}
        onDelete={async (id) => {
          try {
            await addressService.remove(id);
            await loadAddresses();
            if (addressId === id) setAddressId("");
            toast.success("Đã xoá địa chỉ");
          } catch (e) {
            toast.error(e?.response?.data?.message || e.message || "Xoá địa chỉ thất bại");
          }
        }}
      />
    </Box>
  );
}

function Row({ label, value, big = false }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={big ? 800 : 700}>{value}</Typography>
    </Stack>
  );
}
