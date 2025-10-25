import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ title, products = [], badge }) {
  if (!products.length) return null;
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} badge={badge} />
        ))}
      </div>
      <style jsx>{`
        .section {
          margin-top: 28px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
      `}</style>
    </section>
  );
}
