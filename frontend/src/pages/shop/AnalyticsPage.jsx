import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatCardsGrid from "../../components/common/StarCard";
import {
  getAnalytics,
  getRevenueByMonth,
  getRevenueByCategory,
} from "../../services/shopService";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";

const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    reviews: 0,
    products: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const COLORS = ["#5B93FF", "#FFC107", "#48BB78", "#FF5C93", "#7B61FF"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalytics();
        setStats(data);
      } catch (error) {
        console.error("Lỗi khi tải analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [monthlyData, categoryData] = await Promise.all([
          getRevenueByMonth(),
          getRevenueByCategory(),
        ]);
        setRevenueByMonth(monthlyData || []);
        setRevenueByCategory(categoryData || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
      }
    };
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography ml={2}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ borderRadius: 2, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, pl: 1 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            mb={1}
          >
            👋 Chào mừng bạn quay lại!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan hiệu suất kinh doanh
          </Typography>
        </Box>
        {/* Thống kê */}
        <Box sx={{ mb: 4 }}>
          <StatCardsGrid stats={stats} />
        </Box>
        {/* Biểu đồ */}
        <Grid container spacing={4}>
          {/* Biểu đồ đường */}
          <Grid size={6}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.primary"
                  mb={0.5}
                >
                  Biểu đồ doanh thu theo tháng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng quan doanh thu 12 tháng gần nhất
                </Typography>
              </Box>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#5B93FF"
                      strokeWidth={2}
                      name="Doanh thu (VND)"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalTransactions"
                      stroke="#FFC107"
                      strokeWidth={2}
                      name="Số giao dịch"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          {/* Biểu đồ tròn */}
          <Grid size={6} lg={4}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Biểu đồ doanh thu theo danh mục
                </Typography>
              </Box>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 3 }}>
                {revenueByCategory.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: COLORS[index % COLORS.length],
                          mr: 1.5,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.category}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color="text.primary"
                    >
                      {item.totalRevenue.toLocaleString("vi-VN")}₫
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;
