import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function ProductCard({ product, badge, flashPrice }) {
  const cover =
    product.image || (Array.isArray(product.images) ? product.images[0] : null);
  const price = flashPrice ?? product.price ?? product.base_price;
  return (
    <a className="p-card" href={`/product/${product._id}`}>
      {badge && <span className="badge">{badge}</span>}
      {cover && <img src={cover} alt={product.name} />}
      <div className="info">
        <h4 title={product.name}>{product.name}</h4>
        <div className="meta">
          <span className="price">{formatCurrency(price)}</span>
          {product.sold_count > 0 && (
            <span className="sold">Đã bán {product.sold_count}</span>
          )}
        </div>
      </div>
      <style jsx>{`
        .p-card {
          display: block;
          background: var(--card-bg, #111);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: relative;
        }
        img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        .info {
          padding: 10px 12px;
        }
        h4 {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.3;
          height: 36px;
          overflow: hidden;
        }
        .meta {
          margin-top: 6px;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .price {
          font-weight: 700;
        }
        .sold {
          opacity: 0.7;
          font-size: 12px;
        }
        .badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff4757;
          color: #fff;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
      `}</style>
    </a>
  );
}
