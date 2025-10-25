import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { formatCurrency } from "@/utils/formatCurrency";

function useCountdown(start, end) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const startTs = start ? new Date(start).getTime() : null;
  const endTs = end ? new Date(end).getTime() : null;
  const remaining = endTs ? Math.max(0, endTs - now) : 0;
  const upcomingIn = startTs && startTs > now ? startTs - now : 0;
  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(sec).padStart(2, "0")}`;
  };
  return {
    remaining,
    upcomingIn,
    label:
      endTs && now < endTs
        ? fmt(remaining)
        : upcomingIn
        ? `Bắt đầu sau ${fmt(upcomingIn)}`
        : "Kết thúc",
  };
}

export default function FlashSaleSection({ flashSale }) {
  const has =
    !!flashSale &&
    Array.isArray(flashSale.products) &&
    flashSale.products.length > 0;
  const { label } = useCountdown(flashSale?.start_time, flashSale?.end_time);
  const title = useMemo(() => flashSale?.title || "Flash Sale", [flashSale]);

  if (!has) return null;

  return (
    <section className="section flash">
      <div className="head">
        <h2 className="section-title">{title}</h2>
        <div className="timer">{label}</div>
      </div>
      <div className="grid">
        {flashSale.products.map((p) => (
          <div key={`${p.product_id}`} className="fs-card">
            <ProductCard
              product={{
                ...p,
                _id: p.product_id,
                price: p.flash_price,
                image: p.image,
              }}
              badge="-FLASH-"
            />
            <div className="price-row">
              <span className="flash">{formatCurrency(p.flash_price)}</span>
              <span className="orig">{formatCurrency(p.original_price)}</span>
            </div>
            <div className="progress">
              <div className="bar" style={{ width: `${p.progress || 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .flash .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .timer {
          font-weight: 700;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .fs-card {
          position: relative;
        }
        .price-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin: 8px 2px;
        }
        .flash {
          font-weight: 800;
        }
        .orig {
          text-decoration: line-through;
          opacity: 0.7;
        }
        .progress {
          background: rgba(255, 255, 255, 0.12);
          height: 8px;
          border-radius: 6px;
          overflow: hidden;
        }
        .bar {
          height: 100%;
          background: #ff6b6b;
        }
      `}</style>
    </section>
  );
}
