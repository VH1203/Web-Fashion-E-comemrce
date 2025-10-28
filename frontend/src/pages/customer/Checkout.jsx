// Checkout.jsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import LocalShipping from "@mui/icons-material/LocalShipping";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import LocationOn from "@mui/icons-material/LocationOn";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Paper from "@mui/material/Paper";
import PersonOutline from "@mui/icons-material/PersonOutline";
import FmdGood from "@mui/icons-material/FmdGood";

import { addressService } from "../../services/addressService";
import { checkoutService } from "../../services/checkoutService";
import { formatCurrency } from "../../utils/formatCurrency";
import AddressDialog from "../../components/AddressDialog";

export default function Checkout() {
  const nav = useNavigate();
  const loc = useLocation();
  const selectedIds = loc.state?.selected_item_ids || [];

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [openAddr, setOpenAddr] = useState(false);
  const [editAddr, setEditAddr] = useState(null);

  // 🔀 Chọn địa chỉ cũ/mới
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [newAddress, setNewAddress] = useState(null); // {name, phone, city, district, ward, street}

  const [shipper, setShipper] = useState("GHN");
  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");

  const [preview, setPreview] = useState(null);
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const loadAddresses = async () => {
    const list = await addressService.list();
    const arr = Array.isArray(list)
      ? list
      : list?.items || list?.addresses || list?.data || [];
    setAddresses(arr);
    const d = arr.find((x) => x.is_default) || arr[0];
    setAddressId(d?._id || "");
  };

  const runPreview = async () => {
    // chạy theo mode địa chỉ
    const payload = {
      selected_item_ids: selectedIds,
      shipping_provider: shipper,
      voucher_code: voucherCode,
    };
    if (useSavedAddress) {
      if (!addressId) return;
      payload.address_id = addressId;
    } else {
      if (!newAddress) return;
      payload.address = newAddress; // dùng địa chỉ mới (không cần lưu DB)
    }
    const p = await checkoutService.preview(payload);
    setPreview(p);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Re-preview khi đổi địa chỉ / shipper / voucher / mode
  useEffect(() => {
    if (useSavedAddress && addressId) runPreview();
    if (!useSavedAddress && newAddress) runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSavedAddress, addressId, newAddress, shipper, voucherCode]);

  const total = preview?.total || 0;
  const payBtnText =
    method === "COD"
      ? "Đặt hàng (COD)"
      : `Thanh toán ${formatCurrency(total)} VND`;

  const payment = async () => {
    setLoading(true);
    try {
      const payload = {
        selected_item_ids: selectedIds,
        note,
        shipping_provider: shipper,
        voucher_code: voucherCode,
        payment_method: method, // COD|VNPAY|MOMO|WALLET|CARD
        return_urls: {
          success: `${window.location.origin}/payment/return?status=success`,
          vnpay: `${window.location.origin}/payment/return?vnpay=1`,
          momo: `${window.location.origin}/payment/return?momo=1`,
        },
      };
      if (useSavedAddress) payload.address_id = addressId;
      else payload.address = newAddress;

      const data = await checkoutService.confirm(payload);
      if (data.pay_url) window.location.href = data.pay_url;
      else nav(`/orders`); // COD: về danh sách đơn
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const addr = useSavedAddress
    ? addresses.find((a) => a._id === addressId)
    : newAddress;

  return (
    <Box sx={{ background: "#f6f7fb", minHeight: "100dvh", py: 4 }}>
      <Box sx={{ maxWidth: 1100, mx: "auto", px: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h5" fontWeight={800}>
            Thanh toán
          </Typography>
          <Button
            component={RouterLink}
            to="/cart" // đổi lại nếu route giỏ hàng của bạn khác
            variant="outlined"
            size="small"
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Quay lại giỏ hàng
          </Button>
        </Stack>

        {/* Địa chỉ */}
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography fontWeight={700}>
                <LocationOn sx={{ mr: 0.5 }} /> Địa chỉ nhận hàng
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<SwapHoriz />}
                  onClick={() => setUseSavedAddress((v) => !v)}
                >
                  {useSavedAddress
                    ? "Chuyển sang địa chỉ mới"
                    : "Dùng địa chỉ đã lưu"}
                </Button>
                {useSavedAddress ? (
                  <>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        setEditAddr(null);
                        setOpenAddr(true);
                      }}
                    >
                      Thêm
                    </Button>
                    {addr && (
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => {
                          setEditAddr(addr);
                          setOpenAddr(true);
                        }}
                      >
                        Sửa
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      setEditAddr(null);
                      setOpenAddr(true);
                    }}
                  >
                    Chọn địa chỉ (63/34)
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Mode: địa chỉ đã lưu */}
            {useSavedAddress ? (
              <>
                {/* Thay thế phần: <Stack direction="row" spacing={1} ...> Chips </Stack> */}
<Stack spacing={1}>
  {addresses.map((a) => {
    const selected = a._id === addressId;
    return (
      <Paper
        key={a._id}
        variant="outlined"
        onClick={() => setAddressId(a._id)}
        sx={{
          p: 1.25, borderRadius: 2, cursor: "pointer",
          borderColor: selected ? "primary.main" : "divider",
          bgcolor: selected ? "primary.50" : "background.paper"
        }}
      >
        <Stack spacing={0.5}>
          <Typography component="div" sx={{ display: "flex", alignItems: "center", gap: .75 }}>
            <PersonOutline fontSize="small" /> <b>{a.name}</b>
            <Chip size="small" variant={selected ? "filled" : "outlined"} label={a.phone} />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display:"flex", alignItems:"center", gap:.75 }}>
            <FmdGood fontSize="small" />
            {[a.street, a.ward, a.district, a.city].filter(Boolean).join(", ")}
          </Typography>
        </Stack>
      </Paper>
    );
  })}
</Stack>

                {!addresses.length && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Bạn chưa có địa chỉ. Hãy bấm <b>Thêm</b> để tạo địa chỉ mới.
                  </Typography>
                )}
              </>
            ) : (
              <>
                {newAddress ? (
                  <Stack
                    spacing={0.25}
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: "#f3f5f8" }}
                  >
                    <Typography fontWeight={700}>
                      {newAddress.name} • {newAddress.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[
                        newAddress.street,
                        newAddress.ward,
                        newAddress.district,
                        newAddress.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa chọn địa chỉ mới. Nhấn <b>Chọn địa chỉ (63/34)</b> để
                    chọn nhanh theo 2 bộ dữ liệu.
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sản phẩm đã chọn */}
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography fontWeight={700} mb={1}>
              Sản phẩm đã chọn
            </Typography>
            {!preview?.items?.length && (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu. Hãy chọn địa chỉ để tải tạm tính.
              </Typography>
            )}
            <Stack spacing={1.25}>
              {preview?.items?.map((it) => (
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
                      }}
                    >
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
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
                      <Typography variant="caption" color="text.secondary">
                        SL: {it.qty}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack alignItems="flex-end">
                    <Typography variant="body2" color="text.secondary">
                      Đơn giá
                    </Typography>
                    <Typography fontWeight={700}>
                      {formatCurrency(it.price)} VND
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Thành tiền
                    </Typography>
                    <Typography fontWeight={800}>
                      {formatCurrency(it.total)} VND
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Đơn vị vận chuyển + voucher + note */}
        <Card sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
            >
              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>
                  <LocalShipping fontSize="small" /> Đơn vị vận chuyển
                </Typography>
                <RadioGroup
                  row
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                >
                  <FormControlLabel
                    value="GHN"
                    control={<Radio />}
                    label="GHN"
                  />
                  <FormControlLabel
                    value="GHTK"
                    control={<Radio />}
                    label="GHTK"
                  />
                </RadioGroup>
                <Typography variant="body2" color="text.secondary">
                  Phí ship dự kiến:{" "}
                  {preview
                    ? `${formatCurrency(preview.shipping_fee)} VND`
                    : "—"}
                </Typography>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />

              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>
                  Voucher
                </Typography>
                <Stack direction="row" spacing={1}>
                  <input
                    className="MuiInputBase-input MuiInput-input"
                    placeholder="Nhập mã voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <Button variant="outlined" onClick={runPreview}>
                    Áp dụng
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Giảm:{" "}
                  {preview ? `${formatCurrency(preview.discount)} VND` : "—"}
                </Typography>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />

              <Stack flex={1}>
                <Typography fontWeight={700} mb={1}>
                  Lời nhắn cho shop
                </Typography>
                <textarea
                  rows={3}
                  className="MuiInputBase-input MuiInput-input"
                  placeholder="Ví dụ: Giao giờ hành chính…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Phương thức thanh toán + tóm tắt */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
          <Card sx={{ borderRadius: 3, flex: 1 }}>
            <CardContent>
              <Typography fontWeight={700} mb={1}>
                Phương thức thanh toán
              </Typography>
              <RadioGroup
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <FormControlLabel
                  value="COD"
                  control={<Radio />}
                  label="Thanh toán khi nhận hàng (COD)"
                />
                <FormControlLabel
                  value="VNPAY"
                  control={<Radio />}
                  label="VNPay (QR/Thẻ)"
                />
                <FormControlLabel
                  value="MOMO"
                  control={<Radio />}
                  label="MoMo"
                />
                <FormControlLabel
                  value="CARD"
                  control={<Radio />}
                  label="Thẻ tín dụng/ghi nợ (qua VNPay)"
                />
                <FormControlLabel
                  value="WALLET"
                  control={<Radio />}
                  label="Ví nền tảng"
                />
              </RadioGroup>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, width: { lg: 380 } }}>
            <CardContent>
              <Typography fontWeight={800} mb={1}>
                Tóm tắt
              </Typography>
              <Stack spacing={0.75}>
                <Row
                  label="Tạm tính"
                  value={
                    preview ? `${formatCurrency(preview.subtotal)} VND` : "—"
                  }
                />
                <Row
                  label="Phí vận chuyển"
                  value={
                    preview
                      ? `${formatCurrency(preview.shipping_fee)} VND`
                      : "—"
                  }
                />
                <Row
                  label="Giảm giá"
                  value={
                    preview ? `- ${formatCurrency(preview.discount)} VND` : "—"
                  }
                />
                <Divider sx={{ my: 1 }} />
                <Row
                  big
                  label="Tổng"
                  value={preview ? `${formatCurrency(preview.total)} VND` : "—"}
                />
              </Stack>
              <Button
                fullWidth
                sx={{ mt: 2 }}
                disabled={
                  loading ||
                  !preview ||
                  (useSavedAddress ? !addressId : !newAddress)
                }
                variant="contained"
                onClick={payment}
              >
                {payBtnText}
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}
              >
                * COD: ghi nhận đơn ngay. * Online: chuyển đến cổng thanh toán
                để xác nhận.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* AddressDialog:
          - Mode địa chỉ CŨ: onSubmit => lưu DB (create/update) rồi reload list
          - Mode địa chỉ MỚI: onSubmit => chỉ set local newAddress, không lưu DB
      */}
      <AddressDialog
        open={openAddr}
        initial={useSavedAddress ? editAddr : null}
        onClose={() => setOpenAddr(false)}
        onSubmit={async (payload) => {
          if (useSavedAddress) {
            if (editAddr) await addressService.update(editAddr._id, payload);
            else await addressService.create(payload);
            setOpenAddr(false);
            await loadAddresses();
          } else {
            setNewAddress(payload);
            setAddressId("");
            setOpenAddr(false);
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
