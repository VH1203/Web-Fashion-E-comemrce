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


const AnalyticsPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    reviews: 0,
    products: 0,
    transactions: 0,
  });
  const [loading, setLoading] = useState(true);

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

  const websiteVisitsData = [
    { name: "Jan", teamA: 40, teamB: 24, teamC: 35 },
    { name: "Feb", teamA: 30, teamB: 35, teamC: 28 },
    { name: "Mar", teamA: 45, teamB: 28, teamC: 40 },
    { name: "Apr", teamA: 60, teamB: 42, teamC: 35 },
    { name: "May", teamA: 35, teamB: 38, teamC: 45 },
    { name: "Jun", teamA: 50, teamB: 45, teamC: 38 },
    { name: "Jul", teamA: 45, teamB: 35, teamC: 48 },
    { name: "Aug", teamA: 55, teamB: 48, teamC: 42 },
  ];

  const currentVisitsData = [
    { name: "America", value: 3547, color: "#5B93FF" },
    { name: "Asia", value: 2534, color: "#FFC107" },
    { name: "Europe", value: 1234, color: "#48BB78" },
    { name: "Africa", value: 987, color: "#F56565" },
  ];

  if (loading) return <p className="text-center mt-5">Đang tải dữ liệu...</p>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-2">Hi, Welcome back 👋</h1>
      </div>

       {/* ✅ Stat Cards */}
      <StatCardsGrid stats={stats} />


      {/* Charts */}  
      <div className="row g-4">
        {/* Line Chart */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="mb-4">
                <h2 className="h5 fw-bold text-dark mb-1">Website Visits</h2>
                <p className="text-muted small">(+43%) than last year</p>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={websiteVisitsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="teamA"
                      stroke="#5B93FF"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="teamB"
                      stroke="#FFC107"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="teamC"
                      stroke="#48BB78"
                      strokeWidth={2}
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
                <h2 className="h5 fw-bold text-dark">Current Visits</h2>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentVisitsData}
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
                      {currentVisitsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3">
                {currentVisitsData.map((item, index) => (
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
                          backgroundColor: item.color,
                        }}
                      ></div>
                      <span className="text-muted">{item.name}</span>
                    </div>
                    <span className="fw-semibold text-dark">{item.value}</span>
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
