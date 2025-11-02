import React from "react";
import { Users, ShoppingCart, Star, CreditCard } from "lucide-react";

const SingleCard = ({ title, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <div
      className="card shadow-sm border-0 p-4 transition-all hover:shadow-lg"
      style={{
        borderRadius: "1rem",
        transition: "transform 0.2s ease",
      }}
    >
      <div className="d-flex align-items-center justify-content-between">
        {/* Icon */}
        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: bgColor || "#f5f6fa",
          }}
        >
          <Icon className={iconColor || "text-primary"} size={28} />
        </div>

        {/* Value + Title */}
        <div className="text-end">
          <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.5rem" }}>
            {value ?? "—"}
          </h3>
          <p className="text-muted small mb-0">{title}</p>
        </div>
      </div>
    </div>
  );
};

//  Component hiển thị toàn bộ grid Stat Cards
const StatCardsGrid = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: "Người dùng",
      value: stats.users?.toLocaleString(),
      icon: Users,
      bgColor: "#E8F4FF",
      iconColor: "text-info",
    },
    {
      title: "Sản phẩm",
      value: stats.products?.toLocaleString(),
      icon: ShoppingCart,
      bgColor: "#EAF1FF",
      iconColor: "text-primary",
    },
    {
      title: "Đánh giá",
      value: stats.reviews?.toLocaleString(),
      icon: Star,
      bgColor: "#FFF8E1",
      iconColor: "text-warning",
    },
    {
      title: "Giao dịch",
      value: stats.transactions?.toLocaleString(),
      icon: CreditCard,
      bgColor: "#E9FBE9",
      iconColor: "text-success",
    },
  ];

  return (
    <div
      className="mb-4"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
      }}
    >
      {cards.map((card, i) => (
        <SingleCard key={i} {...card} />
      ))}
    </div>
  );
};

export default StatCardsGrid;
