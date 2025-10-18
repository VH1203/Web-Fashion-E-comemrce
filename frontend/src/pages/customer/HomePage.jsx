import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import { productApi } from "../../services/productService";
import { categoryApi } from "../../services/categoryService";
import { bannerApi } from "../../services/bannerService";
import { brandApi } from "../../services/brandService";
import "../../assets/styles/Homepage.css";

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);

  // ===== Fetch Data =====

  useEffect(() => {
    Promise.all([
      bannerApi.getAll(),
      categoryApi.getAll(),
      brandApi.getAll(),
      productApi.getByTag("flash-sale"),
      productApi.getNew(),
      productApi.getByCategory("men"),
      productApi.getByCategory("women"),
    ])
      .then(
        ([
          bannersRes,
          categoriesRes,
          brandsRes,
          flashSaleRes,
          newRes,
          menRes,
          womenRes,
        ]) => {
          setBanners(bannersRes);
          setCategories(categoriesRes);
          setBrands(brandsRes);
          setFlashSale(flashSaleRes);
          setNewProducts(newRes);
          setMenProducts(menRes);
          setWomenProducts(womenRes);
        }
      )
      .catch(console.error);
  }, []);

  return (
    <Container fluid className="homepage-container">
      {/* ==== Banner ==== */}
      <Carousel fade interval={4000} className="mb-5 rounded shadow-lg">
        {banners.length > 0
          ? banners.map((b) => (
              <Carousel.Item key={b._id}>
                <a href={b.link || "#"}>
                  <img
                    className="d-block w-100 rounded"
                    src={b.image_url || "https://placehold.co/1200x400?text=FLASH+SALE"}
                    alt={b.title}
                  />
                </a>
              </Carousel.Item>
            ))
          : [...Array(3)].map((_, i) => (
              <Carousel.Item key={i}>
                <img
                  className="d-block w-100 rounded"
                  src={`https://placehold.co/1200x400?text=Banner+${i + 1}`}
                  alt={`Banner ${i + 1}`}
                />
              </Carousel.Item>
            ))}
      </Carousel>

      {/* ==== Categories ==== */}
      <Section title="Danh mục nổi bật">
        <ScrollableRow items={categories} type="category" />
      </Section>

      {/* ==== Brands ==== */}
      <Section title="Thương hiệu nổi bật">
        <ScrollableRow items={brands} type="brand" />
      </Section>

      {/* ==== Product Sections ==== */}
      <ProductSection title="FLASH SALE 🔥" products={flashSale} highlight />
      <ProductSection
        title="Sản phẩm mới"
        products={newProducts}
        viewAllLink="/products/new"
      />
      <ProductSection
        title="Thời trang Nam"
        products={menProducts}
        viewAllLink="/products/men"
      />
      <ProductSection
        title="Thời trang Nữ"
        products={womenProducts}
        viewAllLink="/products/women"
      />
    </Container>
  );
}

// ==== Reusable Section Wrapper ====
const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="fw-bold text-primary mb-3">{title}</h3>
    {children}
  </div>
);

// ==== Horizontal Scroll List (for categories & brands) ====
const ScrollableRow = ({ items, type }) => {
  const scroll = (offset) => {
    const el = document.getElementById(`scroll-${type}`);
    if (el) el.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="scroll-wrapper position-relative">
      <Button
        variant="light"
        className="scroll-btn left shadow-sm"
        onClick={() => scroll(-300)}
      >
        ‹
      </Button>
      <div
        id={`scroll-${type}`}
        className="d-flex overflow-auto gap-3 pb-2 scroll-container"
      >
        {items.map((item) => (
          <Card
            key={item._id}
            className="border-0 text-center"
            style={{ width: "120px", minWidth: "120px" }}
          >
            <Card.Img
              variant="top"
              src={
                item.image_url ||
                item.logo_url ||
                `https://placehold.co/100x100?text=${item.name}`
              }
              alt={item.name}
              className="rounded-circle border border-primary p-1"
            />
            <Card.Body className="p-2">
              <Card.Text className="fw-semibold text-primary small">
                {item.name}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
      <Button
        variant="light"
        className="scroll-btn right shadow-sm"
        onClick={() => scroll(300)}
      >
        ›
      </Button>
    </div>
  );
};

// ==== Product Section (Reusable) ====
function ProductSection({ title, products, highlight, viewAllLink }) {
  const scroll = (offset) => {
    const container = document.getElementById(`scroll-${title}`);
    if (container) container.scrollBy({ left: offset, behavior: "smooth" });
  };

  const getSalePrice = (p) =>
    p.tags?.includes("sale") ? Math.round(p.base_price * 0.8) : p.base_price;

  return (
    <div
      className={`product-section p-4 rounded ${
        highlight ? "bg-primary text-white shadow-lg" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{title}</h4>
        {highlight ? (
          <div className="bg-white text-primary px-3 py-1 rounded fw-semibold small">
            ⏰ Kết thúc sau: 02:15:45
          </div>
        ) : (
          viewAllLink && (
            <a href={viewAllLink} className="text-decoration-none fw-semibold">
              Xem tất cả →
            </a>
          )
        )}
      </div>

      <div className="scroll-wrapper position-relative">
        <Button
          variant={highlight ? "light" : "outline-primary"}
          className="scroll-btn left"
          onClick={() => scroll(-500)}
        >
          ‹
        </Button>

        <div
          id={`scroll-${title}`}
          className="d-flex overflow-auto gap-4 pb-2 product-scroll"
        >
          {products.slice(0, 10).map((p) => {
            const salePrice = getSalePrice(p);
            const isSale = salePrice < p.base_price;
            const image =
              p.images?.[0] || `https://placehold.co/300x400?text=${p.name}`;
            return (
              <Card
                key={p._id}
                className="product-card border-0 shadow-sm"
                style={{ minWidth: "220px", maxWidth: "220px" }}
              >
                <Card.Img
                  variant="top"
                  src={image}
                  alt={p.name}
                  className="rounded"
                />
                <Card.Body className="text-center p-2">
                  <Card.Title className="h6 fw-semibold text-primary text-truncate">
                    {p.name}
                  </Card.Title>
                  {isSale ? (
                    <div className="d-flex justify-content-center gap-2 align-items-center">
                      <span className="text-danger fw-bold">
                        {salePrice.toLocaleString()} đ
                      </span>
                      <span className="text-muted text-decoration-line-through small">
                        {p.base_price.toLocaleString()} đ
                      </span>
                    </div>
                  ) : (
                    <span className="text-primary fw-bold">
                      {p.base_price.toLocaleString()} đ
                    </span>
                  )}
                  <p className="text-muted small mb-0">
                    Đã bán: {p.sold_count || 0}
                  </p>
                </Card.Body>
              </Card>
            );
          })}
        </div>

        <Button
          variant={highlight ? "light" : "outline-primary"}
          className="scroll-btn right"
          onClick={() => scroll(300)}
        >
          ›
        </Button>
      </div>
    </div>
  );
}
