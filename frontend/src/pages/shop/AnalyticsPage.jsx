import React from "react";
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
import { TrendingUp, Users, ShoppingCart, AlertCircle,Star, CreditCard } from "lucide-react";
import StatCardsGrid from "../../components/common/StarCard";
import { getAnalytics } from "../../services/shopService";
import { useEffect, useState } from "react";
import { getRevenueByMonth, getRevenueByCategory } from "../../services/shopService";


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

 useEffect (() => {
    const fetchChartData = async () => {
      try {
        const [monthlyData, categoryData] = await Promise.all([
          getRevenueByMonth(),
          getRevenueByCategory(),
        ]);

        setRevenueByMonth(monthlyData || []);
        setRevenueByCategory(categoryData || []);
      } catch (error) {
        console.error("Lỗi khi tải analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
 }, []);

  if (loading) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-2">Hi, Welcome back 👋</h1>
      </div>

       
      <StatCardsGrid stats={stats} />


      {/* Charts */}  
      <div className="row g-4">
        {/* Line Chart */}
        <div className="col-12 col-lg-8">¬
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="mb-4">
                <h2 className="h5 fw-bold text-dark mb-1">Doanh thu theo tháng</h2>
                <p className="text-muted small">Tổng quan doanh thu 12 tháng gần nhất</p>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
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
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
      <div className="col-12 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="mb-4">
                <h2 className="h5 fw-bold text-dark">Doanh thu theo danh mục</h2>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3">
                {revenueByCategory.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center small mb-2"
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-2"
                        style={{
                          width: "10px",
                          height: "10px",
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-muted">{item.name}</span>
                    </div>
                    <span className="fw-semibold text-dark">
                      {item.value.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
