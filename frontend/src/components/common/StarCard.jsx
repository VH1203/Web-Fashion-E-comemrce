import React from "react";

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <div
      className="card border-0 shadow-sm p-4 mb-3"
      style={{ borderRadius: "1rem" }}
    >
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div
            className={`d-flex align-items-center justify-content-center mb-3 rounded`}
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: bgColor || "#f0f0f0",
            }}
          >
            <Icon className={iconColor || "text-primary"} size={28} />
          </div>
          <h3 className="fw-bold text-dark mb-1" style={{ fontSize: "1.5rem" }}>
            {value}
          </h3>
          <p className="text-muted small mb-0">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
