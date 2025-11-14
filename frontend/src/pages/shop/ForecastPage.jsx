import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import StatCard from "../../components/common/StarCard";

const ForecastPage = () => {
  const forecastData = [
    { month: "Jul", actual: 4500, predicted: 4200 },
    { month: "Aug", actual: 5200, predicted: 5000 },
    { month: "Sep", actual: 4800, predicted: 5200 },
    { month: "Oct", actual: null, predicted: 5500 },
    { month: "Nov", actual: null, predicted: 6000 },
    { month: "Dec", actual: null, predicted: 6500 },
  ];

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-bold text-dark mb-1" style={{ fontSize: "2rem" }}>
          Sales Forecast
        </h1>
        <p className="text-muted">
          Predict future trends based on historical data
        </p>
      </div>

      {/* Stat cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <StatCard
            title="Predicted Growth"
            value="+24%"
            icon={TrendingUp}
            bgColor="bg-light"
            iconColor="text-success"
          />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard
            title="Next Month Est."
            value="$55k"
            icon={DollarSign}
            bgColor="bg-light"
            iconColor="text-primary"
          />
        </div>
        <div className="col-12 col-lg-4">
          <StatCard
            title="Confidence Level"
            value="87%"
            icon={Activity}
            bgColor="bg-light"
            iconColor="text-purple"
          />
        </div>
      </div>

      {/* Chart */}
      <div
        className="card border-0 shadow-sm p-4"
        style={{ borderRadius: "1rem" }}
      >
        <h2 className="fw-bold text-dark mb-4" style={{ fontSize: "1.25rem" }}>
          6-Month Forecast
        </h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#5B93FF"
                strokeWidth={3}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#FFC107"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
