import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Users } from "lucide-react";
import StatCard from "../../components/common/StarCard";

const RevenuePage = () => {
  const revenueData = [
    { category: "Products", q1: 12000, q2: 15000, q3: 18000, q4: 21000 },
    { category: "Services", q1: 8000, q2: 9500, q3: 11000, q4: 13000 },
    { category: "Subscriptions", q1: 5000, q2: 6500, q3: 8000, q4: 9500 },
  ];

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-2">Revenue Analysis</h1>
        <p className="text-muted">Track revenue streams and performance</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-3">
          <StatCard
            title="Total Revenue"
            value="$125k"
            icon={DollarSign}
            bgColor="bg-primary-subtle"
            iconColor="text-primary"
          />
        </div>
        <div className="col-12 col-lg-3">
          <StatCard
            title="Growth Rate"
            value="+32%"
            icon={TrendingUp}
            bgColor="bg-success-subtle"
            iconColor="text-success"
          />
        </div>
        <div className="col-12 col-lg-3">
          <StatCard
            title="Avg Order Value"
            value="$1,245"
            icon={ShoppingCart}
            bgColor="bg-info-subtle"
            iconColor="text-info"
          />
        </div>
        <div className="col-12 col-lg-3">
          <StatCard
            title="Active Customers"
            value="2,543"
            icon={Users}
            bgColor="bg-warning-subtle"
            iconColor="text-warning"
          />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="h5 fw-bold text-dark mb-4">
            Quarterly Revenue by Category
          </h2>
          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="q1" fill="#5B93FF" name="Q1" />
                <Bar dataKey="q2" fill="#48BB78" name="Q2" />
                <Bar dataKey="q3" fill="#FFC107" name="Q3" />
                <Bar dataKey="q4" fill="#F56565" name="Q4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
