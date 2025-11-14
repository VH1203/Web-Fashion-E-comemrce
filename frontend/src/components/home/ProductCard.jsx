// components/home/ProductCard.jsx
import React from "react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ item, type }) {
  const p = item?.product || item || {};
  const id = p?._id || p?.id || "";
  const slug = p?.slug;
  const href = slug ? `/product/${slug}` : `/product/${id}`;

  const name = p?.name || "Sản phẩm";
  const img = p?.images?.[0] || p?.image || p?.thumbnail;

  const basePrice = Number(p?.base_price ?? p?.price ?? 0) || 0;
  const price = type === "flash" ? Number(item?.flash_price ?? basePrice) || 0 : basePrice;

  const percent =
    type === "flash" && basePrice > 0
      ? Math.max(0, Math.round((1 - price / basePrice) * 100))
      : 0;

  const rating = Number(
    p?.rating_avg ?? p?.ratingAvg ?? p?.rating?.avg ?? 0
  ) || 0;

  const sold = Number(
    p?.sold_count ?? p?.soldCount ?? p?.sold ?? 0
  ) || 0;

  const formatSold = (n) => {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `${n}`;
  };

  const renderStars = (val) => {
    const v = Math.max(0, Math.min(5, Math.round((val || 0) * 2) / 2));
    const full = Math.floor(v);
    const half = v - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <span className="stars" aria-label={`Đánh giá ${v}/5`}>
        {"★".repeat(full)}
        {half ? "☆" : ""}
        {"☆".repeat(empty)}
      </span>
    );
  };

  return (
    <a className="card product-card" href={href}>
      <div className="thumb">
        {img ? (
          <img src={img} alt={name} loading="lazy" />
        ) : (
          <div className="noimg">No Image</div>
        )}
        {type === "flash" && percent > 0 && (
          <span className="badge">-{percent}%</span>
        )}
      </div>

      <div className="p-info">
        <div className="p-name" title={name}>
          {name}
        </div>

        <div className="p-meta">
          <span className="p-rating">
            {renderStars(rating)} <b>{rating.toFixed(1)}</b>
          </span>
          <span className="dot">•</span>
          <span className="p-sold">Đã bán {formatSold(sold)}</span>
        </div>

        <div className="p-price">
          <span className="cur">{formatCurrency(price)}</span>
          {type === "flash" && basePrice > 0 && (
            <span className="base">{formatCurrency(basePrice)}</span>
          )}
        </div>
      </div>
    </a>
  );
}
