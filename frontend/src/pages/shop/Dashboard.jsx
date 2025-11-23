import React, { useEffect, useState } from "react";
import { analyticsService } from "../../services/analyticsService";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [ov, setOv] = useState();
  const [series, setSeries] = useState([]);
  const [status, setStatus] = useState([]);
  const [topP, setTopP] = useState([]);
  const [topC, setTopC] = useState([]);
  const [fc, setFc] = useState();

  useEffect(() => {
    (async () => {
      const [o, s, r, tp, tc, f] = await Promise.all([
        analyticsService.overview(),
        analyticsService.statusSummary(),
        analyticsService.revenueSeries("day", 30),
        analyticsService.topProducts(10),
        analyticsService.topCustomers(10),
        analyticsService.forecast("day", 90, 14),
      ]);
      setOv(o); setStatus(s); setSeries(r); setTopP(tp); setTopC(tc); setFc(f);
    })();
  }, []);

  const lineData = {
    labels: series.map(r => r.x),
    datasets: [{ label: "Doanh thu (ngày)", data: series.map(r=>r.revenue) }]
  };

  const doughnutData = {
    labels: status.map(s=>s.status),
    datasets: [{ data: status.map(s=>s.count) }]
  };

  const topBar = {
    labels: topP.map(p => p.product?.name || p._id),
    datasets: [{ label: "SL bán", data: topP.map(p=>p.qty) }]
  };

  const downloadExcel = async () => {
    const res = await analyticsService.exportExcel();
    saveAs(new Blob([res.data]), "dfs_analytics.xlsx");
  };
  const downloadPdf = async () => {
    const res = await analyticsService.exportPdf();
    saveAs(new Blob([res.data], { type: "application/pdf" }), "dfs_analytics.pdf");
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {/* KPIs */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12}}>
        <KpiCard title="Doanh thu hôm nay" value={formatVND(ov?.today_revenue)} />
        <KpiCard title="Đơn đang xử lý" value={ov?.processing_orders} />
        <KpiCard title="Tổng đơn hàng" value={ov?.total_orders} />
        <KpiCard title="Tổng khách hàng" value={ov?.total_customers} />
      </div>

      {/* Charts */}
      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginTop:12}}>
        <div className="card"><Line data={lineData}/></div>
        <div className="card"><Doughnut data={doughnutData}/></div>
      </div>

      <div style={{marginTop:12}} className="card">
        <h3>Top sản phẩm</h3>
        <Bar data={topBar}/>
      </div>

      {/* Forecast preview */}
      <div style={{marginTop:12}} className="card">
        <h3>Dự báo (preview)</h3>
        <Line data={{
          labels: [
            ...fc?.history?.map(x=>x.x) || [],
            ...(fc?.forecast?.map((_,i)=>`F+${i+1}`) || [])
          ],
          datasets: [
            { label:"Lịch sử", data: fc?.history?.map(x=>x.revenue) || [] },
            { label:"Dự báo", data: fc?.forecast?.map(x=>x.revenue) || [] }
          ]
        }}/>
        <small>* Sơ bộ bằng hồi quy tuyến tính. Có thể thay bằng Prophet (Python) sau.</small>
      </div>

      {/* Exports */}
      <div style={{marginTop:12, display:"flex", gap:10}}>
        <button onClick={downloadExcel}>Xuất Excel</button>
        <button onClick={downloadPdf}>Xuất PDF</button>
      </div>

      {/* Gợi ý thêm:
          - Bộ lọc ngày/tháng/quý
          - Bản đồ địa lý đơn hàng (nếu có address)
          - Tỷ lệ chuyển đổi kênh
          - Real-time order feed (SSE/Socket) */}
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="card" style={{padding:12}}>
      <div style={{fontSize:13, color:"#666"}}>{title}</div>
      <div style={{fontSize:22, fontWeight:700}}>{value ?? "-"}</div>
    </div>
  );
}
function formatVND(n){ n=Number(n||0); return n.toLocaleString("vi-VN") + " ₫"; }
