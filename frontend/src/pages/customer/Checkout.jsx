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
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";
import LocationOn from "@mui/icons-material/LocationOn";
import ArrowBack from "@mui/icons-material/ArrowBack";
import PersonOutline from "@mui/icons-material/PersonOutline";
import FmdGood from "@mui/icons-material/FmdGood";

import { addressService } from "../../services/addressService";
import { checkoutService } from "../../services/checkoutService";
import { formatCurrency } from "../../utils/formatCurrency";
import AddressDialog from "../../components/AddressDialog";
import AddressPickerDialog from "../../components/AddressPickerDialog";
import PaymentMethodPanel from "../../components/PaymentMethodPanel";
import { useToast } from "../../components/common/Toast";

export default function Checkout() {
  const toast = useToast();
  const [paymentExtra, setPaymentExtra] = useState({});
  const nav = useNavigate();
  const loc = useLocation();
  const selectedIds = loc.state?.selected_item_ids || [];

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");

  const [openPicker, setOpenPicker] = useState(false);
  const [openAddr, setOpenAddr] = useState(false);
  const [editAddr, setEditAddr] = useState(null);

  const [shipper, setShipper] = useState("GHN");
  const [voucherCode, setVoucherCode] = useState("");
  const [note, setNote] = useState("");

  const [preview, setPreview] = useState(null);
  const [method, setMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const extractNewId = (created) =>
    created?._id ||
    created?.item?._id ||
    created?.data?.item?._id ||
    created?.data?._id ||
    created?.id ||
    created?.data?.id ||
    "";

  const loadAddresses = async () => {
    const list = await addressService.list();
    const arr = Array.isArray(list)
      ? list
      : list?.items || list?.addresses || list?.data || [];
    setAddresses(arr);
    const def = arr.find((x) => x.is_default);
    const keep = arr.find((x) => x._id === addressId);
    setAddressId(def?._id || keep?._id || arr[0]?._id || "");
  };

  const runPreview = async (addrId = addressId) => {
    if (!addrId) return;
    const payload = {
      selected_item_ids: selectedIds,
      shipping_provider: shipper,
      voucher_code: voucherCode,
      address_id: addrId,
    };
    const p = await checkoutService.preview(payload);
    setPreview(p);
  };

  /* ---------------- Effects ---------------- */
  useEffect(() => {
    loadAddresses();
  }, []);
  useEffect(() => {
    if (addressId) runPreview(addressId);
  }, [addressId, shipper, voucherCode]); // eslint-disable-line

  /* ---------------- Actions ---------------- */
  const payment = async () => {
    if (!addressId) return;
    setLoading(true);
    try {
      const payload = {
        selected_item_ids: selectedIds,
        note,
        shipping_provider: shipper,
        voucher_code: voucherCode,
        payment_method: method,
        address_id: addressId,
        return_urls: {
          success: `${window.location.origin}/payment/return?status=success`,
          vnpay: `${window.location.origin}/payment/return?vnpay=1`,
          momo: `${window.location.origin}/payment/return?momo=1`,
        },
      };
      const data = await checkoutService.confirm(payload);
      if (data.pay_url) {
        toast.info("Chuyển đến cổng thanh toán...");
        window.location.href = data.pay_url;
      } else {
        toast.success("Đơn hàng đã được tạo thành công.");
         nav(`/payment/return?status=success&cod=1`);
      }
      
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------- Popup Picker handlers (Thêm/Sửa/Xoá/Chọn) -------- */
  const handleOpenAddFromPicker = () => {
    setOpenPicker(false);
    setEditAddr(null);
    setOpenAddr(true);
  };

  const handleOpenEditFromPicker = (a) => {
    setOpenPicker(false);
    setEditAddr(a);
    setOpenAddr(true);
  };

  const handleDeleteFromPicker = async (id) => {
    try {
      await addressService.remove(id);
      await loadAddresses();
      if (id === addressId) setAddressId(""); // nếu xoá địa chỉ đang dùng
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  /* -------- Dialog Thêm/Sửa submit -------- */
  const handleSubmitAddress = async (payload) => {
    try {
      if (editAddr) {
        await addressService.update(editAddr._id, payload);
        await loadAddresses();
        setOpenAddr(false);
        toast.success("Đã cập nhật địa chỉ.");
      } else {
        const created = await addressService.create(payload);
        const newId = extractNewId(created);
        await loadAddresses();
        if (newId) setAddressId(newId); // dùng luôn địa chỉ mới
        setOpenAddr(false);
        toast.success("Đã thêm địa chỉ mới.");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  const addr = addresses.find((a) => a._id === addressId);
  const total = preview?.total || 0;
  const payBtnText =
    method === "COD"
      ? "Đặt hàng (COD)"
      : `Thanh toán ${formatCurrency(total)} VND`;

  return (
    <Box
      className="soft-wrap"
      sx={{ background: "#f6f7fb", minHeight: "100dvh", py: 4 }}
    >
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
            to="/cart"
            variant="outlined"
            size="small"
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Quay lại giỏ hàng
          </Button>
        </Stack>

        {/* Địa chỉ đang chọn + Thay đổi */}
        <Card className="soft-card" sx={{ borderRadius: 3, mb: 2 }}>
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
              <Button size="small" onClick={() => setOpenPicker(true)}>
                Thay đổi
              </Button>
            </Stack>

            {addr ? (
              <Paper
                variant="outlined"
                className="soft-item"
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  transition: "box-shadow .25s ease, transform .25s ease",
                }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    component="div"
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <PersonOutline fontSize="small" /> <b>{addr.name}</b>
                    <Chip size="small" variant="outlined" label={addr.phone} />
                    {addr.is_default && (
                      <Chip size="small" color="primary" label="Mặc định" />
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <FmdGood fontSize="small" />
                    {[addr.street, addr.ward, addr.district, addr.city]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>
                </Stack>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có địa chỉ. Nhấn <b>Thay đổi</b> để thêm/chọn.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Sản phẩm đã chọn */}
        <Card className="soft-card" sx={{ borderRadius: 3, mb: 2 }}>
          <CardContent>
            <Typography fontWeight={700} mb={1}>
              Sản phẩm đã chọn
            </Typography>
            {!preview?.items?.length && (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu. Hãy chọn địa chỉ để tải tạm tính.
              </Typography>
            )}
            <Stack spacing={1.25} className="stagger">
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
        <Card className="soft-card" sx={{ borderRadius: 3, mb: 2 }}>
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
                  <Button
                    variant="outlined"
                    onClick={() => runPreview(addressId)}
                  >
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
          <Card className="soft-card" sx={{ borderRadius: 3, mb: 2 }}>
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
                  label="Thẻ tín dụng/ghi nợ"
                />
              </RadioGroup>

              <PaymentMethodPanel
                method={method}
                onExtraChange={(extra) => setPaymentExtra(extra)}
              />
            </CardContent>
          </Card>

          <Card className="soft-card" sx={{ borderRadius: 3, width: { lg: 380 } }}>
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
                disabled={loading || !preview || !addressId}
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

      {/* Popup chọn địa chỉ đã lưu (quản lý Thêm/Sửa/Xoá/Chọn) */}
      <AddressPickerDialog
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        addresses={addresses}
        selectedId={addressId}
        onSelect={(id) => setAddressId(id)}
        onAdd={handleOpenAddFromPicker}
        onEdit={handleOpenEditFromPicker}
        onDelete={handleDeleteFromPicker}
      />

      {/* Dialog Thêm/Sửa — create -> chọn luôn địa chỉ mới */}
      <AddressDialog
        open={openAddr}
        initial={editAddr}
        onClose={() => setOpenAddr(false)}
        onSubmit={handleSubmitAddress}
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
