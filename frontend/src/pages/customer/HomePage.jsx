import React, { useEffect, useState } from "react";
import { productApi } from "../../services/productService";
import { categoryApi } from "../../services/categoryService";

export default function HomePage() {
  const [banner] = useState([
    "/assets/images/banner1.jpg",
    "/assets/images/banner2.jpg",
  ]);
  const [categories, setCategories] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Load categories
    categoryApi.getAll().then(setCategories).catch(console.error);

    // Load product sections
    productApi.getByTag("flash-sale").then(setFlashSale).catch(console.error);
    productApi.getNew().then(setNewProducts).catch(console.error);
    productApi.getByCategory("men").then(setMenProducts).catch(console.error);
    productApi.getByCategory("women").then(setWomenProducts).catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      {/* Banner */}
      <div style={{ display: "flex", overflow: "auto", gap: 10, marginBottom: 20 }}>
        {banner.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="banner"
            style={{ width: "100%", borderRadius: 12 }}
          />
        ))}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sections */}
      <Section title="🔥 Flash Sale" products={flashSale} />
      <Section title="✨ Sản phẩm mới" products={newProducts} />
      <Section title="👔 Thời trang Nam" products={menProducts} />
      <Section title="👗 Thời trang Nữ" products={womenProducts} />
    </div>
  );
}

function Section({ title, products }) {
  // Hàm tính giá sale
  const getSalePrice = (p) => {
    if (p.tags?.includes("sale")) {
      return Math.round(p.base_price * 0.8); // giảm 20%
    }
    return p.base_price;
  };

  // Fallback ảnh ngẫu nhiên nếu lỗi
  const getImage = (p) => {
    const id = Math.floor(Math.random() * 1000);
    return (
      p.images?.[0] ||
      `https://picsum.photos/300/400?random=${id}`
    );
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <h2 style={{ marginBottom: 15 }}>{title}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20,
        }}
      >
        {products.map((p) => {
          const salePrice = getSalePrice(p);
          const isSale = salePrice < p.base_price;

          return (
            <div
              key={p._id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 10,
                textAlign: "center",
              }}
            >
              <img
                src={getImage(p)}
                alt={p.name}
                onError={(e) =>
                  (e.currentTarget.src = `https://picsum.photos/300/400?random=${Math.floor(
                    Math.random() * 1000
                  )}`)
                }
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <h3 style={{ fontSize: 16, margin: "10px 0" }}>{p.name}</h3>

              {/* Giá */}
              {isSale ? (
                <div>
                  <p style={{ color: "red", fontWeight: "bold", margin: 0 }}>
                    {salePrice.toLocaleString()} đ
                  </p>
                  <p
                    style={{
                      textDecoration: "line-through",
                      color: "#888",
                      margin: 0,
                      fontSize: 14,
                    }}
                  >
                    {p.base_price.toLocaleString()} đ
                  </p>
                </div>
              ) : (
                <p style={{ color: "red", fontWeight: "bold", margin: 0 }}>
                  {p.base_price.toLocaleString()} đ
                </p>
              )}

              {/* Lượt bán */}
              <p style={{ fontSize: 13, color: "#555", marginTop: 5 }}>
                Đã bán: {p.sold_count}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

