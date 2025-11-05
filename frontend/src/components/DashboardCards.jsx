import React from "react";
import { Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import TrendingUp from "@mui/icons-material/TrendingUp";
import LocalShipping from "@mui/icons-material/LocalShipping";

export default function DashboardCards({ kpis }) {
  const primary = "#1976d2"; // DFS blue
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TrendingUp sx={{ color: primary, fontSize: 40 }} />
            <div>
              <Typography variant="overline" color="text.secondary">Hôm nay</Typography>
              <Typography variant="h5" fontWeight={700}>{(kpis?.todayRevenue||0).toLocaleString("vi-VN")} ₫</Typography>
              <Chip size="small" label="Doanh thu" sx={{ mt: 1, bgcolor: primary, color: "#fff" }} />
            </div>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <LocalShipping sx={{ color: primary, fontSize: 40 }} />
            <div>
              <Typography variant="overline" color="text.secondary">Đơn đang xử lý</Typography>
              <Typography variant="h5" fontWeight={700}>{kpis?.processingOrders||0}</Typography>
              <Chip size="small" label="Real-time" sx={{ mt: 1, bgcolor: primary, color: "#fff" }} />
            </div>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
