import React, { useEffect, useMemo, useState } from "react";
import { Box, Stack, Button, Grid, Paper, Typography } from "@mui/material";
import Download from "@mui/icons-material/Download";
import DashboardCards from "../../components/DashboardCards";
import RevenueLineChart from "../../components/charts/RevenueLineChart";
import OrderStatusPie from "../../components/charts/OrderStatusPie";
import TopProductsTable from "../../components/TopProductsTable";
import TopCustomersTable from "../../components/TopCustomersTable";
import { dashboardService } from "../../services/dashboardService";
import useSocket from "../../hooks/useSocket";
import { useAuth } from "../../context/AuthContext";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState();
  const [rev, setRev] = useState([]);
  const [status, setStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [forecast, setForecast] = useState([]);

  const sock = useSocket(user?._id);

  useEffect(() => {
    (async () => {
      const [k, r, s, tp, tc, fc] = await Promise.all([
        dashboardService.kpis(),
        dashboardService.revenue({ granularity: "day" }),
        dashboardService.orderStatus(),
        dashboardService.topProducts(10),
        dashboardService.topCustomers(10),
        dashboardService.forecast(14),
      ]);
      setKpis(k); setRev(r); setStatus(s); setTopProducts(tp); setTopCustomers(tc); setForecast(fc);
    })();
  }, []);

  useEffect(() => {
    const s = sock.current;
    if (!s) return;
    const onUpd = (payload) => {
      // Simple strategy: refetch KPIs + status
      dashboardService.kpis().then(setKpis);
      dashboardService.orderStatus().then(setStatus);
    };
    s.on("order:update", onUpd);
    return () => s.off("order:update", onUpd);
  }, [sock]);

  const exportExcel = async () => {
    const res = await dashboardService.exportExcel();
    downloadBlob(res.data, `dfs-dashboard-${Date.now()}.xlsx`);
  };
  const exportPdf = async () => {
    const res = await dashboardService.exportPdf();
    downloadBlob(res.data, `dfs-dashboard-${Date.now()}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Bảng điều khiển</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download/>} onClick={exportExcel}>Xuất Excel</Button>
          <Button variant="contained" startIcon={<Download/>} onClick={exportPdf}>Xuất PDF</Button>
        </Stack>
      </Stack>

      <DashboardCards kpis={kpis} />

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 360, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Doanh thu theo ngày + dự báo</Typography>
            <div style={{ height: 300 }}>
              <RevenueLineChart rows={rev} forecast={forecast} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360, borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Trạng thái đơn hàng</Typography>
            <div style={{ height: 300 }}>
              <OrderStatusPie rows={status} />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <TopProductsTable rows={topProducts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TopCustomersTable rows={topCustomers} />
        </Grid>
      </Grid>
    </Box>
  );
}
