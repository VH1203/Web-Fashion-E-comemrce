import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Paper, Stack, Typography, Button, Chip } from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Home from "@mui/icons-material/Home";
import ReceiptLong from "@mui/icons-material/ReceiptLong";

export default function PaymentReturn() {
  const nav = useNavigate();
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const status = params.get("status") || (params.get("vnpay") || params.get("momo") ? "success" : "fail");
  const orderCode = params.get("order_code") || params.get("orderId") || params.get("order_code_vnp") || "";
  const isSuccess = status === "success";

  const [count, setCount] = useState(5);
  useEffect(() => {
    const t = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (count === 0) nav("/");
  }, [count, nav]);

  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2, background: "#f6f7fb" }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, maxWidth: 560, width: "100%", textAlign: "center" }}>
        <Stack spacing={1.5} alignItems="center">
          {isSuccess ? (
            <CheckCircle color="success" sx={{ fontSize: 56 }} />
          ) : (
            <ErrorOutline color="error" sx={{ fontSize: 56 }} />
          )}
          <Typography variant="h5" fontWeight={800}>
            {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
          </Typography>
          {!!orderCode && (
            <Chip color={isSuccess ? "success" : "error"} variant="outlined" label={`Mã đơn: ${orderCode}`} />
          )}
          <Typography variant="body2" color="text.secondary">
            {isSuccess
              ? "Cảm ơn bạn đã mua hàng. Bạn sẽ được chuyển về trang chủ."
              : "Có lỗi trong quá trình thanh toán. Bạn có thể thử lại hoặc xem đơn hàng."}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button startIcon={<Home />} component={RouterLink} to="/" variant="outlined">
              Về trang chủ ({count}s)
            </Button>
            <Button startIcon={<ReceiptLong />} component={RouterLink} to="/orders" variant="contained">
              Xem đơn hàng
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
