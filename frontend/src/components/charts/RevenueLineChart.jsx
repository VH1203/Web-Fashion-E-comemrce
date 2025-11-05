import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function RevenueLineChart({ rows = [], forecast = [] }) {
  // Dữ liệu gốc
  const labelsActual = rows.map((r) => String(r.date || ""));
  const valuesActual = rows.map((r) => Number(r.revenue || 0));

  // Nhãn tương lai lấy ds (YYYY-MM-DD)
  const labelsFc = forecast.map((f) => String((f.ds || "").slice(0, 10)));
  const valuesFc = forecast.map((f) => Number(f.yhat || 0));

  // Hợp nhất trục X: nhãn thực tế + nhãn dự báo
  const labels = labelsActual.concat(labelsFc);

  // Mảng null để căn thẳng dự báo
  const padActualTail = labelsFc.length > 0 ? Array(labelsFc.length).fill(null) : [];
  const padForecastHead =
    labelsActual.length > 0 ? Array(labelsActual.length - 1).fill(null) : [];

  const datasetActual = valuesActual.concat(padActualTail);
  const datasetForecast = padForecastHead.concat(valuesFc);

  return (
    <Line
      data={{
        labels,
        datasets: [
          { label: "Revenue", data: datasetActual, borderWidth: 2 },
          { label: "Forecast", data: datasetForecast, borderDash: [6, 6], borderWidth: 2 },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed.y ?? 0);
                return `${ctx.dataset.label}: ${v.toLocaleString("vi-VN")} ₫`;
              },
            },
          },
          legend: { display: true },
        },
        scales: {
          y: {
            ticks: { callback: (v) => Number(v).toLocaleString("vi-VN") },
          },
        },
      }}
    />
  );
}
