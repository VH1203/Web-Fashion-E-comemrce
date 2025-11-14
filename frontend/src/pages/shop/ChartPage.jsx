import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartPage = () => {
  const barData = [
    { name: "Jan", sales: 4000, revenue: 2400, profit: 2400 },
    { name: "Feb", sales: 3000, revenue: 1398, profit: 2210 },
    { name: "Mar", sales: 2000, revenue: 9800, profit: 2290 },
    { name: "Apr", sales: 2780, revenue: 3908, profit: 2000 },
    { name: "May", sales: 1890, revenue: 4800, profit: 2181 },
    { name: "Jun", sales: 2390, revenue: 3800, profit: 2500 },
  ];

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold text-dark mb-1" style={{ fontSize: "2rem" }}>
          Charts Overview
        </h1>
        <p className="text-muted">
          Visualize your data with interactive charts
        </p>
      </div>

      {/* Chart Grid */}
      <div className="row g-4">
        {/* Bar Chart */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 shadow-sm p-4 h-100"
            style={{ borderRadius: "1rem" }}
          >
            <h2
              className="fw-bold text-dark mb-4"
              style={{ fontSize: "1.25rem" }}
            >
              Bar Chart - Sales Analysis
            </h2>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#5B93FF" />
                  <Bar dataKey="revenue" fill="#48BB78" />
                  <Bar dataKey="profit" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-12 col-lg-6">
          <div
            className="card border-0 shadow-sm p-4 h-100"
            style={{ borderRadius: "1rem" }}
          >
            <h2
              className="fw-bold text-dark mb-4"
              style={{ fontSize: "1.25rem" }}
            >
              Line Chart - Growth Trend
            </h2>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#5B93FF"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#48BB78"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
