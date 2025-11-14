import React, { useEffect, useRef, useState } from "react";
import { homeService } from "../../services/homeService";
import ProductCard from "../../components/home/ProductCard.jsx";
import "../../assets/styles/Homepage.css";

/* ===================== PAGE ===================== */

export default function HomePage() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const payload = await homeService.fetchHomepage(); // FE service trả res.data.data
        setData(normalizeHomepage(payload));
      } catch (e) {
        setError(e?.message || "Load homepage failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="hp-container">Đang tải trang chủ…</div>;
  if (error) return <div className="hp-container error">{error}</div>;
  if (!data)   return <div className="hp-container error">Không có dữ liệu.</div>;

  const { banners, brands, categories, men, women, flashSale } = data;

  return (
    <div className="hp-container">

      {/* ===== Banners (carousel rộng) ===== */}
      {!!banners.__count && (
        <BannerCarousel banners={banners} />
      )}

      {/* ===== Category (carousel) ===== */}
      {!!categories.length && (
        <SectionCarousel
          title="Danh mục"
          viewAllHref="/categories"
          items={categories}
          renderItem={(cat) => (
            <a className="card category-card" href={`/category/${cat.slug}`}>
              <div className="ic">
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} loading="lazy" />
                  : <div className="ic-noimg">{cat.name?.[0] || "?"}</div>}
              </div>
              <div className="txt-16w">{cat.name}</div>
            </a>
          )}
          itemWidth={220}
          gap={16}
        />
      )}

      {/* ===== Brands (carousel) ===== */}
      <SectionCarousel
        title="Thương hiệu nổi bật"
        viewAllHref="/brands"
        items={brands}
        emptyText="Đang cập nhật thương hiệu…"
        renderItem={(br) => (
          <a className="card brand-card" href={`/brand/${br.slug || br._id || ""}`}>
            <div className="brand-thumb">
              {br.logo_url || br.image_url
                ? <img src={br.logo_url || br.image_url} alt={br.name} loading="lazy" />
                : <div className="brand-noimg">{br.name?.[0] || "?"}</div>}
            </div>
            <div className="txt-14w">{br.name}</div>
          </a>
        )}
        itemWidth={160}
        gap={12}
      />

      {/* ===== Flash Sale (carousel) ===== */}
      {flashSale?.items?.length ? (
        <SectionCarousel
          title={flashSale._upcoming ? "Flash Sale sắp diễn ra" : "Flash Sale"}
          rightNode={
            <Countdown
              label={flashSale._upcoming ? "Bắt đầu sau" : "Kết thúc sau"}
              endTime={flashSale._upcoming ? flashSale.start_time : flashSale.end_time}
            />
          }
          viewAllHref="/flash-sale"
          items={flashSale.items}
          renderItem={(it) => <ProductCard item={normalizeFlashItem(it)} type="flash" />}
          itemWidth={220}
          gap={12}
        />
      ) : null}

      {/* ===== Men (carousel) ===== */}
      {!!men.length && (
        <SectionCarousel
          title="Thời trang Nam"
          viewAllHref="/category/men"
          items={men}
          renderItem={(p) => <ProductCard item={{ product: p }} />}
          itemWidth={220}
          gap={12}
        />
      )}

      {/* ===== Women (carousel) ===== */}
      {!!women.length && (
        <SectionCarousel
          title="Thời trang Nữ"
          viewAllHref="/category/women"
          items={women}
          renderItem={(p) => <ProductCard item={{ product: p }} />}
          itemWidth={220}
          gap={12}
        />
      )}
    </div>
  );
}

/* ===================== NORMALIZE ===================== */

function normalizeHomepage(raw) {
  const banners = {
    homepage_top: raw?.banners?.homepage_top || [],
    homepage_mid: raw?.banners?.homepage_mid || [],
    homepage_bottom: raw?.banners?.homepage_bottom || [],
    __count:
      (raw?.banners?.homepage_top?.length || 0) +
      (raw?.banners?.homepage_mid?.length || 0) +
      (raw?.banners?.homepage_bottom?.length || 0),
  };
  return {
    banners,
    brands: raw?.brands || raw?.brand_list || [],
    categories: raw?.categories || [],
    men: raw?.men || [],
    women: raw?.women || [],
    flashSale: raw?.flashSale || raw?.flash_sale || null,
  };
}

function normalizeFlashItem(it) {
  if (it.product) return it;
  return {
    ...it,
    product: {
      _id: it.product_id || it._id,
      name: it.name || it.title || "Sản phẩm",
      images: it.images || (it.image ? [it.image] : []),
      base_price: it.original_price || it.base_price || it.price || 0,
    },
    flash_price: it.flash_price || it.sale_price || it.price || 0,
  };
}

/* ===================== GENERIC CAROUSEL ===================== */

function useCarousel({ itemWidth, gap, perClick = 2 }) {
  const viewportRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < max);
  };

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => update();
    const ro = new ResizeObserver(update);
    el.addEventListener("scroll", onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByStep = (dir = 2) => {
    const el = viewportRef.current;
    if (!el) return;
    const step = perClick * itemWidth + gap * perClick; 
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return {
    viewportRef,
    canPrev,
    canNext,
    scrollPrev: () => scrollByStep(-1),
    scrollNext: () => scrollByStep(1),
  };
}


function SectionCarousel({ title, rightNode, viewAllHref, items = [], renderItem, itemWidth = 220, gap = 12, emptyText }) {
  const { viewportRef, canPrev, canNext, scrollPrev, scrollNext } = useCarousel({ itemWidth, gap });

  return (
    <section className="hp-section">
      <div className="hp-section-header">
        <h2 className="ttl">{title}</h2>

        <div className="hdr-right">
          {rightNode}
          {viewAllHref && (
            <a className="view-all" href={viewAllHref}>
              Xem tất cả <span className="arr">→</span>
            </a>
          )}
          <div className="nav-btns">
            <button className="nav-btn" disabled={!canPrev} onClick={scrollPrev} aria-label="prev">‹</button>
            <button className="nav-btn" disabled={!canNext} onClick={scrollNext} aria-label="next">›</button>
          </div>
        </div>
      </div>

      {!items.length ? (
        emptyText ? <div className="brand-empty">{emptyText}</div> : null
      ) : (
        <div className="carousel">
          <div className="carousel-viewport" ref={viewportRef}>
            <div className="carousel-track" style={{ gap }}>
              {items.map((it, i) => (
                <div
                  className="carousel-item"
                  key={it._id || it.id || it.slug || i}
                  style={{ width: itemWidth, minWidth: itemWidth }}
                >
                  {renderItem(it)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ===================== BANNER CAROUSEL ===================== */

function BannerCarousel({ banners }) {
  const rows = [banners.homepage_top, banners.homepage_mid, banners.homepage_bottom].filter(r => r?.length);
  if (!rows.length) return null;

  // gộp thành 1 list để carousel theo chiều ngang
  const list = rows.flat();
  const itemWidth = 920; // rộng hero ~ desktop (sẽ co trên mobile)
  const gap = 12;
  const { viewportRef, canPrev, canNext, scrollPrev, scrollNext } = useCarousel({ itemWidth, gap });

  return (
    <section className="hp-section">
      <div className="hp-section-header">
        <h2 className="ttl">Khuyến mãi nổi bật</h2>
        <div className="hdr-right">
          <div className="nav-btns">
            <button className="nav-btn" disabled={!canPrev} onClick={scrollPrev} aria-label="prev">‹</button>
            <button className="nav-btn" disabled={!canNext} onClick={scrollNext} aria-label="next">›</button>
          </div>
        </div>
      </div>

      <div className="carousel">
        <div className="carousel-viewport" ref={viewportRef}>
          <div className="carousel-track" style={{ gap }}>
            {list.map((b, i) => {
              const src = b.image_url || b.image || b.url;
              if (!src) return null;
              const href = b.link || b.href || "#";
              return (
                <a
                  key={b._id || b.id || `${src}-${i}`}
                  className="banner-hero"
                  href={href}
                  style={{ width: itemWidth, minWidth: itemWidth }}
                >
                  <img src={src} alt={b.title || "Banner"} loading="lazy" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== WIDGETS ===================== */

function Countdown({ endTime, label = "Kết thúc sau" }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(endTime).getTime();
  const left = Math.max(0, end - now);
  const hh = String(Math.floor(left / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return <div className="countdown">{label} {hh}:{mm}:{ss}</div>;
}


