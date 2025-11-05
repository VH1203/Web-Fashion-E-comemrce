import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderStatusPie({ rows = [] }) {
  const labels = rows.map(r => r.status);
  const values = rows.map(r => r.count);
  return <Pie data={{ labels, datasets: [{ data: values }] }} options={{ maintainAspectRatio: false }} />;
}
