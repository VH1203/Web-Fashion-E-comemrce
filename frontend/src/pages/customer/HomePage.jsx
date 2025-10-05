import React, { useEffect, useState } from "react";
import { productApi } from "../../services/productService";
import { categoryApi } from "../../services/categoryService";
import { bannerApi } from "../../services/bannerService";
import "../../assets/styles/Homepage.css";

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);

  // Auto slide banner
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    bannerApi.getAll().then(setBanners).catch(console.error);
    categoryApi.getAll().then(setCategories).catch(console.error);
    productApi.getByTag("flash-sale").then(setFlashSale).catch(console.error);
    productApi.getNew().then(setNewProducts).catch(console.error);
    productApi.getByCategory("men").then(setMenProducts).catch(console.error);
    productApi
      .getByCategory("women")
      .then(setWomenProducts)
      .catch(console.error);
  }, []);

  return (
    <div className="homepage-container">
      {/* ==== Banner ==== */}
      {banners.length > 0 && (
        <div className="banner-slider">
          <div
            className="banner-track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {banners.map((b, i) => (
              <div key={b._id} className="banner-slide">
                <a href={b.link_url || "#"}>
                  <img src={b.image_url} alt={b.title} />
                </a>
              </div>
            ))}
          </div>

          <button
            className="banner-nav left"
            onClick={() =>
              setCurrentSlide(
                currentSlide === 0 ? banners.length - 1 : currentSlide - 1
              )
            }
          >
            ‹
          </button>
          <button
            className="banner-nav right"
            onClick={() => setCurrentSlide((currentSlide + 1) % banners.length)}
          >
            ›
          </button>

          <div className="banner-dots">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ==== Danh mục ==== */}
      <section className="category-section">
        <h2>Danh mục</h2>

        <div className="category-wrapper">
          <button
            className="scroll-btn left"
            onClick={() => {
              const scroll = document.getElementById("category-scroll");
              scroll.scrollBy({ left: -300, behavior: "smooth" });
            }}
          >
            ‹
          </button>

          <div id="category-scroll" className="category-scroll">
            {categories.map((c) => (
              <div key={c._id} className="category-card">
                <img
                  src={
                    c.image_url ||
                    `https://picsum.photos/100/100?random=${c._id}`
                  }
                  alt={c.name}
                />
                <p>{c.name}</p>
              </div>
            ))}
          </div>

          <button
            className="scroll-btn right"
            onClick={() => {
              const scroll = document.getElementById("category-scroll");
              scroll.scrollBy({ left: 300, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      </section>

      {/* ==== Flash Sale ==== */}
      <Section title="FLASH SALE 🔥" products={flashSale} highlight />

      {/* ==== Sản phẩm mới ==== */}
      <Section
        title="Sản phẩm mới"
        products={newProducts}
        viewAllLink="/products/new"
      />

      {/* ==== Thời trang Nam ==== */}
      <Section
        title="Thời trang Nam"
        products={menProducts}
        viewAllLink="/products/men"
      />

      {/* ==== Thời trang Nữ ==== */}
      <Section
        title="Thời trang Nữ"
        products={womenProducts}
        viewAllLink="/products/women"
      />
    </div>
  );
}

function Section({ title, products, highlight, viewAllLink }) {
  const [scrollX, setScrollX] = useState(0);

  const scroll = (offset) => {
    const container = document.getElementById(`scroll-${title}`);
    if (container) container.scrollBy({ left: offset, behavior: "smooth" });
  };

  const getSalePrice = (p) => {
    if (p.tags?.includes("sale")) {
      return Math.round(p.base_price * 0.8);
    }
    return p.base_price;
  };

  const displayedProducts = products.slice(0, 5);

  return (
    <section className={`product-section ${highlight ? "highlight" : ""}`}>
      <div className="section-header">
        <h2>{title}</h2>
        {highlight ? (
          <div className="countdown">
            <span>⏰ Kết thúc sau: 02:15:45</span>
          </div>
        ) : (
          viewAllLink && (
            <a href={viewAllLink} className="view-all">
              Xem tất cả →
            </a>
          )
        )}
      </div>

      <div className="scroll-wrapper">
        <button className="scroll-btn left" onClick={() => scroll(-500)}>
          ‹
        </button>

        <div id={`scroll-${title}`} className="product-scroll">
          {displayedProducts.map((p) => {
            const salePrice = getSalePrice(p);
            const isSale = salePrice < p.base_price;
            const image =
              p.images?.[0] || `https://picsum.photos/300/400?random=${p._id}`;

            return (
              <div key={p._id} className="product-card">
                <img src={image} alt={p.name} />
                <h3>{p.name}</h3>
                {isSale ? (
                  <div className="price-group">
                    <span className="sale-price">
                      {salePrice.toLocaleString()} đ
                    </span>
                    <span className="old-price">
                      {p.base_price.toLocaleString()} đ
                    </span>
                  </div>
                ) : (
                  <span className="sale-price">
                    {p.base_price.toLocaleString()} đ
                  </span>
                )}
                <p className="sold-count">Đã bán: {p.sold_count}</p>
              </div>
            );
          })}
        </div>

        <button className="scroll-btn right" onClick={() => scroll(300)}>
          ›
        </button>
      </div>
    </section>
  );
}
