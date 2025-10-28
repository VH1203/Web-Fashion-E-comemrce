import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Box, Card, CardContent, Stack, Typography, Button } from "@mui/material";

export default function PaymentReturn() {
  const [q] = useSearchParams();
  const status = q.get("status") || (q.has("vnpay") || q.has("momo") ? "" : ""); // handled by backend redirects
  const [ok] = useState(() => (status === "success"));

  return (
    <Box sx={{ display:"grid", placeItems:"center", minHeight:"70dvh", p:2 }}>
      <Card sx={{ p:1.5, borderRadius:3, minWidth: 360 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            {ok ? "Thanh toán thành công" : "Kết quả thanh toán"}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {ok ? "Đơn hàng đã được xác nhận. Cảm ơn bạn!"
                : "Nếu bạn đã bị trừ tiền nhưng đơn chưa cập nhật, hệ thống sẽ tự động đối soát trong vài phút."}
          </Typography>
          <Stack direction="row" spacing={1.5} mt={2}>
            <Button component={Link} to="/orders" variant="contained">Xem đơn hàng</Button>
            <Button component={Link} to="/" variant="outlined">Về trang chủ</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
